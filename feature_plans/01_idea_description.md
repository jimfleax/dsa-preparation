# Feature Idea: Tracker & Roadmap Tracks

## 1. Overview
The current "Problems" feature (which acts as a repository of solved problems for the user) will be renamed to **"Tracker"**. This name accurately reflects its purpose: tracking the user's problem-solving progress and facilitating spaced-repetition revisits. 

A completely new **"Problems"** section will be introduced. This section will serve as a structured curriculum or "Roadmap Tracks", where users can follow predefined study paths (e.g., "Foundational Binary Search", "Advanced Dynamic Programming"). 

## 2. The "Tracker" (Formerly "Problems")
- **Name Change:** The UI navigation, component names, backend routes, and database models currently referring to "Problems" will be renamed to "Tracker" (e.g., `ProblemsTab` -> `TrackerTab`, `ProblemProgress` -> `TrackedProblem`).
- **Functionality:** Retains the exact same functionality: displaying tracked problems, showing stats (difficulty pie chart, total solved), providing search and sort capabilities, and enabling "Smart Revisits".

## 3. The New "Problems" Category (Roadmap Tracks)
- **Concept:** This new section will display multiple "Tracks". Each Track is a logical grouping of DSA problems focused on a specific topic or pattern.
- **Track UI:** 
  - Tracks will be displayed as cards or collapsible accordions.
  - By default, incomplete tracks are shown. 
  - Filters will allow users to view: "Completed", "Incomplete", or "All" tracks.
  - Tracks will be sorted based on the "last attempted" date of any problem within that track.
- **Problem Interactions inside a Track:**
  - Inside a track, problems are listed sequentially.
  - Users will see an **"Attempt"** button next to each problem.
  - Clicking "Attempt" will leverage the existing two-phase modal logic (similar to `SmartRevisitModal`). It will open the LeetCode problem URL in a new tab and transform the modal into a confirmation prompt: *"Are you done attempting?"* [Yes, Track it] / [Cancel].
- **Tracker Integration:**
  - When a user clicks *"Yes, Track it"* from a track, the problem is automatically added to their **Tracker** (creating a new record if it doesn't exist, or incrementing the attempt count/updating the date if it does).
  - The completion status of a problem inside a track is derived dynamically by checking if the user has that problem in their Tracker.

## 4. Overall Metrics & Dashboard
- At the top of the new "Problems" page, a metrics dashboard will be displayed using charts (e.g., Recharts).
- **Track Metrics:** A visual representation of how much of each specific track is completed.
- **Global Metrics:** An aggregated metric showing the total percentage of problems completed across *all* available tracks combined.

## 5. UI & UX Consistency
- The layout will mirror the clean, modern aesthetic of the existing application. 
- Styles (Tailwind classes, Lucide icons, glass-morphism modals) will be rigorously reused. 
- The modal used for attempting a track problem will directly reuse or adapt the `SmartRevisitModal` component to maintain UX consistency.