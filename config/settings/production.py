import os
from .base import *

DEBUG = False

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'payarmove_db'),
        'USER': os.getenv('POSTGRES_USER', 'payarmove_user'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'payarmove_secret'),
        'HOST': os.getenv('POSTGRES_HOST', 'db'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}


SPECTACULAR_SETTINGS = {
    'TITLE': 'PayarMove Pay API',
    'DESCRIPTION': 'Institutional cross-border mobility payments...',
    'VERSION': '1.0.0',
    # Pin to a stable version without the import.meta bundle bug:
    'REDOC_DIST': 'https://cdn.jsdelivr.net/npm/redoc@2.1.5',
    # ... any other existing spectacular settings
}


# Reverse Proxy / SSL Termination
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'True') == 'True'
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'True') == 'True'
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# Nginx handles HTTP -> HTTPS redirects
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'

SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '31536000'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

