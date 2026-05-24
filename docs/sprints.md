# MentorMatch - Plano de Sprints

> Roteiro completo de execucao por sprints.
> Status: [ ] Pendente | [-] Em Andamento | [x] Concluido

---

## Sprint 0: Documentacao e Setup (Atual)

**Objetivo**: Gerar toda documentacao e preparar ambiente.

- [x] Analise de requisitos e screenshots
- [x] Definicao de perguntas de planejamento
- [x] Respostas do usuario coletadas
- [x] Gerar PRD (product-requirements.md)
- [x] Gerar .clauderules
- [x] Gerar design.md
- [x] Gerar database.md
- [x] Gerar .env.example
- [x] Gerar sprints.md (este arquivo)
- [x] Gerar README.md
- [x] Gerar CLAUDE.md

---

## Sprint 1: Scaffolding e Banco de Dados

**Objetivo**: Criar projeto Next.js com todas as dependencias e banco configurado.

**Duracao estimada**: 1 sessao

### Tarefas

1. [ ] Criar projeto Next.js 15
   ```bash
   echo "my-app" | npx shadcn@latest init --yes --template next --base-color slate
   ```

2. [ ] Instalar dependencias
   ```bash
   npm install @prisma/client bcryptjs next-auth@beta resend @vercel/blob \
     react-hook-form @hookform/resolvers zod uuid date-fns \
     @radix-ui/react-icons lucide-react
   npm install -D prisma @types/bcryptjs @types/uuid
   ```

3. [ ] Configurar shadcn components
   ```bash
   npx shadcn add button card input badge avatar dialog toast \
     tabs separator dropdown-menu sheet scroll-area skeleton
   ```

4. [ ] Criar schema.prisma com todas as tabelas

5. [ ] Configurar variaveis de ambiente (.env.local)

6. [ ] Rodar migrate e seed
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

7. [ ] Criar singleton do Prisma client (lib/prisma.ts)

8. [ ] Estrutura de pastas e arquivos base

### Deliverables
- Projeto rodando local (`npm run dev`)
- Banco criado com tabelas e dados iniciais
- Prisma Client configurado

### Prompt para Claude Code
```
Execute a Sprint 1 completa: crie o projeto Next.js com shadcn/ui, 
instale todas as dependencias, configure o Prisma com o schema completo, 
rode as migrations com seed data, e crie a estrutura de pastas.
Siga o schema em: database.md
```

---

## Sprint 2: Autenticacao e Multi-Tenancy

**Objetivo**: Sistema de login, registro e isolamento por empresa.

**Duracao estimada**: 1-2 sessoes

### Tarefas

1. [ ] Configurar NextAuth.js v5 (Auth.js)
   - Provider de credenciais (email/senha)
   - Provider de email (magic link)
   - Callbacks para incluir tenantId na session

2. [ ] Criar pagina de registro
   - Formulario com Zod validation
   - Selecao de tenant
   - Criar conta no banco

3. [ ] Criar pagina de login
   - Email + senha
   - Botao "Entrar com Magic Link"
   - Estado de loading

4. [ ] Implementar sistema de tenant
   - Resolucao por path: `/t/[slug]/...`
   - Middleware para validar tenant
   - Context provider de tenant

5. [ ] Logout e protecao de rotas

6. [ ] Criar seed de super-admin

### Deliverables
- Registro de usuario funcional
- Login com email/senha funcional
- Magic link funcional
- Tenants isolados (dados nao se misturam)
- Middleware protegendo rotas

### Prompt para Claude Code
```
Execute a Sprint 2: configure NextAuth.js v5 com providers de credenciais 
(e-mail/senha) e magic link. Crie as paginas de login e registro com 
validacao Zod. Implemente o sistema de multi-tenancy via path 
`/t/[slug]/...` com middleware de resolucao e isolamento. 
Proteja as rotas e crie o seed do super-admin.
```

---

## Sprint 3: Onboarding e Perfil

**Objetivo**: Fluxo de selecao de perfil, criacao e edicao de perfil.

**Duracao estimada**: 1-2 sessoes

### Tarefas

