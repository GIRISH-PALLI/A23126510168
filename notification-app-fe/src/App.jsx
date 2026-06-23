import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { AppBar, Box, Container, CssBaseline, Stack, Toolbar, Typography, Button } from "@mui/material";
import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import AllNotificationsPage from "./pages/AllNotificationsPage.jsx";
import PriorityViewPage from "./pages/PriorityViewPage.jsx";
import { createNotificationStore } from "./store/notificationsStore.js";
import { createLogger } from "./utils/logger.js";

const store = createNotificationStore();
const storeContext = createContext(store);
const logger = createLogger("app");

export function useNotificationStore() {
  const contextStore = useContext(storeContext);
  const snapshot = useSyncExternalStore(
    contextStore.subscribe,
    contextStore.getSnapshot,
    contextStore.getSnapshot
  );

  return useMemo(() => ({
    ...snapshot,
    loadAll: contextStore.loadAll,
    markViewed: contextStore.markViewed
  }), [snapshot, contextStore]);
}

function HeaderLink({ to, label }) {
  return (
    <Button
      component={NavLink}
      to={to}
      sx={{
        color: "inherit",
        textTransform: "none",
        fontWeight: 600,
        "&.active": { backgroundColor: "rgba(255,255,255,0.12)" }
      }}
    >
      {label}
    </Button>
  );
}

export default function App() {
  useEffect(() => {
    logger.info("App mounted");
  }, []);

  return (
    <storeContext.Provider value={store}>
      <BrowserRouter>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #f6f7fb 0%, #eef1f8 100%)" }}>
          <AppBar position="sticky" elevation={0} color="default">
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight={800}>Notification Hub</Typography>
              <Stack direction="row" spacing={1}>
                <HeaderLink to="/" label="All" />
                <HeaderLink to="/priority" label="Priority" />
              </Stack>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Routes>
              <Route path="/" element={<AllNotificationsPage />} />
              <Route path="/priority" element={<PriorityViewPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </storeContext.Provider>
  );
}
