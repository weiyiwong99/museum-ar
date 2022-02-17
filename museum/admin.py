from django.contrib import admin
from .models import Artifact, Material, Survey

# Register your models here.

admin.site.register([Artifact, Material, Survey])