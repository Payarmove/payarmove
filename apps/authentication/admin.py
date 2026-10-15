from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, WalletAccount


class WalletAccountInline(admin.TabularInline):
    model = WalletAccount
    extra = 0
    readonly_fields = ('created_at', 'updated_at', 'last_connected_at')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email',
        'username',
        'role',
        'kyc_tier',
        'primary_stellar_address',
        'is_staff',
        'is_active',
        'date_joined',
    )
    list_filter = ('role', 'kyc_tier', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'username', 'primary_stellar_address', 'phone_number')
    ordering = ('-date_joined',)
    inlines = [WalletAccountInline]

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'first_name', 'last_name', 'phone_number')}),
        ('Platform Details', {'fields': ('role', 'kyc_tier', 'primary_stellar_address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(WalletAccount)
class WalletAccountAdmin(admin.ModelAdmin):
    list_display = ('public_key', 'user', 'wallet_type', 'is_primary', 'last_connected_at', 'created_at')
    list_filter = ('wallet_type', 'is_primary')
    search_fields = ('public_key', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at', 'last_connected_at')
