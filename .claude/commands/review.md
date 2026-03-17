# /review — Multi-Perspective Code Review

You are entering the **Review** phase of the OpenIDEth development workflow.

## Input

The user wants a thorough review of recent changes. Review the current git diff or specified files.

## Your Task

Run a comprehensive review from **6 specialized perspectives**, checking against CLAUDE.md rules and OpenIDEth conventions.

### 1. Gather Context
- Run `git diff` to see all current changes (staged + unstaged)
- Read every modified/created file in full
- Read `CLAUDE.md` for project rules

### 2. Review from Each Perspective

#### Security Review
- All protected endpoints use `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth()`
- Role-based access enforced via `@Roles()` + `RolesGuard` where needed
- No secrets, wallet keys, or API keys in committed code
- No SQL injection (using Prisma parameterized queries)
- Input validation via class-validator DTOs on all endpoints
- Stripe webhooks verify signature before processing

#### Architecture Review
- NestJS modules follow module/service/controller/dto pattern
- No business logic in controllers — services handle logic
- Feature modules in `apps/api/src/modules/<feature>/`
- Shared code in `apps/api/src/common/` (guards, decorators, filters, interceptors)
- PrismaService injected (not imported directly from @openideth/database)
- Next.js pages use hooks for data fetching, not direct API calls

#### Data Integrity Review
- Prisma schema matches the spec in TASKS.md
- All relations properly defined with named labels where ambiguous
- Decimal fields use `@db.Decimal(12,2)` for money
- UUIDs for all primary keys
- Proper indexes on frequently queried fields

#### TypeScript Review
- No `any` unless wrapping untyped external APIs
- async/await only (no .then() chains)
- DTOs use class-validator decorators + Swagger ApiProperty
- Shared types use Zod schemas with inferred types
- Proper imports (no circular dependencies)

#### Performance Review
- Pagination on all list endpoints
- No N+1 queries (use Prisma includes where needed)
- Proper database indexes
- BullMQ for background jobs (not blocking request handlers)

#### Code Simplicity Review
- No over-engineering or premature abstractions
- No unnecessary error handling for impossible scenarios
- YAGNI — only code that serves the current task
- No duplicate code that could use existing patterns

### 3. Output Format

```markdown
## Review Results

### P1 — CRITICAL (must fix before deploy)
- [ ] [Security] Description (file:line)

### P2 — IMPORTANT (should fix)
- [ ] [Architecture] Description (file:line)

### P3 — MINOR (nice to fix)
- [ ] [Simplicity] Description (file:line)

### Passed Checks
- [x] All endpoints have proper auth guards
- [x] TypeScript strict mode compliance
```

## Rules
- Be specific — include file paths and line numbers
- P1 findings block deploy. P2 should be addressed. P3 are optional.
- Do not create findings for code that was not changed
- Reference the specific CLAUDE.md rule being violated when applicable
