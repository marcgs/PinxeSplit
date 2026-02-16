---
title: Tech Stack and Architecture Research for PinxeSplit
description: Recommended architecture for a React + Node.js/Express + PostgreSQL PWA on Azure, covering project structure, frontend, backend, database schema, deployment, and key technical decisions
author: Copilot Research Agent
ms.date: 2026-02-16
ms.topic: reference
keywords:
  - pinxesplit
  - architecture
  - react
  - node.js
  - express
  - postgresql
  - azure
  - PWA
  - tech stack
estimated_reading_time: 18
---

## Sources

| Source                          | URL                                                                                     | Notes                                                    |
|---------------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------|
| Vite Documentation              | <https://vitejs.dev/guide/>                                                             | Build tool: fast HMR, native ESM, Rollup-based bundling  |
| TanStack Query Overview         | <https://tanstack.com/query/latest/docs/framework/react/overview>                       | Server-state management: caching, deduplication, sync     |
| Prisma Quickstart               | <https://www.prisma.io/docs/getting-started/quickstart-sqlite>                          | Type-safe ORM with migration and schema-first workflow    |
| Azure App Service Overview      | <https://learn.microsoft.com/en-us/azure/app-service/overview>                          | Managed platform for Node.js apps, CI/CD, scaling         |
| Azure Database for PostgreSQL   | <https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/overview>           | Managed PostgreSQL with high availability                 |
| Azure Static Web Apps           | <https://learn.microsoft.com/en-us/azure/static-web-apps/overview>                      | Hosting for static frontends with integrated API support  |
| Vite PWA Plugin                 | <https://vite-pwa-org.netlify.app/>                                                     | Zero-config PWA support for Vite                          |
| Zustand GitHub                  | <https://github.com/pmndrs/zustand>                                                     | Lightweight state management for React                    |
| shadcn/ui                       | <https://ui.shadcn.com/>                                                                | Copy-paste component library built on Radix + Tailwind    |
| Zod Documentation               | <https://zod.dev/>                                                                      | TypeScript-first schema validation                        |
| Splitwise Features Research     | `.copilot-tracking/subagent/2026-02-16/splitwise-features-research.md`                  | PinxeSplit MVP feature spec and data model sketch          |

## 1. Project Structure

### Recommendation: Turborepo monorepo

A monorepo keeps the frontend, backend, and shared code in one repository. This simplifies dependency management, enables shared TypeScript types, and streamlines CI/CD for a personal-use app maintained by a single developer or small team.

```text
PinxeSplit/
├── apps/
│   ├── web/                          # React + Vite frontend (PWA)
│   │   ├── public/
│   │   │   ├── manifest.json         # PWA manifest
│   │   │   ├── icons/                # App icons (192x192, 512x512)
│   │   │   └── favicon.ico
│   │   ├── src/
│   │   │   ├── assets/               # Static assets (images, fonts)
│   │   │   ├── components/           # Shared UI components
│   │   │   │   └── ui/               # shadcn/ui primitives
│   │   │   ├── features/             # Feature-sliced modules
│   │   │   │   ├── auth/
│   │   │   │   ├── groups/
│   │   │   │   ├── expenses/
│   │   │   │   ├── balances/
│   │   │   │   └── settings/
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities, API client, constants
│   │   │   ├── routes/               # Route definitions
│   │   │   ├── stores/               # Zustand stores
│   │   │   ├── styles/               # Global styles, Tailwind config
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── api/                          # Node.js + Express backend
│       ├── src/
│       │   ├── routes/               # Express route definitions
│       │   │   ├── auth.routes.ts
│       │   │   ├── groups.routes.ts
│       │   │   ├── expenses.routes.ts
│       │   │   ├── balances.routes.ts
│       │   │   └── users.routes.ts
│       │   ├── controllers/          # Request handlers
│       │   ├── services/             # Business logic
│       │   ├── middleware/           # Auth, validation, error handling
│       │   ├── lib/                  # Utilities, debt simplification algo
│       │   ├── config/               # Environment and app configuration
│       │   ├── app.ts                # Express app setup
│       │   └── server.ts             # Server entry point
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   ├── migrations/           # Prisma migration files
│       │   └── seed.ts               # Seed data (currencies, categories)
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                       # Shared TypeScript types and utilities
│       ├── src/
│       │   ├── types/                # API request/response types, DTOs
│       │   ├── schemas/              # Shared Zod validation schemas
│       │   ├── constants/            # Currency codes, category enums
│       │   └── utils/                # Money arithmetic, rounding helpers
│       ├── tsconfig.json
│       └── package.json
│
├── infra/                            # Infrastructure as code
│   ├── bicep/                        # Azure Bicep templates
│   │   ├── main.bicep
│   │   ├── app-service.bicep
│   │   ├── postgresql.bicep
│   │   └── static-web-app.bicep
│   └── scripts/                      # Deployment helper scripts
│
├── .github/
│   └── workflows/                    # GitHub Actions CI/CD
│       ├── ci.yml
│       └── deploy.yml
│
├── turbo.json                        # Turborepo pipeline config
├── package.json                      # Root workspace config
├── tsconfig.base.json                # Shared TS compiler options
├── .env.example
└── README.md
```

