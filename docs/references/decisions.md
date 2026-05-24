# MentorMatch - Architectural Decisions

> Record of all architectural and product decisions with rationale.
> Add new decisions as they are made.

## Format

Each decision follows this format:
```
## [ID] - [Title] (Status: [proposed|accepted|deprecated])

**Date**: [YYYY-MM-DD]
**Context**: [Why this decision was needed]
**Decision**: [What was decided]
**Rationale**: [Why this choice]
**Consequences**: [Impact of this decision]
```

---

## [D001] - Tech Stack Selection (Status: proposed)

**Date**: 2026-05-23
**Context**: Need to choose stack that works entirely within Vercel ecosystem for beginner-friendly deployment
**Decision**: Next.js 15 + TypeScript + Tailwind + shadcn/ui + Prisma + Vercel Postgres
**Rationale**:
- Next.js: Full-stack framework, works seamlessly on Vercel
- TypeScript: Type safety for maintainable code
- Tailwind + shadcn/ui: Rapid UI development with consistent design system
- Prisma: Type-safe ORM with excellent Vercel Postgres integration
- Vercel Postgres: Managed database, zero config on Vercel platform
- NextAuth.js: Auth ready-to-use with magic link support
- Resend: Email delivery via Vercel marketplace
**Consequences**: Single platform deployment, but locked into Vercel ecosystem

## [D002] - Multi-Tenancy Strategy (Status: proposed)

**Date**: 2026-05-23
**Context**: Need to support multiple companies with isolation
**Decision**: Subdomain-based multi-tenancy with shared database
**Rationale**:
- Subdomain approach (`empresa.mentormatch.app`) is clean and user-friendly
- Shared database with `tenantId` column on relevant tables is simpler for MVP
- Row-level security via middleware ensures data isolation
**Alternatives considered**: Separate database per tenant (too complex), path-based (`/empresa/...`) (less professional)
**Consequences**: All tenant data in one DB - need strict RLS; easier backup/maintenance

## [D003] - Authentication Strategy (Status: accepted)

**Date**: 2026-05-23
**Context**: User requested simplest and most secure auth
**Decision**: NextAuth.js with email/password + magic link option
**Rationale**:
- NextAuth.js provides both credential and email/magic-link providers
- Passwordless magic link is simplest for end users
- Email/password available as fallback
- Free registration with company-specific invitation codes for association
**Consequences**: Need email service (Resend) configured for magic links

## [D004] - Domain Strategy (Status: accepted)

**Date**: 2026-05-23
**Context**: User does not have custom domain yet
**Decision**: Start with Vercel default URL; multi-tenancy via path-based routing (`/t/[tenant-slug]`) instead of subdomain
**Rationale**:
- Subdomains require DNS configuration on custom domain
- Path-based is simpler for Vercel free tier
- Can migrate to subdomain later when custom domain is acquired
- Each tenant gets: `projeto.vercel.app/t/nome-da-empresa`
**Consequences**: Less "branded" feel until custom domain; simpler deployment

## [D005] - Billing Architecture (Status: accepted)

**Date**: 2026-05-23
**Context**: User wants 100% free now but full SaaS billing ready
**Decision**: Build complete billing architecture from day one with a FREE plan as default
**Rationale**:
- Building billing later is harder than including it from start
- All tenants start on FREE plan (unlimited for now)
- Schema includes: Plan, Subscription, Usage, Invoice tables
- When ready to charge, just flip a switch
**Consequences**: More tables initially, but zero friction to monetize later

## [D006] - Match Flow (Status: accepted)

**Date**: 2026-05-23
**Context**: How mentor-mentee connection works
**Decision**: Mentee sends request → Mentor receives and accepts/rejects → Connection created
**Rationale**:
- Mentor has control over who they mentor
- Enables 4-mentee limit enforcement
- Waitlist only activates after mentor accepts someone
**Consequences**: Need notification system for real-time request alerts

## [D007] - Registration Flow (Status: accepted)

**Date**: 2026-05-23
**Context**: How users join the platform
**Decision**: Open registration - users create profile freely, no pre-approval needed
**Rationale**:
- Lower barrier to entry
- Profile includes photo, bio, formation, skills, interests
- Admin can later deactivate users if needed
- Invitation system still available for company admins to invite directly
**Consequences**: Need content moderation considerations; admin deactivation feature required
