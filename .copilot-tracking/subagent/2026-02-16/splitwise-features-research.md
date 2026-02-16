---
title: Splitwise Features Research for PinxeSplit MVP
description: Core Splitwise feature analysis, MVP prioritization, user stories, data model sketch, and backlog epics for the PinxeSplit PWA clone
author: Copilot Research Agent
ms.date: 2026-02-16
ms.topic: reference
keywords:
  - splitwise
  - pinxesplit
  - expense splitting
  - MVP backlog
  - feature research
estimated_reading_time: 20
---

## Sources

| Source                    | URL                                                                     | Notes                                                |
|---------------------------|-------------------------------------------------------------------------|------------------------------------------------------|
| Splitwise Homepage        | <https://www.splitwise.com>                                             | Official feature list (core vs. Pro)                 |
| Splitwise API Docs v3.0.0 | <https://dev.splitwise.com>                                             | OpenAPI spec: Users, Groups, Expenses, Notifications |
| Splitwise Blog            | <https://blog.splitwise.com/2012/09/14/debts-made-simple/>              | Debt simplification algorithm explanation            |
| Wikipedia                 | <https://en.wikipedia.org/wiki/Splitwise>                               | Company history and product overview                 |

## 1. Core Splitwise Features

### 1.1 Group Management

| Feature                  | Description                                                                                          |
|--------------------------|------------------------------------------------------------------------------------------------------|
| Create group             | Name, type (`home`, `trip`, `couple`, `other`), optional avatar/cover photo                          |
| Add members              | By user ID, email, or first/last name (creates placeholder accounts for non-users)                   |
| Remove members           | Blocked when the member carries a non-zero balance                                                   |
| Delete / restore group   | Soft-delete with cascading expense removal; restore reverses the delete                              |
| Simplify by default      | Per-group toggle that automatically reduces intra-group debts                                        |
| Group balances           | `original_debts` (raw) and `simplified_debts` (optimized) returned per group                         |
| Group types              | `home`, `trip`, `couple`, `apartment`, `house`, `other`                                              |

### 1.2 Expense Management

| Feature                  | Description                                                                                          |
|--------------------------|------------------------------------------------------------------------------------------------------|
| Add expense              | Cost, description, date, currency, category, group, notes/details                                    |
| Edit expense             | Partial updates; re-supplying user shares overwrites all shares                                      |
| Delete / restore expense | Soft-delete with restore capability                                                                  |
| Categories               | Hierarchical: parent categories with subcategories (e.g., Utilities > Electricity, Cleaning)         |
| Receipt/photo            | Attachment field on expense (`receipt` object); Pro: receipt scanning                                 |
| Notes/details            | Free-text `details` field on every expense                                                           |
| Recurring expenses       | `repeat_interval`: `never`, `weekly`, `fortnightly`, `monthly`, `yearly`                             |
| Comments                 | Threaded comments per expense; system-generated comments track edits                                 |
| Expense bundles          | `expense_bundle_id` groups related expenses                                                          |
| Transaction import       | Pro feature: import from bank statements                                                             |

### 1.3 Split Types

Splitwise models splits through `paid_share` and `owed_share` per user per expense, enabling all split modes:

| Split Type              | How It Works                                                                                         |
|-------------------------|------------------------------------------------------------------------------------------------------|
| Equal                   | `split_equally: true` with `group_id`; system divides cost evenly among group members                |
| Unequal by exact amount | Each user's `owed_share` set to specific dollar amounts summing to cost                              |
| By percentage           | Client calculates `owed_share` from percentage; API stores absolute amounts                          |
| By shares               | Client converts share ratios to `owed_share` amounts; API stores absolute amounts                    |
| Itemized (Pro)          | Line-item allocation with receipt scanning; broken into per-user owed shares                         |
| Multiple payers          | Multiple users can have non-zero `paid_share` on a single expense                                   |

### 1.4 Balances and Settlements

| Feature                    | Description                                                                                       |
|----------------------------|---------------------------------------------------------------------------------------------------|
| Per-friend balance         | Aggregated across all groups; multi-currency (array of `{currency_code, amount}`)                 |
| Per-group balance          | Each member sees net balance within the group                                                     |
| Per-group-per-friend       | Friends list includes per-group breakdowns                                                        |
| Settle up (record payment) | Created as an expense with `payment: true` and `transaction_confirmed` flag                       |
| Debt simplification        | Three modes: within a group (automatic toggle), between two people, global across all friends     |
| Simplification rules       | (1) Net amounts unchanged (2) No new creditor relationships created (3) No one owes more in total |
| Payment integrations       | Venmo, PayPal, Tink bank transfers (region-dependent)                                             |

