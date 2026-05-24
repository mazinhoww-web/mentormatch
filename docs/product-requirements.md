# MentorMatch - Product Requirements Document (PRD)

> White-label mentoring platform inspired by LATAM's Mentor Match.
> 100% free MVP with full SaaS billing architecture.

---

## 1. Visao Geral

### 1.1 Descricao
MentorMatch e uma plataforma web white-label de mentoria empresarial, multitenant e multiusuario. Empresas podem criar seus proprios programas de mentoria com identidade visual propria. Profissionais cadastram-se como mentores ou mentorados, encontram matches por habilidades e se conectam via WhatsApp.

### 1.2 Proposito
Replicar a experiencia do Mentor Match da LATAM Airlines de forma agnostica - qualquer empresa pode ter seu proprio programa de mentoria digital.

### 1.3 Publico-Alvo
- Empresas que querem implementar programas de mentoria interna
- Profissionais que querem mentorar ou ser mentorados
- Gestores de RH e desenvolvimento de pessoas

### 1.4 Diferenciais
- White-label: cada empresa com sua marca, cores e logo
- Agnostico: qualquer empresa de qualquer setor
- Simplicidade: sem chat interno, conexao direta via WhatsApp
- Habilidades compartilhadas: sistema global de tags com auto-aprendizado

---

## 2. Arquitetura de Negocio (SaaS)

### 2.1 Modelo de Precos (Futuro - Arquitetura Completa)

| Plano | Usuarios | Conexoes | Biblioteca | Preco |
|-------|---------|----------|------------|-------|
| Free | 50 | 100/mes | 10 arquivos | R$ 0 |
| Starter | 200 | 500/mes | 50 arquivos | R$ 299/mes |
| Pro | 1000 | ilimitado | 500 arquivos | R$ 799/mes |
| Enterprise | ilimitado | ilimitado | ilimitado | sob consulta |

### 2.2 Limites do Plano
- Maximo de usuarios ativos por tenant
- Maximo de conexoes ativas simultaneas
- Maximo de arquivos na biblioteca
- Maximo de administradores

### 2.3 Estado Atual
- Todos os tenants iniciam no plano **Free**
- Limites nao sao aplicados no MVP (modo ilimitado)
- Arquitetura de cobranca completa ja construida

---

## 3. Funcionalidades por Perfil

### 3.1 Super Admin (Platform Owner)
- CRUD completo de tenants (empresas)
- Gestao de planos e assinaturas
- Acesso a todos os dados de todas as empresas
- Dashboard global de metricas
- Configuracao de habilidades globais
- Gestao de usuarios em qualquer tenant
- Relatorios de uso e engajamento

### 3.2 Admin da Empresa (Company Admin)
- Configurar branding da empresa (logo, cores, nome)
- Aprovar ou desativar usuarios
- Enviar convites por email
- Upload de materiais para biblioteca
- Visualizar relatorios de conexoes
- Gerenciar configuracoes da empresa
- Exportar dados da empresa

### 3.3 Mentor
- Criar/editar perfil completo com foto
- Selecionar habilidades que ensina
- Definir formacao profissional
- Receber e aceitar/rejeitar solicitacoes de mentoria
- Ter no maximo **4 mentorados ativos**
- Gerenciar lista de espera (reordenar, remover)
- Acessar biblioteca de materiais
- Ver dados de contato dos mentorados (WhatsApp)

### 3.4 Mentee (Mentorado)
- Criar/editar perfil completo com foto
- Selecionar habilidades que quer aprender
- Definir formacao profissional
- Buscar e filtrar mentores por habilidades
- Enviar solicitacao de mentoria
- Acompanhar status das solicitacoes
- Acessar biblioteca de materiais
- Ver dados de contato dos mentores (WhatsApp)

---

## 4. Funcionalidades Detalhadas

### 4.1 Onboarding e Selecao de Perfil

```
Tela Inicial → "Bem-vindo ao MentorMatch"
  → Botao "Mentor" (cor primaria)
  → Botao "Mentee" (cor secundaria)
  → Selecao define o fluxo de perfil
```

**Fluxo Mentor:**
1. Selecao "Mentor"
2. Cadastro/Login (se nao autenticado)
3. Formulario de perfil:
   - Foto de perfil (upload opcional)
   - Nome completo
   - Bio / Sobre mim
   - Formacao profissional (Graduacao, Mestrado, Doutorado, Pos-graduacao, Tecnico)
   - Habilidades que ensina (tags selecionaveis + opcao "Outro")
   - Area de atuacao
   - Cargo atual
   - Idiomas
   - Numero WhatsApp
