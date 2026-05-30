# BLUEPRINT.md — MentorMatch (Engenharia Reversa, documento mestre)

> Reconstrução **com correção dos defeitos**. Os defeitos estão em `BLUEPRINT-DEFEITOS.md` (FASE 1).
> Critérios E2E em `BLUEPRINT-ACEITE.md` (FASE 15). Mapa para outra stack em `BLUEPRINT-STACK-ALVO.md` (FASE 16).
> Prompt de reconstrução em `PROMPT-RECONSTRUCAO.md` (FASE 18).
> Evidência por `arquivo:linha`. Suposições marcadas **(HIPÓTESE)**.

---

## FASE 2 — DESCOBERTA

**Tipo:** monólito Next.js App Router (não-monorepo; 1 `package.json`). Front (RSC + client components) e back (Route Handlers + Server Actions) no mesmo projeto.

**Stack (de `package.json`):** Next `16.2.6`, React `19.2.4`, TypeScript `5` (strict, alias `@/*`→`src/*`), NextAuth/Auth.js `5.0.0-beta.31` + `@auth/prisma-adapter`, Prisma `6.19.3` + PostgreSQL, Zod `4`, Resend `6`, `@vercel/blob` `2`, Tailwind `4` + shadcn/ui, react-hook-form `7`, lucide-react, date-fns `4`, bcryptjs (cost 10). Dev: eslint 9, playwright.

**Scripts:** `dev`, `build`(next build), `start`, `lint`(eslint), `db:generate`/`db:push`/`db:seed`(tsx prisma/seed.ts)/`db:studio`, `postinstall`(prisma generate). **Sem `test`.**

**Mapa `src/`:** `app/(auth)` (login/register/forgot/reset/select-profile/onboarding{mentor,mentee}/welcome); `app/actions/*` (server actions); `app/admin/*` (super admin); `app/api/**` (REST); `app/dashboard` (alias redirect); `app/sicredi` (landing branded); `app/t/[slug]/(dashboard)` e `app/t/[slug]/admin` (multi-tenant); `components/{ui,layout,dashboard,landing,admin-geral,brand,providers}`; `hooks/*`; `lib/*`; `middleware.ts`; `styles/themes/*`; `types/next-auth.d.ts`.

**Relações entre camadas:** RSC/Actions/Handlers → `lib/auth` (sessão) → `lib/db` (Prisma singleton) → Postgres; efeitos: Resend (e-mail), Vercel Blob (arquivos). Sem filas/jobs/workers/cron.

**Infra ausente (evidência):** sem `vercel.json`, `Dockerfile`, `.github/` (CI). Único utilitário: `scripts/take-screenshots.js`.

---

## FASE 3 — VISÃO EXECUTIVA

**O quê:** plataforma **white-label, multi-tenant** de **mentoria corporativa** (PT-BR, BRL, contato por WhatsApp). Cada empresa = um **tenant** com marca/tema próprios sob `/<basePath>/t/{slug}`.

**Problema:** programas de mentoria internos são geridos hoje em planilhas/e-mail/WhatsApp; falta descoberta de mentores, matching com capacidade, fila, biblioteca, aprovação e relatórios.

**Usuários/papéis:** `SUPER_ADMIN` (gere todos os tenants), `ADMIN` (gere 1 tenant), `MENTOR`, `MENTEE`.

**Fluxo principal:** landing branded (seta cookie de tenant) → cadastro → escolha de papel → onboarding (perfil + skills) → mentee busca mentor → solicita → mentor aceita/recusa → contato via WhatsApp; mentor lotado → fila → promoção automática.

**Proposta de valor:** custo marginal ~zero por tenant (1 deploy serve N), branding por cliente, localizado, stack serverless barata.

**Módulos centrais:** Auth/Onboarding · Multitenancy/Theming · Matching/Waitlist · Biblioteca · Notificações · Admin do tenant · Admin geral · Convites · Billing (estrutural).

### Regras de negócio (catálogo — usado pelas demais fases)

