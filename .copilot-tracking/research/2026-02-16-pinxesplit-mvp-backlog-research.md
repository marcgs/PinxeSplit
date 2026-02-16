<!-- markdownlint-disable-file -->
# Task Research: PinxeSplit MVP Backlog

PinxeSplit is a Splitwise clone for friends and family, built as a Progressive Web App (PWA) with React + Node.js/Express + PostgreSQL, deployed on Azure. This document defines the MVP backlog: epics, user stories, data model, architecture, and key technical decisions.

## Task Implementation Requests

* Define the full MVP feature set with priorities (P0/P1/P2)
* Produce a structured backlog of epics and user stories with acceptance criteria
* Document the recommended tech stack and project architecture
* Design the database schema and key data model relationships
* Specify the debt simplification algorithm and rounding strategy

## Scope and Success Criteria

* Scope: MVP for personal use (~20 users). Covers groups, expenses, splits (equal/unequal), settle up, debt simplification, multi-currency, social login, and PWA shell. Excludes receipt scanning, analytics, payment integrations, and offline write support.
* Assumptions:
  * Single developer or small team
  * All expenses belong to a group (no free-standing 1:1 expenses)
  * All members must be registered users (no placeholder/invitation accounts)
  * Balances displayed per currency with no automatic conversion
  * Greedy debt simplification is sufficient (optimal bitmask DP deferred)
* Success Criteria:
  * Backlog contains ordered epics with clear dependencies
  * Each P0 feature has user stories with acceptance criteria
  * Data model supports all P0 features with no schema changes needed for P1
  * Architecture is implementable end-to-end with the chosen stack

## Outline

1. MVP Feature Prioritization
2. Backlog Epics (ordered by dependency)
3. User Stories for P0 Features
4. Data Model and Schema
5. Architecture and Tech Stack
6. Debt Simplification Algorithm
7. Key Technical Decisions

### Potential Next Research

* **Offline write support (PWA background sync)**: deferred to P2. Would require conflict resolution strategy.
  * Reasoning: full offline expense creation adds significant complexity
  * Reference: [tech-stack-architecture-research.md](.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md)
* **Optimal bitmask DP for debt simplification**: available as a secondary mode for power users.
  * Reasoning: greedy is near-optimal for groups ≤ 20; DP is exponential
  * Reference: [debt-simplification-research.md](.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md)
* **Azure AD / Microsoft account as third OAuth provider**: easy to add via Passport.js strategy.
  * Reasoning: may be desirable for Microsoft ecosystem users
  * Reference: subagent clarifying question

## Research Executed

### File Analysis

* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` — Splitwise feature catalog, MVP prioritization, user stories, data model sketch, 9 backlog epics
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` — Turborepo monorepo, Vite + React frontend, Express + Prisma backend, Azure deployment, 20 key technical decisions
* `.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md` — Greedy vs graph vs bitmask DP, Splitwise's approach, TypeScript implementation, rounding strategy

### Project Conventions

* Fresh repo — no existing code conventions beyond `.specify` and `.copilot-tracking` scaffolding
* Azure deployment target confirmed by user

## Key Discoveries

### User Decisions (from clarification)

| Decision | Choice |
|---|---|
| Platform | Progressive Web App (PWA) |
| Tech Stack | React + Node.js/Express + PostgreSQL |
| Auth | Social login (Google, Apple) |
| MVP Scope | Groups, splits, settle up, multi-currency, debt simplification |
| Deployment | Azure |
| Debt Simplification | Yes — minimize transactions |
| Audience | Personal use (~20 users) |
| Brand | PinxeSplit |

### Splitwise Modeling Insights

* **Splits are stored as absolute amounts** (`paid_share`/`owed_share`), not as split type metadata. The split type (equal, percentage, shares) is a UI-only concern.
* **Payments are expenses** with `is_payment = true`. No separate payment entity needed.
* **Balances are computed, not stored.** Aggregated from `expense_splits` at query time — sufficient for ~20 users.
* **Multi-currency balances** are arrays of `{currency, amount}` pairs with no forced conversion.