### 1.5 Activity Feed and History

| Feature              | Description                                                                         |
|----------------------|-------------------------------------------------------------------------------------|
| Notifications list   | Paginated, filterable by `updated_after`; includes HTML-rendered content             |
| Notification types   | 16 types: expense CRUD, comments, group changes, friend changes, debt simplification |
| Expense comments     | Per-expense comment thread; system comments log every edit                           |
| Audit trail          | `created_by`, `updated_by`, `deleted_by` on every expense with timestamps           |

### 1.6 Notifications

| Channel | Details                                                                 |
|---------|-------------------------------------------------------------------------|
| Push    | Mobile push notifications for expense/group/friend events               |
| Email   | Per-expense email reminders; configurable `email_reminder_in_advance`   |
| In-app  | Badge count (`notifications_count`) and `notifications_read` timestamp  |

### 1.7 Currency Handling

| Feature               | Description                                                              |
|-----------------------|--------------------------------------------------------------------------|
| 100+ currencies       | Mostly ISO 4217 codes plus colloquial codes (e.g., BTC)                  |
| Default currency      | Per-user `default_currency` setting                                      |
| Per-expense currency  | Each expense carries its own `currency_code`                             |
| Currency conversion   | Pro feature; notification types 14/15 indicate conversion events         |
| Multi-currency balance | Balances returned as arrays of `{currency_code, amount}` pairs          |

### 1.8 User Profile and Settings

| Feature                | Description                                                             |
|------------------------|-------------------------------------------------------------------------|
| Profile fields         | First name, last name, email, profile picture (small/medium/large)      |
| Registration status    | `confirmed` or invitation-pending                                       |
| Locale                 | Language setting (`en`, etc.); 7+ languages supported                   |
| Default currency       | User-level default applied to new expenses                              |
| Password management    | Update via API                                                          |
| Notification prefs     | `added_as_friend` toggle; extensible notification preferences object    |

### 1.9 Pro-Only Features (for reference)

* Receipt scanning and OCR
* Itemized splits
* Charts and graphs (spending analytics)
* Expense search
* Save default splits
* Currency conversion
* Transaction import
* Ad-free experience

## 2. MVP Feature Prioritization

### Priority Definitions

| Priority | Label         | Criteria                                                                |
|----------|---------------|-------------------------------------------------------------------------|
| P0       | Essential     | MVP cannot ship without it; core value proposition                      |
| P1       | Nice-to-have  | Enhances UX significantly; can follow shortly after launch              |
| P2       | Defer-to-later | Valuable but not blocking; ship in a future iteration                  |

### P0: Essential (MVP launch blockers)

| Feature Area          | Feature                                    | Justification                                                                    |
|-----------------------|--------------------------------------------|----------------------------------------------------------------------------------|
| Auth                  | Social login (Google, Apple)               | Required per spec; removes friction for ~20 personal users                       |
| Auth                  | User profile (name, avatar, default currency) | Identity foundation for all other features                                    |
| Groups                | Create / edit / delete group               | Core organizational unit for shared expenses                                     |
| Groups                | Add / remove members                       | Groups are useless without member management                                     |
| Expenses              | Add / edit / delete expense                | Primary value proposition of the entire app                                      |
| Expenses              | Date, description, notes, currency         | Minimum metadata for a useful expense record                                     |
| Splits                | Equal split                                | Most common use case (~80% of Splitwise usage)                                   |
| Splits                | Unequal by exact amount                    | Required per spec; common for varied orders at restaurants                        |
| Splits                | By percentage                              | Required per spec; needed for income-proportional sharing                         |
| Splits                | By shares                                  | Required per spec; simplest way to express ratios                                |
| Balances              | Per-group and per-friend balance views     | Users must see what they owe / are owed at a glance                              |
| Settlements           | Settle up (record payment)                 | Closing the loop is essential; without it debts accumulate forever                |
| Debt simplification   | Minimize transactions algorithm            | Required per spec; the key differentiator over a simple spreadsheet              |
| Currency              | Multi-currency expenses                    | Required per spec; friend group spans multiple countries                          |
| Currency              | Per-user default currency                  | Reduces friction on every expense entry                                          |
| PWA                   | Installable PWA shell                      | Required per spec; must work on mobile without app stores                        |
| PWA                   | Responsive mobile-first UI                 | Primary access mode for ~20 personal users                                       |

