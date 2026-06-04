---
title: Two Pointers & Sliding Window
category: Algorithms
tags: two pointers, sliding window, arrays
---
### **Part 1: Two Pointers**

*The Core Idea:* You have two markers (pointers) traversing an array or string. They usually either start at opposite ends and move toward the middle (Collision), or start at the same end and move at different speeds (Fast/Slow).

**Group A: Opposite Ends (Collision)**
This pattern is typically used when the array is **sorted** or when you need to pair elements from the extreme ends.

1. **Foundational:** [Two Sum II - Input Array Is Sorted (LC 167)](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
* *Why:* The quintessential two-pointer problem. It forces you to understand how moving the left or right pointer conditionally changes your sum in a predictable way.


2. **Slightly Different (Greedy Choice):** [Container With Most Water (LC 11)](https://leetcode.com/problems/container-with-most-water/)
* *Why:* The array isn't sorted, but there is a mathematical constraint. You have to figure out *which* pointer to move based on the bottleneck (the shorter line).


3. **The "Boss" Level:** [3Sum (LC 15)](https://leetcode.com/problems/3sum/)
* *Why:* It combines sorting with the logic of Two Sum II, plus it introduces the critical challenge of handling duplicate values without using extra memory.



**Group B: Same Direction (Fast & Slow)**
This pattern is often used for in-place array modifications or detecting cycles.

4. **Foundational:** [Move Zeroes (LC 283)](https://leetcode.com/problems/move-zeroes/)
* *Why:* It introduces the "Read/Write" pointer concept. One pointer evaluates the data, and the other pointer tracks where the next valid element should be placed.


5. **Slightly Different (Linked Lists):** [Linked List Cycle (LC 141)](https://leetcode.com/problems/linked-list-cycle/)
* *Why:* Translates the concept to a new data structure. You'll learn Floyd’s Tortoise and Hare algorithm, a staple pattern.



---

### **Part 2: Sliding Window**

*The Core Idea:* You maintain a "window" of elements between a left and right pointer. As the right pointer expands the window to include new elements, the left pointer shrinks it to maintain a specific constraint.

**Group C: Fixed-Size Window**
The window size `k` never changes. You just slide it by adding the new element on the right and removing the old element on the left.

6. **Foundational:** [Maximum Average Subarray I (LC 643)](https://leetcode.com/problems/maximum-average-subarray-i/)
* *Why:* Teaches the basic math of a sliding window. You calculate the initial window, then efficiently update the state in $O(1)$ time per step.


7. **Slightly Different (Hash Maps):** [Permutation in String (LC 567)](https://leetcode.com/problems/permutation-in-string/)
* *Why:* You maintain a fixed window, but instead of tracking a sum, you are tracking character frequencies.



**Group D: Variable-Size Window (Finding the LONGEST/MAXIMUM)**
You expand the window as long as it is *valid*. Once it becomes *invalid*, you shrink the left side just enough to make it valid again.

8. **Foundational:** [Longest Substring Without Repeating Characters (LC 3)](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
* *Why:* The most famous sliding window problem. It teaches you how to use a Set or Map to detect duplicates and dynamically shrink the left pointer.


9. **Slightly Different (Budget/Replacements):** [Max Consecutive Ones III (LC 1004)](https://leetcode.com/problems/max-consecutive-ones-iii/)
* *Why:* Introduces a "budget" (you can flip up to `k` zeroes). Your window validity relies on not exceeding that budget.



**Group E: Variable-Size Window (Finding the SHORTEST/MINIMUM)**
You expand the window until it becomes *valid*. Once it is valid, you aggressively shrink the left side as much as possible while *keeping* it valid to find the absolute minimum size.

10. **Foundational:** [Minimum Size Subarray Sum (LC 209)](https://leetcode.com/problems/minimum-size-subarray-sum/)
* *Why:* Teaches the "inner `while` loop" shrink mechanic. (This is exactly what you were debugging in your previous session!).


11. **The "Boss" Level:** [Minimum Window Substring (LC 76)](https://leetcode.com/problems/minimum-window-substring/)
* *Why:* This is the ultimate test of Sliding Window intuition. You have to manage a frequency map, a variable window, and an aggressive shrinking condition all at once.

