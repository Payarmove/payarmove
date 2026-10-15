from django.urls import path
from .views import HostPayoutListView

urlpatterns = [
    path('', HostPayoutListView.as_view(), name='host-payout-list'),
]
