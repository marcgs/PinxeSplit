---
applyTo: '.copilot-tracking/changes/2026-02-16-pinxesplit-mvp-changes.md'
---
<!-- markdownlint-disable-file -->
# Implementation Plan: PinxeSplit MVP

## Overview

Build a Splitwise clone as a Progressive Web App with React, Node.js/Express, PostgreSQL, and Azure hosting — covering groups, expenses, four split types, multi-currency balances, debt simplification, and social login for ~20 personal users.

## Objectives

* Scaffold a Turborepo monorepo with frontend (Vite + React), backend (Express + Prisma), and shared package (types + Zod schemas + money utilities)
* Implement Google and Apple OAuth with JWT session management
* Build group management CRUD with member administration
* Build expense CRUD with four split types (equal, amount, percentage, shares)
* Compute and display per-group and per-friend multi-currency balances
* Implement settle-up flow with greedy debt simplification algorithm
* Configure PWA manifest, service worker, and responsive mobile-first layout
* Deploy to Azure (Static Web Apps + App Service + PostgreSQL Flexible Server)

## Context Summary

### Project Files

* `.copilot-tracking/research/2026-02-16-pinxesplit-mvp-backlog-research.md` — MVP backlog with 9 epics, 17 P0 features, user stories, data model, and architecture decisions
* `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md` — Splitwise feature catalog, user stories with acceptance criteria, data model sketch
* `.copilot-tracking/subagent/2026-02-16/tech-stack-architecture-research.md` — Turborepo monorepo structure, Prisma schema, API endpoints, Azure deployment, CI/CD
* `.copilot-tracking/subagent/2026-02-16/debt-simplification-research.md` — Greedy and bitmask DP algorithms, TypeScript implementation, rounding strategy

### References

* Vite PWA Plugin — <https://vite-pwa-org.netlify.app/>
* Prisma ORM — <https://www.prisma.io/docs/>
* shadcn/ui — <https://ui.shadcn.com/>
* TanStack Query — <https://tanstack.com/query/latest/>
* Azure Static Web Apps — <https://learn.microsoft.com/en-us/azure/static-web-apps/overview>
* Azure App Service — <https://learn.microsoft.com/en-us/azure/app-service/overview>
* Azure Database for PostgreSQL — <https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/overview>

### Standards References

* #file:../../.github/instructions/csharp.instructions.md — N/A (TypeScript project)
* Fresh repo — no existing `.github/instructions/` files; conventions established by this plan

## Implementation Checklist

### [ ] Implementation Phase 1: Project Foundation

<!-- parallelizable: false -->

* [ ] Step 1.1: Initialize Turborepo monorepo with `apps/web`, `apps/api`, `packages/shared`
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 16-39)
* [ ] Step 1.2: Configure Vite + React + TypeScript + Tailwind CSS + shadcn/ui in `apps/web`
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 41-65)
* [ ] Step 1.3: Configure PWA manifest and `vite-plugin-pwa` with Workbox
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 67-87)
* [ ] Step 1.4: Create responsive app shell layout (nav, bottom tabs, page container)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 89-109)
* [ ] Step 1.5: Configure Express + TypeScript + Prisma in `apps/api`
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 111-134)
* [ ] Step 1.6: Set up shared Zod schemas and TypeScript types in `packages/shared`
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 136-165)
* [ ] Step 1.7: Configure GitHub Actions CI pipeline (lint, type-check, build)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 167-186)
* [ ] Step 1.8: Validate Phase 1 — monorepo builds, lint passes, PWA shell renders
  * Run `npm run build` from root (Turborepo pipeline)
  * Run `npm run lint` and `npm run typecheck`
  * Verify PWA manifest loads in browser dev tools

### [ ] Implementation Phase 2: Authentication and User Management

<!-- parallelizable: false -->

* [ ] Step 2.1: Create Prisma schema with all models (User, Group, GroupMember, Expense, ExpenseSplit, Currency, Category, RefreshToken)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 201-219)
* [ ] Step 2.2: Implement Google OAuth 2.0 PKCE flow with Passport.js
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 221-242)
* [ ] Step 2.3: Implement Apple Sign-In flow with Passport.js
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 244-262)
* [ ] Step 2.4: Implement JWT access/refresh token issuance and `authGuard` middleware
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 264-284)
* [ ] Step 2.5: Implement user profile endpoints (`GET /api/v1/users/me`, `PATCH /api/v1/users/me`)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 286-305)
* [ ] Step 2.6: Build login page UI and user profile settings page
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 307-330)
* [ ] Step 2.7: Validate Phase 2 — OAuth login flow works end-to-end, JWT refresh works, protected routes reject unauthenticated requests
  * Run API integration tests for auth endpoints
  * Verify token refresh lifecycle

### [ ] Implementation Phase 3: Currency and Reference Data

<!-- parallelizable: true -->

* [ ] Step 3.1: Create and seed `currencies` table (~150 ISO 4217 codes with symbol and minor unit scale)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 343-361)
* [ ] Step 3.2: Create and seed `categories` table (hierarchical parent/child)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 363-379)
* [ ] Step 3.3: Build currency picker dropdown component
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 381-401)
* [ ] Step 3.4: Implement money arithmetic utilities (integer cents, rounding, `splitEvenly`)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 403-430)
* [ ] Step 3.5: Validate Phase 3 — seed script runs, currency picker renders, money utility unit tests pass
  * Run `prisma db seed`
  * Run unit tests for `packages/shared/src/utils/money.ts`

