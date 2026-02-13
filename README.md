# MediQueue

A comprehensive healthcare queue and management platform designed to streamline patient, doctor, and admin interactions. Built with a modern tech stack for real-world healthcare needs.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

MediQueue is a full-stack web application that digitizes and optimizes healthcare queue management. It enables patients to book appointments, doctors to manage schedules, and admins to oversee operations, all in a secure and user-friendly environment.

## Features

- User authentication (patients, doctors)
- Appointment booking and management
- Doctor and patient dashboards
- Family health management
- Teleconsultancy support
- Health metrics tracking
- Lab report uploads
- Insurance marketplace
- Emergency services
- Health content/blogs
- Admin controls and analytics

## Tech Stack

**Frontend:**

- React (Vite)
- Tailwind CSS
- Axios

**Backend:**

- Node.js
- Express.js
- MongoDB (Mongoose)
- Cloudinary (media uploads)
- Nodemailer (email service)

**Other:**

- JWT Authentication
- Multer (file uploads)
- Swagger (API docs)

## Architecture

```
frontend/   # React app (Vite, Tailwind)
backend/    # Node.js/Express API
  ├── config/
  ├── controllers/
  ├── middlewares/
  ├── models/
  ├── routes/
  └── utils/
```

## Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
# Configure .env (see .env.example)
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

- Visit the frontend URL (default: http://localhost:5173)
- Register/login as a Patient, Doctor
- Explore dashboards, book appointments, manage health data

## API Endpoints

- RESTful endpoints for users, doctors, appointments, health data, etc.
- See backend/routes/ and Swagger docs for details

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes with clear messages
4. Open a pull request

## License

MIT License

---

## Contact

**Name:** Neeraj Kaushik  
**Email:** [Neerajkaushik.1007@gmail.com](mailto:Neerajkaushik.1007@gmail.com)  
**LinkedIn:** [www.linkedin.com/in/neeraj-kaushik1007](https://www.linkedin.com/in/neeraj-kaushik1007)  
**GitHub:** [https://github.com/Neerajkaushik07](https://github.com/Neerajkaushik07)

---

## Login Credentials (For Testing)

All generated profiles follow the requested format for testing.

### Doctors

- **Email Format:** firstnamelastname@mediqueue.com
- **Password:** doctor321
- **Example:** richardlewis@mediqueue.com

### Patients

- **Email Format:** firstnamelastname@mediqueue.com
- **Password:** patient321
- **Example:** carolperez@mediqueue.com
