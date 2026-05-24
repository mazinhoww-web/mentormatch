# MentorMatch - Database Schema

> Schema completo do Prisma para Vercel Postgres.
> Este arquivo documenta todas as tabelas, relacionamentos e regras.

---

## Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

// ============================================
// TENANT (Empresa)
// ============================================
model Tenant {
  id             String   @id @default(uuid())
  name           String
  slug           String   @unique
  description    String?
  logo           String?
  primaryColor   String   @default("#1e293b")
  secondaryColor String   @default("#e11d48")
  
  // Status
  isActive       Boolean  @default(true)
  
  // Billing
  planId         String?
  plan           Plan?    @relation(fields: [planId], references: [id])
  maxUsers       Int      @default(50)
  maxConnections Int      @default(100)
  maxLibraryItems Int     @default(10)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  users          User[]
  connections    Connection[]
  libraryItems   LibraryItem[]
  invitations    Invitation[]
  subscriptions  Subscription[]
  
  @@map("tenants")
}

// ============================================
// PLAN (Planos SaaS)
// ============================================
model Plan {
  id             String   @id @default(uuid())
  name           String   // Free, Starter, Pro, Enterprise
  slug           String   @unique
  description    String?
  priceMonthly   Decimal  @default(0)
  priceYearly    Decimal  @default(0)
  maxUsers       Int      @default(50)
  maxConnections Int      @default(100)
  maxLibraryItems Int     @default(10)
  maxAdmins      Int      @default(2)
  features       String[] // Lista de feature flags
  isActive       Boolean  @default(true)
  
  // Timestamps
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relations
  tenants        Tenant[]
  subscriptions  Subscription[]
  
  @@map("plans")
}

// ============================================
// SUBSCRIPTION (Assinatura)
// ============================================
model Subscription {
  id              String    @id @default(uuid())
  tenantId        String
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  planId          String
  plan            Plan      @relation(fields: [planId], references: [id])
  
  // Billing status
  status          String    @default("active") // active, cancelled, past_due
  currentPeriodStart DateTime @default(now())
  currentPeriodEnd   DateTime @default(now())
  
  // Payment provider data (future: Stripe)
  paymentProvider     String?
  paymentProviderId   String?
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("subscriptions")
}

// ============================================
// USER (Usuario)
// ============================================
model User {
  id              String    @id @default(uuid())
  email           String
  name            String
  password        String    // bcrypt hash
  image           String?   // URL da foto
  
  // Role and type
  role            UserRole  @default(MENTEE)
  type            UserType  @default(MENTEE)
  
  // Tenant
  tenantId        String
  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Approval
  isApproved      Boolean   @default(true)
  approvedById    String?
  approvedAt      DateTime?
  
  // Profile
  bio             String?
  formation       Formation?
  position        String?
  department      String?
  whatsappNumber  String?
  languages       String[]
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  skills          UserSkill[]
  mentorConnections Connection[] @relation("MentorConnections")
  menteeConnections Connection[] @relation("MenteeConnections")
  waitlistEntries  WaitlistEntry[] @relation("WaitlistMentor")
  waitlistRequests WaitlistEntry[] @relation("WaitlistMentee")
  libraryItems    LibraryItem[] @relation("UploadedBy")
  invitationsSent Invitation[] @relation("InvitedBy")
  notifications   Notification[]
  
  // Unique email per tenant
  @@unique([email, tenantId])
  @@map("users")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  MENTOR
  MENTEE
}

enum UserType {
  MENTOR
  MENTEE
}

enum Formation {
  GRADUACAO
  MESTRADO
  DOUTORADO
  POS_GRADUACAO
  TECNICO
  OUTRO
}

// ============================================
// SKILL (Habilidade)
// ============================================
model Skill {
  id          String   @id @default(uuid())
  name        String   @unique
  category    String?  // Categoria opcional
  usageCount  Int      @default(0)
  isActive    Boolean  @default(true)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  users       UserSkill[]
  
  @@map("skills")
}

// ============================================
// USER_SKILL (Relacao N:N)
// ============================================
model UserSkill {
  id          String @id @default(uuid())
  userId      String
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  skillId     String
  skill       Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)
  isTeaching  Boolean @default(true) // true = ensina, false = quer aprender
  
  @@unique([userId, skillId, isTeaching])
  @@map("user_skills")
}

