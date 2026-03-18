import { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar         from './components/Navbar';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import NotFound       from './pages/NotFound';
import './App.css';

/* ── Full-page loading spinner ─────────────────────────────────── */
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '16px',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--border-default)',
        borderTopColor: 'var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-muted)', letterSpacing: '0.12em',
      }}>
        INITIALIZING...
      </p>
    </div>
  );
}

/* ── Route guards ──────────────────────────────────────────────── */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

/* ── App routes (rendered inside providers) ────────────────────── */
function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/"            element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"       element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"    element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
    </>
  );
}

/* ── Error boundary — shows error instead of blank screen ────────── */
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-base)', padding: 32, textAlign: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 40 }}>⚠</div>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-red)', fontSize: 20 }}>
          Something went wrong
        </h2>
        <pre style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
          maxWidth: 600, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
          background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)',
        }}>
          {this.state.error?.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary)', border: 'none',
            color: '#000', fontFamily: 'var(--font-mono)', fontWeight: 700,
            fontSize: 13, cursor: 'pointer',
          }}
        >↺ Reload</button>
      </div>
    );
  }
}

/* ── Root ──────────────────────────────────────────────────────── */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}