# FarmDirect — Farmers' Direct Produce Marketplace Portal

A full-stack farmer-to-consumer e-commerce platform. Farmers list and manage produce, customers browse/search/order and review, and admins oversee the whole marketplace.

**Stack:** React.js (Vite) · Node.js + Express.js REST API · MySQL · JWT role-based auth

---

## 1. Project structure

```
farmdirect/
├── backend/                  Node/Express REST API
│   ├── config/db.js          MySQL connection pool
│   ├── middleware/auth.js    JWT verification + role guard
│   ├── controllers/          Business logic per resource
│   ├── routes/                REST endpoints
│   ├── schema.sql            Full DB schema + seed data
│   ├── server.js             App entry point
│   └── .env.example
└── frontend/                 React (Vite + Tailwind) SPA
    ├── src/
    │   ├── api/axios.js      Pre-configured API client (attaches JWT)
    │   ├── context/          AuthContext, CartContext
    │   ├── components/       Navbar, ProductCard, StarRating, ProtectedRoute, Footer
    │   ├── pages/             Home, Login, Register, ProductDetail, Cart, Checkout,
    │   │   ├── farmer/           MyOrders, OrderTracking
    │   │   └── admin/            FarmerDashboard | AdminDashboard
    └── .env.example
```

## 2. Roles & permissions

| Role      | Can do |
|-----------|--------|
| **Customer** | Register instantly, browse/search/filter produce, cart, checkout, simulated payment, track delivery, rate & review delivered items |
| **Farmer**   | Register (pending admin approval), add/edit/delete own products & stock, view & update status of orders containing their products |
| **Admin**    | Approve/suspend farmers, suspend customers, manage categories, remove any product/listing, view all orders, view sales dashboard (revenue, top products, category breakdown) |

Role-based access is enforced both in the UI (`ProtectedRoute`) and on the server (`authenticate` + `authorize` middleware on every sensitive route) — the API is the real gatekeeper.

## 3. Local setup

### Prerequisites
Node.js 18+, MySQL 8+ (or MySQL-compatible, e.g. MariaDB).

### Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in your MySQL credentials + a real JWT_SECRET
mysql -u root -p < schema.sql
npm run dev                # nodemon, http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL should point at the backend above
npm run dev                 # http://localhost:5173
```

### Seed accounts (from schema.sql)
All seed passwords are `Password123` — **re-hash and change these before any real deployment**.
- Admin: `admin@farmdirect.com`
- Farmer (pre-approved): `murugan@farmdirect.com`
- Customer: `divya@example.com`

> Note: the bcrypt hash shipped in `schema.sql` is a placeholder. Before first login, generate a real hash and update the seed rows:
> ```bash
> node -e "console.log(require('bcryptjs').hashSync('Password123', 10))"
> ```
> then `UPDATE users SET password_hash = '<hash>' WHERE email IN (...)`.

## 4. Core flows implemented

- **Auth:** JWT-based register/login, farmer accounts require admin approval before they can log in and list produce.
- **Catalog:** search, category filter, price sort, organic-only filter, pagination-ready API.
- **Cart → Checkout:** server-persisted cart, stock validation, transactional order placement (MySQL transaction covers order + order_items + stock decrement + payment record).
- **Orders:** multi-farmer orders split into per-farmer line items so each farmer only manages their own portion; delivery timeline (`delivery_tracking`) updates as farmers move items through `confirmed → packed → out_for_delivery → delivered`.
- **Payments:** simulated gateway (COD / UPI / card) — records a `payments` row; swap in a real gateway (Razorpay/Stripe) behind the same `payment_method`/`payment_status` fields.
- **Reviews:** customers can only review products from their own **delivered** order items (enforced server-side), one review per product per order.
- **Admin dashboard:** farmer approval queue, customer/farmer suspension, category CRUD, product moderation, full order list, sales analytics (revenue, top products, category breakdown, monthly trend).

## 5. Database schema (summary)

`users` (role-differentiated: admin/farmer/customer) · `categories` · `products` · `cart_items` · `orders` + `order_items` (split by farmer) · `delivery_tracking` · `payments` · `reviews`. Full DDL with foreign keys and seed data in `backend/schema.sql`.

## 6. Suggested GitHub workflow for collaborative development

```
main            → protected, always deployable
develop         → integration branch
feature/*       → one branch per feature (e.g. feature/farmer-dashboard)
```
Open PRs from `feature/*` into `develop`, require at least one review, squash-merge. Keep `backend/.env` and `frontend/.env` out of version control (already covered by the `.gitignore` below).

## 7. Next steps for production
- Replace simulated payments with a real gateway and webhook verification.
- Add image upload (S3/Cloudinary) instead of raw `image_url` strings.
- Add rate limiting and input validation middleware (e.g. `express-validator`, already in `package.json`) on all mutating routes.
- Add automated tests (Jest + Supertest for API, React Testing Library for frontend).
- Add refresh tokens / shorter-lived access tokens for tighter session security.
