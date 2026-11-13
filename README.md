# 🎬 CinePass - Enterprise Cinema Reservation & Ticketing Platform

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat&logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F18-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-Secured-black.svg?style=flat&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **CinePass** is an enterprise-grade, high-concurrency movie reservation and ticket booking platform engineered with a **Spring Boot 3** backend and an interactive **React 19** frontend. Features include database-level pessimistic seat locking, automated background lock expiration scheduling, stateless JWT authentication, role-based access control (RBAC), and transactional booking pipelines.

![CinePass Preview](image.png)

---

## 🌐 Live Deployments

- **Live Application (Frontend)**: `[Deploying on Vercel...]` *(URL will be updated upon deployment)*
- **API Server & Swagger UI (Backend)**: `[Deploying on Render...]` *(URL will be updated upon deployment)*
- **Database**: Cloud PostgreSQL on **Supabase**

---

## 🔑 Recruiter & Demo Access (1-Click Ready)

For instant evaluation, the login page includes a **1-Click Demo Login** button that auto-populates credentials:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@cinepass.com` | `Admin@123` | Full access: Add movies, configure auditoriums, schedule shows, audit bookings |
| **Customer** | *(Self-register on UI)* | *(Any)* | Browse movies, select seats, complete checkout, view booking tickets |

---

## ⚡ Core Engineering Highlights

### 1. Concurrency Control & Double-Booking Prevention
In high-demand cinema ticketing, multiple customers frequently attempt to book the exact same seats simultaneously. CinePass solves race conditions through a two-tier locking strategy:
- **Pessimistic Write Locking (`PESSIMISTIC_WRITE`)**: During checkout initiation, `ShowSeatRepository.findAllByIdForUpdate()` executes `SELECT ... FOR UPDATE` at the database engine level. This blocks concurrent transactions from reading the seats as `AVAILABLE` until the active transaction completes or rolls back.
- **Optimistic Locking (`@Version`)**: As a complementary safety net, `ShowSeat` maintains an incrementing version column. Any concurrent update collision throws an optimistic locking exception, immediately terminating stale requests.

### 2. Automated Background Seat Unlock Daemon (`@Scheduled`)
- When a user locks seats, they enter a transient 5-minute hold with a timestamp.
- If the user abandons checkout, closes the browser, or payment times out, seats must return to the public inventory without manual intervention.
- The **`SeatUnlockScheduler`** runs as an automated background daemon scanning for expired holds (`lockedAt < now - 5 minutes`) and atomically transitions abandoned seats back to `AVAILABLE`.

### 3. Stateless Security & Role-Based Access Control (RBAC)
- **Token-Based Auth**: Fully stateless session management powered by HMAC-SHA256 signed JSON Web Tokens (`JJWT`).
- **Filter Pipeline**: Custom `JwtAuthFilter` intercepts inbound HTTP traffic, parses the `Authorization: Bearer <token>` header, verifies token validity, and establishes the security context before controller dispatch.
- **Method-Level Security**: `@EnableMethodSecurity(prePostEnabled = true)` with `@PreAuthorize("hasRole('ADMIN')")` protects administrative operations from unauthorized client calls.

---

## 🏗️ System Architecture & Data Flow

```text
                                  ┌──────────────────────────────┐
                                  │      React 19 + Vite UI      │
                                  │  (Axios Interceptor + Auth)  │
                                  └──────────────┬───────────────┘
                                                 │ HTTP / JSON (Bearer Token)
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │  Spring Security 6 Gateway   │
                                  │   (JwtAuthFilter & CORS)     │
                                  └──────────────┬───────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
        ┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
        │   AuthController    │       │   Shows & Theaters  │       │  Booking Engine     │
        │  & User Management  │       │     Controllers     │       │  (Pessimistic Lock) │
        └──────────┬──────────┘       └──────────┬──────────┘       └──────────┬──────────┘
                   │                             │                             │
                   └─────────────────────────────┼─────────────────────────────┘
                                                 │ Service & Business Logic
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │ Spring Data JPA / Hibernate  │
                                  │    (@Version + Repository)   │
                                  └──────────────┬───────────────┘
                                                 │ JDBC Pool
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │     PostgreSQL (Supabase)    │
                                  └──────────────────────────────┘
                                                 ▲
                                                 │ Every 60s Check
                                  ┌──────────────┴──────────────┐
                                  │    SeatUnlockScheduler      │
                                  │  (Releases Expired Holds)   │
                                  └─────────────────────────────┘
```

---

## ⏳ Seat State Transition Lifecycle

```text
    ┌───────────────┐
    │   AVAILABLE   │ ◀────────────────────────────────────────┐
    └───────┬───────┘                                          │
            │ (User selects & initiates checkout)              │
            ▼                                                  │
    ┌───────────────┐                                          │ (5-Minute Hold Timeout
    │    LOCKED     │ ──▶ [Transaction Fails / Abandoned] ─────┤  via SeatUnlockScheduler
    └───────┬───────┘                                          │  OR User Cancellation)
            │ (Payment confirmed within 5 mins)                │
            ▼                                                  │
    ┌───────────────┐                                          │
    │    BOOKED     │                                          │
    └───────┬───────┘                                          │
            │ (Admin or User cancels reservation)              │
            └──────────────────────────────────────────────────┘
