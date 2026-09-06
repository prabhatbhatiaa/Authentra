# AUTHENTRA

Authentra is a production-grade enterprise platform for digital identity, role-based access control (RBAC), digital-asset verification, and immutable blockchain auditing on Aptos.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   React Client (Vite)                  │
│   Tailwind CSS • TanStack Query • Framer Motion        │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JSON REST
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express API Engine                   │
│   Auth • Identity • RBAC • Assets • Audit • Verify     │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐┌───────────────────────────┐
│     PostgreSQL + Prisma   ││   Aptos Blockchain / Move │
│ (Indexed State & Metadata)││ (Immutable Source of Truth)
└───────────────────────────┘└───────────────────────────┘
```

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **PostgreSQL**: v14+ running locally or managed
- **Aptos CLI**: (For Move contract development in Task 7)

### 2. Environment Setup
Copy the example environment template:
```bash
cp .env.example .env
```
Update database connection strings and secrets in `.env`.

### 3. Installation
Install root dependencies and all workspaces:
```bash
npm install
```

### 4. Running the Platform
Start both server and client concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts server & client concurrently in hot-reload mode |
| `npm run dev:server` | Starts Express backend with `tsx watch` |
| `npm run dev:client` | Starts Vite React frontend |
| `npm run build` | Compiles TypeScript and builds production bundles |
| `npm run lint` | Runs linter checks across all workspaces |
| `npm run test` | Runs the automated test suite |

---

## Project Structure

- `client/`: React + TypeScript frontend application
- `server/`: Express + TypeScript API engine
- `contracts/`: Aptos Move smart contracts
- `prisma/`: PostgreSQL schema and migrations
- `docs/`: In-depth platform documentation
- `CHANGES.md`: Step-by-step modification audit
- `PROGRESS.md`: Detailed engineering progress journal
