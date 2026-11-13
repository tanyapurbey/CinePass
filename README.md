# 🎬 CinePass - Modern Movie Ticket Booking System

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F18-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Secured-black.svg?style=flat&logo=jsonwebtokens)](https://jwt.io/)

> **CinePass** is an enterprise-grade movie reservation and ticket booking platform designed with a high-performance Spring Boot backend and an interactive React frontend. Features include concurrent seat locking, role-based access control (RBAC), stateless JWT authentication, and transactional booking pipelines.

---

## 🌟 Key Capabilities

### 🎟️ Booking & Smart Seat Locking
- **Real-Time Seat Locking**: Selected seats enter a 5-minute transient lock during checkout to prevent concurrency conflicts and double bookings.
- **Automated Unlock Scheduler**: Spring scheduled daemon releases locked seats back to the inventory if checkout times out.
- **Transactional Consistency**: Spring `@Transactional` management guarantees atomic ticket generation and payment binding.

### 🔐 Security & Access Control
- **Stateless JWT**: Secure token generation, validation, and refresh with custom `JwtAuthFilter`.
- **Role-Based Authorization**: Distinct access controls for `USER` and `ADMIN` across all endpoints.
- **Password Protection**: BCrypt hashing with configurable work factor.

### 🍿 Theater & Show Hierarchy
- Multi-theater and multi-screen support.
- Show scheduling linked with specific theater screens.
- Dynamic pricing and seat categorization (Premium, Regular, Executive).

### 🖥️ Modern Responsive Frontend
- Built with React 19, Vite, and Tailwind CSS.
- Dedicated user booking workflow with interactive live seat layout selection.
- Comprehensive Admin Dashboard for monitoring bookings, theaters, screens, and shows.

---

## 🏗️ System Architecture

```text
                  ┌────────────────────────────────────────┐
                  │          React 19 + Vite UI            │
                  │   (Axios Interceptors, Context API)    │
                  └──────────────────┬─────────────────────┘
                                     │ REST / JSON
                                     ▼
                  ┌────────────────────────────────────────┐
                  │       Spring Boot 3 API Gateway        │
                  │  (Security Filter Chain & JWT Handler) │
                  └──────────────────┬─────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   Auth & User    │       │  Shows & Theaters│       │ Booking Engine   │
│   Controller     │       │    Controller    │       │ & Seat Locker    │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │ Service Layer & DTOs
                                    ▼
                  ┌────────────────────────────────────────┐
                  │      Spring Data JPA / Hibernate       │
                  └──────────────────┬─────────────────────┘
                                     │
                                     ▼
                  ┌────────────────────────────────────────┐
                  │          PostgreSQL Database           │
                  └────────────────────────────────────────┘
```

---

## ⏳ Smart Seat-Locking Lifecycle

```text
Seat Selected ──▶ [LOCKED (5 min)] ──▶ Payment Confirmed ──▶ [BOOKED]
                         │
                         │ (Timeout / Failure)
                         ▼
                    [AVAILABLE]
```

---

## 📁 Project Structure

```text
CinePass/
├── src/main/java/com/tanya/cinepass/
│   ├── config/              # Application & Data Initializer configs
│   ├── controller/          # REST API endpoints (Auth, Booking, Movie, Show, etc.)
│   ├── dto/                 # Request & Response Data Transfer Objects
│   ├── Exception/           # Global exception handling & error responses
│   ├── model/               # JPA Entities (User, Booking, Movie, Seat, Show, etc.)
│   ├── repository/          # Spring Data JPA repositories
│   ├── scheduler/           # Automated seat unlock background jobs
│   ├── security/            # JWT utilities, UserDetailsService & filters
│   ├── service/             # Business logic layer
│   └── CinePassApplication.java
├── src/main/resources/
│   └── application.properties # App, DB, and JWT configuration
├── cinepass-frontend/        # React + Vite + Tailwind frontend application
│   ├── src/
│   │   ├── api/             # Axios API service clients
│   │   ├── components/      # UI, Layout, SeatGrid, and Booking cards
│   │   ├── context/         # Auth & state management
│   │   ├── pages/           # Customer pages & Admin management screens
│   │   └── utils/           # Constants and helpers
│   └── package.json
└── pom.xml                  # Maven dependencies & build specification
```

---

## 📡 API Endpoints Overview

| Category | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register a new user | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate & retrieve JWT token | Public |
| **Movies** | `GET` | `/api/movies` | Fetch all available movies | Public |
| **Movies** | `POST` | `/api/movies` | Create a new movie | Admin |
| **Theaters** | `GET` | `/api/theaters` | List theater locations & screens | Public |
| **Shows** | `GET` | `/api/shows/movie/{id}` | Get active showtimes for a movie | Public |
| **Booking** | `POST` | `/api/bookings/lock` | Lock selected seats for 5 mins | User |
| **Booking** | `POST` | `/api/bookings/{id}/confirm-payment` | Finalize payment & confirm booking | User |
| **Booking** | `GET` | `/api/bookings/user/{userId}` | View authenticated user history | User |

*API documentation (Swagger UI) is available at `http://localhost:8080/swagger-ui.html` when running.*

---

## 🚀 Getting Started

### Prerequisites
- **Java Development Kit (JDK)**: 21 or higher
- **Node.js**: v18 or higher & **npm**
- **PostgreSQL**: 14 or higher (or pgAdmin)

---

### 1. Database Setup
Create a PostgreSQL database:
```sql
CREATE DATABASE cinepass_db;
```

Update your credentials in `src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/cinepass_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

---

### 2. Run the Backend
From the root directory:
```bash
# Windows
.\mvnw.cmd clean spring-boot:run

# Linux / macOS
./mvnw clean spring-boot:run
```
Backend will start on `http://localhost:8080`.

> **Initial Admin Credentials (Auto-seeded on start):**
> - **Email**: `admin@cinepass.com`
> - **Password**: `Admin@123`

---

### 3. Run the Frontend
Navigate to the frontend directory:
```bash
cd cinepass-frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 🛡️ License
Distributed under the MIT License.
