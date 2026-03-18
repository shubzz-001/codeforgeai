import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Editor from "@monaco-editor/react";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [files,        setFiles]        = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code,         setCode]         = useState("");
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingCode,  setLoadingCode]  = useState(false);
  const [analyzing,    setAnalyzing]    = useState(false);
  const [search,       setSearch]       = useState("");

  /* ── Fetch file list ──────────────────────────────────────── */
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get(`/projects/${id}/files`);   // original endpoint
        setFiles(res.data);
      } catch {
        console.error("Failed to load files");
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFiles();
  }, [id]);

  /* ── Load individual file content ─────────────────────────── */
  const loadFile = async (file) => {
    setSelectedFile(file);
    setLoadingCode(true);
    try {
      const res = await api.get(`/projects/files/${file.id}`);  // original endpoint
      setCode(res.data.content);
    } catch {
      setCode("// Could not load file content.");
    } finally {
      setLoadingCode(false);
    }
  };

  /* ── Per-file AI analysis ──────────────────────────────────── */
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    try {
      const res = await api.post(`/projects/${id}/files/${selectedFile.id}/analyze`);
      // Merge updated AI fields back into the selected file + list
      const updated = { ...selectedFile, ...res.data };
      setSelectedFile(updated);
      setFiles(prev => prev.map(f => f.id === updated.id ? updated : f));
    } catch {
      console.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── Derived ──────────────────────────────────────────────── */
  const filteredFiles = files.filter(f =>
    f.fileName?.toLowerCase().includes(search.toLowerCase())
  );

  const complexityColors = {
    LOW:      "var(--accent-green)",
    MEDIUM:   "var(--accent-yellow)",
    HIGH:     "var(--accent-orange)",
    CRITICAL: "var(--accent-red)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>


      {/* Main layout: sidebar + editor panel */}
      <div style={{
        display: "flex",
        height: "calc(100vh - 56px)",   /* subtract navbar */
        marginTop: "56px",
      }}>

        {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
        <div style={{
          width: "260px", flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Sidebar header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: "11px",
                color: "var(--text-muted)", padding: 0, marginBottom: "10px",
                transition: "color var(--transition-fast)", display: "flex",
                alignItems: "center", gap: "4px",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--accent-primary)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
            >
              ← Dashboard
            </button>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "14px",
              fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px",
            }}>
              Files
            </h2>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: "9px", top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)", fontSize: "12px", pointerEvents: "none",
              }}>⌕</span>
              <input
                placeholder="Search files..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "7px 10px 7px 26px",
                  background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)", fontSize: "11px", outline: "none",
                  transition: "border-color var(--transition-fast)",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent-primary)"}
                onBlur={e  => e.target.style.borderColor = "var(--border-subtle)"}
              />
            </div>
          </div>

          {/* File list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loadingFiles ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: "36px", margin: "4px 0", borderRadius: "var(--radius-sm)",
                  background: "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
                }} />
              ))
            ) : filteredFiles.length === 0 ? (
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: "11px",
                color: "var(--text-muted)", padding: "16px 8px", textAlign: "center",
              }}>
                {search ? "No matching files" : "No files found"}
              </p>
            ) : (
              filteredFiles.map(file => {
                const isActive = selectedFile?.id === file.id;
                const complexColor = complexityColors[file.complexityLevel] || "var(--text-muted)";
                return (
                  <div
                    key={file.id}
                    onClick={() => loadFile(file)}   // matches original loadFile call
                    style={{
                      padding: "9px 10px", borderRadius: "var(--radius-sm)",
                      cursor: "pointer", marginBottom: "2px",
                      background: isActive ? "var(--accent-primary-muted)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(88,166,255,0.2)" : "transparent"}`,
                      transition: "all var(--transition-fast)",
                      display: "flex", alignItems: "center", gap: "8px",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-overlay)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "13px", flexShrink: 0 }}>
                      {getFileIcon(file.fileName)}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "12px",
                      color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                      flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {file.fileName}
                    </span>
                    {file.complexityLevel && (
                      <span style={{
                        width: "6px", height: "6px", borderRadius: "50%",
                        background: complexColor, flexShrink: 0,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar footer: file count */}
          <div style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--border-subtle)",
            fontFamily: "var(--font-mono)", fontSize: "10px",
            color: "var(--text-muted)", letterSpacing: "0.08em",
          }}>
            {files.length} FILE{files.length !== 1 ? "S" : ""} · {
              Object.values(
                files.reduce((acc, f) => { acc[f.complexityLevel || "UNKNOWN"] = (acc[f.complexityLevel || "UNKNOWN"] || 0) + 1; return acc; }, {})
              ).length
            } COMPLEXITY LEVELS
          </div>

        </div>

        {/* ── RIGHT PANEL ───────────────────────────────────── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          overflow: "hidden", background: "var(--bg-base)",
        }}>

          {selectedFile ? (
            <>
              {/* Panel header */}
              <div style={{
                padding: "12px 20px",
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>{getFileIcon(selectedFile.fileName)}</span>
                  <h2 style={{
                    fontFamily: "var(--font-display)", fontSize: "15px",
                    fontWeight: 700, color: "var(--text-primary)",
                  }}>
                    {selectedFile.fileName}
                  </h2>
                  {selectedFile.complexityLevel && (
                    <ComplexityBadge level={selectedFile.complexityLevel} />
                  )}
                  {selectedFile.linesOfCode && (
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "11px",
                      color: "var(--text-muted)",
                    }}>
                      {selectedFile.linesOfCode} lines
                    </span>
                  )}
                </div>

                {/* Analyze button */}
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  style={{
                    padding: "7px 16px", borderRadius: "var(--radius-sm)",
                    background: analyzing
                      ? "var(--bg-overlay)"
                      : "linear-gradient(135deg, var(--accent-primary), var(--accent-purple))",
                    border: "none",
                    color: analyzing ? "var(--text-muted)" : "#fff",
                    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "12px",
                    cursor: analyzing ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                    transition: "all var(--transition-fast)",
                    boxShadow: analyzing ? "none" : "0 2px 8px rgba(88,166,255,0.25)",
                  }}
                >
                  {analyzing
                    ? <><Spinner /> Analyzing…</>
                    : "⚡ Analyze File"}
                </button>
              </div>

              {/* Editor + AI output */}
              <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

                {/* Monaco Editor — matches user's original */}
                <div style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  position: "relative",
                }}>
                  {loadingCode && (
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      background: "rgba(13,17,23,0.7)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Spinner />
                    </div>
                  )}
                  <Editor
                    height="400px"
                    language={detectLanguage(selectedFile.fileName)}
                    theme="vs-dark"
                    value={code}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineHeight: 22,
                      scrollBeyondLastLine: false,
                      fontFamily: "JetBrains Mono, Fira Code, monospace",
                      padding: { top: 12, bottom: 12 },
                    }}
                  />
                </div>

                {/* AI Output — matches original aiSummary + aiSuggestion fields */}
                <div style={{ padding: "20px" }}>

                  {(selectedFile.aiSummary || selectedFile.aiSuggestion) ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                      {/* AI Summary */}
                      {selectedFile.aiSummary && (
                        <div style={{
                          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                          borderLeft: "3px solid var(--accent-cyan)",
                          borderRadius: "var(--radius-md)", padding: "14px 18px",
                          animation: "fadeIn 300ms ease",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <span style={{ color: "var(--accent-cyan)", fontSize: "13px" }}>◈</span>
                            <span style={{
                              fontFamily: "var(--font-mono)", fontSize: "11px",
                              color: "var(--accent-cyan)", letterSpacing: "0.1em", fontWeight: 600,
                            }}>
                              AI SUMMARY
                            </span>
                          </div>
                          <p style={{
                            fontFamily: "var(--font-mono)", fontSize: "13px",
                            color: "var(--text-primary)", lineHeight: 1.7, margin: 0,
                          }}>
                            {selectedFile.aiSummary}
                          </p>
                        </div>
                      )}

                      {/* AI Suggestion */}
                      {selectedFile.aiSuggestion && (
                        <div style={{
                          background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                          borderLeft: "3px solid var(--accent-yellow)",
                          borderRadius: "var(--radius-md)", padding: "14px 18px",
                          animation: "fadeIn 300ms ease 80ms both",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <span style={{ color: "var(--accent-yellow)", fontSize: "13px" }}>💡</span>
                            <span style={{
                              fontFamily: "var(--font-mono)", fontSize: "11px",
                              color: "var(--accent-yellow)", letterSpacing: "0.1em", fontWeight: 600,
                            }}>
                              SUGGESTION
                            </span>
                          </div>
                          <p style={{
                            fontFamily: "var(--font-mono)", fontSize: "13px",
                            color: "var(--text-primary)", lineHeight: 1.7, margin: 0,
                          }}>
                            {selectedFile.aiSuggestion}
                          </p>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* Placeholder when no AI output yet */
                    <div style={{
                      textAlign: "center", padding: "32px 20px",
                      background: "var(--bg-surface)", border: "1px dashed var(--border-default)",
                      borderRadius: "var(--radius-lg)",
                    }}>
                      <div style={{ fontSize: "32px", marginBottom: "10px" }}>⚡</div>
                      <p style={{
                        fontFamily: "var(--font-mono)", fontSize: "13px",
                        color: "var(--text-secondary)", marginBottom: "6px",
                      }}>
                        No AI analysis yet for this file
                      </p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)" }}>
                        Click <span style={{ color: "var(--accent-primary)" }}>⚡ Analyze File</span> to generate a summary and suggestions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* No file selected — empty state */
            <div style={{
              flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center", padding: "40px",
            }}>
              <div style={{ textAlign: "center", maxWidth: "320px" }}>
                <div style={{
                  width: "64px", height: "64px", margin: "0 auto 16px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "28px",
                }}>
                  📂
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "16px",
                  color: "var(--text-primary)", marginBottom: "8px",
                }}>
                  Select a file to begin
                </h3>
                <p style={{
                  fontFamily: "var(--font-mono)", fontSize: "12px",
                  color: "var(--text-muted)", lineHeight: 1.6,
                }}>
                  Choose a file from the sidebar to view its source code and AI analysis results
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;

/* ── Helpers ──────────────────────────────────────────────────── */

function ComplexityBadge({ level }) {
  const cfg = {
    LOW:      { color: "var(--accent-green)",  bg: "rgba(63,185,80,0.1)"   },
    MEDIUM:   { color: "var(--accent-yellow)", bg: "rgba(227,179,65,0.1)"  },
    HIGH:     { color: "var(--accent-orange)", bg: "rgba(255,166,87,0.1)"  },
    CRITICAL: { color: "var(--accent-red)",    bg: "rgba(255,123,114,0.1)" },
  };
  const c = cfg[level] || { color: "var(--text-muted)", bg: "var(--bg-overlay)" };
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 600,
      color: c.color, background: c.bg, border: `1px solid ${c.color}30`,
    }}>
      {level}
    </span>
  );
}

function Spinner() {
  return (
    <span style={{
      width: "12px", height: "12px", display: "inline-block",
      border: "2px solid var(--text-muted)", borderTopColor: "transparent",
      borderRadius: "50%", animation: "spin 0.8s linear infinite",
    }} />
  );
}

/** Map file extensions to Monaco language identifiers */
function detectLanguage(fileName) {
  if (!fileName) return "plaintext";
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map = {
    js: "javascript", jsx: "javascript",
    ts: "typescript", tsx: "typescript",
    py: "python", java: "java",
    go: "go", rs: "rust", cpp: "cpp", c: "c",
    cs: "csharp", rb: "ruby", php: "php",
    html: "html", css: "css", scss: "scss",
    json: "json", yaml: "yaml", yml: "yaml",
    md: "markdown", sh: "shell", sql: "sql",
    xml: "xml", kt: "kotlin", swift: "swift",
  };
  return map[ext] || "plaintext";
}

/** File-type emoji icons for the sidebar */
function getFileIcon(fileName) {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  const icons = {
    js: "🟨", jsx: "⚛", ts: "🔷", tsx: "⚛",
    py: "🐍", java: "☕", go: "🔵", rs: "🦀",
    cpp: "⚙️", cs: "💜", rb: "💎", php: "🐘",
    html: "🌐", css: "🎨", json: "📋",
    md: "📄", sh: "🖥️", sql: "🗃️",
  };
  return icons[ext] || "📄";
}