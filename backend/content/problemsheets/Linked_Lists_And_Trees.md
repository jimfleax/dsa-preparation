---
title: Problem Sheet - Linked Lists and Trees
category: Data Structures
difficulty: Medium
tags: linked-list, tree, binary-tree, bst, two-pointers, traversal
---

# Problem Sheet: Linked Lists and Trees

### _Mastering Pointer Manipulation and Hierarchical Traversals_

---

> **Document Type:** Active Problem Sheet  
> **Concept:** Linked Lists, Binary Trees, Binary Search Trees  
> **Goal:** Develop intuition for pointer-chasing, recursion, and level-order traversals.

---

## 🏗️ Core Patterns to Recognize

Before attempting the problems below, make sure you understand the following foundational patterns:

1. **The Fast & Slow Pointer (Tortoise and Hare):** Used in Linked Lists to find the middle, detect cycles, or find the $k$-th element from the end. 
2. **Dummy Node:** Used to simplify edge cases when deleting the head of a Linked List or merging lists.
3. **DFS vs BFS in Trees:** 
   - **DFS (Depth-First Search):** Best for checking properties of paths from root to leaf. Can be done pre-order, in-order, or post-order. Usually implemented with recursion.
   - **BFS (Breadth-First Search):** Best for level-by-level analysis or finding the shortest path in unweighted graphs. Implemented with a Queue.
4. **The BST Property:** The left subtree of a node contains only nodes with keys lesser than the node's key. The right subtree contains only nodes with keys greater. An in-order traversal of a BST yields sorted elements.

---

## 🟢 Level 1: Foundation Building (Easy)

These problems verify your basic understanding of pointers and standard traversals. Do not move on until these are trivial.

### 1. Reverse a Linked List
- **Task:** Given the head of a singly linked list, reverse the list, and return the reversed list.
- **Goal:** Master the `prev`, `curr`, `next` pointer dance.
- **Mental Model:** Don't think about moving the nodes. Think about flipping the direction of the arrows between them.
- *Leetcode 206*

### 2. Maximum Depth of Binary Tree
- **Task:** Given the root of a binary tree, return its maximum depth.
- **Goal:** Write your first clean recursive DFS function.
- **Mental Model:** A node's maximum depth is simply $1 + \max(\text{left\_depth}, \text{right\_depth})$. Base case: if node is null, depth is 0.
- *Leetcode 104*

### 3. Invert Binary Tree
- **Task:** Given the root of a binary tree, invert the tree, and return its root.
- **Goal:** Understand pre-order/post-order traversal and swapping subtrees.
- **Mental Model:** Walk up to every node and swap its left and right children. If you do this for every node, the tree is inverted.
- *Leetcode 226*

---

## 🟡 Level 2: Pattern Recognition (Medium)

These problems require you to apply the core patterns creatively.

### 4. Linked List Cycle II (Find the Start of the Cycle)
- **Task:** Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.
- **Goal:** Apply Floyd's Tortoise and Hare algorithm.
- **Mental Model:** Fast pointer moves 2 steps, slow moves 1. If they meet, there's a cycle. To find the start, reset one pointer to the head, keep the other at the meeting point, and move both at 1 step per tick. Where they meet again is the start of the cycle.
- *Leetcode 142*

### 5. Validate Binary Search Tree
- **Task:** Given the root of a binary tree, determine if it is a valid binary search tree (BST).
- **Goal:** Understand that local properties are not enough; bounds must be passed down.
- **Mental Model:** A node must not only be greater than its left child, it must be greater than *everything* in its left subtree. Pass `(min, max)` boundaries down the recursive calls.
- *Leetcode 98*

### 6. Binary Tree Level Order Traversal
- **Task:** Given the root of a binary tree, return the level order traversal of its nodes' values.
- **Goal:** Master Breadth-First Search using a Queue.
- **Mental Model:** Put the root in a queue. While the queue is not empty, check how many items are in it (`size`). Pop exactly `size` items, record their values, and push their children. This ensures you process exactly one level per loop iteration.
- *Leetcode 102*

---

## 🔴 Level 3: Advanced Applications (Hard)

These problems require combining multiple patterns or recognizing non-obvious recursive structures.

### 7. Reverse Nodes in k-Group
- **Task:** Given the head of a linked list, reverse the nodes of the list `k` at a time, and return the modified list. If the number of nodes is not a multiple of `k` then left-out nodes should remain as it is.
- **Goal:** Extreme pointer management without losing track of sub-lists.
- **Mental Model:** Break it down. Write a helper function that just reverses a generic linked list. Then, in the main function, find the $k$-th node, break the link, call your helper, and reattach.
- *Leetcode 25*

### 8. Lowest Common Ancestor of a Binary Tree
- **Task:** Given a binary tree, find the lowest common ancestor (LCA) of two given nodes `p` and `q` in the tree.
- **Goal:** Master bottom-up recursion.
- **Mental Model:** Ask your left child: "Have you seen `p` or `q`?". Ask your right child the same. If *both* say yes, YOU are the LCA. If only one says yes, pass that "yes" up to your parent.
- *Leetcode 236*

### 9. Serialize and Deserialize Binary Tree
- **Task:** Design an algorithm to serialize a binary tree to a string and deserialize the string back to the original tree.
- **Goal:** Understand how structural information is encoded.
- **Mental Model:** Standard Pre-order traversal is perfect for this, as long as you explicitly record `null` pointers (e.g., as `"N"`). When deserializing, just read the string left-to-right to reconstruct the pre-order tree.
- *Leetcode 297*

---

## 💡 Review Checklist

Before finishing this problem sheet, ensure you can confidently answer:
- [ ] Why does `Fast & Slow` pointer math work to find cycle starts?
- [ ] Why is `Queue` used for BFS and `Stack` (or recursion) used for DFS?
- [ ] What happens if you try to validate a BST using only `node.left.val < node.val < node.right.val`?

---
_End of Document_
