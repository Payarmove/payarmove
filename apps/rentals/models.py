from django.db import models
from django.conf import settings
from decimal import Decimal
import secrets
from apps.core.models import TimestampedBaseModel

class Vehicle(TimestampedBaseModel):
    class Category(models.TextChoices):
        SUV = 'SUV', 'SUV'
        SEDAN = 'Sedan', 'Sedan'
        COMPACT = 'Compact', 'Compact'
        VAN = 'Van', 'Van'
        LUXURY = 'Luxury', 'Luxury'
        ELECTRIC = 'Electric', 'Electric'

    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicles')
    make_model = models.CharField(max_length=100) # e.g. "Mercedes-Benz G-Class G63 AMG"
    registration_number = models.CharField(max_length=50) # e.g. "KDA 123X"
    location = models.CharField(max_length=150, default='Westlands, Nairobi, Kenya')
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.SUV)
    year = models.PositiveIntegerField(default=2024)

    # Detailed vehicle specifications
    seats = models.PositiveIntegerField(default=5)
    doors = models.PositiveIntegerField(default=4)
    transmission = models.CharField(max_length=30, default='Automatic')
    fuel_type = models.CharField(max_length=30, default='Gasoline')

    # Metrics & Ratings
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('5.00'))
    reviews_count = models.PositiveIntegerField(default=14)
    trips_count = models.PositiveIntegerField(default=28)

    # Pricing in USDC
    daily_rate_usdc = models.DecimalField(max_digits=18, decimal_places=7, default=Decimal('50.0000000'))
    hourly_rate_usdc = models.DecimalField(max_digits=18, decimal_places=7, default=Decimal('15.0000000'))
    deposit_amount_usdc = models.DecimalField(max_digits=18, decimal_places=7, default=Decimal('100.0000000'))

    # Logistics & Media
    pickup_instructions = models.TextField(
        default='Instant unlock via Stellar Soroban smart lock code after escrow funding. Pick up from verified secure parking.'
    )
    image_url = models.TextField(blank=True, null=True)
    images = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list, blank=True)
    rules = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.hourly_rate_usdc or self.hourly_rate_usdc == Decimal('15.0000000'):
            self.hourly_rate_usdc = (self.daily_rate_usdc / Decimal('24')).quantize(Decimal('0.0000001'))
        if self.image_url and (not self.images or len(self.images) == 0):
            self.images = [self.image_url]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.make_model} ({self.location}) - Host: {self.host.email}"


class SavedVehicle(TimestampedBaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_vehicles')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='favorited_by')

    class Meta:
        unique_together = ('user', 'vehicle')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} saved {self.vehicle.make_model}"


class Rental(TimestampedBaseModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        AWAITING_PAYMENT = 'AWAITING_PAYMENT', 'Awaiting Escrow Deposit'
        CONFIRMED = 'CONFIRMED', 'Confirmed & Funded'
        ACTIVE = 'ACTIVE', 'Active / In Progress'
        COMPLETED = 'COMPLETED', 'Completed & Settled'
        CANCELLED = 'CANCELLED', 'Cancelled & Refunded'
        DISPUTED = 'DISPUTED', 'Dispute Pending Arbitration'

    rental_code = models.CharField(max_length=30, unique=True, db_index=True)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name='rentals')
    renter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='renter_bookings')
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='host_bookings')
    
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.CharField(max_length=10, default='09:00', blank=True)
    end_time = models.CharField(max_length=10, default='11:00', blank=True)
    total_days = models.PositiveIntegerField(default=1)
    total_hours = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('24.00'))

    rental_amount_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    deposit_amount_usdc = models.DecimalField(max_digits=18, decimal_places=7)
    total_due_usdc = models.DecimalField(max_digits=18, decimal_places=7)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True)

    def save(self, *args, **kwargs):
        if not self.rental_code:
            random_suffix = secrets.token_hex(3).upper()
            self.rental_code = f"RENT-{random_suffix}"
        
        # Calculate pricing and duration
        if self.start_date and self.end_date:
            from datetime import date, datetime
            s_date = self.start_date
            if isinstance(s_date, str):
                s_date = datetime.strptime(s_date, "%Y-%m-%d").date()
            e_date = self.end_date
            if isinstance(e_date, str):
                e_date = datetime.strptime(e_date, "%Y-%m-%d").date()

            delta = (e_date - s_date).days
            self.total_days = max(1, delta)

            # Determine total_hours if not explicitly provided or <= 0
            if not self.total_hours or Decimal(str(self.total_hours)) <= 0:
                try:
                    s_str = f"{s_date} {self.start_time or '09:00'}"
                    e_str = f"{e_date} {self.end_time or '11:00'}"
                    dt_start = datetime.strptime(s_str, "%Y-%m-%d %H:%M")
                    dt_end = datetime.strptime(e_str, "%Y-%m-%d %H:%M")
                    diff_secs = (dt_end - dt_start).total_seconds()
                    calc_h = max(1, round(diff_secs / 3600))
                    self.total_hours = Decimal(str(calc_h))
                except Exception:
                    self.total_hours = Decimal(str(self.total_days * 24))

            hours_dec = Decimal(str(self.total_hours))

            # Hourly rate from vehicle (fallback to daily / 24)
            hourly = self.vehicle.hourly_rate_usdc
            if not hourly or hourly <= 0:
                hourly = (self.vehicle.daily_rate_usdc / Decimal('24')).quantize(Decimal('0.0000001'))

            # Compute rental amount based on custom hours
            if not self.rental_amount_usdc or self.rental_amount_usdc <= 0:
                self.rental_amount_usdc = (hourly * hours_dec).quantize(Decimal('0.0000001'))

            if not self.deposit_amount_usdc or self.deposit_amount_usdc <= 0:
                self.deposit_amount_usdc = self.vehicle.deposit_amount_usdc

            self.total_due_usdc = (self.rental_amount_usdc + self.deposit_amount_usdc).quantize(Decimal('0.0000001'))

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.rental_code}: {self.vehicle.make_model} ({self.status}) - {self.total_hours} hrs"