### Rationale

* Turborepo provides fast incremental builds with caching, ideal for monorepos with shared packages.
* The `packages/shared` workspace eliminates type drift between frontend and backend.
* Feature-sliced frontend structure groups related components, hooks, and API calls by domain instead of by file type, improving navigability as the app grows.

## 2. Frontend Architecture

### 2.1 Build Tool: Vite

| Aspect         | Detail                                                                                 |
|----------------|----------------------------------------------------------------------------------------|
| Tool           | Vite 6.x with `@vitejs/plugin-react`                                                  |
| Template       | `npm create vite@latest web -- --template react-ts`                                    |
| Why            | Sub-second HMR, native ESM dev server, Rollup-based production builds, massive ecosystem |
| Alternatives   | Create React App is deprecated; Next.js adds SSR complexity unnecessary for a SPA PWA   |

### 2.2 State Management: Zustand + TanStack Query

| Layer          | Tool            | Purpose                                                              |
|----------------|-----------------|----------------------------------------------------------------------|
| Server state   | TanStack Query  | Fetch, cache, and synchronize API data; automatic background refetch |
| Client state   | Zustand         | Lightweight stores for UI state (modals, form state, theme)          |

TanStack Query handles 90% of state in a data-driven app. Zustand covers the remaining client-only state without the boilerplate overhead of Redux Toolkit. React Context is reserved for dependency injection (e.g., auth context) rather than global state.

### 2.3 Routing: React Router v7

React Router v7 (the successor to v6) provides type-safe route definitions, nested layouts, data loaders, and actions. Use file-based or config-based routing with lazy-loaded route components for code splitting.

```text
/                          → Dashboard (balances overview)
/login                     → Social login page
/groups                    → Group list
/groups/:groupId           → Group detail (expenses, balances)
/groups/:groupId/expenses/new  → Add expense form
/groups/:groupId/settle    → Settle up flow
/settings                  → User profile, currency preference
```

### 2.4 UI Framework: Tailwind CSS + shadcn/ui

| Layer       | Tool          | Reasoning                                                                        |
|-------------|---------------|----------------------------------------------------------------------------------|
| Styling     | Tailwind CSS 4 | Utility-first; no CSS-in-JS runtime cost; excellent mobile-first responsive utilities |
| Components  | shadcn/ui     | Copy-paste components built on Radix UI primitives; fully customizable, no vendor lock-in |

shadcn/ui components (Button, Dialog, Select, Card, Sheet, Tabs) provide accessible, mobile-friendly primitives that reduce custom UI work. Tailwind keeps the styling layer fast and consistent.

### 2.5 PWA Setup

