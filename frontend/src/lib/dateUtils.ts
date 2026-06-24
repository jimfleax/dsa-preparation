/**
 * Computes a human-readable relative time string (e.g. "3 days ago").
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Strip time components to compare strict calendar days
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffMs = nowMidnight.getTime() - dateMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