### [ ] Implementation Phase 4: Group Management

<!-- parallelizable: true -->

* [ ] Step 4.1: Implement group API endpoints (CRUD + member management)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 443-480)
* [ ] Step 4.2: Build group list page, group detail page, and create/edit group form UI
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 482-508)
* [ ] Step 4.3: Validate Phase 4 — group CRUD works, member add/remove honors balance constraint
  * Run API integration tests for group endpoints
  * Verify UI navigation: group list → group detail → members

### [ ] Implementation Phase 5: Expense CRUD and Split Engine

<!-- parallelizable: false -->

* [ ] Step 5.1: Implement expense API endpoints (CRUD with split validation)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 521-579)
* [ ] Step 5.2: Build split calculator components (equal, amount, percentage, shares)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 581-634)
* [ ] Step 5.3: Build expense list, detail, and form UI pages
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 636-658)
* [ ] Step 5.4: Validate Phase 5 — all four split types produce correct shares, backend rejects invalid sums
  * Run unit tests for split calculator
  * Run API integration tests for expense endpoints
  * Verify `SUM(paid_share) = cost` and `SUM(owed_share) = cost` invariants

### [ ] Implementation Phase 6: Balances, Settle Up, and Debt Simplification

<!-- parallelizable: false -->

* [ ] Step 6.1: Implement balance aggregation service and API endpoints
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 672-719)
* [ ] Step 6.2: Implement debt simplification service (greedy net-balance algorithm)
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 721-790)
* [ ] Step 6.3: Implement settle-up endpoint and payment expense creation
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 792-827)
* [ ] Step 6.4: Build dashboard, group balance, and settle-up UI pages
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 829-852)
* [ ] Step 6.5: Validate Phase 6 — balances compute correctly, simplification produces minimal transfers, settle up reduces balances
  * Run unit tests for debt simplification algorithm
  * Run integration tests for balance and settle endpoints
  * Verify multi-currency balances display independently

### [ ] Implementation Phase 7: Activity Feed

<!-- parallelizable: true -->

* [ ] Step 7.1: Implement activity feed API endpoint
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 867-906)
* [ ] Step 7.2: Build activity feed UI within group detail page
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 908-928)
* [ ] Step 7.3: Validate Phase 7 — activity feed shows expense/payment events in chronological order
  * Run API test for activity endpoint
  * Verify audit metadata (`created_by`, `updated_by`) displays

### [ ] Implementation Phase 8: Azure Infrastructure and Deployment

<!-- parallelizable: true -->

* [ ] Step 8.1: Create Azure Bicep templates for all resources
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 942-973)
* [ ] Step 8.2: Configure GitHub Actions deploy pipeline
  * Details: .copilot-tracking/details/2026-02-16-pinxesplit-mvp-details.md (Lines 975-1007)
* [ ] Step 8.3: Validate Phase 8 — Bicep templates deploy without errors, pipeline runs green
  * Validate Bicep with `az bicep build`
  * Dry-run deploy pipeline

### [ ] Implementation Phase 9: Validation

<!-- parallelizable: false -->

* [ ] Step 9.1: Run full project validation
  * Execute `npm run lint` from monorepo root
  * Execute `npm run typecheck` from monorepo root
  * Execute `npm run build` from monorepo root
  * Execute `npm run test` (unit + integration tests)
* [ ] Step 9.2: Run E2E tests for critical flows
  * Login → create group → add expense (all 4 split types) → view balances → settle up
  * Verify PWA install prompt, service worker registration, offline shell
  * Run Lighthouse audit targeting ≥90 on all categories
* [ ] Step 9.3: Accessibility audit
  * Run axe-core against all pages
  * Verify keyboard navigation for all interactive elements
  * Test with screen reader
* [ ] Step 9.4: Fix minor validation issues
  * Iterate on lint errors and build warnings
  * Apply fixes directly when corrections are straightforward
* [ ] Step 9.5: Report blocking issues
  * Document issues requiring additional research
  * Provide user with next steps and recommended planning
  * Avoid large-scale fixes within this phase

## Dependencies

* Node.js 22.x LTS
* npm with Turborepo workspace support
* PostgreSQL 16+ (local for dev, Azure Flexible Server for prod)
* Azure CLI (`az`) for infrastructure deployment
* GitHub repository with Actions enabled
* Google Cloud Console project (OAuth client ID/secret)
* Apple Developer account (Sign-In with Apple service ID/key)

## Success Criteria

* Monorepo builds without errors from root via `npm run build`
* All lint and type-check commands pass
* OAuth login flows complete end-to-end (Google and Apple)
* Groups, expenses, and splits can be created, edited, and deleted via the UI
* All four split types produce correct per-user shares (verified by unit tests)
* Balance aggregation returns correct multi-currency net balances
* Debt simplification reduces transactions (verified by algorithm unit tests)
* Settle-up flow creates payment expenses and reduces outstanding balances
* PWA installs on mobile, service worker caches app shell
* Lighthouse PWA score ≥90
* Azure deployment serves the app on a custom domain with HTTPS
