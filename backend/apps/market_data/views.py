from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
from .models import Sector, MarketIndex, SectorPerformance
from .serializers import SectorSerializer, MarketIndexSerializer, SectorPerformanceSerializer

class MarketOverviewView(APIView):
    """Return composite market overview: status, indices, breadth, top movers."""
    def get(self, request):
        indices = MarketIndex.objects.all()
        index_data = MarketIndexSerializer(indices, many=True).data

        # Fallback default indices if DB is fresh
        if not index_data:
            index_data = [
                {'symbol': '^NSEI', 'name': 'NIFTY 50', 'current_value': '24367.50', 'change': '+132.40', 'percent_change': '0.55'},
                {'symbol': '^BSESN', 'name': 'SENSEX', 'current_value': '80120.15', 'change': '+420.10', 'percent_change': '0.53'},
                {'symbol': '^NSEBANK', 'name': 'BANK NIFTY', 'current_value': '51230.80', 'change': '+310.25', 'percent_change': '0.61'},
            ]

        data = {
            'market_status': 'open',
            'timestamp': datetime.now().isoformat(),
            'indices': index_data,
            'breadth': {
                'advances': 1420,
                'declines': 890,
                'unchanged': 110,
                'advance_percentage': 58.68,
                'decline_percentage': 36.78,
            },
            'movers': {
                'gainers': [
                    {'symbol': 'TATASTEEL', 'name': 'Tata Steel Ltd.', 'price': 158.40, 'change': 6.20, 'percent_change': 4.07, 'volume': 34500000},
                    {'symbol': 'INFY', 'name': 'Infosys Ltd.', 'price': 1845.00, 'change': 42.10, 'percent_change': 2.34, 'volume': 12300000},
                ],
                'losers': [
                    {'symbol': 'HDFCBANK', 'name': 'HDFC Bank Ltd.', 'price': 1620.00, 'change': -18.50, 'percent_change': -1.13, 'volume': 18400000},
                ]
            }
        }
        return Response(data)

class SectorListView(APIView):
    """List all market sectors and recent performance."""
    def get(self, request):
        sectors = Sector.objects.all()
        serializer = SectorSerializer(sectors, many=True)
        return Response(serializer.data)
