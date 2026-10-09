# Food Rescue frontend

Day 1 (7 October) foundation: React + TypeScript + Vite, MUI, React Router, and one shared API client.

## Local development

Requires Node 22.12+ (this machine uses Node 22.23.3).

1. Start the existing Spring Boot backend on http://localhost:8080.
2. Run `npm install`.
3. Optionally copy `.env.example` to `.env.local` to change the API URL.
4. Run `npm run dev` and open http://localhost:5173.

Port 5173 is fixed because the backend's CORS configuration allows that origin.
H2 development data disappears when the backend restarts.

## Checks

- `npm run build`: TypeScript check and production build.
- `npm run lint`: static lint checks.
- Open home: service status checks GET /api/donations/available.
- An empty response is a successful connection with no donations.
- Stop the backend and reload: an error and retry action appear.
- Open an unknown URL: the not-found page links back home.

## Structure

- `src/api/client.ts`: API base URL, JSON requests, backend error messages, network errors, abort support, and empty responses (including 204).
- `src/layouts/AppLayout.tsx`: shared header, main content, and footer.
- `src/pages/HomePage.tsx`: initial page and real backend connection check.
- `src/App.tsx`: routes.
- `src/main.tsx`: MUI theme and router providers.

Login, registration, role navigation, browsing, reservations, and incident reporting are subsequent tasks.

## Team handoff

This is a separate local directory beside the backend. It has not been connected to a GitHub remote or pushed.
Integrate with Anil's frontend repository before opening a PR; do not overwrite an existing team frontend.


## Day 2 authentication (8 October task)

- Routes: /login and /register; header shows the user and logout after login.
- Registration only offers DONOR and RECIPIENT_ORG. Fields match the existing backend; no extra password length rule.
- Registration calls POST /users, then POST /auth/login, and returns home on success. If automatic login fails, the login page shows the registration-success notice.
- Login returns to the originating path, query and hash, or home when no source exists.
- A role mismatch for /donor, /recipient or /admin returns home with the exact dialog text: 无权限.
- Session uses sessionStorage. Clicking, typing, touch and scrolling renew a 600-second idle deadline; mouse movement does not.
- Expiry clears the session and opens login with the expired-session notice. The return path is preserved.
- The backend has no token. Frontend session and role checks are UX controls, not server authentication.
- RoleBoundary is ready for integration with the team role pages. Those pages have not yet been added.
- npm test runs deterministic idle timer and return-path/role tests using Node 22's mock timers.

Validation: build and lint pass; four automated tests pass. Browser checked real login, incorrect password, refresh persistence, logout and role-mismatch dialog. A disposable recipient account was created through the local API. Registration UI and automatic-login fallback still need a human end-to-end check. GitHub push/PR requires the team remote.

## Day 3 and Day 4 browsing and reservation

Public route: /donations; Category is kept in the query string. All eight categories match the backend. Login from a reserve button returns to the same browse/filter page.

Only approved recipient organisations can reserve. Pending and rejected accounts can browse, but reserve is disabled. Donor/admin accounts can browse publicly but cannot reserve. Approval changes take effect on logout and login; refreshing donations does not refresh the user's verification state.

Reservations cover the entire donation. Scheduled pickup is optional, entered in the device's local timezone and sent as an ISO instant. No future/deadline restriction is added. Success closes the dialog, shows the reservation ID/status and refreshes available donations. Backend error text remains in the dialog. RoleBoundary now wraps /recipient/*, /donor/* and /admin/*; the corresponding team business pages are still pending integration.
