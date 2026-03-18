import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const initials = user?.username?.slice(0,2).toUpperCase()
    ?? user?.email?.slice(0,2).toUpperCase()
    ?? 'U';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 100,
      background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', gap: 12,
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect x="1" y="1" width="10" height="10" rx="2" fill="#58a6ff"/>
          <rect x="13" y="1" width="10" height="10" rx="2" fill="#3fb950"/>
          <rect x="1"  y="13" width="10" height="10" rx="2" fill="#bc8cff"/>
          <rect x="13" y="13" width="10" height="10" rx="2" fill="#ffa657"/>
          <rect x="5" y="5" width="14" height="14" rx="3" fill="#0d1117"/>
          <path d="M9 13l3 3 5-6" stroke="#58a6ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
          CodeForge<span style={{ color: 'var(--accent-primary)' }}>AI</span>
        </span>
      </Link>

      {/* Center link */}
      <Link to="/dashboard" style={{
        padding: '5px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12,
        fontFamily: 'var(--font-mono)',
        color: location.pathname === '/dashboard' ? 'var(--accent-primary)' : 'var(--text-secondary)',
        background: location.pathname === '/dashboard' ? 'var(--accent-primary-muted)' : 'transparent',
        border: location.pathname === '/dashboard' ? '1px solid rgba(88,166,255,0.2)' : '1px solid transparent',
        textDecoration: 'none', transition: 'all var(--transition-fast)',
      }}>⌂ Dashboard</Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* AI status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 'var(--radius-sm)',
          background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)',
          fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulseGlow 2s infinite' }} />
          AI Online
        </div>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpen(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            cursor: 'pointer', color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)', fontSize: 12,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: '#fff',
            }}>{initials}</div>
            <span>{user?.username ?? user?.email?.split('@')[0] ?? 'user'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▾</span>
          </button>

          {open && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)', minWidth: 160,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 200,
              animation: 'fadeIn 150ms ease',
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{user?.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  width: '100%', padding: '10px 14px', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: 12,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,123,114,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >⏻ Sign out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}