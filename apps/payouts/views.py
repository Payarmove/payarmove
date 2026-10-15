from rest_framework import generics, permissions
from drf_spectacular.utils import extend_schema
from .models import HostPayout
from .serializers import HostPayoutSerializer

class HostPayoutListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HostPayoutSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN' or user.is_superuser:
            return HostPayout.objects.all().order_by('-created_at')
        return HostPayout.objects.filter(host=user).order_by('-created_at')

    @extend_schema(
        tags=['Host Payouts Ledger'],
        summary='List host payout history and earnings',
        description='Returns all payouts and fee breakdowns credited to the vehicle host.'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