RN-01 Capacidade mentor ≤ `maxMentees`(4 ACCEPTED). RN-02 lotado→fila(position=max+1). RN-03 anti-duplicado (PENDING|ACCEPTED). RN-04 recheck capacidade no ACCEPT. RN-05 só mentor ACCEPT/REJECT. RN-06 promoção FIFO em REJECT/COMPLETE/CANCEL. RN-07 fila contígua. RN-08 reordenar fila só mentor dono. RN-09 remover fila: mentor dono ou próprio mentee. RN-10 notificações automáticas. RN-11 registro c/ convite→APPROVED+role+tenant; sem→PENDING. RN-12 completar perfil (tx). RN-13 resolver tenant via cookie/fallback default. RN-14 aprovar usuário (ADMIN, mesmo tenant). RN-15 convite 7d, sem duplicado pendente. RN-16 biblioteca só ADMIN/MENTOR. RN-17 skill catálogo. RN-18 reset por VerificationToken. RN-19 trocar senha confere atual. RN-20 marcar notif lida. RN-21 buscar mentores APPROVED do tenant. RN-22 export CSV. RN-23 ownership de tenant (DB). RN-24 guarda de papel (DB). RN-25 admin tenant. RN-26 super admin. RN-27 cookie de tenant. RN-28 settings. RN-29 encerrar mentoria.
> ⚠️ RN-04/06/10 atualmente furadas pela UI — ver D-01/D-02.

---

## FASE 4 — ARQUITETURA

### Frontend
- **Render:** RSC por padrão (páginas/layouts async lêem DB via Prisma direto); `"use client"` só em ilhas interativas. `export const dynamic="force-dynamic"` nas páginas dependentes de sessão/cookie.
- **Roteamento:** file-based; grupos `(auth)` e `(dashboard)`; rota dinâmica `t/[slug]`; **basePath `/mentormatch`** (`next.config.ts`).
- **Cadeia de layouts:** `app/layout.tsx` (fontes Google: Hanken Grotesk, Inter, Exo 2, Nunito; resolve tenant por cookie `mm-tenant`; aplica classe `theme-{key}` no `<body>`; monta `Providers`+`TenantProvider`+`ToastProvider`) → `(auth)`/`t/[slug]/(dashboard)` (guarda + `DashboardLayout` com Sidebar/BottomNav) → guardas de papel `mentor|mentee`.
- **Estado:** sem Redux/Zustand. Servidor via RSC + Server Actions + `revalidatePath("/t")`. Sessão via `SessionProvider` (`components/providers.tsx`, basePath `/mentormatch/api/auth`). Tenant via `TenantContext`. Tema via `ThemeProvider`. Toast via context.
- **Hooks:** `use-current-user` (GET `/api/users/me`), `use-notifications` (poll 30s GET `/api/notifications`), `use-tenant-router` (navegação full-page prefixando basePath), `use-counter`.
- **Cache:** `lib/tenant` usa `cache()` (memo por request); SW cache-first (`public/sw.js`). Sem ISR.
- **Theming white-label:** `tenant.themeKey`→classe CSS; `lib/theme-parser` extrai tokens de um `design.md`; `lib/theme-provisioner` gera CSS e publica no Blob (`themeCssUrl`). Temas em `styles/themes/{base,index,sicredi}.css`.

### Backend
- **Sem camadas formais** (controller/usecase/repo). Lógica em **Route Handlers** (`app/api/**/route.ts`) e **Server Actions** (`app/actions/*`, `app/admin/actions.ts`). Dados via Prisma singleton (`lib/db.ts`).
- **Responsabilidades:** Handlers = contratos REST p/ cliente, validação Zod, autz, regras de matching/notificação completas. Actions = mutações de forms (⚠️ algumas divergentes — D-01/D-02). `lib/*` = auth, db, email, tenant, validations, theming.
- **Filas/jobs/workers/cron:** inexistentes. Promoção de fila e notificações **síncronas no request**. Notificações ao cliente por **polling**.

---

## FASE 5 — DOMÍNIO

