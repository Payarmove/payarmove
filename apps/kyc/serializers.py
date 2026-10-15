from rest_framework import serializers
from .models import KYCRecord

class KYCSubmitSerializer(serializers.ModelSerializer):
    class Meta:
        model = KYCRecord
        fields = [
            'id', 'document_type', 'document_number',
            'document_front', 'document_back', 'selfie_image',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']


class KYCRecordDetailSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = KYCRecord
        fields = [
            'id', 'user_email', 'user_role', 'document_type', 'document_number',
            'document_front', 'document_back', 'selfie_image',
            'status', 'rejection_reason', 'reviewed_at', 'created_at'
        ]
        read_only_fields = ['id', 'user_email', 'user_role', 'reviewed_at', 'created_at']


class KYCReviewSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['action'] == 'REJECT' and not attrs.get('rejection_reason'):
            raise serializers.ValidationError({'rejection_reason': 'Rejection reason is required when rejecting KYC.'})
        return attrs
