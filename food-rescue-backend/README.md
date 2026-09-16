# A10 — Local Food Rescue and Redistribution Platform (Backend)

Spring Boot backend for the South Australian Food Rescue Network platform.
COMP 5800, Semester 2 2026.

## What's here

This is the **data model foundation** (Phase 2, Week 4 of the project schedule):

- `model/` — JPA entities: `User`, `Donation`, `Reservation`, `Notification`,
  plus supporting enums (`Role`, `DonationStatus`, `ReservationStatus`,
  `FoodCategory`, `VerificationStatus`).
- `repository/` — Spring Data JPA repositories with the query methods the
  REST API layer will need (browsing available donations, a donor's
  donation history, a recipient org's reservations, unread notifications).
- `application.yml` — two profiles:
  - `dev` (default): in-memory H2 database, zero setup, auto-creates tables.
  - `prod`: PostgreSQL via environment variables, for deployment.

## Not yet built (next steps)

- REST controllers (`@RestController`) exposing these entities over HTTP
- Spring Security configuration (JWT auth, role-based access control)
- Service layer with business logic (e.g. reservation conflict checks,
  auto-expiring overdue donations)
- DTOs / request-response validation

## Running it locally

Requires Java 17+ and Maven.

```bash
mvn spring-boot:run
```

The app starts on `http://localhost:8080` using the in-memory H2 database
(profile `dev`). You can inspect the database at `http://localhost:8080/h2-console`
(JDBC URL: `jdbc:h2:mem:foodrescue`, username `sa`, no password).

## Deploying (prod profile)

Set these environment variables (see Budget section of the Assessment 1
proposal — free-tier Render/Railway Postgres):

```
DATABASE_URL=jdbc:postgresql://<host>:<port>/<db>
DATABASE_USERNAME=<username>
DATABASE_PASSWORD=<password>
```

Then run with `SPRING_PROFILES_ACTIVE=prod`.

## Data model overview

```
User (DONOR | RECIPIENT_ORG | ADMIN)
  └── posts →  Donation (AVAILABLE → RESERVED → COLLECTED / EXPIRED / CANCELLED)
                   └── has at most one →  Reservation (PENDING → CONFIRMED → COLLECTED / CANCELLED)
                                              └── made by →  User (RECIPIENT_ORG)

Notification → belongs to a User, references a Donation (optional)
```

Recipient organisations start with `verificationStatus = PENDING` and must
be approved by an admin before reserving donations — this satisfies the
"user verification" requirement in the Assessment 1 project scope.