// ============================================
// CONNECTION (Conexao Mentor-Mentee)
// ============================================
model Connection {
  id          String            @id @default(uuid())
  mentorId    String
  mentor      User              @relation("MentorConnections", fields: [mentorId], references: [id], onDelete: Cascade)
  menteeId    String
  mentee      User              @relation("MenteeConnections", fields: [menteeId], references: [id], onDelete: Cascade)
  tenantId    String
  tenant      Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Status
  status      ConnectionStatus  @default(PENDING)
  message     String?           // Mensagem do mentee ao solicitar
  
  // Dates
  startedAt   DateTime?
  endedAt     DateTime?
  endedReason String?           // completed, cancelled_by_mentor, cancelled_by_mentee
  
  // Timestamps
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  // Unique: um par mentor-mentee ativo por vez
  @@unique([mentorId, menteeId, status])
  @@map("connections")
}

enum ConnectionStatus {
  PENDING   // Aguardando aceite do mentor
  ACTIVE    // Mentoria em andamento
  COMPLETED // Finalizada com sucesso
  CANCELLED // Cancelada
  REJECTED  // Recusada pelo mentor
}

// ============================================
// WAITLIST_ENTRY (Lista de Espera)
// ============================================
model WaitlistEntry {
  id        String   @id @default(uuid())
  mentorId  String
  mentor    User     @relation("WaitlistMentor", fields: [mentorId], references: [id], onDelete: Cascade)
  menteeId  String
  mentee    User     @relation("WaitlistMentee", fields: [menteeId], references: [id], onDelete: Cascade)
  tenantId  String
  
  position  Int      // Posicao na fila (1 = primeiro)
  message   String?
  
  // Status
  status    WaitlistStatus @default(WAITING)
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([mentorId, menteeId])
  @@map("waitlist_entries")
}

enum WaitlistStatus {
  WAITING   // Aguardando vaga
  PROMOTED  // Foi promovido a conexao
  REMOVED   // Removido pelo mentor ou desistiu
  EXPIRED   // Expirou (tempo limite)
}

// ============================================
// LIBRARY_ITEM (Material da Biblioteca)
// ============================================
model LibraryItem {
  id          String   @id @default(uuid())
  title       String
  description String?
  fileUrl     String
  fileType    String   // pdf, doc, docx, mp4, etc
  fileSize    Int      // em bytes
  category    String?
  isPublic    Boolean  @default(true)
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  uploadedById String
  uploadedBy  User     @relation("UploadedBy", fields: [uploadedById], references: [id])
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("library_items")
}

// ============================================
// INVITATION (Convite)
// ============================================
model Invitation {
  id          String   @id @default(uuid())
  email       String
  role        UserRole @default(MENTEE)
  type        UserType @default(MENTEE)
  
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  invitedById String
  invitedBy   User     @relation("InvitedBy", fields: [invitedById], references: [id])
  
  token       String   @unique
  expiresAt   DateTime
  usedAt      DateTime?
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@unique([email, tenantId])
  @@map("invitations")
}

// ============================================
// NOTIFICATION (Notificacao)
// ============================================
model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        NotificationType
  title       String
  message     String?
  data        String?  // JSON string com dados extras
  
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  // Timestamps
  createdAt   DateTime @default(now())
  
  @@map("notifications")
}

enum NotificationType {
  MATCH_REQUEST       // Nova solicitacao de mentoria
  MATCH_ACCEPTED      // Solicitacao aceita
  MATCH_REJECTED      // Solicitacao recusada
  WAITLIST_PROMOTED   // Promovido da lista de espera
  NEW_LIBRARY_ITEM    // Novo material na biblioteca
  INVITATION_RECEIVED // Convite recebido
  USER_APPROVED       // Usuario aprovado
  USER_REJECTED       // Usuario rejeitado
  SYSTEM              // Notificacao do sistema
}