## MVP Feature Prioritization

### P0: Essential (must ship)

| # | Feature Area | Feature | Justification |
|---|---|---|---|
| 1 | Auth | Social login (Google, Apple) | Required. Removes password friction. |
| 2 | Auth | User profile (name, avatar, default currency) | Identity foundation. |
| 3 | Groups | Create / edit / delete group | Core organizational unit. |
| 4 | Groups | Add / remove members | Groups need members. |
| 5 | Expenses | Add / edit / delete expense | Primary value proposition. |
| 6 | Expenses | Date, description, notes, currency fields | Minimum useful metadata. |
| 7 | Splits | Equal split | ~80% of real-world usage. |
| 8 | Splits | Unequal by exact amount | Common for varied orders. |
| 9 | Splits | By percentage | For income-proportional sharing. |
| 10 | Splits | By shares | Simplest ratio expression. |
| 11 | Balances | Per-group and per-friend balance views | Must see who owes whom. |
| 12 | Settlements | Settle up (record payment) | Closes the loop on debts. |
| 13 | Simplification | Greedy debt minimization algorithm | Key differentiator over a spreadsheet. |
| 14 | Currency | Multi-currency expenses | Friend group spans countries. |
| 15 | Currency | Per-user default currency | Reduces friction per expense. |
| 16 | PWA | Installable PWA shell (manifest, service worker) | Mobile-first access without app stores. |
| 17 | PWA | Responsive mobile-first UI | Primary usage on phones. |

### P1: Nice-to-Have (fast follow)

| Feature | Justification |
|---|---|
| Expense categories | Organize and filter; not blocking core flow. |
| Activity feed / history | Transparency; important for trust. |
| Push notifications (web push) | Keeps users informed. |
| Email notifications | Secondary engagement channel. |
| Comments on expenses | Clarification; not core splitting. |
| Live exchange rate display | Useful context; not required for balances. |
| Group types / avatars | Polish and personalization. |
| Multiple payers per expense | Edge case; adds UI complexity. |
| Recurring expenses | Useful for rent/utilities. |

### P2: Defer

| Feature | Justification |
|---|---|
| Receipt photo upload / OCR | Storage + ML cost. |
| Itemized splits | Complex UX; by-amount covers it. |
| Charts / analytics | Power-user; overkill for MVP. |
| Expense search | ~20 users won't generate enough data. |
| Transaction import | Bank API integration too heavy. |
| Full offline mode with sync | Needs conflict resolution. |
| Payment gateway integration | "Record payment" suffices for small group. |
| Invite links / deep links | Manual addition works for ~20 users. |
| Optimal bitmask DP simplification | Greedy is sufficient; DP is a power-user mode. |

## Backlog Epics

Ordered by implementation dependency. Each epic builds on previous ones.

### Epic 1: Project Foundation and PWA Shell

**Goal:** Monorepo scaffold, CI/CD, PWA manifest, service worker, design system, responsive layout shell.

| Story | Description |
|---|---|
| F-01 | Initialize Turborepo monorepo with `apps/web`, `apps/api`, `packages/shared` |
| F-02 | Configure Vite + React + TypeScript with Tailwind CSS and shadcn/ui |
| F-03 | Set up PWA manifest (`manifest.json`) and `vite-plugin-pwa` with Workbox |
| F-04 | Create responsive app shell layout (nav, bottom tabs, page container) |
| F-05 | Configure Express + TypeScript + Prisma in `apps/api` |
| F-06 | Set up shared Zod schemas and TypeScript types in `packages/shared` |
| F-07 | Configure GitHub Actions CI pipeline (lint, type-check, build) |
| F-08 | Create Azure Bicep templates (App Service, PostgreSQL Flexible Server, Static Web Apps, Key Vault) |

**Depends on:** Nothing
**Enables:** All subsequent epics

