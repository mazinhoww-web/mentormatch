# BLUEPRINT-STACK-ALVO.md — FASE 16: Mapeamento para a Stack de Destino

> Tabela **origem → alvo** para portar o MentorMatch. A stack de destino não foi
> especificada; preencha a coluna **ALVO**. Indícios no repo (env `MENTORMATCH_URL`,
> basePath `/mentormatch`, prefixo de tabelas `mm_`) sugerem **montagem dentro de um
> site maior ("an-site")** sob o subpath `/mentormatch` — por isso há mecanismos de
> isolamento já embutidos. **(HIPÓTESE)**

## 1. Mapeamento de tecnologias

| Domínio | Origem (atual) | ALVO (preencher) | Observação de portabilidade |
|---|---|---|---|
| Framework web | Next.js 16 App Router (RSC) | _____ | Precisa de: render no servidor + endpoints HTTP + middleware. Ex.: Next/Remix/SvelteKit/Nuxt; ou SPA + API (Express/Nest/FastAPI/Rails). |
| Linguagem | TypeScript strict | _____ | Tipos do domínio são triviais de reproduzir. |
| ORM | Prisma 6 | _____ | Drizzle/TypeORM/Prisma/Sequelize; ActiveRecord; SQLAlchemy. Manter constraints/índices da FASE 6. |
| Banco | PostgreSQL | PostgreSQL (recomendado manter) | Usa `String[]` (array), `Json`, `@db.Text`. Em DB sem array, normalizar `languages` em tabela. |
| Auth | NextAuth/Auth.js v5 (JWT, Credentials) | _____ | Requer: hash de senha, sessão assinada, claims {role,status,tenantId,tenantSlug,onboardingDone}. Ex.: Lucia/Auth.js/Passport/Devise/Authlib. |
| Hashing | bcryptjs cost 10 | bcrypt/argon2 | Manter custo equivalente. |
| Validação | Zod 4 | _____ | Zod/Valibot/Yup; pydantic; dry-validation. Schemas na FASE 12. |
| Estilo/Tema | Tailwind 4 + shadcn/ui + CSS vars `theme-{key}` | _____ | Theming = classe no `<body>` por tenant + tokens CSS. Reproduzível em qualquer CSS. |
| Roteamento/basePath | `next.config.ts basePath:/mentormatch` | _____ | **Contrato de subpath** — ver §3. |
| Storage de arquivos | `@vercel/blob` (público) | _____ | S3/R2/GCS/Supabase Storage/disco. Abstrair atrás de `putPublicFile(path, data) → url`. |
| E-mail | Resend | _____ | SES/SendGrid/Postmark/SMTP. Abstrair `sendEmail(to,subject,html)`. Best-effort. |
| Hospedagem | Vercel (HIPÓTESE) | _____ | Serverless ou container; precisa Node runtime (Prisma/bcrypt). |
| Fontes | next/font (Google) | _____ | Hanken Grotesk, Inter, Exo 2, Nunito. |
| PWA | manifest + sw.js | _____ | Ajustar escopo ao subpath (D-13). |

## 2. Mapeamento de modelos/tabelas (origem → alvo)

Manter nomes lógicos; o prefixo físico `mm_` é **proposital para coexistir** com tabelas de um sistema hospedeiro (evita colisão). Recomenda-se **manter um prefixo/namespace** no alvo (`mm_` ou schema dedicado `mentormatch`).

| Modelo (Prisma) | Tabela física | Manter | Correção na migração |
|---|---|---|---|
| Tenant | `mm_tenant` | sim | + (opcional) coluna `maxMenteesPerMentor` (D-08) |
| User | `mm_user` | sim | unicidade `(email,tenantId)` (corrigir registro p/ usá-la — D-05) |
| Skill | `mm_skill` | sim | **+ `tenantId`** e unicidade `(name,tenantId)` (D-04) |
| UserSkill | `mm_user_skill` | sim | — |
| Connection | `mm_connection` | sim | manter `(mentorId,menteeId,status)`; operações em transação (D-09) |
| WaitlistEntry | `mm_waitlist_entry` | sim | reordenação atômica (D-09) |
| LibraryItem | `mm_library_item` | sim | + endpoint DELETE (D-03) |
| Invitation | `mm_invitation` | sim | — |
| Notification | `mm_notification` | sim | — |
| Plan/Subscription/Invoice/Usage | `mm_*` | sim | criar `Subscription` no seed; popular `Usage` se for usar métricas |
| Account/Session/VerificationToken | `mm_*` | conforme auth | se manter JWT, basta `VerificationToken` (D-15) |

**Isolamento multi-tenant no alvo:** coluna `tenantId` (como hoje) **+ recomendado RLS** no Postgres (`USING (tenant_id = current_setting('app.tenant_id'))`) como defesa em profundidade, já que o atual depende 100% do código.

## 3. Contrato de hospedagem (subpath) e conflitos

O app roda sob **`/mentormatch`** (basePath). Ao montar dentro de um site existente:
- **Rotas:** todo path do app é prefixado por `/mentormatch`. Garanta que o host não tenha rota conflitante; reserve o prefixo.
- **Cookies:** `mm.session-token`/`mm.csrf-token`/`mm.callback-url` e `mm-tenant` (path `/`). Os nomes já são prefixados `mm` para não colidir com cookies do host. Mantenha.
- **API:** `SessionProvider basePath="/mentormatch/api/auth"`; todos os `fetch` do front usam `/mentormatch/api/...` literalmente. Ao mudar o prefixo, **parametrize** (hoje hardcoded — D-12).
- **E-mails/links:** derivar de `AUTH_URL`/`NEXT_PUBLIC_APP_URL` (remover host fixo `aurimarnogueira.com.br` — D-12); normalizar p/ não duplicar o subpath.
- **Tabelas:** prefixo `mm_` evita colisão com o schema do host. Alternativa mais limpa: **schema Postgres dedicado** `mentormatch`.
- **Assets/PWA:** `manifest`/`sw.js`/ícones sob o subpath (corrigir D-13).

## 4. Conflitos típicos no destino e como isolar
| Conflito | Mitigação |
|---|---|
| Tabelas com mesmo nome no host | prefixo `mm_` ou schema dedicado |
| Rotas `/api/*` do host | montar tudo sob `/mentormatch/*` (já é o caso) |
| Sessão/cookies do host | nomes `mm.*` distintos (já) |
| Catálogo de skills compartilhado indevidamente | tornar skills por tenant (D-04) |
| Limite de funções serverless | agrupar handlers; runtime Node (Prisma/bcrypt) |

## 5. Checklist de portabilidade
- [ ] Reproduzir schema (FASE 6) com correções D-04/D-08; escolher prefixo/schema.
- [ ] Implementar auth com claims equivalentes; **decisões de acesso lêem o banco** (D-06).
- [ ] **Um** caminho por caso de uso (eliminar actions divergentes D-01/D-02).
- [ ] Implementar DELETE/PATCH faltantes (D-03).
- [ ] Abstrair storage e e-mail; parametrizar base URL e subpath (D-12).
- [ ] Seed completo (FASE 7) incl. subscriptions.
- [ ] Migrations versionadas (D-14).
- [ ] Passar os cenários de BLUEPRINT-ACEITE.md.
