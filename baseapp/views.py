from django.shortcuts import render, get_object_or_404
# from .models import Stock
from django.http import JsonResponse
import pandas as pd
import re
import yfinance as yf
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from dash import Dash, dcc, html
from dash.dependencies import Input, Output
from django_plotly_dash import DjangoDash
# Create your views here.


def get_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        stock_info = ticker.info
        return stock_info
    except Exception as e:
        return None


def get_historical_stock_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        stock_data = ticker.history(period='5y')
        # `stock_data` will contain historical stock data for the last 5 years
        # You can further process or filter this data as needed
        return stock_data.to_dict(orient='index')
    except Exception as e:
        return None


def calculate_moving_average(data, window=10):
    return data.rolling(window=window, min_periods=1).mean()


def home(request):
    return render(request, 'home.html')


def search_autocomplete(request):
    if 'term' in request.GET:
        query = request.GET.get('term')
        df = pd.read_csv('static/csv/Equity.csv')
        symbols_list = df['SYMBOL'].tolist()
        filtered_symbols_list = []
        for word in symbols_list:
            if bool(re.match(query, word, re.I)):
                filtered_symbols_list.append(word)
        return JsonResponse(filtered_symbols_list[:10], safe=False)
    return JsonResponse([])


def searched(request):
    if request.method == "GET":
        search_type = request.GET.get('search-type')
        searched = request.GET.get('search').upper()
        if searched:
            if search_type == "stock":
                stock_data = get_historical_stock_data(searched+".NS")
                if stock_data:
                    # Prepare data for the candlestick chart
                    stock_df = pd.DataFrame.from_dict(stock_data)
                    stock_df = stock_df.transpose()

                    # Resample the daily data to weekly data
                    stock_df_weekly = stock_df.resample('W').agg({
                        'Open': 'first',
                        'High': 'max',
                        'Low': 'min',
                        'Close': 'last',
                        'Volume': 'sum'
                    })

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
                else:
                    return JsonResponse({"error": "Error fetching stock data"}, status=500)
            elif search_type == "option":
                return render(request, 'searched.html', {'option': searched})
        return render(request, 'searched.html')
    return render(request, 'searched.html')
