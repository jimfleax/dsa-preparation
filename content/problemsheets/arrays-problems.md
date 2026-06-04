---
title: Sliding Window & Two Pointers Problemset
category: Arrays & Strings
difficulty: Hard
tags: Two Sum, Sliding Window, Pointers
---
# Sliding Window & Two Pointers Problemset

Practice makes perfect. Work through these curated array and string problems. Attempt them first on paper or in your code editor before checking solutions.

---

## Problem 1: Two Sum II - Input Array Is Sorted (Medium)
**Description:** Given a 1-indexed array of integers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.

- **Constraints:**
  - Space complexity must be $O(1)$.
  - Time complexity must be $O(N)$.
- **Tip:** Use two pointers starting at the front and back of the array. Adjust left/right pointers depending on whether the current sum is less than or greater than the target.

---

## Problem 2: Longest Substring Without Repeating Characters (Medium)
**Description:** Given a string `s`, find the length of the longest substring without repeating characters.

- **Sample Input:** `s = "abcabcbb"`
- **Expected Output:** `3` (for substring `"abc"`)
- **Tip:** Use a variable sliding window. Use a hash map or boolean array to track seen characters and shrink the left window edge when duplicates occur.

---

## Problem 3: Minimum Window Substring (Hard)
**Description:** Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.

- **Sample Input:** `s = "ADOBECODEBANC"`, `t = "ABC"`
- **Expected Output:** `"BANC"`
- **Tip:** Use a two-pointer sliding window and keep counts of target characters matching the constraints. Expand the window to the right and greedily contract it from the left while maintaining constraints.
