from django.shortcuts import render
# from .models import Stock
from django.http import JsonResponse
import pandas as pd
import re
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from .utils import get_historical_stock_data, calculate_moving_average
from .utils import get_trending_stocks, fetch_sectors_data
from prophet import Prophet
from django.views.decorators.cache import cache_page
import time
from datetime import datetime
from .models import Stock, Sector

# Create your views here.


# @cache_page(60 * 10)
def home(request):
    sectors = fetch_sectors_data()
    stocks = get_trending_stocks()
    return render(request, 'home.html', {'stocks': stocks, 'sectors': sectors})


def search_autocomplete(request):
    if 'term' in request.GET:
        query = request.GET.get('term')
        symbols_list = Stock.objects.values_list('symbol', flat=True)
        filtered_symbols_list = []
        for symbol in symbols_list:
            if bool(re.match(query, symbol, re.I)):
                filtered_symbols_list.append(symbol)
        return JsonResponse(filtered_symbols_list[:10], safe=False)
    return JsonResponse([], safe=False)


@cache_page(60 * 60 * 24)
def searched(request):
    if request.method == "GET":
        searched = request.GET.get('search').upper()

        if not searched:
            return render(request, 'searched.html')

        try:
            stock_data = get_historical_stock_data(searched+".NS")
        except Exception as e:
            print(f"Error in getting historical data: {e}")
            return JsonResponse({"error": str(e)}, status=500)

        if not stock_data:
            return JsonResponse({"error": "error fetching stock data"}, status=500)

        # Prepare data for the candlestick chart
        stock_df = pd.DataFrame.from_dict(stock_data)
        stock_df = stock_df.transpose()
        stock_df['Date'] = stock_df.index

        # Resample the daily data to weekly data
        stock_df_weekly = stock_df.resample('W').agg({
            'Open': 'first',
            'High': 'max',
            'Low': 'min',
            'Close': 'last',
            'Volume': 'sum'
        })

        # AI training data
        train_df = stock_df[['Date', 'Close']]
        train_df = train_df.rename(
            columns={'Date': 'ds', 'Close': 'y'})
        train_df['ds'] = train_df['ds'].apply(
            lambda x: x.replace(tzinfo=None))
        m = Prophet()
        m.fit(train_df)
        future = m.make_future_dataframe(periods=365)
        forecast = m.predict(future)

        # Calculate 50-day moving averages for both daily and weekly data
        moving_avg_daily_21 = calculate_moving_average(
            stock_df['Close'], window=21)
        moving_avg_weekly_21 = calculate_moving_average(
            stock_df_weekly['Close'], window=21)
        moving_avg_daily_50 = calculate_moving_average(
            stock_df['Close'], window=50)
        moving_avg_weekly_50 = calculate_moving_average(
            stock_df_weekly['Close'], window=50)

        # Create a subplot with 2 rows and 1 column
        fig = make_subplots(rows=2, cols=1,
                            shared_xaxes=True,
                            vertical_spacing=0.1,
                            row_heights=[0.7, 0.3])

        # Create a daily candlestick chart using plotly
        daily_candlestick_chart = go.Candlestick(x=stock_df.index,
                                                 open=stock_df['Open'],
                                                 high=stock_df['High'],
                                                 low=stock_df['Low'],
                                                 close=stock_df['Close'],
                                                 name='Daily Candlestick')
        fig.add_trace(daily_candlestick_chart, row=1, col=1)

        # Create a weekly candlestick chart using plotly
        weekly_candlestick_chart = go.Candlestick(x=stock_df_weekly.index,
                                                  open=stock_df_weekly['Open'],
                                                  high=stock_df_weekly['High'],
                                                  low=stock_df_weekly['Low'],
                                                  close=stock_df_weekly['Close'],
                                                  name='Weekly Candlestick',
                                                  visible=False)
        fig.add_trace(weekly_candlestick_chart, row=1, col=1)

        # Create a volume bar chart using plotly
        daily_volume_bar_chart = go.Bar(x=stock_df.index,
                                        y=stock_df['Volume'],
                                        name='Volume (Daily)',
                                        marker_color='blue')
        fig.add_trace(daily_volume_bar_chart, row=2, col=1)

        # Create a weekly volume bar chart using plotly and add it to the second row
        weekly_volume_bar_chart = go.Bar(x=stock_df_weekly.index,
                                         y=stock_df_weekly['Volume'],
                                         name='Volume (Weekly)',
                                         marker_color='blue',
                                         visible=False)  # Set the color of the volume bars
        fig.add_trace(weekly_volume_bar_chart, row=2, col=1)

        # Create the daily moving average trace using plotly
        daily_moving_avg_trace_21 = go.Scatter(x=moving_avg_daily_21.index,
                                               y=moving_avg_daily_21,
                                               name='21-day Moving Average (Daily)',
                                               mode='lines',
                                               marker_color='yellow')
        fig.add_trace(daily_moving_avg_trace_21, row=1, col=1)

        # Create the weekly moving average trace using plotly
        weekly_moving_avg_trace_21 = go.Scatter(x=moving_avg_weekly_21.index,
                                                y=moving_avg_weekly_21,
                                                name='21-day Moving Average (Weekly)',
                                                mode='lines',
                                                marker_color='yellow',
                                                visible=False)
        fig.add_trace(weekly_moving_avg_trace_21, row=1, col=1)

        # Create the daily moving average trace using plotly
        daily_moving_avg_trace_50 = go.Scatter(x=moving_avg_daily_50.index,
                                               y=moving_avg_daily_50,
                                               name='50-day Moving Average (Daily)',
                                               mode='lines',
                                               marker_color='orange')
        fig.add_trace(daily_moving_avg_trace_50, row=1, col=1)

        # Create the weekly moving average trace using plotly
        weekly_moving_avg_trace_50 = go.Scatter(x=moving_avg_weekly_50.index,
                                                y=moving_avg_weekly_50,
                                                name='50-day Moving Average (Weekly)',
                                                mode='lines',
                                                marker_color='orange',
                                                visible=False)
        fig.add_trace(weekly_moving_avg_trace_50, row=1, col=1)

        # Forecast trace
        forecast_trace = go.Scatter(x=forecast['ds'],
                                    y=forecast['yhat'],
                                    name='Prediction',
                                    mode='lines',
                                    marker_color='pink')
        fig.add_trace(forecast_trace, row=1, col=1)

        forecast_trace = go.Scatter(x=forecast['ds'],
                                    y=forecast['yhat'],
                                    name='Prediction',
                                    mode='lines',
                                    marker_color='pink',
                                    visible=False)
        fig.add_trace(forecast_trace, row=1, col=1)

        # Customize the chart layout for both daily and weekly charts
        # candlestick_layout = go.Layout(
        #     title=f"Candlestick Chart for {searched}", xaxis_title="Date")
        # daily_candlestick_data = {
        #     'data': [daily_candlestick_chart], 'layout': candlestick_layout}
        # weekly_candlestick_data = {
        #     'data': [weekly_candlestick_chart], 'layout': candlestick_layout}

        # # Convert the chart data to JSON format
        # daily_candlestick_json = go.Figure(
        #     daily_candlestick_data).to_json()
        # weekly_candlestick_json = go.Figure(
        #     weekly_candlestick_data).to_json()

        # Customize the chart layout if needed
        fig.update_layout(title=f"Candlestick Chart for {searched}",
                          xaxis_title="Date",
                          yaxis_title="Price",
                          xaxis_rangeslider_visible=False,
                          height=800,
                          width=1500,
                          showlegend=True)

        # Add dropdown
        fig.update_layout(
            updatemenus=[
                dict(
                    buttons=list([
                        dict(
                            args=[
                                {"visible": [True, False, True, False]}],
                            label="Daily",
                            method="update",
                        ),
                        dict(
                            args=[
                                {"visible": [False, True, False, True]}],
                            label="Weekly",
                            method="update"
                        )
                    ]),
                    direction="down",
                    pad={"r": 10, "t": 10},
                    showactive=True,
                    x=0.1,
                    xanchor="left",
                    y=1.07,
                    yanchor="top"
                ),
            ]
        )

        # Convert the chart data to JSON format
        chart_data = fig.to_json()

        # Separate the daily and weekly volume chart data
        daily_volume_data = {
            'data': [daily_volume_bar_chart], 'layout': {}}
        weekly_volume_data = {
            'data': [weekly_volume_bar_chart], 'layout': {}}

        return render(request, 'searched.html', {
            'stock': searched,
            #     'candlestick_data': daily_candlestick_json,
            #     'weekly_candlestick_data': weekly_candlestick_json,
            # })
            'candlestick_data': chart_data
        })

    return render(request, 'searched.html')
