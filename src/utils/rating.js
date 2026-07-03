// Weighted ("Bayesian") rating: a 5.0 from one review shouldn't outrank a
// 4.6 from forty. Blends each bar's average toward the site-wide prior until
// it has enough reviews to stand on its own. Same approach IMDb uses for its
// Top 250.

const PRIOR_MEAN = 3.8; // site-wide prior for an unknown bar
const PRIOR_WEIGHT = 5; // reviews needed before a bar's own average dominates

export function weightedRating(chocolate) {
  const count = chocolate?.reviewCount || 0;
  const avg = chocolate?.averageRating || 0;
  if (count === 0) return 0;
  return (
    (count / (count + PRIOR_WEIGHT)) * avg +
    (PRIOR_WEIGHT / (count + PRIOR_WEIGHT)) * PRIOR_MEAN
  );
}

export function sortByWeightedRating(chocolates) {
  return [...chocolates].sort((a, b) => weightedRating(b) - weightedRating(a));
}
