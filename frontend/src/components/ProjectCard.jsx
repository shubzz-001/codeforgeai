import { useNavigate } from 'react-router-dom';

// Complexity score is 0-100 integer from CodeFile.complexityScore
// Derive a colour + label from the raw number
function complexityMeta(score) {
  if (score === 0 || score === undefined || score === null)
    return { color:'var(--text-muted)',     bg:'var(--bg-overlay)',            label:'—'        };
  if (score <= 25)
    return { color:'var(--accent-green)',   bg:'rgba(63,185,80,0.1)',          label:'Low'      };
  if (score <= 50)
    return { color:'var(--accent-yellow)',  bg:'rgba(227,179,65,0.1)',         label:'Medium'   };
  if (score <= 75)
    return { color:'var(--accent-orange)',  bg:'rgba(255,166,87,0.1)',         label:'High'     };
  return   { color:'var(--accent-red)',     bg:'rgba(255,123,114,0.1)',        label:'Critical' };
}

// Sum a numeric field across all files, return 0 if files missing
function sum(files, key) {
  if (!Array.isArray(files) || files.length === 0) return 0;
  return files.reduce((acc, f) => acc + (Number(f[key]) || 0), 0);
}

function avg(files, key) {
  if (!Array.isArray(files) || files.length === 0) return 0;
  return Math.round(sum(files, key) / files.length);
}

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  // The backend GET /projects/ returns Project objects.
  // project.files may be eagerly loaded or we fall back to empty array.
  const files = project.files ?? project.codeFiles ?? [];

  // Aggregate CodeFile metrics
  const totalLines   = sum(files, 'lineCount');
  const totalMethods = sum(files, 'methodCount');
  const totalClasses = sum(files, 'classCount');
  const avgScore     = avg(files, 'complexityScore');
  const fileCount    = project.fileCount ?? files.length;

  // Use project-level complexityScore if present, else average of files
  const displayScore = project.complexityScore ?? avgScore;
  const cx = complexityMeta(displayScore);

  const createdAt = project.createdAt
    ? new Date(project.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
    : '';

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      style={{
        background:'var(--bg-surface)', border:'1px solid var(--border-subtle)',
        borderRadius:'var(--radius-lg)', padding:20, cursor:'pointer',
        position:'relative', overflow:'hidden',
        transition:'all var(--transition-base)',
        animation:'fadeIn 400ms ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-emphasis)';
        e.currentTarget.style.transform   = 'translateY(-2px)';
        e.currentTarget.style.boxShadow   = '0 8px 24px rgba(0,0,0,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform   = 'translateY(0)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    >
      {/* Top accent */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg, ${cx.color}70, transparent)` }} />

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 }}>
            {project.name}
          </h3>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>
            {fileCount} file{fileCount !== 1 ? 's' : ''}{createdAt ? ` · ${createdAt}` : ''}
          </p>
        </div>

        {/* Complexity badge */}
        <span style={{ padding:'3px 9px', borderRadius:'var(--radius-sm)', fontSize:10, fontFamily:'var(--font-mono)', fontWeight:600, color:cx.color, background:cx.bg, border:`1px solid ${cx.color}30`, flexShrink:0, marginLeft:10 }}>
          {cx.label}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-secondary)', lineHeight:1.5, marginBottom:12, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
          {project.description}
        </p>
      )}

      {/* Metrics — real CodeFile fields */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
        <Metric label="LINES"   value={totalLines.toLocaleString()}   color="var(--accent-cyan)"   />
        <Metric label="METHODS" value={totalMethods.toLocaleString()} color="var(--accent-purple)" />
        <Metric label="CLASSES" value={totalClasses.toLocaleString()} color="var(--accent-yellow)" />
      </div>

      {/* Complexity score bar */}
      <div style={{ marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.08em' }}>
            AVG COMPLEXITY
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, color:cx.color }}>
            {displayScore}/100
          </span>
        </div>
        <div style={{ height:4, background:'var(--bg-overlay)', borderRadius:2, overflow:'hidden' }}>
          <div style={{
            height:'100%', borderRadius:2,
            width:`${Math.min(displayScore, 100)}%`,
            background:`linear-gradient(90deg, ${cx.color}60, ${cx.color})`,
            transition:'width 0.9s ease',
            boxShadow: displayScore > 0 ? `0 0 6px ${cx.color}50` : 'none',
          }} />
        </div>
      </div>

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--accent-primary)' }}>
          View Details →
        </span>
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div style={{ background:'var(--bg-elevated)', borderRadius:'var(--radius-sm)', padding:'8px 10px', textAlign:'center', border:'1px solid var(--border-subtle)' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:800, color, marginBottom:2 }}>
        {value || '—'}
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-muted)', letterSpacing:'0.1em' }}>
        {label}
      </div>
    </div>
  );
}