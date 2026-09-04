import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, getAuthSession } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onSessionInvalid?: () => void;
}

/**
 * Strict ProtectedRoute Component
 * Verifies active session with Supabase auth.getSession() or active persistent session.
 * If there is no active session, forcefully renders the fallback (Login/Sign-up) and blocks access.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  onSessionInvalid,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error || !data.session) {
            if (isMounted) {
              setIsAuthenticated(false);
              onSessionInvalid?.();
            }
            return;
          }
          if (isMounted) {
            setIsAuthenticated(true);
          }
        } catch {
          if (isMounted) {
            setIsAuthenticated(false);
            onSessionInvalid?.();
          }
        }
      } else {
        // Enforce active session verification
        const localSession = getAuthSession();
        if (isMounted) {
          if (localSession.isLoggedIn && localSession.email) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            onSessionInvalid?.();
          }
        }
      }
    }

    checkAuthSession();

    // Listen to changes in Supabase Auth
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session && isMounted) {
          setIsAuthenticated(false);
          onSessionInvalid?.();
        } else if (session && isMounted) {
          setIsAuthenticated(true);
        }
      });

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [onSessionInvalid]);

  // Loading state while verifying credentials
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-zinc-400">Verifying secure session...</span>
      </div>
    );
  }

  // Not authenticated: forceful redirect to login screen
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Authenticated: access granted
  return <>{children}</>;
};
