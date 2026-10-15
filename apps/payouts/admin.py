from django.contrib import admin
from .models import HostPayout


@admin.register(HostPayout)
class HostPayoutAdmin(admin.ModelAdmin):
    list_display = (
        'rental',
        'host',
        'gross_rental_usdc',
        'platform_fee_usdc',
        'net_payout_usdc',
        'status',
        'tx_hash',
        'settled_at',
        'created_at',
    )
    list_filter = ('status', 'created_at', 'settled_at')
    search_fields = (
        'rental__rental_code',
        'host__email',
        'host__username',
        'tx_hash',
    )
    readonly_fields = ('created_at', 'updated_at')
