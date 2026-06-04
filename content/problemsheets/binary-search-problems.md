---
title: Binary Search & Monotonic Space Problems
category: Searching
difficulty: Medium
tags: Binary Search, Binary Search on Answer
---
# Binary Search & Monotonic Space Problems

These problems check your understanding of binary search templates and searching on an absolute monotonic answer space.

---

## Problem 1: Search in Rotated Sorted Array (Medium)
**Description:** There is an integer array `nums` sorted in ascending order (with distinct values). Prior to being passed to your function, `nums` is possibly rotated at an unknown pivot index. Find the target index.

- **Sample Input:** `nums = [4,5,6,7,0,1,2]`, `target = 0`
- **Expected Output:** `4`
- **Constraints:** Time complexity must be $O(\log n)$.
- **Tip:** In a rotated sorted array, at least one half of any mid-point split MUST be fully sorted. Pinpoint which half is sorted, check if target lies in that range, and update your search range accordingly.

---

## Problem 2: Koko Eating Bananas (Medium)
**Description:** There are `n` piles of bananas. Koko wants to eat all bananas within `h` hours. Guard is gone for `h` hours. Determine the minimum integer speed `k` (bananas per hour) to finish all piles within `h` hours.

- **Sample Input:** `piles = [3,6,7,11]`, `h = 8`
- **Expected Output:** `4`
- **Tip:** This is a Binary Search on Answer problem. The speed space goes from `1` to `max(piles)`. For any midpoint speed `mid`, calculate total hours needed. If hours exceed `h`, increase speed; otherwise, decrease or maintain speed to see if a smaller speed works.
