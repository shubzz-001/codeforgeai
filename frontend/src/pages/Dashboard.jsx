import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { projectsApi } from '../api/projects';
import ProjectCard from '../components/ProjectCard';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('ALL');
  const [sortBy,    setSortBy]    = useState('createdAt');
  const [showForm,  setShowForm]  = useState(false);

  // Form state — matches backend: file (single ZIP), name, description
  const [formName,  setFormName]  = useState('');
  const [formDesc,  setFormDesc]  = useState('');
  const [file,      setFile]      = useState(null);   // single file
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [dragOver,  setDragOver]  = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchProjects(); }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const data = await projectsApi.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load projects: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!formName.trim()) { setUploadErr('Project name is required.'); return; }
    if (!file)            { setUploadErr('Please select a ZIP file to upload.'); return; }
    setUploadErr('');
    setUploading(true);
    try {
      // Backend @RequestParam: "file", "name", "description"
      const fd = new FormData();
      fd.append('file', file);           // single file — matches @RequestParam("file")
      fd.append('name', formName);
      fd.append('description', formDesc);
      await projectsApi.create(fd);
      toast.success(`"${formName}" uploaded! Analysis running…`);
      setShowForm(false);
      setFormName(''); setFormDesc(''); setFile(null);
      fetchProjects();
    } catch (err) {
      const msg = err?.message || 'Upload failed.';
      setUploadErr(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  const filtered = projects
    .filter(p => filter === 'ALL' || p.complexityLevel === filter)
    .sort((a, b) => {
      if (sortBy === 'name')       return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'complexity') return (b.complexityScore ?? 0) - (a.complexityScore ?? 0);
      return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
    });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', paddingTop:56 }}>
      <div style={{ padding:'32px' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, marginBottom:32, animation:'fadeIn 400ms ease' }}>
          <div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:4 }}>
              {greeting}, <span style={{ color:'var(--accent-primary)' }}>{user?.username ?? 'dev'}</span>
            </p>
            <h1 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:28, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
              Code Intelligence <span style={{ color:'var(--accent-primary)' }}>Dashboard</span>
            </h1>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-secondary)', marginTop:6 }}>
              AI-powered analysis for your repositories
            </p>
          </div>

          <button onClick={() => { setShowForm(v => !v); setUploadErr(''); }} style={{
            padding:'10px 20px', borderRadius:'var(--radius-md)', border:'none',
            background: showForm ? 'var(--bg-elevated)' : 'var(--accent-primary)',
            color: showForm ? 'var(--text-secondary)' : '#000',
            fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, cursor:'pointer',
            display:'flex', alignItems:'center', gap:8,
            boxShadow: showForm ? 'none' : '0 4px 12px rgba(88,166,255,0.25)',
            transition:'all var(--transition-fast)',
          }}>
            <span style={{ fontSize:16, lineHeight:1 }}>{showForm ? '✕' : '+'}</span>
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {/* ── Upload form ── */}
        {showForm && (
          <form onSubmit={handleCreate} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-xl)', overflow:'hidden', marginBottom:28, animation:'fadeIn 250ms ease', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>
            {/* Form header */}
            <div style={{ padding:'16px 22px', background:'var(--bg-elevated)', borderBottom:'1px solid var(--border-subtle)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:16 }}>⬆</span>
              <div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>Upload Project</h3>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>Upload a ZIP file of your project for AI analysis</p>
              </div>
            </div>

            <div style={{ padding:22, display:'flex', flexDirection:'column', gap:14 }}>
              {/* Name + Description */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <FormField label="PROJECT NAME *" value={formName} onChange={e => setFormName(e.target.value)} placeholder="my-awesome-project" required />
                <FormField label="DESCRIPTION"    value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optional description" />
              </div>

              {/* Drop zone — single ZIP file */}
              <div>
                <label style={labelStyle}>ZIP FILE *</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  style={{
                    padding:28, borderRadius:'var(--radius-md)', cursor:'pointer', textAlign:'center',
                    border:`2px dashed ${dragOver ? 'var(--accent-primary)' : file ? 'var(--accent-green)' : 'var(--border-default)'}`,
                    background: dragOver ? 'var(--accent-primary-muted)' : file ? 'rgba(63,185,80,0.05)' : 'var(--bg-elevated)',
                    transition:'all var(--transition-fast)',
                  }}
                >
                  <div style={{ fontSize:28, marginBottom:10 }}>{file ? '✓' : '⬆'}</div>
                  {file ? (
                    <>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--accent-green)', fontWeight:600, marginBottom:4 }}>{file.name}</p>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:13, color: dragOver ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        Drop your ZIP file here or click to browse
                      </p>
                      <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-muted)', marginTop:4 }}>
                        Accepts .zip files of your project
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".zip,application/zip"
                  style={{ display:'none' }}
                  onChange={e => setFile(e.target.files[0] || null)}
                />
              </div>

              {uploadErr && (
                <div style={{ padding:'10px 14px', borderRadius:'var(--radius-md)', background:'rgba(255,123,114,0.08)', border:'1px solid rgba(255,123,114,0.2)', fontFamily:'var(--font-mono)', fontSize:12, color:'var(--accent-red)', display:'flex', gap:8, alignItems:'center' }}>
                  ⚠ {uploadErr}
                </div>
              )}

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding:'9px 18px', borderRadius:'var(--radius-md)', background:'none', border:'1px solid var(--border-default)', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={uploading} style={{ padding:'9px 22px', borderRadius:'var(--radius-md)', border:'none', background: uploading ? 'var(--bg-overlay)' : 'var(--accent-primary)', color: uploading ? 'var(--text-muted)' : '#000', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:12, cursor: uploading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8, transition:'all var(--transition-fast)' }}>
                  {uploading ? <><Spinner /> Uploading…</> : '⚡ Upload & Analyze'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── Filter bar ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['ALL','LOW','MEDIUM','HIGH','CRITICAL'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:'5px 12px', borderRadius:'var(--radius-sm)', border:'1px solid',
                borderColor: filter === f ? 'var(--accent-primary)' : 'var(--border-subtle)',
                background:  filter === f ? 'var(--accent-primary-muted)' : 'transparent',
                color:       filter === f ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontFamily:'var(--font-mono)', fontSize:11, cursor:'pointer',
                transition:'all var(--transition-fast)', letterSpacing:'0.06em',
              }}>{f}</button>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text-muted)' }}>
              {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            </span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding:'6px 12px', background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-sm)', color:'var(--text-secondary)', fontFamily:'var(--font-mono)', fontSize:12, cursor:'pointer', outline:'none' }}>
              <option value="createdAt">Latest</option>
              <option value="name">Name</option>
              <option value="complexity">Complexity</option>
            </select>
          </div>
        </div>

        {/* ── Project grid ── */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height:200, borderRadius:'var(--radius-lg)', background:'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px', background:'var(--bg-surface)', borderRadius:'var(--radius-xl)', border:'1px dashed var(--border-default)', animation:'fadeIn 400ms ease' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>⊞</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--text-primary)', marginBottom:8 }}>
              {filter !== 'ALL' ? `No ${filter.toLowerCase()} complexity projects` : 'No projects yet'}
            </h3>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>
              Upload a ZIP of your project to start AI analysis
            </p>
            <button onClick={() => setShowForm(true)} style={{ padding:'10px 20px', borderRadius:'var(--radius-md)', background:'var(--accent-primary)', border:'none', color:'#000', fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              + Upload First Project
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16, animation:'fadeIn 400ms ease 200ms both' }}>
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle = { fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:'0.12em', display:'block', marginBottom:6 };

function FormField({ label, value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width:'100%', padding:'10px 14px', fontFamily:'var(--font-mono)', fontSize:13, background:'var(--bg-elevated)', color:'var(--text-primary)', border:`1px solid ${focused ? 'var(--accent-primary)' : 'var(--border-default)'}`, borderRadius:'var(--radius-md)', outline:'none', transition:'border-color var(--transition-fast)' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function Spinner() {
  return <span style={{ width:12, height:12, display:'inline-block', border:'2px solid var(--text-muted)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />;
}