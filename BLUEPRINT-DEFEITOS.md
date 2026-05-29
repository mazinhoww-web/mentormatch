# BLUEPRINT-DEFEITOS.md — FASE 1: Comportamento ATUAL vs INTENCIONAL

> Documento gerado por engenharia reversa **somente-leitura** do código-fonte.
> Toda afirmação tem referência `arquivo:linha`. Suposições marcadas com **(HIPÓTESE)**.
> **A reconstrução deve seguir a coluna "Intencional" e NÃO reproduzir o "Atual".**

Severidades: 🔴 **bloqueia jornada** · 🟠 **quebra função** · 🟡 **fragilidade/risco**

---

## D-01 🔴 Aceitar/recusar mentoria pela UI ignora capacidade, fila e notificações

- **Atual:** o componente de resposta do mentor usa **server actions** simplificadas:
  - `src/components/dashboard/requests/RequestCard.tsx:29` → `acceptRequest(id)`
  - `src/components/dashboard/requests/RequestCard.tsx:41` → `rejectRequest(id)`
  - `src/app/actions/requests.ts` → `acceptRequest` só faz `update{status:ACCEPTED, startedAt}`; `rejectRequest` só faz `update{status:REJECTED}`. **Sem** recheck de capacidade, **sem** promoção da fila, **sem** notificação.
- **Existe em paralelo** a rota completa e correta `PATCH /api/connections` (`src/app/api/connections/route.ts`) que faz capacidade (RN-04), promoção FIFO (RN-06) e notificações (RN-10) — **mas a UI não a chama** (`grep` por `method:"PATCH"`+connection = 0 ocorrências).
- **Intencional:** aceitar deve rechecar `count(ACCEPTED) < maxMentees` (senão 409) e notificar o mentee (`CONNECTION_ACCEPTED`); recusar deve notificar (`CONNECTION_REJECTED`) **e promover o 1º da fila** (criar conexão "Promovido…", notificar `WAITLIST_PROMOTED`, remover da fila, reordenar posições).
- **Regra correta:** RN-04, RN-05, RN-06, RN-07, RN-10.
- **Impacto:** a fila de espera **nunca avança** pela UI; ninguém é promovido; mentees não recebem aviso de aceite/recusa; capacidade pode ser estourada.

## D-02 🔴 Dois caminhos divergentes para "solicitar mentoria"

- **Atual A (correto):** `src/app/t/[slug]/(dashboard)/confirm/[id]/page.tsx:62` → `POST /mentormatch/api/connections` → caminho completo (capacidade→fila, anti-duplicado, notifica mentor).
- **Atual B (divergente):** `src/components/dashboard/MentorProfileDrawer.tsx:58` → action `sendConnectionRequest` (`src/app/actions/connections.ts:31`) → cria `Connection{PENDING}` **sem** checar capacidade, **sem** criar waitlist quando lotado, **sem** notificar o mentor (só faz anti-duplicado RN-03).
- **Intencional:** **um único** caminho de solicitação, sempre com RN-01/02/03/10.
- **Regra correta:** RN-01, RN-02, RN-03, RN-10.
- **Impacto:** comportamento depende de qual botão o usuário usa; pelo drawer, mentor lotado recebe conexão direto (fura a fila) e não é notificado.

## D-03 🟠 Endpoints chamados pelo front que NÃO existem no backend (admin quebrado)

- **Atual:**
  - `src/app/t/[slug]/admin/skills/page.tsx:180` e `:211` → `fetch("/mentormatch/api/skills?id=...", {method: PATCH/DELETE})`
  - `src/app/t/[slug]/admin/library/page.tsx:213` → `fetch("/mentormatch/api/library?id=...", {method: DELETE})`
  - **Mas** `src/app/api/skills/route.ts` exporta **apenas GET/POST**; `src/app/api/library/route.ts` exporta **apenas GET/POST** (verificado por grep de `export async function`). Não há `DELETE`/`PATCH`/`PUT`.
- **Intencional:** existir `DELETE`/`PATCH` de skill e `DELETE` de library item (com autz ADMIN e escopo de tenant).
- **Regra correta:** ADMIN gerencia o catálogo do seu tenant (editar/excluir skill, excluir material).
- **Impacto:** botões de editar/excluir em Admin → Skills e Admin → Biblioteca retornam 405/404; funções administrativas inoperantes.

## D-04 🟠 Skills são GLOBAIS, não por tenant (contradiz produto)