1. [ ] Tela de boas-vindas / selecao de perfil
   - Logo do tenant
   - Botao Mentor (primary) e Mentee (secondary)
   - Cores dinamicas por tenant

2. [ ] Formulario de completar perfil
   - Upload de foto (Vercel Blob)
   - Nome, bio, formacao
   - Cargo, departamento
   - WhatsApp, idiomas
   - Server action para salvar

3. [ ] Sistema de skills
   - Lista de skills do banco
   - Tags selecionaveis (ensina/quer aprender)
   - Campo "Outro" para adicionar nova skill
   - Auto-save das selecoes

4. [ ] Pagina de perfil (visualizacao)
   - Mostrar dados do usuario
   - Habilidades como tags
   - Botao editar

5. [ ] Pagina de edicao de perfil

### Deliverables
- Tela de boas-vindas com selecao de perfil
- Formulario de perfil completo funcional
- Upload de foto funcionando
- Sistema de skills com "Outro" funcionando
- Perfil visualizavel e editavel

### Prompt para Claude Code
```
Execute a Sprint 3: crie a tela de boas-vindas com selecao Mentor/Mentee 
usando cores do tenant. Crie o formulario completo de perfil com upload 
de foto via Vercel Blob, skills com tags selecionaveis e campo "Outro" 
que adiciona nova skill globalmente. Crie as paginas de visualizacao 
e edicao de perfil.
```

---

## Sprint 4: Diretorio de Mentores e Matching

**Objetivo**: Listagem, busca, filtros e sistema de solicitacao.

**Duracao estimada**: 2 sessoes

### Tarefas

1. [ ] Pagina Match (diretorio de mentores)
   - Grid de cards 2 colunas (mobile)
   - Foto, nome, cargo, skills, status
   - Pull-to-refresh

2. [ ] Sistema de busca
   - Search bar com debounce
   - Busca por nome, cargo, skill

3. [ ] Filtros
   - Por habilidade (multi-select)
   - Por disponibilidade
   - Accordion de filtros

4. [ ] Detalhes do mentor
   - Modal ou pagina dedicada
   - Perfil completo
   - Botao "Solicitar Mentoria"

5. [ ] Sistema de solicitacao
   - Modal com mensagem opcional
   - Criar Connection com status PENDING
   - Notificar mentor (email + in-app)

6. [ ] Dashboard do mentor (solicitacoes)
   - Lista de pendentes
   - Aceitar/Rejeitar
   - Atualizar status da Connection

### Deliverables
- Lista de mentores com busca e filtros
- Pagina de detalhes do mentor
- Solicitacao de mentoria funcionando
- Mentor consegue aceitar/recusar

### Prompt para Claude Code
```
Execute a Sprint 4: crie a pagina Match com grid de mentores, 
sistema de busca com debounce e filtros por habilidade/disponibilidade. 
Crie a tela de detalhes do mentor e o sistema de solicitacao que cria 
uma Connection PENDING. Crie a area do mentor para ver e aceitar/recusar 
solicitacoes com notificacao por email.
```

---

## Sprint 5: Limite de Mentorados, Waitlist e WhatsApp

**Objetivo**: Regra dos 4 mentorados, lista de espera e integracao WhatsApp.

**Duracao estimada**: 1-2 sessoes

### Tarefas

1. [ ] Enforce limite de 4 mentorados
   - Verificar count de conexoes ACTIVE antes de aceitar
   - Mostrar "Lotado" no card se cheio
   - Toast de erro se tentar aceitar 5o

2. [ ] Lista de espera automatica
   - 5a solicitacao vai para WaitlistEntry
   - Position auto-incremental por mentor
   - Fila visivel na area "Processo"

3. [ ] Gerenciamento de fila (mentor)
   - Visualizar fila
   - Reordenar (drag-and-drop)
   - Remover da fila
   - Promover quando vaga liberada

4. [ ] Promocao automatica
   - Quando conexao encerra, verificar fila
   - Promover primeiro da fila
   - Notificar mentee promovido

5. [ ] Integracao WhatsApp
   - Botao "Falar no WhatsApp" (sombra/match aceito)
   - Link wa.me/[numero] com mensagem pre-preenchida
   - Mostrar numero so apos match aceito

