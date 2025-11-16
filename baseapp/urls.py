from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('search_autocomplete/', views.search_autocomplete,
         name='search_autocomplete'),
    path('searched/', views.searched, name='searched'),
    path('sectors', views.sectors, name='sectors'),
    path('sectors/<str:name>/', views.sector, name='sector'),
    path('industry/<str:name>/', views.industry, name='industry'),
]
