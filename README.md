![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

# MediQueue

A comprehensive healthcare queue and management platform designed to streamline patient, doctor, and admin interactions. Built with a modern tech stack for real-world healthcare needs.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=render)](https://mediqueue-frontend.onrender.com)

**Live Link:** [https://mediqueue-frontend.onrender.com](https://mediqueue-frontend.onrender.com)
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

MediQueue is a full-stack web application that digitizes and optimizes healthcare queue management. It enables patients to book appointments, doctors to manage schedules, all in a secure and user-friendly environment.

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

- JavaScript
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
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

- **Live Demo:** [https://mediqueue-frontend.onrender.com](https://mediqueue-frontend.onrender.com)
- **Local Development:** Visit the frontend URL (default: http://localhost:5173)
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
