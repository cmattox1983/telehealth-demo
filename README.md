# 🏥 Telehealth Scheduling Demo

A full-stack telehealth scheduling application that allows patients to search providers, book appointments, and manage their care — while providers can view schedules, manage appointments, and receive alerts.

---

## 🚀 Live Demo

_(Add your Vercel link here once deployed)_

---

## 🧠 Overview

This project simulates a real-world telehealth platform with:

- Patient onboarding and provider search
- Appointment booking and scheduling
- Provider dashboard with calendar view
- Alerts for scheduling, cancellations, and updates

Built as a portfolio project to demonstrate full-stack development skills in a healthcare-focused environment.

---

## 🛠️ Tech Stack

### Frontend

- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS
- FullCalendar (Scheduling UI)

### Backend

- Next.js API Routes
- Prisma ORM

### Database

- SQLite (local development)

> ⚠️ Note: SQLite is used for development/demo purposes. In production, this would be replaced with PostgreSQL (Neon, Supabase, etc.).

---

## 🔐 Demo Login Credentials

### 👤 Patient Accounts

```
Email: patient1@test.com
Password: password123
```

```
Email: patient2@test.com
Password: password123
```

```
Email: patient3@test.com
Password: password123
```

---

### 🩺 Provider Accounts

```
Email: provider1@test.com
Password: password123
```

```
Email: provider2@test.com
Password: password123
```

```
Email: provider3@test.com
Password: password123
```

---

## ✨ Features

### 👤 Patients

- Search providers by specialty and state
- View provider profiles
- Book appointments
- View upcoming appointments

### 🩺 Providers

- Dashboard with weekly calendar view
- View scheduled appointments
- Real-time alerts:
  - New bookings
  - Cancellations
  - Reschedules

---

## 📁 Project Structure

```
/app        → Next.js App Router pages
/components → Reusable UI components
/lib        → Utilities and Prisma client
/prisma     → Schema, migrations, and seed data
/public     → Static assets
```

---

## ⚙️ Getting Started (Local Development)

### 1. Clone the repo

```bash
git clone https://github.com/cmattox1983/telehealth-demo.git
cd telehealth-demo
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Environment variables

Create a `.env` file:

```bash
DATABASE_URL="file:./dev.db"
```

---

### 4. Setup database

```bash
npx prisma migrate dev
npx prisma db seed
```

---

### 5. Run the app

```bash
npm run dev
```

---

## 🚧 Known Limitations

- SQLite does not persist in serverless deployments (Vercel)
- Demo authentication (no real auth provider)
- Minimal backend authorization (designed for demo purposes)

---

## 🔮 Future Improvements

- Migrate to PostgreSQL (Neon/Supabase)
- Add authentication (NextAuth / Clerk)
- Role-based backend security
- Admin dashboard
- Improved mobile UX

---

## 👨‍💻 Author

**Chris Mattox**
Frontend Developer

- GitHub: https://github.com/cmattox1983
- LinkedIn: _(add your link here)_

---

## 💡 Purpose

This project demonstrates:

- Full-stack application architecture
- API development with Next.js
- Database design with Prisma
- UI/UX with Tailwind and React
- Real-world scheduling workflows

---

## ⭐️ Support

If you found this project helpful, feel free to star the repo or connect with me.
