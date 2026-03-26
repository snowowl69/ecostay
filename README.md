# 🌿 EcoStay — Sustainable Hotel & Travel Booking Platform

EcoStay is a full-stack MERN web application designed for sustainable hotel and travel booking services. It features role-based authentication, dynamic room availability, ticket booking, and automated sustainability certification.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### 🏨 Core Features
- **Hotel Discovery** — Browse, search, and filter eco-friendly hotels worldwide
- **Room Booking** — Real-time availability checking with date-based booking
- **Ticket System** — Auto-generated unique ticket numbers (ECO-xxx-xxx)
- **Reviews & Ratings** — Guest reviews with star ratings for each hotel
- **Sustainability Scoring** — 8-point scoring system with automatic eco-certification

### 👤 Role-Based Access
- **Customer** — Browse hotels, book rooms, manage bookings, track eco-impact
- **Hotel Owner** — List hotels, manage rooms, view bookings & revenue
- **Admin** — Platform overview, hotel verification, user/booking management

### 🎨 Frontend Highlights
- Glassmorphism + gradient design system
- Framer Motion animations throughout
- Fully responsive mobile-first design
- Nature-inspired emerald/teal color palette
- Animated particles & floating elements on hero
- Interactive sustainability meters & eco badges

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6, Framer Motion |
| **Styling** | Custom CSS (glassmorphism, gradients, animations) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcryptjs |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT & role-based auth middleware
│   ├── models/
│   │   ├── User.js            # User schema (3 roles)
│   │   ├── Hotel.js           # Hotel with sustainability scoring
│   │   ├── Room.js            # Room with availability tracking
│   │   └── Booking.js         # Booking with ticket generation
│   ├── routes/
│   │   ├── auth.js            # Register, login, profile
│   │   ├── hotels.js          # Hotel CRUD, search, reviews
│   │   ├── rooms.js           # Room CRUD, availability
│   │   ├── bookings.js        # Booking lifecycle management
│   │   └── admin.js           # Admin dashboard & management
│   ├── .env                   # Environment variables
│   ├── package.json
│   ├── seed.js                # Demo data seeder
│   └── server.js              # Express server entry
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HotelCard.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── BookingCard.jsx
│   │   │   ├── SustainabilityBadge.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Hotels.jsx
│   │   │   ├── HotelDetail.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── OwnerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── BookingConfirmation.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally (or MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecostay
JWT_SECRET=ecostay_super_secret_key_2026
```

### 3. Seed Demo Data

```bash
cd backend
npm run seed
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 🌐 Deployment (Free — Render + MongoDB Atlas)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "EcoStay - Sustainable Hotel Booking Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ecostay.git
git push -u origin main
```

### Step 2: Create Free MongoDB Atlas Database

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up free
2. Create a **Free Shared Cluster** (M0 — 512MB)
3. Under **Database Access** → Add user with password
4. Under **Network Access** → Add `0.0.0.0/0` (allow all IPs)
5. Click **Connect** → Copy the connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/ecostay
   ```

### Step 3: Deploy on Render (Free)

1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your `ecostay` GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | ecostay |
| **Root Directory** | *(leave empty)* |
| **Build Command** | `cd backend && npm install && cd ../frontend && npm install && npm run build` |
| **Start Command** | `node backend/server.js` |
| **Environment** | Node |

5. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://...` (your Atlas connection string) |
| `JWT_SECRET` | `any_strong_random_secret_here` |

6. Click **Create Web Service** — wait for build to finish
7. Your app is live at: `https://ecostay.onrender.com` 🎉

### Step 4: Seed Data on Production (Optional)

Open Render Shell or run locally with production `MONGO_URI`:
```bash
MONGO_URI="mongodb+srv://..." node backend/seed.js
```

> **Note:** Render free tier sleeps after 15 min of inactivity. First visit takes ~30 seconds to wake up.

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ecostay.com | admin123 |
| **Hotel Owner** | priya@ecostay.com | owner123 |
| **Hotel Owner** | arjun@ecostay.com | owner123 |
| **Customer** | ananya@example.com | customer123 |
| **Customer** | rohan@example.com | customer123 |

---

## 🌱 Sustainability Scoring System

Hotels are scored across 8 eco-practices:
1. ☀️ Solar Powered
2. 💧 Rainwater Harvesting
3. 🥬 Organic Food
4. ♻️ Waste Recycling
5. ⚡ EV Charging
6. 🌍 Carbon Offset
7. 🏘️ Local Sourcing
8. 💡 Energy Efficient

**Certification levels:**
- **Platinum** (80%+) — Elite sustainability
- **Gold** (60%+) — High sustainability
- **Eco** (40%+) — Good practices
- **Standard** (<40%) — Getting started

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login & get JWT token
- `GET /api/auth/me` — Get current user profile

### Hotels
- `GET /api/hotels` — List all hotels (with search/filter)
- `GET /api/hotels/:id` — Get hotel by ID
- `POST /api/hotels` — Create hotel (owner)
- `PUT /api/hotels/:id` — Update hotel (owner)
- `POST /api/hotels/:id/reviews` — Add review

### Rooms
- `GET /api/rooms/hotel/:hotelId` — Get rooms by hotel
- `POST /api/rooms` — Create room (owner)
- `GET /api/rooms/:id/availability` — Check availability

### Bookings
- `POST /api/bookings` — Create booking
- `GET /api/bookings/my` — Get user's bookings
- `PUT /api/bookings/:id/cancel` — Cancel booking
- `GET /api/bookings/ticket/:ticketNumber` — Lookup by ticket

### Admin
- `GET /api/admin/stats` — Dashboard statistics
- `GET /api/admin/hotels` — All hotels
- `PUT /api/admin/hotels/:id/verify` — Verify hotel
- `GET /api/admin/users` — All users
- `GET /api/admin/bookings` — All bookings

---

## 📄 License

MIT License — Feel free to use for learning and projects.
