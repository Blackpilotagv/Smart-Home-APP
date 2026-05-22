import { create } from "zustand";

import {
  api,
  setToken,
  getToken,
} from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;

  loading: boolean;

  bootstrapped: boolean;

  bootstrap: () => Promise<void>;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
};

export const useAuthStore =
create<AuthState>((set) => ({

  user: null,

  loading: false,

  bootstrapped: false,

  // =========================
  // BOOTSTRAP
  // =========================

  bootstrap: async () => {

    try {

      const token =
        await getToken();

      // NO TOKEN

      if (!token) {

        set({
          user: null,
          bootstrapped: true,
        });

        return;
      }

      // LOAD USER

      const user =
        await api.me();

      set({
        user,
        bootstrapped: true,
      });

    } catch (error) {

      console.log(
        "BOOTSTRAP ERROR",
        error
      );

      await setToken(null);

      set({
        user: null,
        bootstrapped: true,
      });
    }
  },

  // =========================
  // LOGIN
  // =========================

  login: async (
    email,
    password
  ) => {

    set({
      loading: true,
    });

    try {

      const res =
        await api.login(
          email,
          password
        );

      await setToken(
        res.token
      );

      set({
        user: res.user,
        loading: false,
      });

    } catch (error) {

      set({
        loading: false,
      });

      throw error;
    }
  },

  // =========================
  // REGISTER
  // =========================

  register: async (
    name,
    email,
    password
  ) => {

    set({
      loading: true,
    });

    try {

      const res =
        await api.register(
          name,
          email,
          password
        );

      await setToken(
        res.token
      );

      set({
        user: res.user,
        loading: false,
      });

    } catch (error) {

      set({
        loading: false,
      });

      throw error;
    }
  },

  // =========================
  // LOGOUT
  // =========================

  logout: async () => {

    await setToken(null);

    set({
      user: null,
    });
  },

}));