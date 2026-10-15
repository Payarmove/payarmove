from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.authentication.models import WalletAccount
from stellar_sdk import Keypair

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_url = '/api/v1/auth/signup/'
        self.signin_url = '/api/v1/auth/signin/'
        self.challenge_url = '/api/v1/auth/wallet/challenge/'
        self.verify_url = '/api/v1/auth/wallet/verify/'

        self.keypair = Keypair.random()

    def test_signup_renter(self):
        payload = {
            'email': 'renter@example.com',
            'username': 'renter_john',
            'password': 'SecurePassword123!',
            'role': 'RENTER',
            'primary_stellar_address': self.keypair.public_key
        }
        response = self.client.post(self.signup_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'renter@example.com')
        self.assertEqual(response.data['user']['role'], 'RENTER')

        # Check wallet linked
        wallet = WalletAccount.objects.filter(public_key=self.keypair.public_key).first()
        self.assertIsNotNone(wallet)

    def test_signin_success(self):
        User.objects.create_user(
            email='host@example.com',
            username='host_mary',
            password='Password123!',
            role='HOST'
        )
        response = self.client.post(self.signin_url, {
            'email': 'host@example.com',
            'password': 'Password123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['role'], 'HOST')

    def test_wallet_challenge_generation(self):
        response = self.client.post(self.challenge_url, {
            'public_key': self.keypair.public_key
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('transaction_xdr', response.data)
        self.assertEqual(response.data['network'], 'TESTNET')
