import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.authentication.models import User, WalletAccount, HostApplication
from apps.kyc.models import KYCRecord
from apps.rentals.models import Vehicle, Rental
from apps.escrow.models import SmartContractEscrow
from apps.payouts.models import HostPayout

class Command(BaseCommand):
    help = 'Populate the PayarMove database with comprehensive test data (users, vehicles, rentals, escrow, payouts)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting PayarMove database seeding...'))

        # 1. Create Test Users
        # Renter
        renter_user, created = User.objects.get_or_create(
            email='renter@payarmove.com',
            defaults={
                'username': 'renter',
                'role': User.Role.RENTER,
                'kyc_tier': User.KYCTier.TIER2,
                'phone_number': '+254711223344',
                'primary_stellar_address': 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT',
            }
        )
        renter_user.primary_stellar_address = 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT'
        renter_user.kyc_tier = User.KYCTier.TIER2
        renter_user.set_password('Password123!')
        renter_user.save()
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created test renter: {renter_user.email}'))

        # Host
        host_user, created = User.objects.get_or_create(
            email='host@payarmove.com',
            defaults={
                'username': 'marcus_host',
                'role': User.Role.HOST,
                'kyc_tier': User.KYCTier.TIER2,
                'phone_number': '+254722334455',
                'primary_stellar_address': 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK',
            }
        )
        host_user.primary_stellar_address = 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK'
        host_user.kyc_tier = User.KYCTier.TIER2
        host_user.set_password('Password123!')
        host_user.save()
        HostApplication.objects.get_or_create(
            user=host_user,
            defaults={
                'full_name': 'Marcus Host',
                'email': host_user.email,
                'phone_number': host_user.phone_number or '+254722334455',
                'payout_stellar_address': host_user.primary_stellar_address,
                'agreed_terms': True,
                'status': HostApplication.Status.APPROVED
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created test host: {host_user.email}'))

        # Admin
        admin_user, created = User.objects.get_or_create(
            email='admin@payarmove.com',
            defaults={
                'username': 'admin',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'phone_number': '+254700000000',
            }
        )
        admin_user.set_password('Password123!')
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created test admin: {admin_user.email}'))

        # 2. Wallets
        WalletAccount.objects.update_or_create(
            user=renter_user,
            defaults={
                'public_key': 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT',
                'wallet_type': WalletAccount.WalletType.FREIGHTER,
                'is_primary': True,
            }
        )
        WalletAccount.objects.update_or_create(
            user=host_user,
            defaults={
                'public_key': 'GAPSKIPMRDLTFEKHV6VQKKMDUUIX2I56YVURD62KIYJ6Y6EJSOTP2ZWK',
                'wallet_type': WalletAccount.WalletType.FREIGHTER,
                'is_primary': True,
            }
        )

        # 3. KYC Records
        KYCRecord.objects.get_or_create(
            user=renter_user,
            document_type=KYCRecord.DocumentType.DRIVERS_LICENSE,
            defaults={
                'document_number': 'DL-8921820',
                'status': KYCRecord.Status.APPROVED,
                'reviewed_by': admin_user,
                'reviewed_at': timezone.now(),
            }
        )
        KYCRecord.objects.get_or_create(
            user=host_user,
            document_type=KYCRecord.DocumentType.VEHICLE_LOGBOOK,
            defaults={
                'document_number': 'LOG-4419201',
                'status': KYCRecord.Status.APPROVED,
                'reviewed_by': admin_user,
                'reviewed_at': timezone.now(),
            }
        )

        # 4. Vehicles
        vehicles_data = [
            {
                'make_model': 'Mercedes-Benz G-Class G63 AMG',
                'registration_number': 'KDA 892X',
                'location': 'Westlands, Nairobi, Kenya',
                'category': 'SUV',
                'year': 2024,
                'seats': 5,
                'doors': 4,
                'transmission': 'Automatic',
                'fuel_type': 'Gasoline (V8 Twin-Turbo)',
                'rating': Decimal('5.00'),
                'reviews_count': 16,
                'trips_count': 32,
                'daily_rate_usdc': Decimal('300.0000000'),
                'hourly_rate_usdc': Decimal('25.0000000'),
                'deposit_amount_usdc': Decimal('500.0000000'),
                'pickup_instructions': 'Instant keyless unlock via Stellar Soroban smart lock code after escrow funding. Pick up from Westlands secure underground parking lot.',
                'image_url': '/cars/gwagon.jpg',
                'images': ['/cars/gwagon.jpg', '/cars/mercedes_gle.jpg', '/cars/porsche_macan.jpg'],
                'features': ['Stellar Micro-Payment Unlock', 'Burmester Surround Sound', 'GPS Geo-fencing', 'Adaptive Cruise Control', 'Verified Insurance'],
                'rules': ['No smoking or pets inside vehicle', 'Return with matching fuel tank', '200 miles/day limit included ($0.50/mile after)'],
            },
            {
                'make_model': 'Mercedes-Benz GLE 450 Coupe',
                'registration_number': 'KDB 412Y',
                'location': 'Kilimani, Nairobi, Kenya',
                'category': 'SUV',
                'year': 2024,
                'seats': 5,
                'doors': 4,
                'transmission': 'Automatic',
                'fuel_type': 'Hybrid',
                'rating': Decimal('4.95'),
                'reviews_count': 12,
                'trips_count': 22,
                'daily_rate_usdc': Decimal('180.0000000'),
                'hourly_rate_usdc': Decimal('18.0000000'),
                'deposit_amount_usdc': Decimal('300.0000000'),
                'pickup_instructions': 'Parked at Yaya Centre VIP Level 2. Host keyless passcode provided upon smart contract transaction broadcast.',
                'image_url': '/cars/mercedes_gle.jpg',
                'images': ['/cars/mercedes_gle.jpg', '/cars/gwagon.jpg', '/cars/porsche_macan.jpg'],
                'features': ['Panoramic Sunroof', 'MBUX Augmented Reality Navigation', 'Apple CarPlay & Android Auto', 'Stellar Escrow Unlock'],
                'rules': ['No aggressive off-roading', 'Return clean', 'Speed monitored via telemetry'],
            },
            {
                'make_model': 'Porsche Macan GTS',
                'registration_number': 'KDC 773Z',
                'location': 'Karen, Nairobi, Kenya',
                'category': 'SUV',
                'year': 2024,
                'seats': 5,
                'doors': 4,
                'transmission': 'Automatic PDK',
                'fuel_type': 'Gasoline',
                'rating': Decimal('4.98'),
                'reviews_count': 19,
                'trips_count': 38,
                'daily_rate_usdc': Decimal('220.0000000'),
                'hourly_rate_usdc': Decimal('22.0000000'),
                'deposit_amount_usdc': Decimal('350.0000000'),
                'pickup_instructions': 'The Hub Karen designated mobility bay 4. Key in smart safe box unlocked with escrow authorization.',
                'image_url': '/cars/porsche_macan.jpg',
                'images': ['/cars/porsche_macan.jpg', '/cars/bmw_x5.jpg', '/cars/rangerover_sport.jpg'],
                'features': ['Sport Chrono Package', 'Bose Audio System', 'Air Suspension with PASM', 'Keyless Remote Entry'],
                'rules': ['Premium 98 fuel only (receipt required)', 'No track use', 'Maintain clean interior'],
            },
            {
                'make_model': 'Jeep Wrangler Rubicon 4xe',
                'registration_number': 'KDD 104W',
                'location': 'Lavington, Nairobi, Kenya',
                'category': 'SUV',
                'year': 2024,
                'seats': 5,
                'doors': 4,
                'transmission': 'Automatic',
                'fuel_type': 'Plug-in Hybrid',
                'rating': Decimal('4.92'),
                'reviews_count': 15,
                'trips_count': 26,
                'daily_rate_usdc': Decimal('150.0000000'),
                'hourly_rate_usdc': Decimal('15.0000000'),
                'deposit_amount_usdc': Decimal('250.0000000'),
                'pickup_instructions': 'Lavington Mall designated parking. Charging cable in rear compartment. Bluetooth smart lock enabled.',
                'image_url': '/cars/jeep_wrangler.jpg',
                'images': ['/cars/jeep_wrangler.jpg', '/cars/rangerover_sport.jpg', '/cars/gwagon.jpg'],
                'features': ['Removable Freedom Top', 'TrailCam Off-Road Camera', 'Alpine 9-Speaker Audio', 'Rock-Trac 4x4 System'],
                'rules': ['Wash after muddy terrain', 'No rock crawling without host notice', 'Strictly no smoking'],
            },
            {
                'make_model': 'BMW X5 xDrive40i',
                'registration_number': 'KDE 551V',
                'location': 'Gigiri, Nairobi, Kenya',
                'category': 'SUV',
                'year': 2024,
                'seats': 5,
                'doors': 4,
                'transmission': 'Steptronic Automatic',
                'fuel_type': 'Gasoline Mild Hybrid',
                'rating': Decimal('4.96'),
                'reviews_count': 21,
                'trips_count': 40,
                'daily_rate_usdc': Decimal('190.0000000'),
                'hourly_rate_usdc': Decimal('19.0000000'),
                'deposit_amount_usdc': Decimal('300.0000000'),
                'pickup_instructions': 'Village Market parking slot P-14. QR verification code provided upon rental confirmation.',
                'image_url': '/cars/bmw_x5.jpg',
                'images': ['/cars/bmw_x5.jpg', '/cars/mercedes_gle.jpg', '/cars/rangerover_sport.jpg'],
                'features': ['BMW Curved Display with iDrive 8.5', 'Harman Kardon Surround Sound', 'Parking Assistant Plus', 'Wireless Phone Charger'],
                'rules': ['No food inside car', 'Clean return required', 'Late return fee: $35/hour'],
            },
            {
                'make_model': 'Range Rover Sport Dynamic',
                'registration_number': 'KDF 909T',
                'location': 'Muthaiga, Nairobi, Kenya',
                'category': 'Luxury',
                'year': 2024,
                'seats': 5,
                'doors': 4,
                'transmission': 'Automatic',
                'fuel_type': 'Gasoline',
                'rating': Decimal('5.00'),
                'reviews_count': 18,
                'trips_count': 35,
                'daily_rate_usdc': Decimal('320.0000000'),
                'hourly_rate_usdc': Decimal('28.0000000'),
                'deposit_amount_usdc': Decimal('600.0000000'),
                'pickup_instructions': 'Muthaiga Country Club gate 2 reception. Concierge hand-off with digital biometric check.',
                'image_url': '/cars/rangerover_sport.jpg',
                'images': ['/cars/rangerover_sport.jpg', '/cars/gwagon.jpg', '/cars/bmw_x5.jpg'],
                'features': ['Meridian 3D Surround Sound', 'Dynamic Air Suspension with eHorizon', 'Pixel LED Headlights', 'Cabin Air Purification Pro'],
                'rules': ['Chauffeur or verified TIER2 driver only', 'No smoking', 'Pre-inspection video logged'],
            },
        ]

        created_vehicles = []
        for v in vehicles_data:
            vehicle, created = Vehicle.objects.update_or_create(
                registration_number=v['registration_number'],
                defaults={
                    'host': host_user,
                    'make_model': v['make_model'],
                    'location': v['location'],
                    'category': v['category'],
                    'year': v['year'],
                    'seats': v['seats'],
                    'doors': v['doors'],
                    'transmission': v['transmission'],
                    'fuel_type': v['fuel_type'],
                    'rating': v['rating'],
                    'reviews_count': v['reviews_count'],
                    'trips_count': v['trips_count'],
                    'daily_rate_usdc': v['daily_rate_usdc'],
                    'hourly_rate_usdc': v['hourly_rate_usdc'],
                    'deposit_amount_usdc': v['deposit_amount_usdc'],
                    'pickup_instructions': v['pickup_instructions'],
                    'image_url': v['image_url'],
                    'images': v['images'],
                    'features': v['features'],
                    'rules': v['rules'],
                    'is_active': True,
                }
            )
            created_vehicles.append(vehicle)

        self.stdout.write(self.style.SUCCESS(f'Populated {len(created_vehicles)} vehicles in database.'))

        # 5. Rentals
        today = datetime.date.today()
        # Rental 1: Active
        r1, _ = Rental.objects.get_or_create(
            rental_code='PM-8921',
            defaults={
                'vehicle': created_vehicles[0],
                'renter': renter_user,
                'host': host_user,
                'start_date': today - datetime.timedelta(days=1),
                'end_date': today + datetime.timedelta(days=2),
                'total_days': 3,
                'rental_amount_usdc': Decimal('900.0000000'),
                'deposit_amount_usdc': Decimal('500.0000000'),
                'total_due_usdc': Decimal('1400.0000000'),
                'status': Rental.Status.ACTIVE,
            }
        )

        # Rental 2: Completed
        r2, _ = Rental.objects.get_or_create(
            rental_code='PM-4412',
            defaults={
                'vehicle': created_vehicles[1],
                'renter': renter_user,
                'host': host_user,
                'start_date': today - datetime.timedelta(days=7),
                'end_date': today - datetime.timedelta(days=4),
                'total_days': 3,
                'rental_amount_usdc': Decimal('540.0000000'),
                'deposit_amount_usdc': Decimal('300.0000000'),
                'total_due_usdc': Decimal('840.0000000'),
                'status': Rental.Status.COMPLETED,
            }
        )

        # Rental 3: Awaiting Payment
        r3, _ = Rental.objects.get_or_create(
            rental_code='PM-1094',
            defaults={
                'vehicle': created_vehicles[2],
                'renter': renter_user,
                'host': host_user,
                'start_date': today + datetime.timedelta(days=1),
                'end_date': today + datetime.timedelta(days=3),
                'total_days': 2,
                'rental_amount_usdc': Decimal('440.0000000'),
                'deposit_amount_usdc': Decimal('350.0000000'),
                'total_due_usdc': Decimal('790.0000000'),
                'status': Rental.Status.AWAITING_PAYMENT,
            }
        )

        # 6. Escrow records
        SmartContractEscrow.objects.get_or_create(
            rental=r1,
            defaults={
                'contract_id': 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
                'agreement_symbol': 'PM8921',
                'token_address': 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
                'total_locked_usdc': Decimal('1400.0000000'),
                'rental_fee_usdc': Decimal('900.0000000'),
                'deposit_fee_usdc': Decimal('500.0000000'),
                'status': SmartContractEscrow.OnChainStatus.FUNDED,
                'deposit_tx_hash': '4f9b8a8292cbb3e85e1358b532924151e2bc682390a72ad481b7e6840742d8d8',
                'funded_at': timezone.now() - datetime.timedelta(days=1),
            }
        )

        SmartContractEscrow.objects.get_or_create(
            rental=r2,
            defaults={
                'contract_id': 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
                'agreement_symbol': 'PM4412',
                'token_address': 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
                'total_locked_usdc': Decimal('840.0000000'),
                'rental_fee_usdc': Decimal('540.0000000'),
                'deposit_fee_usdc': Decimal('300.0000000'),
                'status': SmartContractEscrow.OnChainStatus.COMPLETED,
                'deposit_tx_hash': '3c1b8a8292cbb3e85e1358b532924151e2bc682390a72ad481b7e6840742a77a',
                'settlement_tx_hash': '7e9b8a8292cbb3e85e1358b532924151e2bc682390a72ad481b7e6840742b88b',
                'funded_at': timezone.now() - datetime.timedelta(days=7),
                'settled_at': timezone.now() - datetime.timedelta(days=4),
            }
        )

        # 7. Host Payouts
        HostPayout.objects.get_or_create(
            rental=r2,
            host=host_user,
            defaults={
                'gross_rental_usdc': Decimal('540.0000000'),
                'platform_fee_usdc': Decimal('54.0000000'),
                'net_payout_usdc': Decimal('486.0000000'),
                'status': HostPayout.Status.COMPLETED,
                'tx_hash': '9a8b8a8292cbb3e85e1358b532924151e2bc682390a72ad481b7e6840742c99c',
                'settled_at': timezone.now() - datetime.timedelta(days=4),
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully populated PayarMove database!'))
        self.stdout.write(self.style.SUCCESS('Test Credentials:'))
        self.stdout.write(self.style.SUCCESS('  - Renter: renter@payarmove.com / Password123! (Tier 2 Verified)'))
        self.stdout.write(self.style.SUCCESS('  - Host:   host@payarmove.com / Password123! (Tier 2 Verified)'))
        self.stdout.write(self.style.SUCCESS('  - Admin:  admin@payarmove.com / Password123!'))
