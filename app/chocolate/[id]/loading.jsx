import { SkeletonBlock } from '../../../src/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="skeleton-page" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
      <SkeletonBlock width="300px" height="300px" />
      <div style={{ flex: 1, minWidth: '280px' }}>
        <SkeletonBlock width="10rem" height="0.9rem" />
        <SkeletonBlock width="70%" height="2.2rem" style={{ marginTop: '0.8rem' }} />
        <SkeletonBlock width="45%" height="1rem" style={{ marginTop: '1rem' }} />
        <SkeletonBlock width="60%" height="1rem" style={{ marginTop: '0.6rem' }} />
        <SkeletonBlock width="100%" height="8rem" style={{ marginTop: '1.6rem' }} />
      </div>
    </div>
  );
}
