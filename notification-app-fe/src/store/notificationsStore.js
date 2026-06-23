import { createLogger } from "../utils/logger.js";

const logger = createLogger("store");
const BASE_URL = "/evaluation-service";
const EMAIL = "palligirishkumar.23.cse@anits.edu.in";
const NAME = "palli girish kumar";
const ROLL_NO = "a23126510168";
const ACCESS_CODE = "MTqxar";
const CLIENT_ID = "3a58c441-f0f4-42ab-a56e-230cd14e23ef";
const CLIENT_SECRET = "XJetpCrmCEXmCsVK";

async function authenticate() {
  // If a token has been manually stored in localStorage (for dev/testing), prefer it.
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("ACCESS_TOKEN");
      if (stored) {
        logger.info("Using ACCESS_TOKEN from localStorage");
        return stored;
      }
    }
  } catch (e) {
    // ignore localStorage access errors
  }
  const response = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: EMAIL,
      name: NAME,
      rollNo: ROLL_NO,
      accessCode: ACCESS_CODE,
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET
    })
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate");
  }

  const data = await response.json();
  return data.accessToken || data.access_token || data.token;
}

async function requestNotifications({ limit = 10, page = 1, notificationType } = {}) {
  const accessToken = await authenticate();
  const url = new URL(`${BASE_URL}/notifications`, window.location.origin);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  if (notificationType) {
    url.searchParams.set("notification_type", notificationType);
  }

  logger.info("Loading notifications", { limit, page, notificationType });
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Unable to load notifications");
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.notifications)) return data.notifications;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export function createNotificationStore() {
  const state = {
    notifications: [],
    viewedIds: new Set(),
    loading: false,
    error: ""
  };

  const listeners = new Set();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (patch) => {
    Object.assign(state, patch);
    emit();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return state;
    },
    async loadAll(options) {
      setState({ loading: true, error: "" });
      try {
        const notifications = await requestNotifications(options);
        setState({ notifications, loading: false });
      } catch (error) {
        logger.error(error.message);
        setState({ error: error.message, loading: false });
      }
    },
    markViewed(notificationId) {
      state.viewedIds.add(notificationId);
      emit();
    }
  };
}
