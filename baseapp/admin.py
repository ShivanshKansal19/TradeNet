from django.contrib import admin

# Register your models here.
from .models import Stock, Option

admin.site.register(Stock)
admin.site.register(Option)
