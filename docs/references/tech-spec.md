# MentorMatch - Technical Specifications

> Technical patterns, conventions, and specifications.
> Update when technical decisions change.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Components | shadcn/ui | latest |
| ORM | Prisma | 6.x |
| Database | Vercel Postgres | - |
| Auth | NextAuth.js | 5 (Auth.js) |
| Uploads | Vercel Blob | - |
| Email | Resend | - |
| State | React Context + Hooks | - |
| Forms | React Hook Form + Zod | - |

## Project Structure

```
mentormatch/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group (login, register)
│   ├── (dashboard)/       # Main app group
│   │   ├── match/         # Mentor listing/matching
│   │   ├── profile/       # User profile
│   │   ├── processo/      # Mentoring process tracking
│   │   ├── biblioteca/    # Resource library
│   │   └── settings/      # User settings
│   ├── (admin)/           # Admin dashboard group
│   │   ├── users/         # User management
│   │   ├── connections/   # Connection reports
│   │   ├── library/       # Library management
│   │   └── settings/      # Company settings
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth handler
│   │   ├── users/         # User CRUD
│   │   ├── mentors/       # Mentor listing
│   │   ├── matches/       # Match requests
│   │   ├── skills/        # Skills API
│   │   ├── library/       # Library files
│   │   └── admin/         # Admin APIs
│   └── [tenant]/          # Tenant subdomain handler
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── mentor/           # Mentor-specific components
│   └── forms/            # Form components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth configuration
│   ├── tenant.ts         # Tenant resolution
│   └── utils.ts          # General utilities
├── prisma/
│   └── schema.prisma     # Database schema
├── types/                 # TypeScript types
├── public/               # Static assets
└── middleware.ts         # Next.js middleware
```

## Database Schema (Proposed)

### Core Tables

```
Tenant (companies)
- id, name, slug, subdomain, logo, primaryColor, secondaryColor
- isActive, plan, maxUsers, createdAt, updatedAt

User
- id, email, name, image, role (SUPER_ADMIN|ADMIN|MENTOR|MENTEE)
- tenantId, isApproved, bio, formation, whatsappNumber
- createdAt, updatedAt

Skill
- id, name, category, usageCount
- createdAt

UserSkill (many-to-many)
- userId, skillId, isTeaching

Connection (mentor-mentee relationship)
- id, mentorId, menteeId, tenantId
- status (PENDING|ACTIVE|COMPLETED|CANCELLED)
- message, startedAt, endedAt, createdAt

WaitlistEntry
- id, mentorId, menteeId, tenantId
- position, createdAt

LibraryItem
- id, title, description, fileUrl, fileType, fileSize
- tenantId, uploadedById, category, isPublic
- createdAt, updatedAt

Invitation
- id, email, tenantId, role, invitedById
- token, expiresAt, usedAt, createdAt

Notification
- id, userId, type, title, message, data
- isRead, createdAt
```

## Key Conventions

- Use App Router exclusively (no Pages Router)
- All API routes use route handlers (`route.ts`)
- Server components by default, client components when needed
- Use `use server` for server actions where appropriate
- Form validation with Zod schemas
- Database access through Prisma client singleton
- Tenant resolution via subdomain middleware
- Authentication via NextAuth.js session
