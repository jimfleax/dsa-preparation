export function getInstructionText(): string {
  return `Please generate the track data exactly following the structure below. DO NOT add any markdown formatting (like bolding or backticks) inside the URLs.

# Track: <Replace with exact Track Title>

> <Replace with a 1-2 sentence description of the track>

## <Optional Subtrack Title>

> <Optional subtrack description>

https://leetcode.com/problems/<slug>/
https://leetcode.com/problems/<slug>/
https://leetcode.com/problems/<slug>/

## <Another Subtrack Title>

https://leetcode.com/problems/<slug>/
https://leetcode.com/problems/<slug>/

---
Rules:
1. "Track Title" must be exactly one.
2. Provide URLs exactly as shown (must end with trailing slash: \`/\`).
3. Each subtrack MUST contain at least one URL.
4. Do not include titles, difficulty, or tags next to the URLs. Only the raw URL.
5. Do not output anything else. No introductory or concluding remarks.`;
}
