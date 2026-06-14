import { useState, useContext, createContext, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derive a full name from whatever the API returns
  const normalizeUser = (raw) => {
    if (!raw) return null;
    
    const name = raw.name 
      || (raw.firstName && raw.lastName ? `${raw.firstName} ${raw.lastName}` : null)
      || raw.firstName
      || raw.displayName
      || raw.email?.split('@')[0]   // last resort: "nadirwalikhan1" from email
      || 'User';

    return {
      ...raw,
      name,
      email: raw.email || '',
      role: raw.role || 'client',
      avatar: raw.avatar || null,
    };
  };

  // Example: replace this with your real API call
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // const res = await fetch('/api/me');
        // const data = await res.json();
        // setUser(normalizeUser(data));
        
        // Remove this hardcoded block once API is wired:
        setUser(normalizeUser({
          firstName: 'Nadir',
          lastName: 'Wali Khan',
          email: 'nadirwalikhan1@gmail.com',
          role: 'client',
        }));
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
