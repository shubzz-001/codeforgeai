import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

function parseLoginResponse(data) {
  const token =
    data?.token ||
    data?.accessToken ||
    data?.access_token ||
    data?.jwt ||
    null;

  const user =
    data?.user ||
    data?.userDetails ||
    data?.userData ||
    (data?.id || data?.email || data?.username
      ? { id: data.id, username: data.username, email: data.email, role: data.role }
      : null);

  return { token, user };
}

const savedToken = localStorage.getItem('codeforge_token');

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  // If no token exists we are already done loading — no effect needed
  const [loading, setLoading] = useState(!!savedToken);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!savedToken) return; // loading already false, nothing to do

    api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    api.get('/auth/profile')
      .then(res => {
        const u = res.data?.user || res.data;
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem('codeforge_token');
        delete api.defaults.headers.common['Authorization'];
      })
      .finally(() => setLoading(false)); // ← inside async callback, not effect body
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: u } = parseLoginResponse(res.data);
    if (!token) throw new Error('Server did not return a token. Check backend response shape.');
    localStorage.setItem('codeforge_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const resolvedUser = u || { email };
    setUser(resolvedUser);
    return resolvedUser;
  }

  async function register(username, email, password) {
    const res = await api.post('/auth/register', { username, email, password });
    const { token, user: u } = parseLoginResponse(res.data);
    if (!token) throw new Error('Server did not return a token. Check backend response shape.');
    localStorage.setItem('codeforge_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const resolvedUser = u || { username, email };
    setUser(resolvedUser);
    return resolvedUser;
  }

  function logout() {
    localStorage.removeItem('codeforge_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}