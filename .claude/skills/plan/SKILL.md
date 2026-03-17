---
name: plan
description: Pick next pending tasks from TASKS.md, research codebase, create implementation plan
---

# /plan — Create Implementation Plan from TASKS.md

You are entering the **Plan** phase of the OpenIDEth development workflow.

## Input

The user may specify a FAZ number, task range (e.g., "T-051 to T-054"), or describe what to implement. If no input is given, read `TASKS.md` and find the next group of `[ ]` (pending) tasks in order.

## Your Task

### 1. Research Phase
- Read `TASKS.md` to identify the target tasks and their full specifications
- Read `CLAUDE.md` for architecture rules, key patterns, and lessons learned
- Explore the relevant existing code in the codebase to understand current patterns
- Check which tasks are already `[x]` (completed) to understand what's available to build on

### 2. Plan Creation
Create a detailed implementation plan and present it to the user. The plan should include:

```markdown
## Target Tasks
- T-XXX: Description
- T-XXX: Description

## Dependencies
- What existing code/packages these tasks depend on
- What must be built/available first

## Implementation Steps
Ordered steps with specific file paths:
1. Step description -> `path/to/file.ts`
2. Step description -> `path/to/file.ts`

## Files to Create/Modify
| File | Action | Description |
|------|--------|-------------|
| path/to/file.ts | Create/Modify | What changes |

## Validation
How to verify the implementation works.
```

### 3. Present the Plan
Show the plan to the user for review. Do NOT start implementation until the plan is approved.

## Rules
- Follow the plan exactly as defined in TASKS.md — do not add features beyond what the task specifies
- Never propose changes to files you haven't read
- Prefer editing existing files over creating new ones
- Keep the plan specific — include exact file paths and function signatures
- Group related tasks together (e.g., a module's service + controller + dto = one plan)
- Maximum ~15 tasks per plan to keep scope manageable
- Reference existing code patterns from the codebase
