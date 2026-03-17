---
name: compound
description: Document learnings, update CLAUDE.md with patterns discovered during development cycle
---

# /compound — Document Learnings and Extract Patterns

You are entering the **Compound** phase of the OpenIDEth development workflow.

This phase makes each unit of work compound into the next by documenting what was learned.

## Input

The user has just completed a work + review cycle. They may reference specific findings or patterns.

## Your Task

### 1. Analyze the Recent Cycle
- Review git diff or recent commits to understand what was built
- Identify what went well, what went wrong, and what was surprising
- Check if any new patterns emerged that should be documented

### 2. Update CLAUDE.md Lessons Learned

If something surprising or reusable was discovered, add an entry to the "Lessons Learned" section of `CLAUDE.md`:

Format: `- **[YYYY-MM-DD] Category:** Description. Context: what happened. Fix: what to do instead.`

Categories: `Architecture`, `Security`, `Performance`, `Data Integrity`, `TypeScript`, `NestJS`, `Next.js`, `Prisma`, `Solidity`

### 3. Update TASKS.md Progress
- Verify all completed tasks are marked `[x]` in TASKS.md
- Update the `[~]` (in progress) markers for any partially done work
- Ensure task statuses accurately reflect reality

### 4. Update Key Patterns in CLAUDE.md (if applicable)
If the implementation revealed a pattern that future work should follow, add it to the "Key Patterns" section.

## Rules
- Only document genuine learnings — not trivial observations
- Keep CLAUDE.md entries concise (1-2 lines each)
- Do not duplicate information already discoverable from the code
- Focus on things that would save time or prevent mistakes in future sessions
