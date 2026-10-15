import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-payarmove-core-platform-key')
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True'
DEFAULT_ALLOWED_HOSTS = (
    'api.payarmove.com,'
    'payarmove.com,'
    'www.payarmove.com,'
    '173.214.172.222,'
    'localhost,'
    '127.0.0.1,'
    'web,'
    '0.0.0.0'
)
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv('DJANGO_ALLOWED_HOSTS', DEFAULT_ALLOWED_HOSTS).split(',')
    if host.strip()
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'corsheaders',

    # PayarMove Domain Apps
    'apps.core',
    'apps.authentication',
    'apps.kyc',
    'apps.rentals',
    'apps.escrow',
    'apps.payouts',
    'apps.dashboard',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

AUTH_USER_MODEL = 'authentication.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'apps.core.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 20,
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}

# Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=12),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# drf-spectacular (OpenAPI 3.0)
SPECTACULAR_SETTINGS = {
    'TITLE': 'PayarMove Pay API',
    'DESCRIPTION': (
        'Institutional cross-border mobility payments, KYC compliance, '
        'Stellar Freighter wallet connect (SEP-0010), and Soroban smart contract escrow.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api/v[0-9]',
    'SERVERS': [
        {'url': 'https://api.payarmove.com', 'description': 'Production API (api.payarmove.com)'},
        {'url': 'http://173.214.172.222:8000', 'description': 'VPS Direct IP (173.214.172.222)'},
        {'url': 'http://localhost:8000', 'description': 'Local Development'},
    ],
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() in ('true', '1')

DEFAULT_CORS_ORIGINS = [
    'https://payarmove.com',
    'https://www.payarmove.com',
    'http://payarmove.com',
    'http://www.payarmove.com',
    'https://api.payarmove.com',
    'http://api.payarmove.com',
    'http://173.214.172.222',
    'http://173.214.172.222:5173',
    'http://173.214.172.222:8000',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
]
extra_cors = os.getenv('CORS_ALLOWED_ORIGINS', '')
if extra_cors:
    DEFAULT_CORS_ORIGINS.extend([origin.strip() for origin in extra_cors.split(',') if origin.strip()])

CORS_ALLOWED_ORIGINS = list(dict.fromkeys(DEFAULT_CORS_ORIGINS))
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF Trusted Origins
DEFAULT_CSRF_ORIGINS = [
    'https://payarmove.com',
    'https://www.payarmove.com',
    'http://payarmove.com',
    'http://www.payarmove.com',
    'https://api.payarmove.com',
    'http://api.payarmove.com',
    'http://173.214.172.222',
    'http://173.214.172.222:5173',
    'http://173.214.172.222:8000',
    'http://localhost:5173',
    'http://localhost:8000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
]
extra_csrf = os.getenv('DJANGO_CSRF_TRUSTED_ORIGINS', '')
if extra_csrf:
    DEFAULT_CSRF_ORIGINS.extend([origin.strip() for origin in extra_csrf.split(',') if origin.strip()])

CSRF_TRUSTED_ORIGINS = list(dict.fromkeys(DEFAULT_CSRF_ORIGINS))

# Reverse Proxy / SSL Header Passthrough
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Redis & Celery
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://127.0.0.1:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://127.0.0.1:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Stellar & Soroban Config
STELLAR_NETWORK = os.getenv('STELLAR_NETWORK', 'TESTNET')
STELLAR_HORIZON_URL = os.getenv('STELLAR_HORIZON_URL', 'https://horizon-testnet.stellar.org')
STELLAR_SOROBAN_RPC_URL = os.getenv('STELLAR_SOROBAN_RPC_URL', 'https://soroban-testnet.stellar.org')
STELLAR_NETWORK_PASSPHRASE = os.getenv('STELLAR_NETWORK_PASSPHRASE', 'Test SDF Network ; September 2015')
STELLAR_USDC_CODE = os.getenv('STELLAR_USDC_CODE', 'USDC')
STELLAR_USDC_ISSUER = os.getenv('STELLAR_USDC_ISSUER', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5')
STELLAR_SERVER_PUBLIC_KEY = os.getenv('STELLAR_SERVER_PUBLIC_KEY', 'GC2R34KLSLB2UMOOTPAJ7PGJUHVPYVP77DR27DZCD5CWRD3K7MQOEKLT')
STELLAR_SERVER_SECRET_KEY = os.getenv('STELLAR_SERVER_SECRET_KEY', 'SBTIF5RME2YRU7YKUMZN2JQFAGXFV2ARYJYWR4VBPNFT32BWOVCYJI5O')
SOROBAN_ESCROW_CONTRACT_ID = os.getenv('SOROBAN_ESCROW_CONTRACT_ID', 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC')
PLATFORM_FEE_PERCENTAGE = float(os.getenv('PLATFORM_FEE_PERCENTAGE', '10.0'))
