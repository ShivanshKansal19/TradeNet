import os
from .base import *

DEBUG = False

SECRET_KEY = os.environ.get('SECRET_KEY')

ALLOWED_HOSTS = ['tradenet.onrender.com', 'localhost', '127.0.0.1']

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
