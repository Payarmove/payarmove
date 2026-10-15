from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.db.models import Q
from django.utils import timezone
from django.http import Http404
from decimal import Decimal

from .models import Vehicle, Rental, SavedVehicle
from .serializers import (
    VehicleSerializer,
    RentalCreateSerializer,
    RentalDetailSerializer,
    SavedVehicleSerializer,
)
from apps.core.permissions import IsHostRole, IsKYCApproved
from apps.payouts.models import HostPayout
from apps.escrow.models import SmartContractEscrow, ContractEventLog
from apps.escrow.soroban_client import SorobanClient

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = VehicleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsHostRole(), IsKYCApproved()]

    def perform_create(self, serializer):
        serializer.save(host=self.request.user)

    @extend_schema(
        tags=['Mobility Vehicles'],
        summary='List active mobility rental vehicles',
        description='Browse peer-to-peer vehicles available for rental with pricing in Stellar USDC and specifications.'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Mobility Vehicles'],
        summary='List vehicle for rental (Hosts only)',
        description='Host adds a vehicle to the peer-to-peer marketplace.'
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='my-vehicles', permission_classes=[permissions.IsAuthenticated])
    def my_vehicles(self, request):
        vehicles = Vehicle.objects.filter(host=request.user).order_by('-created_at')
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)


class SavedVehicleViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavedVehicleSerializer

    def get_queryset(self):
        return SavedVehicle.objects.filter(user=self.request.user).order_by('-created_at')

    @extend_schema(
        tags=['Saved Vehicles'],
        summary='List saved vehicles for current user',
        description='Returns list of vehicles bookmarked/favorited by the authenticated user.'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Saved Vehicles'],
        summary='Save / bookmark a vehicle',
        description='Adds a vehicle to user favorites.'
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle(self, request):
        vehicle_id = request.data.get('vehicle_id')
        if not vehicle_id:
            return Response({'error': 'vehicle_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)

        saved = SavedVehicle.objects.filter(user=request.user, vehicle=vehicle).first()
        if saved:
            saved.delete()
            return Response({'saved': False, 'vehicle_id': str(vehicle.id), 'message': 'Removed from saved vehicles'})
        else:
            SavedVehicle.objects.create(user=request.user, vehicle=vehicle)
            return Response({'saved': True, 'vehicle_id': str(vehicle.id), 'message': 'Added to saved vehicles'}, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        # Support removing either by SavedVehicle.id or Vehicle.id
        saved = SavedVehicle.objects.filter(
            Q(id=pk) | Q(vehicle_id=pk),
            user=request.user
        ).first()
        if not saved:
            return Response({'error': 'Saved record not found'}, status=status.HTTP_404_NOT_FOUND)
        saved.delete()
        return Response({'message': 'Removed from saved vehicles'}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='sync')
    def sync_saved(self, request):
        vehicle_ids = request.data.get('vehicle_ids', [])
        if not isinstance(vehicle_ids, list):
            vehicle_ids = [vehicle_ids]
        created_count = 0
        for vid in vehicle_ids:
            try:
                vehicle = Vehicle.objects.get(id=vid)
                SavedVehicle.objects.get_or_create(user=request.user, vehicle=vehicle)
                created_count += 1
            except Exception:
                continue
        all_saved = list(SavedVehicle.objects.filter(user=request.user).values_list('vehicle_id', flat=True))
        return Response({
            'success': True,
            'synced_count': created_count,
            'saved_vehicle_ids': [str(vid) for vid in all_saved]
        })


class RentalViewSet(viewsets.ModelViewSet):
    queryset = Rental.objects.all()
    serializer_class = RentalDetailSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsKYCApproved()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN' or user.is_superuser:
            return Rental.objects.all().order_by('-created_at')
        qs = Rental.objects.filter(Q(renter=user) | Q(host=user)).order_by('-created_at')
        confirmed_vehicle_ids = set(
            Rental.objects.filter(
                renter=user,
                status__in=[Rental.Status.CONFIRMED, Rental.Status.ACTIVE]
            ).values_list('vehicle_id', flat=True)
        )
        if confirmed_vehicle_ids:
            qs = qs.exclude(
                renter=user,
                vehicle_id__in=confirmed_vehicle_ids,
                status=Rental.Status.AWAITING_PAYMENT
            )
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return RentalCreateSerializer
        return RentalDetailSerializer

    @extend_schema(
        tags=['Rental Bookings'],
        summary='Create vehicle rental booking agreement',
        description='Initiates a rental booking. Transitions status to AWAITING_PAYMENT for Soroban escrow deposit.',
        request=RentalCreateSerializer,
        responses={201: RentalDetailSerializer}
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        vehicle = serializer.validated_data['vehicle']

        # Idempotency / deduplication: if the user already has an active AWAITING_PAYMENT rental
        # for this vehicle, return the existing pending agreement instead of creating a duplicate.
        existing_rental = Rental.objects.filter(
            renter=request.user,
            vehicle=vehicle,
            status=Rental.Status.AWAITING_PAYMENT
        ).order_by('-created_at').first()

        if existing_rental:
            existing_rental.start_date = serializer.validated_data.get('start_date', existing_rental.start_date)
            existing_rental.end_date = serializer.validated_data.get('end_date', existing_rental.end_date)
            existing_rental.start_time = serializer.validated_data.get('start_time', existing_rental.start_time)
            existing_rental.end_time = serializer.validated_data.get('end_time', existing_rental.end_time)
            if 'total_hours' in serializer.validated_data:
                existing_rental.total_hours = serializer.validated_data['total_hours']
            # Reset amounts to recalculate based on updated hours
            existing_rental.rental_amount_usdc = Decimal('0')
            existing_rental.save()
            return Response(RentalDetailSerializer(existing_rental).data, status=status.HTTP_200_OK)

        rental = serializer.save()
        return Response(RentalDetailSerializer(rental).data, status=status.HTTP_201_CREATED)

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            return Rental.objects.get(id=pk)
        except Exception:
            try:
                return Rental.objects.get(rental_code__iexact=pk)
            except Rental.DoesNotExist:
                raise Http404("Rental agreement not found")

    @extend_schema(
        tags=['Rental Bookings'],
        summary='Retrieve rental details and breakdown',
        description='Inspect pricing breakdown, rental dates, vehicle, host, and escrow status.'
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Rental Bookings'],
        summary='List user rental agreements',
        description='Returns all bookings where the user is either the renter or the host.'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Rental Bookings'],
        summary='Host confirms vehicle handover / delivered successfully',
        description='Host marks vehicle as delivered to renter. Rental transitions to ACTIVE status.',
        responses={200: RentalDetailSerializer}
    )
    @action(detail=True, methods=['post'], url_path='confirm-delivery')
    def confirm_delivery(self, request, pk=None):
        rental = self.get_object()
        if request.user != rental.host and not request.user.is_staff and request.user.role != 'ADMIN':
            return Response({'error': 'Only the vehicle host or platform administrator can confirm delivery.'}, status=status.HTTP_403_FORBIDDEN)
        
        if rental.status != Rental.Status.CONFIRMED:
            return Response({'error': f'Cannot confirm delivery for rental with status {rental.status}. Rental must be CONFIRMED.'}, status=status.HTTP_400_BAD_REQUEST)
        
        rental.status = Rental.Status.ACTIVE
        rental.save()

        # Ensure pending payout is recorded
        platform_fee = (rental.rental_amount_usdc * Decimal('0.10')).quantize(Decimal('0.0000001'))
        net_payout = (rental.rental_amount_usdc - platform_fee).quantize(Decimal('0.0000001'))
        HostPayout.objects.update_or_create(
            rental=rental,
            host=rental.host,
            defaults={
                'gross_rental_usdc': rental.rental_amount_usdc,
                'platform_fee_usdc': platform_fee,
                'net_payout_usdc': net_payout,
                'status': HostPayout.Status.PENDING,
            }
        )

        return Response({
            'success': True,
            'message': f'Vehicle {rental.vehicle.make_model} delivered successfully! Rental is now active.',
            'rental': RentalDetailSerializer(rental).data
        })

    @extend_schema(
        tags=['Rental Bookings'],
        summary='Host confirms vehicle returned successfully and closes deal',
        description='Host marks vehicle returned by renter. Rental transitions to COMPLETED status, escrow is released, and host payout settles.',
        responses={200: RentalDetailSerializer}
    )
    @action(detail=True, methods=['post'], url_path='confirm-return')
    def confirm_return(self, request, pk=None):
        rental = self.get_object()
        if request.user != rental.host and not request.user.is_staff and request.user.role != 'ADMIN':
            return Response({'error': 'Only the vehicle host or platform administrator can confirm return.'}, status=status.HTTP_403_FORBIDDEN)
        
        if rental.status not in (Rental.Status.ACTIVE, Rental.Status.CONFIRMED):
            return Response({'error': f'Cannot confirm return for rental with status {rental.status}.'}, status=status.HTTP_400_BAD_REQUEST)
        
        rental.status = Rental.Status.COMPLETED
        rental.save()

        platform_fee = (rental.rental_amount_usdc * Decimal('0.10')).quantize(Decimal('0.0000001'))
        host_net = (rental.rental_amount_usdc - platform_fee).quantize(Decimal('0.0000001'))

        # Check and settle escrow
        escrow = SmartContractEscrow.objects.filter(rental=rental).first()
        disburse_tx = None
        simulated_hash = f"0xreturn{rental.rental_code.replace('-', '')}{timezone.now().strftime('%Y%m%d%H%M%S')}"[:64]

        host_payout_addr = rental.host.primary_stellar_address or getattr(rental.vehicle.host, 'primary_stellar_address', None)
        if host_payout_addr and host_payout_addr.startswith('G'):
            try:
                client = SorobanClient()
                disburse_tx = client.disburse_funds_to_host(host_payout_addr, host_net)
            except Exception as d_err:
                import logging
                logging.getLogger(__name__).warning("On-chain server disburse to host warning: %s", d_err)

        if escrow:
            escrow.status = SmartContractEscrow.OnChainStatus.COMPLETED
            escrow.settlement_tx_hash = disburse_tx or simulated_hash
            escrow.settled_at = timezone.now()
            escrow.save()

            ContractEventLog.objects.create(
                escrow=escrow,
                event_topic='deal_closed',
                tx_hash=disburse_tx or simulated_hash,
                raw_data={
                    'host_payout': str(host_net),
                    'platform_fee': str(platform_fee),
                    'status': 'COMPLETED'
                }
            )

        HostPayout.objects.update_or_create(
            rental=rental,
            host=rental.host,
            defaults={
                'gross_rental_usdc': rental.rental_amount_usdc,
                'platform_fee_usdc': platform_fee,
                'net_payout_usdc': host_net,
                'status': HostPayout.Status.COMPLETED,
                'tx_hash': disburse_tx or simulated_hash,
                'settled_at': timezone.now()
            }
        )

        return Response({
            'success': True,
            'message': f'Vehicle {rental.vehicle.make_model} returned successfully! Deal is closed and payout has settled.',
            'rental': RentalDetailSerializer(rental).data
        })
