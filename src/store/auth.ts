import { create } from "zustand";
import { api, setToken, getToken } from "../services/api";

type User = {
  user_id: string;
  email: string;
  name: string;
  picture?: string | null;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  bootstrapped: boolean;
  bootstrap: () => Promise<void>;
  setSession: (token: string, user: User) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  bootstrapped: false,
  bootstrap: async () => {
    set({ loading: true });
    try {
      const token = await getToken();
      if (!token) {
        set({ user: null, bootstrapped: true, loading: false });
        return;
      }
      const me = await api.me();
      set({ user: me, bootstrapped: true, loading: false });
    } catch {
      await setToken(null);
      set({ user: null, bootstrapped: true, loading: false });
    }
  },
setSession: async (token, user) => {
  await setToken(token);
  set({ user, bootstrapped: true });
},

guestLogin: async () => {
  set({ loading: true });
  try {
    // Fake demo user
    const demoUser: User = {
      user_id: "guest_001",
      email: "guest@demo.com",
      name: "Guest User",
      picture: null,
    };

    const demoToken = "demo-token-123";

    await setToken(demoToken);

    set({
  user: demoUser,
  loading: false,
  bootstrapped: true,
});
console.log("User set:", demoUser);
  } catch (e) {
    set({ loading: false });
    throw e;
  }
},

  logout: async () => {
    try {
      await api.logout();
    } catch {}
    await setToken(null);
    set({ user: null });
  },
}));