- **Atual:** `prisma/schema.prisma` → `model Skill { name String @unique }` (único **global**, sem `tenantId`). `GET /api/skills` (`src/app/api/skills/route.ts:6`) retorna **todas** as skills ativas, ignorando o `tenantId=${params.slug}` que o front envia (`admin/skills/page.tsx`).
- **Intencional (HIPÓTESE, baseada no README "habilidades por tenant"):** catálogo de skills **por tenant** (ou marcação global+custom por tenant).
- **Regra correta:** isolamento de catálogo por tenant.
- **Impacto:** vazamento de catálogo entre tenants; o filtro por tenant na UI não tem efeito.

## D-05 🟠 Registro trata e-mail como único GLOBAL, mas o schema é por tenant

- **Atual:** `src/app/api/auth/register/route.ts` → `db.user.findFirst({ where:{ email } })` (sem tenant) → 409 se existir em **qualquer** tenant. Porém `schema.prisma` define `@@unique([email, tenantId])` (e-mail único **por tenant**).
- **Intencional:** o mesmo e-mail pode existir em tenants diferentes (multi-tenant real); o conflito deve ser checado por `(email, tenantId)`.
- **Regra correta:** unicidade por tenant (RN-11).
- **Impacto:** uma pessoa não consegue se cadastrar em dois programas (tenants) distintos com o mesmo e-mail.

## D-06 🟡 Guardas de API confiam no JWT (papel/tenant), fonte que fica defasada

- **Atual:** rotas admin usam `session.user.role` / `session.user.tenantId` do **JWT**:
  - `src/app/api/admin/users/route.ts` (GET e PATCH): `session.user.role !== "ADMIN"`.
  - `src/app/api/admin/reports/route.ts`, `src/app/api/admin/export/route.ts`, `src/app/api/admin/settings/route.ts`, `src/app/api/invitations/route.ts`.
- **Contexto:** o mesmo padrão **token-vs-banco** já causou o loop `ERR_TOO_MANY_REDIRECTS` nas páginas; foi corrigido **apenas nas guardas de layout** (`(dashboard)/layout.tsx`, `mentor|mentee/layout.tsx` agora leem o banco). As **APIs continuam no JWT**.
- **Intencional:** **toda decisão de acesso lê a fonte autoritativa (banco)**, ou ao menos revalida quando o claim pode estar defasado.
- **Regra correta:** "decisões de acesso leem o banco, não o token".
- **Impacto:** logo após mudança de papel/tenant (antes do `update()` da sessão), chamadas de API podem autorizar/negar incorretamente.

## D-07 🟠 RBAC inconsistente: SUPER_ADMIN excluído de rotas administrativas

- **Atual:** `admin/users` e `admin/reports` exigem `role === "ADMIN"` (negam SUPER_ADMIN); já `admin/export` e `invitations` aceitam `ADMIN || SUPER_ADMIN`.
- **Intencional:** SUPER_ADMIN deve ter **superconjunto** das permissões de ADMIN.
- **Impacto:** SUPER_ADMIN não consegue gerir usuários/relatórios de um tenant pela API.

## D-08 🟠 `admin/settings` aceita `maxMenteesPerMentor` mas NÃO persiste

- **Atual:** `src/app/api/admin/settings/route.ts` (PATCH) valida `maxMenteesPerMentor` mas o comentário e o `update` **não gravam** (não há coluna no Tenant). GET devolve constante `4`.
- **Intencional:** persistir o limite de mentees por mentor por tenant (coluna em Tenant **ou** aplicar em `User.maxMentees`).
- **Impacto:** admin altera o limite na UI, "salva", mas nada muda.

## D-09 🟡 Fluxos sem transação/lock → corridas de capacidade e posição de fila

- **Atual:** capacidade (`count` então `create`) e posição (`max(position)+1`) não usam transação serializável/lock (`src/app/api/connections/route.ts`). `waitlist PATCH` faz updates em `Promise.all`.
- **Intencional:** operações de capacidade/fila atômicas (transação + unicidade) para evitar ultrapassar `maxMentees` ou gerar `position` duplicada sob concorrência.
- **Impacto:** em volume, dois pedidos simultâneos podem furar a capacidade ou duplicar posição.

## D-10 🟡 Magic link: flag + e-mail existem, provider NÃO está ligado

- **Atual:** `src/lib/feature-flags.ts` (`magicLink`), `src/lib/email.ts:sendMagicLinkEmail`, `.env.example:ENABLE_MAGIC_LINK=true`. Mas `src/lib/auth.ts` só registra o provider **Credentials** — não há provider Email/magic-link.
- **Intencional (HIPÓTESE):** login por magic link quando a flag estiver ativa.
- **Impacto:** funcionalidade anunciada não funciona.

## D-11 🟡 Código morto

