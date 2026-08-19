from django.urls import path
from . import views

urlpatterns = [
    path('', views.WatchlistListView.as_view(), name='watchlist_list'),
]
