# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a T3 Stack ticket management system for events, built with Next.js 15, tRPC, Prisma, NextAuth, and Tailwind CSS. The application allows sellers to generate and sell tickets, users to purchase tickets, and admins to manage the event.

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
./start-database.sh            # Start PostgreSQL in Docker
npm run db:push                # Push schema to database
npm run db:generate            # Generate Prisma migrations
```

### Development
```bash
npm run dev                    # Start dev server with Turbo
npm run db:studio              # Open Prisma Studio
npm run create_user            # Run user creation script
```

### Code Quality
```bash
npm run check                  # Run linter and type check
npm run lint                   # Run ESLint
npm run lint:fix               # Auto-fix lint issues
npm run typecheck              # Run TypeScript compiler check
npm run format:check           # Check code formatting
npm run format:write           # Auto-format code
```

### Database
```bash
npm run db:push                # Push schema changes to DB
npm run db:migrate             # Deploy migrations
npm run db:format              # Format Prisma schema
npm run db:studio              # Open Prisma Studio GUI
```

### Build & Deploy
```bash
npm run build                  # Build for production
npm run preview                # Build and start locally
npm start                      # Start production server
```

### Vercel
```bash
vercel ls                      # List all deployments
vercel inspect <url> --logs    # Get build logs for a deployment
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **API**: tRPC v11 for type-safe API layer
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Custom JWT-based authentication (cookie-based tokens)
- **UI**: React, Tailwind CSS, Radix UI components
- **State**: TanStack Query (React Query) for server state

### Directory Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── _components/          # Page-specific components
│   ├── api/                  # API route handlers
│   │   ├── auth/[...nextauth]  # NextAuth route (legacy)
│   │   └── trpc/[trpc]       # tRPC endpoint
│   └── tickets/[ticketHashid]  # Dynamic ticket routes
├── server/                   # Backend logic
│   ├── api/                  # tRPC routers and procedures
│   │   ├── routers/          # Domain-specific routers
│   │   │   ├── auth.ts       # Authentication endpoints
│   │   │   ├── ticket.ts     # Ticket management
│   │   │   ├── ticketType.ts # Ticket type config
│   │   │   └── user.ts       # User management
│   │   ├── root.ts           # Root router (combines all routers)
│   │   └── trpc.ts           # tRPC context, middleware, procedures
│   ├── auth/                 # Authentication logic
│   ├── services/             # Business logic services
│   │   ├── email.ts          # Email sending with Nodemailer
│   │   ├── encryption.ts     # AES encryption for redemption codes
│   │   ├── hashid.ts         # Hashids for obfuscated IDs
│   │   ├── ticket.ts         # Ticket service layer
│   │   └── user.ts           # User service layer
│   └── db.ts                 # Prisma client singleton
├── trpc/                     # tRPC client configuration
│   ├── react.tsx             # React hooks provider
│   ├── server.ts             # Server-side caller
│   └── query-client.ts       # TanStack Query config
├── components/               # Shared UI components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions
└── env.js                    # Environment variable validation

prisma/
├── schema.prisma             # Database schema
└── migrations/               # Database migrations
```

### Key Architecture Patterns

#### Authentication Flow
- Custom JWT-based authentication stored in HTTP-only cookies
- Authentication happens in `src/server/api/trpc.ts` via `getUserFromCookies()`
- Context includes `session.user` which is populated from JWT token
- Protected procedures use `createProtectedProcedure(roles)` middleware
- Role-based access control with `user`, `seller`, and `admin` roles

#### tRPC Procedures
- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires authenticated user
- `createProtectedProcedure([roles])`: Role-based protection (e.g., `['admin', 'seller']`)
- All routers are combined in `src/server/api/root.ts` as the `appRouter`

#### Ticket System
- Tickets can be "blank" (incomplete attendee data) or "complete"
- Blank tickets are sent via email with a hashid URL to complete
- Completed tickets generate an encrypted `redemptionCode` containing ticket and attendee data
- Hashids are used to obfuscate ticket IDs in URLs (see `src/server/services/hashid.ts`)
- Redemption codes use AES encryption with a private key (see `src/server/services/ticket.ts`)

#### Database Models
- **User**: Authentication and role management (user/seller/admin)
- **Attendee**: Ticket holder information
- **Ticket**: Links attendee to ticket type and optional seller
- **TicketType**: Event ticket categories with pricing
- **SellerInfo**: Seller contact methods and payment API keys (encrypted)
- **MoneyAccount/MoneyTransaction**: Internal transaction tracking

#### Environment Variables
All environment variables are validated via `src/env.js` using Zod schemas. Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing key
- `HASHIDS_SALT`: Salt for hashid generation
- `REDEMPTION_CODE_PRIVATE_KEY`: Key for redemption code encryption
- `SMTP_*`: Email configuration (host, port, user, password)
- `FRONTEND_BASE_URL`: Base URL for email links
- `EVENT_NAME`: Name of the event
- `MAX_TICKETS_PER_SELLER`: Ticket limit per seller

## Code Conventions

### Commit Messages
This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

**Format:** `<type>(<scope>): <description>`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config, etc.)

**Scope (optional):** Area of the codebase affected (e.g., `tickets`, `auth`, `ui`)

**Examples:**
```
feat(tickets): add date column to My Tickets table
fix(auth): resolve token expiration issue
refactor(api): simplify ticket validation logic
docs: update README with setup instructions
```

### File Naming
- **Always use English** for file and directory names
- **Use lowercase** for files in the `docs/` directory (e.g., `functionality.md`, `api-guide.md`)
- Follow existing patterns in other directories (camelCase for components, kebab-case for utilities)

## Important Notes

- The database runs in Docker using `./start-database.sh`
- Prisma generates types on `postinstall`, so run `npm install` after schema changes
- Use `npm run create_user` script to manually create users with specific roles
- All tRPC procedures include a timing middleware that logs execution time
- Development mode adds artificial 100-400ms delays to catch waterfalls
- Seller API keys (Flow, MercadoPago) are stored encrypted in the database
