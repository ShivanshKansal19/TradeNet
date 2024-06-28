from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('search_autocomplete/', views.search_autocomplete,
         name='search_autocomplete'),
    path('searched/', views.searched, name='searched')
    # Add other URLs for different pages if needed
]
