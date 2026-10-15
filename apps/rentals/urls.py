from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, RentalViewSet, SavedVehicleViewSet

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'rentals', RentalViewSet, basename='rental')
router.register(r'saved', SavedVehicleViewSet, basename='saved-vehicle')

urlpatterns = [
    path('', include(router.urls)),
]
