# Hemanth Ice Creams • Haute Glacerie & Reserve Collection

A luxury 3D e-commerce and inventory platform built with **Next.js 14 App Router**, **React Three Fiber (R3F)**, **Tailwind CSS**, and **Prisma ORM**.

---

## 🌟 Key Features

1. **Role-Isolated Architecture (RBAC)**:
   - **Central Portal Switcher (`/login`)**: Luxury gate to choose your portal.
   - **Customer Vault Login (`/login/customer`)**: 1-Click VIP Patron (*Lord Hemanth*) or Mobile OTP (`777888`). Unlocks Storefront (`/`).
   - **Master Admin Login (`/login/admin`)**: 1-Click Master Access or PIN `9999` / Secret Key. Unlocks Admin Chamber (`/admin`).
   - **Kitchen Staff Login (`/login/kitchen`)**: 1-Click Station Staff or PIN `8888`. Unlocks Cryo-Terminal (`/kitchen`).
2. **Dedicated Role Backends (MVC)**:
   - **Customer Backend (`/api/customer/*`)**: Catalog, 3D textures, 10-minute hold orders, Demo UPI payment settlement.
   - **Admin Backend (`/api/admin/*`)**: 🔐 Live Login Audit Logs, 💎 Registered Customer Directory & Lifetime Spend, 📦 SKU Inventory & 10-Min Locks, 📊 Gross Sales & Analytics.
   - **Kitchen Backend (`/api/kitchen/*`)**: ❄️ Live preparation tickets queue, batch SKU summary, and status progression (`PAID_CONFIRMED` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`).
3. **Interactive 3D Stage**:
   - 3D tub customizer in React Three Fiber with procedural canvas textures and size toggle (500g vs 1000g).
4. **Demo UPI ID Payment Mode**:
   - Merchant UPI ID: `hemanth.icecreams@okhdfcbank` with 1-click copy, dynamic deep links, and UTR tracking.
5. **Pessimistic 10-Minute Inventory Locking**:
   - Atomic holds prevent double-booking, permanent stock deduction upon UPI settlement, automated TTL rollback for expired holds.

---

## 🚀 Quick Start

### 1. Install & Setup Database
```bash
npm install
npx prisma db push
node prisma/seed.js
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Verification & Automated Tests
```bash
npm run build
node test-e2e.js
```

---

## 🌐 Portals & Credentials

| Role | Login Route | Default Credentials | Unlocked Route |
|---|---|---|---|
| **Portal Switcher** | `/login` | N/A | Visual Gateway |
| **Customer** | `/login/customer` | 1-Click VIP (*Lord Hemanth*) or Phone `+919876543210` / OTP `777888` | `/` (Storefront & 3D Stage) |
| **Master Admin** | `/login/admin` | 1-Click Master or PIN `9999` / Secret `CHEF-HEMANTH-ADMIN-2026` | `/admin` (Audit Logs, Customers, Stock) |
| **Kitchen Staff** | `/login/kitchen` | 1-Click Station or PIN `8888` | `/kitchen` (Live Ticket Queue) |