// ============================================
// ACCOUNT (NextAuth.js)
// ============================================
model Account {
  id                String  @id @default(cuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## Diagrama de Relacionamentos

```
Tenant ||--o{ User : has
Tenant ||--o{ Connection : has
Tenant ||--o{ LibraryItem : has
Tenant ||--o{ Invitation : has
Tenant ||--o{ Subscription : has
Tenant }o--|| Plan : subscribed_to
Plan ||--o{ Subscription : has
Plan ||--o{ Tenant : defaults_to

User }o--o{ Skill : has (via UserSkill)
User ||--o{ Connection : mentor_in ("MentorConnections")
User ||--o{ Connection : mentee_in ("MenteeConnections")
User ||--o{ WaitlistEntry : mentor_in ("WaitlistMentor")
User ||--o{ WaitlistEntry : mentee_in ("WaitlistMentee")
User ||--o{ LibraryItem : uploads
User ||--o{ Notification : receives
User ||--o{ Invitation : sends

Skill ||--o{ UserSkill : used_in
```

---

## Regras de Negocio no Banco

### 1. Unicidade
- `Tenant.slug` deve ser unico
- `User.email + User.tenantId` deve ser unico (email unico por empresa)
- `Connection.mentorId + Connection.menteeId + Connection.status` unico (um par nao pode ter 2 pendentes)
- `WaitlistEntry.mentorId + WaitlistEntry.menteeId` unico (um mentee so pode estar uma vez na fila)
- `Invitation.email + Invitation.tenantId` unico (um email so pode ter um convite ativo por empresa)

### 2. Cascata
- Deletar Tenant → deleta todos Users, Connections, LibraryItems, Invitations
- Deletar User → deleta Connections, WaitlistEntries, UserSkills, Notifications
- Deletar Skill → deleta UserSkills relacionadas

### 3. Constraints
- Um mentor so pode ter maximo 4 conexoes ACTIVE simultaneas
- Um usuario nao pode ser mentor e mentee na mesma conexao (mentorId !== menteeId)
- WaitlistEntry.position deve ser sequencial por mentor
- Subscription.currentPeriodEnd deve ser >= currentPeriodStart

### 4. Indices Recomendados
```sql
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_connections_mentor ON connections(mentor_id, status);
CREATE INDEX idx_connections_mentee ON connections(mentee_id);
CREATE INDEX idx_connections_tenant ON connections(tenant_id);
CREATE INDEX idx_skills_usage ON skills(usage_count DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_waitlist_mentor ON waitlist_entries(mentor_id, status);
```

---

## Seed Data (Dados Iniciais)

```sql
-- Planos
INSERT INTO plans (id, name, slug, description, price_monthly, price_yearly, max_users, max_connections, max_library_items, max_admins, features, is_active) VALUES
('plan_free', 'Free', 'free', 'Plano gratuito para comecar', 0, 0, 50, 100, 10, 2, ARRAY['basic_analytics','email_notifications'], true),
('plan_starter', 'Starter', 'starter', 'Para pequenas equipes', 299, 2990, 200, 500, 50, 5, ARRAY['basic_analytics','email_notifications','push_notifications','priority_support'], true),
('plan_pro', 'Pro', 'pro', 'Para empresas em crescimento', 799, 7990, 1000, 999999, 500, 10, ARRAY['advanced_analytics','email_notifications','push_notifications','priority_support','custom_branding','api_access'], true),
('plan_enterprise', 'Enterprise', 'enterprise', 'Para grandes organizacoes', 0, 0, 999999, 999999, 999999, 999999, ARRAY['all_features','dedicated_support','sla','custom_integrations'], true);

-- Skills iniciais
INSERT INTO skills (name, category, usage_count, is_active) VALUES
('Analise de Dados', 'Tecnologia', 0, true),
('Inteligencia Artificial', 'Tecnologia', 0, true),
('Design de Produto', 'Design', 0, true),
('Design de Interface (UI/UX)', 'Design', 0, true),
('Lideranca e Gestao', 'Gestao', 0, true),
('Marketing Digital', 'Marketing', 0, true),
('Comunicacao e Oratoria', 'Soft Skills', 0, true),
('Financas Pessoais', 'Financas', 0, true),
('Empreendedorismo', 'Negocios', 0, true),
('Carreira e Desenvolvimento Profissional', 'Carreira', 0, true),
('Gestao de Projetos', 'Gestao', 0, true),
('Gestao de Equipes', 'Gestao', 0, true),
('Vendas e Negociacao', 'Vendas', 0, true),
('Programacao e Desenvolvimento', 'Tecnologia', 0, true),
('Redacao e Conteudos', 'Comunicacao', 0, true),
('Logistica e Operacoes', 'Operacoes', 0, true),
('Recursos Humanos', 'RH', 0, true),
('Inovacao e Transformacao Digital', 'Inovacao', 0, true),
('Resiliencia e Bem-estar', 'Bem-estar', 0, true),
('Sustentabilidade', 'Sustentabilidade', 0, true);

-- Tenant de exemplo
INSERT INTO tenants (id, name, slug, primary_color, secondary_color, is_active, plan_id, max_users, max_connections, max_library_items) VALUES
('tenant_demo', 'Empresa Demo', 'demo', '#1e40af', '#e11d48', true, 'plan_free', 50, 100, 10);
```

---

## Migrations

Comandos para gerenciar o banco:

```bash
# Gerar migration apos alterar schema
npx prisma migrate dev --name [nome_descritivo]

# Aplicar migrations em producao
npx prisma migrate deploy

# Sincronizar schema sem migration (desenvolvimento)
npx prisma db push

# Abrir Prisma Studio
npx prisma studio

# Gerar cliente apos mudancas
npx prisma generate
```
