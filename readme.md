# ParcelKoy – Courier Delivery Platform

## 📦 Project Overview

**ParcelKoy** is a comprehensive, web-based courier logistics platform designed to seamlessly manage parcel deliveries from **merchants (senders)** to **customers (receivers)** through a structured logistics workflow.

The platform handles the complete delivery lifecycle, including:

- **Pickup Requests:** Easy scheduling for merchants.
- **Rider Assignment:** Efficient dispatching and routing.
- **Hub Processing:** Centralized tracking and routing through hubs.
- **Live Tracking:** Real-time updates for merchants and customers.
- **Delivery Confirmation:** Secure OTP-based verification.
- **COD Settlement:** Streamlined Cash on Delivery collection and payouts.

ParcelKoy enables multiple operational roles (Super Admin, Admin, Merchant, Rider) to collaborate within a highly controlled workflow, ensuring efficient and transparent parcel delivery.

---

## 🛠 Tech Stack

**Core Language & Runtime**

- **TypeScript** – Main programming language
- **Node.js** – Runtime environment (ESM configured)
- **TSX** – TypeScript execution for development

**Web Framework & API**

- **Express.js (v5)** – HTTP server & REST API framework
- **CORS & Cookie Parser** – Cross-origin resource sharing & cookie management

**Database & ORM**

- **PostgreSQL** – Primary relational database
- **Prisma ORM** – Database modeling and queries (multi-file schema enabled)
- **Prisma Postgres Adapter** – Database driver integration

**Auth, Security & Validation**

- **JWT & better-auth** – Secure, token-based authentication
- **Role-Based Access Control (RBAC)** – Custom middleware for strict access levels
- **Zod** – Schema-based request payload validation

**Services & Utilities**

- **Stripe** – Payment processing and merchant payouts
- **Nodemailer & EJS** – Email notifications and server-side email templates
- **node-cron** – Automated background jobs and scheduling
- **uuid, qs, http-status** – Core utilities for data handling

**Tooling**

- **pnpm** – Fast, disk-space efficient package manager
- **ESLint** – Code linting and formatting

---

## 🚀 Quick Start

It is highly recommended to use **pnpm** for managing dependencies in this project.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd parcel-koy-backend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Variables

Copy the example environment file and configure your local variables (Database URL, JWT secrets, Stripe keys, etc.).

```bash
cp .env.example .env
```

### 4. Database Setup

Generate the Prisma client and push the schema to your PostgreSQL database.

```bash
pnpm prisma generate
pnpm prisma db push
```

### 5. Start the Application

**Development Mode:**

```bash
pnpm run dev
# Uses tsx --watch src/server.ts
```

**Production Mode:**

```bash
pnpm build
pnpm start
```

---

## 📂 Project Structure

```text
parcel-koy-backend/
├─ .env.example
├─ .gitignore
├─ package.json
├─ pnpm-lock.yaml
├─ prisma.config.ts
├─ todo.txt
├─ tsconfig.json
├─ prisma/
│  ├─ migrations/
│  └─ schema/            # Multi-file Prisma schemas (admin, auth, parcel, etc.)
├─ public/
│  ├─ ERD.webp
│  ├─ index.html
│  └─ assets/
└─ src/
   ├─ app.ts
   ├─ server.ts
   ├─ index.d.ts
   ├─ config/            # Environment and core configurations
   ├─ errors/            # Global error handling
   ├─ interfaces/        # TypeScript types and interfaces
   ├─ jobs/              # node-cron scheduled tasks
   ├─ libs/              # Third-party library initializations
   ├─ middlewares/       # Express middlewares (auth, validation)
   ├─ modules/           # Feature-based modules (routes, controllers, services)
   ├─ routes/            # Main application router
   ├─ shared/            # Shared utilities and constants
   ├─ templates/         # EJS templates for emails
   └─ utils/             # Helper functions
```

---

## 📡 Core API Routes

### 🔐 Auth Routes (`/api/v1/auth/*`)

- `POST /register` — Register a new merchant **[Public]**
- `POST /verify-email` — Verify email using OTP **[Public]**
- `POST /login` — Login user **[Public]**
- `GET /me` — Get current logged-in user profile **[Admin, SuperAdmin, Merchant, Rider]**
- `GET /refresh-tokens` — Issue new access/refresh tokens **[Public]**
- `POST /logout` — Logout current user **[Admin, SuperAdmin, Merchant, Rider]**
- `POST /change-password` — Change password for logged-in user **[Admin, SuperAdmin, Merchant, Rider]**
- `POST /forget-password` — Start password reset flow **[Public]**
- `POST /reset-password` — Reset password using token **[Public]**
- `POST /activate` — Activate a user **[Admin, SuperAdmin]**
- `POST /block` — Block a user **[Admin, SuperAdmin]**

### 🛡 Admin Routes (`/api/v1/admins/*`)

- `GET /` — Get all admins **[Admin, SuperAdmin]**
- `GET /:id` — Get a single admin by ID **[Admin, SuperAdmin]**
- `POST /by-email` — Get a single admin by email **[Admin, SuperAdmin]**
- `PATCH /profile` — Update admin profile **[Admin, SuperAdmin]**
- `DELETE /:id` — Soft delete admin by ID **[Admin, SuperAdmin]**
- `DELETE /:id/permanent` — Permanently delete admin by ID **[Admin, SuperAdmin]**
- `POST /delete` — Delete a user (custom action) **[Admin, SuperAdmin]**

