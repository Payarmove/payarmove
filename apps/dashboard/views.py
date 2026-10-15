from rest_framework import generics, permissions
from rest_framework.response import Response
from django.db.models import Sum
from decimal import Decimal
from drf_spectacular.utils import extend_schema

from .serializers import AdminDashboardSerializer, HostDashboardSerializer
from apps.rentals.models import Rental, Vehicle
from apps.payouts.models import HostPayout
from apps.kyc.models import KYCRecord
from apps.authentication.models import User
from apps.core.permissions import IsAdminRole, IsHostRole

class AdminDashboardView(generics.GenericAPIView):
    serializer_class = AdminDashboardSerializer
    permission_classes = [IsAdminRole]

    @extend_schema(
        tags=['Analytics & Dashboards'],
        summary='Platform administrative overview metrics',
        description='Returns system-wide payment volume, confirmations, host disbursements, and KYC queue counts.',
        responses={200: AdminDashboardSerializer}
    )
    def get(self, request, *args, **kwargs):
        # Ensure HostPayout records exist for all confirmed / active / completed rentals
        unrecorded = Rental.objects.filter(
            status__in=[Rental.Status.CONFIRMED, Rental.Status.ACTIVE, Rental.Status.COMPLETED]
        ).exclude(payouts__isnull=False)
        for r in unrecorded:
            p_fee = (r.rental_amount_usdc * Decimal('0.10')).quantize(Decimal('0.0000001'))
            net = (r.rental_amount_usdc - p_fee).quantize(Decimal('0.0000001'))
            HostPayout.objects.get_or_create(
                rental=r,
                defaults={
                    'host': r.host,
                    'gross_rental_usdc': r.rental_amount_usdc,
                    'platform_fee_usdc': p_fee,
                    'net_payout_usdc': net,
                    'status': HostPayout.Status.PENDING
                }
            )

        total_volume = Rental.objects.aggregate(total=Sum('total_due_usdc'))['total'] or Decimal('0.0000000')
        confirmed_vol = Rental.objects.filter(status__in=[Rental.Status.CONFIRMED, Rental.Status.ACTIVE, Rental.Status.COMPLETED]).aggregate(total=Sum('total_due_usdc'))['total'] or Decimal('0.0000000')
        pending_vol = Rental.objects.filter(status=Rental.Status.AWAITING_PAYMENT).aggregate(total=Sum('total_due_usdc'))['total'] or Decimal('0.0000000')

        total_host_payouts = HostPayout.objects.filter(status=HostPayout.Status.COMPLETED).aggregate(total=Sum('net_payout_usdc'))['total'] or Decimal('0.0000000')
        owed_to_hosts = HostPayout.objects.filter(status=HostPayout.Status.PENDING).aggregate(total=Sum('net_payout_usdc'))['total'] or Decimal('0.0000000')
        platform_fees = HostPayout.objects.filter(status=HostPayout.Status.COMPLETED).aggregate(total=Sum('platform_fee_usdc'))['total'] or Decimal('0.0000000')

        data = {
            'total_volume_usdc': total_volume,
            'confirmed_usdc': confirmed_vol,
            'pending_usdc': pending_vol,
            'total_host_payouts_usdc': total_host_payouts,
            'owed_to_hosts_usdc': owed_to_hosts,
            'platform_fees_collected_usdc': platform_fees,
            'total_users_count': User.objects.count(),
            'verified_hosts_count': User.objects.filter(role=User.Role.HOST).count(),
            'active_rentals_count': Rental.objects.filter(status__in=[Rental.Status.CONFIRMED, Rental.Status.ACTIVE]).count(),
            'fleet_vehicles_count': Vehicle.objects.count(),
            'pending_kyc_count': KYCRecord.objects.filter(status=KYCRecord.Status.PENDING).count(),
            'awaiting_payment_count': Rental.objects.filter(status=Rental.Status.AWAITING_PAYMENT).count(),
            'completed_rentals_count': Rental.objects.filter(status=Rental.Status.COMPLETED).count(),
        }
        return Response(data)


class HostDashboardView(generics.GenericAPIView):
    serializer_class = HostDashboardSerializer
    permission_classes = [IsHostRole]

    @extend_schema(
        tags=['Analytics & Dashboards'],
        summary='Host earnings and bookings summary',
        description='Returns metrics specific to the authenticated vehicle host.',
        responses={200: HostDashboardSerializer}
    )
    def get(self, request, *args, **kwargs):
        host = request.user

        # Reconcile any active rentals for host that don't have a payout record yet
        unrecorded = Rental.objects.filter(
            host=host,
            status__in=[Rental.Status.CONFIRMED, Rental.Status.ACTIVE]
        ).exclude(payouts__isnull=False)
        for r in unrecorded:
            p_fee = (r.rental_amount_usdc * Decimal('0.10')).quantize(Decimal('0.0000001'))
            net = (r.rental_amount_usdc - p_fee).quantize(Decimal('0.0000001'))
            HostPayout.objects.get_or_create(
                rental=r,
                host=host,
                defaults={
                    'gross_rental_usdc': r.rental_amount_usdc,
                    'platform_fee_usdc': p_fee,
                    'net_payout_usdc': net,
                    'status': HostPayout.Status.PENDING
                }
            )

        total_earned = HostPayout.objects.filter(host=host, status=HostPayout.Status.COMPLETED).aggregate(total=Sum('net_payout_usdc'))['total'] or Decimal('0.0000000')
        pending_payout = HostPayout.objects.filter(host=host, status=HostPayout.Status.PENDING).aggregate(total=Sum('net_payout_usdc'))['total'] or Decimal('0.0000000')

        data = {
            'total_earned_usdc': total_earned,
            'pending_payout_usdc': pending_payout,
            'vehicles_listed_count': Vehicle.objects.filter(host=host).count(),
            'active_bookings_count': Rental.objects.filter(host=host, status__in=[Rental.Status.CONFIRMED, Rental.Status.ACTIVE]).count(),
            'completed_bookings_count': Rental.objects.filter(host=host, status=Rental.Status.COMPLETED).count(),
        }
        return Response(data)