| Entidade | Finalidade | Campos (resumo) | Estados / ciclo |
|---|---|---|---|
| **Tenant** | organização branded | name, slug*, logoUrl?, brandColor, secondaryColor?, domain?*, active, themeKey, themeCssUrl?, tokens?, maxUsers/maxConnections/maxLibraryItems, planId? | active true/false |
| **User** | conta (qualquer papel) | email, name?, password?(bcrypt), image?, role?, status, bio?/headline?/position?/department?/languages[]/education?/experience?/linkedin?/whatsapp?, maxMentees(4), onboardingDone, tenantId? | status PENDING→APPROVED/REJECTED/SUSPENDED; role null→{MENTOR,MENTEE,ADMIN,SUPER_ADMIN}; onboardingDone false→true |
| **Skill** | catálogo (global hoje — D-04) | name*, category?, usageCount, isActive | ativo/inativo |
| **UserSkill** | vínculo user↔skill | userId, skillId, isTeaching | recriado no complete-profile |
| **Connection** | relação mentor↔mentee | mentorId, menteeId, tenantId, status, message?, startedAt?, endedAt? | ver FASE 8 |
| **WaitlistEntry** | fila por mentor | mentorId, menteeId, position | criada/promovida/removida |
| **LibraryItem** | material do tenant | title, description?, fileUrl, fileType, fileSize?, tenantId, uploadedById | — |
| **Invitation** | onboarding dirigido | email, tenantId, role, token*, used, expiresAt, invitedById?, type? | válido→usado/expirado |
| **Notification** | aviso in-app | userId, tenantId, type, title, message, read, metadata? | não lida→lida |
| **Plan/Subscription/Invoice/Usage** | billing estrutural | ver FASE 6 | não exercitado no MVP |
| **Account/Session/VerificationToken** | adapter Auth.js | padrão | só VerificationToken usado (D-15) |

---

## FASE 6 — BANCO DE DADOS

**SGBD:** PostgreSQL. **ORM:** Prisma 6 (`binaryTargets`: native, rhel-openssl-3.0.x, linux-arm64-openssl-3.0.x). **Sem** triggers/views/procedures/RLS. **Multi-tenancy:** coluna discriminadora **`tenantId`** em todas as entidades de tenant; **isolamento garantido só por código** (sem RLS). Tabelas com prefixo `mm_` (`@@map`).

**Tabelas / chaves / índices:**

| Tabela `mm_` | PK | FK (onDelete) | Unique | Índices |
|---|---|---|---|---|
| tenant | id | plan→Plan | slug; domain | — |
| user | id | tenant→Tenant | **(email,tenantId)** | tenantId; (role,tenantId); (status,tenantId) |
| account | id | user (Cascade) | (provider,providerAccountId) | — |
| session | id | user (Cascade) | sessionToken | — |
| verification_token | — | — | token; (identifier,token) | — |
| skill | id | — | name | usageCount; category |
| user_skill | id | user(Cascade), skill(Cascade) | (userId,skillId) | — |
| connection | id | mentor→User, mentee→User, tenant→Tenant | **(mentorId,menteeId,status)** | (mentorId,status); menteeId; tenantId |
| waitlist_entry | id | mentor→User, mentee→User | (mentorId,menteeId) | (mentorId,position) |
| library_item | id | tenant, uploadedBy→User | — | tenantId |
| invitation | id | invitedBy→User?, tenant | token | tenantId; token |
| notification | id | user(Cascade), tenant | — | (userId,read); tenantId |
| plan | id | — | slug | — |
| subscription | id | tenant, plan | tenantId | — |
| invoice | id | subscription | — | — |
| usage | id | — | (tenantId,metric,period) | — |

**Plan (campos):** name, slug*, description?, priceMonthly(0), priceYearly(0), maxUsers(50), maxConnections(100), maxLibraryItems(10), maxAdmins(1), features?(Json), active.

**ER (cardinalidades):** Tenant 1—N User/Connection/LibraryItem/Invitation/Notification; Tenant 1—1 Subscription; Tenant N—1 Plan. User 1—N UserSkill N—1 Skill. User(mentor) 1—N Connection/WaitlistEntry; User(mentee) idem. Subscription 1—N Invoice.

> Constraints com efeito de negócio: `Connection (mentorId,menteeId,status)` permite histórico (REJECTED) + nova (PENDING); `WaitlistEntry (mentorId,menteeId)` = 1 entrada por mentor.
> **Reconstrução recomendada:** adicionar `Skill.tenantId` (D-04); coluna p/ limite de mentees por tenant (D-08); avaliar RLS p/ defesa em profundidade.

---

## FASE 7 — SEED / FIXTURES OBRIGATÓRIOS

