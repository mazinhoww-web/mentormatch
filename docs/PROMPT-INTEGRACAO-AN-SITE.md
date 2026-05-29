# PROMPT: Integrar MentorMatch como funcionalidade do projeto an-site (aurimarnogueira.com.br)

## Contexto

Você vai integrar o MentorMatch — uma plataforma completa de mentoria empresarial (multitenant, white-label) — como uma funcionalidade dentro do projeto existente `an-site` (aurimarnogueira.com.br). O MentorMatch existe como um projeto Next.js standalone no repositório `mazinhoww-web/mentormatch` e precisa ser incorporado ao repositório `mazinhoww-web/an-site`, que já está em produção na Vercel em `aurimarnogueira.com.br`.

**Objetivo final**: O MentorMatch deve funcionar em `aurimarnogueira.com.br/mentormatch` (ou opcionalmente `mentormatch.aurimarnogueira.com.br`) como parte integrada do projeto an-site, usando a mesma infraestrutura Vercel, banco, e deploy.

**Repositório fonte**: https://github.com/mazinhoww-web/mentormatch
**Repositório destino**: https://github.com/mazinhoww-web/an-site
**Vercel project**: https://vercel.com/mazinhoww-5476s-projects/an-site
**Domínio produção**: aurimarnogueira.com.br

---

## O que é o MentorMatch (fonte de verdade)

### Stack técnica
- Next.js 16.2.6 (App Router)
- TypeScript strict
- Tailwind CSS v4 + shadcn/ui (componentes manuais)
- Prisma 6 + PostgreSQL
- NextAuth.js v5 (beta 31) com credentials provider
- Vercel Blob (uploads)
- Resend (emails)
- React Hook Form + Zod
- Lucide React (ícones)
- Fontes: Hanken Grotesk (headlines) + Inter (body)

### Estrutura de arquivos (76 arquivos TypeScript, ~12.000 linhas)

```
src/
├── app/
│   ├── (auth)/                          # Auth pages (8 páginas)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── select-profile/page.tsx
│   │   ├── onboarding/mentor/page.tsx
│   │   ├── onboarding/mentee/page.tsx
│   │   └── welcome/page.tsx
│   ├── api/                             # 19 API routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── auth/register/route.ts
│   │   ├── auth/forgot-password/route.ts
│   │   ├── auth/reset-password/route.ts
│   │   ├── auth/complete-profile/route.ts
│   │   ├── connections/route.ts
│   │   ├── invitations/route.ts
│   │   ├── invitations/[token]/route.ts
│   │   ├── library/route.ts
│   │   ├── mentors/route.ts
│   │   ├── notifications/route.ts
│   │   ├── skills/route.ts
│   │   ├── upload/route.ts
│   │   ├── waitlist/route.ts
│   │   ├── admin/users/route.ts
│   │   ├── admin/reports/route.ts
│   │   └── admin/export/route.ts
│   ├── t/[slug]/                        # Tenant dashboard (15 páginas)
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── mentor/page.tsx
│   │   │   ├── mentee/page.tsx
│   │   │   ├── mentors/page.tsx
│   │   │   ├── mentors/[id]/page.tsx
│   │   │   ├── confirm/[id]/page.tsx
│   │   │   ├── requests/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── library/page.tsx
│   │   │   ├── library/[id]/page.tsx
│   │   │   └── processo/page.tsx
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── users/page.tsx
│   │       ├── skills/page.tsx
│   │       ├── library/page.tsx
│   │       ├── reports/page.tsx
│   │       └── settings/page.tsx
│   ├── layout.tsx                       # Root layout (Hanken Grotesk + Inter fonts)
│   ├── page.tsx                         # Landing page
│   ├── not-found.tsx                    # 404
│   └── globals.css                      # Design tokens (light + dark theme)
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── dashboard-layout.tsx
│   │   └── auth-layout.tsx
│   ├── ui/                              # 12 componentes base
│   │   ├── avatar.tsx, badge.tsx, button.tsx, card.tsx
│   │   ├── dialog.tsx, empty-state.tsx, input.tsx, label.tsx
│   │   ├── loading.tsx, select.tsx, tabs.tsx, textarea.tsx
│   ├── providers.tsx                    # SessionProvider
│   └── sw-register.tsx                  # Service Worker registration
├── hooks/
│   ├── use-current-user.ts
│   └── use-notifications.ts
├── lib/
│   ├── auth.ts                          # NextAuth config
│   ├── db.ts                            # Prisma client singleton
│   ├── email.ts                         # Resend email templates
│   ├── feature-flags.ts                 # Feature toggles
│   ├── tenant.ts                        # Tenant helpers
│   ├── utils.ts                         # cn(), formatDate(), getInitials()
│   └── validations.ts                   # Zod schemas
├── middleware.ts                        # Cookie-based auth check (lightweight, <5KB)
└── types/
    └── next-auth.d.ts                   # Session type augmentation
prisma/
├── schema.prisma                        # 18 modelos, 352 linhas
└── seed.ts                              # 4 planos, 20 skills, admin, tenant default
```

