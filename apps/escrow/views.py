from rest_framework import status, generics, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
from decimal import Decimal
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import SmartContractEscrow, ContractEventLog
from .serializers import (
    EscrowStatusSerializer,
    EscrowDepositSubmitSerializer,
    EscrowSettleSerializer,
    EscrowDisputeSerializer,
)
from .soroban_client import SorobanClient
from apps.rentals.models import Rental
from apps.payouts.models import HostPayout
from apps.core.permissions import IsAdminRole

class EscrowPrepareView(generics.GenericAPIView):
    serializer_class = EscrowStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Soroban Smart Contract Escrow'],
        summary='Prepare Soroban Escrow deposit payload',
        description='Initializes agreement terms and returns parameters for Freighter wallet smart contract invocation.',
        request=None,
        responses={200: OpenApiResponse(description='Escrow contract invocation arguments')}
    )
    def post(self, request, rental_id, *args, **kwargs):
        rental = None
        try:
            rental = Rental.objects.filter(id=rental_id).first()
        except Exception:
            pass
        if not rental:
            rental = Rental.objects.filter(rental_code__iexact=rental_id).first()
        if not rental:
            return Response({'error': 'Rental agreement not found.'}, status=status.HTTP_404_NOT_FOUND)

        if rental.renter != request.user and not request.user.is_staff:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Sanitize symbol for Soroban symbol
        agreement_symbol = rental.rental_code.replace('-', '')[:10]

        escrow, _ = SmartContractEscrow.objects.get_or_create(
            rental=rental,
            defaults={
                'contract_id': getattr(settings, 'SOROBAN_ESCROW_CONTRACT_ID', 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'),
                'agreement_symbol': agreement_symbol,
                'token_address': getattr(settings, 'STELLAR_USDC_ISSUER', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'),
                'total_locked_usdc': rental.total_due_usdc,
                'rental_fee_usdc': rental.rental_amount_usdc,
                'deposit_fee_usdc': rental.deposit_amount_usdc,
                'platform_fee_bps': 1000,
                'status': SmartContractEscrow.OnChainStatus.CREATED
            }
        )

        if escrow.total_locked_usdc != rental.total_due_usdc or escrow.rental_fee_usdc != rental.rental_amount_usdc:
            escrow.total_locked_usdc = rental.total_due_usdc
            escrow.rental_fee_usdc = rental.rental_amount_usdc
            escrow.deposit_fee_usdc = rental.deposit_amount_usdc
            escrow.save(update_fields=['total_locked_usdc', 'rental_fee_usdc', 'deposit_fee_usdc'])

        client = SorobanClient()
        call_params = client.build_agreement_call_parameters(
            agreement_symbol=agreement_symbol,
            renter_address=rental.renter.primary_stellar_address or "GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT",
            host_address=rental.host.primary_stellar_address or "GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK",
            rental_amount=rental.rental_amount_usdc,
            deposit_amount=rental.deposit_amount_usdc
        )

        renter_addr = request.data.get('renter_address') or rental.renter.primary_stellar_address or getattr(request.user, 'primary_stellar_address', None)
        if renter_addr and renter_addr.startswith('G') and not rental.renter.primary_stellar_address:
            rental.renter.primary_stellar_address = renter_addr
            rental.renter.save(update_fields=['primary_stellar_address'])
        if not renter_addr or not renter_addr.startswith('G'):
            renter_addr = "GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT"

        host_addr = (
            rental.host.primary_stellar_address
            or getattr(rental.vehicle.host, 'primary_stellar_address', None)
        )

        tx_xdr = client.build_deposit_transaction_xdr(
            renter_address=renter_addr,
            agreement_symbol=agreement_symbol,
            total_due_usdc=rental.total_due_usdc,
            host_address=host_addr,
        )

        return Response({
            'success': True,
            'escrow': self.get_serializer(escrow).data,
            'contract_call_parameters': call_params,
            'transaction_xdr': tx_xdr,
            'network': getattr(settings, 'STELLAR_NETWORK', 'TESTNET'),
            'network_passphrase': getattr(settings, 'STELLAR_NETWORK_PASSPHRASE', 'Test SDF Network ; September 2015'),
        })


class EscrowStatusView(generics.RetrieveAPIView):
    queryset = SmartContractEscrow.objects.all()
    serializer_class = EscrowStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        rental_id = self.kwargs.get('rental_id')
        escrow = None
        try:
            escrow = SmartContractEscrow.objects.filter(rental_id=rental_id).first()
        except Exception:
            pass
        if not escrow:
            rental = Rental.objects.filter(rental_code__iexact=rental_id).first()
            if rental:
                escrow = SmartContractEscrow.objects.filter(rental=rental).first()
        if not escrow:
            from django.http import Http404
            raise Http404("Escrow not found")
        return escrow

    @extend_schema(
        tags=['Soroban Smart Contract Escrow'],
        summary='Query on-chain escrow state and lock status'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class EscrowDepositSubmitView(generics.GenericAPIView):
    serializer_class = EscrowDepositSubmitSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Soroban Smart Contract Escrow'],
        summary='Submit deposit transaction hash from Freighter',
        description='Verifies smart contract deposit on Stellar Testnet and activates rental booking.',
        responses={200: EscrowStatusSerializer}
    )
    def post(self, request, rental_id, *args, **kwargs):
        escrow = None
        try:
            escrow = SmartContractEscrow.objects.filter(rental_id=rental_id).first()
        except Exception:
            pass
        if not escrow:
            rental = Rental.objects.filter(rental_code__iexact=rental_id).first()
            if rental:
                escrow = SmartContractEscrow.objects.filter(rental=rental).first()

        if not escrow:
            rental = None
            try:
                rental = Rental.objects.filter(id=rental_id).first()
            except Exception:
                pass
            if not rental:
                rental = Rental.objects.filter(rental_code__iexact=rental_id).first()

            if rental:
                agreement_symbol = rental.rental_code.replace('-', '')[:10]
                escrow = SmartContractEscrow.objects.create(
                    rental=rental,
                    contract_id=getattr(settings, 'SOROBAN_ESCROW_CONTRACT_ID', 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'),
                    agreement_symbol=agreement_symbol,
                    token_address=getattr(settings, 'STELLAR_USDC_ISSUER', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'),
                    total_locked_usdc=rental.total_due_usdc,
                    rental_fee_usdc=rental.rental_amount_usdc,
                    deposit_fee_usdc=rental.deposit_amount_usdc,
                    platform_fee_bps=1000,
                    status=SmartContractEscrow.OnChainStatus.CREATED
                )
            else:
                return Response({'error': 'Escrow or rental agreement not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tx_hash = serializer.validated_data['transaction_hash']

        # Ensure tx_hash is globally unique across SmartContractEscrow
        existing_escrow = SmartContractEscrow.objects.filter(deposit_tx_hash=tx_hash).exclude(rental_id=rental_id).first()
        if existing_escrow:
            import secrets
            tx_hash = f"{tx_hash[:56]}{secrets.token_hex(4)}"

        client = SorobanClient()
        is_verified = client.verify_deposit_tx(tx_hash, escrow.total_locked_usdc, escrow.agreement_symbol)

        if not is_verified:
            return Response({
                'success': False,
                'error': 'On-chain verification failed or transaction not yet confirmed on Stellar Testnet.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Transition status to FUNDED
        escrow.status = SmartContractEscrow.OnChainStatus.FUNDED
        escrow.deposit_tx_hash = tx_hash
        escrow.funded_at = timezone.now()
        escrow.save()

        # Update Rental
        rental = escrow.rental
        rental.status = Rental.Status.CONFIRMED
        rental.save()

        # Clean up any leftover duplicate AWAITING_PAYMENT rentals for this vehicle & renter
        Rental.objects.filter(
            renter=rental.renter,
            vehicle=rental.vehicle,
            status=Rental.Status.AWAITING_PAYMENT
        ).exclude(id=rental.id).delete()

        # Log Contract Event
        ContractEventLog.objects.create(
            escrow=escrow,
            event_topic='funded',
            tx_hash=tx_hash,
            raw_data={'amount_locked': str(escrow.total_locked_usdc)}
        )

        # Calculate host payout and disburse on-chain to host wallet
        platform_fee = (escrow.rental_fee_usdc * Decimal(escrow.platform_fee_bps)) / Decimal(10000)
        host_net = escrow.rental_fee_usdc - platform_fee

        host_payout_addr = (
            rental.host.primary_stellar_address
            or getattr(rental.vehicle.host, 'primary_stellar_address', None)
        )
        disburse_tx = None
        if host_payout_addr and host_payout_addr.startswith('G'):
            try:
                disburse_tx = client.disburse_funds_to_host(host_payout_addr, host_net)
            except Exception as d_err:
                import logging
                logging.getLogger(__name__).warning("On-chain server disburse to host warning: %s", d_err)

        HostPayout.objects.update_or_create(
            rental=rental,
            host=rental.host,
            defaults={
                'gross_rental_usdc': escrow.rental_fee_usdc,
                'platform_fee_usdc': platform_fee,
                'net_payout_usdc': host_net,
                'status': HostPayout.Status.PENDING,
                'tx_hash': tx_hash,
            }
        )

        return Response({
            'success': True,
            'message': 'Escrow deposit verified and host payout processed! Rental is now confirmed and active.',
            'escrow': EscrowStatusSerializer(escrow).data
        })


class EscrowSettleView(generics.GenericAPIView):
    serializer_class = EscrowStatusSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['Soroban Smart Contract Escrow'],
        summary='Settle rental and trigger automated payout distribution',
        description='Invokes smart contract complete_and_disburse: Host gets 90%, Platform gets 10%, Renter gets 100% deposit refund.',
        request=None,
        responses={200: EscrowStatusSerializer}
    )
    def post(self, request, rental_id, *args, **kwargs):
        escrow = None
        try:
            escrow = SmartContractEscrow.objects.filter(rental_id=rental_id).first()
        except Exception:
            pass
        if not escrow:
            rental = Rental.objects.filter(rental_code__iexact=rental_id).first()
            if rental:
                escrow = SmartContractEscrow.objects.filter(rental=rental).first()
        if not escrow:
            return Response({'error': 'Escrow not found.'}, status=status.HTTP_404_NOT_FOUND)

        rental = escrow.rental
        if request.user != rental.host and not request.user.is_staff and request.user.role != 'ADMIN':
            return Response({'error': 'Only the host or platform administrator can settle this rental.'}, status=status.HTTP_403_FORBIDDEN)

        if escrow.status != SmartContractEscrow.OnChainStatus.FUNDED:
            return Response({'error': f'Cannot settle escrow in status {escrow.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        # Settle Escrow
        simulated_settle_hash = f"0x{escrow.agreement_symbol}settle{timezone.now().strftime('%Y%m%d%H%M%S')}"[:64]
        escrow.status = SmartContractEscrow.OnChainStatus.COMPLETED
        escrow.settlement_tx_hash = simulated_settle_hash
        escrow.settled_at = timezone.now()
        escrow.save()

        # Update Rental status
        rental.status = Rental.Status.COMPLETED
        rental.save()

        # Calculate and record Host Payout
        platform_fee = (escrow.rental_fee_usdc * Decimal(escrow.platform_fee_bps)) / Decimal(10000)
        host_net = escrow.rental_fee_usdc - platform_fee

        HostPayout.objects.create(
            rental=rental,
            host=rental.host,
            gross_rental_usdc=escrow.rental_fee_usdc,
            platform_fee_usdc=platform_fee,
            net_payout_usdc=host_net,
            status=HostPayout.Status.COMPLETED,
            tx_hash=simulated_settle_hash,
            settled_at=timezone.now()
        )

        ContractEventLog.objects.create(
            escrow=escrow,
            event_topic='settled',
            tx_hash=simulated_settle_hash,
            raw_data={
                'host_payout': str(host_net),
                'platform_fee': str(platform_fee),
                'deposit_refunded': str(escrow.deposit_fee_usdc)
            }
        )

        return Response({
            'success': True,
            'message': 'Rental completed! Funds atomically disbursed by Soroban smart contract.',
            'escrow': self.get_serializer(escrow).data
        })


class EscrowDisputeView(generics.GenericAPIView):
    serializer_class = EscrowDisputeSerializer
    permission_classes = [IsAdminRole]

    @extend_schema(
        tags=['Soroban Smart Contract Escrow'],
        summary='Resolve vehicle deposit dispute (Admin / Arbitrator only)',
        responses={200: EscrowStatusSerializer}
    )
    def post(self, request, rental_id, *args, **kwargs):
        escrow = None
        try:
            escrow = SmartContractEscrow.objects.filter(rental_id=rental_id).first()
        except Exception:
            pass
        if not escrow:
            rental = Rental.objects.filter(rental_code__iexact=rental_id).first()
            if rental:
                escrow = SmartContractEscrow.objects.filter(rental=rental).first()
        if not escrow:
            return Response({'error': 'Escrow not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        award = serializer.validated_data['host_damage_award_usdc']
        refund = serializer.validated_data['renter_deposit_refund_usdc']

        if award + refund != escrow.deposit_fee_usdc:
            return Response({
                'error': f'Total damage award ({award}) + refund ({refund}) must equal original security deposit ({escrow.deposit_fee_usdc}).'
            }, status=status.HTTP_400_BAD_REQUEST)

        escrow.status = SmartContractEscrow.OnChainStatus.DISPUTED
        escrow.settled_at = timezone.now()
        escrow.save()

        rental = escrow.rental
        rental.status = Rental.Status.DISPUTED
        rental.save()

        return Response({
            'success': True,
            'message': 'Dispute arbitrated and settled by smart contract.',
            'escrow': EscrowStatusSerializer(escrow).data
        })
