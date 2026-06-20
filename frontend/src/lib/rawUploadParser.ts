export interface ParsedUrl {
  url: string;
  slug: string;
}

export interface ParsedPart {
  title: string;
  description?: string;
  urls: ParsedUrl[];
}

export interface ParseResult {
  success: boolean;
  trackTitle?: string;
  trackDescription?: string;
  rootUrls: ParsedUrl[];
  parts: ParsedPart[];
  errors: { line: number; message: string }[];
  warnings: { line: number; message: string }[];
  totalUrlCount: number;
}

export function parseRawUploadMarkdown(md: string): ParseResult {
  const result: ParseResult = {
    success: false,
    rootUrls: [],
    parts: [],
    errors: [],
    warnings: [],
    totalUrlCount: 0,
  };

  const lines = md.split("\n");
  let currentPart: ParsedPart | null = null;
  let seenSlugs = new Set<string>();

  let hasFoundTrackTitle = false;
  let trackTitleCount = 0;
  let hasFoundTrackDescription = false;
  let expectingTrackDescription = false;
  let expectingPartDescription = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    const lineNum = i + 1;

    if (!line) continue;

    // Track Title
    if (line.startsWith("# Track:")) {
      trackTitleCount++;
      if (trackTitleCount > 1) {
        result.errors.push({
          line: lineNum,
          message: "Multiple '# Track:' headers found. Only one track allowed.",
        });
      } else {
        result.trackTitle = line.replace("# Track:", "").trim();
        hasFoundTrackTitle = true;
        expectingTrackDescription = true;
        expectingPartDescription = false;
      }
      continue;
    }

    // Subtrack Title
    if (line.startsWith("## ")) {
      expectingTrackDescription = false;
      expectingPartDescription = true;
      const partTitle = line.replace("## ", "").trim();
      currentPart = { title: partTitle, urls: [] };
      result.parts.push(currentPart);
      continue;
    }

    // Descriptions (Blockquotes)
    if (line.startsWith(">")) {
      const descText = line.replace(">", "").trim();
      if (expectingTrackDescription && !hasFoundTrackDescription) {
        result.trackDescription = descText;
        hasFoundTrackDescription = true;
        expectingTrackDescription = false;
      } else if (expectingPartDescription && currentPart) {
        currentPart.description = currentPart.description 
          ? currentPart.description + " " + descText 
          : descText;
        expectingPartDescription = false;
      }
      continue;
    }

    // Stop expecting descriptions if we hit non-blockquote text
    expectingTrackDescription = false;
    expectingPartDescription = false;

    // LeetCode URL Matching
    if (line.includes("leetcode.com/problems/")) {
      // Basic extraction
      const match = line.match(/https?:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?/i);
      
      if (!match) {
        result.warnings.push({
          line: lineNum,
          message: "Found text that looks like a LeetCode URL but doesn't match the valid slug pattern (lowercase, hyphens, digits).",
        });
        continue;
      }

      const slug = match[1].toLowerCase();
      let canonicalUrl = `https://leetcode.com/problems/${slug}/`;

      if (!line.endsWith("/")) {
        result.warnings.push({
          line: lineNum,
          message: `Added missing trailing slash to URL: ${slug}`,
        });
      }

      if (seenSlugs.has(slug)) {
        result.errors.push({
          line: lineNum,
          message: `Duplicate problem detected: ${slug}`,
        });
        continue;
      }

      seenSlugs.add(slug);
      result.totalUrlCount++;

      const parsedUrl = { url: canonicalUrl, slug };

      if (currentPart) {
        currentPart.urls.push(parsedUrl);
      } else {
        result.rootUrls.push(parsedUrl);
      }
    } else if (line.startsWith("http")) {
       result.warnings.push({
         line: lineNum,
         message: "Found a non-LeetCode URL. It will be ignored."
       });
    }
  }

  // Final Validations
  if (trackTitleCount === 0) {
    result.errors.push({
      line: 1,
      message: "Missing '# Track: <title>' header.",
    });
  } else if (!result.trackTitle) {
     result.errors.push({
      line: 1,
      message: "Track title cannot be empty.",
    });
  }

  if (trackTitleCount === 1 && !result.trackDescription) {
    result.errors.push({
      line: 2,
      message: "Missing track description blockquote ('> <description>').",
    });
  }

  if (result.totalUrlCount === 0) {
    result.errors.push({
      line: 1,
      message: "No valid LeetCode URLs found.",
    });
  }

  result.parts.forEach((part, index) => {
    if (part.urls.length === 0) {
      result.errors.push({
        line: 1, // Line tracking for parts is complex without retaining full AST, generic error is fine here
        message: `Subtrack '${part.title}' has no URLs.`,
      });
    }
  });

  result.success = result.errors.length === 0;

  return result;
}
