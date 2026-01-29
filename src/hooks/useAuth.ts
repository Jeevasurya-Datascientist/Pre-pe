import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      console.log("[useAuth] Initializing...");
      try {
        // 1. Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[useAuth] getSession result:", session ? "Session found" : "No session");

        // 2. Validate session with server if it exists
        if (session) {
          console.log("[useAuth] Validating user with server...");
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            console.log("[useAuth] getUser failed or no user:", error);
            await supabase.auth.signOut();
            setAuthState({ user: null, session: null, loading: false });
            return;
          }
          console.log("[useAuth] getUser success for:", user.id);
          setAuthState({ user, session, loading: false });
        } else {
          setAuthState({ user: null, session: null, loading: false });
        }
      } catch (err) {
        console.error("[useAuth] Initialization error:", err);
        setAuthState({ user: null, session: null, loading: false });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[useAuth] onAuthStateChange event:", event);
        if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, session: null, loading: false });
        } else if (session) {
          setAuthState({ user: session.user, session, loading: false });
        } else {
          setAuthState({ user: null, session: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/home`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signUp,
    signIn,
    signOut,
  };
}
