# Alfa LeetCode API Research

## Overview
We are using the [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api/tree/main) to automate data entry and sync user progress.

## 1. Fetching Problem Details from URL
When a user pastes a LeetCode URL (e.g., `https://leetcode.com/problems/two-sum/`), we parse the `titleSlug` (`two-sum`).

**Endpoint:** `GET /select?titleSlug={titleSlug}`
**Response Data:**
```json
{
  "questionTitle": "Two Sum",
  "titleSlug": "two-sum",
  "link": "https://leetcode.com/problems/two-sum"
}
```
*Use Case: Auto-fill the title in the Add Problem modal.*

## 2. Syncing User Progress
To fetch all solved problems for a user, we hit the accepted submissions endpoint.

**Endpoint:** `GET /{username}/acSubmission?limit={limit}`
**Response Data:**
```json
{
  "count": 100,
  "submission": [
    {
      "id": "123456789",
      "timestamp": "1715865600",
      "title": "Two Sum",
      "titleSlug": "two-sum",
      "statusDisplay": "Accepted"
    }
  ]
}
```
*Use Case: Periodically poll this endpoint to update `attemptCount` and `lastSolvedDate` in our database. The timestamp is a UNIX epoch string that needs conversion.*
