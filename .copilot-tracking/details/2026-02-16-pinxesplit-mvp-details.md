<!-- markdownlint-disable-file -->
# Implementation Details: PinxeSplit MVP

## Context Reference

Sources:
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` — MVP backlog, epics, user stories, architecture, data model
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` — Monorepo structure, Prisma schema, API design, Azure deployment
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` — Splitwise features, user stories with acceptance criteria
* `.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md` — Algorithm pseudocode, TypeScript implementation, rounding strategy

## Implementation Phase 1: Project Foundation

<!-- parallelizable: false -->

### Step 1.1: Initialize Turborepo monorepo

Initialize the Turborepo monorepo with three workspaces: `apps/web` (React PWA), `apps/api` (Express backend), and `packages/shared` (shared types, schemas, utilities).

Files:
* `package.json` — Root workspace config with `workspaces: ["apps/*", "packages/*"]`
* `turbo.json` — Turborepo pipeline: `build`, `dev`, `lint`, `typecheck`, `test`
* `tsconfig.base.json` — Shared TypeScript compiler options (strict mode, ESM, paths)
* `.gitignore` — Node modules, dist, env files, Prisma generated
* `.env.example` — Template for all environment variables
* `apps/web/package.json` — Frontend dependencies
* `apps/api/package.json` — Backend dependencies
* `packages/shared/package.json` — Shared package config

Success criteria:
* `npm install` completes from root
* `npx turbo build` runs pipeline for all workspaces (even if empty builds)
* Workspace references resolve correctly (`@pinxesplit/shared` importable from both apps)

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 1) — full directory tree

Dependencies:
* Node.js 22.x, npm

### Step 1.2: Configure Vite + React + TypeScript + Tailwind CSS + shadcn/ui

Set up the frontend application with Vite, React 19, TypeScript strict mode, Tailwind CSS 4, and shadcn/ui component library.

Files:
* `apps/web/vite.config.ts` — Vite config with React plugin, path aliases, proxy to API
* `apps/web/tsconfig.json` — Extends `tsconfig.base.json`, includes path aliases for `@/`
* `apps/web/tailwind.config.ts` — Tailwind configuration with custom theme tokens
* `apps/web/postcss.config.js` — PostCSS with Tailwind plugin
* `apps/web/src/main.tsx` — React entry point
* `apps/web/src/App.tsx` — Root component with router and query client providers
* `apps/web/src/styles/globals.css` — Tailwind directives and CSS custom properties
* `apps/web/index.html` — HTML template with meta tags, theme color
* `apps/web/components.json` — shadcn/ui configuration file

Success criteria:
* `npm run dev --workspace=apps/web` starts dev server with HMR
* Tailwind utilities compile correctly
* shadcn/ui components can be added via CLI (`npx shadcn@latest add button`)

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 2) — frontend architecture decisions

Dependencies:
* Step 1.1 completion (monorepo initialized)

### Step 1.3: Configure PWA manifest and vite-plugin-pwa

Set up the Progressive Web App configuration with manifest, icons, and Workbox service worker via vite-plugin-pwa.

Files:
* `apps/web/vite.config.ts` — Add `VitePWA` plugin configuration
* `apps/web/public/manifest.json` — PWA manifest: name "PinxeSplit", `display: standalone`, theme color `#6366f1`, icons
* `apps/web/public/icons/icon-192.png` — 192x192 app icon (placeholder)
* `apps/web/public/icons/icon-512.png` — 512x512 app icon (placeholder)
* `apps/web/public/favicon.ico` — Favicon

Success criteria:
* Service worker registers on page load (dev: disabled; prod: active)
* Browser dev tools Application tab shows valid manifest
* "Add to Home Screen" criteria met in Lighthouse PWA audit

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 2.5) — PWA setup with vite-plugin-pwa config example

Dependencies:
* Step 1.2 completion

### Step 1.4: Create responsive app shell layout

Build the mobile-first app shell with navigation bar, bottom tab bar, and page content container.

Files:
* `apps/web/src/components/layout/AppShell.tsx` — Main layout wrapper with header and bottom tabs
* `apps/web/src/components/layout/Header.tsx` — Top bar with app name, user avatar, settings link
* `apps/web/src/components/layout/BottomTabs.tsx` — Bottom navigation: Dashboard, Groups, Settings
* `apps/web/src/components/layout/PageContainer.tsx` — Scrollable content area with consistent padding
* `apps/web/src/routes/index.tsx` — React Router v7 route definitions with lazy-loaded pages

Success criteria:
* Layout renders correctly on mobile (375px), tablet (768px), and desktop (1280px)
* Bottom tabs highlight the active route
* Page transitions work via React Router

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 2.3) — route structure

Dependencies:
* Step 1.2 completion

### Step 1.5: Configure Express + TypeScript + Prisma

Set up the backend application with Express, TypeScript, Prisma ORM, and layered architecture (routes → controllers → services).

Files:
* `apps/api/src/server.ts` — HTTP server entry point, port config
* `apps/api/src/app.ts` — Express app factory: CORS, JSON body parser, error handler, route mounting
* `apps/api/src/config/env.ts` — Environment variable parsing with Zod
* `apps/api/src/middleware/errorHandler.ts` — Global error handling middleware
* `apps/api/src/middleware/validate.ts` — Zod schema validation middleware for request body/params/query
* `apps/api/prisma/schema.prisma` — Placeholder schema (full schema in Phase 2)
* `apps/api/tsconfig.json` — Extends `tsconfig.base.json`, NodeNext module resolution
* `apps/api/.env.example` — Backend-specific env vars template

