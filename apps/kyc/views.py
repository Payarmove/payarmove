from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import KYCRecord
from .serializers import KYCSubmitSerializer, KYCRecordDetailSerializer, KYCReviewSerializer
from apps.core.permissions import IsAdminRole
from apps.authentication.models import User

class KYCSubmitView(generics.CreateAPIView):
    serializer_class = KYCSubmitSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        tags=['KYC Compliance'],
        summary='Submit identification documents for KYC verification',
        description='Uploads passport, national ID, or driver license for compliance review.',
        responses={201: KYCRecordDetailSerializer}
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = serializer.save(user=request.user)

        return Response({
            'success': True,
            'message': 'KYC documentation submitted successfully. Awaiting compliance review.',
            'record': KYCRecordDetailSerializer(record).data
        }, status=status.HTTP_201_CREATED)


class KYCStatusView(generics.GenericAPIView):
    serializer_class = KYCRecordDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        tags=['KYC Compliance'],
        summary='Check current user KYC verification status',
        responses={200: OpenApiResponse(description='KYC Tier and latest record')}
    )
    def get(self, request, *args, **kwargs):
        latest_record = KYCRecord.objects.filter(user=request.user).order_by('-created_at').first()
        record_data = self.get_serializer(latest_record).data if latest_record else None

        return Response({
            'kyc_tier': request.user.kyc_tier,
            'is_verified': request.user.kyc_tier == User.KYCTier.TIER2,
            'latest_submission': record_data
        })


class KYCAdminListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    queryset = KYCRecord.objects.all().order_by('-created_at')
    serializer_class = KYCRecordDetailSerializer

    @extend_schema(
        tags=['KYC Compliance (Admin)'],
        summary='List all KYC applications',
        description='Admin endpoint to audit submitted KYC records.'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class KYCReviewView(generics.GenericAPIView):
    serializer_class = KYCReviewSerializer
    permission_classes = [IsAdminRole]

    @extend_schema(
        tags=['KYC Compliance (Admin)'],
        summary='Approve or reject a KYC application',
        responses={200: KYCRecordDetailSerializer}
    )
    def post(self, request, pk, *args, **kwargs):
        try:
            record = KYCRecord.objects.get(pk=pk)
        except KYCRecord.DoesNotExist:
            return Response({'error': 'KYC record not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data['action']
        if action == 'APPROVE':
            record.status = KYCRecord.Status.APPROVED
            record.reviewed_by = request.user
            record.reviewed_at = timezone.now()
            record.rejection_reason = None
            record.save()

            # Upgrade user to Tier 2
            record.user.kyc_tier = User.KYCTier.TIER2
            record.user.save(update_fields=['kyc_tier'])
        else:
            record.status = KYCRecord.Status.REJECTED
            record.reviewed_by = request.user
            record.reviewed_at = timezone.now()
            record.rejection_reason = serializer.validated_data.get('rejection_reason', 'Documents did not satisfy compliance requirements.')
            record.save()

        return Response({
            'success': True,
            'message': f"KYC record has been {record.status.lower()}.",
            'record': KYCRecordDetailSerializer(record).data
        })
