---
title: Problem Sheet - Dynamic Programming and Greedy Algorithms
category: Algorithms
difficulty: Hard
tags: dynamic-programming, greedy, memoization, algorithms, optimization
---

# Problem Sheet: Dynamic Programming & Greedy Algorithms

### _Finding the Global Optimum Without Getting Lost in the Trees_

---

> **Document Type:** Active Problem Sheet  
> **Concept:** DP (1D & 2D), Greedy Choice Property  
> **Goal:** Differentiate between problems that require exploring all paths (DP) and problems where a local optimum leads to a global optimum (Greedy).

---

## 🏗️ Core Patterns to Recognize

1. **The Choice:** DP problems are fundamentally about making a choice at every step (e.g., "Take item" vs. "Skip item").
2. **The Greedy Property:** Can you make the locally best choice right now and never have to regret it? If yes, it's Greedy. If your choice depends on future choices, it's DP.
3. **1D DP vs 2D DP:** 
   - 1D DP usually involves a single sequence (an array or a string) where the state is just an index `i`.
   - 2D DP usually involves two sequences (comparing two strings) or an array plus a constraint (like a knapsack capacity), requiring a state `(i, j)`.
4. **The 5-Step DP Framework:** State Definition -> Base Cases -> Transition -> Memoize -> Tabulate.

---

## 🟢 Level 1: Foundation Building (Easy)

These problems verify that you understand the basic mechanics of state transitions and local optima.

### 1. Climbing Stairs
- **Task:** You are climbing a staircase with `n` steps. You can take 1 or 2 steps. How many distinct ways can you reach the top?
- **Goal:** The "Hello World" of DP.
- **Mental Model:** To reach step `n`, you must have come from `n-1` or `n-2`. So, `ways(n) = ways(n-1) + ways(n-2)`. (This is just the Fibonacci sequence!).
- *Leetcode 70*

### 2. Assign Cookies (Greedy)
- **Task:** You have `g` children and `s` cookies. Each child has a greed factor. Each cookie has a size. Maximize the number of content children.
- **Goal:** The "Hello World" of Greedy.
- **Mental Model:** Give the smallest cookie that works to the least greedy child. Sort both arrays and use two pointers.
- *Leetcode 455*

### 3. Min Cost Climbing Stairs
- **Task:** You are given an integer array `cost`. You can start at index 0 or 1. Pay the cost to move 1 or 2 steps. Find the minimum cost to reach the top.
- **Goal:** Introduce optimization (Min/Max) to DP.
- **Mental Model:** `min_cost(i) = cost[i] + min(min_cost(i-1), min_cost(i-2))`.
- *Leetcode 746*

---

## 🟡 Level 2: Pattern Recognition (Medium)

These problems require identifying standard DP frameworks (like the Knapsack) or proving a greedy choice works.

### 4. Coin Change
- **Task:** Given an array of coin denominations and a target `amount`, return the fewest number of coins needed to make up that amount.
- **Goal:** The Unbounded Knapsack pattern.
- **Mental Model:** For every coin `c`, ask: "What if I use this coin?". The answer is $1 + \text{CoinChange}(\text{amount} - c)$. Take the minimum across all possible coins.
- *Leetcode 322*

### 5. Jump Game (Greedy)
- **Task:** Given an array of integers where each element represents your maximum jump length, determine if you can reach the last index.
- **Goal:** Recognize when DP is overkill.
- **Mental Model:** You *could* use DP to check every path. Or, you can just keep track of the `furthest_reachable` index. If `furthest_reachable` ever drops below your current index, you're stuck.
- *Leetcode 55*

### 6. Longest Common Subsequence (2D DP)
- **Task:** Given two strings `text1` and `text2`, return the length of their longest common subsequence.
- **Goal:** Master 2D state transitions.
- **Mental Model:** You need a 2D array. Compare `text1[i]` and `text2[j]`. If they match, `dp[i][j] = 1 + dp[i-1][j-1]`. If they don't, `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.
- *Leetcode 1143*

---

## 🔴 Level 3: Advanced Applications (Hard)

These problems require non-obvious state definitions or combining DP with other techniques.

### 7. Edit Distance
- **Task:** Given two strings `word1` and `word2`, return the minimum number of operations (insert, delete, replace) required to convert `word1` to `word2`.
- **Goal:** Advanced 2D DP with multiple transition choices.
- **Mental Model:** Similar to LCS. If characters match, cost is 0. If they don't, try all 3 operations: `Insert` (check `i, j-1`), `Delete` (check `i-1, j`), `Replace` (check `i-1, j-1`). Take the min and add 1.
- *Leetcode 72*

### 8. Minimum Number of Taps to Open to Water a Garden (Greedy)
- **Task:** Given an array of tap ranges, find the minimum number of taps to cover the entire garden from `0` to `n`.
- **Goal:** The Interval Covering Greedy pattern.
- **Mental Model:** Convert tap ranges to `[start, end]` intervals. Sort by start time. Always pick the tap that extends your reach the furthest without leaving a gap from your current coverage.
- *Leetcode 1326*

### 9. Burst Balloons
- **Task:** You are given `n` balloons, each with a coin multiplier. If you burst balloon `i`, you get `nums[i-1] * nums[i] * nums[i+1]` coins. Return max coins.
- **Goal:** Interval DP / Reverse thinking.
- **Mental Model:** Standard DP (trying to burst the first balloon) fails because it changes the adjacent neighbors for future choices. Instead, think *backwards*: Which balloon should I burst **last**?
- *Leetcode 312*

---

## 💡 Review Checklist

Before finishing this problem sheet, ensure you can confidently answer:
- [ ] Why is Coin Change a DP problem while making change in US currency ($25c, 10c, 5c, 1c$) can be solved with a Greedy algorithm?
- [ ] How do you decide if a DP problem requires a 1D array or a 2D array for memoization?
- [ ] What is the time complexity difference between Top-Down Memoization and Bottom-Up Tabulation for the Edit Distance problem?

---
_End of Document_
