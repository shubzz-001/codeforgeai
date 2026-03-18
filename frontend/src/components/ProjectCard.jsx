import { useNavigate } from 'react-router-dom';

const LANG_COLORS = { javascript:'#f1e05a', typescript:'#3178c6', python:'#3572A5', java:'#b07219', go:'#00ADD8', rust:'#dea584', cpp:'#f34b7d', csharp:'#178600' };
const COMPLEXITY  = {
  LOW:      { color:'var(--accent-green)',  bg:'rgba(63,185,80,0.1)',   label:'Low'      },
  MEDIUM:   { color:'var(--accent-yellow)', bg:'rgba(227,179,65,0.1)',  label:'Medium'   },
  HIGH:     { color:'var(--accent-orange)', bg:'rgba(255,166,87,0.1)',  label:'High'     },
  CRITICAL: { color:'var(--accent-red)',    bg:'rgba(255,123,114,0.1)', label:'Critical' },
};

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const cx = COMPLEXITY[project.complexityLevel] ?? COMPLEXITY.LOW;
  const lc = LANG_COLORS[project.language?.toLowerCase()] ?? '#8b949e';
  const date = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    : '';

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-lg)', padding:20, cursor:'pointer', position:'relative', overflow:'hidden', transition:'all var(--transition-base)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-emphasis)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-subtle)';   e.currentTarget.style.transform='translateY(0)';   e.currentTarget.style.boxShadow='none'; }}
    >
      {/* Language accent line */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${lc}60, transparent)` }} />

      {/* Title row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:lc, flexShrink:0 }} />
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {project.name}
            </h3>
          </div>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>
            {project.language ?? 'Unknown'}{date ? ` · ${date}` : ''}
          </p>
        </div>
        <span style={{ padding:'3px 8px', borderRadius:'var(--radius-sm)', fontSize:10, fontFamily:'var(--font-mono)', fontWeight:600, color:cx.color, background:cx.bg, border:`1px solid ${cx.color}30`, flexShrink:0, marginLeft:10 }}>
          {cx.label}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-secondary)', lineHeight:1.5, marginBottom:12, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {project.description}
        </p>
      )}

      {/* Stats */}
      <div style={{ display:'flex', gap:16, marginBottom:12 }}>
        {[
          { label:'Files',  value: project.fileCount  ?? 0, color:'var(--accent-cyan)'   },
          { label:'Issues', value: project.issueCount ?? 0, color:'var(--accent-orange)' },
          { label:'Tests',  value: project.testCount  ?? 0, color:'var(--accent-green)'  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color }}>{value}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.08em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div style={{ marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.08em' }}>COMPLEXITY</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:cx.color }}>{project.complexityScore ?? 0}%</span>
        </div>
        <div style={{ height:3, background:'var(--bg-overlay)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${Math.min(project.complexityScore ?? 0, 100)}%`, background:`linear-gradient(90deg, ${cx.color}80, ${cx.color})`, borderRadius:2, transition:'width 0.8s ease' }} />
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent-primary)' }}>View Details →</span>
      </div>
    </div>
  );
}