Success criteria:
* `npm run dev --workspace=apps/api` starts Express server on port 3001
* `GET /health` returns 200 with `{ status: "ok" }`
* Prisma client generates without errors

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 3) — backend architecture

Dependencies:
* Step 1.1 completion

### Step 1.6: Set up shared Zod schemas and TypeScript types

Create the shared package with TypeScript types, Zod validation schemas, and money arithmetic utilities.

Files:
* `packages/shared/src/index.ts` — Barrel export
* `packages/shared/src/types/user.ts` — User, UserProfile DTOs
* `packages/shared/src/types/group.ts` — Group, GroupMember, GroupWithMembers DTOs
* `packages/shared/src/types/expense.ts` — Expense, ExpenseSplit, CreateExpenseRequest DTOs
* `packages/shared/src/types/balance.ts` — Balance, SimplifiedDebt, Transfer DTOs
* `packages/shared/src/types/currency.ts` — Currency DTO
* `packages/shared/src/types/auth.ts` — AuthResponse, TokenPayload DTOs
* `packages/shared/src/schemas/expense.ts` — `createExpenseSchema`, `updateExpenseSchema` (Zod)
* `packages/shared/src/schemas/group.ts` — `createGroupSchema`, `updateGroupSchema`, `addMemberSchema` (Zod)
* `packages/shared/src/schemas/user.ts` — `updateUserSchema` (Zod)
* `packages/shared/src/schemas/settle.ts` — `settleUpSchema` (Zod)
* `packages/shared/src/constants/currencies.ts` — Currency code constants, minor unit scale map
* `packages/shared/tsconfig.json` — Extends `tsconfig.base.json`, declaration output

Success criteria:
* `@pinxesplit/shared` importable from `apps/web` and `apps/api`
* Zod schemas infer TypeScript types correctly
* Package builds with declarations via `tsc`

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 3.5) — Zod schema examples
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` (API Endpoints section) — endpoint shapes

Dependencies:
* Step 1.1 completion

### Step 1.7: Configure GitHub Actions CI pipeline

Set up CI to run lint, type-check, and build on every push and pull request.

Files:
* `.github/workflows/ci.yml` — CI pipeline: checkout, setup Node 22, `npm ci`, `npx turbo lint typecheck build test`
* `.eslintrc.cjs` or `eslint.config.js` — ESLint config (flat config) for TypeScript, React
* `apps/web/.eslintrc.cjs` — Frontend-specific lint rules
* `apps/api/.eslintrc.cjs` — Backend-specific lint rules

Success criteria:
* CI workflow triggers on push to `main` and on pull requests
* Pipeline completes without errors on a clean build
* Lint, type-check, build, and test steps run via Turborepo pipeline

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 5.2) — CI/CD approach

Dependencies:
* Steps 1.1–1.6 completion

### Step 1.8: Validate Phase 1

Run full build, lint, and type-check from monorepo root. Verify PWA shell renders in browser.

Validation commands:
* `npm run build` — Turborepo build pipeline
* `npm run lint` — ESLint across all workspaces
* `npm run typecheck` — TypeScript strict across all workspaces

## Implementation Phase 2: Authentication and User Management

<!-- parallelizable: false -->

### Step 2.1: Create Prisma schema with all models

Define the complete database schema in Prisma with all seven models plus RefreshToken.

Files:
* `apps/api/prisma/schema.prisma` — Full schema: User, Group, GroupMember, Expense, ExpenseSplit, Currency, Category, RefreshToken with all indexes, unique constraints, and relations
* `apps/api/prisma/seed.ts` — Seed script placeholder (populated in Phase 3)

Success criteria:
* `npx prisma migrate dev --name init` creates migration without errors
* `npx prisma generate` produces typed client
* All unique constraints and indexes match the data model spec

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 4.1) — full Prisma schema
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` (Data Model section) — entity relationships

Dependencies:
* Step 1.5 completion (Prisma configured)

### Step 2.2: Implement Google OAuth 2.0 PKCE flow

Implement Google social login using Passport.js with the Authorization Code + PKCE flow.

Files:
* `apps/api/src/config/passport.ts` — Passport strategy configuration (Google, Apple)
* `apps/api/src/routes/auth.routes.ts` — `POST /api/v1/auth/google` (exchange auth code for tokens)
* `apps/api/src/controllers/auth.controller.ts` — Handle OAuth callback, find-or-create user, issue JWT
* `apps/api/src/services/auth.service.ts` — User lookup/creation from OAuth profile, token generation

Success criteria:
* `POST /api/v1/auth/google` with valid authorization code returns JWT access token + refresh token
* First login creates new User record with `auth_provider: "google"`
* Subsequent logins return tokens for existing user
* Invalid/expired codes return 401

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 3.3) — auth architecture
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.1) — US-AUTH-01

Dependencies:
* Step 2.1 completion (User model exists)

### Step 2.3: Implement Apple Sign-In flow

Add Apple Sign-In as the second OAuth provider using Passport.js.

Files:
* `apps/api/src/config/passport.ts` — Add Apple strategy alongside Google
* `apps/api/src/routes/auth.routes.ts` — `POST /api/v1/auth/apple`
* `apps/api/src/controllers/auth.controller.ts` — Handle Apple-specific identity token validation