De `prisma/seed.ts` (idempotente, `upsert`; chave de user `(email,tenantId)`):
- **Planos:** free(0/0; 50/100/10/1), starter(299/2990; 200/500/—/3), pro(799/7990; 1000/∞/—/10), enterprise(∞).
- **Tenant `default`** ("MentorMatch Demo", free) + **ADMIN** `admin@mentormatch.com` (APPROVED).
- **Tenant `sicredi`** (brand `#33820D`, secondary `#0A4B1E`, themeKey `sicredi`, free).
- **Super admin** (`espindolanogueira@yahoo.com.br`, SUPER_ADMIN, APPROVED, onboardingDone, vinculado ao tenant default).
- **Catálogo de skills** (Technology/Design/Management/Marketing/Career).

**Sem o seed, o cadastro público quebra** (RN-13 precisa do tenant `default`/`sicredi`). **Ausências a corrigir na reconstrução:** o `.env.example` declara `SUPER_ADMIN_EMAIL/PASSWORD` mas o seed **não os lê** (usa valores fixos) — parametrizar; criar `Subscription` para os tenants (hoje não criada).

---

## FASE 8 — MÁQUINAS DE ESTADO

**Connection.status** (gatilhos e efeitos *intencionais* — ver D-01/D-02 p/ o atual):
| De → Para | Gatilho | Efeitos |
|---|---|---|
| (novo) → PENDING | mentee solicita, mentor com vaga | notifica mentor (CONNECTION_REQUEST) |
| (novo) → *waitlist* | mentee solicita, mentor lotado | cria WaitlistEntry(position=max+1) |
| PENDING → ACCEPTED | mentor aceita (recheck capacidade) | startedAt; notifica mentee (CONNECTION_ACCEPTED) |
| PENDING → REJECTED | mentor recusa | notifica (CONNECTION_REJECTED); **promove 1º da fila** |
| ACCEPTED → COMPLETED | encerrar mentoria | endedAt; **promove fila** |
| ACCEPTED/PENDING → CANCELLED | cancelar | **promove fila** |

**User.status:** PENDING →(admin)→ APPROVED | REJECTED | SUSPENDED. Auto-registro nasce PENDING; convite/onboarding→APPROVED.
**User.role:** null →(select-profile/complete-profile)→ MENTOR|MENTEE; ADMIN/SUPER_ADMIN via seed/convite.
**User.onboardingDone:** false →(complete-profile)→ true.
**Invitation:** válido →(registro)→ used=true; ou →(tempo)→ expirado (expiresAt<now).
**WaitlistEntry:** criada (lotado) → promovida (vira Connection)/removida → posições reordenadas.

---

## FASE 9 — AUTENTICAÇÃO E AUTORIZAÇÃO

- **Provider:** Credentials (email+senha; `bcrypt.compare`) — `src/lib/auth.ts`. **Estratégia JWT** (`session.strategy:"jwt"`) apesar de `PrismaAdapter` (D-15). MFA/OAuth/SSO/magic-link: **ausentes/inativos** (D-10).
- **Cookies:** `mm.session-token` (httpOnly, sameSite=lax, secure em prod), `mm.callback-url`, `mm.csrf-token`. Cliente: `SessionProvider basePath="/mentormatch/api/auth"`.
- **Claims JWT** (hidratados do DB **no sign-in e em `trigger:"update"`**): role, status, tenantId, tenantSlug, onboardingDone (`auth.ts` jwt callback). **Defasagem** entre onboarding e `update()` = origem do loop (corrigido nas páginas, residual nas APIs — D-06/D-16).
- **Sessão exposta** (`types/next-auth.d.ts`): `{id,email,name,image?,role,status,tenantId,tenantSlug,onboardingDone}`.
- **Onde a autz é aplicada:** (a) `middleware.ts` (atalho: redireciona a `/login` se sem cookie de sessão; seta `mm-tenant` em `/sicredi`; limpa em `/`); (b) **guardas de layout** RSC (fonte = **banco**): `t/[slug]/(dashboard)/layout.tsx` (ownership), `mentor|mentee/layout.tsx` (papel), `t/[slug]/admin/layout.tsx` (ADMIN/SUPER), `app/admin/layout.tsx` (SUPER); (c) cada **Route Handler** revalida `auth()`+role (fonte = **JWT** — D-06).
- **FONTE DE VERDADE (regra):** **decisões de acesso devem ler o banco**, não o token. Hoje páginas seguem isso; APIs não (D-06).

---

## FASE 10 — TABELA DE DECISÃO DE ROTEAMENTO PÓS-LOGIN

