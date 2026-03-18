import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', padding:32, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize:'40px 40px', opacity:0.4 }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,123,114,0.07) 0%, transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', textAlign:'center', animation:'fadeIn 400ms ease' }}>
        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'clamp(80px,18vw,160px)', lineHeight:1, letterSpacing:'-0.04em', background:'linear-gradient(135deg, var(--accent-red) 0%, var(--accent-orange) 60%, var(--accent-yellow) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:8, filter:'drop-shadow(0 0 40px rgba(255,123,114,0.3))' }}>
          404
        </div>

        <p style={{ fontFamily:'var(--font-mono)', fontSize:'clamp(11px,2vw,14px)', color:'var(--accent-red)', letterSpacing:'0.2em', marginBottom:24 }}>
          PAGE NOT FOUND
        </p>

        <div style={{ width:240, height:1, margin:'0 auto 24px', background:'linear-gradient(90deg, transparent, var(--border-emphasis), transparent)' }} />

        <p style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-secondary)', maxWidth:360, margin:'0 auto 28px', lineHeight:1.6 }}>
          The route you requested doesn't exist or has been moved.
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding:'11px 24px', borderRadius:'var(--radius-md)', background:'var(--accent-primary)', border:'none', color:'#000', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all var(--transition-fast)', boxShadow:'0 4px 12px rgba(88,166,255,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.background='var(--accent-primary-hover)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='var(--accent-primary)'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            ⌂ Go to Dashboard
          </button>
          <button onClick={() => navigate(-1)} style={{ padding:'11px 20px', borderRadius:'var(--radius-md)', background:'none', border:'1px solid var(--border-default)', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:13, cursor:'pointer', transition:'all var(--transition-fast)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-emphasis)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-default)'; e.currentTarget.style.color='var(--text-secondary)'; }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}