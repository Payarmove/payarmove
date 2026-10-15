from rest_framework import serializers
from decimal import Decimal
from .models import SmartContractEscrow, ContractEventLog

class ContractEventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractEventLog
        fields = ['id', 'event_topic', 'tx_hash', 'ledger_sequence', 'raw_data', 'created_at']


class EscrowStatusSerializer(serializers.ModelSerializer):
    rental_code = serializers.CharField(source='rental.rental_code', read_only=True)
    event_logs = ContractEventLogSerializer(many=True, read_only=True)

    class Meta:
        model = SmartContractEscrow
        fields = [
            'id', 'rental_code', 'contract_id', 'agreement_symbol',
            'token_address', 'total_locked_usdc', 'rental_fee_usdc',
            'deposit_fee_usdc', 'platform_fee_bps', 'status',
            'deposit_tx_hash', 'settlement_tx_hash', 'funded_at',
            'settled_at', 'event_logs', 'created_at'
        ]


class EscrowDepositSubmitSerializer(serializers.Serializer):
    transaction_hash = serializers.CharField(max_length=64, min_length=64, help_text="Stellar / Soroban transaction hash")


class EscrowSettleSerializer(serializers.Serializer):
    pass # Host or Admin completes vehicle return inspection with no damage


class EscrowDisputeSerializer(serializers.Serializer):
    host_damage_award_usdc = serializers.DecimalField(
        max_digits=18, decimal_places=7, min_value=Decimal('0'),
        help_text="Amount of security deposit awarded to host for vehicle damages"
    )
    renter_deposit_refund_usdc = serializers.DecimalField(
        max_digits=18, decimal_places=7, min_value=Decimal('0'),
        help_text="Amount of remaining security deposit refunded back to renter"
    )
    dispute_reason = serializers.CharField(max_length=500)
