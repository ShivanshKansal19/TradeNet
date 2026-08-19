from django.urls import path
from . import views

urlpatterns = [
    path('<str:symbol>/', views.TechnicalIndicatorDetailView.as_view(), name='technical_detail'),
]