6. [ ] Encerramento de conexao
   - Mentor ou mentee pode encerrar
   - Motivo opcional
   - Status muda para COMPLETED ou CANCELLED

### Deliverables
- Limite de 4 mentorados funcionando
- Lista de espera automatica
- Mentor consegue gerenciar fila
- Promocao automatica ao liberar vaga
- Botao WhatsApp funcionando
- Encerramento de conexao

### Prompt para Claude Code
```
Execute a Sprint 5: implemente a regra de maximo 4 mentorados por mentor 
com validacao no aceite. Crie a lista de espera automatica quando o 
limite e atingido, com gerenciamento visual para o mentor 
(reordenar/remover). Implemente promocao automatica quando vaga libera. 
Crie o botao "Falar no WhatsApp" que so aparece apos match aceito 
usando wa.me. Crie funcionalidade de encerrar conexao.
```

---

## Sprint 6: Notificacoes

**Objetivo**: Sistema completo de notificacoes (email, in-app, push).

**Duracao estimada**: 1-2 sessoes

### Tarefas

1. [ ] Configurar Resend
   - Conta e API key
   - Templates de email base

2. [ ] Notificacoes por email
   - Template: nova solicitacao
   - Template: solicitacao aceita
   - Template: promovido da fila
   - Template: convite recebido

3. [ ] Notificacoes in-app
   - Tabela Notification
   - Badge de contador no header
   - Dropdown de notificacoes
   - Marcar como lida

4. [ ] Service worker para PWA push
   - Configurar web push
   - Subscription do usuario
   - Enviar push quando evento ocorre

5. [ ] Central de notificacoes
   - Pagina dedicada
   - Filtro por tipo
   - Marcar todas como lidas

### Deliverables
- Emails sendo enviados via Resend
- Notificacoes in-app com badge e dropdown
- Push notifications no PWA
- Central de notificacoes

### Prompt para Claude Code
```
Execute a Sprint 6: configure Resend para envio de emails. Crie templates 
de email para: nova solicitacao, aceite, promocao da fila e convite. 
Implemente notificacoes in-app com badge, dropdown e pagina dedicada. 
Configure o service worker para push notifications no PWA.
```

---

## Sprint 7: Biblioteca e Processo

**Objetivo**: Tela de materiais e acompanhamento de conexoes.

**Duracao estimada**: 1-2 sessoes

### Tarefas

1. [ ] Pagina Processo (minhas conexoes)
   - Sub-abas: Ativas | Pendentes | Historico
   - Lista de conexoes com avatar e status
   - Botao WhatsApp para ativas

2. [ ] Upload de materiais (Admin)
   - Formulario: titulo, descricao, categoria
   - Upload de arquivo (Vercel Blob)
   - Limite por plano

3. [ ] Pagina Biblioteca
   - Lista de materiais da empresa
   - Filtro por categoria
   - Download de arquivo
   - Icone por tipo de arquivo

4. [ ] Navegacao por abas (bottom tabs)
   - Match | Processo | Biblioteca
   - State persistente

### Deliverables
- Pagina de conexoes com sub-abas
- Upload de materiais funcionando
- Biblioteca com download
- Bottom navigation funcionando

### Prompt para Claude Code
```
Execute a Sprint 7: crie a pagina Processo com sub-abas 
(Ativas/Pendentes/Historico) mostrando conexoes do usuario. 
Crie o sistema de upload de materiais para biblioteca via Vercel Blob 
com limite por plano. Crie a pagina Biblioteca com lista, filtro e 
download. Implemente a navegacao por abas inferiores 
(Match/Processo/Biblioteca).
```

---

## Sprint 8: Admin Dashboard

**Objetivo**: Painel administrativo completo.

**Duracao estimada**: 2 sessoes

### Tarefas

1. [ ] Layout admin
   - Sidebar com navegacao
   - Header com tenant info
   - Protecao de rotas (role admin)

2. [ ] Dashboard
   - Cards de metricas (usuarios, conexoes)
   - Grafico de conexoes por mes
   - Usuarios recentes

