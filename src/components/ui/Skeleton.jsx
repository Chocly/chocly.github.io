// Shared loading skeletons. Route-level loading.jsx files render these so
// navigation feels instant instead of showing bare "Loading..." text.
import './Skeleton.css';

export function SkeletonBlock({ width = '100%', height = '1rem', style }) {
  return <span className="skeleton-block" style={{ width, height, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <SkeletonBlock height="200px" />
      <SkeletonBlock width="80%" height="1.1rem" style={{ marginTop: '0.9rem' }} />
      <SkeletonBlock width="50%" height="0.9rem" style={{ marginTop: '0.5rem' }} />
    </div>
  );
}

export function SkeletonGrid({ count = 8, title = true }) {
  return (
    <div className="skeleton-page">
      {title && <SkeletonBlock width="16rem" height="2rem" style={{ marginBottom: '1.5rem' }} />}
      <div className="skeleton-grid">
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
