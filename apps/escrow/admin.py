from django.contrib import admin
from .models import SmartContractEscrow


@admin.register(SmartContractEscrow)
class SmartContractEscrowAdmin(admin.ModelAdmin):
    list_display = (
        'rental',
        'contract_id',
        'total_locked_usdc',
        'rental_fee_usdc',
        'deposit_fee_usdc',
        'status',
        'funded_at',
        'settled_at',
        'created_at',
    )
    list_filter = ('status', 'created_at', 'funded_at', 'settled_at')
    search_fields = (
        'rental__rental_code',
        'contract_id',
        'deposit_tx_hash',
        'settlement_tx_hash',
    )
    readonly_fields = ('created_at', 'updated_at')
