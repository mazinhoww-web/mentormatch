# PROMPT-RECONSTRUCAO.md — FASE 18: Prompt Mestre de Reconstrução

> Prompt único e autossuficiente para uma IA reconstruir o **MentorMatch** do zero, **com os
> defeitos corrigidos**. Cole tudo abaixo como instrução. Stack-alvo: preencha `<ALVO>`.

---

```text
Você vai reconstruir "MentorMatch": plataforma WHITE-LABEL, MULTI-TENANT, de mentoria
corporativa (PT-BR, contato via WhatsApp, moeda BRL). Stack-alvo: <ALVO>. Preserve a
SEMÂNTICA abaixo; adapte só a sintaxe. Implemente o COMPORTAMENTO INTENCIONAL — não copie
os defeitos da seção [NÃO REPRODUZA]. Saída concisa por etapa.

[PAPÉIS] SUPER_ADMIN(gere todos os tenants) ⊇ ADMIN(gere 1 tenant) ; MENTOR ; MENTEE.

[ENUMS]
 UserStatus: PENDING|APPROVED|REJECTED|SUSPENDED.
 ConnectionStatus: PENDING|ACCEPTED|REJECTED|CANCELLED|COMPLETED.
 FileType: PDF|VIDEO|ARTICLE|OTHER.
 NotificationType: CONNECTION_REQUEST|CONNECTION_ACCEPTED|CONNECTION_REJECTED|
   WAITLIST_PROMOTED|NEW_MATERIAL|ACCOUNT_APPROVED|SYSTEM.

[ENTIDADES] (id cuid/uuid + createdAt/updatedAt; prefixe tabelas com mm_ ou use schema dedicado)
 Tenant{name, slug UNIQUE, logoUrl?, brandColor="#6366f1", secondaryColor?, domain? UNIQUE,
   active=true, themeKey="dark", themeCssUrl?, tokens?, maxUsers=50, maxConnections=100,
   maxLibraryItems=10, maxMenteesPerMentor=4, planId?}
 User{email, name?, password?(hash bcrypt/argon2), image?, role?, status=PENDING, bio?, headline?,
   position?, department?, languages[], education?, experience?, linkedin?, whatsapp?,
   maxMentees=4, onboardingDone=false, tenantId? ; UNIQUE(email,tenantId);
   INDEX tenantId,(role,tenantId),(status,tenantId)}
 Skill{name, category?, usageCount=0, isActive=true, tenantId ; UNIQUE(name,tenantId)}   // por tenant
 UserSkill{userId, skillId, isTeaching=false ; UNIQUE(userId,skillId)}
 Connection{mentorId, menteeId, tenantId, status=PENDING, message?, startedAt?, endedAt? ;
   UNIQUE(mentorId,menteeId,status); INDEX(mentorId,status),menteeId,tenantId}
 WaitlistEntry{mentorId, menteeId, position:int, createdAt ; UNIQUE(mentorId,menteeId);
   INDEX(mentorId,position)}
 LibraryItem{title, description?, fileUrl, fileType=PDF, fileSize?, tenantId, uploadedById}
 Invitation{email, tenantId, role, token UNIQUE, used=false, expiresAt(+7d), invitedById?, type?}
 Notification{userId, tenantId, type, title, message, read=false, metadata?json, createdAt}
 Plan{name, slug UNIQUE, priceMonthly=0, priceYearly=0, maxUsers=50, maxConnections=100,
   maxLibraryItems=10, maxAdmins=1, features?json, active=true}
 Subscription{tenantId UNIQUE, planId, active=true, startDate, endDate?}
 Invoice{subscriptionId, amount, currency="BRL", status="paid", paidAt?}
 Usage{tenantId, metric, value, period ; UNIQUE(tenantId,metric,period)}
 VerificationToken{identifier, token UNIQUE, expires ; UNIQUE(identifier,token)}  // p/ reset de senha

[MULTI-TENANCY] coluna discriminadora tenantId em TODA entidade de tenant.
 RECOMENDADO: RLS no Postgres (USING tenant_id = current_setting('app.tenant_id')) além da checagem
 em código. Isolamento NUNCA depende só do front.

[SEED OBRIGATÓRIO] (idempotente; chave de user (email,tenantId))
 Planos: free(0/0;50,100,10,1) starter(299/2990;200,500,-,3) pro(799/7990;1000,∞,-,10) enterprise(∞).
 Tenant "default"(MentorMatch Demo, free) + Subscription(free) + ADMIN admin@... (APPROVED).
 Tenant "sicredi"(brand #33820D, secondary #0A4B1E, themeKey "sicredi", free) + Subscription.
 Super admin (SUPER_ADMIN, APPROVED, onboardingDone, vinculado ao default) — credenciais via env.
 Skills por tenant (Technology/Design/Management/Marketing/Career).
 Sem o tenant "default"/"sicredi" o cadastro público quebra.

[AUTH] Sessão assinada (JWT) em cookie httpOnly. Login email+senha (compare hash).
 Claims hidratados do banco no sign-in e em refresh/update: role,status,tenantId,tenantSlug,onboardingDone.
 Cookies: sessão httpOnly+lax+secure(prod); cookie de tenant "mm-tenant"=slug (NÃO httpOnly,1d), setado
 pela landing branded, limpo na raiz "/". Reset de senha via VerificationToken (expira; consome no uso;
 token expirado é deletado). Trocar senha logado confere a senha atual.
 REGRA DE OURO: TODA decisão de acesso (páginas E APIs) LÊ O BANCO, não o token (o token fica defasado
 logo após onboarding). Guardas que se cruzam usam a MESMA fonte (banco) — senão há loop de redirect.

[ROTEAMENTO PÓS-LOGIN] (tabela única; helper lê banco+cookie de tenant)
 role SUPER_ADMIN → /admin
 role null OU tenant null → /select-profile
 onboardingDone=false → /onboarding/{mentor|mentee}
 ADMIN → /t/{slug}/admin/users ; MENTOR → /t/{slug}/mentor ; MENTEE → /t/{slug}/mentee
 Páginas /select-profile e /onboarding/* EXIGEM sessão (após registro faz-se signIn antes de redirecionar).

[GUARDAS] (server-side, por request, FONTE=BANCO)
 /t/{slug}/*: sem sessão→/login; tenant inexistente/ inativo→404; role!=SUPER_ADMIN && user.tenant.slug!=slug
   → roteamento pós-login.
 /t/{slug}/mentor: role==MENTEE → /t/{slug}/mentee (e simétrico).
 /t/{slug}/admin: só ADMIN/SUPER_ADMIN. /admin: só SUPER_ADMIN.

[REGRAS DE NEGÓCIO]
 R1 Capacidade: mentor aceita ≤ maxMentees(default 4) conexões ACCEPTED.
 R2 Lotado→fila: POST conexão a mentor cheio cria WaitlistEntry(position=max+1), retorna {waitlisted,position}.
 R3 Anti-duplicado: bloqueia novo pedido se já há (mentor,mentee) em PENDING|ACCEPTED → 409.
 R4 Recheck capacidade ao ACCEPT (senão 409).
 R5 Só o mentor faz ACCEPT/REJECT (senão 403).
 R6 Promoção FIFO: ao REJECT/COMPLETE/CANCEL, puxa 1º da fila (position asc) → cria Connection PENDING
    "Promovido da lista de espera", notifica WAITLIST_PROMOTED, remove da fila, decrementa posteriores.
 R7 Fila sempre contígua. R8 Reordenar fila: só mentor dono (valida posse). R9 Remover fila: mentor dono
    ou o próprio mentee.
 R10 Notificações: CONNECTION_REQUEST(ao pedir), ACCEPTED/REJECTED(ao responder), WAITLIST_PROMOTED,
    ACCOUNT_APPROVED(ao aprovar).
 R11 Registro: sem convite→PENDING(sem role/tenant); com convite válido(existe,!used,!expirado,email casa)
    →APPROVED+role+tenant, marca convite used; conflito de e-mail checado por (email,tenant); welcome best-effort.
 R12 Completar perfil (TRANSAÇÃO): resolve tenant(R13), grava role+perfil+skills(isTeaching=role==MENTOR),
    seta tenantId+status=APPROVED+onboardingDone=true.
 R13 Resolver tenant: tenantId atual ?? Tenant(slug=cookie mm-tenant||"default", active) ?? Tenant("default");
    senão 400.
 R14 Aprovar usuário (ADMIN/SUPER, só do tenant): muda status; em APPROVED → e-mail + notificação.
 R15 Convite: ADMIN/SUPER; sem duplicado pendente; token aleatório; expira 7d; e-mail best-effort.
 R16 Biblioteca: só ADMIN/MENTOR cria; excluir (ADMIN); tipo por extensão (pdf→PDF; mp4/mov/webm/mkv→VIDEO;
    md/txt/doc/docx→ARTICLE; else OTHER); vinculado a tenant+uploader.
 R17 Skill por tenant: criar/editar/excluir (ADMIN); nome único por tenant (case-insensitive).
 R18 Reset senha por VerificationToken. R19 Trocar senha confere atual. R20 Notif: marcar {id} própria
    ou {all} não lidas. R21 Buscar mentores: exige tenantId; só MENTOR APPROVED do tenant; filtros q/skill;
    devolve activeConnections. R22 Export CSV (ADMIN/SUPER): users|connections|skills. R23 Settings tenant:
    ADMIN só o seu slug / SUPER qualquer; maxMenteesPerMentor É PERSISTIDO e aplicado.
 CONCORRÊNCIA: capacidade e posição de fila em TRANSAÇÃO (evitar furar limite / duplicar posição).

[APIs] REST (401 sem sessão, 400 inválido, 403 sem permissão, 404, 409 conflito, 500 erro). Implementar:
 auth/register, auth/complete-profile, auth/forgot-password (SEMPRE 200; URL de reset normalizada p/ não
 duplicar subpath/barra), auth/reset-password; mentors(GET, exige tenantId); connections(GET/POST/PATCH —
 ÚNICO caminho de solicitar/responder, com R1-R6,R10); waitlist(GET/PATCH/DELETE);
 admin/users(GET/PATCH, ADMIN+SUPER), admin/reports(GET, ADMIN+SUPER), admin/export(GET CSV),
 admin/settings(GET/PATCH, persiste maxMentees); skills(GET por tenant /POST/PATCH/DELETE);
 library(GET por tenant /POST/DELETE); notifications(GET/PATCH); invitations(GET/POST e /[token] GET/PATCH);
 tenant/clear(POST); upload(POST multipart→storage); users/me(GET/PATCH).
 Use UM caminho por operação (não duplicar lógica em "actions" simplificadas).

[INTEGRAÇÕES] e-mail transacional (best-effort, falha não derruba), object storage público (uploads e CSS de
 tema), Postgres. Sem filas/cron: promoção e notificações são síncronas no request.

[THEMING WHITE-LABEL] tenant.themeKey → classe "theme-{key}" no <body> (resolvida por cookie no layout raiz);
 tokens de design parseáveis de um design.md → CSS publicado no storage (themeCssUrl).

[INFRA/DEPLOY] serverless ou container com runtime que suporte o ORM/hash. Provisionar DB → MIGRATIONS
 versionadas → seed → env → publicar; reexecutar seed em produção. App roda sob um basePath/subpath (ex.
 /mentormatch): TODA URL absoluta, cookie, link de e-mail, manifest e service worker DEVEM respeitar o subpath,
 e o subpath deve ser PARAMETRIZÁVEL (não hardcoded). Env: DATABASE_URL, AUTH_SECRET, AUTH_URL/APP_URL,
 EMAIL_FROM, <EMAIL_KEY>, <STORAGE_TOKEN>, NODE_ENV, flags ENABLE_*. Observabilidade: logs estruturados +
 (recomendado) error-tracking/tracing (ausentes no original).

[CRITÉRIOS DE ACEITE] registro no landing branded → onboarding → dashboard SEM loop e SEM cair em /login no
 meio; MENTOR/MENTEE não acessam a área um do outro; tenant A não vê tenant B (SUPER vê); decisão de acesso
 reflete o banco imediatamente; 4º ACCEPT lota e 5º vira fila; REJECT/COMPLETE/CANCEL promove o 1º e reordena;
 admin cria/edita/exclui skills e exclui materiais; settings persiste maxMentees; mesmo e-mail registra em 2
 tenants; type-check e build de produção passam; seed cria default+sicredi+super admin+subscriptions+skills.

[NÃO REPRODUZA] (defeitos do projeto original — ver BLUEPRINT-DEFEITOS.md)
 - NÃO usar dois caminhos divergentes para solicitar/responder mentoria (a UI antiga usava server actions
   acceptRequest/rejectRequest/sendConnectionRequest SEM capacidade/fila/notificação). Use só a rota completa.
 - NÃO deixar endpoints DELETE/PATCH de skills/library referenciados no front sem backend (no original
   admin/skills e admin/library chamavam DELETE inexistente).
 - NÃO basear decisões de acesso no token/JWT (defasa pós-onboarding) — sempre o banco.
 - NÃO tornar skills globais — são por tenant.
 - NÃO checar conflito de e-mail global no registro — checar por (email,tenant).
 - NÃO excluir SUPER_ADMIN das rotas administrativas — SUPER ⊇ ADMIN.
 - NÃO aceitar maxMenteesPerMentor na API sem persistir/aplicar.
 - NÃO fazer capacidade/posição de fila fora de transação.
 - NÃO anunciar magic link/push/billing sem implementar (ou esconder atrás de flag REAL).
 - NÃO deixar código morto (completeOnboarding, scheduleSession, toggleSaveMaterial) nem host/subpath hardcoded.
 - NÃO publicar PWA com start_url/scope fora do subpath.
 - NÃO usar db push sem migrations versionadas em produção.
```

---

## Como usar
1. Defina `<ALVO>`, `<EMAIL_KEY>`, `<STORAGE_TOKEN>`.
2. Rode o prompt; valide cada etapa contra `BLUEPRINT-ACEITE.md`.
3. Use `BLUEPRINT.md` (FASES 2–17) como referência detalhada e `BLUEPRINT-STACK-ALVO.md` (FASE 16) para o mapeamento de tecnologias e isolamento de subpath/tabelas.