| Aspect            | Tool / Config                    | Detail                                                                    |
|-------------------|----------------------------------|---------------------------------------------------------------------------|
| Plugin            | `vite-plugin-pwa`                | Generates service worker and manifest from Vite config                    |
| Service worker    | Workbox (via vite-plugin-pwa)    | Precaches app shell; runtime caches API responses with stale-while-revalidate |
| Manifest          | `public/manifest.json`           | `display: standalone`, theme color, icons (192px, 512px)                  |
| Caching strategy  | App shell: precache; API: stale-while-revalidate; images: cache-first    |                                     |
| Install prompt    | `beforeinstallprompt` event      | Custom "Add to Home Screen" banner                                        |

The `vite-plugin-pwa` plugin auto-generates the service worker from a declarative config in `vite.config.ts`, eliminating manual Workbox configuration. The app shell (HTML, CSS, JS) is precached for instant loads. API responses use stale-while-revalidate so the UI remains responsive while fresh data loads in the background.

```typescript
// vite.config.ts excerpt
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'PinxeSplit',
        short_name: 'PinxeSplit',
        description: 'Split expenses with friends',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 50 } },
          },
        ],
      },
    }),
  ],
});
```

### 2.6 API Communication: TanStack Query + fetch

| Tool           | Role                                                                                  |
|----------------|---------------------------------------------------------------------------------------|
| TanStack Query | Query/mutation hooks with caching, retries, optimistic updates, and background refetch |
| Native `fetch` | HTTP client wrapped in a thin `apiClient` utility (base URL, auth headers, error handling) |

Axios is unnecessary overhead; native `fetch` covers all needs. TanStack Query wraps `fetch` calls in `useQuery` / `useMutation` hooks that handle loading, error, and cache states.

```typescript
// lib/api-client.ts (simplified)
const API_BASE = import.meta.env.VITE_API_URL;

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}
```

## 3. Backend Architecture

### 3.1 Express Structure

Follow a layered architecture: routes > controllers > services > data access (Prisma).

```text
apps/api/src/
├── routes/          # Route definitions; maps HTTP verbs to controller methods
├── controllers/     # Parse request, call service, format response
├── services/        # Business logic (split calculation, debt simplification)
├── middleware/       # Auth guard, validation, error handler, rate limiter
├── lib/             # Utilities (money math, logger)
├── config/          # Environment variables, app constants
├── app.ts           # Express app factory (middleware registration, route mounting)
└── server.ts        # Starts the HTTP server
```

| Layer       | Responsibility                                                | Depends On   |
|-------------|---------------------------------------------------------------|--------------|
| Routes      | URL pattern, HTTP method, parameter extraction                | Controllers  |
| Controllers | Request parsing, input validation (Zod), response formatting  | Services     |
| Services    | Business rules, orchestration, computed fields                | Prisma Client |
| Middleware  | Cross-cutting: authentication, error handling, logging        | Config       |

### 3.2 ORM: Prisma

| Aspect          | Detail                                                                                |
|-----------------|---------------------------------------------------------------------------------------|
| Tool            | Prisma ORM 6.x                                                                       |
| Why             | Type-safe queries generated from schema, declarative migrations, visual studio (Prisma Studio) for debugging |
| Migration flow  | `prisma migrate dev` for local; `prisma migrate deploy` for CI/CD                     |
| Alternatives    | Drizzle (closer to SQL, less opinionated); Knex (query builder, no type generation)   |

Prisma generates a fully typed client from `schema.prisma`, eliminating runtime type mismatches between the app and the database. Its migration system tracks schema changes in version-controlled SQL files.

### 3.3 Authentication: Passport.js + JWT

| Component       | Detail                                                                                |
|-----------------|---------------------------------------------------------------------------------------|
| OAuth providers | Google (`passport-google-oauth20`), Apple (`passport-apple`)                          |
| Flow            | Authorization Code with PKCE; backend exchanges code for tokens                       |
| Session         | Stateless JWT issued by the backend; stored in `httpOnly` secure cookie or `Authorization` header |
| Token refresh   | Short-lived access token (15 min) + long-lived refresh token (7 days) stored in DB    |
| Middleware      | `authGuard` middleware validates JWT on every protected route                          |

