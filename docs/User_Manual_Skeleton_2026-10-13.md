# Food Rescue user manual — working skeleton

Draft based on frontend 8817787, tested 13 October 2026. Screenshots are cross-referenced in the evidence index. Sections marked pending require a delivered screen and further testing.

## 1. Sign in and registration

Open the application. Choose Register for a new account, enter the displayed required details and select the appropriate offered role. An existing email produces an error. Recipient organisations await approval before reserving. Choose Login and enter your registered email and password. An incorrect password produces an error. Use Logout when finished. Admin account provisioning is managed separately; public admin registration was not tested.

## 2. Donor guide

1. Sign in as a donor. In this tested build, enter http://localhost:5173/donor in the same signed-in tab to reach the donor portal.
2. Use the donation form, enter food details, quantity, dates and pickup information, then submit.
3. Confirm the new item appears in your donation list as AVAILABLE. Browse Donations also displays available food.

Pending: verify every validation rule, edit/cancel actions, reserved-item restrictions, accurate date/address roundtrip and completed pickup status. Screenshot: donation-created.png.

## 3. Recipient guide

1. Register as a recipient organisation and sign in.
2. Open Browse Donations. A pending organisation can browse but cannot reserve.
3. After an administrator approves your organisation, log out and sign in again to refresh approval state.
4. Filter by category, open an available donation's reservation dialog, choose a scheduled pickup time and submit.
5. Confirm success. The reserved donation disappears from the available list.

Pending: My Reservations, collection, cancellation and incident reporting. The tested /recipient page currently shows Page not found, so instructions for these actions cannot yet be verified. Screenshots: pending-recipient.png, reservation-success.png.

## 4. Administrator guide

1. Sign in using an administrator account. In this tested build enter http://localhost:5173/admin in the same tab for the dashboard.
2. Enter http://localhost:5173/admin/approvals to view pending recipient organisations.
3. Review the listed organisation and choose Approve. Confirm success and removal from the pending list.
4. Ask the organisation to log out and sign in again before trying a reservation.

Pending: reject workflow, incident review/resolution and notification handling. Dashboard screenshot records the initial fixture, before approval/reservation. Screenshots: admin-dashboard-initial.png, approvals-pending.png, approvals-complete.png.

## 5. Troubleshooting

- Invalid login: check email and password, then retry.
- Pending approval: contact the administrator; sign in again after approval.
- Permission notice: use an account with the appropriate role.
- Page not found on /recipient in build 8817787: the route is a placeholder; report it to the frontend team.
- Empty category: try another category; available food may have been reserved already.

## 6. Remaining documentation

Add tested instructions and screenshots for collection/cancellation, incidents, rejection, notifications, mobile/keyboard operation and updated navigation. This is a skeleton, not a completed manual.
