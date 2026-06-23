# Notification System Design

This submission keeps the implementation simple.

## Stage 1
- A single Node.js script authenticates, fetches notifications, ranks them by type weight and recency, and prints the top N items.
- Priority order: placement > result > event.
- No database is used.

## Stage 2
- A small React app shows all notifications and a separate priority view.
- A shared logger wrapper records fetch and UI activity.
- The app uses API query params for limit, page, and notification_type.
- New and viewed notifications are tracked in local state.