Passport.js provides battle-tested OAuth strategies with minimal custom code. JWT keeps the backend stateless, avoiding session store infrastructure.

```typescript
// middleware/auth.ts (simplified)
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = payload as AuthPayload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### 3.4 API Design: RESTful with v1 Prefix

All endpoints are prefixed with `/api/v1` for future versioning flexibility.

| Method   | Endpoint                                  | Description                         |
|----------|-------------------------------------------|-------------------------------------|
| `POST`   | `/api/v1/auth/google`                     | Initiate Google OAuth               |
| `POST`   | `/api/v1/auth/apple`                      | Initiate Apple Sign In              |
| `POST`   | `/api/v1/auth/refresh`                    | Refresh access token                |
| `GET`    | `/api/v1/users/me`                        | Get current user profile            |
| `PATCH`  | `/api/v1/users/me`                        | Update profile / preferences        |
| `GET`    | `/api/v1/groups`                          | List user's groups                  |
| `POST`   | `/api/v1/groups`                          | Create a group                      |
| `GET`    | `/api/v1/groups/:id`                      | Get group detail                    |
| `PATCH`  | `/api/v1/groups/:id`                      | Update group                        |
| `DELETE` | `/api/v1/groups/:id`                      | Soft-delete group                   |
| `POST`   | `/api/v1/groups/:id/members`              | Add member to group                 |
| `DELETE` | `/api/v1/groups/:id/members/:userId`      | Remove member from group            |
| `GET`    | `/api/v1/groups/:id/expenses`             | List expenses in group              |
| `POST`   | `/api/v1/groups/:id/expenses`             | Create expense with splits          |
| `GET`    | `/api/v1/expenses/:id`                    | Get expense detail                  |
| `PATCH`  | `/api/v1/expenses/:id`                    | Update expense                      |
| `DELETE` | `/api/v1/expenses/:id`                    | Soft-delete expense                 |
| `GET`    | `/api/v1/groups/:id/balances`             | Get group balances (original + simplified) |
| `GET`    | `/api/v1/balances`                        | Get user's overall friend balances  |
| `POST`   | `/api/v1/groups/:id/settle`               | Record a settlement payment         |

### 3.5 Validation: Zod

| Aspect        | Detail                                                                                |
|---------------|---------------------------------------------------------------------------------------|
| Tool          | Zod 3.x                                                                              |
| Why           | TypeScript-first; schemas double as runtime validators and type generators            |
| Shared        | Validation schemas live in `packages/shared/src/schemas/` for frontend + backend reuse |
| Integration   | Express middleware parses `req.body` / `req.params` / `req.query` through Zod schemas |

Zod schemas are defined once in the shared package and imported by both the frontend (form validation) and backend (request validation). This eliminates duplicate validation logic.

```typescript
// packages/shared/src/schemas/expense.ts
import { z } from 'zod';

