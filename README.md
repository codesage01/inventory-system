# InvTrack — Inventory & Order Management System

A full-stack containerized Inventory & Order Management System built with FastAPI, React, PostgreSQL, and Docker.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python + FastAPI |
| Frontend | React (JavaScript) |
| Database | PostgreSQL |
| Containerization | Docker |
| Orchestration | Docker Compose |

---

## Quick Start (Docker Compose)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### 1. Clone / Extract the project

```bash
cd inventory-system
```

### 2. Create environment file

```bash
cp .env.example .env
# Edit .env if you want custom passwords
```

### 3. Run the entire stack

```bash
docker compose up --build
```

Wait ~60 seconds for all services to start.

### 4. Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database.py          # DB connection & session
│   │   ├── models/
│   │   │   └── models.py        # SQLAlchemy ORM models
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   └── routes/
│   │       ├── products.py      # Product CRUD endpoints
│   │       ├── customers.py     # Customer CRUD endpoints
│   │       └── orders.py        # Order management endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.js               # Root component + routing
│   │   ├── index.js
│   │   ├── index.css            # Global styles
│   │   ├── services/
│   │   │   └── api.js           # Axios API calls
│   │   └── pages/
│   │       ├── Dashboard.js     # Stats + low stock + recent orders
│   │       ├── Products.js      # Product CRUD UI
│   │       ├── Customers.js     # Customer management UI
│   │       └── Orders.js        # Order creation and tracking
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /products/ | Create product |
| GET | /products/ | List all products |
| GET | /products/{id} | Get product by ID |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /customers/ | Create customer |
| GET | /customers/ | List all customers |
| GET | /customers/{id} | Get customer by ID |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders/ | Create order |
| GET | /orders/ | List all orders |
| GET | /orders/{id} | Get order by ID |
| DELETE | /orders/{id} | Cancel order |

---

## Business Logic

- Product SKU is unique
- Customer email is unique
- Product quantity cannot go negative
- Orders are rejected if stock is insufficient
- Creating an order automatically reduces stock
- Cancelling an order restores stock
- Total order amount is calculated automatically by the backend

---

## Deployment

### Backend (Render / Railway / Fly.io)
1. Push code to GitHub
2. Connect repo on your chosen platform
3. Set environment variable: `DATABASE_URL=<your-postgres-url>`
4. Deploy from the `backend/` directory

### Frontend (Vercel / Netlify)
1. Push code to GitHub
2. Connect repo, set root to `frontend/`
3. Set environment variable: `REACT_APP_API_URL=<your-backend-url>`
4. Deploy

### Docker Hub (Backend Image)
```bash
docker build -t yourusername/inventory-backend:latest ./backend
docker push yourusername/inventory-backend:latest
```

---

## Development (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set DATABASE_URL in environment
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## Stopping the App

```bash
docker compose down           # Stop containers
docker compose down -v        # Stop and delete database volume
```