4. Salvar → Dashboard

**Fluxo Mentee:**
1. Selecao "Mentee"
2. Cadastro/Login (se nao autenticado)
3. Formulario de perfil:
   - Foto de perfil (upload opcional)
   - Nome completo
   - Bio / Sobre mim
   - Formacao profissional
   - Habilidades que quer aprender (tags + "Outro")
   - Area de interesse
   - Cargo atual
   - Idiomas
   - Numero WhatsApp
4. Salvar → Dashboard

### 4.2 Sistema de Habilidades (Skills)

**Lista Padrao Inicial:**
- Analise de Dados
- Inteligencia Artificial
- Design de Produto
- Design de Interface (UI/UX)
- Lideranca e Gestao
- Marketing Digital
- Comunicacao e Oratoria
- Financas Pessoais
- Empreendedorismo
- Carreira e Desenvolvimento Profissional
- Gestao de Projetos
- Gestao de Equipes
- Vendas e Negociacao
- Programacao e Desenvolvimento
- Redacao e Conteudos
- Logistica e Operacoes
- Recursos Humanos
- Inovacao e Transformacao Digital
- Resiliencia e Bem-estar
- Sustentabilidade

**Fluxo "Outro":**
1. Usuario digita nova habilidade
2. Sistema salva no banco global
3. Nova habilidade aparece para todos os usuarios
4. Ordenacao por popularidade (mais selecionadas primeiro)

**UI:**
- Tags/badges clicaveis com estilo outline
- Tags selecionadas ficam preenchidas (filled)
- Scroll horizontal ou grid de selecao
- Campo de busca para filtrar habilidades existentes
- Botao "+ Outro" abre input para adicionar nova

### 4.3 Diretorio de Mentores (Match)

**Tela Principal - Lista de Mentores:**
```
[Header: Logo da Empresa]
[Abas: Match | Processo | Biblioteca]
[Barra de busca com icone de lupa]
[Botao "Filtro"]
[Grid de cards de mentores 2 colunas]
```

**Card do Mentor:**
```
[Foto circular]
[Nome]
[Cargo | Area]
[Tags de habilidades (max 3 visiveis)]
[Indicador de vagas disponiveis (X/4)]
[Status: Disponivel / Lotado]
```

**Filtros:**
- Por habilidade
- Por area de atuacao
- Por formacao
- Por disponibilidade (tem vaga ou nao)

**Acao de Conectar:**
1. Mentee clica em mentor
2. Modal com detalhes do mentor
3. Botao "Solicitar Mentoria"
4. Opcional: campo para mensagem personalizada
5. Envio da solicitacao

### 4.4 Solicitacoes e Aceite

**Para o Mentor:**
```
[Notificacao: push + email + badge no app]
[Area "Solicitacoes" no dashboard]
[Lista de pendentes com perfil do solicitante]
[Botao: Aceitar | Recusar]
```

**Regra do Limite:**
- Maximo 4 conexoes ativas simultaneas
- Ao aceitar 4a, mentor aparece como "Lotado"
- 5a solicitacao vai automaticamente para lista de espera
- Mentor pode reordenar ou remover da lista de espera

**Lista de Espera:**
```
[Fila visual com posicoes]
[Drag-and-drop para reordenar]
[Botao para promover (quando vaga liberada)]
[Botao para remover da fila]
```

### 4.5 Notificacoes

**Canais:**
1. **Push (PWA)**: quando mentor recebe solicitacao
2. **Email**: resumo diario de atividades + notificacoes importantes
3. **In-app**: badge de contador + lista de notificacoes

**Eventos que geram notificacao:**
- Nova solicitacao de mentoria (mentor)
- Solicitacao aceita (mentee)
- Solicitacao recusada (mentee)
- Vaga liberada - voce foi promovido da lista de espera (mentee)
- Novo material na biblioteca (todos)
- Convite recebido (usuario)

### 4.6 Contato via WhatsApp

**Sem chat interno.** Apos match aceito:

```
[Perfil do mentor/mentee]
[Botao "Falar no WhatsApp"]
→ Redireciona para https://wa.me/[numero]
```

**Regra:**
- Botao so aparece apos match aceito (status ACTIVE)
- Numero do WhatsApp e lido do perfil do usuario
- Abre WhatsApp web ou app nativo

### 4.7 Biblioteca de Materiais

**Abas do App:**
```
[Match] [Processo] [Biblioteca]
```

