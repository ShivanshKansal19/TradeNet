import decimal
from decimal import Decimal
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Portfolio, PortfolioHolding, Transaction
from .serializers import PortfolioSerializer, PortfolioHoldingSerializer, TransactionSerializer
from .analytics import calculate_portfolio_analytics
from apps.stocks.models import Stock

class PortfolioListCreateView(generics.ListCreateAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PortfolioSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)

class PortfolioHoldingManageView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        portfolio = get_object_or_404(Portfolio, id=pk, user=request.user)
        stock_id = request.data.get("stock_id")
        symbol = request.data.get("symbol")

        if not stock_id and not symbol:
            return Response(
                {"detail": "Provide stock_id or symbol to add holding."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = Decimal(str(request.data.get("quantity", 0)))
            average_buy_price = Decimal(str(request.data.get("average_buy_price", 0)))
        except (ValueError, TypeError, decimal.InvalidOperation):
            return Response(
                {"detail": "Invalid quantity or average_buy_price format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= Decimal("0") or average_buy_price < Decimal("0"):
            return Response(
                {"detail": "Quantity must be greater than 0 and average buy price cannot be negative."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if symbol and not stock_id:
            stock = get_object_or_404(Stock, symbol__iexact=str(symbol).replace(".NS", "").strip())
        else:
            stock = get_object_or_404(Stock, id=stock_id)

        holding, created = PortfolioHolding.objects.get_or_create(
            portfolio=portfolio,
            stock=stock,
            defaults={"quantity": quantity, "average_buy_price": average_buy_price},
        )
        if not created:
            holding.quantity = quantity
            holding.average_buy_price = average_buy_price
            holding.save()

        # Log transaction
        Transaction.objects.create(
            portfolio=portfolio,
            stock=stock,
            transaction_type="BUY",
            quantity=quantity,
            price=average_buy_price,
            notes="Position added/updated",
        )

        return Response(PortfolioHoldingSerializer(holding).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, pk):
        portfolio = get_object_or_404(Portfolio, id=pk, user=request.user)
        holding_id = request.query_params.get("holding_id") or request.data.get("holding_id")
        symbol = request.query_params.get("symbol") or request.data.get("symbol")

        if holding_id:
            holding = get_object_or_404(PortfolioHolding, id=holding_id, portfolio=portfolio)
            holding.delete()
        elif symbol:
            holding = get_object_or_404(
                PortfolioHolding,
                portfolio=portfolio,
                stock__symbol__iexact=str(symbol).replace(".NS", "").strip(),
            )
            holding.delete()
        else:
            return Response(
                {"detail": "Provide holding_id or symbol to remove holding."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

class PortfolioAnalyticsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        portfolio = get_object_or_404(Portfolio, id=pk, user=request.user)
        analytics_data = calculate_portfolio_analytics(portfolio)
        return Response(analytics_data)
