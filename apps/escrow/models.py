from django.db import models
from apps.core.models import TimestampedBaseModel
from apps.rentals.models import Rental

class SmartContractEscrow(TimestampedBaseModel):
    class OnChainStatus(models.TextChoices):
        CREATED = 'CREATED', 'Created / Awaiting Deposit'
        FUNDED = 'FUNDED', 'Funded & Active'
        COMPLETED = 'COMPLETED', 'Completed & Disbursed'
        DISPUTED = 'DISPUTED', 'Disputed & Arbitrated'
        CANCELLED = 'CANCELLED', 'Cancelled & Refunded'

    rental = models.OneToOneField(Rental, on_delete=models.CASCADE, related_name='escrow')
    contract_id = models.CharField(max_length=56, help_text="Soroban Contract Address (C...)")
    agreement_symbol = models.CharField(max_length=32, help_text="Short identifier for Soroban contract storage")
    token_address = models.CharField(max_length=56, help_text="USDC SAC Address")

    total_locked_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    rental_fee_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    deposit_fee_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    platform_fee_bps = models.PositiveIntegerField(default=1000) # 10.00%

    status = models.CharField(max_length=20, choices=OnChainStatus.choices, default=OnChainStatus.CREATED, db_index=True)
    deposit_tx_hash = models.CharField(max_length=64, blank=True, null=True, unique=True)
    settlement_tx_hash = models.CharField(max_length=64, blank=True, null=True)

    funded_at = models.DateTimeField(null=True, blank=True)
    settled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Escrow {self.agreement_symbol} for {self.rental.rental_code} [{self.status}]"


class ContractEventLog(TimestampedBaseModel):
    escrow = models.ForeignKey(SmartContractEscrow, on_delete=models.CASCADE, related_name='event_logs')
    event_topic = models.CharField(max_length=100)
    tx_hash = models.CharField(max_length=64, blank=True, null=True)
    ledger_sequence = models.PositiveIntegerField(null=True, blank=True)
    raw_data = models.JSONField(default=dict)

    def __str__(self):
        return f"Event: {self.event_topic} ({self.escrow.agreement_symbol})"
