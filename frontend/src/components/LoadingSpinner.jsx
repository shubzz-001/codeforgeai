/**
 * LoadingSpinner — reusable animated spinner with optional label.
 *
 * Props:
 *   size    — 'sm' | 'md' | 'lg'  (default 'md')
 *   color   — CSS color string      (default var(--accent-primary))
 *   label   — text shown below spinner
 *   fullPage — centers inside 100vh if true
 */
export default function LoadingSpinner({
  size = 'md',
  color = 'var(--accent-primary)',
  label,
  fullPage = false,
}) {
  const dimensions = { sm: 18, md: 32, lg: 48 };
  const thickness  = { sm: 2,  md: 3,  lg: 4  };
  const px = dimensions[size] || dimensions.md;
  const bw = thickness[size]  || thickness.md;

  const spinner = (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    }}>
      {/* Outer ring */}
      <div style={{ position: 'relative', width: px, height: px }}>
        {/* Track */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: `${bw}px solid var(--border-default)`,
        }} />
        {/* Spinning arc */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: `${bw}px solid transparent`,
          borderTopColor: color,
          animation: 'spin 0.75s linear infinite',
        }} />
        {/* Inner dot for larger sizes */}
        {size === 'lg' && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px', height: '8px', borderRadius: '50%',
            background: color, opacity: 0.6,
            animation: 'pulse-glow 1s ease-in-out infinite',
          }} />
        )}
      </div>

      {label && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--text-muted)', letterSpacing: '0.1em',
        }}>
          {label}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg-base)',
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * SkeletonBlock — a shimmer placeholder block.
 */
export function SkeletonBlock({ width = '100%', height = '16px', radius = 'var(--radius-sm)', style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-overlay) 50%, var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
}

/**
 * SkeletonCard — a placeholder shaped like a ProjectCard.
 */
export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SkeletonBlock width="60%" height="16px" />
        <SkeletonBlock width="60px" height="20px" radius="var(--radius-sm)" />
      </div>
      <SkeletonBlock width="100%" height="12px" />
      <SkeletonBlock width="80%"  height="12px" />
      <div style={{ display: 'flex', gap: '16px' }}>
        <SkeletonBlock width="50px" height="32px" />
        <SkeletonBlock width="50px" height="32px" />
        <SkeletonBlock width="50px" height="32px" />
      </div>
      <SkeletonBlock width="100%" height="6px" radius="3px" />
    </div>
  );
}