Success criteria:
* `POST /api/v1/auth/apple` with valid identity token returns JWT access token + refresh token
* Apple user created with `auth_provider: "apple"`
* Email-based deduplication prevents duplicate accounts across providers (same email = same user)

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.1) — US-AUTH-01

Dependencies:
* Step 2.2 completion (auth infrastructure in place)

### Step 2.4: Implement JWT access/refresh token issuance and authGuard middleware

Create stateless JWT authentication with short-lived access tokens and long-lived refresh tokens.

Files:
* `apps/api/src/services/token.service.ts` — `generateAccessToken()` (15 min), `generateRefreshToken()` (7 days), `verifyAccessToken()`, `revokeRefreshToken()`
* `apps/api/src/middleware/authGuard.ts` — Extract Bearer token, verify JWT, attach `req.user`
* `apps/api/src/routes/auth.routes.ts` — `POST /api/v1/auth/refresh` (exchange refresh token for new access token)

Success criteria:
* Access token expires after 15 minutes; refresh token after 7 days
* `authGuard` rejects requests without valid Bearer token (401)
* `authGuard` attaches decoded user payload to `req.user`
* Refresh endpoint issues new access token without re-authentication
* Refresh tokens are stored in DB and revocable

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 3.3) — JWT middleware example

Dependencies:
* Step 2.1 completion (RefreshToken model)

### Step 2.5: Implement user profile endpoints

Build endpoints for reading and updating the authenticated user's profile.

Files:
* `apps/api/src/routes/users.routes.ts` — `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
* `apps/api/src/controllers/users.controller.ts` — Parse request, call service, format response
* `apps/api/src/services/users.service.ts` — `getProfile()`, `updateProfile()` with Zod validation

Success criteria:
* `GET /api/v1/users/me` returns current user's profile (name, email, avatar, default currency)
* `PATCH /api/v1/users/me` updates allowed fields (first name, last name, avatar URL, default currency)
* Invalid currency code rejected with 400
* Unauthenticated requests return 401

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.1) — US-AUTH-02

Dependencies:
* Step 2.4 completion (authGuard middleware)

### Step 2.6: Build login page UI and user profile settings page

Build the frontend authentication flow and profile management pages.

Files:
* `apps/web/src/features/auth/LoginPage.tsx` — Social login buttons, OAuth redirect handling
* `apps/web/src/features/auth/useAuth.ts` — Auth hook: login, logout, token management, refresh
* `apps/web/src/features/settings/SettingsPage.tsx` — Profile form: name, avatar, default currency
* `apps/web/src/lib/api-client.ts` — Fetch wrapper with base URL, auth header injection, token refresh interceptor
* `apps/web/src/stores/auth.store.ts` — Zustand store: access token, user profile, isAuthenticated
* `apps/web/src/components/auth/ProtectedRoute.tsx` — Route guard redirecting unauthenticated users to login

Success criteria:
* Login page renders Google and Apple sign-in buttons
* Successful OAuth redirects to dashboard with valid session
* Profile settings page loads current values and saves changes
* Unauthenticated navigation redirects to login page
* Token auto-refresh happens transparently before expiry

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 2.6) — API client example

Dependencies:
* Steps 2.2–2.5 completion (backend auth working)

### Step 2.7: Validate Phase 2

Validation commands:
* Run API integration tests for `POST /api/v1/auth/google`, `POST /api/v1/auth/refresh`, `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
* Verify full OAuth flow in browser: click Google → callback → dashboard
* Verify `authGuard` rejects expired/missing tokens

## Implementation Phase 3: Currency and Reference Data

<!-- parallelizable: true -->

### Step 3.1: Seed currencies table

Populate the currencies reference table with ~150 ISO 4217 currency codes, symbols, and minor unit scales.

Files:
* `apps/api/prisma/seed.ts` — Currency seed data: `{ currencyCode: "USD", name: "US Dollar", symbol: "$" }`, etc.
* `packages/shared/src/constants/currencies.ts` — TypeScript constants for common currencies, `MINOR_UNIT_SCALE` map (USD=100, JPY=1, BHD=1000)

Success criteria:
* `npx prisma db seed` inserts ~150 currency rows without errors
* Currencies table includes `USD`, `EUR`, `GBP`, `JPY`, `MXN`, `CAD`, `AUD` and 140+ others
* Constants file exports `MINOR_UNIT_SCALE` map matching DB data

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 1.7) — 100+ currencies
* `.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md` (Rounding section) — minor unit scale note

Dependencies:
* Step 2.1 completion (Currency model in schema)

### Step 3.2: Seed categories table

Populate the categories reference table with hierarchical expense categories.

Files:
* `apps/api/prisma/seed.ts` — Category seed data: top-level parents ("Food & Drink", "Transportation", "Utilities", "Entertainment", "Home", "Life", "Uncategorized") with children ("Groceries", "Dining out", "Gas", "Electricity", etc.)

Success criteria:
* Seed script inserts parent categories and child categories with correct `parent_id` references
* At least 7 parent categories and 20+ child categories
* Hierarchical query returns nested structure

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 1.2) — hierarchical categories

Dependencies:
* Step 2.1 completion (Category model in schema)

### Step 3.3: Build currency picker dropdown component

