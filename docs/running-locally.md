# Running TradeNet Locally for Development

This guide provides step-by-step instructions for setting up and running TradeNet locally on your development machine.

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- **Python 3.10+** (verify with `python --version`)
- **Node.js 18+** and **npm** (verify with `node --version` and `npm --version`)
- **Git**
- *(Optional)* **Redis** (required only if running Celery background worker tasks locally)

---

## 🚀 Quick Start Summary

```bash
# 1. Start Backend (Terminal 1)
cd backend
python manage.py migrate
python manage.py runserver

# 2. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

---

## 🛠️ Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ShivanshKansal19/TradeNet.git
cd TradeNet
```

---

### 2. Backend Setup (Django + Celery + ML)

#### A. Activate Virtual Environment
Use the project virtual environment (or create `.venv` with `python -m venv .venv`):

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

#### B. Install Backend Dependencies
Install local development dependencies (includes Django, DRF, Prophet, pytest, black, flake8):

```bash
pip install -r backend/requirements/local.txt
```

#### C. Database Migrations
Initialize the local SQLite database schema:

```bash
python backend/manage.py migrate
```
*(The SQLite database file will be created inside `backend/db.sqlite3`)*

#### D. Create an Admin User (Optional)
To access the Django admin panel at `http://127.0.0.1:8000/admin/`:

```bash
python backend/manage.py createsuperuser
```

#### E. Start the Backend API Server
```bash
python backend/manage.py runserver
```
The Django REST API will be accessible at:
- **Root API:** [http://127.0.0.1:8000/api/v1/](http://127.0.0.1:8000/api/v1/)
- **Market Overview:** [http://127.0.0.1:8000/api/v1/market/overview/](http://127.0.0.1:8000/api/v1/market/overview/)
- **Admin Panel:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

### 3. Frontend Setup (React + TypeScript + Vite)

Open a new terminal window for the frontend.

#### A. Navigate to Frontend Directory
```bash
cd frontend
```

#### B. Configure Environment Variables
Create or verify `frontend/.env`:

```ini
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_USE_MOCK_API=false
```
> **Tip:** Set `VITE_USE_MOCK_API=true` if you want to develop UI features without running the Django backend.

#### C. Install Node Dependencies
```bash
npm install
```

#### D. Start the Vite Dev Server
```bash
npm run dev
```
The React frontend will be accessible at [http://localhost:5173/](http://localhost:5173/).

---

### 4. Background Workers (Optional)

If developing background tasks or scheduled data ingestion:

#### A. Start Redis Server
```bash
redis-server
```

#### B. Start Celery Worker
From the `backend/` directory:
```bash
cd backend
celery -A config worker -l info
```

#### C. Start Celery Beat (Scheduler)
In a separate terminal:
```bash
cd backend
celery -A config beat -l info
```

---

## 🧪 Running Tests & Linting

### Backend Tests
From the project root or `backend/` directory:
```bash
# Run Django system checks
python backend/manage.py check

# Run pytest test suite
pytest backend/tests
```

### Frontend Tests & Type Checking
From the `frontend/` directory:
```bash
cd frontend

# TypeScript check & production build test
npm run build

# Run ESLint
npm run lint
```

---

## 🔍 Common Troubleshooting

| Issue | Cause | Solution |
| --- | --- | --- |
| `ModuleNotFoundError: No module named 'apps'` | `PYTHONPATH` not including `backend/` | Run commands using `python backend/manage.py <command>` or `cd backend && python manage.py <command>`. |
| `Vite API 404 / CORS error` | Backend server not running or wrong base URL | Ensure Django server is running on `127.0.0.1:8000` and `frontend/.env` has `VITE_API_BASE_URL=http://127.0.0.1:8000`. |
| `ModuleNotFoundError: No module named 'celery'` | Virtual environment not active | Activate virtualenv with `.\.venv\Scripts\Activate.ps1` before running Python commands. |

---
[Return to Documentation Index](README.md)
