import os
from .base import *

DEBUG = True

# Database: use PostgreSQL if configured and accessible, otherwise fallback to SQLite for easy local test/dev
DB_ENGINE = os.getenv('DB_ENGINE', 'django.db.backends.postgresql')

if os.getenv('USE_SQLITE', 'False').lower() in ('true', '1') or os.getenv('POSTGRES_HOST') in ('sqlite', None, ''):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('POSTGRES_DB', 'payarmove_db'),
            'USER': os.getenv('POSTGRES_USER', 'payarmove_user'),
            'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'payarmove_secret'),
            'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
            'PORT': os.getenv('POSTGRES_PORT', '5432'),
        }
    }
