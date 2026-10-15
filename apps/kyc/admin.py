from django.contrib import admin
from .models import KYCRecord


@admin.register(KYCRecord)
class KYCRecordAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'document_type',
        'document_number',
        'status',
        'reviewed_by',
        'reviewed_at',
        'created_at',
    )
    list_filter = ('status', 'document_type', 'created_at', 'reviewed_at')
    search_fields = ('user__email', 'user__username', 'document_number')
    readonly_fields = ('created_at', 'updated_at')
