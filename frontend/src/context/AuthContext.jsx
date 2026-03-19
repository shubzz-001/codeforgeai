import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function parseToken(data) {
  return (
    data?.token       ||
    data?.accessToken ||
    data?.access_token ||
    data?.jwt         ||
    null
  );
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

const savedToken = localStorage.getItem('codeforge_token');

export function AuthProvider({ children }) {
  const [user,             setUser]             = useState(null);
  const [loading,          setLoading]          = useState(!!savedToken);
  // null = not attempted, 'success' = registered OK but no token (must login)
  const [registerSuccess,  setRegisterSuccess]  = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!savedToken) return;

    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    api.get('/auth/profile')
      .then(res => setUser(parseUser(res.data)))
      .catch(() => {
        localStorage.removeItem('codeforge_token');
        delete api.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res   = await api.post('/auth/login', { email, password });
    const token = parseToken(res.data);
    if (!token) throw new Error('Server did not return a token.');
    localStorage.setItem('codeforge_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const resolvedUser = parseUser(res.data) || { email, name: email, username: email };
    setUser(resolvedUser);
    return resolvedUser;
  }

  async function register(name, email, password) {
    const res   = await api.post('/auth/register', { name, email, password });
    const token = parseToken(res.data);

    if (token) {
      // Backend returned a token — log the user in directly
      localStorage.setItem('codeforge_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const resolvedUser = parseUser(res.data) || { name, username: name, email };
      setUser(resolvedUser);
      return { autoLogin: true };
    } else {
      // Backend returned only a success message — user must log in manually
      // (common Spring Security pattern: register → 200 OK, then login separately)
      setRegisterSuccess(
        res.data?.message || 'Account created! Please sign in.'
      );
      return { autoLogin: false };
    }
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