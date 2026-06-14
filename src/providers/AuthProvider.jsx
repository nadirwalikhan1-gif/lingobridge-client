import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { connectSocket, disconnectSocket } from '../lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser   ] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then((result) => {
      const session = result?.data?.session ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        // FIX: pass role so server auto-joins interpreters/admins rooms
        const role = session.user?.user_metadata?.role ?? 'client';
        connectSocket(session.access_token, role);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.access_token) {
          // FIX: pass role on every auth state change (login, token refresh, etc.)
          const role = session.user?.user_metadata?.role ?? 'client';
          connectSocket(session.access_token, role);
        } else {
          disconnectSocket();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    disconnectSocket();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