Create a searchable dropdown component for selecting currencies.

Files:
* `apps/web/src/components/ui/CurrencyPicker.tsx` — Searchable Select component using shadcn/ui Combobox pattern
* `apps/web/src/hooks/useCurrencies.ts` — TanStack Query hook to fetch currencies list from API
* `apps/api/src/routes/currencies.routes.ts` — `GET /api/v1/currencies` (list all currencies)
* `apps/api/src/controllers/currencies.controller.ts` — Return sorted currency list

Success criteria:
* Currency picker renders searchable dropdown with flag emoji or symbol + code + name
* Typing filters currencies by code or name
* API returns all currencies sorted alphabetically by code
* Component works in expense form and profile settings

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.6) — US-CUR-01

Dependencies:
* Step 3.1 completion (currencies seeded)

### Step 3.4: Implement money arithmetic utilities

Build integer-cents arithmetic and rounding utilities in the shared package.

Files:
* `packages/shared/src/utils/money.ts` — `toCents()`, `fromCents()`, `splitEvenly()`, `splitByPercentages()`, `splitByShares()`, `splitByAmounts()`
* `packages/shared/src/utils/money.test.ts` — Unit tests for all money utilities

Key implementation rules:
* All internal arithmetic operates on integer cents (smallest currency unit)
* `splitEvenly(totalCents, userIds, creatorId)`: floor-divide, distribute remainder to creator first
* `splitByPercentages(totalCents, percentages, creatorId)`: compute each share, distribute remainder
* `splitByShares(totalCents, shares, creatorId)`: convert ratios to amounts, distribute remainder
* `splitByAmounts(totalCents, amounts)`: validate sum equals total, reject if mismatch
* Sum invariant: output shares always sum to input total (enforced by assertion in tests)

Success criteria:
* `splitEvenly(1000, ["a","b","c"], "a")` → `{a: 334, b: 333, c: 333}` (creator gets extra cent)
* `splitByPercentages(10000, [{id:"a", pct:33.33}, {id:"b", pct:33.33}, {id:"c", pct:33.34}], "a")` → sums to 10000
* `splitByShares(10000, [{id:"a", shares:2}, {id:"b", shares:1}], "a")` → `{a: 6667, b: 3333}`
* All test cases verify sum invariant
* Edge cases: single user, two users, zero amount, large amounts

Context references:
* `.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md` (Rounding Strategy section) — largest remainder method, TypeScript implementation

Dependencies:
* Step 1.6 completion (shared package configured)

### Step 3.5: Validate Phase 3

Validation commands:
* `npx prisma db seed` — verify currencies and categories insert correctly
* `npm run test --workspace=packages/shared` — money utility unit tests pass
* Verify currency picker renders in dev server

## Implementation Phase 4: Group Management

<!-- parallelizable: true -->

### Step 4.1: Implement group API endpoints

Build all group management endpoints: CRUD and member administration.

Files:
* `apps/api/src/routes/groups.routes.ts` — Route definitions for all group endpoints
* `apps/api/src/controllers/groups.controller.ts` — Request handlers for groups
* `apps/api/src/services/groups.service.ts` — Business logic: create, list, get, update, softDelete, addMember, removeMember

Endpoint details:

* `POST /api/v1/groups` — Create group; auto-add creator as member. Body: `{ name: string }`. Returns group with members.
* `GET /api/v1/groups` — List authenticated user's groups (where user is active member, group not deleted). Returns array with member count.
* `GET /api/v1/groups/:id` — Get group detail with members list. 404 if not found or user not a member.
* `PATCH /api/v1/groups/:id` — Update group name. Only group members can update. Body: `{ name: string }`.
* `DELETE /api/v1/groups/:id` — Soft-delete group (set `deleted_at`). Only creator can delete.
* `POST /api/v1/groups/:id/members` — Add member by email. Body: `{ email: string }`. 404 if user with email not found. 409 if already a member.
* `DELETE /api/v1/groups/:id/members/:userId` — Remove member. Block with 409 if member has non-zero balance in the group.

Authorization rules:
* All endpoints require `authGuard`
* List/get/update/add member: must be active group member
* Delete group: must be creator
* Remove member: must be group member (can remove self or others; balance check applies)

Success criteria:
* CRUD operations work correctly
* Creator is auto-added on group creation
* Non-members cannot access group (404)
* Remove member blocked when balance is non-zero (409)
* Soft-deleted groups excluded from list

