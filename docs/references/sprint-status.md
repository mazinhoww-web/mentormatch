# MentorMatch - Sprint Status

> Sprint breakdown with task status.
> Update task status as work progresses.

## Sprint Overview

| Sprint | Focus | Status |
|--------|-------|--------|
| 0 | Planning & Documentation | In Progress |
| 1 | Project Setup & Database | Pending |
| 2 | Auth & Multi-tenancy | Pending |
| 3 | Profile & Skills System | Pending |
| 4 | Mentor Directory & Matching | Pending |
| 5 | Notifications & WhatsApp | Pending |
| 6 | Admin Dashboard | Pending |
| 7 | Library & Polish | Pending |
| 8 | PWA & Deploy | Pending |

---

## Sprint 0: Planning & Documentation

- [ ] Finalize planning questions with user
- [ ] Generate PRD (product-requirements.md)
- [ ] Create .clauderules file
- [ ] Create design.md with visual specifications
- [ ] Create database.md / schema.prisma
- [ ] Create .env.example
- [ ] Create sprints.md with detailed execution plan
- [ ] Create README.md
- [ ] Create CLAUDE.md with project overview

## Sprint 1: Project Setup & Database

- [ ] Initialize Next.js 15 project with shadcn/ui
- [ ] Install dependencies (Prisma, NextAuth, etc.)
- [ ] Configure Tailwind and shadcn theme
- [ ] Setup Prisma with Vercel Postgres
- [ ] Create database schema
- [ ] Run initial migration
- [ ] Configure development environment

## Sprint 2: Auth & Multi-tenancy

- [ ] Configure NextAuth.js with credential provider
- [ ] Add magic link email provider
- [ ] Implement tenant resolution middleware
- [ ] Create tenant context provider
- [ ] Build login/register pages
- [ ] Create invitation system

## Sprint 3: Profile & Skills System

- [ ] Create onboarding flow (mentor/mentee selection)
- [ ] Build profile creation/editing forms
- [ ] Implement skills tagging system
- [ ] Create skills database with popularity ordering
- [ ] Add photo upload (Vercel Blob)
- [ ] Build profile viewing page

## Sprint 4: Mentor Directory & Matching

- [ ] Create mentor listing page with filters
- [ ] Build mentor card components
- [ ] Implement search and filter functionality
- [ ] Create match request flow
- [ ] Build mentor dashboard with requests
- [ ] Implement 4-mentee limit and waitlist
- [ ] Create my-mentees / my-mentors views

## Sprint 5: Notifications & WhatsApp

- [ ] Setup Resend for email notifications
- [ ] Implement push notification service worker
- [ ] Create notification preferences
- [ ] Build in-app notification center
- [ ] Integrate WhatsApp wa.me links

## Sprint 6: Admin Dashboard

- [ ] Create admin layout and navigation
- [ ] Build user management (approve/reject)
- [ ] Create company settings page
- [ ] Implement branding customization
- [ ] Build connections reports

## Sprint 7: Library & Polish

- [ ] Create resource library page
- [ ] Implement file upload/download
- [ ] Add favorites/bookmarks
- [ ] UI polish and responsive adjustments
- [ ] Animation improvements

## Sprint 8: PWA & Deploy

- [ ] Configure PWA manifest and service worker
- [ ] Setup push notification subscription
- [ ] Configure Vercel project
- [ ] Set environment variables
- [ ] Deploy production build
