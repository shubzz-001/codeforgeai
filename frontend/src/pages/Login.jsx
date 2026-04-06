import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Reactively navigate when user state becomes truthy.
  // This is the correct pattern for React 19 + React Router v7:
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // navigate is handled by the useEffect above
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid background */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:0.5 }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(88,166,255,0.07) 0%, transparent 70%)', top:-150, right:-100, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(188,140,255,0.05) 0%, transparent 70%)', bottom:-100, left:-100, pointerEvents:'none' }} />

      <div style={{
        position:'relative', width:'100%', maxWidth:420,
        background:'var(--bg-surface)', border:'1px solid var(--border-default)',
        borderRadius:'var(--radius-xl)', overflow:'hidden',
        boxShadow:'0 24px 64px rgba(0,0,0,0.5)', animation:'fadeIn 400ms ease',
      }}>
        <div style={{ height:3, background:'linear-gradient(90deg, var(--accent-primary), var(--accent-purple), var(--accent-cyan))' }} />

        <div style={{ padding:'36px 36px 28px' }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <svg width="30" height="30" viewBox="0 0 26 26" fill="none">
                <rect x="1" y="1" width="10" height="10" rx="2" fill="#58a6ff"/>
                <rect x="13" y="1" width="10" height="10" rx="2" fill="#3fb950"/>
                <rect x="1"  y="13" width="10" height="10" rx="2" fill="#bc8cff"/>
                <rect x="13" y="13" width="10" height="10" rx="2" fill="#ffa657"/>
                <rect x="5" y="5" width="14" height="14" rx="3" fill="#161b22"/>
                <path d="M9 13l3 3 5-6" stroke="#58a6ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:22, color:'var(--text-primary)' }}>
                CodeForge<span style={{ color:'var(--accent-primary)' }}>AI</span>
              </span>
            </div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.1em' }}>
              SIGN IN TO YOUR WORKSPACE
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="EMAIL" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field label="PASSWORD" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

            {error && (
              <div style={{ padding:'10px 14px', borderRadius:'var(--radius-md)', background:'rgba(255,123,114,0.08)', border:'1px solid rgba(255,123,114,0.2)', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent-red)', display:'flex', gap:8, alignItems:'center' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop:4, padding:12, borderRadius:'var(--radius-md)', border:'none',
              background: loading ? 'var(--bg-overlay)' : 'var(--accent-primary)',
              color: loading ? 'var(--text-muted)' : '#000',
              fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13,
              cursor: loading ? 'not-allowed' : 'pointer', letterSpacing:'0.06em',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'all var(--transition-fast)',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-primary-hover)'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-primary)'; }}
            >
              {loading ? <><Spinner /> SIGNING IN…</> : 'SIGN IN →'}
            </button>
          </form>

          <div style={{ marginTop:22, paddingTop:18, borderTop:'1px solid var(--border-subtle)', textAlign:'center' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-muted)' }}>
              No account?{' '}
              <Link to="/register" style={{ color:'var(--accent-primary)', fontWeight:600 }}>Create workspace →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.12em', display:'block', marginBottom:6 }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} required
        style={{ width:'100%', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:13, background:'var(--bg-elevated)', color:'var(--text-primary)', border:`1px solid ${focused ? 'var(--accent-primary)' : 'var(--border-default)'}`, borderRadius:'var(--radius-md)', outline:'none', transition:'border-color var(--transition-fast)' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function Spinner() {
  return <span style={{ width:14, height:14, display:'inline-block', border:'2px solid var(--text-muted)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />;
}