Context references:
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` (Epic 4) — group stories G-01 through G-07
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.2) — US-GRP-01 through US-GRP-04

Dependencies:
* Phase 2 completion (auth, User model)

### Step 4.2: Build group UI pages

Build the frontend group management pages: list, detail, create/edit form.

Files:
* `apps/web/src/features/groups/GroupListPage.tsx` — List of user's groups with name, member count, balance preview
* `apps/web/src/features/groups/GroupDetailPage.tsx` — Group detail: tabs for Expenses, Balances, Members, Activity
* `apps/web/src/features/groups/GroupFormPage.tsx` — Create/edit group form (name input)
* `apps/web/src/features/groups/components/GroupCard.tsx` — Group card component for list view
* `apps/web/src/features/groups/components/MemberList.tsx` — Member list with add/remove actions
* `apps/web/src/features/groups/components/AddMemberDialog.tsx` — Dialog to add member by email
* `apps/web/src/features/groups/hooks/useGroups.ts` — TanStack Query hooks: `useGroups()`, `useGroup(id)`, `useCreateGroup()`, `useUpdateGroup()`, `useDeleteGroup()`
* `apps/web/src/features/groups/hooks/useMembers.ts` — TanStack Query hooks: `useAddMember()`, `useRemoveMember()`

Success criteria:
* Group list page shows user's groups sorted by recent activity
* Tapping a group navigates to detail page
* Create group form validates non-empty name
* Add member dialog searches by email and adds on confirm
* Remove member shows confirmation, errors on non-zero balance
* Empty states for no groups and no members

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.2) — group user stories

Dependencies:
* Step 4.1 completion (group API)

### Step 4.3: Validate Phase 4

Validation commands:
* Run API integration tests for all group endpoints
* Verify UI flow: create group → view in list → open detail → add member → remove member
* Verify 404 on non-member access, 409 on removing member with balance

## Implementation Phase 5: Expense CRUD and Split Engine

<!-- parallelizable: false -->

### Step 5.1: Implement expense API endpoints

Build all expense management endpoints with split validation.

Files:
* `apps/api/src/routes/expenses.routes.ts` — Route definitions for expense endpoints
* `apps/api/src/controllers/expenses.controller.ts` — Request handlers
* `apps/api/src/services/expenses.service.ts` — Business logic: create, list, get, update, softDelete

Endpoint details:

* `POST /api/v1/groups/:id/expenses` — Create expense with splits. Body:
  ```json
  {
    "description": "string",
    "cost": 50.00,
    "currencyCode": "USD",
    "date": "2026-02-16T00:00:00Z",
    "notes": "optional string",
    "splits": [
      { "userId": "uuid", "paidShare": 50.00, "owedShare": 25.00 },
      { "userId": "uuid", "paidShare": 0.00, "owedShare": 25.00 }
    ]
  }
  ```
  Validation: `SUM(paidShare) = cost`, `SUM(owedShare) = cost`. All userIds must be active group members.

* `GET /api/v1/groups/:id/expenses` — List group expenses (non-deleted), paginated with `?page=1&limit=20`, sorted by date desc.

* `GET /api/v1/expenses/:id` — Expense detail with splits and user names. 404 if not found or user not in group.

* `PATCH /api/v1/expenses/:id` — Update expense. Replaces splits entirely (delete old splits, insert new). Re-validates sums.

* `DELETE /api/v1/expenses/:id` — Soft-delete (set `deleted_at`). Any group member can delete.

Validation rules:
* Cost must be positive
* Currency must exist in currencies table
* Date must be valid ISO 8601
* All split user IDs must be active members of the group
* `SUM(paid_share) = cost` (who paid)
* `SUM(owed_share) = cost` (who owes)
* At least one split required
* Amounts use 2 decimal places max

Success criteria:
* Create expense stores correct splits
* Invalid split sums rejected with 400 and descriptive error
* Non-group-member user IDs in splits rejected
* Pagination returns correct pages
* Soft-deleted expenses excluded from list
* Update replaces all splits atomically (transaction)

Context references:
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` (Epic 5) — expense stories E-01 through E-06
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.3) — US-EXP-01 through US-EXP-03, Section 3.4 — US-SPL-01 through US-SPL-04

Dependencies:
* Phase 4 completion (groups and members exist)

### Step 5.2: Build split calculator components

Build the frontend split calculator that computes `owed_share` values based on the selected split type.

Files:
* `apps/web/src/features/expenses/components/SplitCalculator.tsx` — Container: split type tabs (Equal, Amount, Percentage, Shares)
* `apps/web/src/features/expenses/components/EqualSplit.tsx` — Auto-computed equal split with remainder display
* `apps/web/src/features/expenses/components/AmountSplit.tsx` — Per-person amount inputs with running sum validation
* `apps/web/src/features/expenses/components/PercentageSplit.tsx` — Per-person percentage inputs with sum-to-100 validation
* `apps/web/src/features/expenses/components/SharesSplit.tsx` — Per-person share count inputs with computed amounts
* `apps/web/src/features/expenses/hooks/useSplitCalculator.ts` — Hook managing split state, validation, and conversion to `splits[]` array

Behavior per split type:

**Equal Split:**
* Pre-select all group members as participants
* Allow toggling individual members on/off
* Auto-compute using `splitEvenly()` from shared package
* Display per-person amount (read-only)

**By Amount:**
* Input field per participant for their exact owed amount
* Running total shown at bottom with delta from expense cost
* Error state when sum ≠ cost

**By Percentage:**
* Input field per participant for their percentage
* Running total shown at bottom with delta from 100%
* Computed dollar amounts shown next to percentages
* Error state when percentages ≠ 100%

**By Shares:**
* Input field per participant for share count (positive integers)
* Auto-compute amounts using `splitByShares()` from shared package
* Display computed dollar amounts next to share counts

All types:
* Payer selector: who paid (default: current user, full amount)
* Participant list with togglable inclusion
* Preview of final splits before submission

Success criteria:
* Each split type produces correct amounts (matches unit test expectations)
* Sum validation prevents submission of invalid splits
* Switching split type resets amounts but preserves participant selection
* Remainder cents visible in equal split preview

Context references:
* `.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md` (Rounding Strategy) — largest remainder method
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.4) — split user stories

