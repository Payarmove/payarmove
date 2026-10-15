from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    SignupView,
    SigninView,
    WalletChallengeView,
    WalletVerifyView,
    UserProfileView,
    AvatarUploadView,
    WalletLoginView,
    WalletProfileSetupView,
    HostApplicationView,
)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='auth-signup'),
    path('signin/', SigninView.as_view(), name='auth-signin'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('wallet/challenge/', WalletChallengeView.as_view(), name='wallet-challenge'),
    path('wallet/verify/', WalletVerifyView.as_view(), name='wallet-verify'),
    path('wallet/login/', WalletLoginView.as_view(), name='wallet-login'),
    path('wallet/setup/', WalletProfileSetupView.as_view(), name='wallet-setup'),
    path('me/', UserProfileView.as_view(), name='auth-me'),
    path('avatar/', AvatarUploadView.as_view(), name='auth-avatar'),
    path('host-application/', HostApplicationView.as_view(), name='auth-host-application'),
]

