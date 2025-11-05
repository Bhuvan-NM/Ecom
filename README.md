# Ecom Analytics Platform

A full-stack e-commerce management platform that pairs a polished storefront with a data-rich admin experience. The project showcases a modern React/Vite frontend, an Express + MongoDB API, and analytics tooling that highlights your ability to ship production-ready dashboards, authentication, and inventory workflows recruiters can explore end-to-end.

## ✨ Highlights
- **Responsive customer experience** with animated navigation, authentication modals, and a welcoming landing page implemented in React 19 with Vite and Framer Motion.【F:frontend/src/components/NavBar.tsx†L1-L132】【F:frontend/src/pages/Home.tsx†L1-L17】
- **Role-aware authentication** powered by JWT, HTTP-only cookies, and context-based session management across frontend and backend.【F:backend/routes/authRoute.js†L1-L118】【F:frontend/src/components/AuthContext.tsx†L1-L85】
- **Executive-grade analytics** featuring configurable ranges, cached API calls, data cards, and Chart.js visualizations fed by aggregated MongoDB pipelines.【F:frontend/src/subPages/adminPages/Dashboard.tsx†L1-L149】【F:backend/services/SalesReportGen.js†L1-L171】
- **Inventory lifecycle tooling** that supports create/edit/delete, smart restocking, and dynamic filters against a robust Express API.【F:backend/routes/inventoryRoute.js†L1-L205】【F:frontend/src/subPages/adminPages/Inventory.tsx†L1-L120】
- **Production-ready configuration** with environment-aware API clients, CORS controls, and seeding scripts capable of generating millions of data points for demos.【F:frontend/src/lib/api.ts†L1-L33】【F:backend/server.js†L1-L67】【F:backend/testScripts/seedRandomData.js†L1-L120】

## 🧩 Architecture
```
Ecom/
├── backend/         # Express API, Mongo models, auth & inventory routes
│   ├── models/      # Item, Sale, Restock, and User schemas
│   ├── routes/      # Auth, reporting, and inventory REST endpoints
│   ├── services/    # Sales analytics & aggregation logic
│   └── testScripts/ # Seeders and reporting scripts for local demos
├── frontend/        # React 19 + Vite app
│   ├── src/components/   # Shared UI (NavBar, DataCard, LineGraph, etc.)
│   ├── src/pages/        # Customer, account, and admin experiences
│   ├── src/subPages/     # Admin dashboard modules (analytics, inventory)
│   └── src/lib/          # API client and utilities
└── README.md
```

## 🛠️ Tech Stack
| Layer | Technologies |
| ----- | ------------ |
| Frontend | React 19, TypeScript, Vite, Chart.js, Framer Motion, SCSS modules | 
| Backend | Node.js, Express, Mongoose, JWT, bcrypt, cookie-parser | 
| Database | MongoDB Atlas or self-hosted MongoDB |
| Tooling | Nodemon, Axios, dotenv, Playwright-ready Vite dev server |

Tech choices are documented in `package.json` files across the monorepo.【F:frontend/package.json†L1-L65】【F:backend/package.json†L1-L23】【F:src/package.json†L1-L60】

## 🚀 Getting Started
1. **Clone & install dependencies**
   ```bash
   git clone <repo-url>
   cd Ecom
   npm install --prefix backend
   npm install --prefix frontend
   ```
2. **Configure environment variables**
   Create `backend/.env` with:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster-url/db
   JWT_SECRET=super-secret-key
   FRONTEND_URL=http://localhost:5173
   PORT=1337
   ```
   Optional: `RENDER_EXTERNAL_URL` when deploying backend on Render for CORS whitelisting.【F:backend/server.js†L17-L49】

   Create `frontend/.env` with:
   ```env
   VITE_API_BASE_URL=http://localhost:1337
   VITE_API_BASE_URL_DEV=http://localhost:1337
   ```
   The API client automatically normalizes these values depending on dev/prod runtime.【F:frontend/src/lib/api.ts†L1-L33】

3. **Run services locally**
   ```bash
   # Terminal 1 – API & Mongo integration
   npm run dev --prefix backend

   # Terminal 2 – Frontend UI
   npm run dev --prefix frontend
   ```
   The backend binds to `0.0.0.0:1337` by default and serves the production build from `/frontend/dist` when deployed.【F:backend/server.js†L37-L64】

## 📊 Demo Data & Scripts
Kickstart demos with the seeding utilities under `backend/testScripts/`:
```bash
node backend/testScripts/seedRandomData.js
```
The script generates thousands of products and tens of thousands of sales with realistic distributions and date ranges, letting the dashboard surface meaningful trends immediately.【F:backend/testScripts/seedRandomData.js†L1-L120】

Additional scripts cover targeted scenarios such as single-item creation, sales, restocks, and report testing—perfect for interview walkthroughs.

## 🔐 Key Features in Depth
- **Authentication & Authorization** – Registration, login, profile updates, and admin gating leverage JWTs, hashed passwords, and middleware checks before exposing analytics endpoints.【F:backend/routes/authRoute.js†L1-L146】
- **Sales Insights** – Aggregation pipelines compute revenue, profit, order volumes, and time-series metrics for multiple ranges, returned through `/api/reports` endpoints consumed by the dashboard UI.【F:backend/services/SalesReportGen.js†L1-L225】【F:backend/routes/reportRoute.js†L1-L56】
- **Inventory Operations** – REST endpoints expose pagination, search, filtering, and price/stock slicing, while the React admin panel handles validation, optimistic state, and restock workflows with modal-driven UX.【F:backend/routes/inventoryRoute.js†L1-L205】【F:frontend/src/subPages/adminPages/Inventory.tsx†L1-L120】
- **Data Visualization** – `DataCard` and `LineGraph` components provide reusable primitives for KPI cards with trend badges and responsive charts backed by Chart.js.【F:frontend/src/components/DataCard.tsx†L1-L85】【F:frontend/src/components/LineGraph.tsx†L1-L42】

## 📦 API Overview
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/auth/register` | Create new user with hashed password |
| `POST` | `/auth/login` | Authenticate & receive JWT + HTTP-only cookie |
| `PUT`  | `/auth/update` | Update profile details, optionally password |
| `GET`  | `/auth/me` | Retrieve authenticated profile |
| `GET`  | `/auth/admin/overview` | Guarded admin check |
| `GET`  | `/api/inventory` | Search, filter, and paginate products |
| `POST` | `/api/inventory` | Create product |
| `PUT`  | `/api/inventory/:id` | Update product |
| `DELETE` | `/api/inventory/:id` | Delete product |
| `POST` | `/api/inventory/restock` | Apply restock & adjust inventory |
| `POST` | `/api/inventory/sale` | Record a sale |
| `GET`  | `/api/reports/sales-summary` | KPI summary (day/week/month/year) |
| `GET`  | `/api/reports/sales-metrics?range=` | Time-series metrics for dashboard |
| `GET`  | `/api/reports/profit` | Revenue vs cost aggregates |
| `GET`  | `/api/reports/restocks` | Monthly restock totals |
| `GET`  | `/api/reports/low-stock` | Items needing restock |
