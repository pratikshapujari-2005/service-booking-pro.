# Forma — Full-Stack Service Booking Website

A responsive, portfolio-ready service-booking project inspired by the supplied SAN WebTechnology Task 2 brief.

## Features

- Modern responsive React interface with CSS 3D-style motion, floating cards, animated gradient orb, orbit rings, and reduced-motion support.
- Six sample services and sample time slots.
- Five-stage booking journey: service → date/time → customer details → review → confirmation.
- Register/login with password hashing (`bcryptjs`) and signed JWT sessions.
- Protected booking creation and account-specific booking history.
- PostgreSQL persistence with unique booking references and a unique service/date/time constraint.
- Server-side validation, security headers, rate limiting for auth endpoints, and parameterized SQL.
- No payment gateway (as requested in the assignment).

## Tech stack

- Frontend: React, Vite, React Router, Lucide icons, CSS animations
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: bcrypt password hashing + JWT

## Requirements

Install these first:

1. **Node.js LTS** (includes npm): https://nodejs.org/
2. **PostgreSQL**: https://www.postgresql.org/download/
3. A code editor such as Visual Studio Code: https://code.visualstudio.com/

## Setup steps (Windows)

### 1. Open the project

Extract the ZIP. In VS Code choose **File → Open Folder** and select `service-booking-pro`.

### 2. Create a PostgreSQL database

Open **SQL Shell (psql)** or pgAdmin and run:

```sql
CREATE DATABASE forma_booking;
```

If you use pgAdmin: right-click **Databases → Create → Database**, name it `forma_booking`, then save.

### 3. Create the database tables

Open the `forma_booking` database in pgAdmin's Query Tool, open `server/src/schema.sql`, copy all its SQL, paste it into Query Tool, and click **Execute**.

Alternatively, from a terminal where `psql` is available, run:

```bash
psql -U postgres -d forma_booking -f server/src/schema.sql
```

### 4. Configure the backend environment

Copy `server/.env.example` to a new file named `server/.env`. Update `DATABASE_URL` with your own PostgreSQL username and password. Example for a local PostgreSQL installation:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/forma_booking
JWT_SECRET=replace_with_a_random_secret_of_at_least_32_characters
DB_SSL=false
```

Replace `YOUR_POSTGRES_PASSWORD` with the password you set when installing PostgreSQL. Replace the JWT secret with a long random string. Do not share or commit the `.env` file.

### 5. Install packages

Open the VS Code terminal (**Terminal → New Terminal**) in the main `service-booking-pro` folder and run:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 6. Start the website

In the root terminal, run:

```bash
npm run dev
```

The terminal starts the API and frontend. Open:

- Website: http://localhost:5173
- API health check: http://localhost:5000/api/health
- Sample services API: http://localhost:5000/api/services

The health check should return `{"status":"ok","database":"connected"}` when PostgreSQL is connected and the database exists.

If you prefer separate terminals, start the backend in terminal 1 with `npm run dev --prefix server` and the frontend in terminal 2 with `npm run dev --prefix client`.

## Test the complete booking flow

1. Open the website and choose a service.
2. Select a date and sample time slot.
3. Enter customer details.
4. Review the summary.
5. If not logged in, create an account or log in.
6. Return to booking, complete the steps, and confirm.
7. Open **My bookings** to see the record read back from PostgreSQL.

The server enforces authentication before it writes a booking. The browser does not directly connect to PostgreSQL.

## Project structure

```text
service-booking-pro/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       └── lib/api.js
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── db.js
│       ├── schema.sql
│       ├── services.js
│       ├── middleware/auth.js
│       └── routes/
│           ├── auth.js
│           └── bookings.js
├── package.json
└── README.md
```

## Main API endpoints

| Method | Endpoint | Purpose | Login required? |
|---|---|---|---|
| GET | `/api/health` | Check API and database | No |
| GET | `/api/services` | List sample services | No |
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Log in | No |
| POST | `/api/bookings` | Save a confirmed booking | Yes |
| GET | `/api/bookings/mine` | List current user's bookings | Yes |

### Example registration request

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "example-password-123"
}
```

### Example booking request (Bearer token required)

```json
{
  "serviceId": "home-care",
  "date": "2027-01-20",
  "slot": "10:30 AM",
  "customerName": "Demo User",
  "customerEmail": "demo@example.com",
  "phone": "9876543210",
  "notes": "Please call when arriving."
}
```

## Important notes

- Service prices and appointment slots are sample/demo values. The interface labels the slots as samples.
- This project does not process payments or send real emails/SMS.
- This is a strong educational starter, not a fully audited production deployment. Before public deployment, use HTTPS, set a secure JWT secret, configure your hosting provider's PostgreSQL SSL requirements, add email verification/password reset, and consider moving JWTs from local storage to secure HttpOnly cookies.
- A booking is stored only after a logged-in user submits the final confirmation. The database unique constraint prevents two bookings for the same service, date, and time slot; if a slot has been taken, the API asks the user to choose another.
