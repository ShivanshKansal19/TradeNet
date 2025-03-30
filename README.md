# TradeNet - AI-Powered Stock Prediction

[![Deployment Status](https://img.shields.io/badge/Deployed-Live-brightgreen)](https://tradenet.onrender.com)

## 🌐 Live Website

[TradeNet - AI Stock Predictions](https://tradenet.onrender.com)

## 📌 About the Project

TradeNet is an AI-powered stock prediction platform that provides insights into market trends, and future price predictions using machine learning algorithms.

## 🚀 Features

- 📈 Real-time stock data updates
- 🤖 AI-powered price predictions
- 🔥 Trending stocks and market analysis
- 📊 Interactive data visualizations

## 🛠️ Tech Stack

- **Backend:** Django, Django REST Framework
- **Frontend:** HTML, CSS, JavaScript
- **Database:** PostgreSQL / SQLite
- **Hosting:** Render (Free Tier)
- **ML Models:** Prophet

## 📦 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ShivanshKansal19/TradeNet.git
cd TradeNet
```

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Run Migrations

```bash
python manage.py migrate
```

### 4️⃣ Start the Server

```bash
python manage.py runserver
```

Visit `http://127.0.0.1:8000/` to access the app locally.

## 🚢 Deployment on Render

### Start Command for Render:

```bash
gunicorn TradeNet.wsgi:application --bind 0.0.0.0:$PORT
```

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss any major changes.

## 📜 License

This project is licensed under the MIT License.

---

💡 **Created by [Shivansh Kansal](https://github.com/ShivanshKansal19)**