---

### Epic 2: Authentication and User Management

**Goal:** Google and Apple OAuth login, JWT session management, user profile CRUD.

| Story | Description |
|---|---|
| A-01 | Implement Google OAuth 2.0 PKCE flow with Passport.js |
| A-02 | Implement Apple Sign-In flow with Passport.js |
| A-03 | Issue JWT access token (15 min) + refresh token (7 days) on login |
| A-04 | Create `authGuard` middleware for protected API routes |
| A-05 | Build login page UI with "Sign in with Google" and "Sign in with Apple" buttons |
| A-06 | Implement `GET /api/v1/users/me` and `PATCH /api/v1/users/me` |
| A-07 | Build user profile settings page (name, avatar, default currency) |
| A-08 | Implement token refresh flow (`POST /api/v1/auth/refresh`) |

**Depends on:** Epic 1
**Enables:** All feature epics (3–9)

---

### Epic 3: Currency Reference Data

**Goal:** Seed currency table, build currency picker, establish integer-cents arithmetic utilities.

| Story | Description |
|---|---|
| C-01 | Create and seed `currencies` table (~150 ISO 4217 codes with symbol and minor unit scale) |
| C-02 | Create and seed `categories` table (hierarchical: parent + child categories) |
| C-03 | Build currency picker dropdown component |
| C-04 | Implement money arithmetic utilities in `packages/shared` (integer cents, rounding, `splitEvenly`) |

**Depends on:** Epic 1
**Enables:** Epics 4–7

---

### Epic 4: Group Management

**Goal:** Full group CRUD, member management, group list and detail views.

