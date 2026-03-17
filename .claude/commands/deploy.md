# /deploy — Stage, Commit, and Push Changes

You are entering the **Deploy** phase of the OpenIDEth development workflow.

## Your Task

### 1. Verify Prerequisites
- Run `git status` to see all modified and untracked files
- Run `git diff --stat` to get a summary of changes
- Confirm there are no unresolved P1 findings from the review phase

If prerequisites are not met, stop and tell the user what is missing.

### 2. Determine What to Stage
- Review the changed files from `git status`
- Stage only files that are part of this cycle's work
- Do NOT stage: `.env` files, secrets, large binaries, or unrelated changes
- Use specific file paths, not `git add .` or `git add -A`

### 3. Generate a Commit Message
Based on the changes, generate a Conventional Commits message:

- `feat:` — new feature or endpoint
- `fix:` — bug fix
- `chore:` — tooling, config, docs updates
- `refactor:` — restructuring without behavior change
- `test:` — test additions or changes

Format: `<type>(<optional-scope>): <short imperative description>`

Examples:
- `feat(properties): add CRUD endpoints and DTOs`
- `feat(auth): implement JWT authentication with refresh tokens`
- `chore(infra): add Docker Compose and Nginx config`

Include the task IDs (T-XXX) completed in this cycle in the commit body.

Present the commit message to the user and ask for confirmation before committing.

### 4. Commit
```bash
git commit -m "<confirmed message>

Completed: T-XXX, T-XXX, T-XXX"
```

### 5. Push
```bash
git push origin main
```

### 6. Confirm
After pushing, run `git log --oneline -5` to confirm the commit is in place, and report the result to the user.

## Rules
- Never use `git add .` or `git add -A` — stage files explicitly
- Never deploy if P1 findings are unresolved
- Never force push (`--force`) to `main`
- Never commit `.env`, wallet keys, API keys, or any secrets
- Always use Conventional Commits format
- Never add Co-Authored-By or any Claude attribution to commits
- Push target is always `main` on `origin` (https://github.com/sefatuncer/openideth)