export const createExpenseSchema = z.object({
  description: z.string().min(1).max(255),
  cost: z.number().positive().multipleOf(0.01),
  currencyCode: z.string().length(3),
  date: z.string().datetime(),
  splits: z.array(z.object({
    userId: z.string().uuid(),
    paidShare: z.number().min(0).multipleOf(0.01),
    owedShare: z.number().min(0).multipleOf(0.01),
  })).min(1),
});
```

## 4. Database Schema Overview

The schema aligns with the data model defined in the [feature research](splitwise-features-research.md) (Section 4), formalized here as PostgreSQL DDL with indexes and constraints.

### 4.1 Prisma Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String    @id @default(uuid()) @db.Uuid
  authProvider    String    @map("auth_provider")
  authProviderId  String    @map("auth_provider_id")
  email           String    @unique
  firstName       String    @map("first_name")
  lastName        String?   @map("last_name")
  avatarUrl       String?   @map("avatar_url")
  defaultCurrency String    @default("USD") @map("default_currency") @db.VarChar(3)
  locale          String    @default("en") @db.VarChar(10)
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  groupMemberships GroupMember[]
  createdGroups    Group[]         @relation("GroupCreator")
  expenseSplits    ExpenseSplit[]
  createdExpenses  Expense[]       @relation("ExpenseCreator")
  updatedExpenses  Expense[]       @relation("ExpenseUpdater")
  refreshTokens    RefreshToken[]

  @@unique([authProvider, authProviderId])
  @@map("users")
}

model Group {
  id                String    @id @default(uuid()) @db.Uuid
  name              String    @db.VarChar(255)
  groupType         String?   @map("group_type") @db.VarChar(20)
  simplifyByDefault Boolean   @default(true) @map("simplify_by_default")
  createdById       String    @map("created_by") @db.Uuid
  createdBy         User      @relation("GroupCreator", fields: [createdById], references: [id])
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  deletedAt         DateTime? @map("deleted_at")

  members  GroupMember[]
  expenses Expense[]

  @@map("groups")
}

model GroupMember {
  id       String    @id @default(uuid()) @db.Uuid
  groupId  String    @map("group_id") @db.Uuid
  userId   String    @map("user_id") @db.Uuid
  joinedAt DateTime  @default(now()) @map("joined_at")
  leftAt   DateTime? @map("left_at")

  group Group @relation(fields: [groupId], references: [id])
  user  User  @relation(fields: [userId], references: [id])

  @@unique([groupId, userId])
  @@index([userId])
  @@map("group_members")
}

model Expense {
  id             String    @id @default(uuid()) @db.Uuid
  groupId        String?   @map("group_id") @db.Uuid
  description    String    @db.VarChar(255)
  notes          String?   @db.Text
  cost           Decimal   @db.Decimal(12, 2)
  currencyCode   String    @map("currency_code") @db.VarChar(3)
  date           DateTime  @db.Timestamptz()
  isPayment      Boolean   @default(false) @map("is_payment")
  repeatInterval String    @default("never") @map("repeat_interval") @db.VarChar(20)
  categoryId     Int?      @map("category_id")
  createdById    String    @map("created_by") @db.Uuid
  updatedById    String?   @map("updated_by") @db.Uuid
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  group    Group?        @relation(fields: [groupId], references: [id])
  currency Currency      @relation(fields: [currencyCode], references: [currencyCode])
  category Category?     @relation(fields: [categoryId], references: [id])
  creator  User          @relation("ExpenseCreator", fields: [createdById], references: [id])
  updater  User?         @relation("ExpenseUpdater", fields: [updatedById], references: [id])
  splits   ExpenseSplit[]

  @@index([groupId, deletedAt])
  @@index([createdById])
  @@index([date])
  @@map("expenses")
}

model ExpenseSplit {
  id        String  @id @default(uuid()) @db.Uuid
  expenseId String  @map("expense_id") @db.Uuid
  userId    String  @map("user_id") @db.Uuid
  paidShare Decimal @map("paid_share") @db.Decimal(12, 2)
  owedShare Decimal @map("owed_share") @db.Decimal(12, 2)

  expense Expense @relation(fields: [expenseId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([expenseId, userId])
  @@index([userId])
  @@map("expense_splits")
}

model Currency {
  currencyCode String @id @map("currency_code") @db.VarChar(3)
  name         String @db.VarChar(100)
  symbol       String @db.VarChar(10)

  expenses Expense[]

  @@map("currencies")
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String    @db.VarChar(100)
  parentId Int?      @map("parent_id")
  icon     String?   @db.VarChar(50)

  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  expenses Expense[]

  @@map("categories")
}

model RefreshToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
  @@map("refresh_tokens")
}
```

### 4.2 Key Indexes and Constraints

