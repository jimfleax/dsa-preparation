---
title: Arrays and Strings Reference
category: Basic Structures
difficulty: Easy
tags: Arrays, Strings, Sliding Window, Two Pointers
---
# Arrays & Strings Reference

Welcome to the Arrays and Strings theory module. These two structures are the absolute foundation of most data structures and algorithms patterns.

## 1. Memory and Layout
An **Array** is a contiguous block of memory. Each element is accessible in $O(1)$ time by index due to direct memory offset calculation:
$$\text{Address}(i) = \text{BaseAddress} + i \times \text{SizeOfElement}$$

**Strings** are usually implemented as character arrays under the hood. In languages like Java or Python, strings are **immutable**, which means any modification creates a new string. In C++, strings are mutable.

## 2. Key Algorithms and Patterns

### Sliding Window
Used to perform elements operations on a nested array subrange in $O(N)$ time.
- **Fixed Window**: Size $K$ is constant.
- **Variable Window**: Adjust left and right boundaries dynamically based on state conditions.

```typescript
function findMaxSumSubarray(arr: number[], k: number): number {
  let maxSum = 0;
  let windowSum = 0;
  
  // First window
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;
  
  // Slide the window
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}
```

### Two Pointers
Typically operates on **sorted arrays** where pointers start at opposite ends or one pointer moves at a different speed.
- **Opposite Ends**: Meet in the middle (e.g., Two Sum on sorted array).
- **Fast and Slow**: Detection of loops, finding the middle (e.g., Floyd's Cycle detection).

## 3. Recommended Focus
- Subarray vs Subsequence vs Subset definitions.
- Prefix sums array for constant time range sum queries.
- String hashing and sorting tricks.
