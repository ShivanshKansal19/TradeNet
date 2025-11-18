from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('search_autocomplete/', views.search_autocomplete,
         name='search_autocomplete'),
    path('searched/', views.searched, name='searched'),
    path('stocks/<str:ticker>/', views.stock, name='stock'),
    path('sectors', views.sectors, name='sectors'),
    path('sectors/<str:name>/', views.sector, name='sector'),
    path('sectors/<str:sector_name>/<str:name>/',
         views.industry, name='industry'),
    path('fundamental-analysis/', views.fundamental_analysis,
         name='fundamental_analysis'),
    path('technical-analysis/<str:ticker>/', views.technical_analysis,
         name='technical_analysis'),
]
