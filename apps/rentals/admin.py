from django.contrib import admin
from .models import Vehicle, Rental, SavedVehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        'make_model',
        'category',
        'registration_number',
        'host',
        'location',
        'seats',
        'rating',
        'trips_count',
        'daily_rate_usdc',
        'hourly_rate_usdc',
        'deposit_amount_usdc',
        'is_active',
        'created_at',
    )
    list_filter = ('category', 'is_active', 'location', 'transmission', 'fuel_type', 'created_at')
    search_fields = ('make_model', 'registration_number', 'location', 'host__email', 'host__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SavedVehicle)
class SavedVehicleAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'vehicle__make_model')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = (
        'rental_code',
        'vehicle',
        'renter',
        'host',
        'start_date',
        'end_date',
        'total_due_usdc',
        'status',
        'created_at',
    )
    list_filter = ('status', 'start_date', 'end_date', 'created_at')
    search_fields = (
        'rental_code',
        'vehicle__make_model',
        'renter__email',
        'host__email',
    )
    readonly_fields = ('rental_code', 'total_days', 'rental_amount_usdc', 'deposit_amount_usdc', 'total_due_usdc', 'created_at', 'updated_at')
