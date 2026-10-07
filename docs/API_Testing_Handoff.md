# API Testing & Frontend Integration Handoff

Base URL (local dev): `http://localhost:8080/api`
Full endpoint reference: `API_DOCUMENTATION.md`

Start the backend with `mvn spring-boot:run` (from the folder containing `pom.xml`). The database is in memory and is **wiped on every restart**, so recreate your test data after a restart. Ids start again from 1.

---

## For Haoxuan: QA & Documentation

### Test run, 6 Oct 2026 (Anil)

A 43-request file was run in order against a fresh database. Ids in later requests assume that order: donor 1, recipient org 2, donations 1 and 2, reservations 1 to 3, incident 1. The status code was recorded for every request. Response bodies were read for the dashboard stats and the re-reservation, and for most requests in earlier runs.

| Blocks | What was tested | Expected | Result |
|---|---|---|---|
| 01–04 | Create donor, donation, list available, create recipient org | 201, 201, 200, 201 (`PENDING`) | Pass |
| 05 | Reserve while recipient is not approved | 400, "must be approved" | Pass |
| 06 | Donor tries to flag an incident | 400, "Only recipient organisations" | Pass |
| 07–10 | Approve recipient, reserve, available list now empty, mark collected | 200, 201, 200, 200 | Pass |
| 11–18 | Flag incident, list all, by donation, open, under review, resolve, open again (empty), report | 201 then 200s | Pass |
| 19 | Dashboard stats after resolving | `unresolvedIncidents` 0, `incidentsByStatus` `{"RESOLVED":1}` | Pass (body checked) |
| 20–21 | Donor stats, recipient stats | 200 | Pass |
| 22–24 | Create notification, list for user, mark read | 201, 200, 200 | Pass |
| 25 | Unread notifications for user 1 | 200, empty list | **Not run** |
| 26 | Duplicate email | 400 | Pass |
| 27–28 | Incident with no description, invalid severity | 400, 400 | Pass |
| 29–30 | Incident on donation 999, incident 999 | 404, 404 | Pass |
| 31–32 | User 999, user id `abc` | 404, 400 | Pass |
| 33–34 | Bad donation status `FOO`, missing `donorId` | 400, 400 | Pass |
| 35–37 | Notifications for user 999, invalid notification type, dashboard stats for user 999 | 404, 400, 404 | Pass |
| 38 | Report with a malformed date | 400 | Pass |
| 39–42 | Create donation 2, reserve it, cancel the reservation, donation 2 is `AVAILABLE` again | 201, 201, 204, 200 | Pass |
| 43 | Reserve donation 2 again after the cancel | 201 (bug fix) | **Fixed.** It returned `400` before the fix and `201` after it. |

Errors from every controller now return a JSON body with an `error` field that explains the problem. Assert on it in your tests, with one caveat: for the user, notification and dashboard endpoints only the status codes were recorded, so check the wording yourself.

### Login and incident donor fields (Anil, 6 Oct 2026)

| Test | Expected | Result |
|---|---|---|
| Log in as the donor with the correct password | 200; role `DONOR`; no password or hash in the body | Pass |
| Log in with a wrong password | 401, "Invalid email or password" | Pass |
| Log in with an unknown email | 401, same message as above | Pass |
| Log in as the recipient org | 200; role `RECIPIENT_ORG` | Pass (status recorded) |
| Log in with a blank email and password | 400 | Pass (status recorded) |
| `GET /api/incidents` after flagging an incident | Each incident includes `donorId`, `donorName`, `donorOrganisation` | Pass (body checked) |

After the donor-fields change, re-run blocks 12 to 18 of the 43-request file (incident lists, resolve, report). Their results haven't been reported yet.

### Still to run

**Quick confirmations**
- [ ] Block 25: unread notifications for user 1 (expect 200, empty list after marking read)
- [ ] Send block 43 a second time: expect `400` with "Donation already has an active reservation"
- [ ] `GET /api/reservations`: reservation 2 `CANCELLED`, reservation 3 `PENDING`, both on donation 2
- [ ] `GET /api/donations/2`: status `RESERVED`

**Login**
- [ ] Log in as an `ADMIN` (create one with `POST /api/users`, role `ADMIN`) and check the role comes back
- [ ] Log in with spaces around the email, and with different capitalisation (record what happens)
- [ ] Register through `POST /api/users` with role `ADMIN` (currently allowed; see known issues)

**Users and notifications (untested success paths)**
- [ ] `GET /users/{id}` and `GET /users/email/{email}` for an existing user
- [ ] `GET /users/pending-verifications`
- [ ] `DELETE /users/{id}`, including a user who has donations
- [ ] Notifications: by id, read-all, delete, unread list
- [ ] Create a user with an invalid email format, and with a very short password (record what happens)

