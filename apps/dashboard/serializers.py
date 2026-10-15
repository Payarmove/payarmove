from rest_framework import serializers

class AdminDashboardSerializer(serializers.Serializer):
    total_volume_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    confirmed_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    pending_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    total_host_payouts_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    owed_to_hosts_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    platform_fees_collected_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    total_users_count = serializers.IntegerField()
    verified_hosts_count = serializers.IntegerField()
    active_rentals_count = serializers.IntegerField()
    fleet_vehicles_count = serializers.IntegerField()
    pending_kyc_count = serializers.IntegerField()
    awaiting_payment_count = serializers.IntegerField()
    completed_rentals_count = serializers.IntegerField()


class HostDashboardSerializer(serializers.Serializer):
    total_earned_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    pending_payout_usdc = serializers.DecimalField(max_digits=18, decimal_places=7)
    vehicles_listed_count = serializers.IntegerField()
    active_bookings_count = serializers.IntegerField()
    completed_bookings_count = serializers.IntegerField()
