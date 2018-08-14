import os
from . import settings

DEBUG = False

SECRET_KEY = os.getenv('SECRET_KEY')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRESQL_ADDON_DB'),
        'USER': os.getenv('POSTGRESQL_ADDON_USER'),
        'PASSWORD': os.getenv('POSTGRESQL_ADDON_PASSWORD'),
        'HOST': os.getenv('POSTGRESQL_ADDON_HOST'),
        'PORT': os.getenv('POSTGRESQL_ADDON_PORT'),
    }
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'django_cache',
    }
}

SETTINGS_CLEVER_CLOUD = True
