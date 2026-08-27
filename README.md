# TradeNet - AI-Powered Stock Research & Prediction Platform

TradeNet is a modern, full-stack stock research and decision-support platform for Indian equities. It provides real-time market data, technical and fundamental indicators, short-horizon walk-forward ML forecasting, watchlists, alerts, comparison tools, and portfolio insights.

## 🌐 Live Website
[TradeNet - AI Stock Predictions](https://tradenet.shivanshkansal.me)

## 📚 Documentation
Comprehensive architectural and system design documentation is available in the [`docs/`](docs/README.md) directory:
- [Architecture & Data Flow](docs/architecture.md)
- [Project File Structure](docs/project-structure.md)
- [Local Development Guide](docs/running-locally.md)
- [Frontend Design](docs/frontend-design.md)
- [API Design & Routes](docs/api-design.md)
- [Data Model & ERD](docs/data-model.md)
- [Prediction & ML Pipeline](docs/prediction-system.md)
- [Background Tasks & Scheduling](docs/background-jobs.md)
- [Security & Reliability](docs/security-and-reliability.md)
- [Deployment & Roadmap](docs/deployment-and-roadmap.md)

---

## 🛠️ Tech Stack

- **Backend:** Python, Django, Django REST Framework, Celery, Redis
- **ML / Quant Engine:** Quantile Ensemble (Scikit-Learn), Pandas, NumPy
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router
- **Database:** PostgreSQL / SQLite
- **Deployment:** Render, Gunicorn, WhiteNoise

---

## 📦 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ShivanshKansal19/TradeNet.git
cd TradeNet
```

### 2️⃣ Backend Setup
```bash
# Install Python dependencies
pip install -r backend/requirements/local.txt

# Run migrations
python backend/manage.py migrate

# Start the Django API server
python backend/manage.py runserver
```
The API is available at `http://127.0.0.1:8000/api/v1/`.

### 3️⃣ Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
The React app will be accessible at `http://localhost:5173/`.

---

## 🚢 Deployment on Render

**Start Command for Render:**
```bash
python backend/manage.py collectstatic --noinput && gunicorn --chdir backend config.wsgi:application --bind 0.0.0.0:$PORT
```

---

## 📜 License
This project is licensed under the MIT License.

---
💡 **Created by [Shivansh Kansal](https://github.com/ShivanshKansal19)**
