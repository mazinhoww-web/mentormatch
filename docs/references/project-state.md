# MentorMatch - Project State

> Last updated: 2026-05-23
> Update this file at the end of every session.

## Current Phase

Phase 0: Planning and Documentation - COMPLETE. Ready to start Sprint 1.

## Completed

- [x] Product analysis from reference screenshots
- [x] Context preservation skill created and packaged
- [x] All planning questions answered by user
- [x] PRD (product-requirements.md) generated
- [x] .clauderules generated
- [x] design.md generated
- [x] database.md generated
- [x] .env.example generated
- [x] sprints.md generated
- [x] README.md generated
- [x] CLAUDE.md generated

## In Progress

- Sprint 1: Project scaffolding

## Pending

- [ ] Project scaffolding (Next.js + dependencies)
- [ ] Database schema and Prisma setup
- [ ] Multi-tenancy implementation
- [ ] Authentication system
- [ ] Onboarding flow (profile selection)
- [ ] Profile creation with skills
- [ ] Mentor directory and search
- [ ] Matching system
- [ ] Notifications (email + push)
- [ ] Resource library
- [ ] Admin dashboard
- [ ] WhatsApp integration (wa.me)
- [ ] PWA configuration
- [ ] Vercel deployment

## Known Issues

None yet.

## Environment

- Target platform: Vercel
- Database: Vercel Postgres (to be configured)
- Storage: Vercel Blob (to be configured)
- Email: Resend (to be configured)
- Domain: Vercel free tier (subdomain: `projeto.vercel.app`) - custom domain TBD
- Pricing: 100% free MVP with full SaaS billing architecture for future

## User Answers to Planning Questions

1. **Domain**: No custom domain yet. Using Vercel's default URL for now.
2. **Match Flow**: Mentor must ACCEPT the request (not automatic).
3. **Pricing**: 100% free for now, but full SaaS billing architecture must be planned and built.
4. **Skills**: Yes, provide default initial list + custom "Other" option that becomes global.
5. **Registration**: Users register freely with full profile (photo, bio, description, etc.).

## User Requirements Summary

1. White-label multitenant mentoring platform (inspired by LATAM Mentor Match)
2. Each company gets subdomain + logo + colors
3. Skills system with auto-suggest and custom entries
4. Auth: email/password + magic link (NextAuth.js)
5. Free registration + admin/master invitation system
6. Mentees send requests, mentors get notified (push + email)
7. Max 4 mentees per mentor + waitlist
8. No internal chat - redirect to WhatsApp via wa.me
9. Role hierarchy: Super Admin > Company Admin > User
10. Company Admin can: approve users, upload materials, view reports
11. Resource library (Phase 2)
12. PWA support
