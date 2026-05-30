# MentorMatch — Manual de Aplicação do Design (Default + Tenant)

> Derivado do código: `src/styles/themes/{base,sicredi}.css`, `src/lib/theme-engine.ts`,
> `src/lib/theme-parser.ts`, `src/lib/theme-provisioner.ts`, `src/app/layout.tsx`, `docs/design.md`.
> Acompanha: `design-boards/design-board-default.png` e `design-boards/design-board-sicredi.png`.

---

## 1. Como o tema é aplicado (mecanismo)

```
Tenant.themeKey  ──►  classe "theme-{key}" no <body>  ──►  CSS variables  ──►  componentes
        ▲                         ▲
   cookie "mm-tenant"      app/layout.tsx (resolveTenant lê o cookie → consulta Tenant → aplica a classe)
```

1. A **landing branded** (`/sicredi`) seta o cookie `mm-tenant=<slug>` (1 dia, não-httpOnly) — `middleware.ts` / `app/actions/tenant.ts`.
2. O **root layout** (`app/layout.tsx`) lê o cookie, busca o `Tenant{themeKey,brandColor,...}` e renderiza `<body class="theme-{themeKey}">`.
3. Os arquivos `src/styles/themes/*.css` definem, por classe, o conjunto de **CSS custom properties** (tokens). Componentes consomem `var(--token)` — nunca cores hardcoded.
4. `resolveThemeClass(tenant)` (`theme-engine.ts`) = `theme-${themeKey ?? "dark"}`.

**Temas existentes hoje:** `theme-dark` (default) e `theme-sicredi`. Fallback sem cookie/tenant = `theme-dark` no engine (e `"light"` no `DEFAULT_TENANT` do layout — *inconsistência menor a alinhar*).

---

## 2. Tokens — Tema DEFAULT (`theme-dark`)

Tenant `default` ("MentorMatch Demo"). Visual: **escuro, índigo, cantos arredondados, sem sombra de card**. Fonte **Inter**.

| Token | Valor | Uso |
|---|---|---|
| `--bg-deep` | `#08080d` | fundo mais profundo / navbar |
| `--bg-base` | `#0d0d14` | fundo da página |
| `--bg-elevated` | `#13131e` | cards / superfícies |
| `--surface` | `rgba(255,255,255,.04)` | inputs / chips sutis |
| `--glass` | `rgba(255,255,255,.07)` | overlays |
| `--border` | `rgba(255,255,255,.07)` | bordas |
| `--accent` | `#4f46e5` | primário (botões/links) |
| `--accent-alt` | `#6366f1` | acento secundário/realces |
| `--accent-glow` | `rgba(79,70,229,.28)` | brilho/halo |
| `--green` / `--amber` / `--red` | `#10b981` / `#f59e0b` / `#ef4444` | sucesso / alerta / erro |
| `--text` / `--text-sub` / `--text-muted` | `#ededef` / `#9ca3af` / `#6b7280` | texto / secundário / terciário |
| `--font-display` / `--font-body` | `Inter` | títulos / corpo |
| `--radius-card` / `--radius-btn` / `--radius-chip` | `14px` / `10px` / `100px` | raios |
| `--shadow-md` | `0 8px 24px rgba(0,0,0,.4)` | sombra elevada |
| `--sidebar-bg` / `--navbar-bg` | `#0b0b11` / `rgba(8,8,13,.85)` | chrome |

---

## 3. Tokens — Tenant SICREDI (`theme-sicredi`)

Tenant `sicredi` ("MentorMatch Sicredi"). Visual: **claro, verde Sicredi, cantos retos (4px), sombra suave**. Fontes **Exo 2** (display) + **Nunito** (corpo). Títulos com `font-weight:300`.

| Token | Valor | Uso |
|---|---|---|
| `--bg-deep` / `--bg-base` / `--bg-elevated` | `#fafafa` / `#ffffff` / `#ffffff` | fundos |
| `--surface` / `--glass` | `#fafafa` / `#ffffff` | inputs / overlays |
| `--border` | `#cdd3cd` | bordas |
| `--primary` / `--accent` | `#33820d` | **verde Sicredi** (primário) |
| `--accent-alt` | `#26610a` | verde escuro |
| `--secondary` | `#d7e6c8` | secundária (chips/botão claro) |
| `--secondary-foreground` | `#26610a` | texto sobre secundária |
| `--green` / `--amber` / `--red`(destrutivo) | `#33820d` / `#e6a500` / `#aa003c` | estados |
| `--text` / `--text-sub` / `--text-muted` | `#323c32` / `#828a82` / `#5a645a` | texto |
| `--font-display` / `--font-body` | `Exo 2` / `Nunito` | títulos / corpo |
| `--radius-card` / `--radius-btn` / `--radius-chip` | `4px` / `8px` / `100px` | raios |
| `--shadow-card` / `--shadow-md` | `0 2px 4px #cdd3cd` / `0 3px 10px rgba(50,60,50,.1)` | sombras |

