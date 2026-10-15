from django.urls import path
from .views import (
    EscrowPrepareView,
    EscrowStatusView,
    EscrowDepositSubmitView,
    EscrowSettleView,
    EscrowDisputeView,
)

urlpatterns = [
    path('prepare/<str:rental_id>/', EscrowPrepareView.as_view(), name='escrow-prepare'),
    path('<str:rental_id>/', EscrowStatusView.as_view(), name='escrow-status'),
    path('<str:rental_id>/submit-deposit/', EscrowDepositSubmitView.as_view(), name='escrow-submit-deposit'),
    path('<str:rental_id>/settle/', EscrowSettleView.as_view(), name='escrow-settle'),
    path('<str:rental_id>/dispute/', EscrowDisputeView.as_view(), name='escrow-dispute'),
]