- `src/app/actions/onboarding.ts:9` `completeOnboarding` — **sem chamadores** (o `OnboardingWizard`/`/onboarding/setup` que a usava foi removido). Morto.
- `src/app/actions/connections.ts:13` `scheduleSession` — sem chamadores; só atualiza `updatedAt` (no-op semântico).
- `src/app/actions/library.ts:65` `toggleSaveMaterial` — sem chamadores; corpo vazio (não há modelo de "salvos").
- **Intencional:** remover, ou implementar de verdade (agendamento de sessão; materiais salvos).

## D-12 🟡 Acoplamento a domínio/host e a Vercel hardcoded

- **Atual:** host `https://aurimarnogueira.com.br` e basePath `/mentormatch` embutidos em `src/lib/email.ts` (welcome, convite), `src/lib/tenant-href.ts`, `src/app/sicredi/layout.tsx`. `@vercel/blob` usado sem abstração (`lib/theme-provisioner`, `actions/*`, `api/upload`).
- **Intencional:** base de URL via env (`NEXT_PUBLIC_APP_URL`/`AUTH_URL`); storage atrás de interface.
- **Impacto:** difícil rodar em outro domínio/host sem editar código.

## D-13 🟡 PWA com escopo/basePath inconsistente

- **Atual:** app sob basePath `/mentormatch`, mas `public/manifest.json` `start_url:"/"` e `public/sw.js` cacheia `['/', '/login', '/manifest.json']` (sem prefixo).
- **Intencional:** `start_url`/scope/precache sob `/mentormatch`.
- **Impacto (HIPÓTESE):** SW pode não casar o escopo correto; precache aponta para paths errados.

## D-14 🟡 Sem migrations versionadas (drift de schema)

- **Atual:** fluxo é `prisma db push` (`package.json:db:push`); não há diretório `prisma/migrations`.
- **Intencional:** migrations versionadas para produção (histórico/rollback).
- **Impacto:** risco de divergência entre ambientes; sem rollback estruturado.

## D-15 🟡 Estratégia de sessão JWT, mas tabelas de adapter presentes e ociosas

- **Atual:** `src/lib/auth.ts` → `session.strategy:"jwt"` com `PrismaAdapter`; tabelas `Session`/`Account`/`VerificationToken` existem. Só `VerificationToken` é usada (reset de senha). `Session`/`Account` ficam ociosas; `User.emailVerified` nunca é setado.
- **Intencional:** manter só o necessário (JWT + VerificationToken) **ou** mudar para sessão de banco. Coerência.
- **Impacto:** confusão/peso de schema desnecessário (baixo).

## D-16 🟡 Defeito histórico já corrigido (registrar para não regredir)

- **Loop `ERR_TOO_MANY_REDIRECTS`** pós-onboarding: a guarda de ownership lia `tenantSlug`/`role` do **JWT** (defasado) enquanto `/select-profile` lia o **banco**, causando ricochete. **Corrigido** em `src/app/t/[slug]/(dashboard)/layout.tsx` e nas guardas de papel (agora leem o banco). **Invariante a preservar:** guardas que se cruzam usam a mesma fonte (banco).

---

## Resumo executivo dos defeitos

| ID | Severidade | Tema | Reconstruir como |
|----|-----------|------|------------------|
| D-01 | 🔴 | accept/reject sem capacidade/fila/notif | usar 1 caminho completo |
| D-02 | 🔴 | 2 caminhos de solicitação | unificar no caminho completo |
| D-03 | 🟠 | DELETE/PATCH skills/library inexistentes | implementar handlers |
| D-04 | 🟠 | skills globais | skills por tenant |
| D-05 | 🟠 | e-mail único global no registro | unicidade por (email,tenant) |
| D-06 | 🟡 | guardas de API via JWT | decisões de acesso leem o banco |
| D-07 | 🟠 | SUPER_ADMIN excluído de rotas admin | SUPER ⊇ ADMIN |
| D-08 | 🟠 | maxMentees não persiste | persistir e aplicar |
| D-09 | 🟡 | corridas capacidade/fila | transação + unicidade |
| D-10 | 🟡 | magic link não ligado | implementar atrás da flag ou remover |
| D-11 | 🟡 | código morto | remover/implementar |
| D-12 | 🟡 | host/basePath/storage hardcoded | env + interfaces |
| D-13 | 🟡 | PWA basePath | escopo correto |
| D-14 | 🟡 | sem migrations | migrations versionadas |
| D-15 | 🟡 | tabelas de auth ociosas | coerência de estratégia |
| D-16 | ✅ | loop redirect (corrigido) | preservar invariante banco |
