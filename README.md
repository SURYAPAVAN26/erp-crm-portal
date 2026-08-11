# Mini ERP + CRM Operations Portal

A full-stack wholesale/distribution operations system covering customer CRM, product & inventory management, and a sales-challan workflow with role-based access control.

Built for: **Full Stack Developer Case Study**

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, TypeScript, Express.js |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT (JSON Web Tokens), bcrypt password hashing |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Frontend state | Zustand (auth), local component state |
| Validation | Zod (backend request validation) |

---

## 2. Project Structure

```
erp-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seeds 4 role users + sample data
│   ├── src/
│   │   ├── config/            # env, prisma client
│   │   ├── middleware/        # auth, validation, error handling
│   │   ├── controllers/       # business logic per module
│   │   ├── routes/            # Express routers
│   │   ├── validators/        # Zod schemas
│   │   └── utils/             # AppError, JWT, pagination
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios service layer
│   │   ├── components/         # Layout, UI primitives, ProtectedRoute
│   │   ├── pages/               # customers/, products/, challans/, Login, Dashboard
│   │   ├── store/               # Zustand auth store
│   │   └── types/               # Shared TS types
│   ├── .env.example
│   └── package.json
├── docker-compose.yml           # Local PostgreSQL for development
└── ERP-CRM.postman_collection.json
```

---

## 3. Core Modules Implemented

### Authentication & Roles
- JWT login, 8-hour token expiry.
- Four roles: `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.
- Route-level and action-level role guards (e.g. only Admin/Warehouse can adjust stock; only Admin/Sales can confirm a challan).

### Customer CRM
- Add / edit / search / view customer detail.
- Fields: name, mobile, email, business name, GST (optional), type (Retail/Wholesale/Distributor), address, status (Lead/Active/Inactive), follow-up date, notes.
- Follow-up notes are timestamped and attributed to the user who added them.

### Product & Inventory
- Add / edit products with SKU, category, price, min-stock alert, location.
- **Stock is never edited directly.** Every change goes through a `POST /products/:id/stock` endpoint that writes an audit row to `StockMovement` (type IN/OUT, reason, user, timestamp) and atomically updates `currentStock`.
- Low-stock filter surfaces any product where `currentStock <= minStockAlert`.

### Sales Challan
- Select customer, add multiple product lines with quantity.
- Save as **Draft** or **Confirm** immediately.
- Confirming a challan:
  - Deducts stock for every line item **inside a single database transaction** — if any one item has insufficient stock, the whole confirmation is rolled back (no partial deduction).
  - Stock is never allowed to go negative; the API returns a `400` with a clear message naming the product and available quantity.
  - Each line item stores a **snapshot** of product name, SKU, and unit price at the time of sale, so historical challans stay accurate even if the product is later renamed or repriced.
- Challan numbers are auto-generated and sequential per year, e.g. `CH-2026-00001`.
- Cancelling a **Confirmed** challan automatically restores the deducted stock (with its own audit trail).

### Dashboard
- Summary cards: total customers, active leads, total products, low-stock count, draft/confirmed challans.
- Recent challans list.

---

## 4. API Overview

All endpoints are prefixed with `/api`. Full request/response examples are in the included Postman collection (`ERP-CRM.postman_collection.json`).

```
POST   /auth/login
POST   /auth/register            (Admin only)
GET    /auth/me

GET    /customers                (search, status, customerType, page, pageSize)
GET    /customers/:id
POST   /customers
PUT    /customers/:id
POST   /customers/:id/followups

GET    /products                 (search, category, lowStock, page, pageSize)
GET    /products/:id
POST   /products
PUT    /products/:id
POST   /products/:id/stock

GET    /challans                 (status, customerId, search, page, pageSize)
GET    /challans/:id
POST   /challans
POST   /challans/:id/confirm
POST   /challans/:id/cancel

GET    /dashboard/summary
GET    /health
```

Every endpoint validates input with Zod, returns proper HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`), and responds in the shape:
```json
{ "success": true, "data": { ... }, "meta": { "total": 1, "page": 1, "pageSize": 20, "totalPages": 1 } }
```

---

## 5. Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use the included Docker Compose)

### Step 1 — Start PostgreSQL
```bash
docker compose up -d
```
This starts Postgres on `localhost:5432` with database `erp_crm`, user/password `postgres`/`postgres`.

