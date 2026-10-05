import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';

// We'll simulate a session since we are bypassing Supabase auth
type CustomSession = {
  access_token: string;
} | Session;

type AuthContextType = {
  session: CustomSession | null;
  loading: boolean;
  signIn: (passcode: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signIn: async () => ({ error: 'Not initialized' }),
  signOut: async () => {},
});

const PASSCODE_HASH = '031f17502b08e5d8d8cd21662cc631b2710bb3b193cd0e815250b7936ff0eec9';

async function hashPasscode(passcode: string) {
  const msgUint8 = new TextEncoder().encode(passcode);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CustomSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('custom_admin_session');
    if (storedSession) {
      setSession(JSON.parse(storedSession));
    }
    setLoading(false);
  }, []);

  const signIn = async (passcode: string) => {
    try {
      const hash = await hashPasscode(passcode);
      if (hash === PASSCODE_HASH) {
        const customSession = { access_token: 'custom-admin-token' };
        setSession(customSession);
        localStorage.setItem('custom_admin_session', JSON.stringify(customSession));
        return { error: null };
      } else {
        return { error: 'Invalid passcode' };
      }
    } catch (err) {
      return { error: 'Authentication failed' };
    }
  };

  const signOut = async () => {
    setSession(null);
    localStorage.removeItem('custom_admin_session');
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
