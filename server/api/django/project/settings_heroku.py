import os
# pylint: disable=E0402
from . import settings

DEBUG = False

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
        'LOCATION': 'django_cache',
    }
}

SETTINGS_HEROKU = True