### Prisma Schema (18 modelos)
- Tenant, Plan, Subscription, Invoice, Usage
- User (SUPER_ADMIN/ADMIN/MENTOR/MENTEE), Account, Session, VerificationToken
- Skill, UserSkill (isTeaching boolean)
- Connection (PENDING/ACCEPTED/REJECTED/CANCELLED/COMPLETED), WaitlistEntry
- LibraryItem, Invitation, Notification

### Dependências que o an-site pode NÃO ter (precisam ser instaladas)
```
@auth/prisma-adapter @hookform/resolvers @prisma/client @vercel/blob
bcryptjs class-variance-authority clsx date-fns lucide-react
next-auth@beta react-hook-form resend tailwind-merge zod
prisma (dev) @types/bcryptjs (dev) tsx (dev)
```

### Design system (globals.css)
- Light theme: primary #004ac6, bg #faf8ff, surfaces #ffffff/#f2f3ff/#eaedff
- Dark theme: primary #2563eb, bg #0b1326, surfaces #131b2e/#171f33/#222a3d
- Animações: reveal-card, float-shape, pulse-glow, pop-in, fadeIn
- Tenant branding via `[data-tenant]` CSS custom properties

### Middleware (IMPORTANTE)
O middleware é LEVE (não importa Prisma/bcrypt). Apenas verifica existência de cookie de sessão. Isso é crítico para não estourar o limite de 1MB do Edge Function na Vercel Hobby.

### Environment Variables necessárias
```
DATABASE_URL (PostgreSQL - pode ser o mesmo banco do an-site)
AUTH_SECRET (gerar novo ou usar existente)
AUTH_URL (URL do app)
RESEND_API_KEY (para emails)
BLOB_READ_WRITE_TOKEN (para uploads)
ENABLE_MAGIC_LINK=true
ENABLE_PUBLIC_REGISTRATION=true
ENABLE_BILLING=false
ENABLE_PUSH_NOTIFICATIONS=false
```

---

## Instruções de execução

### FASE 1: Análise do an-site
1. Leia a estrutura do projeto an-site (package.json, app router structure, prisma se existir, middleware se existir, layout raiz, globals.css)
2. Identifique: versão do Next.js, se usa TypeScript, se usa Tailwind, se usa Prisma, se tem auth configurado
3. Identifique conflitos potenciais: fonts, globals.css, middleware, providers, prisma schema

### FASE 2: Instalação de dependências
1. Instale APENAS as dependências que o an-site ainda não tem
2. NÃO sobrescreva dependências existentes com versões diferentes
3. Se o an-site já tem Prisma, MERGE o schema (adicione os modelos do MentorMatch ao schema existente)
4. Se o an-site já tem NextAuth, MERGE a config (adicione o credentials provider)

### FASE 3: Copiar arquivos do MentorMatch
Clone ou copie os arquivos do repo mentormatch. A estrutura destino deve ser:

**Opção A (path-based, preferida)**:
```
src/app/mentormatch/                     # Tudo dentro de /mentormatch
├── (auth)/login/page.tsx               # → /mentormatch/login
├── (auth)/register/page.tsx            # → /mentormatch/register
├── (auth)/...                           
├── api/mentormatch/                     # APIs prefixadas
│   ├── auth/[...nextauth]/route.ts     # → /api/mentormatch/auth/...
│   ├── mentors/route.ts                # → /api/mentormatch/mentors
│   └── ...
├── t/[slug]/(dashboard)/...            # → /mentormatch/t/default/...
├── layout.tsx                          # Layout MentorMatch (NÃO sobrescreve o root)
├── page.tsx                            # Landing do MentorMatch
└── not-found.tsx
src/components/mentormatch/              # Componentes isolados
├── layout/
├── ui/
├── providers.tsx
└── sw-register.tsx
src/lib/mentormatch/                     # Libs isoladas
├── auth.ts
├── db.ts (usar o mesmo Prisma client se possível)
├── email.ts
├── feature-flags.ts
├── tenant.ts
├── utils.ts
└── validations.ts
src/hooks/mentormatch/
src/types/mentormatch/
```

