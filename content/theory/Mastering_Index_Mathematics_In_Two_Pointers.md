---
title: Mastering Boundary Mathematics for Two Pointers & Sliding Window
category: Algorithms
tags: two-pointers, sliding-window, index-mathematics, boundary-conditions, off-by-one-errors, loop-invariants, interview-prep
---

# The Index Engineer's Field Manual

### Mastering Boundary Mathematics for Two Pointers & Sliding Window

> _"One wrong `<` sign can fail an interview. Stop guessing boundaries and learn the
> conventions that make every index formula derivable — not memorizable."_

---

## Table of Contents

1. [The Root Cause — Why This Keeps Happening](#part-i)
2. [The Language of Ranges — Boundary Conventions](#part-ii)
3. [The 6 Index Formulas You Must Own](#part-iii)
4. [The 3 Pointer Archetypes & Their Invariants](#part-iv)
5. [Safety Standards — The Pre-Flight Checklist](#part-v)
6. [The Loop Invariant Framework](#part-vi)
7. [The Dry Run Protocol](#part-vii)
8. [The Error Gallery — Common Failures & Diagnoses](#part-viii)
9. [Curated Practice Problems](#part-ix)

---

<a name="part-i"></a>

## Part I: The Root Cause — Why This Keeps Happening

### The Fencepost Story

Picture this: you hire a contractor to build a fence along a 10-meter wall. You say "put a post
every 1 meter." The contractor thinks for a moment, then asks: "Do you mean 10 posts or 11?"

You stare at them blankly. "There are 10 meters, so... 10 posts?"

But draw it out:

```
|    |    |    |    |    |    |    |    |    |    |
0    1    2    3    4    5    6    7    8    9    10
```

There are 10 gaps but **11 posts**. If you want posts at positions 0 through 10 _inclusive_, you
need 10 - 0 + 1 = **11** of them.

This is the **Fencepost Problem** — the oldest and most universal source of off-by-one errors in
all of computing. It has a real name in computer science (Djikstra wrote about it in 1982). It
trips up beginners and experienced engineers alike because **human brains count intervals, but
arrays are indexed by posts**.

Every single index error you've ever made in a two-pointer or sliding window problem is a variant
of the fencepost problem. Once you see this, you can fix the root cause instead of patching
symptoms.

---

### Why Your Brain Lies to You

There are exactly **two** reasons index bugs keep appearing, even when you "understand" the
algorithm:

**Reason 1 — Zero-based indexing fights human intuition.**

Humans count from 1. Arrays start at 0. When you see an array of 5 elements and your brain says
"the last element is at position 5," it is _wrong_. The last element is at position 4.

```
Array: [10, 20, 30, 40, 50]
Index:   0   1   2   3   4
              Brain says "5"  ↑
              Reality says "4" ↑
```

**Reason 2 — You mix inclusive and exclusive boundaries without realising it.**

You write `while left <= right` (inclusive on both sides), but then calculate `right - left` for
the window size (which is the exclusive-right formula). These two conventions have _different
math_. Mixing them produces an answer that is off by exactly one — every time.

This is the fundamental insight of this entire manual:

> **Every correct index formula is a direct, logical consequence of your boundary convention.
> There is nothing to memorize. You only need to choose your convention and derive.**

---

<a name="part-ii"></a>

## Part II: The Language of Ranges — Boundary Conventions

### The Two Conventions

When you say "the elements from index `L` to index `R`," you have to decide:
is `R` _included_ or _excluded_? This choice creates two distinct universes of formulas.

#### Convention A: Closed Interval [L, R] — Both Ends Inclusive

```
Array:  [ a, b, c, d, e ]
Index:    0  1  2  3  4

Interval [1, 3] means: indices 1, 2, 3
                          ↑              ↑
                        included       included
                      (b, c, d)
```

When you use `[L, R]`, both `L` and `R` are _valid elements you intend to touch_. The loop runs
**while `L <= R`** because when L equals R, there is still one element to process.

#### Convention B: Half-Open Interval [L, R) — Left Inclusive, Right Exclusive

```
Array:  [ a, b, c, d, e ]
Index:    0  1  2  3  4

Interval [1, 4) means: indices 1, 2, 3
                          ↑        ↑
                        included  excluded
                      (b, c, d)
```

When you use `[L, R)`, `R` is a _sentinel_ — it points one past the last valid element. The loop
runs **while `L < R`** because when L equals R, the window is empty (R is already past the end).

---

### The Golden Rule

> **Pick one convention per problem. Write it down. Never mix them.**

This sounds obvious, but the actual mistake people make is this: they start a problem with `[L, R]`
semantics (both inclusive), then later copy a "window size" formula from a blog post that uses
`[L, R)` semantics. Now their window size is off by one. The code looks correct. The bug is
invisible until runtime.

Python's built-in idioms quietly push you toward `[L, R)`. Notice:

```python
range(0, n)      # [0, n) — excludes n
arr[L:R]         # [L, R) — excludes R
for i in range(n): # i goes 0, 1, ..., n-1
```

This manual uses **`[L, R]` (both inclusive)** as the primary convention for two-pointer
discussions, because it maps most naturally to the "pointer pointing at an element" mental model.
For sliding window discussions, we'll use `left` and `right` as both-inclusive pointers, which is
the most common style on LeetCode Python solutions.

---

### The Convention Derivation Table

Choose your convention once, and read off all the formulas. Everything is derived — nothing is
memorized.

| Property                       | `[L, R]` — Both Inclusive | `[L, R)` — Left Incl., Right Excl. |
| ------------------------------ | ------------------------- | ---------------------------------- |
| **Is the window empty?**       | `L > R`                   | `L >= R`                           |
| **Loop condition (non-empty)** | `while L <= R`            | `while L < R`                      |
| **Window size**                | `R - L + 1`               | `R - L`                            |
| **Move L right by 1**          | `L += 1`                  | `L += 1`                           |
| **Move R left by 1**           | `R -= 1`                  | `R -= 1`                           |
| **Single-element window**      | `L == R`                  | `R == L + 1`                       |

The `+1` that lives in the `[L, R]` window size formula is exactly the fencepost: one extra
"post" because both ends are included.

---

<a name="part-iii"></a>

## Part III: The 6 Index Formulas You Must Own

These are not arbitrary formulas to memorize. Each one is a direct logical consequence of the
fencepost insight and the `[L, R]` convention. Understand _why_ each formula is what it is.

---

### Formula 1: Last Valid Index

```
last_index = len(arr) - 1
```

**Why:** An array of `n` elements has indices `0, 1, 2, ..., n-1`. The count of indices is `n`,
but since we start at 0, the last one is `n - 1`. This is just the zero-based fencepost in its
most basic form. You will use `len(arr) - 1` to initialize a `right` pointer that starts at the
end of the array.

---

### Formula 2: Window Size (Both-Inclusive)

```
size = right - left + 1
```

**Why:** Think about the fence again. If your left post is at position `3` and your right post is
at position `7`, how many posts do you have? The naive answer is `7 - 3 = 4`. But count them:
3, 4, 5, 6, 7 — that's **5** posts. The correct answer is `7 - 3 + 1 = 5`.

Visualize it on an array:

```
Index:  0   1   2   3   4   5   6   7   8
               [L               R]
        left = 3, right = 7
        size  = 7 - 3 + 1 = 5
```

The `+1` is the fencepost correction for using a both-inclusive range.

---

### Formula 3: Middle Element (Without Overflow)

```
mid = left + (right - left) // 2
```

**Why `left + (right - left) // 2` and not just `(left + right) // 2`?**

In Python, integers can be arbitrarily large, so overflow is not a practical concern. But in C,
Java, or C++, `left + right` can overflow a 32-bit integer if both are large. The safer form
subtracts first to keep the value small, then divides, then adds `left` back.

For Python, both forms are equivalent. Use the safer one as a habit.

```
left = 3, right = 9
mid = 3 + (9 - 3) // 2 = 3 + 3 = 6  ✓

(3 + 9) // 2 = 6  ✓  (same result in Python, but riskier in other languages)
```

---

### Formula 4: Fixed-Window Left Pointer

```
left = right - k + 1
```

**Why:** In a fixed sliding window of size `k`, if the right pointer is at index `right`, the
window covers exactly `k` elements: from `right - k + 1` to `right` (inclusive). This is just
Formula 2 rearranged: `right - left + 1 = k`, therefore `left = right - k + 1`.

```
k = 3, right = 5
left = 5 - 3 + 1 = 3

Array:  [ a, b, c, d, e, f, g ]
Index:    0  1  2  3  4  5  6
                    [     window     ]
                     L=3  R=5
                   size = 5-3+1 = 3 ✓
```

This formula tells you _exactly_ when to shrink: after the window grows beyond `k`, you slide
`left` forward to restore the invariant.

---

### Formula 5: Number of Elements in a Range

```
count = right - left + 1    (both-inclusive, same as window size)
count = right - left        (left-inclusive, right-exclusive)
```

The formulas for window size and element count are the same — they are asking the same question.
The fencepost correction `+1` or its absence is the only difference between the two conventions.

---

### Formula 6: "After This Loop, Where Are My Pointers?"

This is not a single formula but a critical question to ask yourself after every pointer movement.

After a converging two-pointer loop exits (e.g., `while left < right`), the pointers are in one
of two states:

```
State A: They crossed (left > right)
  — Means the search space was exhausted.

State B: They met (left == right)
  — Means there is exactly one element remaining.
  — Whether to process it depends on your loop condition.
```

With `while left < right`: the loop exits when `left >= right`. If they met at the same index,
the loop stops _without_ processing that element in the loop body. If your problem needs to check
the meeting point, you must handle it after the loop.

With `while left <= right`: the loop processes the meeting point before exiting.

---

<a name="part-iv"></a>

## Part IV: The 3 Pointer Archetypes & Their Invariants

Every two-pointer or sliding window problem is a variant of one of three archetypes. Once you
identify which archetype applies, you know the initialization, the loop condition, the movement
logic, and the answer update timing automatically.

---

### Archetype 1: Convergent (Opposite Ends)

**The mental image:** Two climbers start at opposite ends of a ledge and walk toward each other.
They stop when they meet or cross.

**When to use:** Sorted array, finding a pair, partitioning in-place, checking palindromes.

**Canonical structure:**

```
left  = 0
right = len(arr) - 1

while left < right:       # loop stops when they meet or cross
    if condition(arr[left], arr[right]):
        left  += 1
        right -= 1
    elif move_left:
        left += 1
    else:
        right -= 1
```

**Invariant:** After every iteration, all elements _outside_ `[left, right]` have been processed.
The unchecked space is always exactly `[left, right]`.

**Initialization:** `left = 0`, `right = len(arr) - 1`. Both pointers start at the outermost
valid elements.

**Loop condition:** `while left < right`. We stop when they meet because a single element cannot
form a pair.

**Why `<` not `<=`?** If `left == right`, both pointers point to the _same_ element. For pair
problems, you cannot use the same element twice. So `left < right` is the correct guard.
Exception: if the problem explicitly allows `left == right` (same index), use `<=`.

---

**Worked Example — Two Sum II (LC 167)**

Array: `[2, 7, 11, 15]`, target = `9`

```
Step 0:  left=0, right=3  →  arr[0]+arr[3] = 2+15 = 17 > 9  →  right -= 1
Step 1:  left=0, right=2  →  arr[0]+arr[2] = 2+11 = 13 > 9  →  right -= 1
Step 2:  left=0, right=1  →  arr[0]+arr[1] = 2+7  =  9 = 9  →  found! return [0, 1]
```

The invariant held: at each step, the answer (if it exists) is always inside `[left, right]`.

---

### Archetype 2: Co-Directional (Fast/Slow or Read/Write)

**The mental image:** Two runners on the same track. One is faster. The slow one marks where to
write; the fast one scans ahead for useful elements.

**When to use:** Remove elements in-place, compress an array, move zeros, detect cycles.

**Canonical structure (Read/Write variant):**

```
write = 0                  # slow pointer: next write position

for read in range(len(arr)):      # fast pointer: scans every element
    if should_keep(arr[read]):
        arr[write] = arr[read]
        write += 1

# After loop: arr[0:write] is the cleaned array
```

**Invariant:** At every iteration of the loop, `arr[0:write]` contains only "kept" elements
processed so far.

**Key insight:** `write` tracks the boundary of the "done" region. It always points to the next
_empty slot_, not the last written slot. This is why the final answer length is `write` (not
`write - 1`) — it follows the half-open convention naturally.

---

**Worked Example — Remove Duplicates (LC 26)**

Array: `[1, 1, 2, 3, 3]` (sorted)

```
write=0, read=0: arr[0]=1 → keep → arr[0]=1, write=1
write=1, read=1: arr[1]=1 → duplicate (arr[0]=1) → skip
write=1, read=2: arr[2]=2 → keep → arr[1]=2, write=2
write=2, read=3: arr[3]=3 → keep → arr[2]=3, write=3
write=3, read=4: arr[4]=3 → duplicate (arr[2]=3) → skip

Result: arr[0:3] = [1, 2, 3], return write=3
```

Notice: `write` ended at `3`, and the array has 3 unique elements. No fencepost confusion because
`write` is a count (half-open boundary), not an index of the last element.

---

### Archetype 3: Sliding Window

**The mental image:** A camera panning along a film strip. The frame (window) always covers a
contiguous segment. The right edge of the frame is the "explore" pointer. The left edge is the
"shrink" pointer.

**Sub-type A: Fixed-Size Window**

```
# Initialize first window
window_sum = sum(arr[0:k])
result = window_sum

for right in range(k, len(arr)):
    window_sum += arr[right]           # expand right
    window_sum -= arr[right - k]       # shrink left (left = right - k + 1 - 1 = right - k)
    result = max(result, window_sum)
```

**Key insight:** With a fixed-size window, you do not need an explicit `left` variable if you
remember Formula 4: `left = right - k + 1`. The element leaving the window is always
`arr[right - k]`.

**Sub-type B: Variable-Size Window**

```
left = 0
state = initial_state()

for right in range(len(arr)):
    state = expand(state, arr[right])     # always expand right first

    while window_is_invalid(state):       # shrink until valid
        state = shrink(state, arr[left])
        left += 1

    result = update(result, right - left + 1)   # window is now valid
```

**The invariant of variable windows:** After the inner `while` loop, the window `[left, right]`
is always valid (satisfies the problem constraint). This is the invariant you must maintain.

---

**The 4 Questions to Answer Before Writing Sliding Window Code**

Before you type a single line, answer these:

1. **What is the window state?** (e.g., a running sum, a frequency map, a count of zeros)
2. **What makes the window invalid?** (e.g., sum > target, more than k distinct chars, count > k zeros)
3. **Do I want to maximize or minimize the window size?**
4. **Is the window size fixed or variable?**

Your answers to these 4 questions determine every line of code you write.

---

**Worked Example — Longest Substring Without Repeating Characters (LC 3)**

```
s = "abcabcbb"

Window state: a set (or frequency map) of chars in [left, right]
Invalid condition: any character appears more than once

left=0, freq={}
right=0: add 'a' → freq={'a':1} → valid → size=1
right=1: add 'b' → freq={'a':1,'b':1} → valid → size=2
right=2: add 'c' → freq={'a':1,'b':1,'c':1} → valid → size=3
right=3: add 'a' → freq={'a':2,'b':1,'c':1} → INVALID
  shrink: remove arr[0]='a' → freq={'a':1,'b':1,'c':1} → left=1 → valid
  size=3
right=4: add 'b' → freq={'a':1,'b':2,'c':1} → INVALID
  shrink: remove arr[1]='b' → freq={'a':1,'b':1,'c':1} → left=2 → valid
  size=3
...

Max size = 3 ("abc")
```

Notice: the answer was always recorded _after_ the inner while loop restored validity. The
window `[left, right]` was always valid when we read `right - left + 1`.

---

<a name="part-v"></a>

## Part V: Safety Standards — The Pre-Flight Checklist

A pilot goes through a physical checklist before takeoff even after 10,000 hours of flying. Not
because they have forgotten. Because the cost of missing one item is catastrophic. Apply the same
discipline to every two-pointer problem you write.

Run through this checklist mentally before you start coding, and again before you submit.

---

### Safety Check 1: Initialization — Are Both Pointers at Valid Positions?

Convergent pointer:

```
✓ left  = 0             (first valid index)
✓ right = len(arr) - 1  (last valid index)

✗ right = len(arr)   ← off by one, points PAST the array
```

Sliding window:

```
✓ left = 0
✓ right starts at 0 (then the loop drives it forward)

✗ left = 0, right = k - 1 (pre-initializing the window manually)
   — Only safe if you initialize the state correctly for the first window.
   — More error-prone than the "expand from empty" pattern above.
```

---

### Safety Check 2: Loop Condition — Does It Correctly Encode "Non-Empty"?

Ask: _"When the loop exits, what is the state of the search space?"_

```
while left < right:    ← exits when left == right (one element unprocessed by loop)
while left <= right:   ← exits when left > right  (all elements processed by loop)
while right < len(arr):← exits when right is out of bounds (full traversal complete)
```

The right choice depends on your problem. The wrong choice produces either an infinite loop
(condition never becomes false) or a missed element.

---

### Safety Check 3: Inner While Safety — Guard Against Crossing

When using a nested `while` to shrink a window, your inner loop _must_ be bounded. The most
common mistake is forgetting the bounds check:

```python
# DANGEROUS — inner while can run past the boundary
while freq[arr[left]] > 1:
    freq[arr[left]] -= 1
    left += 1

# SAFE — inner while is bounded by left <= right
while left <= right and freq[arr[left]] > 1:
    freq[arr[left]] -= 1
    left += 1
```

In many well-structured problems, the outer loop's progress (right only moves forward) guarantees
the inner while terminates. But adding the bound check is cheap insurance and makes your
invariant explicit.

---

### Safety Check 4: Answer Update Timing — Before or After Moving?

This is one of the most insidious sources of bugs. The question is: _at what point in the
iteration is the window in a state worth recording?_

**Pattern A — Record after expanding (maximize window):**

```
for right in range(len(arr)):
    expand(arr[right])

    while window_invalid():
        shrink(arr[left])
        left += 1

    result = max(result, right - left + 1)  # ← AFTER shrinking: window is now valid
```

**Pattern B — Record before shrinking (window was just valid):**

```
for right in range(len(arr)):
    expand(arr[right])

    if window_size > k:
        result = max(result, window_size_before_shrink)  # ← BEFORE: window was still valid
        shrink(arr[left])
        left += 1
```

Pattern A is safer and more common. Pattern B appears in fixed-window problems where you want
to record the exact moment the window reached size `k`.

**The diagnostic question:** Draw the state of the window at the line where you update the result.
Is the window valid at that exact moment? If not, you are recording garbage.

---

### Safety Check 5: Pointer Movement Order — The "Move After Use" Rule

Always use a pointer's value _before_ moving it.

```python
# WRONG — shrinks THEN uses the old left value
left += 1
window_sum -= arr[left]   ← arr[left] now points to WRONG element

# CORRECT — uses THEN moves
window_sum -= arr[left]
left += 1
```

This is analogous to a cashier handing over the item before swiping the card. Reverse the order
and the transaction fails.

---

### Safety Check 6: Empty Input Guard

Before running any two-pointer algorithm, check for edge cases that would make the algorithm
undefined:

```python
if not arr:       return 0  (or appropriate default)
if len(arr) == 1: return single_element_answer
if k > len(arr):  return impossible_answer
```

These checks are not optional. Many LeetCode problems include empty inputs in their test cases
precisely to punish code that skips this check.

---

<a name="part-vi"></a>

## Part VI: The Loop Invariant Framework

An **invariant** is a statement that is true _before the loop starts_, remains true _after every
iteration_, and is still true _when the loop exits_. When your loop invariant is true at exit, it
proves your answer is correct.

This is not abstract theory — it is the most practical debugging tool you can have. When your
code produces a wrong answer, the invariant tells you _exactly which line broke the guarantee_.

---

### How to State an Invariant

The invariant answers: **"At the start of each iteration, what do we know for certain?"**

For convergent two pointers:

> **Invariant:** All elements outside `[left, right]` have been checked and cannot be the answer.
> Therefore, if the answer exists, it is somewhere in `[left, right]`.

For sliding window (variable):

> **Invariant:** After the inner while loop, `[left, right]` is the longest/shortest valid window
> ending at position `right`.

For read/write pointers:

> **Invariant:** `arr[0:write]` contains exactly the elements we wanted to keep from `arr[0:read-1]`.

---

### Proving the Invariant Holds

A proof is just 3 sentences for each pointer movement:

1. **Base case:** Is the invariant true before the loop starts?
2. **Maintenance:** If the invariant is true at the start of an iteration, is it still true after
   this iteration completes?
3. **Termination:** When the loop exits, what does the invariant tell us about the answer?

**Example — Two Sum II:**

Base: `[left, right] = [0, n-1]`. Nothing has been checked, so "all unchecked elements are in
`[left, right]`" is trivially true.

Maintenance: If `arr[left] + arr[right] > target`, then for any right pointer `r' <= right`,
`arr[left] + arr[r'] <= arr[left] + arr[right] > target`. But we need sum = target, so
`arr[right]` is useless — we can exclude it. `right -= 1` is safe.

Termination: When `left == right`, only one element remains. A pair requires two different
indices. The problem guarantees a solution exists, so we will have found it before this point.

---

### The "Invariant-First" Coding Method

Instead of writing code and then debugging, write the invariant first:

```
Step 1: Write the invariant as a comment at the top of your loop.
Step 2: Write the initialization that makes the invariant true before the loop.
Step 3: Write the loop body to maintain the invariant.
Step 4: Write the answer extraction based on what the invariant guarantees at exit.
```

```python
# INVARIANT: arr[left..right] contains all candidates we haven't eliminated yet.
# The answer, if it exists, is in this range.
left, right = 0, len(arr) - 1

while left < right:
    s = arr[left] + arr[right]
    if s == target:
        return [left + 1, right + 1]   # 1-indexed per problem statement
    elif s < target:
        left += 1    # arr[left] is too small for any right pointer; eliminate it
    else:
        right -= 1   # arr[right] is too large for any left pointer; eliminate it

# Loop exits: left == right. One element. Problem guarantees solution existed before this.
```

---

<a name="part-vii"></a>

## Part VII: The Dry Run Protocol

Before you submit a solution, manually trace through at least 4 inputs. This is not optional.
The 30 seconds a dry run takes is nothing compared to the 10 minutes you lose debugging a
mysterious wrong answer.

---

### The Minimum Test Set

Every two-pointer/sliding window solution must be traced on:

| Test Case                          | Why It Matters                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| Empty array `[]`                   | Reveals missing empty-check; pointer arithmetic on empty array is undefined    |
| Single element `[x]`               | Reveals off-by-one in initialization; L and R start at the same position       |
| Two elements `[x, y]`              | First non-trivial case for convergent pointers; tests the `<` vs `<=` decision |
| Worst-case window (full array)     | Window should expand to cover the entire array without going out of bounds     |
| No valid answer exists             | Confirms your code handles the "not found" exit correctly                      |
| All identical elements `[x, x, x]` | Stress-tests shrink logic for duplicate-heavy inputs                           |

---

### The Tracing Table Method

When you dry run, do not just read the code. Create a table. This forces you to track every
variable's value at every step and instantly reveals the moment something goes wrong.

For a two-pointer problem on `[1, 3, 5, 8]`, target = `9`:

```
Iteration | left | right | arr[L] | arr[R] | sum | action
----------|------|-------|--------|--------|-----|-------
0         |  0   |   3   |   1    |   8    |  9  | found! return [0,3]
```

For a sliding window on `"abcba"`, k = 2 (fixed window, sum of values):

```
right | arr[R] | left | arr[L-leaving] | window_sum | result
------|--------|------|----------------|------------|-------
  0   |  'a'   |  —   |       —        |    (init)  |   —
  1   |  'b'   |  0   |      'a'       |   sum(ab)  |  ...
```

The table makes it **physically impossible** to skip a step or fudge an answer in your head.

---

### Edge Case Radar: Questions to Ask Before You Trace

Before tracing, interrogate your code with these questions:

1. Can `right` ever be computed at `len(arr)` or beyond?
2. Does my loop condition prevent `left` from going negative?
3. Is there a case where `left > right` at the point I compute `right - left + 1`?
4. Do I read from `arr[left]` or `arr[right]` _after_ moving the pointer?
5. If the answer is the full array, does my code handle that without going out of bounds?

If you cannot answer all 5 confidently, trace the problem cases manually.

---

<a name="part-viii"></a>

## Part VIII: The Error Gallery — Common Failures & Diagnoses

Each error below is presented as a scenario with a diagnosis and the exact fix.

---

### Error 1: The `+1` Phantom (Wrong Window Size)

**Symptom:** Off-by-one in the answer. Length is `right - left` when it should be
`right - left + 1`, or vice versa.

**The story:** A developer writes a sliding window to find the longest subarray of even numbers.
The window is `[2, 4, 6]` (indices 1 through 3). They record the length as `right - left = 3 - 1 = 2`.
They submit and get `Wrong Answer`. The correct answer was 3.

**Diagnosis:** Using the exclusive-right formula (`right - left`) with both-inclusive pointers.

**Fix:**

```python
# Both-inclusive [left, right]:
size = right - left + 1    # ← the +1 is always there for inclusive ends

# Half-open [left, right):
size = right - left        # ← no +1 because right is a sentinel, not an element
```

Before using a size formula, write one line that states your convention:

```python
# Convention: left and right are both INCLUSIVE indices
```

---

### Error 2: Off-by-One in Loop Condition

**Symptom:** One element is processed twice, or the last element is never processed.

**The story:** A developer writes `while left <= right` for a palindrome check but processes a
single-character string. `left == right == 0`, the loop runs once, compares `s[0]` with `s[0]`,
and incorrectly concludes it needs further checking. The algorithm never terminates cleanly.

**Diagnosis:** Loop condition includes the meeting point when the problem requires `left != right`.

**Fix table:**

```
Problem needs pairs of distinct elements?   →  while left < right
Problem needs to inspect every element?     →  while left <= right
Problem is scanning with a fast pointer?    →  while right < len(arr)
```

When in doubt, think about what happens at the _last_ iteration. Is the loop body safe to execute
with the condition value that causes exit?

---

### Error 3: The Phantom Shrink (Forgetting to Update State When Shrinking)

**Symptom:** Wrong answer on inputs with duplicates or complex window states.

**The story:** A developer tracks a character frequency map in a sliding window. When `left` is
moved forward, they increment `left` but forget to decrement `freq[arr[left-1]]`. The frequency
map now shows a character count of 2 even though only one copy is in the window. The invalid-
window check fires too early for the rest of the input.

**Fix:** Shrink means two things, always:

```python
# WRONG — only moves pointer
left += 1

# CORRECT — updates state AND moves pointer
freq[arr[left]] -= 1    # ← remove element from window state FIRST
if freq[arr[left]] == 0:
    del freq[arr[left]]
left += 1
```

The rule: **every time a pointer moves, update the state to reflect the new window.**

---

### Error 4: Answer Captured at the Wrong Moment (Invalid Window Recorded)

**Symptom:** Answer is almost right but includes a window that violates the constraint.

**The story:** A developer writes a variable-window problem but records the result _before_ the
shrink loop runs, then shrinks. The recorded window was already invalid, so the answer is wrong.

**Fix:** Always record the result _after_ the window has been restored to validity:

```python
for right in range(len(arr)):
    expand(arr[right])

    while window_invalid():
        shrink(arr[left])
        left += 1

    # ← Here: window [left, right] is VALID. Safe to record.
    result = max(result, right - left + 1)
```

Draw a box around the line where you update `result`. Ask: "Is the window guaranteed to be valid
at this exact line?" If yes, you are fine.

---

### Error 5: Crossing Pointers (Using Pointers After They've Crossed)

**Symptom:** `IndexError: list index out of range`, or computing a negative window size.

**The story:** A developer has the outer loop `while left <= right`, but inside, they have a
nested loop that advances `left` without checking `left <= right` inside the inner loop. `left`
overtakes `right`. Then `right - left + 1` becomes `0` or negative.

**Fix:**

```python
# DANGEROUS
while left <= right:
    while condition:
        left += 1    # left can now exceed right

# SAFE
while left <= right:
    while left <= right and condition:  # ← bounds check in inner while
        left += 1
```

**Visual diagnostic:**

```
Before shrink: left=3, right=5  →  valid window [3,5]
After shrink:  left=6, right=5  →  crossed! [6,5] is EMPTY (size = -1 + 1 = 0 or negative)
```

If your window size formula gives 0 or negative, your pointers have crossed. Add the inner bound
check or restructure the loop.

---

### Error 6: Wrong Initialization for the Fixed Window

**Symptom:** First window result is wrong or the loop skips the first window entirely.

**The story:** A developer manually computes the first window sum before the loop with
`window_sum = sum(arr[:k])`, then starts the loop at `right = k`. But when `k > len(arr)`, the
`sum(arr[:k])` silently clips to `sum(arr)` in Python, and the first iteration accesses
`arr[right - k]` which could be negative. The code "works" on most inputs but breaks on edge
cases.

**Safer fix — initialize inside the loop using a startup phase:**

```python
window_sum = 0
for right in range(len(arr)):
    window_sum += arr[right]

    if right >= k - 1:             # window has reached size k
        result = max(result, window_sum)
        window_sum -= arr[right - k + 1]   # ← remove the oldest element
```

This avoids any pre-loop initialization and lets the loop handle the ramp-up naturally.

---

<a name="part-ix"></a>

## Part IX: Curated Practice Problems

These problems are specifically chosen to challenge your command of index mathematics. They are
not ordered by LeetCode difficulty rating — they are ordered by the _type of index trap_ they
contain. Each tier targets a specific weakness.

---

### Tier 1: Foundation — Formula Drill

These problems are solved in a few lines, but their value is in _forcing you to write down your
convention and derive the formulas explicitly_. After solving each one, write out:
(a) your boundary convention, (b) which size formula you used, and (c) the loop exit state.

**1. Maximum Average Subarray I (LC 643)**
Find the subarray of length `k` with the maximum average.
_Index trap:_ Fixed window — you must shrink correctly using `right - k` not `right - k + 1`.
_Drill question:_ What is `left` when `right = k - 1` (the first full window)?

**2. Contains Duplicate II (LC 219)**
Determine if duplicate values exist within a window of size `k`.
_Index trap:_ The constraint is `abs(i - j) <= k` — this is an inclusive window of `k+1`
elements, not `k`. Many miss the `+1`.
_Drill question:_ When two indices `i` and `j` differ by exactly `k`, what is the window size?

**3. Running Sum of 1D Array (LC 1480)**
Return the running sum of an array.
_Index trap:_ The running sum at index `i` includes `arr[i]` itself — it is a window `[0, i]`.
What is the size of this window?

---

### Tier 2: Convergent Pointer Mastery

These problems require the `left < right` archetype. Each one hides a subtle boundary decision.

**4. Two Sum II — Input Array Is Sorted (LC 167)**
Return 1-indexed positions of the two numbers that sum to target.
_Index trap:_ The problem is 1-indexed. Your pointers are 0-indexed. Write the translation
carefully: `return [left + 1, right + 1]`. Do this wrong and you're off by one in the output.

**5. Valid Palindrome (LC 125)**
Check if a string is a palindrome (ignoring non-alphanumeric).
_Index trap:_ The inner skip loops (`while not s[left].isalnum()`) must be bounded by
`left < right` even inside the inner loop, or they run off the ends of the string.

**6. Container With Most Water (LC 11)**
Find two lines that form the container with the most water.
_Index trap:_ Area formula is `min(height[left], height[right]) * (right - left)`. The distance
is `right - left` (not `+1`) because it counts the _gap_ between posts, not the number of posts.
This is intentional — it's a spacing problem, not a counting problem.

**7. 3Sum (LC 15)**
Find all unique triplets that sum to zero.
_Index trap:_ Three pointers — fix one, then use convergent on the rest. The skip-duplicate logic
requires careful bounds checking: `while left < right and arr[left] == arr[left-1]: left += 1`.
This must only run when `left > i + 1` (where `i` is the fixed pointer), or it reads `arr[i]`
as a false duplicate.

---

### Tier 3: Sliding Window Invariant Challenges

These problems require you to maintain a non-trivial window invariant. For each, write the
invariant as a comment before you code.

**8. Minimum Size Subarray Sum (LC 209)**
Find the smallest contiguous subarray with sum >= target.
_Index trap:_ You minimize, not maximize, the window. The answer update happens _inside_ the
inner while loop, _before_ shrinking — because the window is valid at that moment:

```python
while window_sum >= target:
    result = min(result, right - left + 1)  # ← record BEFORE shrinking
    window_sum -= arr[left]
    left += 1
```

**9. Longest Repeating Character Replacement (LC 424)**
You can replace at most `k` characters in a string. Find the longest substring of one character.
_Index trap:_ The condition is `(right - left + 1) - max_freq > k`. When this fires, you
shrink — but you do NOT update `max_freq` when shrinking. Why? Because `max_freq` is a lower
bound, not an exact value. The invariant is weaker but still sufficient for correctness.
This is counterintuitive and is a frequent source of confusion.

**10. Permutation in String (LC 567)**
Determine if one string is a permutation of a contiguous substring of another.
_Index trap:_ Fixed window of size `len(s1)`. The match condition compares two frequency maps.
The "wrong" approach recalculates the entire frequency map each slide (O(26) per step, but more
importantly, error-prone). The correct approach does a _single-element update_ each slide: add
`s2[right]` to the window map, remove `s2[right - len(s1)]` from it.

**11. Fruit Into Baskets (LC 904)**
Find the longest subarray with at most 2 distinct values.
_Index trap:_ Generalizes to "at most k distinct elements." The shrink condition is
`len(freq_map) > 2`. But deleting from the map requires checking `freq_map[arr[left]] == 0`
before deleting the key, otherwise you delete a character that still exists in the window.

---

### Tier 4: Index Trap Boss Battles

These are hard problems where incorrect index handling causes subtle (not obvious) failures.

**12. Trapping Rain Water (LC 42)**
Compute the total water that can be trapped after raining.
_Index trap:_ Two different solution strategies exist. The two-pointer approach uses `left` and
`right` converging, but also `left_max` and `right_max`. The update order matters:
you must update `left_max = max(left_max, height[left])` _before_ computing trapped water at
`left`. Doing it after changes the semantics from "max so far" to "max including current."

**13. Minimum Window Substring (LC 76)**
Find the smallest window in `s` that contains all characters of `t`.
_Index trap:_ The window validity condition uses a "formed" counter (how many characters of `t`
have their required frequency met). Incrementing `formed` only when `freq_window[c] == freq_t[c]`
(not `>=`) ensures you don't double-count. Similarly, decrement `formed` only when
`freq_window[c] < freq_t[c]` when shrinking.

**14. Sliding Window Maximum (LC 239)**
Find the maximum in every window of size `k` using a deque.
_Index trap:_ The deque stores _indices_, not values. The boundary check when removing the front
is `deque[0] <= right - k` (using `<=` because you remove when the element is _outside_ the
window, which happens when its index is strictly less than `left = right - k + 1`, i.e., `<= right - k`).
One wrong comparison operator here breaks everything.

---

## Quick Reference Card

### The 6 Formulas

```
last_index          = len(arr) - 1
window_size [L,R]   = R - L + 1
window_size [L,R)   = R - L
fixed_window_left   = right - k + 1
middle              = left + (right - left) // 2
elements_from_L_to_R (inclusive) = R - L + 1
```

### The 3 Archetypes — Skeleton Code

```python
# ── Convergent ──────────────────────────────────────────────
left, right = 0, len(arr) - 1
while left < right:
    if condition: left += 1; right -= 1
    elif ...:     left += 1
    else:         right -= 1

# ── Co-Directional (Read/Write) ────────────────────────────
write = 0
for read in range(len(arr)):
    if should_keep(arr[read]):
        arr[write] = arr[read]
        write += 1
# result length = write (NOT write-1)

# ── Sliding Window (Variable) ───────────────────────────────
left = 0
for right in range(len(arr)):
    expand_state(arr[right])
    while window_invalid():
        shrink_state(arr[left])   # update state BEFORE moving pointer
        left += 1
    result = update(result, right - left + 1)  # window is valid here
```

### The Pre-Flight Checklist

```
□ Left pointer initialised to a valid index (not -1, not len)
□ Right pointer initialised to len(arr) - 1 or 0 depending on archetype
□ Loop condition matches boundary convention (< or <=)
□ Inner while loop bounded (left <= right inside inner while)
□ State update happens BEFORE pointer moves (use, then move)
□ Answer recorded AFTER window is restored to validity
□ Empty input handled before the algorithm runs
□ Dry-run performed on: empty, single element, two elements, full-array window
```

---

_End of Field Manual_

> The goal is not to memorize these rules. The goal is to internalize one truth:
> **every index formula is derived from your boundary convention.**
> Choose your convention. Write it down. Derive everything else.
> When a bug appears, check your convention first.
