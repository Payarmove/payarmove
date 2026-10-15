from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser))

class IsHostRole(BasePermission):
    message = "Host privileges are required to perform this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return bool(request.user.is_staff or request.user.is_superuser or request.user.role in ('HOST', 'ADMIN'))

class IsRenterRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ('RENTER', 'ADMIN') or request.user.is_staff))

class IsKYCApproved(BasePermission):
    message = "KYC approval is required to perform this action."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_staff or request.user.is_superuser or request.user.role == 'ADMIN':
            return True
        return request.user.kyc_tier in ('TIER1', 'TIER2')
