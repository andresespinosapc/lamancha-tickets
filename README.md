# La Mancha Tickets

A full-stack event ticketing platform built for a music festival, designed around one core constraint: **the venue has no reliable internet connection**.

The system uses AES-256-CBC encrypted QR codes that encode all ticket data directly into the code itself. Guards at the entrance scan tickets and verify them by decrypting the payload locally — no network request needed. Validations are recorded on a local server at the venue and synced to the cloud once connectivity is available.

## The Problem

Selling tickets for an event is straightforward until you need to validate them at a venue with poor connectivity. Most ticketing systems require a server lookup to verify each ticket, which fails without internet. Building an offline-first validation system that is also tamper-proof required a different approach.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        TICKET LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SALE                    2. COMPLETION                       │
│  ┌──────────┐               ┌──────────────┐                   │
│  │ Seller   │──generates──▶ │ Blank Ticket │                   │
│  │(ambassador)│  (email only)│ (no QR yet)  │                   │
│  └──────────┘               └──────┬───────┘                   │
│                                    │ customer fills             │
│                                    │ personal data              │
│                                    ▼                            │
│                             ┌──────────────┐                   │
│                             │  Complete    │                    │
│                             │  Ticket + QR │                    │
│                             └──────┬───────┘                   │
│                                    │                            │
│  3. VALIDATION (OFFLINE)           ▼                            │
│  ┌──────────┐  scan   ┌───────────────────┐                   │
│  │  Guard   │────────▶│ Decrypt QR code   │                   │
│  │ (device) │         │ AES-256-CBC       │                   │
│  └──────────┘         │ ─────────────────  │                   │
│                       │ ✓ Ticket ID       │                    │
│                       │ ✓ Attendee name   │                    │
│                       │ ✓ Ticket type     │                    │
│                       │ ✓ Tampering check │                    │
│                       └────────┬──────────┘                   │
│                                │                                │
│  4. SYNC                       ▼                                │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐  │
│  │ Local Server │───▶│  Batch sync     │───▶│ Cloud Server │  │
│  │ (at venue)   │    │  when online    │    │ (Vercel)     │  │
│  └──────────────┘    └─────────────────┘    └──────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Offline Validation

When a ticket is completed, the system encrypts the attendee data (name, document ID, ticket type) using AES-256-CBC with a private key. This encrypted payload becomes the QR code. At the venue, guards decrypt the QR locally — if decryption succeeds, the ticket is authentic. If the payload has been tampered with, decryption fails and the ticket is rejected. No database lookup required.

### Dual-Server Architecture

- **Global server** (cloud): Handles ticket sales, email delivery, and serves as the central database.
- **Local server** (venue laptop): Runs the same app in `local` mode. Guards validate tickets against this server. Validations are stored locally and synced to the global server via authenticated API calls when internet becomes available. A unique constraint on `(ticketId, guardId, validatedAt)` prevents duplicate records during sync.

### Ambassador Sales Model

Tickets are sold through "ambassadors" — people in their social circles who promote and sell tickets. Each ambassador:
- Generates **blank tickets** by entering only the buyer's email
- The buyer receives a link to complete their personal data and generate their QR
- Ambassadors have a dashboard to track their sales and resend emails
- A configurable limit (`MAX_TICKETS_PER_SELLER`) prevents overselling

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| API | tRPC v11 (end-to-end type safety) |
| Database | PostgreSQL + Prisma ORM |
| Auth | Custom JWT in HTTP-only cookies, role-based access (admin, seller, guard, user) |
| Encryption | AES-256-CBC (Node.js `crypto`) for QR payloads |
| Email | Nodemailer with branded HTML templates and inline QR codes |
| UI | Tailwind CSS + Radix UI primitives |
| Deployment | Vercel (global) + local Node.js instance (venue) |

## Key Technical Decisions

- **Encrypted QR over signed tokens**: Using AES encryption instead of JWT-style signatures means the QR payload is opaque — attendee data is not readable without the private key, adding a privacy layer on top of tamper protection.
- **Hashids for URLs**: Ticket URLs use Hashids instead of raw database IDs to prevent enumeration and make links non-guessable.
- **No explicit ticket status field**: A ticket's completion state is inferred from whether a `redemptionCode` exists (`null` = blank, present = complete). This avoids status synchronization bugs.
- **Service layer pattern**: Business logic lives in dedicated services (`TicketService`, `ValidationService`, `SyncService`), keeping tRPC routers thin and testable.
- **Zod environment validation**: All environment variables are validated at build time via `@t3-oss/env-nextjs`. Missing variables fail the build instead of causing runtime errors.

## Project Structure

```
src/
├── app/                        # Next.js pages and API routes
│   ├── _components/            # Page-specific UI components
│   ├── admin/                  # Admin dashboard (tickets, validations, sync)
│   ├── tickets/[ticketHashid]/ # Public ticket completion flow
│   └── api/
│       ├── trpc/               # tRPC HTTP handler
│       └── sync/               # Cross-server sync endpoint
├── server/
│   ├── api/routers/            # tRPC routers (auth, ticket, user, validation)
│   ├── services/               # Business logic
│   │   ├── ticket.ts           # Ticket generation, completion, QR encryption
│   │   ├── validation.ts       # QR decryption and validation logic
│   │   ├── sync.ts             # Local-to-global sync
│   │   ├── encryption.ts       # AES-256-CBC encrypt/decrypt
│   │   └── email.ts            # Transactional email with Nodemailer
│   └── db.ts                   # Prisma client singleton
├── components/                 # Shared UI components
└── env.js                      # Zod environment validation
```

## Running Locally

```bash
npm install
./start-database.sh         # Start PostgreSQL in Docker
npm run db:push             # Push schema to database
npm run dev                 # Start development server
```

## License

This project is licensed under the [MIT License](LICENSE).