| Table            | Index / Constraint                          | Purpose                                                   |
|------------------|---------------------------------------------|-----------------------------------------------------------|
| `users`          | `UNIQUE (auth_provider, auth_provider_id)`  | Prevent duplicate OAuth registrations                     |
| `users`          | `UNIQUE (email)`                            | One account per email                                     |
| `group_members`  | `UNIQUE (group_id, user_id)`                | Prevent duplicate membership                              |
| `group_members`  | `INDEX (user_id)`                           | Fast lookup of a user's groups                            |
| `expenses`       | `INDEX (group_id, deleted_at)`              | Efficient group expense listing excluding soft-deletes    |
| `expenses`       | `INDEX (created_by)`                        | User's created expenses                                   |
| `expenses`       | `INDEX (date)`                              | Chronological sorting and date-range queries              |
| `expense_splits` | `UNIQUE (expense_id, user_id)`              | One split per user per expense                            |
| `expense_splits` | `INDEX (user_id)`                           | Fast balance aggregation per user                         |
| `refresh_tokens` | `UNIQUE (token)`                            | Token lookup for refresh flow                             |
| `refresh_tokens` | `INDEX (user_id)`                           | Revoke all tokens for a user                              |

### 4.3 Balance Computation Query

Balances are computed by aggregating `expense_splits` for non-deleted expenses. No materialized balance table is needed at this scale (~20 users).

