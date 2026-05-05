import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;
const TOKEN_KEY = "session_token";

export async function setToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function request(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const j = await res.json();
      detail = j.detail || JSON.stringify(j);
    } catch {}
    throw new Error(`${res.status}: ${detail}`);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  // auth
  exchangeSession: (sessionId: string) =>
    request("/auth/session", { method: "POST", body: JSON.stringify({ session_id: sessionId }) }),
  guestLogin: () => request("/auth/guest", { method: "POST" }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  // devices
  listDevices: () => request("/devices"),
  getDevice: (id: string) => request(`/devices/${id}`),
  createDevice: (data: any) => request("/devices", { method: "POST", body: JSON.stringify(data) }),
  updateDevice: (id: string, data: any) =>
    request(`/devices/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteDevice: (id: string) => request(`/devices/${id}`, { method: "DELETE" }),

  // automation
  listRules: () => request("/automation-rules"),
  createRule: (data: any) => request("/automation-rules", { method: "POST", body: JSON.stringify(data) }),
  updateRule: (id: string, data: any) =>
    request(`/automation-rules/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteRule: (id: string) => request(`/automation-rules/${id}`, { method: "DELETE" }),

  // logs
  listAccessLogs: (deviceId?: string) =>
    request(`/access-logs${deviceId ? `?device_id=${deviceId}` : ""}`),
  createAccessLog: (data: any) => request("/access-logs", { method: "POST", body: JSON.stringify(data) }),

  // notifs
  listNotifications: () => request("/notifications"),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  createNotification: (data: any) => request("/notifications", { method: "POST", body: JSON.stringify(data) }),

  // energy
  energySummary: (period: "day" | "week" | "month") => request(`/energy/summary?period=${period}`),
};
