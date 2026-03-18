import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ username:'', email:'', password:'', confirm:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Navigate reactively when user state becomes truthy
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      // navigate handled by useEffect above
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', padding:20, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:0.5 }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(63,185,80,0.06) 0%, transparent 70%)', top:-100, left:-100, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(88,166,255,0.05) 0%, transparent 70%)', bottom:-100, right:-100, pointerEvents:'none' }} />

      <div style={{ position:'relative', width:'100%', maxWidth:440, background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.5)', animation:'fadeIn 400ms ease' }}>
        <div style={{ height:3, background:'linear-gradient(90deg, var(--accent-green), var(--accent-cyan), var(--accent-primary))' }} />

        <div style={{ padding:'36px 36px 28px' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
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
            <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', letterSpacing:'0.1em' }}>CREATE YOUR WORKSPACE</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
            <Field label="USERNAME"  value={form.username} onChange={set('username')} placeholder="cooldev42" />
            <Field label="EMAIL" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="PASSWORD" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
              <Field label="CONFIRM"  type="password" value={form.confirm}  onChange={set('confirm')}  placeholder="••••••••" />
            </div>

            {error && (
              <div style={{ padding:'10px 14px', borderRadius:'var(--radius-md)', background:'rgba(255,123,114,0.08)', border:'1px solid rgba(255,123,114,0.2)', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent-red)', display:'flex', gap:8, alignItems:'center' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ marginTop:4, padding:12, borderRadius:'var(--radius-md)', border:'none', background: loading ? 'var(--bg-overlay)' : 'var(--accent-primary)', color: loading ? 'var(--text-muted)' : '#000', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing:'0.06em', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><Spinner /> CREATING…</> : 'CREATE WORKSPACE →'}
            </button>
          </form>

          <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--border-subtle)', textAlign:'center' }}>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'var(--accent-primary)', fontWeight:600 }}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type='text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.12em', display:'block', marginBottom:6 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required
        style={{ width:'100%', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:13, background:'var(--bg-elevated)', color:'var(--text-primary)', border:`1px solid ${focused ? 'var(--accent-primary)' : 'var(--border-default)'}`, borderRadius:'var(--radius-md)', outline:'none', transition:'border-color var(--transition-fast)' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function Spinner() {
  return <span style={{ width:14, height:14, display:'inline-block', border:'2px solid var(--text-muted)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />;
}