from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import date, timedelta
from apps.rentals.models import Vehicle, Rental
from apps.escrow.models import SmartContractEscrow
from apps.payouts.models import HostPayout

User = get_user_model()

class RentalEscrowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Host
        self.host = User.objects.create_user(
            email='host_john@example.com',
            username='host_john',
            password='Password123!',
            role='HOST',
            kyc_tier=User.KYCTier.TIER2,
            primary_stellar_address='GDEF47HOSTTESTNETKEY444555666777888999000111222333444'
        )

        # Renter
        self.renter = User.objects.create_user(
            email='renter_alice@example.com',
            username='renter_alice',
            password='Password123!',
            role='RENTER',
            kyc_tier=User.KYCTier.TIER2,
            primary_stellar_address='GABC47RENTERTESTNETKEY111222333444555666777888999000'
        )

        # Vehicle (Daily rate = 50 USDC, Deposit = 100 USDC)
        self.vehicle = Vehicle.objects.create(
            host=self.host,
            make_model='Toyota Corolla 2022',
            registration_number='KDA 123X',
            location='Nairobi, Kenya',
            daily_rate_usdc=Decimal('50.0000000'),
            deposit_amount_usdc=Decimal('100.0000000'),
            is_active=True
        )

    def test_full_rental_escrow_settlement_lifecycle(self):
        self.client.force_authenticate(user=self.renter)

        # 1. Create Rental: 3 days (150 USDC rental + 100 USDC deposit = 250 USDC total)
        today = date.today()
        rental_res = self.client.post('/api/v1/rentals/rentals/', {
            'vehicle': str(self.vehicle.id),
            'start_date': today.isoformat(),
            'end_date': (today + timedelta(days=3)).isoformat()
        }, format='json')

        self.assertEqual(rental_res.status_code, status.HTTP_201_CREATED)
        rental_id = rental_res.data['id']
        rental_code = rental_res.data['rental_code']
        self.assertEqual(Decimal(rental_res.data['rental_amount_usdc']), Decimal('150.0000000'))
        self.assertEqual(Decimal(rental_res.data['deposit_amount_usdc']), Decimal('100.0000000'))
        self.assertEqual(Decimal(rental_res.data['total_due_usdc']), Decimal('250.0000000'))

        # 2. Prepare Soroban Escrow Deposit
        prepare_res = self.client.post(f"/api/v1/escrow/prepare/{rental_id}/")
        self.assertEqual(prepare_res.status_code, status.HTTP_200_OK)
        self.assertIn('contract_call_parameters', prepare_res.data)

        # 3. Submit Deposit Transaction (Simulated Freighter on-chain sign)
        simulated_tx_hash = "4f9b8a8292cbb3e85e1358b532924151e2bc682390a72ad481b7e6840742d8d8"
        submit_res = self.client.post(
            f"/api/v1/escrow/{rental_id}/submit-deposit/",
            {'transaction_hash': simulated_tx_hash},
            format='json'
        )
        self.assertEqual(submit_res.status_code, status.HTTP_200_OK)
        self.assertEqual(submit_res.data['escrow']['status'], SmartContractEscrow.OnChainStatus.FUNDED)

        # Verify Rental is confirmed
        rental = Rental.objects.get(pk=rental_id)
        self.assertEqual(rental.status, Rental.Status.CONFIRMED)

        # 4. Host completes rental and settles escrow
        self.client.force_authenticate(user=self.host)
        settle_res = self.client.post(f"/api/v1/escrow/{rental_id}/settle/", {}, format='json')
        self.assertEqual(settle_res.status_code, status.HTTP_200_OK)
        self.assertEqual(settle_res.data['escrow']['status'], SmartContractEscrow.OnChainStatus.COMPLETED)

        # 5. Verify Host Payout ledger record
        # Gross = 150 USDC, Platform fee 10% = 15 USDC, Net host = 135 USDC
        payout = HostPayout.objects.filter(rental=rental).first()
        self.assertIsNotNone(payout)
        self.assertEqual(payout.gross_rental_usdc, Decimal('150.0000000'))
        self.assertEqual(payout.platform_fee_usdc, Decimal('15.0000000'))
        self.assertEqual(payout.net_payout_usdc, Decimal('135.0000000'))
        self.assertEqual(payout.status, HostPayout.Status.COMPLETED)

        # 6. Check Host Dashboard
        dash_res = self.client.get('/api/v1/dashboard/host/summary/')
        self.assertEqual(dash_res.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(dash_res.data['total_earned_usdc']), Decimal('135.0000000'))
        self.assertEqual(dash_res.data['completed_bookings_count'], 1)