```sql
-- Net balance per (user_pair, currency) within a group
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

## 5. Azure Deployment

### 5.1 Azure Services

| Component       | Azure Service                                   | Tier / SKU            | Notes                                                      |
|-----------------|-------------------------------------------------|-----------------------|------------------------------------------------------------|
| Frontend        | Azure Static Web Apps                           | Free tier             | Hosts Vite build output; global CDN, custom domain, HTTPS  |
| Backend API     | Azure App Service (Linux)                       | B1 (Basic)            | Runs Node.js/Express; sufficient for ~20 users              |
| Database        | Azure Database for PostgreSQL Flexible Server   | Burstable B1ms        | 1 vCore, 2 GB RAM; auto-backup; supports connection pooling |
| Secrets         | Azure Key Vault                                 | Standard              | Stores JWT secret, OAuth client secrets, DB connection string |
| DNS             | Azure DNS (optional)                            | Per zone              | Custom domain management                                    |
| Monitoring      | Application Insights                            | Free tier (5 GB/mo)   | Request tracing, error tracking, performance metrics         |

### Architecture Diagram

```text
┌─────────────┐     HTTPS      ┌────────────────────┐
│   Browser   │ ──────────────→│  Azure Static Web   │
│  (PWA)      │                │  Apps (React SPA)   │
└──────┬──────┘                └────────────────────┘
       │
       │  /api/v1/*
       ▼
┌────────────────────┐         ┌────────────────────┐
│  Azure App Service │ ───────→│  Azure Database for │
│  (Node.js/Express) │         │  PostgreSQL Flex    │
└────────┬───────────┘         └────────────────────┘
         │
         ▼
┌────────────────────┐
│  Azure Key Vault   │
│  (Secrets)         │
└────────────────────┘
```

### 5.2 CI/CD Approach: GitHub Actions

| Pipeline      | Trigger              | Steps                                                                  |
|---------------|----------------------|------------------------------------------------------------------------|
| CI            | Push to `main`, PRs  | Lint, type-check, unit tests, build frontend + backend                 |
| Deploy Staging | Push to `main`      | CI + deploy to staging slot on App Service + Static Web Apps preview   |
| Deploy Prod   | Manual approval or tag | Swap staging slot to production; run Prisma migrate deploy            |

```yaml
# .github/workflows/deploy.yml (simplified)
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx turbo build
      - name: Deploy API to App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: pinxesplit-api
          package: apps/api/dist
      - name: Deploy Web to Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          app_location: apps/web
          output_location: dist
```

### 5.3 Environment Configuration

| Variable              | Where                        | Description                                |
|-----------------------|------------------------------|--------------------------------------------|
| `DATABASE_URL`        | App Service → Key Vault ref  | PostgreSQL connection string               |
| `JWT_SECRET`          | App Service → Key Vault ref  | HMAC secret for signing JWTs               |
| `GOOGLE_CLIENT_ID`    | App Service → Key Vault ref  | Google OAuth client ID                     |
| `GOOGLE_CLIENT_SECRET`| App Service → Key Vault ref  | Google OAuth client secret                 |
| `APPLE_CLIENT_ID`     | App Service → Key Vault ref  | Apple Sign In services ID                  |
| `APPLE_TEAM_ID`       | App Service → Key Vault ref  | Apple Developer Team ID                    |
| `APPLE_KEY_ID`        | App Service → Key Vault ref  | Apple Sign In key ID                       |
| `APPLE_PRIVATE_KEY`   | App Service → Key Vault ref  | Apple Sign In private key                  |
| `VITE_API_URL`        | Static Web Apps env          | Backend API base URL                       |
| `NODE_ENV`            | App Service config           | `production`                               |
| `PORT`                | App Service config           | `8080` (App Service default)               |

All secrets are stored in Azure Key Vault and referenced by App Service via Key Vault references (`@Microsoft.KeyVault(...)`), keeping secrets out of application settings and source control.

## 6. Key Technical Decisions

| #  | Decision                        | Recommendation                             | Rationale                                                                      |
|----|---------------------------------|--------------------------------------------|--------------------------------------------------------------------------------|
| 1  | Monorepo vs multi-repo          | Turborepo monorepo                         | Shared types between frontend and backend; single CI pipeline for a solo project |
| 2  | Build tool                      | Vite 6.x                                   | Fastest dev server and build tool for React SPAs; CRA is deprecated             |
| 3  | State management                | Zustand + TanStack Query                   | TanStack Query handles server state; Zustand is minimal for remaining UI state  |
| 4  | Routing                         | React Router v7                            | De facto standard for React SPAs with type-safe routes and lazy loading         |
| 5  | UI framework                    | Tailwind CSS 4 + shadcn/ui                 | Maximum flexibility with zero runtime CSS cost; accessible, unstyled primitives |
| 6  | PWA tooling                     | vite-plugin-pwa (Workbox)                  | Zero-config PWA setup that integrates directly into the Vite build pipeline     |
| 7  | API client                      | Native `fetch` + TanStack Query            | No need for axios at this scale; fewer dependencies, smaller bundle             |
| 8  | ORM                             | Prisma 6.x                                 | Type-safe, schema-first with declarative migrations; best DX for PostgreSQL     |
| 9  | Auth strategy                   | Passport.js + stateless JWT                | Battle-tested OAuth strategies; stateless tokens avoid session store infra       |
| 10 | Validation                      | Zod                                        | TypeScript-native schemas shared between frontend and backend; infers types     |
| 11 | Backend framework               | Express                                    | Mature, minimal, massive middleware ecosystem; sufficient for a REST API         |
| 12 | Database                        | PostgreSQL (Azure Flexible Server)         | ACID transactions for financial data; `DECIMAL` type for money; managed hosting  |
| 13 | Frontend hosting                | Azure Static Web Apps                      | Free tier with global CDN, automatic HTTPS, GitHub Actions integration          |
| 14 | Backend hosting                 | Azure App Service (B1)                     | Managed Node.js hosting with deployment slots, auto-restart, and easy scaling   |
| 15 | Secrets management              | Azure Key Vault                            | Keeps credentials out of env vars and source control; auditable access           |
| 16 | CI/CD                           | GitHub Actions                             | Native integration with both GitHub and Azure deployment targets                |
| 17 | TypeScript everywhere           | Strict mode, shared `tsconfig.base.json`   | End-to-end type safety from database schema to React components                 |
| 18 | Money arithmetic                | `Decimal(12,2)` in DB; integer cents in app logic | Avoids floating-point rounding errors in financial calculations          |
| 19 | Soft deletes                    | `deleted_at` timestamp column              | Preserves audit trail and enables restore functionality                         |
| 20 | Debt simplification             | Greedy net-balance algorithm               | $O(n \log n)$ performance; correct for all group sizes PinxeSplit will encounter |
