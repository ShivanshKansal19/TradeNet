from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Alert, AlertNotification
from .serializers import AlertSerializer, AlertNotificationSerializer
from apps.stocks.models import Stock

class AlertListCreateView(generics.ListCreateAPIView):
    serializer_class = AlertSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        stock_id = self.request.data.get("stock_id")
        symbol = self.request.data.get("symbol")
        if symbol and not stock_id:
            stock = get_object_or_404(Stock, symbol__iexact=symbol.replace(".NS", ""))
        else:
            stock = get_object_or_404(Stock, id=stock_id)
        serializer.save(user=self.request.user, stock=stock)

class AlertDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AlertSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user)

class AlertNotificationListView(generics.ListAPIView):
    serializer_class = AlertNotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return AlertNotification.objects.filter(alert__user=self.request.user)