Dependencies:
* Step 3.4 completion (money utilities)
* Step 4.2 completion (group members available)

### Step 5.3: Build expense list, detail, and form UI pages

Build the frontend pages for viewing and managing expenses.

Files:
* `apps/web/src/features/expenses/ExpenseListView.tsx` — Expense list within group detail page (card list, sorted by date desc)
* `apps/web/src/features/expenses/ExpenseDetailPage.tsx` — Expense detail: description, amount, date, who paid, splits breakdown
* `apps/web/src/features/expenses/ExpenseFormPage.tsx` — Add/edit expense form: description, amount, currency picker, date, split calculator
* `apps/web/src/features/expenses/components/ExpenseCard.tsx` — Expense card: description, amount, who paid, date
* `apps/web/src/features/expenses/hooks/useExpenses.ts` — TanStack Query hooks: `useGroupExpenses(groupId)`, `useExpense(id)`, `useCreateExpense()`, `useUpdateExpense()`, `useDeleteExpense()`

Success criteria:
* Expense list shows all group expenses with pagination
* Add expense form integrates split calculator for all four types
* Edit expense form pre-populates existing values and splits
* Delete expense shows confirmation dialog
* Optimistic updates for better perceived performance

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.3) — expense user stories

Dependencies:
* Steps 5.1, 5.2 completion

### Step 5.4: Validate Phase 5

Validation commands:
* Run unit tests for split calculator component
* Run API integration tests for all expense endpoints
* Test each split type: create expense → verify stored splits → verify sum invariants
* Test edge cases: single participant, all-equal, zero-remainder, large amounts

## Implementation Phase 6: Balances, Settle Up, and Debt Simplification

<!-- parallelizable: false -->

### Step 6.1: Implement balance aggregation service and API endpoints

Build the balance computation layer that aggregates expense splits into per-user, per-currency net balances.

Files:
* `apps/api/src/services/balance.service.ts` — `getGroupBalances(groupId)`: aggregate query, `getOverallBalances(userId)`: across all groups
* `apps/api/src/routes/balances.routes.ts` — `GET /api/v1/groups/:id/balances`, `GET /api/v1/balances`
* `apps/api/src/controllers/balances.controller.ts` — Format balance responses

Balance computation logic:

```sql
-- Per-group: net balance per user per currency
SELECT es.user_id, e.currency_code,
       SUM(es.paid_share - es.owed_share) AS net_balance
FROM expense_splits es
JOIN expenses e ON e.id = es.expense_id
WHERE e.group_id = $1 AND e.deleted_at IS NULL
GROUP BY es.user_id, e.currency_code;
```

Response shape for `GET /api/v1/groups/:id/balances`:
```json
{
  "balances": [
    { "userId": "uuid", "userName": "Alice", "balances": [{ "currency": "USD", "amount": 25.50 }] }
  ],
  "debts": [
    { "from": "uuid", "to": "uuid", "amount": 25.50, "currency": "USD" }
  ],
  "simplifiedDebts": [
    { "from": "uuid", "to": "uuid", "amount": 25.50, "currency": "USD" }
  ]
}
```

Success criteria:
* Net balances sum to zero across all users in a group (invariant)
* Multi-currency balances tracked independently
* Deleted expenses excluded from computation
* Overall balances aggregate across all user's groups

Context references:
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` (Balance Computation Query) — SQL query
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.5) — US-BAL-01, US-BAL-02

Dependencies:
* Phase 5 completion (expenses and splits exist)

### Step 6.2: Implement debt simplification service

Implement the greedy net-balance debt simplification algorithm.

Files:
* `apps/api/src/lib/debt-simplification.ts` — `simplifyDebts(balances)`, `simplifyMultiCurrency(balances)`
* `apps/api/src/lib/debt-simplification.test.ts` — Unit tests for simplification algorithm

Algorithm implementation (from research):

```typescript
interface Transfer {
  from: string;    // debtor userId
  to: string;      // creditor userId
  amount: number;  // integer cents
  currency: string;
}

