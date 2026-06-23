import { useEffect } from "react";
import { Box, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useNotificationStore } from "../App.jsx";

export default function AllNotificationsPage() {
  const store = useNotificationStore();
  const { notifications, loading, error, viewedIds, loadAll, markViewed } = store;

  useEffect(() => {
    loadAll({ limit: 10, page: 1 });
  }, [loadAll]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>All Notifications</Typography>
      {loading && <CircularProgress size={24} />}
      {error && <Typography color="error">{error}</Typography>}
      {notifications.map((notification, index) => {
        const id = notification.id ?? notification.notification_id ?? `${index}`;
        const viewed = viewedIds.has(id);
        return (
          <Paper key={id} variant="outlined" sx={{ p: 2, opacity: viewed ? 0.7 : 1 }} onClick={() => markViewed(id)}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography fontWeight={600}>{notification.title || notification.message || "Untitled notification"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.description || notification.content || notification.notification_type || notification.type || "notification"}
                </Typography>
              </Box>
              <Chip size="small" label={viewed ? "Viewed" : "New"} color={viewed ? "default" : "primary"} />
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
