# Food Rescue Backend - REST API Documentation

Base URL (local dev): `http://localhost:8080/api`
All request bodies are JSON (`Content-Type: application/json`).

**Status key**
- ✅ Tested by hand on 6 Oct 2026
- ◻️ Implemented, but not tested individually

All seven controllers (auth, users, donations, reservations, incidents, notifications, dashboard) were reviewed on 6 Oct 2026, along with `UserService`, `AuthService` and the donation, reservation, incident and analytics services. `NotificationService` was not reviewed, so its exact error wording is unconfirmed.

---

## Allowed values (use these exactly)

| Field | Values |
|---|---|
| `role` | `DONOR`, `RECIPIENT_ORG`, `ADMIN` |
| `verificationStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| Donation `category` | `FRESH_PRODUCE`, `BAKERY`, `DAIRY`, `MEAT_AND_SEAFOOD`, `PANTRY_AND_DRY_GOODS`, `PREPARED_MEALS`, `BEVERAGES`, `OTHER` |
| Donation `status` | `AVAILABLE`, `RESERVED`, `COLLECTED`, `EXPIRED`, `CANCELLED` |
| Reservation `status` | `PENDING`, `CONFIRMED`, `COLLECTED`, `CANCELLED` |
| Incident `severity` | `MINOR`, `MODERATE`, `SEVERE` |
| Incident `status` | `OPEN`, `UNDER_REVIEW`, `RESOLVED` |
| Notification `type` | `NEW_DONATION_AVAILABLE`, `RESERVATION_CONFIRMED`, `DONATION_EXPIRING_SOON`, `DONATION_COLLECTED`, `RECIPIENT_ORG_VERIFIED` |

Dates and times are ISO-8601 instants, for example `2026-12-31T18:00:00Z`.

---

## Error responses ✅

Every controller now passes errors to one central handler, so all endpoints return the same JSON shape:

```json
{
  "status": 400,
  "message": "Bad Request",
  "error": "Only recipient organisations can flag an incident",
  "timestamp": "2026-10-06T01:31:48.406447800Z",
  "path": "/api/donations/1/incidents"
}
```

`error` holds the explanation and is safe to show to users.

| Situation | Status | `error` text |
|---|---|---|
| Missing or invalid field in a request body | 400 | `description: Description is required` |
| Unknown enum value in a request body (e.g. severity `CRITICAL`) | 400 | `The request body is malformed or contains an invalid value, such as an unknown severity or category.` |
| Invalid value in the URL (e.g. `/donations/status/FOO`) | 400 | `Invalid value 'FOO' for parameter 'status'.` |
| Required query parameter missing | 400 | `Required parameter 'donorId' is missing.` |
| Business rule broken | 400 | `Recipient organisation must be approved before making reservations` |
| Wrong email or password at login | 401 | `Invalid email or password` |
| Record not found | 404 | `Donation not found with ID: 999` |
| Unexpected server error | 500 | varies |

Business-rule errors that were checked: reserving as an unapproved recipient, a donor flagging an incident, a duplicate email on user creation, a malformed incident-report date. Not-found checks: unknown donation, incident, user, notification list and dashboard user, all returning `404`. For the user, notification and dashboard cases only the status code was recorded in testing. From the `UserService` source, a duplicate email says `Email already exists: <email>` and an unknown user says `User not found with ID: <id>` (or `... with email: <email>`).

**How 404 is chosen:** a plain error message containing "not found" becomes `404`. Any other deliberate error becomes `400`.

---

## Login (`/api/auth`) ✅

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Check an email and password and return the user |

**Request**
```json
{
  "email": "donor@test.com",
  "password": "password123"
}
```
Returns `200` with the user, including the role the frontend needs to show the right screens. The password hash is never returned:
```json
{
  "id": 1,
  "fullName": "Test Donor",
  "email": "donor@test.com",
  "role": "DONOR",
  "organisationName": "Test Cafe",
  "phoneNumber": null,
  "address": null,
  "verificationStatus": null,
  "createdAt": "2026-10-06T08:57:37.906630Z"
}
```
- A wrong password and an unknown email both return `401` with the same text, `Invalid email or password`, so the response doesn't reveal which accounts exist.
- A blank email or password returns `400` with a validation message.
- **There is no token.** The frontend keeps the returned user and sends the user id where an endpoint asks for it. This is a stop-gap for the project, not real security (see Known limitations).

---

## Users (`/api/users`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/users` | ✅ List all users |
| GET | `/api/users/{id}` | ✅ `404` for an unknown id, `400` for a non-numeric id. Success path ◻️ |
| GET | `/api/users/email/{email}` | ◻️ |
| POST | `/api/users` | ✅ Create a user. A duplicate email returns `400` |
| PUT | `/api/users/{id}` | ✅ Update a user, including verification |
| DELETE | `/api/users/{id}` | ◻️ |
| GET | `/api/users/pending-verifications` | ◻️ |

