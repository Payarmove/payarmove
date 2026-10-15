from rest_framework import serializers
from .models import HostPayout

class HostPayoutSerializer(serializers.ModelSerializer):
    rental_code = serializers.CharField(source='rental.rental_code', read_only=True)
    vehicle_name = serializers.CharField(source='rental.vehicle.make_model', read_only=True)
    host_email = serializers.CharField(source='host.email', read_only=True)
    host_name = serializers.SerializerMethodField()
    host_stellar_address = serializers.CharField(source='host.primary_stellar_address', read_only=True)
    renter_email = serializers.CharField(source='rental.renter.email', read_only=True)
    renter_name = serializers.SerializerMethodField()
    payment_status = serializers.CharField(source='rental.status', read_only=True)

    class Meta:
        model = HostPayout
        fields = [
            'id', 'rental_code', 'vehicle_name', 'host_email', 'host_name', 'host_stellar_address',
            'renter_email', 'renter_name', 'payment_status',
            'gross_rental_usdc', 'platform_fee_usdc', 'net_payout_usdc',
            'status', 'tx_hash', 'settled_at', 'created_at'
        ]

    def get_host_name(self, obj):
        if obj.host:
            return obj.host.first_name or obj.host.username or obj.host.email.split('@')[0]
        return 'Verified Host'

    def get_renter_name(self, obj):
        if obj.rental and obj.rental.renter:
            return obj.rental.renter.first_name or obj.rental.renter.username or obj.rental.renter.email.split('@')[0]
        return 'Guest Renter'
