# Case Study Submission - Mini ERP + CRM Operations Portal

This document contains all required details for evaluation as requested in the submission checklist.

---

## 1. GitHub Repository Link
- **Repository URL**: [https://github.com/SURYAPAVAN26/erp-crm-portal](https://github.com/SURYAPAVAN26/erp-crm-portal)

---

## 2. Live Frontend URL
- **Production Web Application**: [https://erp-crm-frontend-uous.onrender.com](https://erp-crm-frontend-uous.onrender.com)

---

## 3. Live Backend API URL
- **Production REST API**: [https://erp-crm-backend-uous.onrender.com/api](https://erp-crm-backend-uous.onrender.com/api)
- **Health Check**: [https://erp-crm-backend-uous.onrender.com/health](https://erp-crm-backend-uous.onrender.com/health)

---

## 4. Test Login Credentials for All Roles

*(Password for all pre-seeded accounts: `Passw0rd!`)*

| Role | Email | Access Rights |
|---|---|---|
| **Admin** | `admin@erp.com` | Full access to all modules, stock adjustments, and user registration. |
| **Sales** | `sales@erp.com` | Customer CRM, Create & Confirm Sales Challans. |
| **Warehouse** | `warehouse@erp.com` | Product catalog, Inventory stock adjustments & Audit trails. |
| **Accounts** | `accounts@erp.com` | View-only access to customer & challan data. |

---

## 5. Postman Collection & API Documentation
- **Postman Collection File**: [`ERP-CRM.postman_collection.json`](./ERP-CRM.postman_collection.json) (included in the root directory for 1-click import).
- **API Documentation**: [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) (Complete REST endpoints specification).

---

## 6. Setup & Deployment Instructions

### Local Setup
1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/SURYAPAVAN26/erp-crm-portal.git
   cd erp-crm-portal/backend && npm install
   cd ../frontend && npm install
   ```
2. **Start PostgreSQL Database** (Docker or local):
   ```bash
   docker-compose up -d
   ```
3. **Run Database Migrations & Seed**:
   ```bash
   cd backend
   npx prisma migrate dev
   npm run seed
   ```
4. **Run Application**:
   - Backend: `npm run dev` (running on `http://localhost:4000`)
   - Frontend: `npm run dev` (running on `http://localhost:5173`)

### Production Deployment (Render)
The repository includes a 1-click infrastructure blueprint (`render.yaml`).
- Push repo to GitHub -> Connect to Render as Blueprint -> Automated deployment of PostgreSQL database, Express Backend, and React Frontend.

---

## 7. Architecture & Design

```
┌─────────────────────────────────────────────────────────────┐
│                    System Architecture                      │
│                                                             │
│   ┌─────────────────────┐       ┌───────────────────────┐   │
│   │   React 19 SPA      │──────>│ Express.js REST API   │   │
│   │ (Vite + Zustand)    │ JWT   │ (TypeScript + Node)   │   │
│   └─────────────────────┘       └──────────┬────────────┘   │
│                                            │ Prisma ORM     │
│                                 ┌──────────▼────────────┐   │
│                                 │ PostgreSQL Database   │   │
│                                 └───────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Zustand for auth state.
- **Backend**: Node.js, Express.js, TypeScript, Zod request validation, Helmet security.
- **Database & ORM**: PostgreSQL database managed via Prisma ORM with atomic transactions for inventory safety.
- **Security & Integrity**:
  - Stock is never mutated directly — all stock adjustments are logged as audit rows in `StockMovement`.
  - Challan confirmation executes stock deductions inside a single database transaction (`prisma.$transaction`).
  - Historical sales snapshots ensure product price/name changes do not retroactively alter past challans.

---

## 8. Known Limitations & Future Roadmap
- **Cold Start Delay**: Render Free Tier web services enter sleep mode after 15 minutes of inactivity; the initial request requires ~15–20 seconds to wake up.
- **AWS S3 Image Uploads**: Product image upload field can be extended with AWS S3 pre-signed URLs in future updates.
- **Exporting**: PDF / Excel export for Sales Challans can be integrated using `pdfkit` / `xlsx`.
