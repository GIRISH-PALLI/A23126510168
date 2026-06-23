import { useEffect, useMemo } from "react";
import { Box, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useNotificationStore } from "../App.jsx";

function priorityScore(notification) {
  const type = String(notification.notification_type ?? notification.type ?? "").toLowerCase();
  if (type.includes("placement")) return 3;
  if (type.includes("result")) return 2;
  return 1;
}

function timeScore(notification) {
  const rawTime = notification.created_at ?? notification.timestamp ?? notification.date ?? notification.updated_at;
  const parsed = Date.parse(rawTime);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function PriorityViewPage() {
  const store = useNotificationStore();
  const { notifications, loading, error, loadAll, viewedIds, markViewed } = store;

  useEffect(() => {
    loadAll({ limit: 10, page: 1, notification_type: "placement" });
  }, [loadAll]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((left, right) => {
      const scoreDiff = priorityScore(right) - priorityScore(left);
      if (scoreDiff !== 0) return scoreDiff;
      return timeScore(right) - timeScore(left);
    });
  }, [notifications]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>Priority View</Typography>
      <Typography variant="body2" color="text.secondary">Placement items first, then recent items.</Typography>
      {loading && <CircularProgress size={24} />}
      {error && <Typography color="error">{error}</Typography>}
      {sortedNotifications.map((notification, index) => {
        const id = notification.id ?? notification.notification_id ?? `${index}`;
        const viewed = viewedIds.has(id);
        return (
          <Paper key={id} variant="outlined" sx={{ p: 2, borderColor: viewed ? "divider" : "primary.main" }} onClick={() => markViewed(id)}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography fontWeight={600}>{notification.title || notification.message || "Untitled notification"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.description || notification.content || notification.notification_type || notification.type || "notification"}
                </Typography>
              </Box>
              <Chip size="small" label={viewed ? "Viewed" : "New"} color={viewed ? "default" : "secondary"} />
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
