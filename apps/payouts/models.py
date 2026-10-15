from django.db import models
from django.conf import settings
from apps.core.models import TimestampedBaseModel
from apps.rentals.models import Rental

class HostPayout(TimestampedBaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Settlement'
        PROCESSING = 'PROCESSING', 'Processing on Stellar'
        COMPLETED = 'COMPLETED', 'Completed & Paid'
        FAILED = 'FAILED', 'Settlement Failed'

    rental = models.ForeignKey(Rental, on_delete=models.CASCADE, related_name='payouts')
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payout_records')
    gross_rental_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    platform_fee_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    net_payout_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING, db_index=True)
    tx_hash = models.CharField(max_length=64, blank=True, null=True)
    settled_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payout: {self.net_payout_usdc} USDC to {self.host.email} [{self.status}]"