### P1: Nice-to-Have (fast follow)

| Feature Area          | Feature                                    | Justification                                                                    |
|-----------------------|--------------------------------------------|----------------------------------------------------------------------------------|
| Expenses              | Expense categories                         | Helps organize and filter; not blocking core flow                                |
| Expenses              | Recurring expenses                         | Useful for rent/utilities but adds scheduling complexity                          |
| Activity              | Activity feed / history                    | Transparency into who changed what; important for trust but not launch-blocking  |
| Notifications         | Push notifications (web push)              | Keeps users informed; PWA supports it but adds service worker complexity          |
| Notifications         | Email notifications                        | Secondary channel for engagement; needs email infrastructure                     |
| Expenses              | Comments on expenses                       | Useful for clarification; not core splitting functionality                       |
| Currency              | Live exchange rate display                 | Helps context but balances can be tracked in original currency without it         |
| Groups                | Group types / avatars                      | Polish and personalization; does not affect core logic                            |
| Splits                | Multiple payers per expense                | Edge case (e.g., two people split the upfront payment); adds UI complexity       |

### P2: Defer-to-Later

| Feature Area          | Feature                                    | Justification                                                                    |
|-----------------------|--------------------------------------------|----------------------------------------------------------------------------------|
| Expenses              | Receipt photo upload                       | Nice for record-keeping; adds storage infrastructure cost                        |
| Expenses              | Receipt scanning / OCR                     | Significant ML/API integration effort for a ~20 user app                         |
| Splits                | Itemized splits                            | Complex UX; by-amount split covers most cases                                    |
| Analytics             | Charts, graphs, spending totals            | Power-user feature; overkill for MVP                                             |
| Expenses              | Expense search                             | Useful at scale; ~20 users won't generate enough data to need it immediately     |
| Expenses              | Transaction import                         | Bank API integration is heavy; out of scope for personal use                     |
| Expenses              | Save default splits                        | Convenience optimization; can be added after usage patterns emerge               |
| PWA                   | Full offline mode with sync                | PWA can cache shell; full offline expense creation needs conflict resolution     |
| Integrations          | Payment gateway (Venmo, PayPal)            | External API dependency; "record payment" is sufficient for small group          |
| Auth                  | Invite links / deep links                  | Helpful for onboarding but manual addition works for ~20 users                   |

## 3. User Stories for P0 Features

### 3.1 Authentication

**US-AUTH-01**: As a user, I want to sign in with my Google or Apple account so that I can start using the app without creating a new password.

* Acceptance criteria:
  * "Sign in with Google" button initiates OAuth 2.0 PKCE flow
  * "Sign in with Apple" button initiates Apple Sign-In flow
  * First sign-in creates a user profile with name and email from the identity provider
  * Subsequent sign-ins restore the existing session
  * Invalid or expired tokens redirect to the sign-in screen

**US-AUTH-02**: As a user, I want to set my display name, avatar, and default currency so that my identity and preferences are reflected across the app.

* Acceptance criteria:
  * Profile settings page allows editing first name, last name, and avatar URL
  * Default currency is selectable from a dropdown of supported currencies
  * Changes persist immediately and reflect on all group member lists

### 3.2 Group Management

**US-GRP-01**: As a user, I want to create a group with a name so that I can organize shared expenses with specific people.

* Acceptance criteria:
  * Group requires a non-empty name
  * Creator is automatically added as a member
  * Group appears in the creator's group list immediately

**US-GRP-02**: As a group member, I want to add other users to my group so that they can participate in shared expenses.

* Acceptance criteria:
  * Members can be added by email address
  * If the email matches an existing user, they are linked; otherwise a placeholder is created
  * Added members see the group in their group list

**US-GRP-03**: As a group member, I want to remove a member from a group so that former participants no longer appear.

* Acceptance criteria:
  * Removal is blocked if the member has a non-zero balance
  * Removal succeeds only if the member's balance is settled
  * Removed member no longer sees the group

**US-GRP-04**: As a group creator, I want to edit or delete a group so that I can correct mistakes or clean up unused groups.

* Acceptance criteria:
  * Group name is editable
  * Deleting a group soft-deletes it and all associated expenses
  * Deleted groups can be restored (stretch goal, can defer)

