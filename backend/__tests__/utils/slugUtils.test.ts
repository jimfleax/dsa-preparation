import { extractTitleSlug } from "../../src/lib/slugUtils.ts";

describe("slugUtils - extractTitleSlug", () => {
  it("extracts slug from standard LeetCode URL", () => {
    const url = "https://leetcode.com/problems/two-sum/";
    expect(extractTitleSlug(url)).toBe("two-sum");
  });

  it("extracts slug from URL without trailing slash", () => {
    const url = "https://leetcode.com/problems/two-sum";
    expect(extractTitleSlug(url)).toBe("two-sum");
  });

  it("extracts slug from URL with query parameters", () => {
    const url = "https://leetcode.com/problems/two-sum/?envType=study-plan-v2&envId=top-interview-150";
    expect(extractTitleSlug(url)).toBe("two-sum");
  });

  it("extracts slug from URL with /description suffix", () => {
    const url = "https://leetcode.com/problems/two-sum/description/";
    expect(extractTitleSlug(url)).toBe("two-sum");
  });

  it("forces the slug to be lowercase", () => {
    const url = "https://leetcode.com/problems/Two-Sum/";
    expect(extractTitleSlug(url)).toBe("two-sum");
  });

  it("returns null for non-LeetCode URLs", () => {
    const url = "https://google.com/problems/two-sum/";
    expect(extractTitleSlug(url)).toBeNull();
  });

  it("returns null for malformed URLs", () => {
    expect(extractTitleSlug("not-a-url")).toBeNull();
  });
});