### FASE 4: Adaptar imports e paths
1. **TODOS os imports** dentro dos arquivos MentorMatch precisam ser atualizados:
   - `@/components/ui/button` → `@/components/mentormatch/ui/button`
   - `@/lib/auth` → `@/lib/mentormatch/auth`
   - `@/lib/db` → `@/lib/mentormatch/db` (ou o db compartilhado)
   - `@/hooks/use-notifications` → `@/hooks/mentormatch/use-notifications`
2. **Todos os fetch()** nas páginas client precisam ter paths atualizados:
   - `fetch("/api/mentors")` → `fetch("/api/mentormatch/mentors")`
   - `fetch("/api/connections")` → `fetch("/api/mentormatch/connections")`
   - etc.
3. **Todos os Link/router.push** precisam ser prefixados:
   - `router.push("/login")` → `router.push("/mentormatch/login")`
   - `Link href="/t/${slug}/mentor"` → `Link href="/mentormatch/t/${slug}/mentor"`
4. **NextAuth pages config**: 
   - `signIn: "/login"` → `signIn: "/mentormatch/login"`

### FASE 5: Merge do Prisma Schema
1. Se o an-site já tem `prisma/schema.prisma`, adicione os 18 modelos do MentorMatch
2. Se modelos conflitam (ex: User), crie modelos prefixados (MmUser, MmTenant, etc.) OU use o User existente e adicione os campos extras
3. Se o an-site NÃO tem Prisma, copie o schema inteiro
4. Adicione o seed.ts ou merge com o seed existente

### FASE 6: Merge do Middleware
1. Se o an-site tem middleware, MERGE - adicione as regras do MentorMatch dentro do middleware existente
2. As rotas `/mentormatch/*` devem ser protegidas, exceto `/mentormatch/login`, `/mentormatch/register`, `/mentormatch/forgot-password`, `/mentormatch/reset-password`, `/api/mentormatch/auth`
3. MANTER o middleware leve (sem imports de Prisma/bcrypt)

### FASE 7: Merge do globals.css
1. NÃO sobrescreva o globals.css do an-site
2. ADICIONE as variáveis CSS do MentorMatch como scoped:
   - Envolva em `.mentormatch { ... }` ou use o layout do MentorMatch para aplicar
3. Adicione as animações (reveal-card, float-shape, etc.) ao final do arquivo

### FASE 8: Layout e fonts
1. O layout raiz do an-site NÃO deve ser alterado
2. Crie um layout específico em `src/app/mentormatch/layout.tsx` que:
   - Importa Hanken Grotesk + Inter (se o an-site usa fonts diferentes)
   - Aplica a classe `.mentormatch` no wrapper
   - Inclui o SessionProvider do NextAuth
3. O root layout do an-site continua sendo o principal

### FASE 9: Build e teste
1. `npx prisma generate`
2. `npx tsc --noEmit` - zero errors
3. `npm run build` - deve passar
4. Testar que `/mentormatch` renderiza a landing page
5. Testar que `/mentormatch/login` renderiza o login
6. Testar que as rotas do an-site NÃO foram quebradas

### FASE 10: Configuração Vercel
1. O build script deve incluir `prisma generate && (prisma db push || true) && next build`
2. Adicionar as env vars do MentorMatch no projeto Vercel (se ainda não existem)
3. Se quiser subdomínio: configurar `mentormatch.aurimarnogueira.com.br` como custom domain na Vercel + middleware rewrite

---

## Regras obrigatórias

1. **NÃO quebre o an-site existente** - todas as rotas e funcionalidades atuais devem continuar funcionando
2. **NÃO sobrescreva arquivos existentes** do an-site (globals.css, layout.tsx, middleware.ts, package.json) - MERGE sempre
3. **Isole o MentorMatch** em pastas prefixadas para evitar conflitos
4. **Mantenha o middleware leve** (<100KB) - nunca importe Prisma ou bcrypt no middleware
5. **Use o mesmo banco** PostgreSQL do an-site se possível (adicione tabelas, não crie outro banco)
6. **Teste o build** antes de fazer push - `npx tsc --noEmit && npm run build`
7. **Commite em português** com mensagens descritivas
8. **Prefixe todas as rotas** com /mentormatch para isolamento

## Ordem de execução recomendada
1. Análise do an-site → 2. Deps → 3. Copiar arquivos → 4. Adaptar imports → 5. Prisma → 6. Middleware → 7. CSS → 8. Layout → 9. Build → 10. Vercel

## Referência
O código fonte completo do MentorMatch está em: https://github.com/mazinhoww-web/mentormatch
