# Original User Request

## Initial Request — 2026-06-17T19:34:27Z

# Teamwork Project Prompt

Analyze the `dsa-preparation` codebase to identify unnecessarily complex, intertwined components and performance bottlenecks. The goal is to provide actionable suggestions to simplify the code and optimize performance.

Working directory: /home/reetabratabhandari/Projects/dsa-preparation
Integrity mode: development

## Requirements

### R1. Complexity & Coupling Analysis

The agent team must analyze the codebase (frontend and backend) to identify tightly coupled components, circular dependencies, and overly complex logic that violates DRY and single-responsibility principles.

### R2. Performance Optimization

The agent team must identify performance bottlenecks, specifically looking for inefficient React rendering patterns, slow API endpoints, unoptimized database queries, and large frontend bundle sizes.

### R3. Actionable Refactoring Plan

The agent team must deliver a comprehensive artifact (`refactoring_plan.md`) that lists each issue along with a specific, surgical code fix. Vague suggestions are not permitted.

## Acceptance Criteria

### Audit Quality & Specificity (Agent-as-Judge)

- [ ] Every identified issue references specific file paths and line numbers.
- [ ] Every performance bottleneck includes a concrete, actionable fix (e.g., code snippet showing useMemo, caching, or query optimization).
- [ ] The refactoring plan covers both structural complexity (R1) and performance (R2).
