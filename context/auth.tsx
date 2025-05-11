import { supabase } from "@/lib/supabase";
import { authActionsAtom, authAtom } from "@/state/auth.state";
import { userAtom } from "@/state/user.state";
import { useAtom, useSetAtom } from "jotai";
import { ReactNode, createContext, useCallback, useContext, useEffect } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: any;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth] = useAtom(authAtom);
  const authActions = useSetAtom(authActionsAtom);
  const setUser = useSetAtom(userAtom);

  const checkSession = useCallback(async () => {
    try {
      authActions({ type: "SET_LOADING", payload: true });
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        authActions({ type: "SET_SESSION", payload: null });
        return null;
      }
      
      // Get user data from your database
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", parseInt(data.session.user.id, 10))
        .single();
      
      if (userData) {
        setUser(userData);
        authActions({
          type: "SET_SESSION",
          payload: {
            user: userData,
            token: data.session.access_token,
          },
        });
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error("Check session error:", error);
      authActions({ type: "SET_SESSION", payload: null });
      return null;
    }
  }, [authActions, setUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error || !data.session) {
        return { success: false, error };
      }
      
      // Get user data
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", parseInt(data.session.user.id, 10))
        .single();
      
      if (userData) {
        setUser(userData);
        return authActions({
          type: "SIGN_IN", 
          payload: { email, password, user: userData }
        });
      }
      
      return { success: false, error: "User data not found" };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signOut = async () => {
    setUser(null);
    return authActions({ type: "SIGN_OUT" });
  };

  useEffect(() => {
    checkSession();
    
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        checkSession();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        authActions({ type: "SET_SESSION", payload: null });
      }
    });
    
    return () => {
      data.subscription.unsubscribe();
    };
  }, [checkSession, authActions, setUser]);

  const value = {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    session: auth.session,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
