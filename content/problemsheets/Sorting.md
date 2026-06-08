---
title: Master Sorting Algorithms
category: Algorithms
tags: Sorting
---

# 🗺️ Master Sorting Algorithms

---

## 🏕️ Tier 1 — Foundation Verification

> _"Can you actually implement what you think you know?"_

These problems force you to implement the core mechanics. No shortcuts, no built-ins. If you can't do these cleanly, the advanced problems will destroy you.

---

### 🟢 Problem 1 — Sort an Array

**LeetCode #912** · Medium
🔗 https://leetcode.com/problems/sort-an-array/

**Why this problem?**
You're given an array of integers and must sort it in ascending order — _without using any built-in sort functions_ — in O(n log n) time with the smallest space complexity possible.

This is **the** implementation gauntlet. It forces you to pick between merge sort and quicksort and _actually write_ the full algorithm from scratch. The constraint "smallest space complexity" is a trap — it's nudging you toward quicksort (O(log n) stack space) over merge sort (O(n) auxiliary). You'll have to think about _why_ that difference exists.

**What it tests:** Core implementation of merge sort / quicksort. Divide-and-conquer mechanics. Space vs. time trade-off awareness.

---

### 🟢 Problem 2 — Merge Sorted Array

**LeetCode #88** · Easy
🔗 https://leetcode.com/problems/merge-sorted-array/

**Why this problem?**
You're given two sorted arrays and must merge them into one sorted array. The change must be done _in-place_ and the result stored in the first array.

This is **the merge step of merge sort, isolated and examined under a microscope.** If you truly understand the merge operation, this should feel natural. If you find yourself confused about where to start (front or back?), that reveals a gap in how you visualized the merge step.

**The twist:** Instead of starting from the beginning, the efficient approach starts at the _end_ of both arrays — because the largest numbers will occupy the last positions, and you avoid overwriting values you still need to compare.

**What it tests:** Merge step mechanics. In-place thinking. Two-pointer technique.

---

## 🏕️ Tier 2 — Core Concepts, Hidden Depth

> *"Do you understand what your algorithm is *really* doing?"*

These problems look simple but contain a deep conceptual trap. Each one targets a specific principle that you may have glossed over.

---

### 🟡 Problem 3 — Sort Colors (Dutch National Flag)

**LeetCode #75** · Medium
🔗 https://leetcode.com/problems/sort-colors/

**Why this problem?**
Given an array with objects colored red (0), white (1), or blue (2), sort them in-place so that same colors are adjacent in the order red → white → blue — _without_ using a library sort function.

This is the **Dutch National Flag problem**, which is the _intellectual heart of quicksort's partition step_. When you learned quicksort, you learned to partition around a pivot. This problem forces you to understand _3-way partitioning_ — the version that handles **duplicate elements elegantly**. This is also exactly the optimization that makes real-world quicksort fast on arrays with many repeated values.

**What it tests:** Quicksort partition logic. 3-way partitioning. In-place invariant maintenance with three moving pointers.

---

### 🟡 Problem 4 — Kth Largest Element in an Array

**LeetCode #215** · Medium
🔗 https://leetcode.com/problems/kth-largest-element-in-an-array/

**Why this problem?**
You don't need to sort the _whole_ array to find the k-th largest element. This is the **Quickselect** algorithm — a brilliant derivative of quicksort that uses the partition step but only recurses into _one_ side instead of both.

Quickselect partitions the array around a pivot, then recurses only on the relevant side. Using smarter pivot choices yields deterministic O(n) selection.

**The conceptual punch:** This problem forces you to realize that quicksort's partition step is independently powerful. You don't need the full sort — just one half of the recursion tree. This is the moment when sorting and searching _merge_ in your brain.

**What it tests:** Quickselect. Partition-only recursion. Average O(n) vs. worst-case O(n²) analysis. Randomized pivoting.

---

### 🟡 Problem 5 — Sort List

**LeetCode #148** · Medium
🔗 https://leetcode.com/problems/sort-list/

**Why this problem?**
Sort a linked list in O(n log n) time and O(1) space (constant auxiliary space).

This is a **brutal test of whether you truly understand merge sort** vs. just having memorized it for arrays. Merge sort on a linked list forces you to re-derive _why_ the algorithm works from first principles. You can't use index arithmetic. You have to find the midpoint using slow/fast pointers, split the list physically, and then merge two linked lists — not arrays.

**What it tests:** Merge sort on a non-array structure. Pointer manipulation. The algorithm's structure independent of its data container.

---

## 🏕️ Tier 3 — Algorithmic Insight Problems