**Tela Biblioteca:**
```
[Lista de materiais]
[Cada item: Titulo, Descricao, Tipo (PDF/DOC/Video), Data]
[Download ao clicar]
```

**Gestao (Admin):**
- Upload de arquivos (PDF, DOC, DOCX, MP4)
- Titulo e descricao
- Categoria
- Limite por plano

### 4.8 Navegacao (Bottom Tabs)

```
[Match] [Processo] [Biblioteca]
[icone] [icone]  [icone]
```

- **Match**: Diretorio de mentores (mentee) ou solicitacoes (mentor)
- **Processo**: Minhas conexoes ativas e historico
- **Biblioteca**: Materiais disponiveis

### 4.9 Convites

**Fluxo de Convite (Admin):**
1. Admin acessa "Gerenciar Usuarios"
2. Clica "Convidar"
3. Preenche email e seleciona papel (mentor/mentee)
4. Sistema envia email com link de cadastro
5. Usuario clica link, cria conta e ja entra no tenant correto

### 4.10 Relatorios (Admin)

**Dashboard Admin:**
- Total de usuarios (por papel)
- Total de conexoes ativas
- Taxa de aceite de mentorias
- Mentores mais solicitados
- Habilidades mais demandadas
- Usuarios mais engajados
- Downloads da biblioteca

---

## 5. Requisitos Nao-Funcionais

### 5.1 Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Imagens otimizadas (Next.js Image)
- Lazy loading de listas

### 5.2 Seguranca
- Autenticacao segura (NextAuth.js)
- Dados isolados por tenant (RLS)
- Uploads validados (tipo e tamanho)
- Rate limiting em APIs
- HTTPS obrigatorio

### 5.3 Escalabilidade
- Arquitetura serverless (Vercel)
- Banco gerenciado (Vercel Postgres)
- Uploads em blob storage (Vercel Blob)
- Cache com revalidacao

### 5.4 Acessibilidade
- Contraste adequado
- Navegacao por teclado
- Labels em formularios
- Textos alternativos em imagens

### 5.5 PWA
- Manifest.json configurado
- Service worker para cache
- Icones em multiplas resolucoes
- Suporte a modo offline basico
- Push notifications

---

## 6. Fluxos de Usuario

### 6.1 Fluxo Principal - Mentee encontra Mentor

```
[Entra no app da empresa]
  → Seleciona "Mentee" (se primeiro acesso)
  → Cria/Edita perfil com habilidades desejadas
  → Ve lista de mentores compatíveis
  → Aplica filtros de habilidade
  → Clica em mentor para ver detalhes
  → Clica "Solicitar Mentoria"
  → Aguarda aceite
  → Rebe notificacao de aceite
  → Acessa "Processo" para ver mentor
  → Clica "Falar no WhatsApp"
  → Conversa continua no WhatsApp
```

### 6.2 Fluxo Principal - Mentor aceita Mentee

```
[Entra no app da empresa]
  → Seleciona "Mentor" (se primeiro acesso)
  → Cria/Edita perfil com habilidades que ensina
  → Recebe notificacao de solicitacao
  → Visualiza perfil do solicitante
  → Clica "Aceitar" (se tem vaga)
  → Mentee vai para "Processo"
  → Quando 4 atingido, status muda para "Lotado"
  → Novas solicitacoes vao para lista de espera
```

### 6.3 Fluxo - Lista de Espera

```
[Mentor com 4 mentorados]
  → 5a solicitacao chega
  → Vai automaticamente para lista de espera
  → Mentor ve fila na area "Processo"
  → Quando mentorado encerra ou eh removido:
    → Mentor promove da lista de espera
    → Ou sistema promove automaticamente (se configurado)
  → Mentorado notificado por push/email
```

### 6.4 Fluxo - Administracao

```
[Admin acessa painel]
  → Ve usuarios pendentes de aprovacao
  → Aprova ou rejeita
  → Configura branding (logo, cores)
  → Uploada materiais na biblioteca
  → Envia convites por email
  → Visualiza relatorios de conexoes
```

---

## 7. Telas do Sistema

