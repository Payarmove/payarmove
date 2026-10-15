import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.core.models import TimestampedBaseModel

class User(AbstractUser):
    class Role(models.TextChoices):
        RENTER = 'RENTER', 'Renter'
        HOST = 'HOST', 'Vehicle Host'
        ADMIN = 'ADMIN', 'Platform Administrator'

    class KYCTier(models.TextChoices):
        TIER0 = 'TIER0', 'Unverified'
        TIER1 = 'TIER1', 'Tier 1 - Basic Info'
        TIER2 = 'TIER2', 'Tier 2 - Verified Identity & License'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.RENTER)
    kyc_tier = models.CharField(max_length=10, choices=KYCTier.choices, default=KYCTier.TIER0)
    phone_number = models.CharField(max_length=25, blank=True, null=True)
    primary_stellar_address = models.CharField(max_length=56, blank=True, null=True, db_index=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    avatar_url = models.TextField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"


class WalletAccount(TimestampedBaseModel):
    class WalletType(models.TextChoices):
        FREIGHTER = 'FREIGHTER', 'Freighter Wallet'
        LOBSTR = 'LOBSTR', 'Lobstr'
        XBULL = 'XBULL', 'xBull'
        OTHER = 'OTHER', 'Other Stellar Wallet'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    public_key = models.CharField(max_length=56, unique=True, db_index=True)
    wallet_type = models.CharField(max_length=20, choices=WalletType.choices, default=WalletType.FREIGHTER)
    is_primary = models.BooleanField(default=True)
    last_connected_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.public_key[:6]}...{self.public_key[-4:]}"


class HostApplication(TimestampedBaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        APPROVED = 'APPROVED', 'Approved Host'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='host_applications')
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone_number = models.CharField(max_length=30)
    payout_stellar_address = models.CharField(max_length=56, db_index=True)
    agreed_terms = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPROVED)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - Host ({self.status}) - {self.payout_stellar_address[:6]}..."
