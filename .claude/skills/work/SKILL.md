---
name: work
description: Execute the approved plan, implement tasks, mark them [x] in TASKS.md
---

# /work — Execute Implementation Plan

You are entering the **Work** phase of the OpenIDEth development workflow.

## Input

The user will reference an approved plan from the `/plan` phase, or specify task IDs from `TASKS.md`. If no input is given, check the current conversation for the most recently approved plan.

## Your Task

### 1. Load Context
- Read the approved plan or the referenced tasks from `TASKS.md`
- Read `CLAUDE.md` for architecture rules, key patterns, and conventions
- Read all files that will be modified or that the new code depends on

### 2. Execute Step by Step
For each task in the plan:
1. Read the target file(s) before making changes
2. Implement the change following all project conventions
3. After implementing, verify the code is consistent with existing patterns
4. Use the TaskCreate/TaskUpdate tools to track progress

### 3. Mark Completed Tasks
After each task is fully implemented, update `TASKS.md`:
- Change `- [ ] **T-XXX:**` to `- [x] **T-XXX:**` for completed tasks
- Do NOT mark a task complete if it's only partially implemented

## Rules
- Follow the plan exactly — do not add features or refactoring beyond what was planned
- If the plan has a gap or error, stop and ask the user rather than improvising
- Follow project conventions:
  - NestJS: module/service/controller pattern, DTOs with class-validator, Swagger decorators
  - Next.js: App Router, TanStack Query hooks, Zustand stores, Tailwind CSS
  - Shared: Zod schemas with inferred types, barrel exports
  - Prisma: all models use UUID, @@map for table names, named relations for ambiguous FK
- Use async/await, never .then()
- No file should exceed ~300 lines — split if needed
- Test that code is syntactically correct after each significant change
