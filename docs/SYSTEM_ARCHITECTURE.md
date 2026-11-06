# ENTERPRISE RESTAURANT OPERATING SYSTEM (EROS)
## System Architecture & Technical Specification Document
**Version:** 1.0.0  
**Classification:** Enterprise SaaS Architecture Blueprint  
**Target Environment:** Multi-Tenant Cloud Native (Node.js/Express, React 19, TypeScript, PostgreSQL, Redis)

---

## 1. High-Level System Architecture

```
[ Client Applications Tier ]
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│ Super Admin Console       │ Merchant ERP & Backoffice │ Touchscreen POS Terminal  │
│ (React 19 / TypeScript)   │ (React 19 / Vite / Lucide)│ (Offline-first PWA / IDB) │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ Kitchen Display (KDS)     │ Online Ordering Portal    │ Delivery Driver App       │
│ (High-contrast PWA / WS)  │ (Responsive Web Store)    │ (Mobile PWA / GPS Track)  │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
                                     │
                             HTTPS / WSS Gateway
                                     ▼
[ API Gateway & Ingress Layer ]
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Rate Limiter · SSL Termination · WAF · CORS · Idempotency Middleware · Tenant Resolver│
└───────────────────────────────────────────────────────────────────────────────────┘
                                     │
[ Core Application Services (Modular Monolith / Microservices Ready) ]
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┬───────────┐
│ Tenant & Auth   │ Catalog & Menu  │ Order Engine &  │ Kitchen (KDS)   │ Inventory │
│ Service (RBAC)  │ Dynamic Pricing │ POS Terminal API│ Dispatch Router │ & Recipes │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┼───────────┤
│ Double-Entry    │ Customer CRM &  │ Logistics &     │ Hardware Bridge │ Analytics │
│ Accounting Core │ Loyalty Engine  │ Rider Fleet API │ (ESC/POS Printer│ & BI Core │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┴───────────┘
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
[ Data & State Infrastructure Tier ]
┌───────────────────────────────┬───────────────────────────────┬───────────────────┐
│ PostgreSQL 16 (Relational)   │ Redis 7.2 (Pub/Sub & Cache)   │ Object Storage    │
│ - Multi-Tenant RLS Partition  │ - Real-Time KDS WebSockets    │ - S3 / GCS        │
│ - Strict Foreign Key Chains   │ - Distributed Rate Limiter    │ - Invoices, PDFs  │
│ - Financial Audit Immutability│ - POS Offline Sync Idempotency│ - Product Photos  │
└───────────────────────────────┴───────────────────────────────┴───────────────────┘
```

---

## 2. Multi-Tenant Monorepo Architecture

```
/
├── apps/
│   ├── super-admin/        # Platform Owner SaaS Metrics, Billing & Tenant Management
│   ├── merchant-erp/       # Multi-Branch Restaurant Executive Console & ERP
│   ├── pos-terminal/       # Touch-Optimized Offline-First Cashier POS Application
│   ├── kds-kitchen/        # High-Contrast Station-Based Kitchen Display System
│   ├── online-storefront/  # Branded Multi-Tenant Customer Ordering Website
│   └── rider-app/          # Delivery Rider Dispatch & Navigation Interface
│
├── packages/
│   ├── database/           # Prisma/Drizzle Schema, SQL Migrations, Seeders
│   ├── core-types/         # Shared TypeScript Enums, Interfaces, DTOs
│   ├── rbac/               # Permission Matrix, Role Guards, Tenant Context
│   ├── accounting-engine/  # Double-Entry General Ledger, Rules & Posting Routines
│   ├── inventory-engine/   # Recipe Explosion, Stock Movement, FIFO/Weighted Costing
│   ├── printer-engine/     # ESC/POS Network & Bluetooth Thermal Receipt Generators
│   └── ui/                 # Reusable Enterprise Component Library (Tailwind v4)
│
├── server/
│   ├── routes/             # REST API Handlers by Domain
│   ├── middleware/         # Tenant Context, Auth JWT, Audit Logging, Error Handler
│   ├── websocket/          # Redis Pub/Sub Socket Server for POS & KDS Real-Time
│   └── server.ts           # Central Express API & WebSocket Server
```
