# Day 3 Backend QA Report — 2026-10-09

Tester: Haoxuan Liu
Backend commit tested: a63315a7d3632729f4815a93f962c21630562826
Environment: localhost:8080
Evidence folder: test-evidence/2026-10-09/

## Verified results

| Area | Test | Actual result | Outcome |
|---|---|---|---|
| Health | Backend health check | UP | PASS |
| Users | Create donor, recipient and admin | 201 | PASS |
| Users | List users and retrieve existing user | 200 | PASS |
| Users | Unknown user | 404 | PASS |
| Users | Invalid user ID | 400 | PASS |
| Users | Duplicate email | 400 | PASS |
| Login | Valid credentials | 200; user and role returned | PASS |
| Login | Wrong password or unknown email | 401 | PASS |
| Login | Blank email or password | 400 | PASS |
| Verification | List pending organisations | Pending recipient returned | PASS |
| Verification | Approve recipient organisation | 200; APPROVED | PASS |
| Notifications | Organisation approval | RECIPIENT_ORG_VERIFIED | PASS |
| Donations | Create donation | 201; AVAILABLE | PASS |
| Reservations | Unapproved organisation reserves | 400 | PASS |
| Reservations | Approved organisation reserves | 201; donation RESERVED | PASS |
| Reservations | Duplicate active reservation | 400 | PASS; message differs from docs |
| Notifications | Reservation created | RESERVATION_CONFIRMED to donor | PASS |
| Reservations | Cancel reservation | 200; donation AVAILABLE | PASS |
| Reservations | Reserve again after cancellation | 201 | PASS |
| Reservations | Collect reservation | 200; collectedAt populated; donation COLLECTED | PASS |
| Notifications | Donation collected | DONATION_COLLECTED to donor | PASS |
| Incidents | Create HIGH severity incident | 201; OPEN | PASS |
| Incidents | Donor details included | donorId, donorName, donorOrganisation present | PASS |
| Notifications | Flag incident with admin present | INCIDENT_FLAGGED to admin | PASS |
| Incidents | Set UNDER_REVIEW | 200; UNDER_REVIEW | PASS |
| Incidents | Resolve incident | 200; RESOLVED; resolvedAt and notes populated | PASS |
| Notifications | Resolve incident | INCIDENT_RESOLVED to reporter | PASS |
| Dashboard | Overall statistics | 200; counts matched test data | PASS |
| Dashboard | Donor, recipient and admin statistics | 200; role-specific counts matched | PASS |
| Dashboard | Unknown user statistics | 404 | PASS |
| Expiry | Donation passes collection deadline | Automatically changed AVAILABLE to EXPIRED | PASS |

## Documentation discrepancies

1. Incident severity example uses SEVERE, but the implementation accepts LOW, MEDIUM and HIGH.
   - SEVERE request returned 400.
   - HIGH request returned 201.
   - Evidence: create-incident.txt and create-incident-high.txt.
   - Recommended correction: update the documented example and allowed values.

2. Duplicate reservation error text differs from the documentation.
   - Actual: Donation is not available for reservation. Current status: RESERVED
   - Documented: Donation already has an active reservation
   - Both describe a rejected duplicate reservation; functional behaviour passed.
   - Evidence: reserve-duplicate.txt.
   - Recommended correction: align documented error text with the implementation.

## Test notes

- Incident 1 was created before an admin existed. Incident 2 was created after admin user 3 existed to verify admin notification delivery.
- Automatic expiry test: donation 2 had collectionDeadline 2026-10-09T05:07:40Z.
- It became EXPIRED at 2026-10-09T05:08:21.595966Z, about 42 seconds after the deadline.
- An earlier expiry check still showed AVAILABLE before the scheduled scan; both checks are retained.
- The PowerShell setup used expiryDate by mistake; that assignment failed. The existing expiryDateTime remained 2026-12-31T18:00:00Z. Creation succeeded and the collectionDeadline-based expiry test remained valid.
- This report covers the manual API tests above; it does not claim full endpoint, frontend or automated test coverage.

## Conclusion

The tested backend flows passed. Two documentation discrepancies require follow-up.
