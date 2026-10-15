from django.db import models
from django.conf import settings
from apps.core.models import TimestampedBaseModel

class KYCRecord(TimestampedBaseModel):
    class DocumentType(models.TextChoices):
        NATIONAL_ID = 'NATIONAL_ID', 'National ID Card'
        PASSPORT = 'PASSPORT', 'International Passport'
        DRIVERS_LICENSE = 'DRIVERS_LICENSE', 'Driver License'
        VEHICLE_LOGBOOK = 'VEHICLE_LOGBOOK', 'Vehicle Ownership Logbook (Host)'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Verification'
        APPROVED = 'APPROVED', 'Approved / Verified'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='kyc_records')
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    document_number = models.CharField(max_length=50)
    
    # Document attachments
    document_front = models.FileField(upload_to='kyc_documents/%Y/%m/%d/')
    document_back = models.FileField(upload_to='kyc_documents/%Y/%m/%d/', blank=True, null=True)
    selfie_image = models.FileField(upload_to='kyc_selfies/%Y/%m/%d/', blank=True, null=True)

    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING, db_index=True)
    rejection_reason = models.TextField(blank=True, null=True)

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_kycs'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"KYC: {self.user.email} - {self.document_type} ({self.status})"
