# Food Rescue Backend - REST API Documentation

## Overview

This document describes the REST API endpoints available in the Food Rescue Backend Spring Boot application. All requests should include the `Content-Type: application/json` header.

Base URL: `http://localhost:8080/api`

---

## User Management (`/api/users`)

### List All Users
- **GET** `/api/users`
- **Description**: Retrieve all registered users (admin only)
- **Response**: `200 OK` - List of UserDTOs

### Get User by ID
- **GET** `/api/users/{id}`
- **Description**: Retrieve a specific user by ID
- **Parameters**: 
  - `id` (path, required): User ID
- **Response**: `200 OK` - UserDTO or `404 Not Found`

### Get User by Email
- **GET** `/api/users/email/{email}`
- **Description**: Retrieve a user by their email address
- **Parameters**:
  - `email` (path, required): User email
- **Response**: `200 OK` - UserDTO or `404 Not Found`

### Create User
- **POST** `/api/users`
- **Description**: Create a new user account
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

### Update User
- **PUT** `/api/users/{id}`
- **Description**: Update an existing user's information
- **Parameters**:
  - `id` (path, required): User ID
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "organisationName": "Updated Org",
    "phoneNumber": "08 9876 5432",
    "address": "456 New St",
    "verificationStatus": "VERIFIED"
  }
  ```
- **Response**: `200 OK` - Updated UserDTO or `404 Not Found`

### Delete User
- **DELETE** `/api/users/{id}`
- **Description**: Delete a user account
- **Parameters**:
  - `id` (path, required): User ID
- **Response**: `204 No Content` or `404 Not Found`

### Get Pending Verifications
- **GET** `/api/users/pending-verifications`
- **Description**: Retrieve all recipient organizations awaiting verification
- **Response**: `200 OK` - List of UserDTOs with PENDING status

---

## Donation Management (`/api/donations`)

### List All Donations
- **GET** `/api/donations`
- **Description**: Retrieve all donations
- **Response**: `200 OK` - List of DonationDTOs

### Get Donation by ID
- **GET** `/api/donations/{id}`
- **Description**: Retrieve a specific donation
- **Parameters**:
  - `id` (path, required): Donation ID
- **Response**: `200 OK` - DonationDTO or `404 Not Found`

### Get Available Donations
- **GET** `/api/donations/available`
- **Description**: Browse available donations (for recipient organizations)
- **Response**: `200 OK` - List of available DonationDTOs

### Get Donor's Donations
- **GET** `/api/donations/donor/{donorId}`
- **Description**: Retrieve all donations from a specific donor
- **Parameters**:
  - `donorId` (path, required): Donor user ID
- **Response**: `200 OK` - List of DonationDTOs or `404 Not Found`

### Create Donation
- **POST** `/api/donations`
- **Description**: Create a new food donation
- **Query Parameters**:
  - `donorId` (required): ID of the donor creating the donation
- **Request Body**:
  ```json
  {
    "title": "Fresh Vegetables",
    "description": "Surplus vegetables from today's stock",
    "category": "VEGETABLES",
    "quantity": 50,
    "quantityUnit": "kg",
    "dietaryInfo": "Organic, pesticide-free",
    "storageInfo": "Keep refrigerated below 5°C",
    "expiryDateTime": "2026-08-15T18:00:00Z",
    "collectionDeadline": "2026-08-15T17:00:00Z",
    "pickupAddress": "123 Market St, Adelaide"
  }
  ```
- **Response**: `201 Created` - Created DonationDTO or `400 Bad Request`

### Get Donations by Status
- **GET** `/api/donations/status/{status}`
- **Description**: Retrieve donations filtered by status
- **Parameters**:
  - `status` (path, required): One of AVAILABLE, RESERVED, COLLECTED, EXPIRED, CANCELLED
- **Response**: `200 OK` - List of DonationDTOs

### Update Donation Status
- **PATCH** `/api/donations/{id}/status`
- **Description**: Change donation status
- **Parameters**:
  - `id` (path, required): Donation ID
  - `status` (query, required): New status
- **Response**: `200 OK` - Updated DonationDTO or `404 Not Found`

### Delete Donation
- **DELETE** `/api/donations/{id}`
- **Description**: Delete/cancel a donation
- **Parameters**:
  - `id` (path, required): Donation ID
- **Response**: `204 No Content` or `404 Not Found`

---

## Reservation Management (`/api/reservations`)

### List All Reservations
- **GET** `/api/reservations`
- **Description**: Retrieve all reservations
- **Response**: `200 OK` - List of ReservationDTOs

### Get Reservation by ID
- **GET** `/api/reservations/{id}`
- **Description**: Retrieve a specific reservation
- **Parameters**:
  - `id` (path, required): Reservation ID
- **Response**: `200 OK` - ReservationDTO or `404 Not Found`

### Get Recipient Organization's Reservations
- **GET** `/api/reservations/recipient/{recipientOrgId}`
- **Description**: Retrieve all reservations for a recipient organization
- **Parameters**:
  - `recipientOrgId` (path, required): Recipient organization user ID
- **Response**: `200 OK` - List of ReservationDTOs or `404 Not Found`

### Create Reservation
- **POST** `/api/reservations`
- **Description**: Create a new reservation for a donation
- **Query Parameters**:
  - `recipientOrgId` (required): ID of the recipient organization
- **Request Body**:
  ```json
  {
    "donationId": 1,
    "scheduledPickupTime": "2026-08-15T16:30:00Z"
  }
  ```
- **Response**: `201 Created` - Created ReservationDTO or `400 Bad Request`

### Get Reservations by Status
- **GET** `/api/reservations/status/{status}`
- **Description**: Retrieve reservations filtered by status
- **Parameters**:
  - `status` (path, required): One of PENDING, CONFIRMED, COLLECTED, CANCELLED
- **Response**: `200 OK` - List of ReservationDTOs

### Update Reservation Status
- **PATCH** `/api/reservations/{id}/status`
- **Description**: Change reservation status
- **Parameters**:
  - `id` (path, required): Reservation ID
  - `status` (query, required): New status
- **Response**: `200 OK` - Updated ReservationDTO or `404 Not Found`

### Cancel Reservation
- **DELETE** `/api/reservations/{id}`
- **Description**: Cancel a reservation
- **Parameters**:
  - `id` (path, required): Reservation ID
- **Response**: `204 No Content` or `404 Not Found`

---

## Notification Management (`/api/notifications`)

### Get User Notifications
- **GET** `/api/notifications/user/{userId}`
- **Description**: Retrieve all notifications for a user
- **Parameters**:
  - `userId` (path, required): User ID
- **Response**: `200 OK` - List of NotificationDTOs or `404 Not Found`

### Get Unread Notifications
- **GET** `/api/notifications/user/{userId}/unread`
- **Description**: Retrieve unread notifications for a user
- **Parameters**:
  - `userId` (path, required): User ID
- **Response**: `200 OK` - List of unread NotificationDTOs or `404 Not Found`

### Get Notification by ID
- **GET** `/api/notifications/{id}`
- **Description**: Retrieve a specific notification
- **Parameters**:
  - `id` (path, required): Notification ID
- **Response**: `200 OK` - NotificationDTO or `404 Not Found`

### Create Notification
- **POST** `/api/notifications`
- **Description**: Create a new notification (system/admin only)
- **Query Parameters**:
  - `recipientId` (required): ID of recipient user
  - `type` (required): One of NEW_DONATION_AVAILABLE, RESERVATION_CONFIRMED, DONATION_EXPIRING_SOON, DONATION_COLLECTED, RECIPIENT_ORG_VERIFIED
  - `message` (required): Notification message text
  - `relatedDonationId` (optional): Related donation ID if applicable
- **Response**: `201 Created` - Created NotificationDTO or `400 Bad Request`

### Mark Notification as Read
- **PATCH** `/api/notifications/{id}/read`
- **Description**: Mark a single notification as read
- **Parameters**:
  - `id` (path, required): Notification ID
- **Response**: `200 OK` - Updated NotificationDTO or `404 Not Found`

### Mark All as Read
- **PATCH** `/api/notifications/user/{userId}/read-all`
- **Description**: Mark all notifications as read for a user
- **Parameters**:
  - `userId` (path, required): User ID
- **Response**: `204 No Content` or `404 Not Found`

### Delete Notification
- **DELETE** `/api/notifications/{id}`
- **Description**: Delete a notification
- **Parameters**:
  - `id` (path, required): Notification ID
- **Response**: `204 No Content` or `404 Not Found`

---

## Dashboard & Analytics (`/api/dashboard`)

### Get Overall Dashboard Statistics
- **GET** `/api/dashboard/stats`
- **Description**: Retrieve comprehensive platform statistics
- **Response**: `200 OK` - DashboardStatsDTO
  ```json
  {
    "totalDonations": 45,
    "activeDonations": 12,
    "totalReservations": 38,
    "completedReservations": 35,
    "totalUsers": 20,
    "verifiedRecipients": 8,
    "pendingVerifications": 2,
    "donationsByStatus": {
      "AVAILABLE": 12,
      "RESERVED": 5,
      "COLLECTED": 25,
      "EXPIRED": 2,
      "CANCELLED": 1
    },
    "donationsByCategory": {
      "VEGETABLES": 15,
      "BAKERY": 8,
      "FRUIT": 12,
      "PREPARED_MEALS": 10
    },
    "unreadNotifications": 5
  }
  ```

### Get User-Specific Statistics
- **GET** `/api/dashboard/user/{userId}/stats`
- **Description**: Retrieve statistics for a specific user
- **Parameters**:
  - `userId` (path, required): User ID
- **Response**: `200 OK` - User statistics object or `404 Not Found`
  - For DONOR users: totalDonations, donationsByStatus, totalQuantityDonated, unreadNotifications
  - For RECIPIENT_ORG users: totalReservations, reservationsByStatus, completedReservations, totalQuantityReceived, unreadNotifications

---

## Error Responses

All endpoints return standard error responses on failure:

```json
{
  "status": 400,
  "message": "Bad Request",
  "error": "Detailed error message",
  "timestamp": "2026-08-13T12:34:56.789Z",
  "path": "/api/donations"
}
```

### Common Status Codes:
- `200 OK` - Successful retrieval
- `201 Created` - Successful creation
- `204 No Content` - Successful deletion/update with no content
- `400 Bad Request` - Invalid input or business logic violation
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication & Authorization

Currently, the API does not enforce authentication. Production deployment should implement:
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