Consolidação de `lib/dashboard-href.ts` (`getDashboardHref`), `lib/post-login-href.ts` (`resolvePostLoginHref`, lê **banco**+cookie), `app/dashboard/page.tsx` (alias) e `middleware.ts`.

| role | onboardingDone | tenant.slug | Destino |
|---|---|---|---|
| SUPER_ADMIN | — | — | `/admin` |
| null | — | — | `/select-profile` |
| MENTOR/MENTEE/ADMIN | — | null | `/select-profile` |
| MENTOR | false | set | `/onboarding/mentor` |
| MENTEE | false | set | `/onboarding/mentee` |
| ADMIN | true | set | `/t/{slug}/admin/users` |
| MENTOR | true | set | `/t/{slug}/mentor` |
| MENTEE | true | set | `/t/{slug}/mentee` |

**Invariante anti-loop:** `getDashboardHref` (usado nas guardas) e `resolvePostLoginHref`/`select-profile` **devem usar a mesma fonte (banco)**. Divergência banco×JWT = `ERR_TOO_MANY_REDIRECTS` (D-16). Páginas pós-login (`/select-profile`, `/onboarding/*`) **exigem sessão** (não são públicas no middleware).

---

## FASE 11 — FLUXOS FUNCIONAIS

**Principal (mentee→mentor):** `/sicredi`(seta cookie)→register(signIn)→select-profile→onboarding/mentee(`POST /api/auth/complete-profile`)→welcome(`update()`)→`/dashboard`→`resolvePostLoginHref`→`/t/{slug}/mentee`→busca `/mentors`→solicita. **Intencional:** `POST /api/connections` (capacidade→fila, anti-duplicado, notifica). Erros: sem tenant(400), duplicado(409), lotado(→fila).

**Secundário (mentor responde):** `/t/{slug}/requests` → **intencional** `PATCH /api/connections` (capacidade, promoção, notificação). *(Atual: actions simplificadas — D-01.)*

**Admin tenant:** users(aprovar `PATCH /api/admin/users`), reports, export, skills, library, settings, convites.
**Super admin:** `/admin` lista tenants+stats; `createTenant` (slug `^[a-z0-9-]+$`).
**Erro:** sem sessão→`/login`; tenant inativo/inexistente→`notFound()`; reset token expirado→deletado+400.
**Interno:** poll notif 30s; SW cache GET; `revalidatePath("/t")` pós-actions.

---

## FASE 12 — APIS E CONTRATOS

REST (Route Handlers). Padrão: 401 sem sessão, 400 Zod, 500 exceção.

| Método · Rota | Entrada | Authz (atual) | Saída · Status |
|---|---|---|---|
| POST `/api/auth/register` | name,email,password,invitationToken? | público | user · 201/400/409 |
| POST `/api/auth/complete-profile` | role,name,headline?,bio?,education?,experience?,linkedin,whatsapp,image?,skills[]≥1 | sessão | user · 200/400 |
| POST `/api/auth/forgot-password` | email | público | sempre 200 |
| POST `/api/auth/reset-password` | token,password≥6 | público(token) | 200/400 |
| GET/POST `/api/auth/[...nextauth]` | NextAuth | — | sessão/login (inclui `/api/auth/session`) |
| GET `/api/mentors` | `?tenantId&skill?&q?` | público | mentores[]+activeConnections · 200/400 |
| GET `/api/connections` | `?status?` | sessão | conexões[] |
| POST `/api/connections` | mentorId,message(10..500) | sessão | connection \| {waitlisted,position} · 201/404/409 |
| PATCH `/api/connections` | connectionId,status | mentor p/ ACC/REJ | 200/403/404/409 |
| GET/PATCH/DELETE `/api/waitlist` | PATCH entries[]; DELETE {id} | sessão; PATCH só MENTOR | 200/403/404 |
| GET/PATCH `/api/admin/users` | PATCH {userId,status} | **role==ADMIN** (D-07) | 200/401/403/404 |
| GET `/api/admin/reports` | — | **role==ADMIN** (D-07) | métricas |
| GET `/api/admin/export` | `?type=users\|connections\|skills&tenantId?` | ADMIN/SUPER | CSV · 200/400 |
| GET/PATCH `/api/admin/settings` | `?slug`; PATCH {slug,name,brandColor?,logo?,maxMenteesPerMentor?} | ADMIN(seu)/SUPER | 200/401/403/404 (maxMentees não persiste — D-08) |
| GET/POST `/api/skills` | POST {name≥2,category?} | GET público; POST sessão | 200/201/409 |
| GET/POST `/api/library` | GET `?tenantId`; POST {title,description?,fileUrl,fileType,fileSize?} | GET público; POST ADMIN/MENTOR | 200/201/400/403 |
| GET/PATCH `/api/notifications` | PATCH {id}\|{all:true} | sessão | 200 |
| GET/POST `/api/invitations` | POST {email,role,tenantId?} | ADMIN/SUPER | 201/400/409 |
| GET/PATCH `/api/invitations/[token]` | — / {used?} | público | {valid,…}/invite |
| POST `/api/tenant/clear` | — | — | limpa cookie |
| POST `/api/upload` | multipart `file` | sessão | {url} · 200/400 |
| GET/PATCH `/api/users/me` | PATCH perfil parcial | sessão | user |