function simplifyDebts(
  netBalances: Map<string, number>,
  currency: string
): Transfer[] {
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  for (const [id, balance] of netBalances) {
    if (balance > 0) creditors.push({ id, amount: balance });
    else if (balance < 0) debtors.push({ id, amount: -balance });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transfers: Transfer[] = [];
  let ci = 0, di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    transfers.push({ from: debtors[di].id, to: creditors[ci].id, amount, currency });
    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;
    if (creditors[ci].amount === 0) ci++;
    if (debtors[di].amount === 0) di++;
  }

  return transfers;
}
```

For multi-currency: group balances by currency, run `simplifyDebts` per currency independently.

Test cases:
* 3 users, single currency: A owes B $10, B owes C $10 → simplified to A pays C $10 (1 transfer)
* 4 users, balanced pairs: [+5, +3, -5, -3] → 2 transfers
* Multi-currency: USD and EUR debts simplified independently
* All zero balances → 0 transfers
* Single debtor/creditor → 1 transfer
* Verify sum invariant: total debited = total credited per currency

Success criteria:
* Algorithm produces at most N-1 transfers for N users with non-zero balance
* Net amounts preserved (sum of transfers to each user = their net balance)
* Multi-currency debts never cross-converted
* All unit tests pass

Context references:
* `.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md` — full algorithm, pseudocode, TypeScript implementation

Dependencies:
* Step 6.1 completion (balance computation)

### Step 6.3: Implement settle-up endpoint

Build the settle-up flow that records a payment as a special expense.

Files:
* `apps/api/src/routes/settle.routes.ts` — `POST /api/v1/groups/:id/settle`
* `apps/api/src/controllers/settle.controller.ts` — Handle settle request
* `apps/api/src/services/settle.service.ts` — Create payment expense with `is_payment: true`

Request body:
```json
{
  "toUserId": "uuid",
  "amount": 25.50,
  "currencyCode": "USD"
}
```

Creates an Expense record with:
* `is_payment: true`
* `description: "Payment"`
* `cost: amount`
* Two ExpenseSplits: payer (`paid_share = amount, owed_share = 0`) and recipient (`paid_share = 0, owed_share = amount`)

Success criteria:
* Payment expense created with correct splits
* Balance between payer and recipient reduced by payment amount
* Payment appears in expense list with visual distinction
* Only group members can settle within a group
* Amount must be positive

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.5) — US-BAL-03

Dependencies:
* Step 6.1 completion

### Step 6.4: Build dashboard, group balance, and settle-up UI pages

Build the frontend balance and settlement pages.

Files:
* `apps/web/src/features/balances/DashboardPage.tsx` — Overall balances: list of friends with net balance per currency, "you owe" / "you are owed" summary
* `apps/web/src/features/balances/GroupBalancePage.tsx` — Group balance tab: per-member balances, toggle between original and simplified debts
* `apps/web/src/features/balances/components/BalanceCard.tsx` — Balance card: friend name, multi-currency amounts, positive/negative styling
* `apps/web/src/features/balances/components/DebtList.tsx` — List of debts (from → to, amount, currency) for both original and simplified views
* `apps/web/src/features/balances/SettleUpPage.tsx` — Settle-up form: pre-fill recipient from debt list, amount input, currency, confirm button
* `apps/web/src/features/balances/hooks/useBalances.ts` — TanStack Query hooks: `useGroupBalances(groupId)`, `useOverallBalances()`, `useSettleUp()`

Success criteria:
* Dashboard shows overall balance per friend (green for owed, red for owing)
* Group balance page shows per-member net balances
* Simplified debts toggle shows fewer transfers than original debts
* Settle-up form pre-fills from debt selection
* After settling, balances update immediately (cache invalidation)

Context references:
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` (Section 3.5) — balance and settle user stories

Dependencies:
* Steps 6.1–6.3 completion

### Step 6.5: Validate Phase 6

Validation commands:
* Run unit tests for debt simplification algorithm
* Run API integration tests for balance and settle endpoints
* End-to-end: create expenses → view balances → settle up → verify balance reduced
* Verify multi-currency balances display correctly (separate rows per currency)
* Verify simplified debts produce fewer transfers

## Implementation Phase 7: Activity Feed

<!-- parallelizable: true -->

### Step 7.1: Implement activity feed API endpoint

Build the endpoint to retrieve chronological activity within a group.

Files:
* `apps/api/src/routes/activity.routes.ts` — `GET /api/v1/groups/:id/activity`
* `apps/api/src/controllers/activity.controller.ts` — Format activity items
* `apps/api/src/services/activity.service.ts` — Query expenses and payments ordered by date, include creator/updater info

Query: select all expenses (including soft-deleted for audit trail) for a group, ordered by `updated_at` desc, paginated. Include:
* Expense created/updated/deleted events
* Payment events
* Creator and updater user names

Response shape:
```json
{
  "items": [
    {
      "type": "expense_created",
      "expense": { "id": "uuid", "description": "Dinner", "cost": 50.00 },
      "actor": { "id": "uuid", "name": "Alice" },
      "timestamp": "2026-02-16T20:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 45 }
}
```

Success criteria:
* Activity feed returns events in reverse chronological order
* Includes expense CRUD and payment events
* Pagination works correctly
* Only group members can access (404 for non-members)

Context references:
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` (Epic 8) — activity stories AF-01, AF-02

Dependencies:
* Phase 5 completion (expenses exist)

### Step 7.2: Build activity feed UI

Build the activity feed view within the group detail page.

Files:
* `apps/web/src/features/groups/components/ActivityFeed.tsx` — Chronological list of activity items
* `apps/web/src/features/groups/components/ActivityItem.tsx` — Single activity event: icon, description, actor, timestamp
* `apps/web/src/features/groups/hooks/useActivity.ts` — TanStack Query hook: `useGroupActivity(groupId)`

Success criteria:
* Activity feed shows as a tab in group detail page
* Each item shows action type icon, description, who did it, when
* Payment events visually distinct from expense events
* Infinite scroll or "Load more" pagination
* `created_by` and `updated_by` displayed on expense detail cards

Context references:
* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` (Epic 8) — AF-03, AF-04

Dependencies:
* Step 7.1 completion

### Step 7.3: Validate Phase 7

Validation commands:
* Run API test for activity endpoint
* Create expense, edit it, delete it → verify all three events appear in feed
* Create payment → verify payment event appears
* Verify pagination works

## Implementation Phase 8: Azure Infrastructure and Deployment

<!-- parallelizable: true -->

### Step 8.1: Create Azure Bicep templates

Define Azure infrastructure as code using Bicep modules.

