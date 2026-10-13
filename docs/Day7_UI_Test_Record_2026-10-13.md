# Day 7 UI execution record — 13 October 2026

Tester: Haoxuan Liu. Local environment: Windows, frontend localhost:5173, backend localhost:8080. Main frontend build: detached checkout 8817787 (recipient approvals). Early authentication checks used 40670c2. Backend commit was not captured. Results below cover observed subchecks, not all 68 cases in the Day 6 plan. No fixes or retests were supplied.

| Observed check | Result | Evidence / actual result |
|---|---|---|
| Empty registration full-name validation (40670c2) | Pass | Browser required-field prompt; other fields not individually tested |
| Donor registration (40670c2) | Pass | QA Donor created and signed in as DONOR |
| Incorrect password (40670c2) | Pass | Invalid email or password feedback |
| Correct donor login (40670c2) | Pass | Home displays donor role |
| Donor portal empty state (8817787) | Pass | Empty donation list and zero counters |
| Create donation | Pass | QA Bread 1013 created; one AVAILABLE donation shown |
| Browse as donor | Pass | Donation displayed; reservation unavailable to donor |
| Category filter | Partial | Dairy produces empty state; Bakery returns bread; clear-filter action untested |
| Duplicate registration email | Pass | Email already exists feedback |
| Pending recipient | Pass | Pending approval notice; reservation disabled |
| Admin login and dashboard | Pass | ADMIN login and direct /admin route work; initial counters match then-known fixture |
| Pending approvals list | Pass | QA Community Kitchen listed pending |
| Approve recipient | Pass | Approval success, pending list becomes empty; recipient can reserve after logout/login |
| Create reservation | Pass | Success shown; donation removed from available browse; API confirms reservation 1 PENDING |
| Scheduled pickup storage | Pass | 2026-10-14T01:30:00Z corresponds to Adelaide 12:00; My Reservations display untested |
| Donation state after reservation | Pass | API donation 1 RESERVED; final stats totalDonations=1, activeDonations=0, totalReservations=1 |
| Final approval statistics | Pass | API verifiedRecipients=1, pendingVerifications=0, totalUsers=3 |
| Recipient access to /admin | Pass | Redirect to home with permission notice; other role/route combinations untested |
| Current home console | Pass, narrow scope | No red error in final home console screenshot; entire-flow console history not retained |
| My Reservations / collection / cancellation UI | Blocked | /recipient maps to NotFoundPage in this build |
| Incident reporting / admin incident UI | Blocked | No incident route in supplied App.tsx for this build; other branches not assessed |
| Fix verification | Not run | No corrected build supplied |

## Final API fixture

Donation: id 1, donorId 1, title QA Bread 1013, BAKERY, quantity 5 portions, RESERVED. Reservation: id 1, recipientOrgId 2, PENDING, collectedAt null. Admin user id 3. No completed pickup or incident was tested.

Final dashboard: totalDonations 1; activeDonations 0; totalReservations 1; completedReservations 0; totalUsers 3; verifiedRecipients 1; pendingVerifications 0; donationsByStatus RESERVED=1; donationsByCategory BAKERY=1; unreadNotifications 2; totalIncidents 0; unresolvedIncidents 0. Final dashboard UI was not recaptured, so these are API checks, not a final UI/API equality claim.

Donation expiry 2026-10-15T03:46:00Z; collection deadline 2026-10-14T03:46:00Z; pickupAddress empty. Exact submitted date/address inputs were not evidenced, so no date/address defect is confirmed. Notification UI and delivery were not tested.

## Coverage limits and next execution

The Day 6 workbook remains the original plan; this report is its supplementary execution record. Broad cases only partially exercised must not be marked fully passed. Continue collection, cancellation, incident flows, rejection, repeated submission, request failure, keyboard/mobile checks and full console review as screens become available. Recheck incident severity values against current backend: startup schema showed LOW/MEDIUM/HIGH, unlike older documentation.

Screenshot references are listed in evidence-index.md. Local in-memory data may disappear after backend restart.
