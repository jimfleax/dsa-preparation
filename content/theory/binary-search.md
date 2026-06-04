---
title: Binary Search Foundations
category: Algorithms
difficulty: Medium
tags: Searching, Binary Search, Divide & Conquer
---
# Binary Search Foundations

Binary Search is one of the most powerful algorithms, reducing $O(N)$ linear scans to $O(\log N)$ logarithmic time logic.

## 1. General Template
The classic search template requires careful handling of boundaries to prevent infinite loops:

```typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    // Avoids integer overflow on huge arrays
    const mid = Math.floor(left + (right - left) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Not found
}
```

## 2. Common Pitfalls & Corner Cases
- **Integer Overflow**: `(left + right) / 2` can overflow in standard languages like Java/C++. Always prefer `left + (right - left) / 2`.
- **Termination Conditions**: Choosing between `left < right` and `left <= right`.
- **Mid-point selection**: Using floor vs. ceiling division when left/right updates are asymmetrical.

## 3. Advanced Strategy: Binary Search on Answer
Instead of searching for an element in an array, binary search can be used to find the optimal solution in a contiguous monotonic space.
- Define a boolean validator function `isValid(x: number): boolean` which is true/false in a sorted monotonic fashion (e.g., `[true, true, true, false, false]`).
- Run binary search to find the boundary of transitions. Useful for problems like *Koko Eating Bananas*, *Capacity to Ship Packages Within D Days*, and *Book Allocation Problem*.