Files:
* `infra/bicep/main.bicep` — Main template orchestrating all modules
* `infra/bicep/modules/app-service.bicep` — App Service Plan (B1) + Web App (Node.js 22)
* `infra/bicep/modules/postgresql.bicep` — PostgreSQL Flexible Server (Burstable B1ms), firewall rules
* `infra/bicep/modules/static-web-app.bicep` — Static Web App for frontend
* `infra/bicep/modules/key-vault.bicep` — Key Vault with secrets for JWT, OAuth credentials, DB connection string
* `infra/bicep/modules/app-insights.bicep` — Application Insights for monitoring
* `infra/bicep/parameters/dev.bicepparam` — Development environment parameters
* `infra/bicep/parameters/prod.bicepparam` — Production environment parameters

Resources:
* Azure App Service Plan (B1 Linux) hosting Express API
* Azure Web App with Node.js 22, Key Vault references for secrets
* Azure Database for PostgreSQL Flexible Server (Burstable B1ms, 1 vCore, 2 GB RAM)
* Azure Static Web Apps (Free tier) for React frontend
* Azure Key Vault (Standard) for secrets management
* Application Insights for request tracing and error tracking

Success criteria:
* `az bicep build --file infra/bicep/main.bicep` compiles without errors
* What-if deployment shows expected resources
* Key Vault references configured for all secrets (no secrets in app settings)

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 5) — Azure services, architecture diagram, environment config

Dependencies:
* Azure subscription and service principal for deployment

### Step 8.2: Configure GitHub Actions deploy pipeline

Set up the deployment pipeline that builds and deploys to Azure.

Files:
* `.github/workflows/deploy.yml` — Deploy pipeline: build, deploy API to App Service, deploy web to Static Web Apps, run Prisma migrations
* `.github/workflows/ci.yml` — Update CI to include test step (if not already present)

Pipeline stages:
1. Checkout + setup Node.js 22
2. `npm ci` + `npx turbo build`
3. Run tests (`npx turbo test`)
4. Deploy API: `azure/webapps-deploy@v3` with `apps/api/dist`
5. Deploy Web: `Azure/static-web-apps-deploy@v1` with `apps/web/dist`
6. Run migrations: `npx prisma migrate deploy` (against production DB)

Triggers:
* CI: push to `main`, pull requests
* Deploy: push to `main` (auto-deploy to staging), manual approval for production

Success criteria:
* Pipeline runs on push to `main`
* Build, test, and deploy steps complete without errors
* Prisma migrations run against production database
* Frontend served via Static Web Apps CDN
* API accessible via App Service URL

Context references:
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` (Section 5.2) — deploy workflow example

Dependencies:
* Step 8.1 completion (infrastructure deployed)
* GitHub repository secrets configured (Azure credentials, API URL)

### Step 8.3: Validate Phase 8

Validation commands:
* `az bicep build --file infra/bicep/main.bicep` — validate templates
* `az deployment group what-if` — preview resource creation
* Run deploy pipeline in dry-run mode

## Implementation Phase 9: Validation

<!-- parallelizable: false -->

### Step 9.1: Run full project validation

Execute all validation commands for the project:
* `npm run lint` — ESLint across all workspaces
* `npm run typecheck` — TypeScript strict mode across all workspaces
* `npm run build` — Turborepo build pipeline
* `npm run test` — Unit and integration tests across all workspaces

### Step 9.2: Run E2E tests for critical flows

Test the full user journey end-to-end:
* Login with Google OAuth → Dashboard loads
* Create a group → Group appears in list
* Add members to group → Members visible in group detail
* Add expense with equal split → Expense in list, balances update
* Add expense with percentage split → Verify calculated amounts
* Add expense with shares split → Verify calculated amounts
* Add expense with exact amounts → Verify validation rejects bad sums
* View group balances → Verify multi-currency breakdown
* View simplified debts → Fewer transfers than original
* Settle up → Balance reduced
* View activity feed → All events in chronological order
* PWA install → Service worker registered, app installs
* Lighthouse audit → ≥90 on Performance, Accessibility, Best Practices, PWA

### Step 9.3: Accessibility audit

Run accessibility testing:
* axe-core automated scan on all pages
* Keyboard navigation for all interactive elements (forms, buttons, dialogs, tabs)
* Screen reader testing on critical flows (VoiceOver on macOS)
* Color contrast verification for balance amounts (green/red)

### Step 9.4: Fix minor validation issues

Iterate on lint errors, build warnings, and test failures. Apply fixes directly when corrections are straightforward and isolated.

### Step 9.5: Report blocking issues

When validation failures require changes beyond minor fixes:
* Document the issues and affected files.
* Provide the user with next steps.
* Recommend additional research and planning rather than inline fixes.
* Avoid large-scale refactoring within this phase.

## Dependencies

* Node.js 22.x LTS
* PostgreSQL 16+ (local dev + Azure Flexible Server)
* Azure CLI, Azure subscription
* Google Cloud Console (OAuth client)
* Apple Developer account (Sign-In with Apple)
* GitHub Actions (CI/CD)

## Success Criteria

* All lint, type-check, and build commands pass from monorepo root
* All unit and integration tests pass
* E2E critical flow tests pass
* Lighthouse PWA score ≥90
* OAuth login works end-to-end for both Google and Apple
* All four split types produce correct shares
* Debt simplification reduces transaction count
* Multi-currency balances display independently
* Azure deployment serves the app with HTTPS
