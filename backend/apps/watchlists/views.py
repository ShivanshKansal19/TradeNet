from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Watchlist, WatchlistItem
from .serializers import WatchlistSerializer, WatchlistItemSerializer
from apps.stocks.models import Stock

class WatchlistListCreateView(generics.ListCreateAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WatchlistDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WatchlistSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

class WatchlistItemAddDeleteView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        watchlist = get_object_or_404(Watchlist, id=pk, user=request.user)
        stock_id = request.data.get("stock_id")
        stock_symbol = request.data.get("symbol")
        notes = request.data.get("notes", "")

        if stock_symbol and not stock_id:
            stock = get_object_or_404(Stock, symbol__iexact=stock_symbol.replace(".NS", ""))
        else:
            stock = get_object_or_404(Stock, id=stock_id)

        item, created = WatchlistItem.objects.get_or_create(
            watchlist=watchlist, stock=stock, defaults={"notes": notes}
        )
        if not created and notes:
            item.notes = notes
            item.save()

        return Response(
            {"status": "success", "item": WatchlistItemSerializer(item).data},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        watchlist = get_object_or_404(Watchlist, id=pk, user=request.user)
        item_id = request.query_params.get("item_id")
        stock_symbol = request.query_params.get("symbol")

        if item_id:
            item = get_object_or_404(WatchlistItem, id=item_id, watchlist=watchlist)
            item.delete()
        elif stock_symbol:
            item = get_object_or_404(
                WatchlistItem,
                watchlist=watchlist,
                stock__symbol__iexact=stock_symbol.replace(".NS", ""),
            )
            item.delete()
        else:
            return Response(
                {"detail": "Must provide item_id or symbol query param."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
