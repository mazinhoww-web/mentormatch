# MentorMatch

Plataforma white-label, multitenant, de mentoria empresarial. Empresas usam a plataforma para criar seus próprios programas internos de mentoria.

## Stack Tecnológica

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript (strict mode)
- **Estilização:** Tailwind CSS + shadcn/ui
- **Banco de Dados:** PostgreSQL (Vercel Postgres) + Prisma ORM
- **Autenticação:** NextAuth.js v5 (credentials + magic link)
- **Armazenamento:** Vercel Blob
- **E-mail:** Resend
- **Formulários:** React Hook Form + Zod
- **Ícones:** Lucide React

## Funcionalidades (MVP)

### Autenticação e Onboarding
- Login com email/senha
- Cadastro de novos usuários
- Recuperação e redefinição de senha
- Seleção de perfil (Mentor/Mentorado)
- Formulário de onboarding personalizado por perfil

### Mentores
- Dashboard com métricas (mentorados ativos, solicitações, vagas)
- Lista de mentorados ativos com contato via WhatsApp
- Gestão de solicitações (aceitar/rejeitar)
- Perfil editável com habilidades, bio, formação

### Mentorados
- Dashboard com informações do mentor atual
- Busca de mentores por habilidades
- Envio de solicitação de mentoria com mensagem
- Fila de espera quando mentor está lotado (4 vagas)

### Busca e Matching
- Lista de mentores aprovados com filtros
- Perfil detalhado do mentor
- Sistema de conexão com limite de 4 mentorados/mentor
- Fila de espera automática (waitlist)

### Administração
- Aprovação/rejeição de novos usuários
- Gestão de habilidades (global e por tenant)
- Gestão da biblioteca de materiais
- Relatórios com métricas do programa
- Configurações de branding do tenant

### Biblioteca
- Upload e listagem de materiais
- Visualização de PDF inline
- Download de arquivos
- Filtro por tipo (PDF, Vídeo, Artigo)

### Notificações
- Centro de notificações in-app
- Notificações por e-mail (Resend)
- Agrupamento por data (Hoje, Ontem, Anteriores)
- Marcar como lida (individual e em massa)

### Billing (Estrutura)
- Modelo de planos (Free, Starter, Professional, Enterprise)
- Plano Free ativo por padrão no MVP
- Tabelas de Subscription, Invoice e Usage prontas

## Multitenancy

A arquitetura é path-based: `/t/[tenant-slug]/...`. Cada tenant tem:
- Branding personalizado (nome, logo, cor)
- Usuários, habilidades e biblioteca independentes
- Plano de assinatura próprio

## Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/           # Páginas de autenticação
│   ├── api/              # API routes
│   ├── t/[slug]/         # Rotas do tenant
│   │   ├── (dashboard)/  # Dashboard do mentor/mentorado
│   │   └── admin/        # Painel administrativo
│   ├── layout.tsx
│   ├── page.tsx          # Landing page
│   └── not-found.tsx     # Página 404
├── components/
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Sidebar, DashboardLayout, AuthLayout
│   └── providers.tsx     # SessionProvider
├── hooks/                # Custom hooks
├── lib/                  # Utilitários, auth, db, email, validações
└── types/                # TypeScript declarations
prisma/
├── schema.prisma         # Schema do banco de dados
└── seed.ts               # Dados iniciais
```

## Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Banco de Dados

```bash
npx prisma db push
npm run db:seed
```

### 4. Iniciar Desenvolvimento

```bash
npm run dev
```

### Credenciais do Seed

- **Admin:** admin@mentormatch.com / admin123
- **Tenant:** default (slug)

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar em produção |
| `npm run lint` | Verificar linting |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:push` | Aplicar schema no banco |
| `npm run db:seed` | Popular dados iniciais |
| `npm run db:studio` | Prisma Studio (GUI) |

## Decisões Técnicas

1. **Prisma v6** escolhido por estabilidade e compatibilidade com Vercel Postgres (v7 requer adapter config mais complexo).
2. **Path-based multitenancy** (`/t/[slug]`) para simplicidade no MVP, com possibilidade de migrar para subdomain-based futuramente.
3. **Limite de 4 mentorados** por mentor com fila de espera automática.
4. **Contato via WhatsApp** em vez de chat interno, conforme especificação.
5. **Billing estruturado** desde o início com plano Free ativo, sem cobrança no MVP.
6. **PWA-ready** com manifest.json configurado.

## Próximos Passos

- [ ] Configurar notificações push (PWA)
- [ ] Implementar magic link authentication
- [ ] Adicionar testes automatizados (Jest + Testing Library)
- [ ] Implementar cobrança via Stripe (planos pagos)
- [ ] Adicionar suporte a subdomínios por tenant
- [ ] Implementar SSO para plano Enterprise
- [ ] Adicionar analytics e métricas avançadas
- [ ] Implementar sistema de convites por e-mail
- [ ] Otimizar performance com ISR/cache
