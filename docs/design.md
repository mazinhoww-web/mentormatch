# MentorMatch - Design System

> Especificacoes visuais e comportamentais da interface.

---

## 1. Principios de Design

- **Clareza**: Interface limpa, focada no conteudo
- **Simplicidade**: Menos e mais - remova o que nao essencial
- **Acessibilidade**: Contraste adequado, navegavel por teclado
- **Mobile-first**: Pensado para mobile, adaptado para desktop
- **Personalizavel**: Cores e logo adaptaveis por tenant

---

## 2. Paleta de Cores

### Cores Base (shadcn defaults)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

### Cores por Tenant (dinamicas)

Cada tenant define suas cores que sobrescrevem as variaveis CSS:

```css
/* Exemplo: Tenant "TechCorp" com azul e rosa */
[data-tenant="techcorp"] {
  --primary: 230 70% 30%;      /* Azul escuro */
  --primary-foreground: 0 0% 100%;
  --secondary: 340 80% 55%;    /* Rosa */
  --secondary-foreground: 0 0% 100%;
}
```

### Tela de Boas-vindas
- Background: cor primaria do tenant (solido ou gradiente)
- Card central: branco com bordas arredondadas
- Botoes: primaria (filled) e secundaria (outline)

### Cores de Estado
- Sucesso: `emerald-500` (#10b981)
- Erro: `red-500` (#ef4444)
- Alerta: `amber-500` (#f59e0b)
- Informacao: `blue-500` (#3b82f6)

---

## 3. Tipografia

### Fonte
- **Padrao**: Inter (Google Fonts) - variavel
- **Fallback**: system-ui, sans-serif

### Tamanhos
```
Titulo H1:     text-2xl  font-bold   (24px)
Titulo H2:     text-xl   font-semibold (20px)
Titulo H3:     text-lg   font-semibold (18px)
Corpo:         text-sm   font-normal (14px)
Pequeno:       text-xs   font-normal (12px)
Botao:         text-sm   font-medium (14px)
```

---

## 4. Espacamento

### Base: 4px (0.25rem)
```
Escala: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24
Em px:  4, 8, 12, 16, 24, 32, 48, 64, 80, 96
```

### Layout
- Padding horizontal padrao: `px-4` (16px)
- Padding vertical secoes: `py-6` (24px)
- Gap entre elementos: `gap-3` (12px)
- Max-width container: `max-w-7xl`

---

## 5. Componentes Visuais

### 5.1 Botao

```
Padrao (Primary):
  bg-primary text-primary-foreground
  rounded-md px-4 py-2.5
  font-medium text-sm
  hover: opacity-90
  disabled: opacity-50 cursor-not-allowed

Secundario:
  bg-secondary text-secondary-foreground
  border border-border
  hover: bg-secondary/80

Outline:
  bg-transparent border border-primary text-primary
  hover: bg-primary hover:text-primary-foreground

Ghost:
  bg-transparent
  hover: bg-accent

Icone:
  tamanho: h-10 w-10
  rounded-full
```

### 5.2 Card

```
Container:
  bg-card text-card-foreground
  rounded-xl border border-border
  shadow-sm
  p-4 (padding interno)
```

### 5.3 Input

```
Campo de texto:
  bg-background border border-input
  rounded-md px-3 py-2
  text-sm
  focus: ring-2 ring-ring ring-offset-2
  placeholder: text-muted-foreground
  disabled: opacity-50
```

### 5.4 Skill Tag

```
Nao selecionada:
  bg-transparent border border-border
  rounded-full px-3 py-1
  text-xs font-medium
  hover: border-primary hover:text-primary

Selecionada:
  bg-primary text-primary-foreground
  border border-primary
  rounded-full px-3 py-1
  text-xs font-medium
```

### 5.5 Bottom Navigation

```
Container:
  fixed bottom-0 left-0 right-0
  bg-background border-t border-border
  h-16 px-4
  flex items-center justify-around

Item ativo:
  text-primary font-medium
  icone preenchido

Item inativo:
  text-muted-foreground
  icone outline
```

### 5.6 Mentor Card

```
Container:
  bg-card rounded-xl border border-border
  p-4 flex flex-col items-center
  
Foto:
  w-20 h-20 rounded-full object-cover
  border-2 border-primary/20

Nome:
  text-sm font-semibold mt-3

Cargo:
  text-xs text-muted-foreground

Tags:
  flex flex-wrap gap-1 mt-2
  text-[10px]

Status:
  mt-2 text-xs
  Disponivel: text-emerald-500
  Lotado: text-red-500
```

### 5.7 Avatar

```
Tamanhos:
  sm:  w-8 h-8    (32px)
  md:  w-12 h-12  (48px)
  lg:  w-20 h-20  (80px)
  xl:  w-32 h-32  (128px)

Padrao:
  rounded-full object-cover
  fallback: iniciais do nome
  bg-primary/10 text-primary
```

### 5.8 Badge de Notificacao

```
Container:
  absolute -top-1 -right-1
  w-4 h-4 rounded-full
  bg-destructive text-destructive-foreground
  text-[10px] font-bold
  flex items-center justify-center
```

### 5.9 Modal

```
Overlay:
  fixed inset-0 bg-black/50 backdrop-blur-sm
  z-50

Content:
  bg-card rounded-xl shadow-lg
  max-w-lg w-full mx-4
  p-6
  animate-in fade-in zoom-in-95
```

### 5.10 Toast

```
Container:
  fixed bottom-20 left-4 right-4
  bg-card border border-border
  rounded-lg shadow-lg
  p-4 flex items-center gap-3
  
Sucesso: border-l-4 border-l-emerald-500
Erro: border-l-4 border-l-red-500
Info: border-l-4 border-l-blue-500
```

---

## 6. Telas - Especificacao Detalhada

### 6.1 Tela de Boas-vindas

```
[Background: primary color solid]
  [Logo da Empresa - centro topo]
  [Card branco centralizado]
    [Titulo: "Bem-vindo ao MentorMatch"]
    [Subtitulo: "Selecione o perfil que deseja"]
    [Botao Primary: "Mentor" - largura total]
    [Botao Outline: "Mentee" - largura total]
  [/Card]
```

**Comportamento:**
- Logo carregado dinamicamente por tenant
- Cores do background pela primaryColor do tenant
- Selecao redireciona para completar perfil (se novo) ou dashboard

### 6.2 Tela de Perfil (Completar)

```
[Header: "Bem-vindo" + subtitulo]
[Formulario scrollavel]
  [Secao: Foto]
    [Upload area - quadrado com icone de camera]
    [Texto: "Envie uma foto e video (Opcional)"]
  
  [Secao: Habilidades]
    [Label: "Quais assuntos voce gostaria de [ensinar/aprender]?"]
    [Grid de tags selecionaveis]
    [Input "+ Outro" para adicionar nova]
  
  [Secao: Formacao]
    [Label: "Qual e a sua formacao profissional?"]
    [Radio/Select: Graduacao, Mestrado, Doutorado, Pos-graduacao]
  
  [Secao: Bio]
    [Label: "Fale um pouco sobre voce"]
    [Textarea]
  
  [Secao: Dados]
    [Cargo, Departamento, Idiomas, WhatsApp]
  
  [Botao: "Salvar" - fixed bottom]
```

### 6.3 Tela Match (Lista de Mentores)

```
[Header com logo]
[Abas: Match | Processo | Biblioteca]
[Search bar com lupa]
[Botao filtro]
[Grid 2 colunas de Mentor Cards]
[Bottom Nav]
```

**Comportamento:**
- Pull-to-refresh
- Infinite scroll
- Filtro expande accordion com opcoes
- Card clicavel abre detalhes

### 6.4 Tela de Detalhes do Mentor

```
[Header com botao voltar]
[Perfil do Mentor]
  [Avatar grande]
  [Nome, Cargo, Area]
  [Bio completa]
  [Habilidades (todas)]
  [Formacao, Idiomas]
  [Botao "Solicitar Mentoria"]
```

### 6.5 Tela Processo (Minhas Conexoes)

```
[Abas: Match | Processo | Biblioteca]
[Sub-abas: Ativas | Pendentes | Historico]
[Lista de conexoes]
  [Avatar | Nome | Status | Botao WhatsApp]
```

**Para Mentor:**
- Area "Solicitacoes Pendentes" com aceitar/recusar
- Lista "Meus Mentorados" (max 4)
- Secao "Lista de Espera" com reordenacao

### 6.6 Tela Biblioteca

```
[Abas: Match | Processo | Biblioteca]
[Search bar]
[Lista de materiais]
  [Icone tipo arquivo | Titulo | Data]
  [Clique faz download]
```

### 6.7 Admin - Dashboard

```
[Sidebar com navegacao]
[Cards de metricas (4 colunas)]
  [Total Usuarios, Conexoes Ativas, Mentores, Mentorados]
[Grafico de conexoes por mes]
[Tabela de usuarios recentes]
```

### 6.8 Admin - Usuarios

```
[Header + botao "Convidar"]
[Tabela/Lista de usuarios]
  [Avatar | Nome | Email | Papel | Status | Acoes]
[Filtros por papel e status]
[Bulk actions]
```

### 6.9 Admin - Configuracoes

```
[Formulario da Empresa]
  [Nome da empresa]
  [Slug (readonly)]
  [Upload de logo]
  [Cor primaria (color picker)]
  [Cor secundaria (color picker)]
  [Limites do plano]
[Preview ao vivo das cores]
```

---

## 7. Animacoes e Transicoes

### Padrao
```css
/* Transicao suave em todos os elementos interativos */
* { transition: color 150ms, background-color 150ms, border-color 150ms; }

/* Hover em cards */
card:hover { transform: translateY(-2px); box-shadow: lg; }

/* Fade in de paginas */
page { animation: fadeIn 300ms ease-out; }

/* Slide up para modais */
modal { animation: slideUp 300ms ease-out; }

/* Skeleton loading */
skeleton { animation: pulse 2s infinite; }
```

### shadcn Animations
- `animate-in fade-in` para modais
- `animate-in slide-in-from-bottom` para sheets
- `animate-in zoom-in-95` para dropdowns

---

## 8. Responsividade

### Breakpoints
```
sm: 640px   - ajustes menores
md: 768px   - tablet (sidebar aparece)
lg: 1024px  - desktop (grid expande)
xl: 1280px  - telas grandes
```

### Comportamento
- Mobile: bottom nav, layout vertical, tela cheia
- Tablet: sidebar aparece em admin, grid 2-3 colunas
- Desktop: sidebar sempre visivel, grid 3-4 colunas, layout maximizado

---

## 9. Icones

### Biblioteca
- Usar `lucide-react` (padrao shadcn)
- Nunca usar emojis como icones funcionais

### Icones Principais
```
Match:          Users
Processo:       ClipboardList
Biblioteca:     BookOpen
Perfil:         User
Configuracoes:  Settings
Buscar:         Search
Filtro:         SlidersHorizontal
Notificacao:    Bell
WhatsApp:       MessageCircle
Upload:         Upload
Download:       Download
Aceitar:        Check
Recusar:        X
Espera:         Clock
Sair:           LogOut
```

---

## 10. Assets

### Logo Padrao
- SVG ou PNG transparente
- Tamanho recomendado: 200x60px
- Upload via admin painel
- Armazenado no Vercel Blob

### Favicon
- Gerado automaticamente a partir do logo
- Multi-tamanho: 16x16, 32x32, 180x180 (apple-touch)

### PWA Icons
- 192x192 e 512x512
- Fundo transparente ou cor primaria