*(If you don't use Docker, install Postgres locally and create a database named `erp_crm`, then update `DATABASE_URL` in the next step.)*

### Step 2 — Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # creates login users + sample data
npm run dev          # starts on http://localhost:4000
```

### Step 3 — Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev          # starts on http://localhost:5173
```

Open `http://localhost:5173` and log in with any of the seeded accounts below.

### Test login credentials (all roles, password: `Passw0rd!`)
| Role | Email |
|---|---|
| Admin | admin@erp.com |
| Sales | sales@erp.com |
| Warehouse | warehouse@erp.com |
| Accounts | accounts@erp.com |

---

## 6. Environment Variables

**backend/.env**
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/erp_crm?schema=public
JWT_SECRET=change-this-to-a-long-random-string-in-production
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env**
```
VITE_API_URL=http://localhost:4000/api
```

No secrets are committed — both `.env` files are git-ignored, and `.env.example` files document every variable needed.

---

## 7. Deployment

The system deploys cleanly to any free-tier host since it's a standard Node.js API + static React build + Postgres database:

| Component | Suggested host | Notes |
|---|---|---|
| Frontend | Vercel / Netlify | Build command `npm run build`, output dir `dist`, set `VITE_API_URL` env var to the deployed backend URL |
| Backend | Render / Railway / Fly.io | Build: `npm install && npm run build && npx prisma migrate deploy`, Start: `npm start`, set all backend env vars |
| Database | Supabase / Neon / Render Postgres | Copy the connection string into `DATABASE_URL` |

Steps for Render (example):
1. Push this repo to GitHub.
2. Create a Postgres instance on Neon/Supabase, copy the connection string.
3. Create a Render Web Service pointed at `/backend`, set env vars, build command `npm install && npm run build && npx prisma migrate deploy`, start command `npm start`.
4. Create a Vercel project pointed at `/frontend`, set `VITE_API_URL` to the Render backend's public URL, deploy.
5. Update the backend's `CORS_ORIGIN` env var to the deployed frontend URL and redeploy.

AWS deployment (EC2 + RDS) follows the same pattern: provision an RDS Postgres instance, run the same build/start commands on an EC2 instance (or behind PM2 / a Docker container), and serve the frontend build via S3 + CloudFront or a small Nginx server. This was treated as the bonus/optional path per the assignment brief and not set up by default to avoid incurring any cost.

---

## 8. Architecture Notes

- **Layered backend**: routes → validators (Zod) → controllers → Prisma. No business logic lives in routes; controllers own it, which keeps validation, auth, and side effects easy to trace and test independently.
- **Transactional integrity**: any operation that touches stock (challan confirm, challan cancel, direct stock movement) runs inside a Prisma `$transaction`, so a partial failure never leaves stock or challan status inconsistent.
- **Audit trail over mutation**: `currentStock` is treated as a derived value. It's only ever changed alongside a `StockMovement` row, so there's always a reconstructable history of why the number is what it is.
- **Snapshotting on challans**: `ChallanItem` copies `productNameSnapshot` / `productSkuSnapshot` / `unitPriceSnapshot` at creation time rather than only storing a foreign key, so historical documents remain accurate reference points even after a product's price or name changes later.
- **Centralized error handling**: a single Express error-handling middleware normalizes `AppError` instances, Prisma known-request errors (e.g. unique constraint → 409), and validation errors into a consistent JSON shape.
- **Frontend**: a thin Axios client with a request interceptor injects the JWT and a response interceptor redirects to `/login` on `401`. Pages are grouped by module (`customers/`, `products/`, `challans/`) mirroring the backend's structure, so the mental model stays consistent across the stack.

---

## 9. Known Limitations / Not Implemented

Being transparent about what's out of scope for this submission:

- **Purchase orders** are not implemented — the brief's core-module list centers on customers, products/inventory, and sales challans; purchase orders were mentioned only in the business context, not the required modules section.
- **Invoice generation / PDF export** (bonus item) is not implemented.
- **Docker setup for the app itself** — only the local Postgres dependency is dockerized; the Node/React apps are not containerized (bonus item).
- **GitHub Actions CI/CD** (bonus item) is not set up.
- **Product image upload to S3** (bonus item) is not implemented.
- **Automated tests** (unit/integration) are not included given the assignment timeframe — validation and business-logic correctness were instead prioritized in the controller design (transactional stock handling, negative-stock prevention, snapshotting).
- **Pagination on the frontend UI** — the backend fully supports `page`/`pageSize`, but the current list pages fetch a single page (default size) without pager controls in the UI; this would be a quick addition if needed.
- **Multi-tenant / company-switching** is not in scope — this is a single-company operations portal as specified.

## 10. Assumptions Made

- One company/tenant per deployment (no multi-tenancy).
- "Warehouse" role can view (not edit) customers, since the brief didn't specify CRM access for that role, but they need product/stock visibility to fulfill challans.
- "Accounts" role has read-only access to customers, products, and challans (no create/edit), since their described function is financial oversight rather than data entry.
- Any authenticated role can confirm a challan on the warehouse side (dispatch confirmation), but only Admin/Sales can create or cancel challans, reflecting a typical sales-initiates / warehouse-fulfills flow.
- GST number is optional per the brief; email is optional on customers since some small retail leads may only have a phone number.