> *"Can you recognize when a sorting algorithm's *mechanism* is the solution — not just a preprocessing step?"*

---

### 🔴 Problem 6 — Count of Smaller Numbers After Self

**LeetCode #315** · Hard
🔗 https://leetcode.com/problems/count-of-smaller-numbers-after-self/

**Why this problem?**
This is a classic divide-and-conquer sorting problem that appears repeatedly in advanced algorithm study. For each element, count how many elements to its _right_ are smaller than it.

The breakthrough insight: this is **counting inversions using a modified merge sort.** When merging two halves, if an element from the left half is greater than an element from the right half, all elements after it in the left half are also greater — allowing you to count multiple inversions at once. This is the moment you stop seeing merge sort as "just a sorting algorithm" and start seeing it as a **divide-and-conquer counting engine**.

**What it tests:** Modified merge sort. Inversion counting. Piggyback logic on the merge step.

---

### 🔴 Problem 7 — Reverse Pairs

**LeetCode #493** · Hard
🔗 https://leetcode.com/problems/reverse-pairs/

**Why this problem?**
Count pairs `(i, j)` where `i < j` and `nums[i] > 2 * nums[j]`.

This is the **boss fight of merge sort understanding.** It extends the inversion-counting idea but with a non-trivial condition (`> 2 *`). You can no longer count within the merge step directly — you have to count _before_ merging, then merge. This forces you to truly understand what the sorted order of subarrays gives you, and how to leverage binary search or two pointers during the merge phase.

**What it tests:** Advanced merge sort augmentation. Two-phase merge thinking. Complexity analysis under modified conditions.

---

## 🏕️ Tier 4 — The Gut-Check Problem

> _"Do you know WHEN to use which algorithm?"_

---

### 🟣 Problem 8 — Wiggle Sort II

**LeetCode #324** · Medium
🔗 https://leetcode.com/problems/wiggle-sort-ii/

**Why this problem?**
Reorder an array such that `nums[0] < nums[1] > nums[2] < nums[3]...` — strictly alternating. The catch: you must solve it in O(n) time and O(1) space.

This problem brings together **quickselect** (to find the median), **3-way partitioning** (Dutch National Flag), and clever index mapping. It's a synthesis problem — you need knowledge from both quicksort and the DNF problem to crack it. No single algorithm solves it; you have to compose them.

**What it tests:** Algorithm composition. Median-finding via quickselect. Index interleaving logic.

---

## 📊 The Full Roadmap at a Glance

| #   | Problem                  | Platform      | Difficulty | Core Concept Tested                     |
| --- | ------------------------ | ------------- | ---------- | --------------------------------------- |
| 1   | Sort an Array            | LeetCode #912 | 🟡 Medium  | Implement merge/quick sort from scratch |
| 2   | Merge Sorted Array       | LeetCode #88  | 🟢 Easy    | Isolated merge step, in-place           |
| 3   | Sort Colors              | LeetCode #75  | 🟡 Medium  | Quicksort 3-way partition (DNF)         |
| 4   | Kth Largest Element      | LeetCode #215 | 🟡 Medium  | Quickselect — partial partition         |
| 5   | Sort List                | LeetCode #148 | 🟡 Medium  | Merge sort on linked list               |
| 6   | Count Smaller After Self | LeetCode #315 | 🔴 Hard    | Modified merge sort, inversion counting |
| 7   | Reverse Pairs            | LeetCode #493 | 🔴 Hard    | Advanced merge sort augmentation        |
| 8   | Wiggle Sort II           | LeetCode #324 | 🟡 Medium  | Quickselect + DNF composition           |

---

## 🎯 Bonus (HackerRank — Pure Inversion Counting)

**Counting Inversions (Merge Sort)**
🔗 https://www.hackerrank.com/challenges/ctci-merge-sort/problem

Two elements form an inversion if the one at the lower index is greater than the one at the higher index. The task is to count the total number of inversions needed to sort the array. This is the canonical standalone problem for merge-sort-based inversion counting — worth doing before #315 if that feels too steep.

---

## 🗓️ Suggested Attack Order

```
Day 1:  #88  → #912        (warm up, implement from scratch)
Day 2:  #75  → #215        (master partition in two flavors)
Day 3:  #148               (merge sort without arrays — structural test)
Day 4:  HackerRank Inversions → #315  (count on the merge step)
Day 5:  #493               (advanced augmentation)
Day 6:  #324               (synthesize everything)
```

Whenever you're ready to start one, just say **"let's do a DSA problem"** and drop the link — I'll walk you through it Socratically, hint by hint, no solutions handed over until you've genuinely wrestled with it. 🥊
