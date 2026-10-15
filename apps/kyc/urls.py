from django.urls import path
from .views import (
    KYCSubmitView,
    KYCStatusView,
    KYCAdminListView,
    KYCReviewView,
)

urlpatterns = [
    path('submit/', KYCSubmitView.as_view(), name='kyc-submit'),
    path('status/', KYCStatusView.as_view(), name='kyc-status'),
    path('admin/applications/', KYCAdminListView.as_view(), name='kyc-admin-list'),
    path('admin/applications/<uuid:pk>/review/', KYCReviewView.as_view(), name='kyc-admin-review'),
]