### 👥 Users Routes (`/api/v1/users/*`)

- `POST /create-admin` — Create an admin user **[Admin, SuperAdmin]**
- `POST /create-rider` — Create a rider user **[Admin, SuperAdmin]**

### 📦 Parcel Routes (`/api/v1/parcels/*`)

- `GET /` — Get all parcels **[Admin, SuperAdmin]**
- `POST /` — Create a parcel **[Merchant]**
- `PUT /:id` — Update parcel details **[Merchant]**
- `PATCH /cancel/:id` — Cancel parcel **[Merchant]**
- `PATCH /status/:id` — Update parcel status (Admin workflow) **[Admin, SuperAdmin]**
- `PATCH /rider-status/:id` — Update parcel status (Rider workflow) **[Rider]**
- `POST /delivery-otp/:id` — Send delivery OTP to customer **[Rider]**
- `PATCH /verify-delivery/:id` — Verify OTP & mark as delivered **[Rider]**
- `GET /tracking/:trackingId` — Public tracking details **[Public]**

### 🛵 Rider Routes (`/api/v1/riders/*`)

- `GET /` — Get all riders **[Admin, SuperAdmin]**
- `GET /:id` — Get rider by ID **[Public]**
- `POST /by-email` — Get rider by email **[Admin, SuperAdmin]**
- `PATCH /profile` — Update rider profile **[Rider, Admin, SuperAdmin]**
- `PATCH /:id/hub` — Assign/update rider's hub **[Admin, SuperAdmin]**
- `GET /:id/parcels` — Get parcels assigned to a specific rider **[Admin, SuperAdmin, Rider, Merchant]**
- `GET /my-assigned-parcels` — Current rider’s assigned parcels **[Rider]**
- `GET /my-assigned-pickup-parcels` — Current rider’s assigned pickup tasks **[Rider]**
- `GET /my-assigned-delivery-parcels` — Current rider’s assigned delivery tasks **[Rider]**
- `GET /my-cash-handovers` — Rider's cash handover history **[Rider, Admin, SuperAdmin]**
- `PATCH /soft-delete/:id` — Soft delete rider **[Admin, SuperAdmin]**
- `DELETE /:id` — Permanently delete rider **[Admin, SuperAdmin]**

### 🏪 Merchant Routes (`/api/v1/merchants/*`)

- `GET /` — Get all merchants **[Admin, SuperAdmin]**
- `GET /:id` — Get merchant by ID **[Merchant, Rider, Admin, SuperAdmin]**
- `POST /by-email` — Get merchant by email **[Admin, SuperAdmin]**
- `PATCH /profile` — Update merchant profile **[Merchant, Admin, SuperAdmin]**
- `GET /:id/parcels` — Get parcels belonging to a merchant **[Admin, SuperAdmin, Rider, Merchant]**
- `POST /payment-requests` — Create payout/payment request **[Merchant]**
- `DELETE /:id` — Soft delete merchant **[Admin, SuperAdmin]**
- `DELETE /:id/permanent` — Permanently delete merchant **[Admin, SuperAdmin]**

### 🏢 Hub Routes (`/api/v1/hubs/*`)

- `GET /` — List all hubs **[Public]**
- `GET /:slug` — Get hub by slug **[Public]**
- `POST /` — Create a new hub **[Admin, SuperAdmin]**
- `PATCH /:slug` — Update hub details **[Admin, SuperAdmin]**
- `GET /:hubId/cash-collections` — Get hub cash collections (filter by date) **[Admin, SuperAdmin]**
- `DELETE /:slug` — Delete hub **[Admin, SuperAdmin]**

### 💵 Pricing Routes (`/api/v1/pricing/*`)

- `GET /` — List pricing rules **[Public]**
- `GET /:id` — Get pricing rule by ID **[Public]**
- `POST /` — Create pricing rule **[Admin, SuperAdmin]**
- `POST /delivery-charge` — Calculate delivery charge dynamically **[Public]**
- `PATCH /:id` — Update pricing rule **[Admin, SuperAdmin]**
- `DELETE /:id` — Delete pricing rule **[Admin, SuperAdmin]**

### 📝 Notes Routes (`/api/v1/notes/*`)

- `GET /:parcelId` — Get notes for a specific parcel **[Admin, SuperAdmin, Merchant, Rider]**
- `POST /` — Add note to a parcel **[Admin, SuperAdmin, Merchant, Rider]**
- `PATCH /:id` — Update note **[Admin, SuperAdmin]**
- `DELETE /:id` — Delete note **[Admin, SuperAdmin]**

### ⚡ Speed, ⚙️ Method & 📍 Zone Routes

_(Endpoints follow a similar structure across `/api/v1/speeds/_`, `/api/v1/methods/_`, and `/api/v1/zones/_`)\*

- `GET /` — List entries **[Public]**
- `GET /:slug` — Get entry by slug **[Public]**
- `POST /` — Create new entry **[Admin, SuperAdmin]**
- `PATCH /:slug` — Update entry by slug **[Admin, SuperAdmin]**
- `DELETE /:slug` — Delete entry by slug **[Admin, SuperAdmin]**