### 3.3 Expense Management

**US-EXP-01**: As a group member, I want to add an expense with a description, amount, date, and currency so that the cost is recorded and split among participants.

* Acceptance criteria:
  * Required fields: description, amount (positive decimal, 2 decimal places), date
  * Currency defaults to the user's default currency; can be overridden per expense
  * Expense appears in the group's expense list after creation

**US-EXP-02**: As a group member, I want to edit an existing expense so that I can correct errors.

* Acceptance criteria:
  * All fields (description, amount, date, currency, splits) are editable
  * Editing recalculates affected balances
  * Edit is recorded with `updated_by` and `updated_at`

**US-EXP-03**: As a group member, I want to delete an expense so that erroneous entries are removed.

* Acceptance criteria:
  * Soft-delete removes the expense from balance calculations
  * Balances update immediately after deletion

### 3.4 Split Types

**US-SPL-01**: As a payer, I want to split an expense equally among all group members so that everyone pays the same share.

* Acceptance criteria:
  * Selecting "split equally" divides the total cost by the number of participants
  * Remainder cents are distributed to the first N participants (deterministic rounding)
  * Each participant's `owed_share` is displayed before confirmation

**US-SPL-02**: As a payer, I want to split an expense by exact amounts so that each person is charged precisely what they consumed.

* Acceptance criteria:
  * UI provides per-person amount input fields
  * Validation ensures the sum of all amounts equals the total expense cost
  * Error message displays if amounts do not sum correctly

**US-SPL-03**: As a payer, I want to split an expense by percentages so that costs reflect proportional contributions.

* Acceptance criteria:
  * UI provides per-person percentage input fields
  * Validation ensures percentages sum to 100%
  * Computed amounts (from percentages) are shown before confirmation

**US-SPL-04**: As a payer, I want to split an expense by shares so that I can express ratios without calculating exact amounts.

* Acceptance criteria:
  * UI provides per-person share count input (positive integers)
  * System calculates each person's `owed_share` as `(shares / total_shares) * cost`
  * Computed amounts are shown before confirmation

### 3.5 Balances and Settlements

**US-BAL-01**: As a user, I want to view my overall balance with each friend so that I know at a glance who owes whom.

* Acceptance criteria:
  * Dashboard shows a list of friends with net balance per currency
  * Positive amounts indicate money owed to the user; negative indicates money the user owes
  * Tapping a friend shows the per-group breakdown

**US-BAL-02**: As a group member, I want to view the group's balance summary so that I can see all debts within the group.

* Acceptance criteria:
  * Group detail page shows each member's net balance
  * Both "original debts" and "simplified debts" views are available when simplification is enabled
  * Balances update in real time after expense changes

**US-BAL-03**: As a user, I want to record a payment to settle a debt so that the balance reflects the repayment.

* Acceptance criteria:
  * "Settle up" creates a payment record (expense with `payment: true`)
  * User selects the recipient and enters the amount
  * Balance between the two users reduces by the payment amount
  * Payment appears in the group/friend activity

**US-BAL-04**: As a group member, I want debts within the group to be simplified automatically so that the fewest possible payments are needed.

* Acceptance criteria:
  * When enabled, the system computes the minimum set of transactions to settle all group debts
  * Net amounts remain identical before and after simplification
  * No new creditor/debtor relationships are introduced that did not exist before
  * Simplified debts are displayed alongside original debts

### 3.6 Multi-Currency Support

**US-CUR-01**: As a user, I want to create expenses in different currencies so that international costs are tracked accurately.

* Acceptance criteria:
  * Currency picker shows all supported currencies (100+ ISO 4217 codes)
  * Each expense stores its own `currency_code`
  * Balances are maintained per currency (no forced conversion)

**US-CUR-02**: As a user, I want to see my balances broken down by currency so that I know exactly what I owe in each denomination.

* Acceptance criteria:
  * Balance displays show an array of `{currency, amount}` pairs
  * Currencies with zero balance are hidden

### 3.7 PWA Shell

**US-PWA-01**: As a user, I want to install PinxeSplit on my phone's home screen so that it feels like a native app.

* Acceptance criteria:
  * Valid `manifest.json` with app name, icons, theme color, and `display: standalone`
  * Service worker registered for asset caching
  * "Add to Home Screen" prompt appears on supported browsers

**US-PWA-02**: As a user, I want the app to load quickly on mobile so that I can add expenses on the go.

