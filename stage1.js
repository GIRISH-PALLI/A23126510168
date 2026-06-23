import { createLogger } from "./Logging Middleware/logger.js";

const logger = createLogger("stage1");

const BASE_URL = "http://4.224.186.213/evaluation-service";
const EMAIL = "palligirishkumar.23.cse@anits.edu.in";
const NAME = "palli girish kumar";
const ROLL_NO = "a23126510168";
const ACCESS_CODE = "MTqxar";
const CLIENT_ID = "3a58c441-f0f4-42ab-a56e-230cd14e23ef";
const CLIENT_SECRET = "XJetpCrmCEXmCsVK";
const DEFAULT_TOP_N = 5;

const typeWeights = {
  placement: 3,
  result: 2,
  event: 1
};

async function authenticate() {
  // Allow overriding with an existing token via environment variable for quick testing/submission
  if (process.env.ACCESS_TOKEN) {
    logger.info("Using ACCESS_TOKEN from environment");
    return process.env.ACCESS_TOKEN;
  }

  logger.info("Requesting fresh access token");
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
    const errorText = await response.text();
    throw new Error(`Auth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.accessToken || data.access_token || data.token || data.jwt;
}

function normalizeType(notification) {
  const rawType = String(notification.notification_type ?? notification.type ?? notification.category ?? "").toLowerCase();
  if (rawType.includes("placement")) return "placement";
  if (rawType.includes("result")) return "result";
  if (rawType.includes("event")) return "event";
  return "event";
}

function getTimestamp(notification) {
  const rawTime = notification.created_at ?? notification.timestamp ?? notification.time ?? notification.date ?? notification.updated_at;
  const parsed = Date.parse(rawTime);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function rankNotifications(notifications) {
  return [...notifications].sort((left, right) => {
    const leftType = normalizeType(left);
    const rightType = normalizeType(right);
    const weightDiff = (typeWeights[rightType] || 0) - (typeWeights[leftType] || 0);
    if (weightDiff !== 0) return weightDiff;
    return getTimestamp(right) - getTimestamp(left);
  });
}

async function fetchNotifications(accessToken) {
  logger.info("Fetching notifications");
  const response = await fetch(`${BASE_URL}/notifications?limit=10&page=1`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notifications request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.notifications)) return data.notifications;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function formatNotification(notification) {
  const type = normalizeType(notification);
  const title = notification.title || notification.message || notification.content || "Untitled notification";
  const time = notification.created_at || notification.timestamp || notification.date || "unknown time";
  return `${type.toUpperCase()} | ${title} | ${time}`;
}

async function main() {
  const topN = Number(process.argv[2] || DEFAULT_TOP_N);
  const accessToken = await authenticate();
  const notifications = await fetchNotifications(accessToken);
  const ranked = rankNotifications(notifications).slice(0, topN);

  console.log(`Top ${ranked.length} notifications`);
  ranked.forEach((notification, index) => {
    console.log(`${index + 1}. ${formatNotification(notification)}`);
  });
}

main().catch((error) => {
  logger.error(error.message);
  process.exitCode = 1;
});
