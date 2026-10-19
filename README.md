# TeleConnect — Telecaller Management System

A full-stack web application for managing telecaller staff and business leads. Admins can import, assign, and track businesses; telecallers can view and update their assigned leads from any device.

---

## Features

- **Role-based access** — `admin` and `staff` roles with separate dashboard views
- **Business management** — Add, edit, delete, filter, and search businesses
- **Bulk import** — Upload businesses via Excel (`.xlsx`) file
- **Staff assignment** — Assign batches of businesses to telecallers with a custom message
- **Registration tracking** — Mark businesses as registered with timestamp
- **Follow-up notes** — Attach follow-up comments to any business
- **Shop detail view** — Full business profile page for telecallers
- **Server-side caching** — Node-Cache with 5-minute TTL to reduce DB load
- **PWA support** — Installable as a Progressive Web App on mobile & desktop
- **Pincode-based filtering** — Staff automatically see leads matching their pincode

---

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 19, React Router 7, Tailwind CSS v4, Vite |
| Backend  | Node.js, Express 4, MongoDB (Mongoose 7)        |
| Auth     | JWT (`jsonwebtoken`), bcryptjs                  |
| Caching  | `node-cache` (in-memory, 5 min TTL)             |
| PWA      | `vite-plugin-pwa` (auto-update service worker)  |
| Export   | `xlsx` for Excel import/export                  |

---

## Project Structure

```
telecaller/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api.js           # Centralised API fetch layer
│   │   ├── App.jsx          # Routes (auth-guarded)
│   │   ├── pages/
│   │   │   ├── Auth.jsx           # Login / Register page
│   │   │   ├── Dashboard.jsx      # Main admin/staff view
│   │   │   └── ShopDetailScreen.jsx # Single business detail
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── BusinessCard.jsx
│   │       ├── BusinessTable.jsx
│   │       ├── TelecallerTable.jsx
│   │       ├── AddBusinessModal.jsx
│   │       ├── AssignStaffModal.jsx
│   │       ├── RegisterBusinessModal.jsx
│   │       └── InstallPWA.jsx     # PWA install prompt
│   ├── vite.config.js
│   └── package.json
│
└── server/                  # Express + MongoDB backend
    ├── server.js            # Entry point
    ├── models/
    │   ├── Business.js      # Business schema
    │   └── Telecaller.js    # User/staff schema
    ├── routes/
    │   ├── auth.js          # POST /api/auth/login, /register
    │   ├── businesses.js    # CRUD + assign + import
    │   └── users.js         # Staff list + seed
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone <repo-url>
cd telecaller
```

### 2. Configure the server

```bash
cd server
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/telecaller
JWT_SECRET=your_super_secret_key
```

Install dependencies and start:

```bash
npm install
npm run dev      # nodemon (watch mode)
# or
npm start        # plain node
```

### 3. Configure the client

```bash
cd ../client
```

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000/api
```

Install dependencies and start:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint    | Description                    |
| ------ | ----------- | ------------------------------ |
| POST   | `/register` | Register a new telecaller/admin |
| POST   | `/login`    | Login and receive a JWT token  |

### Businesses — `/api/businesses`

| Method | Endpoint    | Description                                          |
| ------ | ----------- | ---------------------------------------------------- |
| GET    | `/`         | List businesses (supports filters & search)          |
| GET    | `/:id`      | Get a single business by ID                          |
| POST   | `/`         | Add a new business                                   |
| POST   | `/import`   | Bulk insert an array of businesses                   |
| POST   | `/seed`     | Seed dummy data (dev/testing only)                   |
| PUT    | `/assign`   | Assign multiple businesses to a staff member         |
| PUT    | `/:id`      | Update a business (auto-sets `registeredAt` on flag) |
| DELETE | `/:id`      | Delete a business                                    |

**GET `/` query parameters:**

| Param        | Description                                     |
| ------------ | ----------------------------------------------- |
| `pincode`    | Filter by exact or broad (first 3 digits) match |
| `city`       | Case-insensitive regex match                    |
| `state`      | Case-insensitive regex match                    |
| `category`   | Exact category filter                           |
| `type`       | Business type filter (`Retailer`, `Wholesaler`) |
| `registered` | `true` / `false` / `All`                        |
| `assignedTo` | Filter by staff ObjectId                        |
| `search`     | Search by name or phone number                  |

### Users — `/api/users`

| Method | Endpoint | Description                                     |
| ------ | -------- | ----------------------------------------------- |
| GET    | `/`      | List all staff with assignment/registered counts |
| POST   | `/seed`  | Seed dummy staff (dev/testing only)             |

---

## Roles & Permissions

| Feature                | Admin | Staff |
| ---------------------- | :---: | :---: |
| View all businesses    |  Yes  |  No   |
| View assigned leads    |  Yes  |  Yes  |
| Add business           |  Yes  |  No   |
| Import businesses      |  Yes  |  No   |
| Assign businesses      |  Yes  |  No   |
| Mark as registered     |  Yes  |  Yes  |
| Add follow-up notes    |  Yes  |  Yes  |
| View team (staff list) |  Yes  |  No   |
| Filter & search        |  Yes  |  No   |

---

## Keyboard Shortcuts

| Shortcut    | Action                                 |
| ----------- | -------------------------------------- |
| `Shift + N` | Open "Add Business" modal (Dashboard)  |

---

## Seeding Test Data

Use these endpoints during development to populate the database:

```bash
# Seed 3 dummy businesses
curl -X POST http://localhost:5000/api/businesses/seed

# Seed 3 dummy staff users (password: password123)
curl -X POST http://localhost:5000/api/users/seed
```

> **Warning:** Remove or protect seed endpoints before deploying to production.

---

## Environment Variables

### Server (`server/.env`)

| Variable     | Description                        |
| ------------ | ---------------------------------- |
| `PORT`       | Port the Express server listens on |
| `MONGO_URI`  | MongoDB connection string          |
| `JWT_SECRET` | Secret key for signing JWTs        |

### Client (`client/.env`)

| Variable           | Description                       |
| ------------------ | --------------------------------- |
| `VITE_BACKEND_URL` | Full base URL for the backend API |

---

## PWA

The app is configured as a PWA via `vite-plugin-pwa`. It can be installed on mobile and desktop devices. The service worker auto-updates on new deployments.

- **App name:** TeleConnect Admin
- **Short name:** TeleConnect
- **Theme/background:** `#000000`
- **Display mode:** Standalone

---

## License

ISC