* Acceptance criteria:
  * App shell loads in under 2 seconds on a 3G connection (after install)
  * Critical CSS is inlined; JavaScript is code-split

## 4. Data Model Sketch

### Entity Relationship Overview

```text
User ──< GroupMember >── Group
 │                         │
 │                         │
 ├──< Expense >────────────┘
 │       │
 │       ├──< ExpenseSplit
 │       │
 │       └──< Comment
 │
 └──< Payment (specialized Expense)

Currency (reference table)
Category (reference table, hierarchical)
```

### Entity Definitions

#### User

| Field              | Type         | Notes                                              |
|--------------------|--------------|----------------------------------------------------|
| `id`               | UUID (PK)    | Internal identifier                                |
| `auth_provider`    | enum         | `google`, `apple`                                  |
| `auth_provider_id` | string       | External OAuth subject ID                          |
| `email`            | string (unique) | From OAuth provider                             |
| `first_name`       | string       |                                                    |
| `last_name`        | string       |                                                    |
| `avatar_url`       | string (nullable) |                                                |
| `default_currency` | string (FK)  | ISO 4217 code, default `USD`                       |
| `locale`           | string       | Default `en`                                       |
| `created_at`       | timestamp    |                                                    |
| `updated_at`       | timestamp    |                                                    |

#### Group

| Field                  | Type            | Notes                                         |
|------------------------|-----------------|-----------------------------------------------|
| `id`                   | UUID (PK)       |                                               |
| `name`                 | string          |                                               |
| `group_type`           | enum (nullable) | `home`, `trip`, `couple`, `other`             |
| `simplify_by_default`  | boolean         | Default `true`                                |
| `created_by`           | UUID (FK→User)  |                                               |
| `created_at`           | timestamp       |                                               |
| `updated_at`           | timestamp       |                                               |
| `deleted_at`           | timestamp (nullable) | Soft delete                              |

#### GroupMember

| Field        | Type           | Notes                     |
|--------------|----------------|---------------------------|
| `id`         | UUID (PK)      |                           |
| `group_id`   | UUID (FK→Group) |                          |
| `user_id`    | UUID (FK→User)  |                          |
| `joined_at`  | timestamp      |                           |
| `left_at`    | timestamp (nullable) | Null if still active |

Unique constraint on `(group_id, user_id)` where `left_at IS NULL`.

#### Expense

| Field              | Type                | Notes                                               |
|--------------------|---------------------|-----------------------------------------------------|
| `id`               | UUID (PK)           |                                                     |
| `group_id`         | UUID (FK→Group, nullable) | Null for non-group expenses                   |
| `description`      | string              |                                                     |
| `notes`            | text (nullable)     | Free-text details                                   |
| `cost`             | decimal(12,2)       | Total cost                                          |
| `currency_code`    | string (FK→Currency) |                                                    |
| `date`             | timestamp           | When the expense occurred                           |
| `is_payment`       | boolean             | `true` for settle-up records                        |
| `repeat_interval`  | enum                | `never`, `weekly`, `fortnightly`, `monthly`, `yearly` |
| `category_id`      | integer (FK→Category, nullable) |                                         |
| `created_by`       | UUID (FK→User)      |                                                     |
| `updated_by`       | UUID (FK→User, nullable) |                                                |
| `created_at`       | timestamp           |                                                     |
| `updated_at`       | timestamp           |                                                     |
| `deleted_at`       | timestamp (nullable) | Soft delete                                        |

#### ExpenseSplit

| Field          | Type              | Notes                                                   |
|----------------|-------------------|---------------------------------------------------------|
| `id`           | UUID (PK)         |                                                         |
| `expense_id`   | UUID (FK→Expense) |                                                         |
| `user_id`      | UUID (FK→User)    |                                                         |
| `paid_share`   | decimal(12,2)     | How much this user paid toward the expense              |
| `owed_share`   | decimal(12,2)     | How much this user owes for the expense                 |

`net_balance` is computed: `paid_share - owed_share`. Positive means the user is owed money; negative means the user owes.

Constraint: `SUM(paid_share)` across all splits = `expense.cost`. `SUM(owed_share)` across all splits = `expense.cost`.

#### Payment

Payments are modeled as Expense records with `is_payment = true`. The `ExpenseSplit` for a payment has exactly two rows: the payer (`paid_share = amount`, `owed_share = 0`) and the recipient (`paid_share = 0`, `owed_share = amount`).

