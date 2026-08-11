# Mini ERP + CRM Operations Portal - API Documentation

This document provides a comprehensive specification of all backend REST API endpoints. You can also import the included [`ERP-CRM.postman_collection.json`](./ERP-CRM.postman_collection.json) directly into Postman.

---

## Base URLs

- **Local Development**: `http://localhost:4000/api`
- **Production (Render)**: `https://erp-crm-backend-uous.onrender.com/api`

---

## Authentication & Authorization

All protected endpoints require a JWT Bearer Token in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### Roles Supported:
- `ADMIN`: Full access to all modules and user creation.
- `SALES`: Customer CRM, create & confirm sales challans.
- `WAREHOUSE`: Product management & stock movements (IN/OUT).
- `ACCOUNTS`: View-only access to customer & challan records.

---

## 1. Authentication Endpoints

### 1.1 Login User
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "admin@erp.com",
  "password": "Passw0rd!"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "name": "Admin User",
      "email": "admin@erp.com",
      "role": "ADMIN"
    }
  }
}
```

### 1.2 Get Current User Profile
- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Access**: Authenticated

### 1.3 Register User (Admin Only)
- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "name": "New Sales Rep",
  "email": "newsales@erp.com",
  "password": "Passw0rd!",
  "role": "SALES"
}
```

---

## 2. Customer CRM Endpoints

### 2.1 List Customers
- **Method**: `GET`
- **Endpoint**: `/customers?search=rajesh&status=ACTIVE&page=1&pageSize=10`
- **Access**: Authenticated

### 2.2 Get Customer Details
- **Method**: `GET`
- **Endpoint**: `/customers/:id`
- **Access**: Authenticated

### 2.3 Create Customer
- **Method**: `POST`
- **Endpoint**: `/customers`
- **Access**: Admin, Sales
- **Request Body**:
```json
{
  "name": "Apex Electronics",
  "mobile": "9876543210",
  "email": "contact@apexelectronics.com",
  "businessName": "Apex Electronics Pvt Ltd",
  "gstNumber": "27AAAAA0000A1Z5",
  "customerType": "DISTRIBUTOR",
  "address": "Commercial Hub, Mumbai",
  "status": "ACTIVE",
  "notes": "Key distributor for North zone."
}
```

### 2.4 Update Customer
- **Method**: `PUT`
- **Endpoint**: `/customers/:id`
- **Access**: Admin, Sales

### 2.5 Add Follow-up Note
- **Method**: `POST`
- **Endpoint**: `/customers/:id/followups`
- **Access**: Admin, Sales
- **Request Body**:
```json
{
  "note": "Client requested updated price catalog for bulk order."
}
```

---

## 3. Product & Inventory Endpoints

### 3.1 List Products
- **Method**: `GET`
- **Endpoint**: `/products?search=bulb&lowStock=true`
- **Access**: Authenticated

### 3.2 Create Product
- **Method**: `POST`
- **Endpoint**: `/products`
- **Access**: Admin, Warehouse
- **Request Body**:
```json
{
  "name": "Smart Switch 4-Gang",
  "sku": "PRD-101",
  "category": "Electronics",
  "unitPrice": 550.00,
  "currentStock": 100,
  "minStockAlert": 20,
  "location": "Warehouse C - Shelf 2"
}
```

### 3.3 Stock Movement (IN / OUT Audit)
- **Method**: `POST`
- **Endpoint**: `/products/:id/stock`
- **Access**: Admin, Warehouse
- **Request Body**:
```json
{
  "quantity": 50,
  "type": "IN",
  "reason": "New shipment received from vendor"
}
```

---

## 4. Sales Challan Endpoints

### 4.1 List Challans
- **Method**: `GET`
- **Endpoint**: `/challans?status=CONFIRMED&page=1`
- **Access**: Authenticated

### 4.2 Create Sales Challan
- **Method**: `POST`
- **Endpoint**: `/challans`
- **Access**: Admin, Sales
- **Request Body**:
```json
{
  "customerId": "customer-uuid-here",
  "confirm": true,
  "items": [
    {
      "productId": "product-uuid-here",
      "quantity": 5
    }
  ]
}
```

### 4.3 Confirm Draft Challan
- **Method**: `POST`
- **Endpoint**: `/challans/:id/confirm`
- **Access**: Admin, Sales

### 4.4 Cancel Challan (Restores Stock)
- **Method**: `POST`
- **Endpoint**: `/challans/:id/cancel`
- **Access**: Admin

---

## 5. Dashboard Summary Endpoint

### 5.1 Get Dashboard Statistics
- **Method**: `GET`
- **Endpoint**: `/dashboard`
- **Access**: Authenticated