```

---

## 🛠️ Complete Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Backend Framework** | **Java 21 (LTS) & Spring Boot 3.5** | High-throughput enterprise REST API foundation |
| **Security & Auth** | **Spring Security 6 & JJWT 0.11.5** | Stateless authentication, BCrypt hashing, and RBAC |
| **Persistence** | **Spring Data JPA & Hibernate** | Relational mapping, pessimistic row-locking, dynamic queries |
| **Database** | **PostgreSQL** | ACID-compliant cloud relational database hosted on Supabase |
| **Task Scheduling** | **Spring Scheduling (`@Scheduled`)** | Background daemon for automated transient hold release |
| **API Docs** | **Springdoc OpenAPI 2.8.9 (Swagger UI)** | Interactive REST documentation with JWT Bearer support |
| **Boilerplate Reduction** | **Project Lombok** | Eliminates getters/setters/constructors across entities and DTOs |
| **Frontend Framework** | **React 19 & Vite 5** | High-performance SPA with modern React hooks |
| **Styling** | **Tailwind CSS 4** | Responsive cinema-inspired design with custom theme tokens |
| **Routing** | **React Router DOM v7** | Client-side routing, protected customer routes, and admin nested layout |
| **HTTP Client** | **Axios** | Interceptor-driven HTTP requests with automatic Bearer token injection |

---

## 📁 Repository Directory Structure

```text
CinePass/
├── src/main/java/com/tanya/cinepass/
│   ├── config/              # DataInitializer (admin seed), JpaAuditingConfig, OpenApiConfig
│   ├── controller/          # REST endpoints (Auth, Booking, Movie, Show, Theater, User)
│   ├── dto/                 # Request & Response Data Transfer Objects
│   ├── Exception/           # Global exception handler & custom HTTP error responses
│   ├── model/               # JPA Entities (Booking, Movie, Payment, Screen, Seat, Show, etc.)
│   ├── repository/          # Spring Data JPA repositories with custom locking queries
│   ├── scheduler/           # Automated SeatUnlockScheduler daemon
│   ├── security/            # JwtUtil, JwtAuthFilter, SecurityConfig, UserDetailsService
│   ├── service/             # Business logic layer (BookingService, MovieService, etc.)
│   └── CinePassApplication.java
├── src/main/resources/
│   └── application.properties # Dynamic environment properties (DB, JWT, Port, CORS)
├── cinepass-frontend/        # React 19 + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios API service modules
│   │   ├── components/      # UI primitives, cinema seat grid, navbar, footer
│   │   ├── context/         # AuthContext & persistent session management
│   │   ├── layouts/         # MainLayout and AdminLayout
│   │   ├── pages/           # Customer pages (Landing, Movies, SeatPicker, History)
│   │   │   └── admin/       # Admin portals (Theaters, Screens, Shows, Bookings)
│   │   └── utils/           # Formatters, constants, and helper utilities
│   └── package.json
└── pom.xml                  # Maven configuration with Java 21, Spring Boot 3, and dependencies
```

---

## 📡 REST API Reference Summary

| Module | Method | Endpoint | Description | Access |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register a new customer account | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer token | Public |
| **Movies** | `GET` | `/api/movies` | Fetch all currently active movies | Public |
| **Movies** | `POST` | `/api/movies` | Create a new movie listing | Admin |
| **Theaters** | `GET` | `/api/theaters` | List all theaters and screen configurations | Public |
| **Theaters** | `POST` | `/api/theaters` | Add a new theater property | Admin |
| **Shows** | `GET` | `/api/shows/movie/{id}` | Retrieve all upcoming shows for a movie | Public |
| **Shows** | `POST` | `/api/shows` | Schedule a show and generate seat allocations | Admin |
| **Booking** | `POST` | `/api/bookings/lock` | Atomically lock selected seats for 5 mins | User / Admin |
| **Booking** | `POST` | `/api/bookings/{id}/confirm-payment` | Confirm payment and finalize ticket | User / Admin |
| **Booking** | `GET` | `/api/bookings/{id}` | Retrieve booking receipt by ID | User / Admin |
| **Booking** | `GET` | `/api/bookings/user/{userId}` | List reservation history for a user | User / Admin |
| **Booking** | `PUT` | `/api/bookings/{id}/cancel` | Cancel booking and release seats | User / Admin |

*Interactive API documentation is accessible at `/swagger-ui.html` when running.*

---

## 💻 Local Development Setup

### Prerequisites
- **Java**: JDK 21 or higher
- **Node.js**: v18 or higher & npm
- **Database**: PostgreSQL (Local instance or free Supabase cloud instance)

### 1. Database Configuration
Create a database named `cinepass_db` or obtain your Supabase connection string. Set the following environment variables (or let them default locally):

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cinepass_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
```

### 2. Run Backend
```bash
# Windows
.\mvnw.cmd clean spring-boot:run

# Linux / macOS
./mvnw clean spring-boot:run
```
The backend starts on `http://localhost:8080`.
Swagger UI documentation is available at `http://localhost:8080/swagger-ui.html`.

### 3. Run Frontend
```bash
cd cinepass-frontend
npm install
npm run dev
```
The frontend launches on `http://localhost:5173`.

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