3. [ ] Gerenciamento de usuarios
   - Lista com filtros (papel, status)
   - Aprovar/rejeitar
   - Desativar usuario
   - Ver perfil

4. [ ] Configuracoes da empresa
   - Nome, slug
   - Upload de logo
   - Color pickers (primary/secondary)
   - Preview ao vivo

5. [ ] Gerenciar biblioteca
   - Listar materiais
   - Remover material
   - Ver estatisticas de download

6. [ ] Relatorios
   - Tabela de conexoes
   - Mentores mais populares
   - Habilidades mais demandadas
   - Exportar CSV

### Deliverables
- Layout admin com sidebar
- Dashboard com metricas
- CRUD de usuarios
- Configuracoes de branding
- Gerenciamento de biblioteca
- Relatorios exportaveis

### Prompt para Claude Code
```
Execute a Sprint 8: crie o layout admin com sidebar protegido por role. 
Crie o dashboard com cards de metricas e graficos. Implemente CRUD de 
usuarios com aprovacao/desativacao. Crie pagina de configuracoes com 
upload de logo e color pickers. Crie gerenciamento de biblioteca e 
relatorios com exportacao CSV.
```

---

## Sprint 9: PWA e Deploy

**Objetivo**: Configurar PWA e fazer deploy na Vercel.

**Duracao estimada**: 1 sessao

### Tarefas

1. [ ] Configurar next-pwa
   - Manifest.json
   - Service worker
   - Icones em multiplas resolucoes

2. [ ] Otimizacoes
   - Lazy loading de componentes
   - Otimizacao de imagens
   - Cache de dados

3. [ ] Testes de build
   - `npm run build` sem erros
   - Type checking
   - ESLint passando

4. [ ] Deploy na Vercel
   - Criar projeto
   - Configurar variaveis de ambiente
   - Conectar banco Postgres
   - Conectar Blob storage
   - Rodar migrate em producao

5. [ ] Testes pos-deploy
   - Registro de usuario
   - Login
   - Perfil
   - Match
   - WhatsApp
   - Admin

### Deliverables
- PWA instalavel
- App rodando na Vercel
- Build sem erros
- Funcionalidades core testadas

### Prompt para Claude Code
```
Execute a Sprint 9: configure next-pwa com manifest.json, service worker 
e icones. Faca otimizacoes de performance. Garanta que `npm run build` 
passe sem erros. Faca deploy na Vercel configurando todas as variaveis 
de ambiente, banco Postgres e Blob storage. Teste as funcionalidades 
core apos o deploy.
```

---

## Resumo do Cronograma

| Sprint | Foco | Tarefas | Est. Sessoes |
|--------|------|---------|-------------|
| 0 | Documentacao | 11 | 1 (concluido) |
| 1 | Scaffolding | 8 | 1 |
| 2 | Auth + Tenancy | 6 | 1-2 |
| 3 | Onboarding + Perfil | 5 | 1-2 |
| 4 | Match + Diretorio | 6 | 2 |
| 5 | Limite + Waitlist + WhatsApp | 6 | 1-2 |
| 6 | Notificacoes | 5 | 1-2 |
| 7 | Biblioteca + Processo | 4 | 1-2 |
| 8 | Admin Dashboard | 6 | 2 |
| 9 | PWA + Deploy | 5 | 1 |
| **Total** | | **52** | **12-16 sessoes** |

---

## Proxima Sprint

**Sprint 1** esta pronta para iniciar. Use o prompt abaixo:

```
Execute a Sprint 1 completa do MentorMatch:

1. Crie o projeto Next.js 15 com shadcn/ui (base slate)
2. Instale todas as dependencias do package.json
3. Instale os componentes shadcn necessarios
4. Configure o Prisma com o schema completo do arquivo database.md
5. Crie .env.local com as variaveis do .env.example
6. Rode npx prisma migrate dev --name init
7. Crie o seed script com planos, skills e tenant demo
8. Crie o singleton Prisma client em lib/prisma.ts
9. Crie a estrutura de pastas conforme .clauderules
10. Teste npm run dev para garantir que roda

Siga rigorosamente o schema do database.md e a estrutura do .clauderules.
```
