# Phase 1 — Enterprise Technical Audit

**Audit scope:** read-only review of the existing workspace  
**Evidence basis:** source, configuration, SQL draft, package manifests, and the local datastore structure; static security review  
**Important constraint:** this workspace is a Vite/React + Express application, not a Next.js project.
**Baseline note:** findings describe the code as audited; subsequent user-approved fixes are summarized at the end.

## Executive summary

The project already contains a useful foundation for a multi-tenant restaurant product: tenant and branch administration, staff, role/permission data, public storefront ordering, POS, KDS, shifts, and audit-log views. POS, KDS, and storefront routes are separated in the client. The application is not yet a production-grade SaaS backend: the server persists business data by synchronously rewriting one local JSON file, tenant and user data is seeded into that store, payment and many ERP functions are simulated, and authorization is inconsistent across API routes.

The most urgent confirmed risks are known default credentials in the fresh-store seed, a source-known fallback JWT signing secret, and an authenticated offline-sync endpoint that accepts caller-controlled paid-order financial data without the normal order-creation permission. Other confirmed gaps include missing tenant/permission checks on kitchen item updates and missing menu-management permission on availability changes. These findings are documented with file/line evidence in section G.

The existing PostgreSQL schema is a useful design draft, not an active database implementation. A staged transition should first establish secure authentication and consistent API authorization, then introduce PostgreSQL and migrate the JSON datastore with rehearsed reconciliation and rollback. Preserve the existing POS, KDS, storefront, enterprise, and static assets during that work; retire or reconnect legacy/demo screens deliberately rather than deleting them.

## A. Current architecture

```text
┌──────────────────────────────────────────────────────────────┐
│ Browser / Electron desktop shell                             │
│ React 19 + TypeScript + Vite SPA                             │
│ Routes: ERP (default), /pos, /kds, /store/:slug              │
│ localStorage: bearer JWT; POS offline order queue            │
└──────────────────────────┬───────────────────────────────────┘
                           │ same-origin API (HTTP(S); TLS depends on deployment)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ One Node.js process                                           │
│ Express 4 · global bearer-token middleware · REST routes     │
│ Serves Vite production output from the same process           │
└──────────────────────────┬───────────────────────────────────┘
                           │ synchronous reads / rewrites
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ Custom in-memory DataStore loaded from data/eros_data.json    │
│ JSON serialization; no database driver, ORM, or migrations   │
└──────────────────────────────────────────────────────────────┘

Electron POS and KDS ── load the configured remote server URL ──┘
                       (no local application API or Tauri layer)
```