| # | Tela | Tipo | Perfil |
|---|------|------|--------|
| 1 | Bem-vindo / Selecao de Perfil | Publica | Todos |
| 2 | Login | Publica | Todos |
| 3 | Cadastro | Publica | Todos |
| 4 | Completar Perfil | Autenticada | Todos |
| 5 | Dashboard (Match) | Autenticada | Todos |
| 6 | Detalhes do Mentor | Autenticada | Mentee |
| 7 | Minhas Conexoes (Processo) | Autenticada | Todos |
| 8 | Biblioteca | Autenticada | Todos |
| 9 | Minha Conta / Perfil | Autenticada | Todos |
| 10 | Painel Admin | Admin | Admin/SuperAdmin |
| 11 | Gerenciar Usuarios | Admin | Admin/SuperAdmin |
| 12 | Configuracoes da Empresa | Admin | Admin/SuperAdmin |
| 13 | Relatorios | Admin | Admin/SuperAdmin |
| 14 | Gerenciar Biblioteca | Admin | Admin/SuperAdmin |
| 15 | Lista de Espera | Autenticada | Mentor |
| 16 | Notificacoes | Autenticada | Todos |

---

## 8. Dicionario de Dados

### 8.1 Tenant
| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador unico |
| name | String | Sim | Nome da empresa |
| slug | String | Sim | URL-friendly name |
| logo | String | Nao | URL do logo |
| primaryColor | String | Nao | Cor primaria (hex) |
| secondaryColor | String | Nao | Cor secundaria (hex) |
| isActive | Boolean | Sim | Se o tenant esta ativo |
| planId | UUID | Sim | Plano atual |
| maxUsers | Int | Sim | Limite de usuarios |
| createdAt | DateTime | Sim | Data de criacao |
| updatedAt | DateTime | Sim | Data de atualizacao |

### 8.2 User
| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador unico |
| email | String | Sim | Email do usuario |
| name | String | Sim | Nome completo |
| password | String | Sim | Hash da senha |
| image | String | Nao | URL da foto |
| role | Enum | Sim | SUPER_ADMIN/ADMIN/MENTOR/MENTEE |
| type | Enum | Sim | MENTOR/MENTEE |
| tenantId | UUID | Sim | Empresa vinculada |
| isApproved | Boolean | Sim | Aprovado pelo admin |
| bio | String | Nao | Biografia |
| formation | Enum | Nao | Formacao academica |
| position | String | Nao | Cargo atual |
| department | String | Nao | Area/departamento |
| whatsappNumber | String | Nao | Numero WhatsApp |
| languages | String[] | Nao | Idiomas |
| createdAt | DateTime | Sim | Data de criacao |
| updatedAt | DateTime | Sim | Data de atualizacao |

### 8.3 Connection
| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| id | UUID | Sim | Identificador unico |
| mentorId | UUID | Sim | ID do mentor |
| menteeId | UUID | Sim | ID do mentorado |
| tenantId | UUID | Sim | Empresa |
| status | Enum | Sim | PENDING/ACTIVE/COMPLETED/CANCELLED |
| message | String | Nao | Mensagem do mentee |
| startedAt | DateTime | Nao | Data de inicio |
| endedAt | DateTime | Nao | Data de termino |
| createdAt | DateTime | Sim | Data de criacao |

---

## 9. Critérios de Aceite

- [ ] Usuario consegue se cadastrar e fazer login
- [ ] Usuario consegue selecionar perfil Mentor ou Mentee
- [ ] Usuario consegue completar perfil com foto e habilidades
- [ ] Sistema de habilidades com "Outro" que adiciona globalmente
- [ ] Mentee consegue buscar e filtrar mentores
- [ ] Mentee consegue enviar solicitacao de mentoria
- [ ] Mentor recebe notificacao de solicitacao
- [ ] Mentor consegue aceitar ou recusar
- [ ] Limite de 4 mentorados por mentor funciona
- [ ] Lista de espera funciona automaticamente
- [ ] Botao WhatsApp aparece so apos match aceito
- [ ] Biblioteca de materiais disponivel para download
- [ ] Admin consegue aprovar usuarios
- [ ] Admin consegue configurar branding
- [ ] Admin consegue enviar convites
- [ ] Admin consegue ver relatorios
- [ ] PWA funciona com push notification
- [ ] Multi-tenancy isola dados corretamente
- [ ] Notificacoes por email funcionam
- [ ] Push notifications funcionam no PWA

---

## 10. Glossario

| Termo | Definicao |
|-------|-----------|
| Tenant | Empresa cadastrada na plataforma |
| Match | Conexao entre mentor e mentorado |
| Skill | Habilidade/ competencia ensinavel |
| Waitlist | Lista de espera de mentorados |
| White-label | Personalizavel com marca da empresa |
| PWA | Progressive Web App |
| Magic Link | Login sem senha via link de email |
| RLS | Row Level Security (isolamento de dados) |