| Story | Description |
|---|---|
| G-01 | Implement `POST /api/v1/groups` (create group; creator auto-added as member) |
| G-02 | Implement `GET /api/v1/groups` (list user's groups) |
| G-03 | Implement `GET /api/v1/groups/:id` (group detail with members) |
| G-04 | Implement `PATCH /api/v1/groups/:id` (edit group name) |
| G-05 | Implement `DELETE /api/v1/groups/:id` (soft-delete) |
| G-06 | Implement `POST /api/v1/groups/:id/members` (add member by email) |
| G-07 | Implement `DELETE /api/v1/groups/:id/members/:userId` (remove member; block if non-zero balance) |
| G-08 | Build group list page UI |
| G-09 | Build group detail page UI (members list, expense list placeholder) |
| G-10 | Build create/edit group form UI |

**Depends on:** Epics 2, 3
**Enables:** Epics 5–7

---

### Epic 5: Expense CRUD and Split Engine

**Goal:** Add/edit/delete expenses with all four split types. Split calculator UI. Backend validation.

| Story | Description |
|---|---|
| E-01 | Implement `POST /api/v1/groups/:id/expenses` (create expense with splits) |
| E-02 | Implement `GET /api/v1/groups/:id/expenses` (list group expenses, paginated) |
| E-03 | Implement `GET /api/v1/expenses/:id` (expense detail with splits) |
| E-04 | Implement `PATCH /api/v1/expenses/:id` (update expense and recalculate splits) |
| E-05 | Implement `DELETE /api/v1/expenses/:id` (soft-delete) |
| E-06 | Backend validation: `SUM(paid_share) = cost`, `SUM(owed_share) = cost` |
| E-07 | Build add expense form UI with split type selector (equal, amount, percentage, shares) |
| E-08 | Build split calculator component: equal split (auto-divide with remainder distribution) |
| E-09 | Build split calculator component: by exact amounts (per-person input, sum validation) |
| E-10 | Build split calculator component: by percentage (per-person %, sum-to-100 validation) |
| E-11 | Build split calculator component: by shares (per-person ratio, auto-calculate amounts) |
| E-12 | Build expense list view within group detail page |
| E-13 | Build expense detail view UI |
| E-14 | Build edit expense form UI |

**Depends on:** Epics 2, 3, 4
**Enables:** Epics 6, 7

---

### Epic 6: Balance Computation and Display

**Goal:** Aggregate balances from expense splits. Dashboard showing per-friend and per-group balances, multi-currency.

| Story | Description |
|---|---|
| B-01 | Implement balance aggregation query (net balance per user per currency within a group) |
| B-02 | Implement `GET /api/v1/groups/:id/balances` (group balance summary) |
| B-03 | Implement `GET /api/v1/balances` (user's overall friend balances across all groups) |
| B-04 | Build group balance summary UI (who owes whom, per currency) |
| B-05 | Build dashboard page (overall balances with each friend, per currency) |

**Depends on:** Epic 5
**Enables:** Epics 7, 8

---

### Epic 7: Settle Up and Debt Simplification

**Goal:** Record payment flow, greedy debt simplification algorithm, simplified vs original balance views.

| Story | Description |
|---|---|
| S-01 | Implement debt simplification service (greedy net-balance algorithm, per currency) |
| S-02 | Implement `POST /api/v1/groups/:id/settle` (create payment expense) |
| S-03 | Extend `GET /api/v1/groups/:id/balances` to return both original and simplified debts |
| S-04 | Build settle up form UI (select recipient, enter amount, confirm) |
| S-05 | Build simplified debts view within group balance page |
| S-06 | Implement integer-cents rounding with largest-remainder method in split engine |

**Depends on:** Epics 5, 6
**Enables:** Epic 8

---

### Epic 8: Activity Feed and Audit Trail

**Goal:** Chronological feed of expense/group/settlement events. Audit metadata.

| Story | Description |
|---|---|
| AF-01 | Implement activity log query (ordered expense + payment events per group) |
| AF-02 | Implement `GET /api/v1/groups/:id/activity` endpoint |
| AF-03 | Build activity feed UI within group detail page |
| AF-04 | Display `created_by` / `updated_by` metadata on expense cards |

**Depends on:** Epics 5, 6, 7
**Enables:** Epic 9

---

### Epic 9: Polish, Testing, and Launch

**Goal:** E2E tests, accessibility audit, performance optimization, PWA validation, deploy to Azure.

| Story | Description |
|---|---|
| P-01 | Write API integration tests for all endpoints (Jest + Supertest) |
| P-02 | Write frontend component tests (Vitest + Testing Library) |
| P-03 | Write E2E tests for critical flows: login → create group → add expense → settle up (Playwright) |
| P-04 | Accessibility audit (axe-core, keyboard navigation, screen reader) |
| P-05 | Performance optimization: code splitting, lazy routes, image optimization |
| P-06 | Lighthouse PWA audit: target scores ≥90 on all categories |
| P-07 | Configure GitHub Actions deploy pipeline to Azure |
| P-08 | Deploy to Azure (Static Web Apps + App Service + PostgreSQL Flexible Server) |
| P-09 | Final smoke test on production |

**Depends on:** Epics 1–8
**Enables:** Launch

## Data Model

### Entity Relationships

```text
User ──< GroupMember >── Group
 │                         │
 │                         │
 ├──< Expense >────────────┘
 │       │
 │       └──< ExpenseSplit
 │
 └──< RefreshToken

Currency (reference)
Category (reference, hierarchical)
```

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Payments modeled as | Expense with `is_payment = true` | Simplifies schema; one entity for all financial events |
| Balances | Computed at query time via aggregation | No materialized balance table needed for ~20 users |
| Money storage | `DECIMAL(12,2)` in DB; integer cents in app logic | Avoids floating-point errors |
| Soft deletes | `deleted_at` timestamp | Preserves audit trail; enables restore |
| Split storage | `paid_share` + `owed_share` per user per expense | Split type is a UI concern; backend stores absolute amounts |

### Prisma Schema

Full schema defined in [tech-stack-architecture-research.md](.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md), Section 4.1. Seven models: `User`, `Group`, `GroupMember`, `Expense`, `ExpenseSplit`, `Currency`, `Category`, plus `RefreshToken`.

### Balance Computation Query

```sql
SELECT
  es.user_id,
  e.currency_code,
  SUM(es.paid_share - es.owed_share) AS net_balance
FROM expense_splits es
JOIN expenses e ON e.id = es.expense_id
WHERE e.group_id = $1
  AND e.deleted_at IS NULL
GROUP BY es.user_id, e.currency_code;
```

## Architecture

### Project Structure

Turborepo monorepo:

```text
PinxeSplit/
├── apps/
│   ├── web/          # React + Vite PWA
│   └── api/          # Node.js + Express + Prisma
├── packages/
│   └── shared/       # TypeScript types, Zod schemas, money utilities
├── infra/
│   └── bicep/        # Azure IaC
├── turbo.json
└── package.json
```

### Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Vite 6 + React + TypeScript | Fastest SPA build tool; CRA deprecated |
| State | TanStack Query + Zustand | Server-state caching + minimal UI state |
| UI | Tailwind CSS 4 + shadcn/ui | Zero-runtime styling + accessible components |
| PWA | vite-plugin-pwa (Workbox) | Zero-config service worker from Vite config |
| Routing | React Router v7 | Type-safe routes with lazy loading |
| Backend | Express + TypeScript | Mature, minimal REST framework |
| ORM | Prisma 6 | Type-safe queries, declarative migrations |
| Auth | Passport.js + JWT | Battle-tested OAuth; stateless sessions |
| Validation | Zod | Shared schemas between frontend and backend |
| Database | PostgreSQL (Azure Flexible Server) | ACID for financial data; DECIMAL for money |
| Frontend hosting | Azure Static Web Apps (free) | CDN, HTTPS, GitHub Actions integration |
| Backend hosting | Azure App Service B1 | Managed Node.js with deployment slots |
| Secrets | Azure Key Vault | Credentials out of source control |
| CI/CD | GitHub Actions + Turborepo | Lint → type-check → test → build → deploy |

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/google` | Google OAuth |
| `POST` | `/api/v1/auth/apple` | Apple Sign-In |
| `POST` | `/api/v1/auth/refresh` | Token refresh |
| `GET` | `/api/v1/users/me` | Current user |
| `PATCH` | `/api/v1/users/me` | Update profile |
| `GET` | `/api/v1/groups` | List groups |
| `POST` | `/api/v1/groups` | Create group |
| `GET` | `/api/v1/groups/:id` | Group detail |
| `PATCH` | `/api/v1/groups/:id` | Update group |
| `DELETE` | `/api/v1/groups/:id` | Delete group |
| `POST` | `/api/v1/groups/:id/members` | Add member |
| `DELETE` | `/api/v1/groups/:id/members/:userId` | Remove member |
| `GET` | `/api/v1/groups/:id/expenses` | List expenses |
| `POST` | `/api/v1/groups/:id/expenses` | Create expense |
| `GET` | `/api/v1/expenses/:id` | Expense detail |
| `PATCH` | `/api/v1/expenses/:id` | Update expense |
| `DELETE` | `/api/v1/expenses/:id` | Delete expense |
| `GET` | `/api/v1/groups/:id/balances` | Group balances |
| `GET` | `/api/v1/balances` | Overall balances |
| `POST` | `/api/v1/groups/:id/settle` | Settle up |
| `GET` | `/api/v1/groups/:id/activity` | Activity feed |

## Debt Simplification Algorithm

### Selected Approach: Greedy Net-Balance

1. Compute net balance per user per currency within a group
2. Separate into creditors (positive) and debtors (negative)
3. Sort both descending by absolute amount
4. Iteratively match largest creditor with largest debtor, transferring `min(credit, debt)`
5. Run independently per currency

**Complexity:** O(N log N) time, O(N) space
**Guarantee:** At most N-1 transactions (near-optimal for small groups)

### Rounding: Largest Remainder Method

* All arithmetic in integer cents (smallest currency unit)
* Floor-divide total by N
* Distribute remainder cents to expense creator first, then other participants
* Sum of shares always equals original total (invariant)
* Currency `minor_unit_scale` handles JPY (1), USD (100), BHD (1000)

### Implementation

TypeScript implementation provided in [debt-simplification-research.md](.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md): `computeNetBalances()`, `simplifyDebts()`, `simplifyMultiCurrency()`, `splitEvenly()`.

## Technical Scenarios

### Scenario: Expense Split Calculation

**Requirements:**

* Support 4 split types through a single backend model
* Validate that shares sum to total cost
* Handle rounding for equal splits

**Preferred Approach:** Store `paid_share` and `owed_share` per user per expense. The split type is a frontend-only concern that determines how `owed_share` values are calculated before submission.

```text
apps/web/src/features/expenses/ (split calculator component)
apps/api/src/services/expense.service.ts (validation: sum check)
packages/shared/src/utils/money.ts (splitEvenly, rounding)
packages/shared/src/schemas/expense.ts (Zod validation)
```

**Implementation Details:**

* Frontend split calculator computes `owed_share` array based on selected type
* Backend validates `SUM(paid_share) = cost` and `SUM(owed_share) = cost`
* Rounding handled in `packages/shared` for consistency between frontend preview and backend validation

#### Considered Alternatives

* Storing split type and parameters (percentage values, share counts) in the database — rejected because it adds complexity without benefit; the absolute amounts are all that matter for balance calculation.

### Scenario: Debt Simplification Within a Group

**Requirements:**

* Minimize transaction count
* Run per currency independently
* Preserve net balances

**Preferred Approach:** Greedy net-balance algorithm. See algorithm section above.

```text
apps/api/src/lib/debt-simplification.ts (algorithm)
apps/api/src/services/balance.service.ts (orchestration)
packages/shared/src/utils/money.ts (integer cents helpers)
```

#### Considered Alternatives

* **Bitmask DP (optimal):** provably minimum transactions but O(3^K) — deferred as P2 power-user mode
* **Graph cycle elimination:** more complex, no optimality guarantee, no advantage over greedy for small N
* **Splitwise's constrained greedy:** adds "no new relationships" rule — unnecessary when all users share a group

## Key Technical Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Monorepo | Turborepo | Shared types; single CI pipeline |
| 2 | Build tool | Vite 6 | Fastest for React SPAs |
| 3 | State | TanStack Query + Zustand | Server-state caching + lightweight UI state |
| 4 | UI | Tailwind CSS 4 + shadcn/ui | Zero-runtime + accessible primitives |
| 5 | PWA | vite-plugin-pwa | Integrated Workbox service worker |
| 6 | Backend | Express | Mature, minimal, sufficient for REST |
| 7 | ORM | Prisma 6 | Type-safe, schema-first migrations |
| 8 | Auth | Passport.js + JWT | Stateless; battle-tested OAuth strategies |
| 9 | Validation | Zod | Shared schemas, TypeScript-native |
| 10 | Database | PostgreSQL on Azure | ACID + DECIMAL for money |
| 11 | Money | Integer cents internally | No floating-point errors |
| 12 | Splits | `paid_share`/`owed_share` model | Split type is UI-only; backend stores absolutes |
| 13 | Payments | Expense with `is_payment` flag | One entity for all financial events |
| 14 | Balances | Computed via aggregation | No materialized table for ~20 users |
| 15 | Simplification | Greedy net-balance | O(N log N); near-optimal for N ≤ 20 |
| 16 | Rounding | Largest remainder to creator | Matches Splitwise; sum invariant preserved |
| 17 | Soft deletes | `deleted_at` column | Audit trail + restore capability |
| 18 | Hosting | Azure Static Web Apps + App Service | Free frontend; managed backend |
| 19 | CI/CD | GitHub Actions | Native Azure + GitHub integration |
| 20 | Secrets | Azure Key Vault | Out of source control; auditable |
