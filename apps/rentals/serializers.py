from decimal import Decimal, ROUND_HALF_UP
from rest_framework import serializers
from .models import Vehicle, Rental, SavedVehicle
from apps.authentication.serializers import UserProfileSerializer

class QuantizedDecimalField(serializers.DecimalField):
    """
    Tolerates float representations, exponential notation, and numbers with > decimal_places,
    quantizing to the allowed decimal_places without throwing max_decimal_places ValidationError.
    """
    def to_internal_value(self, data):
        if data is not None and data != '':
            try:
                d = Decimal(str(data).strip())
                quantizer = Decimal('10') ** -self.decimal_places
                data = format(d.quantize(quantizer, rounding=ROUND_HALF_UP), 'f')
            except Exception:
                pass
        return super().to_internal_value(data)

class VehicleSerializer(serializers.ModelSerializer):
    host_email = serializers.EmailField(source='host.email', read_only=True)
    host_name = serializers.SerializerMethodField()
    host_stellar_address = serializers.CharField(source='host.primary_stellar_address', read_only=True)
    is_saved = serializers.SerializerMethodField()
    daily_rate_usdc = QuantizedDecimalField(max_digits=18, decimal_places=7, required=False)
    hourly_rate_usdc = QuantizedDecimalField(max_digits=18, decimal_places=7, required=False)
    deposit_amount_usdc = QuantizedDecimalField(max_digits=18, decimal_places=7, required=False)

    class Meta:
        model = Vehicle
        fields = [
            'id', 'host_email', 'host_name', 'host_stellar_address', 'make_model',
            'registration_number', 'location', 'category', 'year',
            'seats', 'doors', 'transmission', 'fuel_type',
            'rating', 'reviews_count', 'trips_count',
            'daily_rate_usdc', 'hourly_rate_usdc', 'deposit_amount_usdc',
            'pickup_instructions', 'image_url', 'images', 'features', 'rules',
            'is_active', 'is_saved', 'created_at'
        ]
        read_only_fields = ['id', 'host_email', 'host_name', 'host_stellar_address', 'is_saved', 'created_at']

    def get_host_name(self, obj):
        if obj.host:
            return obj.host.first_name or obj.host.username or obj.host.email.split('@')[0]
        return 'Verified Host'

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class SavedVehicleSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)
    vehicle_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = SavedVehicle
        fields = ['id', 'vehicle', 'vehicle_id', 'created_at']
        read_only_fields = ['id', 'vehicle', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        vehicle_id = validated_data['vehicle_id']
        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError({'vehicle_id': 'Vehicle not found.'})
        
        saved, _ = SavedVehicle.objects.get_or_create(user=user, vehicle=vehicle)
        return saved


class RentalCreateSerializer(serializers.ModelSerializer):
    start_time = serializers.CharField(max_length=10, required=False, allow_blank=True, default='09:00')
    end_time = serializers.CharField(max_length=10, required=False, allow_blank=True, default='11:00')
    total_hours = QuantizedDecimalField(max_digits=8, decimal_places=2, required=False)
    rental_amount_usdc = QuantizedDecimalField(max_digits=18, decimal_places=7, required=False)
    deposit_amount_usdc = QuantizedDecimalField(max_digits=18, decimal_places=7, required=False)
    total_due_usdc = QuantizedDecimalField(max_digits=18, decimal_places=7, required=False)

    class Meta:
        model = Rental
        fields = [
            'id', 'vehicle', 'start_date', 'end_date',
            'start_time', 'end_time', 'total_hours',
            'rental_amount_usdc', 'deposit_amount_usdc', 'total_due_usdc'
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if end_date < start_date:
            raise serializers.ValidationError('End date cannot be earlier than start date.')
        
        vehicle = attrs.get('vehicle')
        if not vehicle.is_active:
            raise serializers.ValidationError('Selected vehicle is currently not available.')
        return attrs

    def create(self, validated_data):
        renter = self.context['request'].user
        vehicle = validated_data['vehicle']
        rental = Rental.objects.create(
            renter=renter,
            host=vehicle.host,
            status=Rental.Status.AWAITING_PAYMENT,
            **validated_data
        )
        return rental


class RentalDetailSerializer(serializers.ModelSerializer):
    vehicle = VehicleSerializer(read_only=True)
    renter = UserProfileSerializer(read_only=True)
    host = UserProfileSerializer(read_only=True)

    class Meta:
        model = Rental
        fields = [
            'id', 'rental_code', 'vehicle', 'renter', 'host',
            'start_date', 'end_date', 'start_time', 'end_time',
            'total_days', 'total_hours',
            'rental_amount_usdc', 'deposit_amount_usdc', 'total_due_usdc',
            'status', 'created_at', 'updated_at'
        ]
