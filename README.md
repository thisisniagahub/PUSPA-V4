<div align="center">

# 🌺 PUSPA V4

### Pertubuhan Urus Peduli Asnaf

**Platform Pengurusan NGO Pintar**

_Cerdas. Mesra. Sentiasa di sisi anda._

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

</div>

---

## 📖 Table of Contents

- [About PUSPA](#-about-puspa)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Default Accounts](#default-accounts)
- [User Roles & Access Control](#-user-roles--access-control)
  - [Role Hierarchy](#role-hierarchy)
  - [Module Access Matrix](#module-access-matrix)
  - [Hermes AI Tool Permissions](#hermes-ai-tool-permissions)
- [Hermes — AI Assistant](#-hermes--ai-assistant)
  - [Architecture & Workflow](#architecture--workflow)
  - [Multi-Provider LLM Support](#multi-provider-llm-support)
  - [Tool Registry (30+)](#tool-registry-30)
  - [Self-Improving Skills System](#self-improving-skills-system)
  - [Persistent Memory System](#persistent-memory-system)
- [Database Schema](#-database-schema)
  - [35+ Prisma Models](#35-prisma-models)
  - [Switching to PostgreSQL](#switching-to-postgresql)
- [API Reference](#-api-reference)
  - [Authentication](#authentication)
  - [Core CRUD](#core-crud)
  - [Compliance & Identity](#compliance--identity)
  - [Hermes AI](#hermes-ai)
  - [Ops Conductor](#ops-conductor)
  - [Bot API](#bot-api)
  - [Integrations](#integrations)
- [Security Features](#-security-features)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
  - [Production Build](#production-build)
  - [Deploy to Vercel](#deploy-to-vercel)
  - [Docker (Planned)](#docker-planned)
- [Available Scripts](#-available-scripts)
- [Design System](#-design-system)
- [Internationalization](#-internationalization)
- [Plugin System](#-plugin-system)
- [Troubleshooting](#-troubleshooting)
- [Contributing Guide](#-contributing-guide)
- [License](#-license)

---

## 🏛️ About PUSPA

**PUSPA (Pertubuhan Urus Peduli Asnaf)** is a registered Malaysian NGO serving asnaf (needy) communities in **Hulu Klang, Gombak, and Ampang** (Selangor/KL, Malaysia).

| Detail | Information |
|---|---|
| **Registration** | PPM-006-14-14032020 |
| **Tax Exemption** | LHDN s44(6) |
| **Location** | Hulu Klang, Gombak, Ampang |
| **Website** | www.puspa.org.my |

PUSPA V4 is the **fourth-generation** NGO management platform that integrates **artificial intelligence** to automate daily operations, accelerate case processing, and ensure regulatory compliance — all within a unified dashboard.

> **PUSPA V4** is a full-featured **single-page application (SPA)** built on Next.js 16 with a Zustand-based client-side routing system. All modules are dynamically loaded via `ViewRenderer` — no traditional file-based page routing for modules.

---

## ✨ Key Features

### 📊 Dashboard & Analytics
- Real-time summary dashboard with key performance indicators
- Monthly donation trend charts & disbursement breakdowns
- Member distribution by category & branch
- Recent activities & compliance alerts
- Command palette (`⌘K`) for instant module search (bilingual BM/EN)

### 👥 Asnaf Member Management
- Complete member profiles (IC, income, household, bank details)
- Kifayah Calculator for zakat eligibility computation
- Member interaction history timeline
- Household member management (OKU, student tracking)
- Unique member numbering (`PUSPA-XXXX`)

### 📁 Case Management (12-Step Workflow)
- Full lifecycle workflow: `Draft → Submitted → Verifying → Verified → Scoring → Scored → Approved → Disbursing → Disbursed → Follow-up → Closed / Rejected`
- Case intelligence engine: eligibility scoring, risk flags, programme recommendations
- Case notes (note, call, visit, assessment) & document attachments
- Next-action prediction & priority classification (urgent, high, normal, low)
- Verification & welfare scoring system

### 💰 Donations & Donor CRM
- Multi-category donation tracking (Zakat, Sedekah, Wakaf, Infak, General)
- Donor CRM with segmentation (Major, Regular, Occasional, Lapsed)
- LHDN tax receipts with reference tracking
- Donor communication history & outreach tracking
- Auto donor sync — donors are auto-created/updated from donations
- Shariah compliance flag per donation

### 💸 Disbursements & Payments
- Disbursement processing with bank details
- Scheduled disbursement with date tracking
- Auto reconciliation of disbursement status
- Payment verification & approval workflow
- Unique disbursement numbering (`DISB-XXXX`)

### 🎯 Programme Incubation
- Programme management with budget & impact metrics
- Beneficiary tracking per programme
- Impact reports with verification sources
- Budget vs actual expenditure monitoring
- 8 programme categories (food aid, education, skills, healthcare, financial, community, emergency, dawah)

### 🤝 Volunteer Management
- Volunteer profiles with skills & availability tracking
- Deployment management (programme & activity assignments)
- Volunteer hour logging with approval workflow
- Certificate issuance system with unique numbering
- Total hours accumulation

### ✅ Compliance (ROSM LHDN PDPA)
- Compliance checklists for ROS, LHDN, and PDPA
- Real-time compliance status with scoring
- Expiry date alerts for certifications
- Evidence URL attachment per checklist item
- Category-based organization

### 🛂 eKYC (Electronic Identity Verification)
- IC front/back upload with OCR extraction
- Selfie capture + liveness detection scoring
- Face match scoring (IC photo vs selfie)
- BNM compliance check & AMLA screening
- Wallet limits (RM 200 default, upgradeable)
- Vision API integration for AI-assisted verification

### 🔐 TapSecure (Biometric Security)
- Device binding & fingerprint registration
- Biometric transaction approval
- Trusted device management (primary device designation)
- Security settings per user (session timeout, bound-device-only mode)
- Comprehensive security event logging

### 🤖 Hermes — Self-Improving AI Assistant
- Autonomous AI assistant that learns from every interaction
- 30+ tools for full database & operation access
- Self-improving skills system with usage tracking & success rates
- Persistent memory with 5 categories (preference, fact, procedure, relationship, context)
- 3 AI provider support (Z-AI SDK, OpenRouter, Ollama) with auto-fallback
- Real-time SSE streaming for chat responses
- Agent execution trace visualization (planning → tool_call → success/error)
- Bilingual responses (Bahasa Melayu & English)
- Context-aware quick actions per module

### 🎼 Ops Conductor
- AI-driven operations management via natural language
- Intent detection for work item classification
- Work item lifecycle with approval workflow (pending → approved → rejected → revised)
- Automation job scheduling (one-time & cron-based)
- Real-time execution tracing with latency tracking
- Bulk operations support
- Project & artifact management

### 🌐 OpenClaw AI Ops Suite (Developer Only)
- **MCP Server** — Model Context Protocol management
- **Plugins** — Plugin marketplace & management
- **Integrations** — Gateway & channel configuration
- **Terminal** — Operator console for direct commands
- **Agents** — AI agent deployment & management
- **Models** — LLM model engine configuration
- **Automation** — Cron scheduling & job management
- **Graph** — Visual graph explorer (@xyflow/react)

### 🌈 Additional Features
- **Aurora Background** — Custom WebGL shader effect (OGL engine)
- **⌘K Command Palette** — Full bilingual search (BM/EN) across all modules
- **Responsive Design** — Mobile-first with adaptive sidebar (Sheet on mobile)
- **Dark/Light Theme** — Full `next-themes` support with Zinc/Emerald design system
- **Plugin System** — Tapable-based hook architecture with component slots
- **Real-time Notifications** — Bell dropdown with unread count & linking
- **Bot API Dashboard** — Service account management with `psbot_*` API keys
- **WhatsApp Integration** — Webhook endpoint for WhatsApp bot connectivity
- **Audit Trail** — Full action logging with IP & user tracking
- **Document Management** — Category-based document repository with versioning

---

## 🛠️ Technology Stack

| Category | Technology | Version |
|---|---|---|
| **Framework** | Next.js (App Router, React 19, Turbopack) | 16 |
| **Language** | TypeScript | 5 |
| **Database** | SQLite (dev) / PostgreSQL (prod) | — |
| **ORM** | Prisma | 6 |
| **Authentication** | NextAuth v4 (JWT, Credentials) | 4 |
| **State Management** | Zustand (persist middleware) | 5 |
| **UI Components** | shadcn/ui (Radix primitives, New York style) | — |
| **Icon Library** | Lucide React | — |
| **Styling** | Tailwind CSS + tailwindcss-animate | 4 |
| **Charts** | Recharts | 2 |
| **Tables** | @tanstack/react-table | 8 |
| **Data Fetching** | @tanstack/react-query + native fetch | 5 |
| **Animations** | Framer Motion | 12 |
| **3D/WebGL** | OGL (aurora shader) | — |
| **AI SDK** | z-ai-web-dev-sdk (free tier) | — |
| **AI Providers** | Z-AI SDK, OpenRouter (200+ models), Ollama (local) | — |
| **Forms** | react-hook-form + Zod | 7 / 4 |
| **Markdown** | react-markdown + react-syntax-highlighter | — |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable | — |
| **Visual Graphs** | @xyflow/react | 12 |
| **Notifications** | Sonner (toast) | — |
| **Real-time** | socket.io-client (WebSocket) | — |
| **Image Processing** | Sharp | — |
| **Package Manager** | Bun | ≥ 1.0 |
| **Runtime** | Node.js (production), Bun (development) | ≥ 18 |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUSPA V4                                 │
│                    (Next.js 16 App Router)                      │
│                                                                 │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────┐ │
│  │   Frontend   │  │   API Routes     │  │   AI Engine       │ │
│  │  (React 19)  │  │  (50+ endpoints) │  │  (Hermes Agent)   │ │
│  │              │  │                  │  │                   │ │
│  │ • Sidebar    │  │ • /api/v1/auth   │  │ • Multi-provider  │ │
│  │ • Modules    │  │ • /api/v1/member │  │   LLM transport   │ │
│  │ • Hermes UI  │  │ • /api/v1/cases  │  │ • 30+ tools       │ │
│  │ • Dashboard  │  │ • /api/v1/hermes │  │ • Skills system   │ │
│  │ • ⌘K Palette │  │ • /api/v1/ops    │  │ • Memory system   │ │
│  │ • Aurora BG  │  │ • /api/v1/bot    │  │ • SSE streaming   │ │
│  └──────────────┘  └──────────────────┘  └───────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Zustand Stores                           ││
│  │  app-store (view, sidebar, role)  •  hermes-store (AI)     ││
│  │  ops-store (conductor)           •  (persist middleware)    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Prisma ORM 6                             ││
│  │               (SQLite ↔ PostgreSQL)                         ││
│  │              35+ models • Multi-DB URL resolution           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Security Layer                           ││
│  │  NextAuth JWT • HMAC Session Tokens • Bot API Keys          ││
│  │  Rate Limiting • Audit Trail • eKYC • TapSecure            ││
│  │  Scrypt Password Hashing • Path Traversal Protection        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### SPA Routing Architecture

```
User clicks nav item
  → appStore.setCurrentView(viewId)
  → ViewRenderer detects currentView change
  → Dynamic import(`@/modules/${viewId}/page`)
  → Module renders with full CRUD + AI integration
```

Unlike traditional Next.js file-based routing, PUSPA V4 uses a **single root page** (`/`) with a Zustand-driven `ViewRenderer` that dynamically imports module pages. This provides:
- Instant navigation without page reloads
- Persistent state across module switches
- Seamless Hermes AI context tracking

---

## 📁 Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (AuthProvider + ThemeProvider)
│   ├── page.tsx                      # Main SPA shell (sidebar, header, Hermes FAB)
│   ├── globals.css                   # Global styles + Tailwind + theme variables
│   ├── login/page.tsx                # Login page
│   ├── asnafpreneur/                 # Standalone public page route
│   ├── actions/                      # Server actions
│   │   └── activities.ts
│   └── api/                          # API routes (50+ endpoints)
│       ├── route.ts                  # Health check endpoint
│       ├── auth/[...nextauth]/       # NextAuth handler
│       └── v1/                       # REST API v1
│           ├── auth/                 # Authentication (login, logout, me)
│           ├── dashboard/            # Dashboard & analytics
│           ├── members/              # Asnaf member CRUD
│           ├── cases/                # Case CRUD
│           ├── donations/            # Donation CRUD
│           ├── donors/               # Donor CRM + communications + receipts
│           ├── disbursements/        # Disbursement CRUD
│           ├── programmes/           # Programme CRUD
│           ├── activities/           # Activity CRUD (Kanban)
│           ├── volunteers/           # Volunteer CRUD + deployments + hours + certificates
│           ├── documents/            # Document CRUD + stats
│           ├── compliance/           # Compliance checklists (PDPA, ROS)
│           ├── ekyc/                 # eKYC management + verify + vision
│           ├── tapsecure/            # Biometric security (devices, settings, logs)
│           ├── reports/              # Financial reports
│           ├── audit/                # Audit log
│           ├── notifications/        # Notifications
│           ├── hermes/               # AI chat, config, conversations, skills
│           ├── ai/                   # AI analytics
│           ├── ops/                  # Ops Conductor (dashboard, work-items, automations, bulk)
│           ├── bot/                  # Bot API (dashboard, donations, ekyc, members, keys, cases)
│           ├── integrations/         # WhatsApp integration
│           ├── openclaw/             # OpenClaw AI Ops (status, snapshot)
│           ├── organization/         # Organization profile
│           ├── branches/             # Branch offices
│           ├── board-members/        # Board of directors
│           ├── partners/             # External partners
│           └── users/                # User management
│
├── components/
│   ├── sidebar/                      # Collapsible navigation sidebar
│   │   ├── app-sidebar.tsx           # Main sidebar component (Sheet on mobile)
│   │   ├── sidebar-content.tsx       # Navigation content (role-filtered)
│   │   ├── sidebar-config.ts         # Navigation groups & items configuration
│   │   ├── sidebar-types.ts          # TypeScript types for nav items
│   │   ├── sidebar-brand.tsx         # Logo & brand name
│   │   ├── sidebar-nav.tsx           # Navigation group renderer
│   │   └── sidebar-footer.tsx        # User info & logout
│   ├── hermes/                       # AI assistant UI
│   │   ├── hermes-fab.tsx            # Floating action button (bottom-right)
│   │   ├── hermes-panel.tsx          # Panel mode (440×640px slide-in)
│   │   ├── hermes-dashboard.tsx      # Full-screen mode + execution trace
│   │   ├── hermes-message-v2.tsx     # Chat message bubbles (v2)
│   │   ├── hermes-chat-header.tsx    # Chat header with provider info
│   │   ├── hermes-chat-input.tsx     # Chat input with quick actions
│   │   ├── hermes-settings.tsx       # AI provider/model configuration
│   │   └── execution-trace.tsx       # Agent step visualization
│   ├── plugins/                      # Plugin system
│   │   ├── PluginSlot.tsx            # Plugin component renderer by slot name
│   │   └── ErrorBoundary.tsx         # Plugin error isolation
│   ├── ui/                           # 45+ shadcn/ui components (Radix-based)
│   ├── Aurora.tsx                    # WebGL aurora background (OGL shader)
│   ├── auth-provider.tsx             # NextAuth SessionProvider wrapper
│   ├── command-palette.tsx           # ⌘K command palette
│   ├── notification-bell.tsx         # Notification dropdown with unread count
│   ├── theme-provider.tsx            # next-themes wrapper
│   └── view-renderer.tsx             # Dynamic module loader (ViewId → lazy import)
│
├── modules/                          # Feature modules (lazy-loaded pages)
│   ├── dashboard/                    # Summary dashboard
│   ├── members/                      # Asnaf member management
│   │   └── components/               # kifayah-calculator, history-timeline
│   ├── cases/                        # Case management (12-step workflow)
│   ├── programmes/                   # Programme incubation
│   ├── donations/                    # Donation tracking
│   ├── donors/                       # Donor CRM
│   ├── disbursements/                # Disbursement & payment
│   ├── volunteers/                   # Volunteer management
│   ├── activities/                   # Activity operations (Kanban board)
│   ├── compliance/                   # Compliance checklists
│   ├── documents/                    # Document management
│   ├── reports/                      # Financial reports
│   ├── admin/                        # System administration
│   ├── ekyc/                         # Electronic identity verification
│   ├── tapsecure/                    # Biometric security
│   ├── openclaw/                     # AI Ops Suite (8 sub-modules)
│   │   ├── mcp.tsx                   # MCP server
│   │   ├── plugins.tsx               # Plugin management
│   │   ├── integrations.tsx          # Integration gateway
│   │   ├── terminal.tsx              # Operator terminal
│   │   ├── agents.tsx                # AI agents
│   │   ├── models.tsx                # LLM model engine
│   │   ├── automation.tsx            # Cron scheduling
│   │   └── graph/page.tsx            # Visual graph explorer
│   ├── ops-conductor/                # AI-powered operations conductor
│   ├── ai/                           # AI tools
│   ├── asnafpreneur/                 # Asnaf entrepreneurship
│   ├── kelas-ai/                     # AI class & vibe coding
│   ├── agihan-bulan/                 # Monthly staple food distribution
│   ├── sedekah-jumaat/              # Friday alms collection
│   ├── gudang-barangan/              # Warehouse & inventory
│   ├── docs/                         # System documentation
│   └── settings/                     # User settings
│
├── lib/                              # Utilities & business logic
│   ├── auth.ts                       # NextAuth configuration
│   ├── auth-shared.ts                # Shared auth utils (normalizeUserRole, getAuthSecret)
│   ├── puspa-auth.ts                 # Custom HMAC session tokens
│   ├── bot-auth.ts                   # Bot API key system (psbot_* prefix)
│   ├── bot-middleware.ts             # Bot auth middleware (Bearer token)
│   ├── db.ts                         # Prisma client singleton (multi-URL resolution)
│   ├── db-rls.ts                     # Row-level security helpers
│   ├── access-control.ts             # View-level role requirements
│   ├── rate-limit.ts                 # In-memory rate limiter (100 req/min)
│   ├── audit.ts                      # Audit log writer
│   ├── uploads.ts                    # File upload handler (MIME whitelist, path sanitization)
│   ├── password.ts                   # Scrypt password hashing (N=16384, r=8, p=2)
│   ├── case-intelligence.ts          # Eligibility scoring, risk flags, recommendations
│   ├── donor-sync.ts                 # Auto donor create/update from donations
│   ├── domain.ts                     # Domain value normalization (status labels, aliases)
│   ├── sequence.ts                   # Sequential number generator (P2002 retry)
│   ├── openclaw.ts                   # OpenClaw gateway client
│   ├── supabase.ts                   # Supabase client (optional)
│   ├── api.ts                        # Type-safe API client helper
│   ├── utils.ts                      # cn() (clsx + tailwind-merge)
│   ├── types.ts                      # Shared type definitions
│   └── hermes/                       # Hermes AI engine
│       ├── types.ts                  # Core types (HermesToolDefinition, ROLE_PERMISSIONS)
│       ├── provider-types.ts         # Provider definitions & model catalogs
│       ├── providers.ts              # Multi-provider LLM transport (callLLM, streamLLM)
│       ├── prompt.ts                 # System prompt builder (context-aware)
│       ├── tools.ts                  # Tool call parsing (<<TOOL:name>>{}<</TOOL>>)
│       ├── advanced-tools.ts         # 30+ tool definitions with handlers
│       ├── skills.ts                 # Self-learning skills (create, match, auto-create)
│       ├── memory.ts                 # Persistent memory (5 categories, auto-extraction)
│       ├── quick-actions.ts          # Per-module quick action suggestions
│       ├── module-descriptions.ts    # Context descriptions for 30+ views
│       └── lang-detect.ts            # Language detection (Malay/English)
│
├── stores/                           # Zustand state management
│   ├── app-store.ts                  # Global app state (view, sidebar, role, onboarding)
│   ├── hermes-store.ts               # AI assistant state (messages, provider, steps)
│   └── ops-store.ts                  # Ops conductor state (work items, automations)
│
├── types/                            # TypeScript definitions
│   ├── index.ts                      # ViewId, viewLabels, API types
│   └── next-auth.d.ts               # NextAuth type augmentations
│
├── hooks/                            # Custom React hooks
│   ├── use-mobile.ts                 # Mobile detection
│   └── use-toast.ts                  # Toast notifications
│
├── actions/                          # Server actions
│   └── activities.ts                 # Activity-related server actions
│
└── proxy.ts                          # Next.js middleware (auth guard)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **Bun** ≥ 1.0 (recommended package manager)
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/thisisniagahub/PUSPA-V4.git
cd PUSPA-V4

# 2. Install dependencies
bun install

# 3. Copy environment file
cp .env.example .env

# 4. Configure environment variables (see Environment Variables section)
# Edit .env with your actual values

# 5. Generate Prisma client & push schema
bun run db:push

# 6. (Optional) Seed the database with demo data
bun run db:seed

# 7. Start the development server
bun run dev
```

The server will run at `http://localhost:3000`

### Default Accounts

After seeding, the following accounts are available:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Staff** | `staff@puspa.org.my` | `Staff@2026` | Read-only operations |
| **Admin** | `admin@puspa.org.my` | `Admin@2026` | Full operations + compliance |
| **Developer** | `dev@puspa.org.my` | `Dev@2026` | Full access + AI Ops |

> ⚠️ **Change default passwords after first login!**

### Demo Data

Running `bun run db:seed` creates comprehensive demo data:
- 1 Organization (PUSPA, PPM-006-14-14032020)
- 1 Admin user + password hash
- 7 Board members (chairman, adviser, deputy, treasurer, secretary, etc.)
- 8 Partners (5 masjids, 1 foundation, 2 government agencies)
- 15 Members (asnaf) with 9 household members
- 8 Programmes (food aid, education, skills, healthcare, financial, community, emergency, dawah)
- 15 Cases across all 12 workflow statuses
- 20+ Donations totaling ~RM 150,000
- Disbursements, activities, compliance items, and more

---

## 👥 User Roles & Access Control

### Role Hierarchy

PUSPA V4 implements a **three-tier hierarchical role system** with progressive access:

| Role | Label | Description | Permission Level |
|---|---|---|---|
| **staff** | Staf | Daily operations | `read-only` |
| **admin** | Pentadbir | Operations + compliance + reports | `read + write` |
| **developer** | Pembangun | Full access including AI & automation | `read + write + admin` |

Role ordering: `staff (1) < admin (2) < developer (3)` — higher roles inherit all permissions of lower roles.

### Module Access Matrix

| Module Group | Staff | Admin | Developer |
|---|:---:|:---:|:---:|
| Dashboard, Members, Cases | ✅ | ✅ | ✅ |
| Programmes, Monthly Distribution, Friday Alms | ✅ | ✅ | ✅ |
| Donations, Donors, Disbursements, Warehouse | ✅ | ✅ | ✅ |
| Activities, Volunteers, Documents | ✅ | ✅ | ✅ |
| Guide, Settings | ✅ | ✅ | ✅ |
| Asnafpreneur, AI Class | ❌ | ✅ | ✅ |
| Compliance, eKYC, TapSecure | ❌ | ✅ | ✅ |
| Reports, Administration | ❌ | ✅ | ✅ |
| Ops Conductor, AI Tools | ❌ | ❌ | ✅ |
| OpenClaw Suite (8 sub-modules) | ❌ | ❌ | ✅ |

### Hermes AI Tool Permissions

| Tool Category | Staff | Admin | Developer |
|---|:---:|:---:|:---:|
| Query (`query_stats`, `search_*`) | ✅ | ✅ | ✅ |
| Details (`get_member_details`, `get_case_details`) | ✅ | ✅ | ✅ |
| Dashboard (`get_dashboard_analytics`, `get_donations_summary`) | ✅ | ✅ | ✅ |
| Compliance (`compliance_status`, `list_programmes`) | ✅ | ✅ | ✅ |
| Create/Update (`create_member`, `create_case`, etc.) | ❌ | ✅ | ✅ |
| Case Workflow (`update_case_status`, `add_case_note`) | ❌ | ✅ | ✅ |
| Financial (`create_donation`, `create_disbursement`) | ❌ | ✅ | ✅ |
| Administration (`manage_skill`, `risk_assessment`) | ❌ | ❌ | ✅ |
| Navigation (`navigate_to`) | ✅ | ✅ | ✅ |
| Memory (`manage_memory`) | ✅ | ✅ | ✅ |

---

## 🤖 Hermes — AI Assistant

Hermes is an autonomous AI assistant inspired by the **NousResearch Hermes Agent** architecture. It learns from every interaction and improves over time.

### Architecture & Workflow

```
User Input
  → Hermes Store (Zustand)
  → POST /api/v1/hermes/chat
    → Build System Prompt (context + memory + skills + module descriptions)
    → Call LLM Provider (Z-AI / OpenRouter / Ollama)
    → Parse Tool Calls (<<TOOL:name>>{}<</TOOL>> or native function calling)
    → Execute Tool Chain (up to 5 steps)
      → Each step: parse → execute → format result → feed back to LLM
    → Format Final Response (with tool results)
    → Extract & Save Memory (non-blocking, background)
    → Save Conversation to DB (non-blocking)
    → Return Response (with optional SSE streaming)
  → Hermes Store updates (messages, steps, status)
  → UI renders response + execution trace
```

### Multi-Provider LLM Support

| Provider | Type | Cost | Description |
|---|---|---|---|
| **Z-AI SDK** | Cloud | Free | Default provider, no configuration needed |
| **OpenRouter** | Cloud | Free + Paid | 200+ models, native function calling support |
| **Ollama** | Local | Free | Privacy-first, local inference, custom base URL |

Provider switching is per-user via HermesProviderConfig in the database. The system automatically detects the best calling method (SSE streaming for OpenRouter/Ollama, SDK for Z-AI).

### Tool Registry (30+)

#### Query Tools (Read-only)
| Tool | Description |
|---|---|
| `query_stats` | Aggregate statistics for any module |
| `search_members` | Search asnaf members by name, IC, city, income |
| `search_cases` | Search cases by status, priority, category |
| `search_donors` | Search donors by name, segment, status |
| `search_volunteers` | Search volunteers by name, skills |
| `search_disbursements` | Search disbursements by status, date |
| `get_member_details` | Full member profile with household, cases, disbursements |
| `get_case_details` | Full case details with notes, documents, disbursements |
| `get_donations_summary` | Donation summary by fund type with time filtering |
| `list_programmes` | Programme list with budget & beneficiary stats |
| `compliance_status` | Compliance progress with category breakdown |
| `get_dashboard_analytics` | Cross-module dashboard metrics |

#### CRUD Tools (Write)
| Tool | Description |
|---|---|
| `create_member` | Register new asnaf member (with IC duplicate check) |
| `update_member` | Update member details (partial update) |
| `create_case` | Create new assistance case |
| `update_case_status` | Advance case through workflow stages |
| `add_case_note` | Add note to existing case |
| `create_donation` | Record new donation |
| `create_disbursement` | Create disbursement record |
| `update_disbursement_status` | Update disbursement status |

#### Analytics Tools
| Tool | Description |
|---|---|
| `analyze_trends` | Analyze data trends across modules |
| `generate_report` | Generate formatted reports |
| `risk_assessment` | Assess risk for cases or members |

#### System Tools
| Tool | Description |
|---|---|
| `navigate_to` | Navigate user to a different module (client-side) |
| `manage_memory` | Store/retrieve/update persistent memories |
| `manage_skill` | Create/update/deactivate skills |
| `search_documents` | Search document repository |
| `export_data` | Export data in various formats |

### Self-Improving Skills System

Skills are **SKILL.md-formatted** instructions that are automatically injected into the system prompt when triggered:

- **12 default seeded skills** covering core workflows
- Skills are **auto-created** from successful complex interactions
- Each skill tracks `usageCount` and `successRate` for quality scoring
- Skills can be `auto | manual | imported` sources
- Version tracking with automatic updates
- Pattern-based triggering (`triggerPatterns` JSON array)

### Persistent Memory System

Hermes maintains 5 categories of persistent memory per user:

| Category | Description | Example |
|---|---|---|
| **preference** | User preferences | "Prefers Malay language responses" |
| **fact** | User facts | "Works at Hulu Klang branch" |
| **procedure** | Learned workflows | "When creating urgent case, always add verification note" |
| **relationship** | Professional relationships | "Dr. Siti is the compliance adviser" |
| **context** | Situational context | "Currently processing Ramadhan donations" |

Features:
- **Auto-extraction** from conversations (non-blocking)
- **Confidence scoring** (0.0–1.0)
- **Access tracking** (count + last accessed timestamp)
- **Relevance-based recall** during prompt building
- Unique constraint on `(userId, key)` to prevent duplicates

---

## 🗄️ Database Schema

### 35+ Prisma Models

#### Core Business
| Model | Purpose | Key Fields |
|---|---|---|
| **User** | System users | email, password, role (staff/admin/developer), isActive |
| **Member** | Asnaf beneficiaries | memberNumber (PUSPA-XXXX), ic, householdSize, monthlyIncome |
| **HouseholdMember** | Member's household | relationship, age, isOKU, isStudent |
| **Case** | Assistance cases | caseNumber, 12-step status, verificationScore, welfareScore |
| **CaseNote** | Case notes | type (note/call/visit/assessment/status_change) |
| **CaseDocument** | Case documents | url, type |

#### Finance
| Model | Purpose | Key Fields |
|---|---|---|
| **Donation** | Financial donations | donationNumber, fundType (zakat/sedekah/wakaf/infak), shariahCompliant |
| **Disbursement** | Payments | disbursementNumber, scheduledDate, processedDate |
| **Donor** | Donor CRM | segment (major/regular/occasional/lapsed), totalDonated |
| **DonorCommunication** | Donor outreach | type, subject, status |
| **TaxReceipt** | Tax receipts | receiptNumber, lhdnRef |

#### Programmes
| Model | Purpose | Key Fields |
|---|---|---|
| **Programme** | Assistance programmes | category, budget, totalSpent, beneficiaries |
| **Activity** | Operational activities | type, status (Kanban-style), order |
| **Volunteer** | Volunteers | volunteerNumber, skills, totalHours |
| **VolunteerDeployment** | Volunteer assignments | role, status, date range |
| **VolunteerHourLog** | Hour tracking | hours, approvedBy, status |
| **VolunteerCertificate** | Certificates | certificateNumber, totalHours |

#### Organization
| Model | Purpose | Key Fields |
|---|---|---|
| **OrganizationProfile** | NGO registration | PPM-006-14-14032020, bankVerified, isTaxExempt |
| **BoardMember** | Board of directors | role (chairman/treasurer/etc.), isCurrent |
| **Partner** | External partners | type (masjid/ngo/government/foundation), verifiedStatus |
| **ImpactMetric** | Programme impact | selfReportedValue, verifiedValue, verificationSource |
| **PublicReport** | Published reports | type, year, status |
| **Branch** | Branch offices | code, isActive |
| **ComplianceChecklist** | Audit checklist | category, isCompleted, evidenceUrl |

#### Security & Identity
| Model | Purpose | Key Fields |
|---|---|---|
| **EKYCVerification** | Identity verification | livenessScore, faceMatchScore, bnmCompliant, amlaScreening |
| **SecuritySettings** | User security | biometricTransactions, boundDeviceOnly, sessionTimeout |
| **DeviceBinding** | Device trust | deviceFingerprint, isPrimary, isTrusted |
| **SecurityLog** | Security events | action, method, status, ipAddress |
| **BotApiKey** | Service accounts | keyPrefix (psbot_*), permissions (JSON), expiresAt |

#### AI & Operations
| Model | Purpose | Key Fields |
|---|---|---|
| **HermesConversation** | AI conversations | userId, provider, model, viewContext |
| **HermesMessage** | AI messages | role, content, toolCalls (JSON), tokensUsed, latencyMs |
| **HermesSkill** | Self-learned skills | name, instructions, triggerPatterns, usageCount, successRate |
| **HermesMemory** | Persistent memory | category (5 types), key, value, confidence |
| **HermesProviderConfig** | Per-user AI config | provider (zai/openrouter/ollama), model, apiKey, baseUrl |
| **WorkItem** | Ops work items | intent, status, priority, currentStep, blockerReason |
| **ExecutionEvent** | Execution traces | type, toolName, latencyMs, status |
| **Artifact** | Work outputs | type, title, pathOrRef |
| **AutomationJob** | Scheduled jobs | kind (one_time/cron/fixed_rate), expr, tz, isEnabled |

#### System
| Model | Purpose |
|---|---|
| **AuditLog** | Full action audit trail |
| **Notification** | User notifications |
| **Document** | Document management with versioning |
| **Capture** | Generic data captures |

### Switching to PostgreSQL

```bash
# Set environment variables
DATABASE_PROVIDER=postgresql
POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/puspa

# Push schema
bun run db:push
```

Separate schema files are available:
- `prisma/schema.prisma` — SQLite (default)
- `prisma/schema.postgres.prisma` — PostgreSQL

The Vercel build script automatically switches schemas when `DATABASE_PROVIDER=postgresql` is set.

---

## 🛣️ API Reference

50+ REST API endpoints under `/api/v1/`:

### Authentication

| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler |
| `/api/v1/auth/login` | POST | Login with email + password |
| `/api/v1/auth/logout` | POST | Clear session cookie |
| `/api/v1/auth/me` | GET | Current user profile |

### Core CRUD

| Route | Description |
|---|---|
| `/api/v1/dashboard` | Dashboard summary & analytics |
| `/api/v1/dashboard/stats` | Aggregate statistics |
| `/api/v1/dashboard/monthly-donations` | Monthly donation chart data |
| `/api/v1/dashboard/activities` | Recent activities |
| `/api/v1/dashboard/member-distribution` | Member distribution |
| `/api/v1/members` | Member CRUD |
| `/api/v1/cases` | Case CRUD |
| `/api/v1/donations` | Donation CRUD |
| `/api/v1/donors` | Donor CRUD |
| `/api/v1/donors/[id]` | Single donor |
| `/api/v1/donors/options` | Donor dropdown options |
| `/api/v1/donors/communications` | Communication CRUD |
| `/api/v1/donors/receipts` | Tax receipt CRUD |
| `/api/v1/disbursements` | Disbursement CRUD |
| `/api/v1/programmes` | Programme CRUD |
| `/api/v1/activities` | Activity CRUD |
| `/api/v1/volunteers` | Volunteer CRUD |
| `/api/v1/volunteers/[id]` | Single volunteer |
| `/api/v1/volunteers/certificates` | Certificate CRUD |
| `/api/v1/volunteers/deployments` | Deployment CRUD |
| `/api/v1/volunteers/hours` | Hour log CRUD |
| `/api/v1/volunteers/options` | Volunteer dropdown options |
| `/api/v1/documents` | Document CRUD |
| `/api/v1/documents/stats` | Document statistics |
| `/api/v1/notifications` | Notification CRUD |
| `/api/v1/branches` | Branch CRUD |
| `/api/v1/partners` | Partner CRUD |
| `/api/v1/board-members` | Board member CRUD |
| `/api/v1/users` | User management |
| `/api/v1/audit` | Audit log |
| `/api/v1/organization` | Organization profile |

### Compliance & Identity

| Route | Description |
|---|---|
| `/api/v1/compliance` | Compliance checklists |
| `/api/v1/compliance/pdpa` | PDPA-specific checklist |
| `/api/v1/compliance/ros` | ROS-specific checklist |
| `/api/v1/ekyc` | eKYC management |
| `/api/v1/ekyc/verify` | eKYC verification |
| `/api/v1/ekyc/reject` | eKYC rejection |
| `/api/v1/ekyc/vision` | AI vision-based IC verification |
| `/api/v1/tapsecure/devices` | Device management |
| `/api/v1/tapsecure/devices/primary` | Primary device designation |
| `/api/v1/tapsecure/biometric` | Biometric operations |
| `/api/v1/tapsecure/settings` | Security settings |
| `/api/v1/tapsecure/logs` | Security event logs |

### Hermes AI

| Route | Method | Description |
|---|---|---|
| `/api/v1/hermes/chat` | POST | AI chat (SSE streaming supported) |
| `/api/v1/hermes/config` | GET/PUT | Provider configuration |
| `/api/v1/hermes/conversations` | GET | Chat history |
| `/api/v1/hermes/skills` | GET/POST | Skill management |

### Ops Conductor

| Route | Description |
|---|---|
| `/api/v1/ops/dashboard` | Ops dashboard summary |
| `/api/v1/ops/work-items` | Work item CRUD + filtering |
| `/api/v1/ops/work-items/[id]` | Single work item |
| `/api/v1/ops/work-items/[id]/events` | Execution events |
| `/api/v1/ops/work-items/[id]/approve` | Approval workflow |
| `/api/v1/ops/work-items/approve/decision` | Approval decision |
| `/api/v1/ops/work-items/resume` | Resume paused work items |
| `/api/v1/ops/automations` | Automation CRUD |
| `/api/v1/ops/automations/[id]` | Single automation |
| `/api/v1/ops/stats` | Ops statistics |
| `/api/v1/ops/projects` | Projects |
| `/api/v1/ops/artifacts` | Artifacts |
| `/api/v1/ops/intent` | Intent detection |
| `/api/v1/ops/bulk` | Bulk operations |

### Bot API

Service account endpoints using `psbot_*` API key authentication:

| Route | Description |
|---|---|
| `/api/v1/bot/dashboard` | Bot dashboard data |
| `/api/v1/bot/donations` | Bot donation queries |
| `/api/v1/bot/ekyc` | Bot eKYC queries |
| `/api/v1/bot/members` | Bot member queries |
| `/api/v1/bot/keys` | API key management |
| `/api/v1/bot/ecoss-rpa` | ECOSS RPA integration |
| `/api/v1/bot/cases` | Bot case queries |

### Integrations

| Route | Description |
|---|---|
| `/api/v1/integrations/whatsapp` | WhatsApp webhook endpoint |
| `/api/v1/openclaw/status` | OpenClaw gateway status |
| `/api/v1/openclaw/snapshot` | Full system snapshot |
| `/api/v1/ai/analytics` | AI analytics |
| `/api/v1/ai/chat` | AI chat (alternative endpoint) |
| `/api/v1/reports` | Report generation |
| `/api/v1/reports/financial` | Financial reports |

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| **NextAuth JWT** | Session tokens with role-based claims |
| **HMAC Session Tokens** | Custom PUSPA tokens signed with HMAC-SHA256 (12-hour expiry) |
| **Bot API Keys** | Service account keys (`psbot_*` prefix) with SHA-256 hashing |
| **Rate Limiting** | In-memory IP-based rate limiter (100 req/min, configurable) |
| **Audit Trail** | Full action logging with userId, IP, entity, and details |
| **Row-Level Security** | Branch-scoped data access helpers (placeholder) |
| **eKYC** | Identity verification with OCR, liveness detection, face matching |
| **TapSecure** | Biometric approval, device binding, trusted device management |
| **Password Hashing** | Node.js crypto `scrypt` (N=16384, r=8, p=2) — NOT bcrypt |
| **Secure Uploads** | MIME whitelist, size limits, path traversal protection |
| **Trusted Proxy** | Configurable trusted proxy IPs for rate limiting |
| **Middleware Guard** | All routes protected except `/api/auth/*`, `/login`, `/public` |
| **Auto Password Migration** | Plain-text passwords auto-migrated to scrypt on first login |

---

## ⚙️ Environment Variables

### Required

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Primary database connection URL | `file:./db/custom.db` |
| `NEXTAUTH_SECRET` | JWT signing secret (required in production) | `your-super-secret-key` |
| `NEXTAUTH_URL` | Base URL for NextAuth (auto-detected on Vercel) | `http://localhost:3000` |

### Optional — Database

| Variable | Description |
|---|---|
| `DATABASE_PROVIDER` | Set to `postgresql` to switch Prisma schema |
| `POSTGRES_PRISMA_URL` | PostgreSQL connection URL |
| `POSTGRES_URL` | Generic PostgreSQL URL |
| `SUPABASE_DB_URL` | Supabase PostgreSQL URL |

### Optional — Authentication

| Variable | Description |
|---|---|
| `PUSPA_SESSION_SECRET` | Custom PUSPA token signing secret |
| `API_SECRET_KEY` | Fallback secret for session/operator |
| `PUSPA_OPERATOR_PASSWORD` | Operator default login password |
| `PUSPA_OPERATOR_ROLE` | Operator default role |

### Optional — AI Providers

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key for 200+ models |
| `OPENCLAW_BRIDGE_URL` | OpenClaw bridge endpoint |
| `OPENCLAW_BRIDGE_TOKEN` | OpenClaw bridge auth token |
| `OPENCLAW_GATEWAY_URL` | OpenClaw gateway URL |
| `OPENCLAW_GATEWAY_TOKEN` | OpenClaw gateway auth |
| `OPENCLAW_AGENT_MODEL` | Default agent model name |

### Optional — Integration

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `TRUSTED_PROXY_IPS` | Comma-separated trusted proxy IPs |

### Example `.env`

```env
# Database
DATABASE_URL=file:./db/custom.db

# Authentication
NEXTAUTH_SECRET=change-this-to-a-secure-random-string
NEXTAUTH_URL=http://localhost:3000

# AI Providers (optional — Z-AI works out of the box)
# OPENROUTER_API_KEY=sk-or-...

# PostgreSQL (optional — for production)
# DATABASE_PROVIDER=postgresql
# POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/puspa
```

---

## 🚢 Deployment

### Production Build

```bash
# Build for production
bun run build

# Start production server
bun run start
```

The build command runs `prisma generate && next build`. The start command runs the standalone server with output logging.

### Deploy to Vercel

PUSPA V4 includes a `vercel-build` script that automatically switches to PostgreSQL schema when `DATABASE_PROVIDER=postgresql` is set.

**Step 1: Set up PostgreSQL database**

Use Vercel Postgres, Neon, Supabase, or any PostgreSQL provider.

**Step 2: Configure Vercel environment variables**

In your Vercel project settings, add:

```env
DATABASE_PROVIDER=postgresql
POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/puspa?sslmode=require
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

**Step 3: Deploy**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

**Important Notes for Vercel:**
- SQLite **will not work** on Vercel (serverless, no persistent filesystem)
- You **must** use PostgreSQL (`DATABASE_PROVIDER=postgresql`)
- Set `NEXTAUTH_URL` to your Vercel deployment URL
- The `vercel-build` script handles schema switching automatically
- `NEXTAUTH_URL` is auto-detected from `VERCEL_URL` if not set

### Docker (Planned)

Docker support is planned for future releases. The standalone build output (`next build`) is compatible with containerized deployments.

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Development** | `bun run dev` | Start dev server on port 3000 (Turbopack) |
| **Build** | `bun run build` | Generate Prisma client + production build |
| **Start** | `bun run start` | Start production server (standalone) |
| **Lint** | `bun run lint` | Run ESLint with Next.js config |
| **DB Push** | `bun run db:push` | Push Prisma schema to database |
| **DB Generate** | `bun run db:generate` | Generate Prisma client |
| **DB Migrate** | `bun run db:migrate` | Run Prisma migrations |
| **DB Reset** | `bun run db:reset` | Reset database (⚠️ destructive) |
| **DB Seed** | `bun run db:seed` | Seed with demo data |
| **Vercel Build** | `vercel-build` | Auto-switch schema + build for Vercel |
| **Post Install** | `postinstall` | Auto-generate Prisma client |

---

## 🎨 Design System

PUSPA V4 uses a **Zinc/Black/Emerald** design system inspired by Stripe and Linear.app:

| Element | Token | Color |
|---|---|---|
| **Primary** | `--primary` | Emerald (green-500) |
| **Background** | `--background` | White (light) / Zinc-950 (dark) |
| **Foreground** | `--foreground` | Zinc-950 (light) / Zinc-50 (dark) |
| **Card** | `--card` | White/Zinc-900 |
| **Accent** | `--accent` | Zinc-100/Zinc-800 |
| **Muted** | `--muted` | Zinc-100/Zinc-800 |
| **Border** | `--border` | Zinc-200/Zinc-800 |
| **Destructive** | `--destructive` | Red-500 |

### UI Components
- **45+ shadcn/ui components** (New York style, Radix UI primitives)
- **Lucide icons** throughout the application
- **Framer Motion** for animations (hover, focus, page transitions)
- **Responsive breakpoints**: mobile-first with `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Dark/Light mode**: Full `next-themes` support with system preference detection
- **Touch-friendly**: Minimum 44px touch targets for interactive elements
- **Custom scrollbar styling** for long lists (`max-h-96 overflow-y-auto`)

---

## 🌍 Internationalization

PUSPA V4 is **bilingual** with **Bahasa Melayu** as the primary language:

- **UI Labels**: Malay by default with English alternatives
- **AI Responses**: Auto-detects user language (Malay/English) and responds accordingly
- **Navigation**: Malay module names with English descriptions
- **Domain Values**: Bilingual status labels and aliases (e.g., "aktif"/"active")
- **Command Palette**: Searches in both Malay and English
- **Error Messages**: Bilingual error descriptions

Language detection is handled by `src/lib/hermes/lang-detect.ts` for AI responses, and `src/lib/domain.ts` for UI value normalization.

---

## 🔌 Plugin System

PUSPA V4 includes a **Tapable-based** plugin architecture:

```typescript
// Plugin hooks available:
beforeCaseCreate    // Pre-process case data
onDonationReceived  // Trigger on new donation
onAppBoot           // Initialize on app startup
```

### Plugin Structure
- **Registry** (`src/lib/plugins/core/registry.ts`) — Tapable hook system
- **Types** (`src/lib/plugins/core/types.ts`) — Plugin interface with metadata, hooks, components
- **Market Plugin** (`src/lib/plugins/market/puspa-analytics-pro.tsx`) — Example analytics plugin
- **PluginSlot** component — Renders plugin components by slot name
- **ErrorBoundary** — Plugin error isolation (plugin crashes don't affect the app)

---

## 🔧 Troubleshooting

### Common Issues

**Build Error: Module not found**
```bash
# Clear Next.js cache
rm -rf .next
bun run dev
```

**Database connection error**
```bash
# Verify DATABASE_URL in .env
# Re-push schema
bun run db:push
```

**Prisma client out of sync**
```bash
# Regenerate Prisma client
bun run db:generate
```

**Turbopack cache corruption**
```bash
# Full cache clear
rm -rf .next node_modules/.cache
bun run dev
```

**Login not working after role change**
- Clear browser cookies and localStorage
- The app stores state in `puspa-app-state`, `puspa-ai-state`, `puspa-ops-state` (localStorage)
- Hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`

**SQLite to PostgreSQL migration**
```bash
# 1. Set environment variables
export DATABASE_PROVIDER=postgresql
export POSTGRES_PRISMA_URL=postgresql://user:pass@host:5432/puspa

# 2. If using separate schema file
cp prisma/schema.postgres.prisma prisma/schema.prisma

# 3. Push schema
bun run db:push

# 4. Seed data
bun run db:seed
```

---

## 🤝 Contributing Guide

1. **Fork** this repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a **Pull Request**

### Code Conventions

- **TypeScript** strict mode throughout the project
- **ES6+** import/export syntax only
- **shadcn/ui** components preferred over custom implementations
- `'use client'` and `'use server'` directives for client/server boundary
- **Tailwind CSS** for styling (no CSS modules)
- **Prisma** for all database operations
- **API Routes** (not server actions) for backend logic
- **Zustand** for client state management
- **React Hook Form + Zod** for form validation
- **Conventional commits** for commit messages

### Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code refactoring
- `docs/` — Documentation updates
- `chore/` — Maintenance tasks

---

## 📄 License

Copyright © 2024–2026 Pertubuhan Urus Peduli Asnaf (PUSPA). All rights reserved.

This project is proprietary software. Distribution, modification, or use without written permission from PUSPA is prohibited.

---

<div align="center">

**🌺 PUSPA V4** — _Cerdas. Mesra. Sentiasa di sisi anda._

Built with ❤️ for the asnaf community

</div>
