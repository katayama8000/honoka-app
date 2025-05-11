import { supabase } from "@/lib/supabase";
import type { User } from "@/types/Row";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: {
    user: User | null;
    token: string | null;
  } | null;
};

export const authAtom = atomWithStorage<AuthState>("auth", {
  isAuthenticated: false,
  isLoading: true,
  session: null,
});

export const authActionsAtom = atom(
  (get) => get(authAtom),
  async (get, set, action: { type: "SIGN_IN" | "SIGN_OUT" | "SET_SESSION" | "SET_LOADING"; payload?: any }) => {
    const { type, payload } = action;

    switch (type) {
      case "SIGN_IN":
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
          });
          
          if (error || !data.session) throw error;
          
          set(authAtom, {
            isAuthenticated: true,
            isLoading: false,
            session: {
              user: payload.user,
              token: data.session.access_token,
            },
          });
          return { success: true };
        } catch (error) {
          console.error("Sign in error:", error);
          return { success: false, error };
        }

      case "SIGN_OUT":
        try {
          await supabase.auth.signOut();
          set(authAtom, {
            isAuthenticated: false,
            isLoading: false,
            session: null,
          });
          return { success: true };
        } catch (error) {
          console.error("Sign out error:", error);
          return { success: false, error };
        }

      case "SET_SESSION":
        set(authAtom, {
          ...get(authAtom),
          isAuthenticated: !!payload,
          isLoading: false,
          session: payload,
        });
        return { success: true };

      case "SET_LOADING":
        set(authAtom, {
          ...get(authAtom),
          isLoading: payload,
        });
        return { success: true };

      default:
        return { success: false, error: "Unknown action" };
    }
  }
);