**Endpoints referenciados no front que NÃO existem (D-03):** `DELETE/PATCH /api/skills?id=` (`admin/skills/page.tsx:180,211`), `DELETE /api/library?id=` (`admin/library/page.tsx:213`). **Reconstruir.**

**Server Actions (`"use server"`):** `setTenantCookie/clearTenantCookie/getTenantCookie`; `completeOnboarding`(morto D-11); `updateProfile/changePassword/uploadAvatar`; `scheduleSession`(morto)/`endMentorship`/`sendConnectionRequest`(divergente D-02); `acceptRequest/rejectRequest`(divergentes D-01)/`removeFromWaitlist`; `uploadMaterial/toggleSaveMaterial`(morto); `markAsRead/markAllAsRead`; `createTenant`. **Webhooks/GraphQL: nenhum.**

---

## FASE 13 — INTEGRAÇÕES EXTERNAS

| Serviço | Objetivo | Dependência | Estado | Falhas |
|---|---|---|---|---|
| **PostgreSQL** | persistência | **crítica** | ativo | indispensável |
| **Resend** | e-mails transacionais | média | ativo (fallback `re_placeholder`) | best-effort `.catch` — não derruba |
| **Vercel Blob** | upload (biblioteca/avatar/theme CSS) | alta (p/ upload) | ativo | erro→500/Result.error |
| **Google Fonts** (`next/font`) | tipografia | baixa | build-time | — |
| **Stripe** | pagamentos | — | **só placeholder** (env comentado, flag `ENABLE_BILLING=false`) | — |
| **Magic link / Push (VAPID) / SSO** | — | — | **flags presentes, não implementados** (D-10) | — |

Host canônico hardcoded `https://aurimarnogueira.com.br` + basePath `/mentormatch` (D-12).

---

## FASE 14 — INFRA, DEPLOY E HOSPEDAGEM

- **Ambientes:** dev local (`localhost:3000`) e prod (HIPÓTESE: **Vercel**, por `@vercel/blob` e termos "Vercel Postgres/Blob" no `.env.example`). Sem staging.
- **Containers/CI/CD:** nenhum (`.github`, `Dockerfile`, `vercel.json` ausentes). Pipeline = build automático da plataforma.
- **Build/Deploy:** `next build`; `postinstall` roda `prisma generate`. DB via `prisma db push` + seed (sem migrations — D-14).
- **Cache/CDN:** CDN da plataforma + SW PWA. **DNS:** domínio externo. **Storage:** Vercel Blob.
- **CONTRATO DE HOSPEDAGEM — basePath `/mentormatch`** (`next.config.ts`): app servida sob subpath. TODA URL absoluta, cookie (`path:"/"`), link de e-mail, `SessionProvider basePath`, manifest e SW **devem** respeitar o subpath. Reproduzir em qualquer host = garantir o prefixo `/mentormatch` (ou parametrizar).
- **Plataforma (Vercel) — como reproduzir (sem `vercel.json`):** Framework=Next (auto); Install `npm install`; Build `next build`; cada `route.ts`/RSC → **Serverless Function (Node)** (Prisma/bcrypt ⇒ não-Edge); `middleware.ts` → Edge Middleware (matcher exclui `_next`/estáticos/`manifest.json`/`sw.js`); **sem** regions/redirects/rewrites/headers/cron configurados; env no painel.

