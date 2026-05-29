# BLUEPRINT-ACEITE.md — FASE 15: Critérios de Aceitação E2E

> Cenários verificáveis para a reconstrução **com os defeitos corrigidos** (ver BLUEPRINT-DEFEITOS.md).
> Cada cenário: **Passos → Resultado esperado**. Roteiro de rotas reaproveitado de `scripts/take-screenshots.js`.
> ✅ = deve passar na reconstrução. ⛔ = hoje falha por defeito (id entre colchetes).

## A. Registro → Onboarding → Dashboard (jornada núcleo)
- **A1 ✅** Acessar landing branded `/{slug}` (ex.: `/sicredi`) → cookie `mm-tenant=sicredi` é setado.
- **A2 ✅** Registrar (nome, e-mail, senha) → conta criada; usuário autenticado automaticamente (`signIn`).
- **A3 ✅** Escolher papel (Mentor/Mentorado) → onboarding correspondente.
- **A4 ✅** Concluir onboarding (perfil + ≥1 skill) → usuário fica `tenantId=sicredi`, `status=APPROVED`, `onboardingDone=true`; **redireciona ao dashboard SEM loop** e **sem cair em /login no meio**. *(Regressão do `ERR_TOO_MANY_REDIRECTS` — D-16.)*
- **A5 ✅** Recarregar o dashboard → permanece (sidebar mostra nome/role corretos do banco).

## B. Login / Logout / Reset de senha
- **B1 ✅** Login com credenciais válidas → destino conforme tabela de roteamento (FASE 10).
- **B2 ✅** Login inválido → erro, sem sessão.
- **B3 ✅** Logout → sessão encerrada; rotas protegidas redirecionam a `/login`.
- **B4 ✅** `forgot-password` com e-mail qualquer → **sempre 200** (não revela existência); se existir, e-mail com URL **sem** `/mentormatch` duplicado nem `//`.
- **B5 ✅** `reset-password` com token válido → senha trocada; token consumido. Token expirado → 400 e token removido.
- **B6 ✅** Trocar senha logado com senha atual incorreta → erro; correta → troca.

## C. Matching, capacidade e fila (corrigir D-01/D-02)
- **C1 ✅** Mentee solicita mentor com vaga → `Connection PENDING`; mentor recebe notificação `CONNECTION_REQUEST`. *(Mesmo comportamento por QUALQUER entrada de UI — caminho único.)*
- **C2 ✅** Solicitar o mesmo mentor já PENDING/ACCEPTED → bloqueado (409/erro).
- **C3 ✅** 4ª conexão ACCEPTED enche o mentor; **5º pedido vira fila** `position=1` (resposta indica waitlisted+posição).
- **C4 ✅** Mentor **aceita** → mentee recebe `CONNECTION_ACCEPTED`; aceitar acima do limite → bloqueado.
- **C5 ✅** Mentor **recusa**/encerra(COMPLETED)/cancela → mentee notificado; **1º da fila é promovido** (nova `Connection PENDING` "Promovido…", notificação `WAITLIST_PROMOTED`), e as posições restantes **decrementam**. *(Hoje a UI não promove — D-01.)*
- **C6 ✅** Reordenar fila: só o mentor dono; entradas de outro mentor → 403.
- **C7 ✅** Remover da fila: mentor dono ou o próprio mentee; posições reordenam.

## D. Busca de mentores
- **D1 ✅** `/t/{slug}/mentors` lista só `MENTOR` `APPROVED` do tenant, com `activeConnections`.
- **D2 ✅** Filtro por `q` (nome/headline/bio, case-insensitive) e por `skill` (isTeaching) funciona.
- **D3 ✅** GET `/api/mentors` sem `tenantId` → 400.

## E. Admin do tenant
- **E1 ✅** Listar usuários do tenant; aprovar/recusar/suspender (`status`) → e-mail+notificação em APPROVED; usuário de outro tenant → 403.
- **E2 ✅** Relatórios (totais, conexões/mês, top skills) carregam.
- **E3 ✅** Export CSV `users|connections|skills`.
- **E4 ✅** Convidar (e-mail+papel) → convite 7d; convite pendente duplicado → 409.
- **E5 ✅** **Skills:** criar, **editar e excluir** (catálogo do tenant). *(Hoje editar/excluir quebram — D-03/D-04.)*
- **E6 ✅** **Biblioteca:** criar e **excluir** material. *(Hoje excluir quebra — D-03.)*
- **E7 ✅** Settings: alterar nome/cor/logo **e** `maxMenteesPerMentor` → **persistido** e refletido na capacidade. *(Hoje não persiste — D-08.)*

## F. Super admin
- **F1 ✅** `/admin` só acessível por SUPER_ADMIN; demais redirecionados.
- **F2 ✅** Listar tenants com stats (users/mentors/sessions).
- **F3 ✅** Criar tenant (slug `^[a-z0-9-]+$`); slug inválido → erro.
- **F4 ✅** SUPER_ADMIN consegue usar rotas administrativas (users/reports) de qualquer tenant. *(Hoje excluído — D-07.)*

## G. Isolamento (tenant × papel)
- **G1 ✅** Usuário do tenant A acessando `/t/B/...` → redirecionado ao próprio dashboard (SUPER_ADMIN isento).
- **G2 ✅** MENTOR em `/t/{slug}/mentee` → redirecionado a `/mentor` (e simétrico).
- **G3 ✅** Não-admin em `/t/{slug}/admin/*` → redirecionado ao dashboard do papel.
- **G4 ✅** **Decisão de acesso reflete o banco imediatamente** após mudança de papel/tenant (sem depender do refresh do token) — vale para páginas **e APIs**. *(Hoje APIs usam JWT — D-06.)*
- **G5 ✅** Mesmo e-mail pode registrar em dois tenants distintos. *(Hoje bloqueado — D-05.)*

## H. Branding por tenant
- **H1 ✅** Landing/`<body>` aplicam `theme-{themeKey}` e cores do tenant (cookie `mm-tenant`).
- **H2 ✅** Tenant `sicredi` exibe tema verde (`#33820D`); tenant `default` o tema padrão.
- **H3 ✅** Logo/cor configurados em Settings refletem na UI.

## I. Infra / não-funcionais
- **I1 ✅** `build` de produção e type-check estrito passam.
- **I2 ✅** App funciona sob o basePath de hospedagem (links, cookies, e-mails, manifest, SW coerentes).
- **I3 ✅** Seed cria planos + tenant default + tenant branded + super admin + skills (+ subscriptions).
- **I4 ✅** Falha de e-mail/storage **não** derruba o fluxo principal.
