# Food Rescue Backend - REST API Documentation

## Overview

This document describes the REST API endpoints available in the Food Rescue Backend Spring Boot application. All requests should include the `Content-Type: application/json` header.

Base URL: `http://localhost:8080/api`

> **Update note (16 Sept 2026):** Sections marked  below have been checked directly against the current source code and manually tested. Sections marked  have NOT been re-verified since parts of this project (the dashboard/analytics layer in particular) were changed by someone other than the original author — treat those sections as possibly outdated until someone confirms them against the actual controller code.

---

## User Management (`/api/users`)  Not yet re-verified

The endpoints below are as originally documented. `UserController.java` and `UserService.java` have not been re-checked against this — if anyone edited them, this section may be stale. **Two corrections below are confirmed**, the rest is unverified.

### List All Users
- **GET** `/api/users`
- **Response**: `200 OK` - List of UserDTOs
- ✅ Tested and working.

### Get User by ID
- **GET** `/api/users/{id}`
- **Response**: `200 OK` - UserDTO or `404 Not Found`

### Get User by Email
- **GET** `/api/users/email/{email}`
- **Response**: `200 OK` - UserDTO or `404 Not Found`

### Create User
- **POST** `/api/users`
- **Request Body**:
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "secure_password",
    "role": "DONOR",
    "organisationName": "Acme Corp",
    "phoneNumber": "08 1234 5678",
    "address": "123 Main St"
  }
  ```
- **Response**: `201 Created` - Created UserDTO or `400 Bad Request`
- ✅ Tested and working. Note: `verificationStatus` is `null` for `DONOR` and `ADMIN` roles, and defaults to `"PENDING"` automatically for `RECIPIENT_ORG` — you don't set it on creation.

### Update User
- **PUT** `/api/users/{id}`
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "organisationName": "Updated Org",
    "phoneNumber": "08 9876 5432",
    "address": "456 New St",
    "verificationStatus": "APPROVED"
  }
  ```
- **Response**: `200 OK` - Updated UserDTO or `404 Not Found`
- ✅ **Corrected**: the value is `"APPROVED"`, not `"VERIFIED"` as the doc previously said. `ReservationService` explicitly checks for `VerificationStatus.APPROVED` — using `"VERIFIED"` will silently fail to unlock reservation ability for a recipient org.

### Delete User
- **DELETE** `/api/users/{id}`
- **Response**: `204 No Content` or `404 Not Found`

### Get Pending Verifications
- **GET** `/api/users/pending-verifications`
- **Response**: `200 OK` - List of UserDTOs with PENDING status

---

## Donation Management (`/api/donations`) Verified against source + tested

### List All Donations
- **GET** `/api/donations`
- **Response**: `200 OK` - List of DonationDTOs

### Get Donation by ID
- **GET** `/api/donations/{id}`
- **Response**: `200 OK` - DonationDTO or `404 Not Found`

### Get Available Donations
- **GET** `/api/donations/available`
- **Response**: `200 OK` - List of available DonationDTOs
- ✅ Tested and working.

### Get Donor's Donations
- **GET** `/api/donations/donor/{donorId}`
- **Response**: `200 OK` - List of DonationDTOs or `404 Not Found`

### Create Donation
- **POST** `/api/donations`
- **Query Parameters**: `donorId` (required)
- **Request Body**:
  ```json
  {
    "title": "Fresh Bread",
    "description": "Surplus loaves from today's stock",
    "category": "BAKERY",
    "quantity": 5,
    "quantityUnit": "kg",
    "dietaryInfo": "Contains gluten",
    "storageInfo": "Store at room temperature",
    "expiryDateTime": "2026-12-31T18:00:00Z",
    "collectionDeadline": "2026-12-31T17:00:00Z",
    "pickupAddress": "123 Market St, Adelaide"
  }
  ```