The server entry point and mounted APIs are in [`server.ts`](../server.ts#L1). Client path selection is implemented in [`src/App.tsx`](../src/App.tsx#L26). File-backed persistence is implemented in [`server/db/store.ts`](../server/db/store.ts#L226). The aspirational cloud-native architecture in [`docs/SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md) does not match the deployed implementation: PostgreSQL, Redis, WebSockets, API gateway, and multiple apps/packages are not present in the current runtime.

### Routing and navigation

- `/pos`, `/kds`, and `/store/:slug` are selected from `window.location.pathname`; ERP is the default route.
- ERP screens are selected through client-side view state. There is no React Router dependency or route-per-ERP-view deep-linking.
- Authentication and view/role visibility are handled by [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) and [`src/access/roleAccess.ts`](../src/access/roleAccess.ts).
- The Express API mounts auth, tenants, branches, users, audit logs, orders, menu, and shifts under `/api/v1`.
- The ERP client hides views according to role/permission, but that is not a substitute for API authorization; the security findings below show several route-level gaps.

## B. Existing feature inventory

Status means **implemented** in the current app, not independently verified in a live deployment.

| Area | Present in source | Limits / not established |
|---|---|---|
| Tenant administration | Platform-admin tenant list, onboarding, status/tier changes; tenant records have branding fields | No self-serve signup, recurring billing, payment processor, subscription lifecycle, or enforced feature entitlements |
| Branches | Tenant-scoped branch listing, create/update, capacity values | No branch-scoped authorization consistently applied to all data operations |
| Staff and access | Staff listing/creation, PIN updates, role and permission arrays; client-side role-specific ERP views | RBAC is custom/in-memory and not uniformly enforced at APIs; default credentials exist |
| Menu/catalog | Menu read and availability API; seeded categories/items, variants/modifier-related data | No complete authenticated catalog CRUD workflow, price/version history, or reliable stock/inventory ledger |
| Public storefront | Tenant slug storefront, menu display/customization, public order creation, order tracking | Public checkout accepts client-supplied prices and has no demonstrated gateway, fraud, or rate-limit integration |
| Orders | Authenticated order creation/listing, order types/channels, notes/modifiers, offline-sync route, audit event creation | No demonstrated edit/void/refund/return lifecycle or server-authoritative payment settlement |
| POS | Touch terminal, cart, customer/order details, discounts/tax calculations, shift gate, hold/resume in component state, offline queue, browser print | Held tickets are not durable; terminal code is fixed; payments are not connected to a processor; printing is browser print, not confirmed thermal hardware integration |
| Cash and shifts | Open/close shifts, opening cash, cash movements, shift history/summary | No cash-drawer integration; reconciliation/reporting depth and cashier-performance analytics are limited |
| KDS | Station columns, order/item statuses, sound, fullscreen affordance, polling | Polls every four seconds; no WebSocket/SSE; API status controls lack uniform permission enforcement |
| Audit | Audit-log API and ERP compliance view | No evidence of immutable/append-only storage or complete event coverage for all mutations |
| ERP/analytics | Operator console, tenant/branch/staff administration, audit screen | Executive values and channel/trend values include seeded/static data; some controls change local UI state only |
| Inventory/accounting | Schema draft contains inventory and accounting concepts | No corresponding complete runtime API/workflow for stock ledger, recipes, purchasing, general ledger, or journal posting |
| CRM/loyalty/promotions | Some presentation/data structures and UI concepts | No demonstrated persistent customer CRM, loyalty wallet/points engine, coupon engine, or live campaign provider |
| Desktop | Separate Electron POS/KDS Windows packaging configuration; server URL setup; context-isolated preload | These are remote web clients, not Tauri apps; native printers, scanners, drawers, and offline database/sync are not implemented |

The actual mounted screens are wired in [`src/App.tsx`](../src/App.tsx#L146). Several additional views exist but are not mounted by the current application shell: `EnterpriseLanding`, `SaasPlatformView`, `MerchantPortal`, and `StorefrontModal`. The actual slug-based storefront is `DynamicStorefrontPage`; the separate `StorefrontModal` is a legacy/demo implementation. Keep this distinction clear when assessing feature readiness.

## C. Existing project folder structure

Generated/dependency output such as `node_modules`, `dist`, and `release` is omitted below. Files and folders present in the workspace at audit time:

```text
.
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── README.md
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── test-server.ts
├── tsconfig.json
├── vite.config.ts
├── data/
│   └── eros_data.json
├── desktop/
│   ├── electron-builder.kds.json
│   ├── electron-builder.pos.json
│   └── app/
│       ├── kds.cjs
│       ├── main.cjs
│       ├── package.json
│       ├── pos.cjs
│       ├── preload.cjs
│       └── server-settings.html
├── docs/
│   ├── DATABASE_SCHEMA.sql
│   └── SYSTEM_ARCHITECTURE.md
├── public/
│   ├── manifest-kds.json
│   └── manifest-pos.json
├── server/
│   ├── db/
│   │   └── store.ts
│   ├── middleware/
│   │   └── auth.ts
│   └── routes/
│       ├── audit.routes.ts
│       ├── auth.routes.ts
│       ├── branch.routes.ts
│       ├── menu.routes.ts
│       ├── order.routes.ts
│       ├── shift.routes.ts
│       ├── tenant.routes.ts
│       └── user.routes.ts
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── access/
    │   └── roleAccess.ts
    ├── assets/images/
    │   ├── food_bbq_platter_1793901968953.jpg
    │   ├── food_karachi_biryani_1793901970187.jpg
    │   ├── food_karahi_handi_1793901969642.jpg
    │   └── hero_mehmaan_dining_1793901968860.jpg
    ├── components/
    │   ├── AboutAndStory.tsx
    │   ├── CartDrawer.tsx
    │   ├── Footer.tsx
    │   ├── Hero.tsx
    │   ├── InteractiveMenu.tsx
    │   ├── LocationAndDirections.tsx
    │   ├── Navbar.tsx
    │   ├── ReservationModal.tsx
    │   ├── ReviewsSection.tsx
    │   ├── SendToPhoneModal.tsx
    │   ├── ServicePillars.tsx
    │   ├── ShareModal.tsx
    │   ├── enterprise/
    │   │   ├── AuditComplianceView.tsx
    │   │   ├── EnterpriseLanding.tsx
    │   │   ├── EnterpriseNavbar.tsx
    │   │   ├── GoLiveSetupModal.tsx
    │   │   ├── OperatorConsole.tsx
    │   │   ├── StorefrontModal.tsx
    │   │   └── TerminalPairingView.tsx
    │   ├── indolj/
    │   │   ├── CommissionCalculator.tsx
    │   │   ├── IndoljNavbar.tsx
    │   │   ├── LiveOrderTrackerModal.tsx
    │   │   ├── MerchantPortal.tsx
    │   │   ├── ProductCustomizerModal.tsx
    │   │   ├── SaasPlatformView.tsx
    │   │   ├── StorefrontCartDrawer.tsx
    │   │   └── StorefrontView.tsx
    │   ├── kds/
    │   │   ├── KdsTerminalView.tsx
    │   │   └── StandaloneKdsApp.tsx
    │   ├── merchant/
    │   │   └── BranchStaffView.tsx
    │   ├── phase1/
    │   │   └── TenantManagementView.tsx
    │   ├── pos/
    │   │   ├── PosTerminalView.tsx
    │   │   └── StandalonePosApp.tsx
    │   └── storefront/
    │       └── DynamicStorefrontPage.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── data/
    │   ├── indoljData.ts
    │   ├── restaurantData.ts
    │   └── saasData.ts
    └── types/
        ├── indolj.ts
        └── saas.ts
```

The workspace is not a Git repository, so tracked-file status, change history, and a clean/dirty diff could not be established.

## D. Technology and dependency inventory

| Layer | Current technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, `@tailwindcss/vite`, React Vite plugin |
| UI / animation | `lucide-react`, `motion` |
| API | Node.js, Express 4, TypeScript executed with `tsx` |
| Persistence | Custom JSON file store; synchronous Node filesystem APIs |
| Authentication | Hand-implemented JWT signing/verification with HMAC-SHA256; custom SHA-256 password/PIN hashing |
| Desktop | Electron 45 and `electron-builder` portable Windows packaging |
| AI integration dependency | `@google/genai` is declared; no operational AI workflow was established in this audit |
| Database/cache | No PostgreSQL driver, ORM, migration runner, Redis client, or object-storage SDK in the application dependencies |
| Tests | No test runner or test script in `package.json`; standalone `test-server.ts` is not isolated and mutates the runtime datastore |

`npm run lint` is currently a TypeScript check (`tsc --noEmit`), not ESLint. The audited dependency ranges resolve to their current wanted versions; `npm outdated` showed later major releases for some packages (including Express, Google GenAI, Motion, and Lucide). Those are upgrade candidates requiring compatibility review, not by themselves vulnerabilities. `npm audit --json` reported **6 moderate, 0 high, and 0 critical** findings in the Electron/build-tool dependency chain, including a `minimatch` glob-matching denial-of-service advisory. These are development/build dependencies in the manifest; reassess desktop packaging exposure and update the affected chain before production release.

## E. Current database and storage situation

### Runtime data and persistence

- The backend loads and saves `data/eros_data.json` through [`server/db/store.ts`](../server/db/store.ts#L226); it is not connected to PostgreSQL.
- The store holds tenants, branches, users, menu data, orders, shifts, and audit records in process memory, then synchronously serializes the whole store to JSON on mutations.
- This design is single-process and file-local: no transaction isolation, database constraints, multi-instance coordination, safe concurrent writers, migration history, or durable backup/restore flow is implemented.
- `saveToDisk` catches and logs write failures rather than propagating a failed persistence result to the API caller. Writes replace the JSON file directly rather than using an atomic temp-file/rename protocol.
- The Docker runtime stage does not copy the `data` directory or declare a persistent volume. A fresh container can seed data and then write it into its ephemeral filesystem; deployments need an external durable volume or, preferably, the planned database before relying on container restarts.
- The checked local datastore was about 54 KB and contained 3 tenants, 5 branches, 4 users, 11 orders, 30 menu items, 26 audit logs, and 1 shift. It includes customer/staff records and password/PIN hashes; values were not copied into this report.
- `.gitignore` does not exclude `data/`; because this workspace is not a Git repository, whether the datastore is tracked or has appeared in history cannot be determined. Review this before connecting or publishing a repository.

### Browser persistence

| Storage | Use |
|---|---|
| `localStorage` | `eros_jwt_token` bearer token in `src/context/AuthContext.tsx`; `eros_pos_offline_queue` queued POS orders in `src/components/pos/PosTerminalView.tsx` |
| `sessionStorage` | No source usage found |
| IndexedDB / Cache API | No source usage found |

The offline queue is frontend-managed; held orders and the main cart are React state and do not survive a reload. Public storefront order data and most business records live server-side in the JSON file, not browser storage.

### PostgreSQL draft

[`docs/DATABASE_SCHEMA.sql`](DATABASE_SCHEMA.sql) outlines tenants, subscriptions, branches, terminals, roles/permissions, users, catalog/modifiers, branch overrides, tables, orders/payments, kitchen, inventory, accounting, audit logs, and offline sync. It is not wired to an application database package, configuration, startup path, or migration runner. RLS is enabled on only four tables and sample policies are provided for only three; the draft is not yet a complete isolation policy set and must not be treated as deployed protection.

## F. UI/UX audit

This section is based on source review, not an interactive browser/device test. Exact visual quality, accessibility behavior, and responsive rendering remain unverified.

| Severity | Finding | Evidence / impact |
|---|---|---|
| High | Executive analytics include seeded/static values and hard-coded channel/trend information. | [`OperatorConsole.tsx`](../src/components/enterprise/OperatorConsole.tsx#L66) initializes fixed data; charts/metrics can look live while not representing current backend records. |
| High | POS order handling treats the authenticated order as paid without processor confirmation. | [`order.routes.ts`](../server/routes/order.routes.ts#L162) sets `paymentStatus: 'paid'`; do not represent this as integrated payment settlement. |
| Medium | POS held orders are kept in component state, so refresh/crash loses them. | [`PosTerminalView.tsx`](../src/components/pos/PosTerminalView.tsx#L115). |
| Medium | POS terminal identity is a fixed `POS-01`; branch/terminal configuration is not dynamically bound. | [`PosTerminalView.tsx`](../src/components/pos/PosTerminalView.tsx#L171). |
| Medium | KDS polls every four seconds rather than receiving server push updates. | [`KdsTerminalView.tsx`](../src/components/kds/KdsTerminalView.tsx#L92); latency and repeated requests grow with terminals/order volume. |
| Medium | Some ERP controls are demo/local-state interactions, including SMS campaign “send” and seeded menu stock toggles. | [`OperatorConsole.tsx`](../src/components/enterprise/OperatorConsole.tsx#L97), [`OperatorConsole.tsx`](../src/components/enterprise/OperatorConsole.tsx#L495). |
| Medium | Several product/marketing views are unmounted, and two storefront implementations coexist. | `App.tsx` mounts the route-based page; unused/legacy views can confuse future maintenance and feature claims. |
| Low | In-ERP navigation is view-state-driven rather than URL/deep-link-driven. | [`App.tsx`](../src/App.tsx#L172); refresh/back navigation to a specific ERP screen is not established. |
| Not assessed | Touch target sizing, keyboard-only operation, screen-reader semantics, contrast, responsive behavior on target hardware. | Requires controlled browser/device validation; no visual session was run under this read-only audit. |

## G. Security findings

The following are confirmed by the independent static security review. Findings are not claims about production exposure where runtime configuration is unknown. The source snapshot has no Git diff; the review did not run the application.

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|---|---|---|---|---|
| 1 | 🔴 CRITICAL | `server/db/store.ts` | 298-299 | Fresh datastore seeds a known platform super-admin credential; public login can grant platform-wide access. User/tenant creation also has known default password/PIN fallbacks. | 10/10 |
| 2 | 🔴 CRITICAL | `server/db/store.ts` | 179 | If `JWT_SECRET` is unset, JWT signing and verification use a source-known fallback, allowing token forgery for an existing active user. `.env.example` does not define this secret; deployment override is unverified. | 10/10 |
| 3 | 🟠 HIGH | `server/routes/order.routes.ts` | 374-402; `server/db/store.ts` 745-760 | Offline-sync requires authentication but not `pos.order.create`; caller-supplied order fields, totals, and payment status can be persisted and affect paid GMV. | 10/10 |
| 4 | 🟡 MEDIUM | `server/routes/order.routes.ts` | 344-367 | Kitchen item-status update has no tenant ownership or KDS-permission check; order-level status has tenant validation but no KDS permission check. | 9/10 |
| 5 | 🟡 MEDIUM | `server/routes/menu.routes.ts` | 41-54 | Any authenticated tenant user can toggle menu availability without a menu-management permission. | 9/10 |
| 6 | 🟡 MEDIUM | `server/routes/order.routes.ts` | 8-46, 61 | Public checkout trusts client item names/prices and does not verify that the branch belongs to the submitted tenant. | 9/10 |
| 7 | 🟡 MEDIUM | `server/db/store.ts` | 170-175 | Password and PIN hashes use fast SHA-256 with a fixed source-known suffix rather than a password-hashing function with per-user salts. | 9/10 |
| 8 | 🟡 MEDIUM | `desktop/app/main.cjs` | 34-36, 61-62 | Desktop URL validation allows HTTP for remote servers; credentials/tokens and loaded app content can be intercepted or tampered with on an insecure network. | 9/10 |

### Confirmed controls and audit limits

- Bearer-token middleware resolves a user and checks account activity in [`server/middleware/auth.ts`](../server/middleware/auth.ts#L5); `requirePermission` exists but is not applied consistently.
- The API process binds to `0.0.0.0` in [`server.ts`](../server.ts#L63). The application itself does not configure TLS; production TLS termination is not verified.
- The seed/default account issue is conditional on a fresh datastore; the local data file may already contain accounts. No production configuration was inspected.
- No claim is made here that XSS, CSRF, uploads, or injection vulnerabilities were verified. No upload API was identified in the listed routes. TLS-at-proxy, rate limiting, backup protection, and deployed secret configuration remain unknown.

## H. Missing enterprise capabilities

Prioritize these gaps before describing the product as enterprise-ready:

1. **Secure identity and authorization:** remove defaults, strong password hashing and secret management, rate-limited login/PIN flows, consistent server-side permission checks, branch scope, session/token revocation, and auditable role administration.
2. **Transactional persistence:** PostgreSQL deployment, migration/versioning, constraints, backups/PITR, connection handling, safe concurrency, and operational observability.
3. **Financial correctness:** payment-provider integrations/webhooks, server-authoritative pricing and tax rules, payment/refund ledger, reconciliation, idempotency, void/refund approval, and immutable financial audit.
4. **Tenant boundaries:** enforce tenant and branch ownership on every request and relational constraint; complete and test RLS policies if RLS is used.
5. **Catalog and operations:** durable menu/product/modifier CRUD, branch pricing/availability, inventory movements, purchasing, recipes, stock counts, and supplier workflows.
6. **ERP:** accounting journal/period controls, tax reporting, subscriptions/invoices/collections, feature entitlements, and accurate data-backed reporting.
7. **Resilience and scale:** durable outbox/events, server-push order updates, bounded/paginated APIs, offline conflict handling, backups, metrics, tracing, and alerting.
8. **Hardware and desktop:** supported printer/scanner/cash drawer interfaces, device/terminal registration, secure server URL policy, offline storage/sync, and device update/signing process.
9. **Quality and compliance:** isolated automated tests, API contract tests, authorization/tenant-boundary tests, accessibility/responsive QA, data retention/export/deletion processes, and operational runbooks.

## I. Recommended target architecture

Adopt a **modular monolith first**, preserving the current app while separating client, API, and persistence boundaries. Avoid premature microservices.

```text
POS / KDS / ERP / tenant storefront
        │ HTTPS; short-lived access; device-aware auth
        ▼
Ingress / reverse proxy
TLS · request limits · rate limits · security headers
        ▼
Node API modular monolith
Auth/RBAC · tenant context · catalog · orders/payments
shifts · kitchen · reporting · audit · subscriptions
        ├── PostgreSQL: authoritative transactional data + migrations
        ├── object storage: menus/media/exports
        ├── outbox + worker: notifications, webhooks, sync
        └── optional Redis: cache/pub-sub/rate-limit coordination
```

Resolve tenant and branch from the authenticated identity and resource ownership, not request-supplied identifiers alone. Centralize validation and permission policies. Add database-backed transactions and an outbox for events; add Redis only when measured workloads require it. Keep the existing React clients and public tenant path during migration, with API compatibility tests.

## J. Recommended PostgreSQL schema outline

The current SQL draft can be evolved rather than discarded. Recommended production model:

- **Platform/tenancy:** `tenants`, `tenant_settings`, `subscriptions`, `plans`, `subscription_events`, `branches`, `terminals`; unique tenant-scoped identifiers.
- **Identity/RBAC:** `users`, `credentials`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_branch_assignments`, `sessions`/`refresh_tokens`; tenant and branch composite constraints.
- **Catalog:** `categories`, `products`, `product_variants`, `modifier_groups`, `modifiers`, `product_modifiers`, `branch_product_overrides`, `tax_rules`, `price_history`.
- **Order/payment:** `orders`, `order_items`, `order_item_modifiers`, `order_events`, `payments`, `refunds`, `discounts`, `tax_lines`, `tips`, `idempotency_keys`; use exact decimal monetary columns and explicit currency.
- **Kitchen/POS:** `kitchen_stations`, `kitchen_tickets`, `ticket_items`, `shifts`, `cash_movements`, `cash_reconciliations`, `tables`, `reservations`.
- **CRM/operations:** `customers`, `customer_addresses`, `loyalty_accounts`, `loyalty_transactions`, `inventory_items`, `recipes`, `recipe_ingredients`, `stock_movements`, `suppliers`, `purchase_orders`.
- **ERP/audit:** `chart_of_accounts`, `journal_entries`, `journal_lines`, `audit_logs`, `outbox_events`, `offline_sync_batches`.

Every tenant-owned row should carry `tenant_id`; branch-bound records should also carry `branch_id`. Enforce ownership with composite foreign keys or equivalent constraints, indexes, and integration tests. If using PostgreSQL RLS, apply and test it for all tenant tables, set tenant context transaction-locally, and prevent app roles from bypassing RLS.

## K. Migration strategy: JSON/localStorage to PostgreSQL

1. **Inventory and freeze semantics:** document every JSON record shape, ID format, role, permission, and mutation; define monetary/currency and status semantics before schema cutover.
2. **Secure first-run/auth:** remove default credentials, require configured secret material, move to Argon2id/scrypt/bcrypt, force resets or credential re-enrollment for existing users, and establish recovery/admin provisioning.
3. **Build schema/migrations:** create reviewed, versioned PostgreSQL migrations with foreign keys, tenant/branch constraints, indexes, RLS policy tests, and seed data that contains no production defaults.
4. **Implement repository boundary:** retain existing API contracts while replacing direct `dbStore` access behind typed service/repository methods; centralize transactions and tenant/permission checks.
5. **Backfill rehearsal:** export the JSON datastore without exposing it in logs; validate IDs, duplicates, ownership, required fields, monetary values, and referential links. Import idempotently into a staging database and compare row counts, sums, and sampled records.
6. **Handle browser state:** treat JWT and offline queue separately. Replace long-lived localStorage auth with an appropriate secure session/token strategy. Define offline queue schema/versioning, minimal retained customer data, idempotency, expiry, retry, and conflict resolution before moving it to a durable client store.
7. **Controlled cutover:** take a verified backup, temporarily stop writes, import final delta, compare reconciliation totals, switch API configuration, and monitor errors and financial totals. Do not run independent writable JSON and SQL sources without an explicit conflict protocol.
8. **Rollback and retirement:** retain a protected read-only JSON backup through the agreed rollback window; rehearse rollback. Delete legacy store code/data only after operational approval and verified retention requirements.

Password hashes produced by the current fast fixed-suffix algorithm should not be treated as modern password hashes. Prefer forced password reset or a carefully designed rehash-on-success migration plus mandatory reset for known/default credentials.

## L. POS and KDS desktop conversion strategy

- **Current state:** Electron shells load the configured remote `/pos` or `/kds` URL; they store the server URL in Electron user data and expose only settings IPC methods through a context-isolated preload. This is not a local-first desktop application.
- **Tauri decision:** first validate required hardware, kiosk mode, update/signing, and offline requirements. Tauri is an option, not a prerequisite; retain Electron if its lifecycle and hardware ecosystem better fit requirements.
- **Hardware bridge:** design a narrow, permissioned adapter for supported printers/scanners/drawers. Verify device models and OS support before committing to APIs. `window.print()` is not thermal receipt integration.
- **Offline mode:** use a versioned durable queue and local cache; encrypt sensitive local data where platform APIs permit; set retention limits; use server-authoritative pricing on sync, signed device identity, per-order idempotency, and explicit conflict/rejection UX.
- **Transport:** require HTTPS for non-loopback hosts; restrict allowed server origins and protect settings changes. Avoid sending credentials/tokens over HTTP.
- **Release readiness:** sign installers, pin/update Electron safely, harden kiosk configuration, test Windows lifecycle, network loss/reconnect, printer failure, and multiple terminal identities.

## M. Deployment and infrastructure recommendations

- Replace local JSON persistence with managed PostgreSQL before multi-instance or production deployment; configure automated backups, point-in-time recovery, encryption, and restore drills.
- Run behind a maintained TLS ingress/reverse proxy with request/body limits, rate limiting, security headers, and health/readiness endpoints. Application currently listens on all interfaces.
- Require secrets at startup; never ship a fallback JWT secret. Use environment/secret manager injection and rotation; do not put production secrets in `.env.example`.
- Add durable persistent volumes only as a temporary bridge for JSON deployments. Docker currently has no volume declaration and omits the data folder in the runtime image.
- Make builds reproducible with lockfile-based installs, remove the builder `node_modules` copy into the production image, run as a non-root user, and emit a compiled production server artifact instead of invoking `tsx` in the runtime container.
- Add structured logs with redaction, request IDs, metrics, error tracking, health checks, database connection monitoring, and alerting for failed order/payment sync.
- Keep secrets/customer data out of logs and audit exports; define retention, access, backup encryption, and restore procedures.
- Introduce CI gates for type checking, unit/integration tests, authorization isolation tests, dependency audit, build, and desktop packaging smoke tests.

## N. Prioritized implementation roadmap

| Priority | Phase | Main outcomes |
|---|---|---|
| P0 | Contain critical security risks | Remove seeded/default credentials; require strong `JWT_SECRET`; rotate deployed secrets; protect first-run admin; correct offline-sync authorization and server-side financial validation. |
| P0 | Authorization and integrity baseline | Enforce tenant/branch ownership and explicit permissions on every mutation; validate public order branch/menu ownership and derive price server-side; add tests for cross-tenant access. |
| P1 | Persistence foundation | Implement PostgreSQL schema/migrations and repository boundary; rehearse JSON import, backup, reconciliation, cutover and rollback. |
| P1 | Payment and audit correctness | Integrate payment processor and webhook verification; model payment/refund events; make audit records durable and append-only; reconcile shifts/cash. |
| P1 | Product operations | Add full catalog/branch pricing, inventory and purchasing workflows; replace local demo state with APIs. |
| P2 | ERP subscriptions and reporting | Billing lifecycle, plan entitlements, invoices, accurate data-backed dashboards and exports. |
| P2 | Real-time / offline | Durable outbox and KDS push updates; robust offline queue, device identity, conflict management, and terminal administration. |
| P2 | Desktop and hardware | Decide Electron/Tauri, integrate certified hardware, enforce HTTPS, sign releases, and execute hardware/network QA. |
| P3 | Product quality/compliance | Accessibility/responsive QA, localization/currency rules, retention/export/deletion, performance/load testing, and operational runbooks. |

## O. Existing files/components to preserve

Do not replace the current project with a new scaffold. Preserve and evolve these working product surfaces and their assets:

- App routing/shell and role-aware ERP: [`src/App.tsx`](../src/App.tsx), [`src/access/roleAccess.ts`](../src/access/roleAccess.ts), [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx).
- POS and KDS: [`src/components/pos/PosTerminalView.tsx`](../src/components/pos/PosTerminalView.tsx), `StandalonePosApp.tsx`, [`src/components/kds/KdsTerminalView.tsx`](../src/components/kds/KdsTerminalView.tsx), `StandaloneKdsApp.tsx`.
- Tenant and operations administration: [`src/components/phase1/TenantManagementView.tsx`](../src/components/phase1/TenantManagementView.tsx), [`src/components/merchant/BranchStaffView.tsx`](../src/components/merchant/BranchStaffView.tsx), `AuditComplianceView.tsx`, `OperatorConsole.tsx`.
- Public ordering: [`src/components/storefront/DynamicStorefrontPage.tsx`](../src/components/storefront/DynamicStorefrontPage.tsx), existing cart/customizer/tracker components, tenant slug route, and restaurant imagery under `src/assets/images/`.
- API contracts and domain data: `server/routes/*.routes.ts`, `server/middleware/auth.ts`, current types/data definitions, and the JSON datastore as a **migration source and protected backup**, not as a target production persistence design.
- Desktop setup/packaging: `desktop/app/`, both Electron builder configurations, and POS/KDS web manifests.
- Design/reference documents: `docs/DATABASE_SCHEMA.sql` and `docs/SYSTEM_ARCHITECTURE.md` as drafts to reconcile with implementation, not as evidence of features already deployed.

## Validation and audit limits

- `npm run lint` ran and passed; this command is only `tsc --noEmit`.
- `npm audit --json` and `npm outdated --json` were run read-only; results are summarized in section D.
- No automated test suite is configured. `test-server.ts` writes directly to `data/eros_data.json` and was intentionally not executed.
- The application was not launched for browser, hardware, visual, or end-to-end testing. No production environment, cloud configuration, TLS proxy, secrets, or deployment logs were available.
- No source code, environment configuration, or application data was modified during the initial audit. After report delivery, the user explicitly approved remediation; follow-up changes and validation are summarized below.

## Post-audit remediation (approved follow-up)

The security table above records the audited baseline. The user then approved fixing all findings. These targeted changes were made:

| Baseline finding | Follow-up change |
|---|---|
| Seed/default credentials | Removed seeded login users and password/PIN defaults. Added one-time token-protected platform-admin bootstrap; legacy hashes no longer authenticate and can be reset by a provisioned administrator. |
| Fallback JWT secret | Server startup now fails unless `JWT_SECRET` is configured with at least 32 bytes. Added dotenv loading and blank configuration entries in `.env.example`. |
| Offline-sync permissions and financial trust | Requires order-creation and payment-collection permissions; validates tenant-owned active branches and catalog items; recalculates item pricing, tax, fees, and totals; ignores caller totals/payment state; validates the full batch before writing. Card/wallet/bank payments remain pending absent processor confirmation. |
| KDS status authorization | Both order and item updates require `kds.ticket.update`; item updates now verify tenant ownership and status values. |
| Menu availability authorization | Availability updates require `menu.manage`; owner/manager role provisioning includes the permission. |
| Public checkout trust | Validates active tenant branch ownership and available tenant-owned menu items; calculates prices from catalog/variant values and rejects invalid payment methods. |
| Weak credential hashing | Passwords and PINs now use per-credential random salts with scrypt and constant-time verification. New passwords require 12-128 characters; new PINs require six digits. |
| Insecure desktop transport | Remote desktop servers must use HTTPS; HTTP is accepted only for localhost/loopback development. |

### Post-remediation validation

- `npm run lint` passed (`tsc --noEmit`).
- `npm run build` passed. Vite emitted an existing configuration warning about `__dirname` with `configLoader: 'native'`.
- `node --check desktop\app\main.cjs` passed.
- Isolated API checks passed for bootstrap (wrong-token rejection, one-time behavior, login), legacy credential rejection, permission enforcement, cross-tenant KDS rejection, public price/branch validation, authenticated POS pricing/payment state, offline-sync permission/financial validation, and all-or-nothing batch validation. Tests used a temporary datastore and it was removed afterward.
- Desktop URL-policy checks passed for permitted localhost HTTPS/HTTP and rejected non-loopback HTTP.
- Missing-`JWT_SECRET` startup validation was checked and failed closed as intended.
- The existing local JSON datastore was not modified. Existing users with legacy hashes must be re-provisioned/reset before they can authenticate; configure a new email for the first platform administrator if a legacy user already owns the preferred email.

The original infrastructure, UI, persistence, observability, testing, and deployment gaps described elsewhere in this baseline report remain outside this security follow-up.
