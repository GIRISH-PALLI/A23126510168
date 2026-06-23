# A23126510168 - Campus Notifications

This repository contains:
- `stage1.js` — Stage 1 priority inbox script
- `notification-app-fe/` — Stage 2 React frontend
- `Notification_System_Design.md` — design explanation

## Stage 1

The Stage 1 script fetches notifications from the protected API and ranks them by:
1. Placement
2. Result
3. Event

If two notifications have the same type, the more recent one is ranked higher.

### Run Stage 1

```powershell
$env:ACCESS_TOKEN = 'PASTE_YOUR_TOKEN_HERE'
node stage1.js
```

## Stage 2

A React frontend (Material UI) that displays all notifications and a separate Priority Notifications view, with filtering by notification type and a distinction between new and viewed notifications.

### Run Stage 2

```powershell
cd notification-app-fe
npm install
npm start
```

Runs on `http://localhost:3000`.

## Logging Middleware

A reusable `Log(stack, level, package, message)` function is integrated throughout both stages, posting to the evaluation server's logging endpoint.
