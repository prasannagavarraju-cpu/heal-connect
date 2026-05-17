# HealConnect

A full-stack healthcare accessibility platform that connects patients who cannot travel to hospitals with nearby doctors, nurses, and emergency medical staff — right at their doorstep.

## Who It's For

- **Elderly patients** living alone with limited mobility
- **Disabled individuals** who face barriers visiting hospitals
- **People living alone** whose family is away for work

## Features

- One-tap Emergency SOS — broadcasts to all nearby doctors in real time
- Live location sharing via GPS
- Role-based dashboards for Patients, Doctors, Nurses, and Paramedics
- Real-time request updates via Socket.io
- Appointment booking (Home Visit / Video Call / Clinic)
- Doctor availability toggle with service radius
- JWT authentication with 2-step registration

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Real-Time | Socket.io |
| Auth | JWT + bcrypt |

## Project Structure

```
heal-connect/
├── client/          # React frontend (Vite + Tailwind)
└── server/          # Express API + Socket.io
    └── prisma/      # Database schema & migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (via pgAdmin or local install)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/heal-connect.git
cd heal-connect
```

### 2. Set up environment variables

```bash
# Backend
cp server/.env.example server/.env
# Edit server/.env with your PostgreSQL credentials and JWT secret

# Frontend
cp client/.env.example client/.env
```

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Set up the database

Create a database named `healconnect` in pgAdmin, then run:

```bash
cd server
npx prisma migrate dev --name init
```

### 5. Start the development servers

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register patient or doctor |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/requests` | Create emergency request |
| GET | `/api/requests/nearby` | Get nearby requests (doctors) |
| GET | `/api/requests/my` | Get my requests |
| PUT | `/api/requests/:id/accept` | Accept a request |
| GET | `/api/doctors/nearby` | Find nearby doctors |
| PUT | `/api/doctors/availability` | Toggle doctor availability |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments/my` | Get my appointments |

## Database Schema

7 models: `User`, `DoctorProfile`, `PatientProfile`, `MedicalRequest`, `Appointment`, `MedicalReport`, `Notification`

## Emergency Contact

In case of a real medical emergency, call **112**.