**Create a user**
```json
{
  "fullName": "Test Donor",
  "email": "donor@test.com",
  "password": "password123",
  "role": "DONOR",
  "organisationName": "Test Cafe",
  "phoneNumber": "08 1234 5678",
  "address": "123 Main St"
}
```
Returns `201`. `verificationStatus` is `null` for donors and admins and starts as `PENDING` for `RECIPIENT_ORG`. A duplicate email returns `400`. The API accepts any `role`, including `ADMIN`, so the registration screen should only offer Donor and Recipient organisation.

**Approve a recipient organisation** (required before it can reserve anything)
```
PUT /api/users/{id}
{ "verificationStatus": "APPROVED" }
```
The value is `APPROVED`. `VERIFIED` is not valid.

---

## Donations (`/api/donations`) ✅

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/donations` | All donations |
| GET | `/api/donations/{id}` | One donation |
| GET | `/api/donations/available` | Donations with status `AVAILABLE` |
| GET | `/api/donations/donor/{donorId}` | One donor's donations |
| POST | `/api/donations?donorId={id}` | Create a donation |
| GET | `/api/donations/status/{status}` | Filter by status |
| PATCH | `/api/donations/{id}/status?status={STATUS}` | Change status |
| DELETE | `/api/donations/{id}` | Delete (204) |

**Create a donation**
```json
{
  "title": "Fresh Bread",
  "description": "Surplus loaves from today",
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
Required: `title`, `category`, `quantity` (positive), `quantityUnit`, `expiryDateTime`, `collectionDeadline`. Returns `201` with `status: "AVAILABLE"`.

---

## Reservations (`/api/reservations`) ✅

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/reservations` | All reservations |
| GET | `/api/reservations/{id}` | One reservation |
| GET | `/api/reservations/recipient/{recipientOrgId}` | A recipient org's reservations |
| POST | `/api/reservations?recipientOrgId={id}` | Create a reservation |
| GET | `/api/reservations/status/{status}` | Filter by status |
| PATCH | `/api/reservations/{id}/status?status={STATUS}` | Change status |
| DELETE | `/api/reservations/{id}` | Cancel (204) |

**Create a reservation**
```json
{
  "donationId": 1,
  "scheduledPickupTime": "2026-12-31T16:00:00Z"
}
```
Returns `201` with `status: "PENDING"`. The request fails with `400` unless all of these hold:
- the user is a `RECIPIENT_ORG`
- that org's `verificationStatus` is `APPROVED`
- the donation's status is `AVAILABLE`
- the donation has no active reservation (one that isn't `CANCELLED`)

On success the donation's status becomes `RESERVED`.

**Side effects of status changes**
- Setting a reservation to `COLLECTED` sets the donation to `COLLECTED` and records `collectedAt`.
- Setting it to `CANCELLED`, or calling DELETE, sets the donation back to `AVAILABLE`.

**Re-reserving after a cancellation works** ✅ (fixed 6 Oct 2026). A donation can have several reservation rows over time, for example a cancelled one followed by a new one, but only one active at a time. The second attempt while one is active should return `400` with "Donation already has an active reservation" (expected from the code, response not yet recorded).

---

## Incidents ✅ (food-safety flagging)

Added after the host organisation asked for recipient organisations to be able to flag a problem with a donation, and for admins to follow it up.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/donations/{donationId}/incidents?reportedByUserId={id}` | Flag an incident |
| GET | `/api/donations/{donationId}/incidents` | Incidents for one donation |
| GET | `/api/incidents` | All incidents, newest first |
| GET | `/api/incidents/{id}` | One incident (`404` if missing) |
| GET | `/api/incidents/status/{status}` | Filter by `OPEN`, `UNDER_REVIEW` or `RESOLVED` |
| PATCH | `/api/incidents/{id}/status?status={STATUS}` | Change status, e.g. to `UNDER_REVIEW` |
| PATCH | `/api/incidents/{id}/resolve` | Resolve with notes |
| GET | `/api/incidents/report?from={instant}&to={instant}` | Summary for a date range |

**Flag an incident** (the reporter must have role `RECIPIENT_ORG`, otherwise `400`)
```json
{
  "description": "Verbal use-by date did not match the date printed on the stock",
  "severity": "SEVERE"
}
```
Returns `201`:
```json
{
  "id": 1,
  "donationId": 1,
  "donationTitle": "Fresh Bread",
  "donorId": 1,
  "donorName": "Test Donor",
  "donorOrganisation": "Test Cafe",
  "reportedById": 2,
  "reportedByName": "Kitchen Contact",
  "description": "Verbal use-by date did not match the date printed on the stock",
  "severity": "SEVERE",
  "status": "OPEN",
  "reportedAt": "2026-10-06T01:15:51.374220100Z",
  "resolvedAt": null,
  "resolutionNotes": null
}
```
Every incident response includes the donor who supplied the item (`donorId`, `donorName`, `donorOrganisation`) alongside the donation and the reporting organisation.

**Resolve an incident**
```json
{ "resolutionNotes": "Donor contacted and the date check added to the collection process" }
```
Returns `200` with `status: "RESOLVED"` and `resolvedAt` set.

**Period report**, e.g. `GET /api/incidents/report?from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z`
```json
{
  "from": "2026-01-01T00:00:00Z",
  "to": "2026-12-31T23:59:59Z",
  "totalIncidents": 1,
  "incidentsBySeverity": { "SEVERE": 1 },
  "incidentsByStatus": { "RESOLVED": 1 },
  "incidents": [ ... ]
}
```
Dates that aren't valid ISO-8601 instants return `400`.

---

## Notifications (`/api/notifications`)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/notifications/user/{userId}` | ✅ `404` for an unknown user |
| GET | `/api/notifications/user/{userId}/unread` | ◻️ |
| GET | `/api/notifications/{id}` | ◻️ |
| POST | `/api/notifications?recipientId=&type=&message=&relatedDonationId=` | ✅ `201`. An invalid `type` returns `400` |
| PATCH | `/api/notifications/{id}/read` | ✅ |
| PATCH | `/api/notifications/user/{userId}/read-all` | ◻️ |
| DELETE | `/api/notifications/{id}` | ◻️ |

The donation, reservation and incident services do not create notifications, so nothing is generated automatically yet. Notifications exist only when created through `POST /api/notifications`.

---

## Dashboard (`/api/dashboard`) ✅

### Overall statistics
`GET /api/dashboard/stats`

```json
{
  "totalDonations": 2,
  "activeDonations": 1,
  "totalReservations": 2,
  "completedReservations": 1,
  "totalUsers": 2,
  "verifiedRecipients": 1,
  "pendingVerifications": 0,
  "donationsByStatus": { "AVAILABLE": 1, "COLLECTED": 1 },
  "donationsByCategory": { "BAKERY": 1, "FRESH_PRODUCE": 1 },
  "unreadNotifications": 0,
  "totalIncidents": 1,
  "unresolvedIncidents": 0,
  "incidentsByStatus": { "RESOLVED": 1 },
  "incidentsBySeverity": { "SEVERE": 1 }
}
```
`unresolvedIncidents` counts incidents that are `OPEN` or `UNDER_REVIEW`. This is the number an admin needs to follow up.

### User statistics
`GET /api/dashboard/user/{userId}/stats` returns `200` for a donor and for a recipient org, and `404` for an unknown user. From the source, the fields are:
- Donor: `totalDonations`, `donationsByStatus`, `totalQuantityDonated`, `unreadNotifications`
- Recipient org: `totalReservations`, `reservationsByStatus`, `completedReservations`, `totalQuantityReceived`, `unreadNotifications`
- Admin: `unreadNotifications` only

---

## Known limitations

1. **No real authentication.** Login checks the password but returns no token, and every other endpoint is open (`permitAll`). Anyone can call any endpoint as any user id, and anyone can register as `ADMIN` through `POST /api/users`.
2. **Incident flagging is loosely controlled.** Any user with role `RECIPIENT_ORG` can flag any donation, even one they never reserved, and even if the org is still `PENDING`.
3. **No automatic notifications** from donation, reservation or incident actions.
4. **Data resets on restart.** The dev database is H2 in memory, so everything is wiped each time the app restarts and ids start again from 1.

---

## Running the application

```bash
mvn spring-boot:run        # run from the folder containing pom.xml
```
H2 console: `http://localhost:8080/h2-console`. JDBC URL `jdbc:h2:mem:foodrescue`, user `sa`, blank password.

If Maven fails with `Index 6 out of bounds`, run `mvn clean` and start again.

---

*Last checked: 6 Oct 2026, from the controller and service source, a 43-request manual test run, five login tests and the incident donor fields. `NotificationService` has not been reviewed.*
