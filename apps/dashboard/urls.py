from django.urls import path
from .views import AdminDashboardView, HostDashboardView

urlpatterns = [
    path('admin/summary/', AdminDashboardView.as_view(), name='dashboard-admin-summary'),
    path('host/summary/', HostDashboardView.as_view(), name='dashboard-host-summary'),
]
