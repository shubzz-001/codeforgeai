import { useState } from 'react';

const SEV = {
  LOW:      { color:'var(--accent-green)',  icon:'▸' },
  MEDIUM:   { color:'var(--accent-yellow)', icon:'◆' },
  HIGH:     { color:'var(--accent-orange)', icon:'▲' },
  CRITICAL: { color:'var(--accent-red)',    icon:'◉' },
};

const FILE_ICONS = { js:'🟨', jsx:'⚛', ts:'🔷', tsx:'⚛', py:'🐍', java:'☕', go:'🔵', rs:'🦀', cpp:'⚙️', cs:'💜', rb:'💎', php:'🐘', html:'🌐', css:'🎨', json:'📋', md:'📄', sh:'🖥️', sql:'🗃️' };

export default function FileCard({ file, onAnalyze, isAnalyzing }) {
  const [open, setOpen]   = useState(false);
  const [tab,  setTab]    = useState('suggestions');
  const sev = SEV[file.complexityLevel] ?? SEV.LOW;
  const ext = file.fileName?.split('.').pop()?.toLowerCase() ?? '';

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'border-color var(--transition-fast)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
    >
      {/* Header row */}
      <div onClick={() => setOpen(v => !v)} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', background: open ? 'var(--bg-elevated)' : 'transparent', borderBottom: open ? '1px solid var(--border-subtle)' : 'none', transition:'background var(--transition-fast)' }}>
        {/* Icon */}
        <div style={{ width:32, height:32, borderRadius:'var(--radius-sm)', background:'var(--bg-overlay)', border:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
          {FILE_ICONS[ext] ?? '📄'}
        </div>
        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.fileName}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:sev.color }}>{sev.icon} {file.complexityLevel}</span>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:2 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>{file.linesOfCode ?? 0} lines</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>Score: <span style={{ color:sev.color }}>{file.complexityScore ?? 0}</span></span>
          </div>
        </div>
        {/* Actions */}
        <button
          onClick={e => { e.stopPropagation(); onAnalyze?.(file.id); }}
          disabled={isAnalyzing}
          style={{ padding:'5px 12px', borderRadius:'var(--radius-sm)', background:'var(--accent-primary-muted)', border:'1px solid rgba(88,166,255,0.2)', color:'var(--accent-primary)', fontFamily:'var(--font-mono)', fontSize:11, cursor: isAnalyzing ? 'not-allowed' : 'pointer', opacity: isAnalyzing ? 0.6 : 1, flexShrink:0 }}
        >
          {isAnalyzing ? '⟳ Analyzing…' : '⚡ Analyze'}
        </button>
        <span style={{ color:'var(--text-muted)', fontSize:12, transform: open ? 'rotate(90deg)' : 'none', transition:'transform var(--transition-fast)', flexShrink:0 }}>▶</span>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ animation:'fadeIn 200ms ease' }}>
          {/* Tabs */}
          <div style={{ display:'flex', background:'var(--bg-elevated)', borderBottom:'1px solid var(--border-subtle)' }}>
            {[['suggestions','◈ Refactoring'],['tests','⊛ Tests'],['code','⊞ Source']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{ padding:'9px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:12, color: tab === key ? 'var(--accent-primary)' : 'var(--text-muted)', borderBottom: tab === key ? '2px solid var(--accent-primary)' : '2px solid transparent', transition:'all var(--transition-fast)' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding:'14px 16px' }}>
            {tab === 'suggestions' && <Suggestions items={file.refactoringSuggestions} />}
            {tab === 'tests'       && <Tests       items={file.unitTests} name={file.fileName} />}
            {tab === 'code'        && <Code        src={file.sourceCode} />}
          </div>
        </div>
      )}
    </div>
  );
}

function Suggestions({ items }) {
  if (!items?.length) return <Empty icon="✓" text="No refactoring suggestions — looks clean!" />;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {items.map((s, i) => {
        const c = SEV[s.severity]?.color ?? 'var(--text-muted)';
        return (
          <div key={i} style={{ background:'var(--bg-overlay)', borderRadius:'var(--radius-md)', padding:'10px 12px', borderLeft:`3px solid ${c}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>
                {s.lineNumber ? `Line ${s.lineNumber}` : ''}{s.type ? ` · ${s.type}` : ''}
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:c }}>{s.severity}</span>
            </div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-primary)', lineHeight:1.5, marginBottom: s.suggestion ? 6 : 0 }}>{s.message}</p>
            {s.suggestion && (
              <div style={{ padding:'6px 10px', background:'var(--bg-surface)', borderRadius:'var(--radius-sm)', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent-cyan)', borderLeft:'2px solid var(--accent-cyan)' }}>
                💡 {s.suggestion}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Tests({ items, name }) {
  if (!items?.length) return <Empty icon="⚡" text={`Run analysis to generate tests for ${name}`} />;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {items.map((t, i) => (
        <div key={i} style={{ background:'var(--bg-overlay)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
          <div style={{ padding:'8px 12px', background:'var(--bg-elevated)', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent-green)', fontWeight:600 }}>⊛ {t.testName ?? `Test ${i+1}`}</span>
            {t.framework && <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)' }}>{t.framework}</span>}
          </div>
          <pre style={{ margin:0, padding:'10px 12px', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-secondary)', lineHeight:1.6, overflowX:'auto', whiteSpace:'pre-wrap' }}>
            {t.testCode ?? t.code ?? 'No code available.'}
          </pre>
        </div>
      ))}
    </div>
  );
}

function Code({ src }) {
  if (!src) return <Empty icon="⊞" text="Source code not available" />;
  return (
    <div style={{ background:'var(--bg-overlay)', borderRadius:'var(--radius-md)', border:'1px solid var(--border-subtle)', overflow:'auto', maxHeight:400 }}>
      <pre style={{ margin:0, fontFamily:'var(--font-mono)', fontSize:12, lineHeight:1.7 }}>
        {src.split('\n').map((line, i) => (
          <div key={i} style={{ display:'flex' }}>
            <span style={{ minWidth:44, paddingRight:16, paddingLeft:12, color:'var(--text-muted)', userSelect:'none', textAlign:'right', borderRight:'1px solid var(--border-subtle)', marginRight:16, fontSize:11 }}>{i+1}</span>
            <span style={{ color:'var(--text-secondary)', paddingRight:16 }}>{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:12 }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      {text}
    </div>
  );
}