/**
 * Utility function to scrape the title from a LeetCode problem using GraphQL API.
 * Accepts a LeetCode problem URL and returns the exact title from LeetCode.
 */

import { extractTitleSlug } from "./slugUtils.ts";

/**
 * Fetches the exact title and difficulty from LeetCode using their GraphQL API.
 * @param url - The LeetCode problem URL
 * @returns The problem title and difficulty, or null if not found
 * @throws An error if the network request fails
 */
export async function getLeetCodeProblemInfo(
  url: string,
): Promise<{ title: string; difficulty: string } | null> {
  try {
    // 1. Extract the problem "slug" from the URL
    // e.g., from "https://leetcode.com/problems/two-sum/" we extract "two-sum"
    const titleSlug = extractTitleSlug(url);
    if (!titleSlug) {
      throw new Error(
        "Invalid LeetCode URL. Must contain '/problems/problem-slug/'",
      );
    }

    // 2. Prepare the GraphQL query
    const graphqlQuery = {
      operationName: "questionData",
      variables: { titleSlug: titleSlug },
      query: `query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          difficulty
        }
      }`,
    };

    // 3. Make a POST request to LeetCode's GraphQL endpoint
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // A generic User-Agent helps prevent basic blocks
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 4. Extract and return the info
    if (data.data && data.data.question) {
      const { title, difficulty } = data.data.question;
      console.log(
        `[LeetCode Scraper] Found - Title: ${title}, Difficulty: ${difficulty}`,
      );
      return { title, difficulty };
    } else if (data.errors) {
      console.error("[LeetCode Scraper] GraphQL error:", data.errors);
      return null;
    } else {
      console.log("[LeetCode Scraper] Problem not found.");
      return null;
    }
  } catch (error) {
    console.error(
      "[LeetCode Scraper] Error fetching info:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

/**
 * Backward-compatible wrapper for fetching just the title.
 */
export async function getLeetCodeTitle(url: string): Promise<string | null> {
  const info = await getLeetCodeProblemInfo(url);
  return info ? info.title : null;
}

/**
 * Fetches the user's recent accepted submissions.
 * Note: LeetCode API typically limits this to the last ~15-20 submissions.
 * @param username - The LeetCode username
 * @param limit - Max number of submissions to fetch (default: 20)
 */
export async function fetchRecentAcceptedSubmissions(
  username: string,
  limit: number = 20,
): Promise<{ title: string; titleSlug: string; timestamp: string }[]> {
  try {
    const graphqlQuery = {
      operationName: "recentAcSubmissions",
      variables: {
        username: username,
        limit: limit,
      },
      query: `query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
        }
      }`,
    };

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.data && data.data.recentAcSubmissionList) {
      return data.data.recentAcSubmissionList;
    } else if (data.errors) {
      console.error(
        "[LeetCode Scraper] GraphQL error (recentAcSubmissions):",
        data.errors,
      );
      return [];
    } else {
      return [];
    }
  } catch (error) {
    console.error(
      "[LeetCode Scraper] Error fetching recent submissions:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}