> O `sicredi.css` também sobrescreve os tokens **shadcn** (`--background`, `--primary`, `--ring`, `--sidebar-*`, etc.), garantindo que os componentes shadcn herdem a marca.

### Default × Sicredi (resumo visual)
| Eixo | Default (dark) | Sicredi |
|---|---|---|
| Luminância | escuro | claro |
| Cor primária | índigo `#4f46e5` | verde `#33820d` |
| Cantos de card | 14px (suave) | 4px (reto) |
| Sombra de card | nenhuma | sim (suave) |
| Tipografia | Inter | Exo 2 + Nunito (títulos 300) |
| Personalidade | tech/SaaS | institucional/cooperativa |

---

## 4. Como aplicar a um NOVO tenant branded

Pipeline já existente (`lib/theme-provisioner.ts` + `lib/theme-parser.ts`):

1. Escreva um **`design.md`** com a paleta no formato esperado pelo parser:
   ```md
   ## Color Palette
   - **Primary Green** `#33820D`
   - **Border Gray** `#CDD3CD`
   ## Typography
   - Display font: `Exo 2`
   - Body font: `Nunito`
   ```
   O parser extrai pares `**Nome** \`#hex\`` → token `nome-em-kebab`, e `Display/Body font` → `--font-display/--font-body`.
2. Chame `provisionTenant(tenantId, themeKey, mdContent)`:
   - `parseDesignMd` → tokens;
   - `tokensToCSS(themeKey, tokens)` → bloco `.theme-{key}{ --token: valor; }`;
   - publica o CSS no storage (Vercel Blob) e grava `Tenant.themeKey/themeCssUrl/tokens`.
3. Setar `Tenant.themeKey` faz o `<body>` receber `theme-{key}` automaticamente.
4. Garanta um `.theme-{key}` com o **conjunto completo** de tokens da §2/§3 (use `theme-sicredi` como gabarito — inclusive os tokens shadcn).

---

## 5. Regras de aplicação (uso dos tokens)

- **Nunca** use cor/raio/sombra literais em componente — sempre `var(--token)`. Isso é o que torna o produto white-label.
- **Botão primário:** `background:var(--accent); color:#fff; border-radius:var(--radius-btn)`.
- **Card/superfície:** `background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-card); box-shadow:var(--shadow-md)`.
- **Texto hierárquico:** `--text` (principal) → `--text-sub` (secundário) → `--text-muted` (metadados).
- **Estados (badges):** Pendente=`--accent`, Aprovado/Sucesso=`--green`, Em fila/Alerta=`--amber`, Recusado/Erro=`--red`; fundo via `color-mix(in srgb, var(--token) 18%, transparent)`.
- **Tipografia:** títulos com `var(--font-display)`, corpo com `var(--font-body)`. No Sicredi, títulos usam `font-weight:300` (regra no `sicredi.css`).
- **Espaçamento (de `docs/design.md`):** escala base 4px (1,2,3,4,6,8,12,16,20,24); padding horizontal padrão `16px`, vertical de seção `24px`, gap `12px`; container `max-w-7xl`.
- **Mobile-first:** layout pensado para mobile (há `BottomNav` em `components/layout/bottom-nav.tsx`); desktop usa Sidebar.
- **Movimento:** respeitar `prefers-reduced-motion` (já tratado em `styles/themes/index.css`).

## 6. Do / Don't
| ✅ Faça | ❌ Evite |
|---|---|
| `var(--accent)`, `var(--radius-card)` | `#4f46e5`, `border-radius:14px` literais |
| Novo tenant = novo `.theme-{key}` completo | herdar parcialmente (tokens faltando quebram componentes) |
| Reusar `theme-sicredi` como gabarito (inclui tokens shadcn) | criar tema só com tokens legados |
| Derivar URLs/asset do tenant por config | hardcode de logo/host |

## 7. Arquivos de referência
- Tokens: `src/styles/themes/base.css` (dark), `src/styles/themes/sicredi.css`.
- Engine: `src/lib/theme-engine.ts` (classe + tokens→CSS), `src/lib/theme-parser.ts` (design.md→tokens), `src/lib/theme-provisioner.ts` (publica CSS + persiste no tenant).
- Aplicação: `src/app/layout.tsx` (resolve tenant por cookie e aplica a classe), `src/components/providers/{TenantContext,ThemeProvider}.tsx`.
- Spec textual: `docs/design.md`.
- Boards visuais: `design-boards/design-board-default.png`, `design-boards/design-board-sicredi.png`.
- Screenshots reais do app (tema default/dark): pasta `screenshots/` (50 imagens, mobile+desktop) e wireframes em `docs/wireframes/`.