#### Currency

| Field           | Type         | Notes                    |
|-----------------|--------------|--------------------------|
| `currency_code` | string (PK)  | ISO 4217 (e.g., `USD`)  |
| `unit`          | string       | Display symbol (e.g., `$`) |

Seeded reference table. ~150 rows.

#### Category

| Field        | Type              | Notes                                 |
|--------------|-------------------|---------------------------------------|
| `id`         | integer (PK)      |                                       |
| `name`       | string            | e.g., "Utilities", "Electricity"      |
| `parent_id`  | integer (FK→Category, nullable) | Null for top-level categories |
| `icon`       | string (nullable) | Icon identifier                       |

Seeded reference table. Hierarchical (parent/child).

### Key Relationships Summary

1. A User belongs to many Groups through GroupMember.
2. A Group has many Expenses.
3. An Expense has many ExpenseSplits (one per participant).
4. An Expense can be a Payment (`is_payment = true`).
5. Balances are computed by aggregating `net_balance` across ExpenseSplits, grouped by user pair and currency.
6. Debt simplification operates on the computed balance graph to minimize edges.

## 5. MVP Backlog Epics

Ordered by implementation dependency (each epic can depend on earlier epics but not later ones).

### Epic 1: Project Foundation and PWA Shell

Set up the monorepo/project, CI/CD pipeline, PWA manifest, service worker, responsive layout shell, and design system tokens.

* Depends on: nothing
* Enables: all subsequent epics

### Epic 2: Authentication and User Management

Implement Google and Apple social login via OAuth 2.0 / OIDC, user profile CRUD, default currency preference, and session management.

* Depends on: Epic 1
* Enables: Epics 3-9 (all features require authenticated users)

### Epic 3: Currency Reference Data

Seed the Currency and Category reference tables. Build the currency picker component. Establish the decimal arithmetic utilities for safe money calculations.

* Depends on: Epic 1
* Enables: Epics 4-7 (expenses and balances need currency support)

### Epic 4: Group Management

Create/edit/delete groups, add/remove members, group list view, group detail view. Enforce the "cannot remove member with non-zero balance" constraint.

* Depends on: Epics 2, 3
* Enables: Epics 5-7 (expenses and balances are group-scoped)

### Epic 5: Expense CRUD and Split Engine

Add/edit/delete expenses with all four split types (equal, by amount, by percentage, by shares). Build the split calculator UI component and the backend validation (shares sum to cost). Store `paid_share` and `owed_share` per participant.

* Depends on: Epics 2, 3, 4
* Enables: Epics 6, 7

### Epic 6: Balance Computation and Display

Aggregate ExpenseSplits into per-friend and per-group balance views. Display multi-currency balances. Build the dashboard summary (who owes whom, net balances).

* Depends on: Epic 5
* Enables: Epics 7, 8

### Epic 7: Settle Up and Debt Simplification

Record payment flow ("settle up" creates a payment expense). Implement the debt simplification algorithm (min-cost flow or greedy net-balance approach) that minimizes the number of transactions within a group.

* Depends on: Epics 5, 6
* Enables: Epic 8 (activity feed shows settlements)

### Epic 8: Activity Feed and Audit Trail

Display chronological list of expense additions, edits, deletions, and settlements per group and globally. Show `created_by`/`updated_by` metadata. System-generated change descriptions.

* Depends on: Epics 5, 6, 7
* Enables: Epic 9

### Epic 9: Polish, Testing, and PWA Optimization

End-to-end testing, accessibility audit, performance optimization (code splitting, asset caching), app store screenshots, and final PWA manifest validation. Lighthouse score targets.

* Depends on: Epics 1-8
* Enables: launch

## 6. Debt Simplification Algorithm Notes

The core Splitwise simplification algorithm follows these rules (from their blog post):

1. Everyone owes the same net amount after simplification.
2. No one owes a person they did not owe before.
3. No one owes more money in total than before simplification.

For PinxeSplit MVP, the recommended approach:

1. Compute net balances per user within a group (sum of all `paid_share - owed_share` per currency).
2. Partition users into creditors (positive net) and debtors (negative net).
3. Greedily match the largest debtor to the largest creditor, settling the minimum of the two amounts.
4. Repeat until all balances are zero.

This greedy approach minimizes the number of transactions and runs in $O(n \log n)$ time, sufficient for groups of ~20 users. For multi-currency groups, run the algorithm independently per currency.