- **Response**: `201 Created` - Created DonationDTO or `400 Bad Request`
- ✅ Tested and working.
- **Corrected `category` values** — the previous doc used `"VEGETABLES"`, which is not a valid value and will cause a `400`. The actual valid values are:
  `FRESH_PRODUCE`, `BAKERY`, `DAIRY`, `MEAT_AND_SEAFOOD`, `PANTRY_AND_DRY_GOODS`, `PREPARED_MEALS`, `BEVERAGES`, `OTHER`

### Get Donations by Status
- **GET** `/api/donations/status/{status}`
- **Parameters**: `status` — one of `AVAILABLE`, `RESERVED`, `COLLECTED`, `EXPIRED`, `CANCELLED`
- **Response**: `200 OK` - List of DonationDTOs

### Update Donation Status
- **PATCH** `/api/donations/{id}/status`
- **Parameters**: `status` (query, required)
- **Response**: `200 OK` - Updated DonationDTO or `404 Not Found`

### Delete Donation
- **DELETE** `/api/donations/{id}`
- **Response**: `204 No Content` or `404 Not Found`

---

## Reservation Management (`/api/reservations`) Verified against source + tested

### List All Reservations
- **GET** `/api/reservations`
- **Response**: `200 OK` - List of ReservationDTOs

### Get Reservation by ID
- **GET** `/api/reservations/{id}`
- **Response**: `200 OK` - ReservationDTO or `404 Not Found`

### Get Recipient Organization's Reservations
- **GET** `/api/reservations/recipient/{recipientOrgId}`
- **Response**: `200 OK` - List of ReservationDTOs or `404 Not Found`

### Create Reservation
- **POST** `/api/reservations`
- **Query Parameters**: `recipientOrgId` (required)
- **Request Body**:
  ```json
  {
    "donationId": 1,
    "scheduledPickupTime": "2026-12-31T16:00:00Z"
  }
  ```
- **Response**: `201 Created` - Created ReservationDTO or `400 Bad Request`
- ✅ Tested and working. Business rules enforced in `ReservationService` (confirmed by reading the source):
  - The `recipientOrgId` must belong to a user with role `RECIPIENT_ORG`
  - That user's `verificationStatus` must be `APPROVED`
  - The target donation's status must be `AVAILABLE`
  - The donation must not already have an active reservation
  - On success, the donation's status is automatically flipped to `RESERVED` (same transaction — both succeed or both roll back together)

### Get Reservations by Status
- **GET** `/api/reservations/status/{status}`
- **Parameters**: `status` — one of `PENDING`, `CONFIRMED`, `COLLECTED`, `CANCELLED`
- **Response**: `200 OK` - List of ReservationDTOs

### Update Reservation Status
- **PATCH** `/api/reservations/{id}/status`
- **Response**: `200 OK` - Updated ReservationDTO or `404 Not Found`
- Confirmed in source: setting status to `COLLECTED` also marks the linked donation `COLLECTED` and records `collectedAt`. Setting status to `CANCELLED` also reverts the donation back to `AVAILABLE`.

### Cancel Reservation
- **DELETE** `/api/reservations/{id}`
- **Response**: `204 No Content` or `404 Not Found`
- Confirmed in source: also reverts the linked donation's status back to `AVAILABLE`.

---

## Notification Management (`/api/notifications`)  Not yet re-verified

`NotificationController.java` has not been checked against this documentation — endpoints below are as originally documented and unconfirmed.

### Get User Notifications
- **GET** `/api/notifications/user/{userId}`

### Get Unread Notifications
- **GET** `/api/notifications/user/{userId}/unread`

### Get Notification by ID
- **GET** `/api/notifications/{id}`

### Create Notification
- **POST** `/api/notifications`
- **Query Parameters**: `recipientId`, `type`, `message`, `relatedDonationId` (optional)
- **Valid `type` values** (unverified — confirm against current `Notification` model): `NEW_DONATION_AVAILABLE`, `RESERVATION_CONFIRMED`, `DONATION_EXPIRING_SOON`, `DONATION_COLLECTED`, `RECIPIENT_ORG_VERIFIED`

### Mark Notification as Read
- **PATCH** `/api/notifications/{id}/read`

