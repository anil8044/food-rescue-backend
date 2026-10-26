# Food Rescue frontend

React + Vite + MUI app for the Food Rescue platform. The look (dark green, serif headings, status badges)
follows the Figma design. Every screen calls the real Spring Boot API.

## Run it

You need Node 18 or newer (`node -v`) and the backend running on `http://localhost:8080`.

```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Keep that port: the backend only accepts browser requests from
`localhost:5173` and `localhost:3000`. If the backend is somewhere else, copy `.env.example` to `.env`
and change `VITE_API_BASE_URL`.

## Accounts for testing

The backend's database is empty every time it restarts.

- **Donor and recipient organisation:** use the Register screen.
- **A new recipient organisation can't reserve until an admin approves it.**
- **Admin:** there is no way to register as one on purpose. With the backend running, paste this into PowerShell:

```
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/users -ContentType "application/json" -Body '{"fullName":"Network Admin","email":"admin@test.com","password":"password123","role":"ADMIN","organisationName":"SA Food Rescue Network"}'
```

## Screens and files

| Role | Screen | File |
|---|---|---|
| Everyone | Log in, register | `src/pages/auth/` |
| Everyone | Top bar, notification bell | `src/components/Layout.jsx`, `NotificationBell.jsx` |
| Donor | Donation hub: stats, history, post form | `src/pages/donor/DonorHome.jsx`, `DonationForm.jsx` |
| Recipient | Browse and reserve | `src/pages/recipient/BrowseDonationsPage.jsx` |
| Recipient | My reservations, report a problem | `MyReservationsPage.jsx`, `FlagProblemDialog.jsx` |
| Admin | Overview and stats | `src/pages/admin/AdminDashboard.jsx` |
| Admin | Incidents: review and resolve | `IncidentsPage.jsx` |
| Admin | Recipient approvals | `RecipientApprovalsPage.jsx` |
| Admin | Incident report for a date range | `IncidentReportPage.jsx` |

How it fits together:

- `src/api/client.js` sends every request and turns a failed response into an error message. The backend puts the
  explanation in the `error` field, and the screens show it.
- `src/api/index.js` has one function per backend endpoint. If an endpoint changes, change it here.
- `src/context/AuthContext.jsx` keeps the logged-in user. `src/components/RequireRole.jsx` stops a role opening
  another role's screens.
- `src/constants.js` holds the category list and status colours. The category codes must match the backend exactly.
- `src/theme.js` holds the colours and fonts from the design.

## What has and hasn't been checked

- The production build passes (`npm run build`).
- A 20-step browser walkthrough passed against a **fake API** written to mimic the backend's responses: log in as each
  role, post and cancel a donation, reserve, mark collected, report a problem, approve an organisation, resolve an
  incident, generate a report, register.
- It has **not** been run against the real backend yet. The first run against it is the real test. If something fails,
  open the browser's developer tools (F12), then Network, and look at the failing request and its response.
- `GET /api/users/pending-verifications` (used by Recipient approvals) had not been tested on the real backend.

## Known limits

- There are no login tokens. The logged-in user is kept in the browser, which is not real security. Say so in the report.
- Notifications are checked every 30 seconds, not pushed.
- Times are shown in the browser's time zone.
- The design's donor-type filter (Farm, Supermarket, Cafe) is left out, because the backend has no donor-type field.
