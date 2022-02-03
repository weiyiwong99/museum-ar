"""
WSGI config for project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
import socketio

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
async_mode = None
sio = socketio.Server(async_mode=async_mode)

application = get_wsgi_application()
application = socketio.WSGIApp(sio, application)
