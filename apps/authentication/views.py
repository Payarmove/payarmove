from rest_framework import status, generics, permissions, parsers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.conf import settings

from .models import User, WalletAccount, HostApplication
from .serializers import (
    UserSignupSerializer,
    UserSigninSerializer,
    UserProfileSerializer,
    WalletChallengeRequestSerializer,
    WalletChallengeResponseSerializer,
    WalletVerifyRequestSerializer,
    WalletAccountSerializer,
    HostApplicationSerializer,
    HostApplicationCreateSerializer,
)
from .sep10 import generate_sep10_challenge, verify_sep10_challenge


def get_tokens_for_user(user: User):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


class SignupView(generics.CreateAPIView):
    serializer_class = UserSignupSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Register a new user account',
        description='Creates a new user profile with email, password, and chosen role (RENTER or HOST).',
        responses={201: UserProfileSerializer}
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)

        return Response({
            'success': True,
            'message': 'User registered successfully.',
            'tokens': tokens,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class SigninView(generics.GenericAPIView):
    serializer_class = UserSigninSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Sign in with email and password',
        description='Authenticates user credentials and returns JWT access and refresh tokens.',
        responses={200: OpenApiResponse(description='JWT Token Pair & Profile')}
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)

        return Response({
            'success': True,
            'message': 'Authenticated successfully.',
            'tokens': tokens,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class WalletChallengeView(generics.GenericAPIView):
    serializer_class = WalletChallengeRequestSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Wallet Connect (SEP-0010)'],
        summary='Request SEP-0010 Stellar challenge transaction',
        description='Generates an unsigned SEP-0010 challenge transaction in base64 XDR format for Freighter wallet signing.',
        responses={200: WalletChallengeResponseSerializer}
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        public_key = serializer.validated_data['public_key']

        tx_xdr = generate_sep10_challenge(public_key)

        return Response({
            'network': getattr(settings, 'STELLAR_NETWORK', 'TESTNET'),
            'network_passphrase': getattr(settings, 'STELLAR_NETWORK_PASSPHRASE', 'Test SDF Network ; September 2015'),
            'transaction_xdr': tx_xdr
        }, status=status.HTTP_200_OK)


class WalletVerifyView(generics.GenericAPIView):
    serializer_class = WalletVerifyRequestSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Wallet Connect (SEP-0010)'],
        summary='Verify signed SEP-0010 challenge transaction',
        description='Verifies cryptographic signature from Freighter/Stellar wallet. Logs in or auto-creates user account.',
        responses={200: OpenApiResponse(description='Verified Wallet & JWT Tokens')}
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        public_key = serializer.validated_data['public_key']
        signed_xdr = serializer.validated_data['signed_xdr']
        wallet_type = serializer.validated_data.get('wallet_type', WalletAccount.WalletType.FREIGHTER)
        role = serializer.validated_data.get('role', User.Role.RENTER)

        is_valid = verify_sep10_challenge(public_key, signed_xdr)
        if not is_valid:
            return Response({
                'success': False,
                'error': {
                    'code': 'SignatureVerificationFailed',
                    'message': 'Invalid signature or expired challenge transaction.'
                }
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Find or create user associated with this stellar wallet
        wallet = WalletAccount.objects.filter(public_key=public_key).first()
        if wallet:
            user = wallet.user
        else:
            synthetic_email = f"{public_key[:8].lower()}_{public_key[-4:].lower()}@stellar.payarmove.io"
            user, created = User.objects.get_or_create(
                email=synthetic_email,
                defaults={
                    'username': f"stellar_{public_key[:8]}",
                    'role': User.Role.RENTER,
                    'primary_stellar_address': public_key,
                    'kyc_tier': User.KYCTier.TIER1,
                    'avatar_url': '/default-avatar.svg',
                }
            )
            WalletAccount.objects.create(
                user=user,
                public_key=public_key,
                wallet_type=wallet_type,
                is_primary=True
            )

        tokens = get_tokens_for_user(user)

        return Response({
            'success': True,
            'message': 'Wallet verified and connected successfully.',
            'tokens': tokens,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_object(self):
        return self.request.user

    @extend_schema(
        tags=['Authentication'],
        summary='Get current user profile',
        description='Returns profile details, connected wallets, and current KYC tier status.'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Authentication'],
        summary='Update current user profile',
        description='Update user profile details.'
    )
    def patch(self, request, *args, **kwargs):
        response = super().patch(request, *args, **kwargs)
        stellar_addr = request.data.get('primary_stellar_address')
        if stellar_addr:
            from .models import WalletAccount
            wallet = WalletAccount.objects.filter(public_key=stellar_addr).first()
            if wallet:
                wallet.user = request.user
                wallet.is_primary = True
                wallet.save(update_fields=['user', 'is_primary', 'last_connected_at'])
            else:
                WalletAccount.objects.create(
                    user=request.user,
                    public_key=stellar_addr,
                    wallet_type=WalletAccount.WalletType.FREIGHTER,
                    is_primary=True,
                )
        return response


class AvatarUploadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    @extend_schema(
        tags=['Authentication'],
        summary='Upload user profile picture',
        description='Uploads an avatar image file or data URL for the authenticated user.',
    )
    def post(self, request, *args, **kwargs):
        user = request.user
        file = request.FILES.get('avatar')
        avatar_data_url = request.data.get('avatar_url') or request.data.get('avatar')

        if file:
            user.avatar = file
            user.save()
            try:
                user.avatar_url = request.build_absolute_uri(user.avatar.url)
            except Exception:
                user.avatar_url = f"/media/{user.avatar.name}"
            user.save()
        elif avatar_data_url and isinstance(avatar_data_url, str):
            user.avatar_url = avatar_data_url
            user.save()
        else:
            return Response(
                {'success': False, 'error': {'message': 'Please provide an image file or avatar_url.'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        final_url = user.avatar_url
        if not final_url and user.avatar:
            try:
                final_url = request.build_absolute_uri(user.avatar.url)
            except Exception:
                final_url = f"/media/{user.avatar.name}"

        return Response({
            'success': True,
            'message': 'Profile picture updated successfully.',
            'avatar_url': final_url,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class WalletLoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Sign in directly with Stellar wallet public key or check lookup',
        description='Finds an existing user by primary Stellar address or linked wallet public key and returns JWT tokens.'
    )
    def get(self, request, *args, **kwargs):
        public_key = request.query_params.get('address', '').strip()
        if not public_key:
            return Response({'exists': False, 'message': 'Address parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        wallet = WalletAccount.objects.filter(public_key__iexact=public_key).first()
        user = wallet.user if wallet else User.objects.filter(primary_stellar_address__iexact=public_key).first()

        if user:
            return Response({
                'exists': True,
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response({'exists': False}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        public_key = request.data.get('public_key', '').strip()
        if not public_key:
            return Response(
                {'success': False, 'error': {'message': 'Stellar public_key is required.'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        wallet = WalletAccount.objects.filter(public_key__iexact=public_key).first()
        user = wallet.user if wallet else User.objects.filter(primary_stellar_address__iexact=public_key).first()

        if not user:
            return Response(
                {
                    'success': False,
                    'exists': False,
                    'message': 'No account associated with this wallet. Please set up your profile.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        tokens = get_tokens_for_user(user)
        return Response({
            'success': True,
            'exists': True,
            'message': 'Logged in successfully with Stellar wallet.',
            'tokens': tokens,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class WalletProfileSetupView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Set up profile and register using Stellar wallet',
        description='Creates a new user account linked to the connected Stellar wallet address.'
    )
    def post(self, request, *args, **kwargs):
        data = request.data
        public_key = data.get('public_key', '').strip()
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        phone_number = data.get('phone_number', '').strip()
        role = data.get('role', User.Role.RENTER)

        if not public_key:
            return Response(
                {'success': False, 'error': {'message': 'Stellar public_key is required.'}},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not email:
            return Response(
                {'success': False, 'error': {'message': 'Email address is required.'}},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Wallet registration strictly sets RENTER role. Host privileges require formal host application.
        role = User.Role.RENTER

        user = User.objects.filter(email=email).first()
        if user:
            # Clear conflicting older user references to this public key
            User.objects.filter(primary_stellar_address__iexact=public_key).exclude(id=user.id).update(primary_stellar_address=None)
            user.primary_stellar_address = public_key
            if name and not user.first_name:
                user.first_name = name
            if phone_number and not user.phone_number:
                user.phone_number = phone_number
            user.save()
        else:
            User.objects.filter(primary_stellar_address__iexact=public_key).update(primary_stellar_address=None)
            username = data.get('username') or email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create(
                email=email,
                username=username,
                first_name=name,
                role=User.Role.RENTER,
                phone_number=phone_number,
                primary_stellar_address=public_key,
                kyc_tier=User.KYCTier.TIER1,
                avatar_url='/default-avatar.svg',
            )
            user.set_unusable_password()
            user.save()

        wallet, _ = WalletAccount.objects.get_or_create(
            public_key=public_key,
            defaults={
                'user': user,
                'wallet_type': WalletAccount.WalletType.OTHER,
                'is_primary': True
            }
        )
        if wallet.user != user:
            wallet.user = user
            wallet.save()

        tokens = get_tokens_for_user(user)
        return Response({
            'success': True,
            'message': 'Profile setup completed and wallet connected.',
            'tokens': tokens,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class HostApplicationView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HostApplicationCreateSerializer

    @extend_schema(
        tags=['Host Application'],
        summary='Apply to become a vehicle rental host',
        description='Submits host application and binds connected wallet as host payout wallet. Automatically transitions user to HOST role.',
        request=HostApplicationCreateSerializer,
        responses={201: HostApplicationSerializer}
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        full_name = serializer.validated_data.get('full_name') or user.get_full_name() or user.username or "Host"
        email = serializer.validated_data.get('email') or user.email
        phone_number = serializer.validated_data.get('phone_number') or user.phone_number or ""
        payout_addr = (
            serializer.validated_data.get('payout_stellar_address')
            or serializer.validated_data.get('payout_wallet')
            or user.primary_stellar_address
            or ""
        )
        agreed = serializer.validated_data.get('agreed_terms', True)

        app = HostApplication.objects.create(
            user=user,
            full_name=full_name,
            email=email,
            phone_number=phone_number,
            payout_stellar_address=payout_addr,
            agreed_terms=agreed,
            status=HostApplication.Status.APPROVED
        )

        user.role = User.Role.HOST
        if payout_addr:
            user.primary_stellar_address = payout_addr
            wallet = WalletAccount.objects.filter(public_key=payout_addr).first()
            if wallet:
                wallet.user = user
                wallet.is_primary = True
                wallet.save(update_fields=['user', 'is_primary'])
            else:
                WalletAccount.objects.create(
                    user=user,
                    public_key=payout_addr,
                    wallet_type=WalletAccount.WalletType.FREIGHTER,
                    is_primary=True
                )

        if phone_number and not user.phone_number:
            user.phone_number = phone_number
        if full_name:
            user.first_name = full_name.split()[0]
            if len(full_name.split()) > 1:
                user.last_name = " ".join(full_name.split()[1:])
        user.save()

        return Response({
            'success': True,
            'message': 'Host application approved! You are now an active vehicle host.',
            'application': HostApplicationSerializer(app).data,
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)

    @extend_schema(
        tags=['Host Application'],
        summary='Get host application status',
        description='Returns current host application status and whether user is an approved host.',
    )
    def get(self, request, *args, **kwargs):
        user = request.user
        latest_app = HostApplication.objects.filter(user=user).first()
        is_host = user.role == User.Role.HOST and (latest_app is not None and latest_app.status == HostApplication.Status.APPROVED or user.is_staff or user.is_superuser)
        has_applied = latest_app is not None

        return Response({
            'has_applied': has_applied,
            'is_host': is_host,
            'status': latest_app.status if latest_app else None,
            'payout_stellar_address': latest_app.payout_stellar_address if latest_app else (user.primary_stellar_address if is_host else None),
            'application': HostApplicationSerializer(latest_app).data if latest_app else None
        })