### Variáveis de ambiente
| Var | Função | Obrig.? | Impacto se ausente |
|---|---|---|---|
| `DATABASE_URL` | Postgres (Prisma) | Sim | não sobe |
| `POSTGRES_PRISMA_URL`/`POSTGRES_URL_NON_POOLING` | URLs pooled/diretas | Opc | conforme setup |
| `NEXTAUTH_SECRET`/`AUTH_SECRET` | assinatura JWT | Sim | sessões quebram |
| `NEXTAUTH_URL`/`AUTH_URL` | host canônico | Sim(prod) | links/callbacks errados |
| `EMAIL_FROM` | remetente | Opc | fallback |
| `RESEND_API_KEY` | e-mail | Opc | e-mails falham silenciosamente |
| `BLOB_READ_WRITE_TOKEN` | uploads | Sim(p/ upload) | upload/theme falham |
| `NEXT_PUBLIC_APP_URL`/`APP_URL` | base de links | Opc | fallback hardcoded |
| `NODE_ENV` | modo | auto | secure cookies / prisma singleton |
| `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD` | (declaradas) | Opc | **não lidas no seed** (D/seed) |
| `ENABLE_MAGIC_LINK`/`ENABLE_PUBLIC_REGISTRATION`/`ENABLE_BILLING`/`ENABLE_PUSH_NOTIFICATIONS` | feature flags | Opc | ver `lib/feature-flags.ts` |
| `NEXT_PUBLIC_VAPID_*`/`VAPID_*`/`STRIPE_*` | futuro (comentados) | Não | — |

**Feature flags (`lib/feature-flags.ts`):** `magicLink`(=='true'), `publicRegistration`(≠'false', default ON), `billing`(=='true'), `pushNotifications`(=='true'). **Nota:** flags **não gateiam** o código atual de forma efetiva (ex.: registro público sempre disponível; magic link sem provider).

**Observabilidade:** só `console.error("[CTX_ERROR]", e)` padronizado. **Sem** Sentry/tracing/métricas/alertas. Métricas de negócio on-demand (`/api/admin/reports`, `lib/tenant.getTenantStats`); tabela `Usage` existe mas não é populada.

---

## FASE 17 — BLUEPRINT UNIVERSAL (tech-agnostic)

1. **Arquitetura:** app web server-rendered com (a) renderização no servidor com acesso direto a dados, (b) endpoints HTTP JSON p/ mutações do cliente, (c) middleware de borda p/ atalho de auth + cookie de tenant. Sem filas (efeitos síncronos). Pool/singleton de conexão ao DB.
2. **Domínio:** Tenant↔User(papéis)↔Skill; Connection (máquina de estados) + Waitlist (fila ordenada) governam o matching; Library/Notification/Invitation; Billing como catálogo+assinatura.
3. **Banco:** relacional; isolamento multi-tenant por `tenantId` em toda entidade de tenant (RLS opcional p/ reforço); unicidades: `(email,tenantId)`, `(mentor,mentee,status)`, `(mentor,mentee)` na fila, `slug` de tenant/plano; índices `(role/status,tenantId)`.
4. **APIs:** REST com validação de schema, autz por papel+ownership **lendo o banco**, códigos 2xx/4xx/5xx coerentes; **um único** caminho por operação (sem actions divergentes).
5. **Fluxos:** registro→(convite opcional)→escolha de papel→onboarding(perfil+skills+resolução de tenant)→destino por tabela de roteamento (FASE 10); matching com capacidade N(=4) e promoção FIFO; aprovação por admin.
6. **Infra:** plataforma serverless ou container + Postgres gerenciado + object storage + e-mail transacional; segredos por ambiente; build gera client do ORM; basePath/subpath documentado e parametrizável.
7. **Deploy:** provisionar DB → migrations → seed (planos, tenant default+branded, super admin, skills, subscriptions) → env → publicar; pós-deploy reexecutar seed.

**Invariantes universais (MUST):** (i) guardas que se cruzam lêem a **mesma fonte (banco)**; (ii) onboarding grava tenant+status+flag atomicamente; (iii) URLs absolutas normalizadas (sem duplicar basePath); (iv) capacidade rechecada no aceite; (v) fila contígua; (vi) e-mail/storage best-effort; (vii) **uma** implementação por caso de uso.
