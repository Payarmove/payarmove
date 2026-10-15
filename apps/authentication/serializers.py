from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, WalletAccount, HostApplication

class WalletAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletAccount
        fields = ['id', 'public_key', 'wallet_type', 'is_primary', 'last_connected_at']
        read_only_fields = ['id', 'last_connected_at']


class UserProfileSerializer(serializers.ModelSerializer):
    wallets = WalletAccountSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'is_staff', 'is_superuser', 'kyc_tier', 'phone_number', 'primary_stellar_address',
            'avatar', 'avatar_url',
            'wallets', 'date_joined'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser', 'kyc_tier', 'date_joined']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.is_superuser or instance.is_staff or instance.role == User.Role.ADMIN:
            data['role'] = 'ADMIN'
        data['is_superuser'] = bool(instance.is_superuser)
        data['is_staff'] = bool(instance.is_staff)
        if not data.get('avatar_url') and instance.avatar:
            try:
                data['avatar_url'] = request.build_absolute_uri(instance.avatar.url) if request else f"http://localhost:8000{instance.avatar.url}"
            except Exception:
                data['avatar_url'] = f"http://localhost:8000/media/{instance.avatar.name}"
        elif not data.get('avatar_url') and not instance.avatar:
            data['avatar_url'] = '/default-avatar.svg'
        elif data.get('avatar_url') and data['avatar_url'].startswith('/media/'):
            data['avatar_url'] = f"http://localhost:8000{data['avatar_url']}"
        if data.get('avatar') and data['avatar'].startswith('/media/'):
            data['avatar'] = f"http://localhost:8000{data['avatar']}"
        return data


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.RENTER)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'role', 'phone_number', 'primary_stellar_address']

    def create(self, validated_data):
        password = validated_data.pop('password')
        if 'username' not in validated_data or not validated_data['username']:
            validated_data['username'] = validated_data['email']
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.kyc_tier = User.KYCTier.TIER1
        user.avatar_url = '/default-avatar.svg'
        user.save()

        # If primary stellar address supplied, link wallet
        stellar_addr = validated_data.get('primary_stellar_address')
        if stellar_addr:
            WalletAccount.objects.create(
                user=user,
                public_key=stellar_addr,
                wallet_type=WalletAccount.WalletType.FREIGHTER,
                is_primary=True
            )

        return user


class UserSigninSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = (attrs.get('email') or '').strip()
        password = attrs.get('password')

        # Try authenticating directly (with email)
        user = authenticate(username=identifier, password=password)
        if not user:
            # Check if identifier matches a username or email in User table
            found_user = User.objects.filter(username__iexact=identifier).first()
            if not found_user:
                found_user = User.objects.filter(email__iexact=identifier).first()
            if found_user:
                user = authenticate(username=found_user.email, password=password)

        if not user:
            raise serializers.ValidationError('Invalid email/username or password credentials.')
        if not user.is_active:
            raise serializers.ValidationError('User account is inactive.')

        attrs['user'] = user
        return attrs


class WalletChallengeRequestSerializer(serializers.Serializer):
    public_key = serializers.CharField(max_length=56, min_length=56, help_text="Stellar G... public key")


class WalletChallengeResponseSerializer(serializers.Serializer):
    network = serializers.CharField()
    network_passphrase = serializers.CharField()
    transaction_xdr = serializers.CharField(help_text="Base64 encoded SEP-0010 challenge transaction")


class WalletVerifyRequestSerializer(serializers.Serializer):
    public_key = serializers.CharField(max_length=56, min_length=56)
    signed_xdr = serializers.CharField(help_text="Base64 encoded signed challenge transaction")
    wallet_type = serializers.ChoiceField(
        choices=WalletAccount.WalletType.choices,
        default=WalletAccount.WalletType.FREIGHTER
    )
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.RENTER,
        required=False,
        help_text="Role to assign if creating a new user upon wallet connect"
    )


class HostApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostApplication
        fields = [
            'id', 'user', 'full_name', 'email', 'phone_number',
            'payout_stellar_address', 'agreed_terms', 'status', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'created_at', 'updated_at']


class HostApplicationCreateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=30, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    payout_stellar_address = serializers.CharField(max_length=56, required=False, allow_blank=True)
    payout_wallet = serializers.CharField(max_length=56, required=False, allow_blank=True)
    agreed_terms = serializers.BooleanField(default=True)

    def validate_payout_stellar_address(self, value):
        if value and not value.startswith('G'):
            raise serializers.ValidationError("Stellar address must start with 'G'.")
        return value