### Mark All as Read
- **PATCH** `/api/notifications/user/{userId}/read-all`

### Delete Notification
- **DELETE** `/api/notifications/{id}`

---

## Dashboard & Analytics  Likely outdated — needs confirmation

**This section is probably wrong.** We've confirmed that `DashboardService.java` was replaced by a new `AnalyticsService.java` (with a different, Lombok-based `DashboardStatsDTO`) at some point after this doc was originally written, by someone other than the original author. The endpoint path, response shape, and even whether it's still under `/api/dashboard` or has moved (e.g. `/api/analytics`) are all unconfirmed.

**Action needed:** whoever wrote `AnalyticsService`/`AnalyticsController` should update this section with the real current endpoint(s) and response shape. Do not rely on the example below until someone confirms it:

<details>
<summary>Original (possibly stale) documentation — click to expand</summary>

### Get Overall Dashboard Statistics
- **GET** `/api/dashboard/stats`
- **Response**: `200 OK`
  ```json
  {
    "totalDonations": 45,
    "activeDonations": 12,
    "totalReservations": 38,
    "completedReservations": 35,
    "totalUsers": 20,
    "verifiedRecipients": 8,
    "pendingVerifications": 2,
    "donationsByStatus": { "AVAILABLE": 12, "RESERVED": 5, "COLLECTED": 25, "EXPIRED": 2, "CANCELLED": 1 },
    "donationsByCategory": { "VEGETABLES": 15, "BAKERY": 8, "FRUIT": 12, "PREPARED_MEALS": 10 },
    "unreadNotifications": 5
  }
  ```
  Note: `donationsByCategory` example above uses the old, incorrect category names — see the corrected list in the Donation Management section.

### Get User-Specific Statistics
- **GET** `/api/dashboard/user/{userId}/stats`

</details>

---

## Error Responses  Corrected based on actual tested behavior

**This section was previously inaccurate.** The API does **not** consistently return a JSON error body — the actual behavior depends on where the error occurs, confirmed by manual testing:

### Validation errors (e.g. missing required field, caught by `@Valid`)
These ARE caught by `GlobalExceptionHandler` and return a proper JSON body:
```json
{
  "status": 400,
  "message": "Validation failed",
  "error": "title: Title is required",
  "path": "/api/donations"
}
```

### Business-rule errors (e.g. donor not found, donation already reserved, recipient not approved)
These are currently caught **locally inside the controller** (`DonationController` and `ReservationController` both do this) and return an **empty body** with no explanation:
```
HTTP/1.1 400 Bad Request
Content-Length: 0
```
This is a known gap — worth fixing so these errors go through `GlobalExceptionHandler` too instead of being swallowed locally. Until fixed, don't rely on the response body to explain *why* a `400` happened for these cases — check the server logs instead, or rely on knowing the business rules listed above.

### Common Status Codes
- `200 OK` - Successful retrieval
- `201 Created` - Successful creation
- `204 No Content` - Successful deletion/update with no content
- `400 Bad Request` - Invalid input or business logic violation (see note above on inconsistent error bodies)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication & Authorization

Currently, the API does not enforce authentication — confirmed in `SecurityConfig.java` (`.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())`). A `PasswordEncoder` (BCrypt) bean is already wired in for when JWT auth is added later. Production deployment should implement:
- JWT token-based authentication
- Role-based access control (RBAC) using Spring Security
- Endpoint restrictions by role (e.g., admin-only operations)

---

## Running the Application

```bash
# Development (H2 in-memory database)
mvn spring-boot:run

# The API will be available at http://localhost:8080/api
```

H2 console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:foodrescue`
- Username: `sa`
- Password: (leave empty)

---

*Last verified: 16 Sept 2026, by Anil, against `DonationController`, `DonationService`, `ReservationController`, `ReservationService`, `FoodCategory`, `SecurityConfig`, and `GlobalExceptionHandler`. User, Notification, and Dashboard/Analytics sections still need someone to re-check them against current source.*
