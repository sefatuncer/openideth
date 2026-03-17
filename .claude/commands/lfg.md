# /lfg — Full Cycle: Plan -> Work -> Review -> Compound -> Deploy

Run the complete OpenIDEth development cycle for the next batch of tasks.

## Input

Describe the tasks, FAZ number, or task range you want to implement. If no input is given, read `TASKS.md` and pick the next group of pending `[ ]` tasks in sequential order.

## Workflow

Execute all five phases sequentially:

### Phase 1: Plan
1. Read `TASKS.md` to find target tasks (next pending group, max ~15 tasks)
2. Read `CLAUDE.md` for architecture rules and lessons learned
3. Research the relevant existing codebase areas
4. Create a detailed implementation plan with file paths and steps
5. Present the plan and **wait for user approval** before proceeding

### Phase 2: Work
1. Execute the approved plan step by step
2. Follow all CLAUDE.md conventions (NestJS patterns, Prisma, Zod, Tailwind)
3. Track progress with TaskCreate/TaskUpdate
4. Mark completed tasks `[x]` in TASKS.md
5. Verify code is syntactically correct after each significant change

### Phase 3: Review
1. Run `git diff` to gather all changes
2. Review from 6 perspectives: Security, Architecture, Data Integrity, TypeScript, Performance, Code Simplicity
3. Output findings as P1/P2/P3
4. Fix all P1 findings immediately
5. Note P2 findings for follow-up

### Phase 4: Compound
1. Add a Lessons Learned entry to CLAUDE.md if something surprising was discovered
2. Update Key Patterns in CLAUDE.md if a new reusable pattern emerged
3. Verify TASKS.md task statuses are accurate

### Phase 5: Deploy
1. Run `git status` and confirm only cycle-related files are changed
2. Stage files explicitly (never `git add .`)
3. Generate a Conventional Commits message with completed task IDs
4. Confirm with user, then commit and push to `origin main`
5. Confirm with `git log --oneline -5`

## Rules
- Always get plan approval before starting work
- Fix all P1 review findings before deploying
- The compound phase is NOT optional — always document learnings
- Never deploy until compound is complete and all P1s are resolved
- Never force push; never commit secrets or `.env` files
- Follow Conventional Commits format (no Co-Authored-By or Claude attribution)
- Push to `origin main` (https://github.com/sefatuncer/openideth)
- Maximum ~15 tasks per cycle to keep scope manageable
