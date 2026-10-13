# Day 7 UI findings — 13 October 2026

Frontend tested: 8817787. Entries are open; ownership and priority require team triage. No retest has been performed.

| ID | Finding | Reproduction / observed result | Impact | Status |
|---|---|---|---|---|
| UI-D7-001 | Role pages lack visible navigation | Sign in as DONOR or ADMIN. Home navigation shows Home, Browse Donations and Logout; /donor, /admin and /admin/approvals require direct URL entry in observed screens | Users may not discover role tasks. Suggested medium priority, subject to agreed navigation design | Open observation; frontend team to triage |
| UI-D7-002 | Recipient page is a placeholder | Sign in as approved recipient and open /recipient. Page not found; App.tsx maps recipient/* to NotFoundPage | My Reservations, collection and cancellation cannot be tested through this page | Blocked / page unavailable in tested build |
| UI-D7-003 | Incident UI unavailable in tested route set | Inspect supplied App.tsx: no incident-report or incident-management route | Incident workflow and associated manual sections cannot be completed | Blocked / delivery status to confirm |

Do not treat unavailable pages as confirmed regressions without agreed delivery criteria. No defect is confirmed for date conversion or pickup address because exact submitted values were not captured. Frontend permission feedback was observed; backend authorization security was not tested.

Retest checklist: obtain corrected commit, repeat exact reproduction, capture screenshot and relevant API state, record expected/actual outcome, then close only on verified success.
