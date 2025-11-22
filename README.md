# Uber-Clone – Ride-Sharing Application

A full-stack ride-sharing platform built with **Node.js/Express** backend and **React** frontend, featuring real-time ride matching, fare estimation, and live tracking using Google Maps APIs and WebSockets.

## 🚀 Features

- **User Authentication** — Register, login, logout with JWT tokens
- **Captain (Driver) Management** — Captain registration with vehicle details
- **Ride Booking** — Users can request rides with pickup/destination and vehicle type
- **Fare Estimation** — Dynamic fare calculation based on distance, duration, and vehicle type
- **Real-time Notifications** — WebSocket-based live ride matching and status updates
- **Location Services** — Google Maps integration for geocoding, distance/time matrix, and autocomplete
- **Token Blacklisting** — Secure logout by blacklisting JWT tokens
- **Protected Routes** — Role-based access control for users and captains

## 📁 Project Structure

```
rideme/
├── Backend/                    # Node.js/Express API server
│   ├── controllers/            # Route handlers
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic
│   ├── middlewares/            # Auth & validation middleware
│   ├── database/               # DB connection
│   ├── Socket.js               # WebSocket event handling
│   ├── app.js                  # Express app setup
│   ├── server.js               # Server entry point
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables
│   └── README.md               # API documentation
│
├── Frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── context/            # Context API providers (User, Captain, Socket, UserData)
│   │   ├── App.jsx             # Root component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite config
│   ├── .env                    # Environment variables
│   └── README.md               # Frontend docs
│
└── README.md                   # This file
```

## ⚙️ Prerequisites

- **Node.js** v14+ and **npm** or **yarn**
- **MongoDB** (local or cloud instance, e.g., MongoDB Atlas)
- **Google Maps API Key** (for geocoding, distance matrix, and autocomplete)
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/RN18o/rideme.git
cd rideme
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory with the following variables:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rideme
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NODE_ENV=development
```

Start the backend server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:4000`.

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another available port).

## 📡 API Documentation

For detailed endpoint documentation (request/response examples, validation rules, status codes), see:

- **Backend/README.md** — Complete API reference for:
  - User endpoints (`/users/register`, `/users/login`, `/users/profile`, `/users/logout`)
  - Captain endpoints (`/captains/register`, `/captains/login`, `/captains/profile`, `/captains/logout`)
  - Map endpoints (`/maps/get-coordinates`, `/maps/get-distance-time`, `/maps/get-suggestions`)
  - Ride endpoints (`/rides/createride`, `/rides/get-fare`)

## 🏗️ Architecture

### Backend Architecture

**Stack:** Node.js, Express, MongoDB, Mongoose, JWT, Google Maps API, Socket.io

**Key Components:**
- **Controllers** — Handle HTTP requests and responses
- **Services** — Business logic (ride creation, fare calculation, location services)
- **Models** — MongoDB schemas (User, Captain, Ride, BlacklistToken)
- **Middlewares** — Authentication, validation, error handling
- **Socket** — WebSocket event handlers for real-time ride matching

**Authentication Flow:**
1. User/Captain registers → hashed password stored in DB
2. User/Captain logs in → JWT token issued (valid 24 hours)
3. Protected routes check JWT and attach `req.user` or `req.captain`
4. Logout → token added to blacklist collection (auto-expires after 24 hours)

**Ride Flow:**
1. User requests ride with pickup, destination, and vehicle type
2. Backend calculates fare using Google Distance Matrix API
3. Ride created with status `pending` and 6-digit OTP
4. Captains within 2km radius notified via WebSocket (OTP hidden)
5. Captain accepts → ride status changes to `accepted`
6. Real-time live tracking during ride

### Frontend Architecture

**Stack:** React 18+, Vite, Context API, Socket.io-client

**Key Features:**
- **Context Providers:** UserContext (auth state), CaptainContext (driver state), SocketContext (WebSocket connection), UserDataContext (ride/user data)
- **Pages:** Start, UserRegister, UserLogin, Home (ride booking), Riding, CaptainHome, CaptainRegister, CaptainLogin, etc.
- **Components:** LocationSearchPanel, VehiclePanel, ConfirmRide, LookingForDriver, WaitingForDriver, LiveTracking, etc.
- **Protected Routes:** CaptainProtectWrapper, UserProtectorWrapper (check auth and redirect if needed)

**State Management:**
- **UserContext** — logged-in user info, email, token
- **CaptainContext** — captain info, vehicle details, online status
- **SocketContext** — WebSocket connection and event handlers
- **UserDataContext** — current ride, ride status, driver/rider details

## 🚀 Running the Application

### Option 1: Terminal + Browser

**Terminal 1 — Backend:**
```bash
cd Backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd Frontend
npm run dev
```

Open your browser to `http://localhost:5173`.

### Option 2: Docker (Optional)

If Docker is set up, you can containerize both services. Check `Dockerfile` in Backend/ and Frontend/ (if present).

## 🔐 Environment Variables Checklist

### Backend (`.env`)
- `PORT` — Express server port (default: 4000)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for JWT signing
- `GOOGLE_MAPS_API_KEY` — API key from Google Cloud Console
- `NODE_ENV` — `development` or `production`

### Frontend (`.env`)
- `VITE_API_URL` — Backend API base URL (e.g., `http://localhost:4000`)
- `VITE_SOCKET_URL` — Backend WebSocket URL (usually same as API URL)

## 🧪 Testing

### Backend
```bash
cd Backend
npm test  # if test scripts are configured in package.json
```

### Frontend
```bash
cd Frontend
npm run test  # if test scripts are configured
```

## 📚 Key Concepts

### JWT Authentication
- Tokens issued on login/register with 24-hour expiration
- Tokens sent in `Authorization: Bearer <token>` header or as `token` cookie
- Blacklist collection prevents token reuse after logout

### Real-time Ride Matching
- When a user requests a ride, backend finds captains within 2km using geospatial queries
- Captains notified via WebSocket event `new-ride` (without OTP for security)
- Captain accepts ride → other nearby captains notified ride is taken

### Fare Calculation
- **Base fare** — varies by vehicle type (auto: 30, car: 50, moto: 20)
- **Per km rate** — distance cost (auto: 10, car: 15, moto: 8)
- **Per minute rate** — duration cost (auto: 2, car: 3, moto: 1.5)
- **Total fare** = base + (distance in km × rate) + (duration in minutes × rate)

### Google Maps Integration
- **Geocoding** — convert address to coordinates (lat/lng)
- **Distance Matrix** — get distance and duration between two points
- **Autocomplete** — address suggestions as user types

## 🛠️ Troubleshooting

### "Cannot set headers after they are sent to the client"
- Fixed in Ride.controller.js by separating HTTP response from async notification logic
- Always send response first, then do fire-and-forget async work

### WebSocket connection fails
- Ensure backend is running and Socket.io is configured
- Check `VITE_SOCKET_URL` in Frontend `.env`
- Check CORS settings in Backend `Socket.js`

### MongoDB connection errors
- Verify `MONGODB_URI` is correct and the database is accessible
- Check network access in MongoDB Atlas (IP whitelist)
- Ensure MongoDB service is running (if local)

### Google Maps API errors
- Verify `GOOGLE_MAPS_API_KEY` is valid and has the right APIs enabled (Geocoding, Distance Matrix, Places)
- Check API quota and billing in Google Cloud Console

## 📖 Further Reading

- **Backend API Docs** — `Backend/README.md`

---

**Happy coding! 🎉**
