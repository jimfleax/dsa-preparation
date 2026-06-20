/**
 * Extracts the titleSlug from a LeetCode problem URL.
 * Falls back to returning the full URL or null if parsing fails.
 *
 * @param url The LeetCode problem URL
 * @returns The titleSlug string or null
 */
export function extractTitleSlug(url: string): string | null {
  try {
    const match = url.match(/leetcode\.com\/problems\/([a-z0-9-]+)/i);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Builds a canonical LeetCode problem URL from a titleSlug.
 * 
 * @param slug The titleSlug string
 * @returns The full LeetCode URL
 */
export function buildLeetCodeUrl(slug: string): string {
  return `https://leetcode.com/problems/${slug}/`;
}
