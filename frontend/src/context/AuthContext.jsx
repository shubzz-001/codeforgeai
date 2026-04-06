import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function parseToken(data) {
  return data?.token || data?.accessToken || data?.access_token || data?.jwt || null;
}

function parseUser(data) {
  const raw = data?.user || data?.userDetails || data?.userData || data;
  if (!raw?.id && !raw?.email && !raw?.name && !raw?.username) return null;
  return {
    id:       raw.id,
    name:     raw.name     || raw.username || '',
    username: raw.username || raw.name     || '',
    email:    raw.email    || '',
    role:     raw.role     || '',
  };
}

// Read saved token — but do a basic sanity check so obviously
// corrupted/empty values don't count as "has token"
const rawToken   = localStorage.getItem('codeforge_token');
const savedToken = rawToken && rawToken.length > 10 ? rawToken : null;

// If the stored value was garbage, clean it up immediately
if (rawToken && !savedToken) {
  localStorage.removeItem('codeforge_token');
}

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(null);
  const [loading,         setLoading]         = useState(!!savedToken);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!savedToken) return;

    // Validate saved token against the backend
    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    api.get('/auth/profile')
      .then(res => {
        const u = parseUser(res.data);
        if (u) setUser(u);
      })
      .catch((err) => {
        // Profile check failed (expired token etc.) — clear everything.
        // The axios interceptor already clears localStorage + redirects for
        // 401/403, but we also clear here defensively.
        console.warn('[Auth] Profile check failed, clearing session:', err?.message);
        localStorage.removeItem('codeforge_token');
        delete api.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    // Login endpoint is excluded from the 401/403 redirect in axios interceptor
    const res   = await api.post('/auth/login', { email, password });
    const token = parseToken(res.data);
    if (!token) throw new Error('Server did not return a token.');
    localStorage.setItem('codeforge_token', token);
    // Set header explicitly so immediate next requests have it
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const u = parseUser(res.data) || { email, name: email, username: email };
    setUser(u);
    return u;
  }

  async function register(name, email, password) {
    const res   = await api.post('/auth/register', { name, email, password });
    const token = parseToken(res.data);

    if (token) {
      // Backend auto-logs in — set everything up
      localStorage.setItem('codeforge_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const u = parseUser(res.data) || { name, username: name, email };
      setUser(u);
      return { autoLogin: true };
    }

    // Backend registered but didn't return token — must log in manually
    setRegisterSuccess(res.data?.message || 'Account created! Please sign in.');
    return { autoLogin: false };
  }

  function logout() {
    localStorage.removeItem('codeforge_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, registerSuccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}