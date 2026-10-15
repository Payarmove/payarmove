from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.kyc.models import KYCRecord

User = get_user_model()

class KYCFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='alice@example.com',
            username='alice',
            password='Password123!',
            role='RENTER'
        )
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            username='admin',
            password='AdminPassword123!',
            role='ADMIN'
        )
        self.submit_url = '/api/v1/kyc/submit/'
        self.status_url = '/api/v1/kyc/status/'

    def test_submit_and_approve_kyc(self):
        self.client.force_authenticate(user=self.user)

        dummy_doc = SimpleUploadedFile("id_front.jpg", b"fake_image_content", content_type="image/jpeg")

        response = self.client.post(self.submit_url, {
            'document_type': KYCRecord.DocumentType.DRIVERS_LICENSE,
            'document_number': 'DL-88291039',
            'document_front': dummy_doc
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        record_id = response.data['record']['id']

        # Check status endpoint
        status_res = self.client.get(self.status_url)
        self.assertEqual(status_res.status_code, status.HTTP_200_OK)
        self.assertFalse(status_res.data['is_verified'])

        # Admin approves
        self.client.force_authenticate(user=self.admin)
        review_url = f"/api/v1/kyc/admin/applications/{record_id}/review/"
        review_res = self.client.post(review_url, {'action': 'APPROVE'}, format='json')

        self.assertEqual(review_res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.kyc_tier, User.KYCTier.TIER2)