**Incidents**
- [ ] `GET /incidents/{id}` for an existing incident
- [ ] Two incidents on one donation: both listed, report counts both
- [ ] Report for a range with no incidents (expect `totalIncidents` 0)
- [ ] Moving a `RESOLVED` incident back to `OPEN`. The API allows it; note it for the team to decide
- [ ] A `PENDING` recipient flags an incident (currently allowed)
- [ ] A recipient flags a donation it never reserved (currently allowed; raise with Chenlu)

**Donations and reservations**
- [ ] Donation with zero or negative quantity (expect 400)
- [ ] Donation with a non-existent `donorId` (expect 404)
- [ ] Reserve a donation that is already `RESERVED` (expect 400)
- [ ] Reserve a donation after it has been marked `COLLECTED`
- [ ] Reservation status changes: `CONFIRMED`, `CANCELLED` through the PATCH endpoint, and the donation's status after each

### Known issues

1. **No real authentication.** Login checks the password but there is no token, so anyone can call any endpoint as any user.
2. **Incident flagging is loose.** There is no check that the flagging org collected that donation or is approved.
3. **Anyone can register as `ADMIN`.** `POST /api/users` accepts any role, so the registration screen must only offer Donor and Recipient organisation.
4. **Notifications aren't created automatically** by donations, reservations or incidents.
5. **Test data disappears on restart.**

Keep a defect log with screenshots and the request and response for every failing case. The 43-request file can be saved as shared test evidence. It's your regression run: re-run it after any backend change.

---

## For Yeyun & Ree: Frontend

### Setup
- The backend runs on `http://localhost:8080`. CORS allows `http://localhost:3000` and `http://localhost:5173`.
- Log in with `POST /api/auth/login` (body `{"email": "...", "password": "..."}`). It returns the user, including `id` and `role`, or `401` with "Invalid email or password". There is no token, so keep the returned user in the app and pass its id where an endpoint asks for it.
- On any failed request, show the `error` field from the response body. The text is written for users.
- Timestamps are ISO-8601 instants.

### Endpoints by screen

**Donor portal (Yeyun)**
| Action | Endpoint |
|---|---|
| Register | `POST /api/users` with role `DONOR` |
| Post a donation | `POST /api/donations?donorId={id}` |
| Donation list (a plain dated list is enough) | `GET /api/donations/donor/{donorId}` |

**Admin screens (Yeyun)**
| Action | Endpoint |
|---|---|
| Stats cards | `GET /api/dashboard/stats` |
| Open incident count | `unresolvedIncidents` in the stats response |
| Incident list | `GET /api/incidents`, or `/api/incidents/status/OPEN` for open ones |
| Mark under review | `PATCH /api/incidents/{id}/status?status=UNDER_REVIEW` |
| Resolve with notes | `PATCH /api/incidents/{id}/resolve` with `{"resolutionNotes": "..."}` |
| Approve a recipient org | `PUT /api/users/{id}` with `{"verificationStatus": "APPROVED"}` |
| Pending orgs | `GET /api/users/pending-verifications` (not yet tested) |
| Incident report for a period | `GET /api/incidents/report?from=...&to=...` |

**Recipient portal (Ree)**
| Action | Endpoint |
|---|---|
| Register | `POST /api/users` with role `RECIPIENT_ORG` |
| Browse available donations | `GET /api/donations/available` |
| Reserve | `POST /api/reservations?recipientOrgId={id}` |
| My reservations | `GET /api/reservations/recipient/{recipientOrgId}` |
| Cancel a reservation | `DELETE /api/reservations/{id}` |
| Flag a problem with a donation | `POST /api/donations/{donationId}/incidents?reportedByUserId={id}` with `{"description": "...", "severity": "MINOR" \| "MODERATE" \| "SEVERE"}` |

### Dropdown values
- Category: `FRESH_PRODUCE`, `BAKERY`, `DAIRY`, `MEAT_AND_SEAFOOD`, `PANTRY_AND_DRY_GOODS`, `PREPARED_MEALS`, `BEVERAGES`, `OTHER`
- Incident severity: `MINOR`, `MODERATE`, `SEVERE`
- Incident status: `OPEN`, `UNDER_REVIEW`, `RESOLVED`

### Things to know
- A new recipient org starts as `PENDING` and **can't reserve** until approved. For testing, approve it with the `PUT` call above.
- A reserved donation disappears from `/api/donations/available`. Refresh the list after a reservation.
- Cancelling a reservation puts the donation back in the available list, and it can then be reserved again.
- Each incident includes `donorId`, `donorName` and `donorOrganisation`, so the admin incident list needs no extra lookup.
- Only users with role `RECIPIENT_ORG` can flag an incident. Show the "Flag a problem" button only to recipient orgs.

---

*Compiled by Anil, 6 Oct 2026, from the source code and manual testing.*
