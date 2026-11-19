# Pasar Hari Ini — Kutipan, Chart, dan Peristiwa — TradingView — Style Reference
> Extracted 2026-11-02 from https://id.tradingview.com/markets/

**Theme:** dark

Pasar Hari Ini — Kutipan, Chart, dan Peristiwa — TradingView (id.tradingview.com) reads as a dark, layered interface built on a EuclidCircularSemibold/-apple-system type pairing. Structurally it relies on fully-rounded pill shapes as its signature geometry, and soft shadows lift key surfaces off the canvas — while brand accent (#ff9800) carries the interactive energy. Motion is measured and smooth, averaging 361ms on interactive transitions. Typography runs from 10px up to 48px across 7 steps, and the spacing system sits on a 4-unit base with 8px container padding.

## Contents

- [At a Glance](#at-a-glance)
- [Tokens — Colors](#tokens-colors)
- [Tokens — Typography](#tokens-typography)
- [Iconography](#iconography)
- [Tokens — Spacing & Shapes](#tokens-spacing-shapes)
- [Effects & Treatments](#effects-treatments)
- [Tokens — Motion](#tokens-motion)
- [Design Token System](#design-token-system)
- [Scroll & Reveal Motion](#scroll-reveal-motion)
- [Micro-interactions](#micro-interactions)
- [Component State Matrix](#component-state-matrix)
- [Overlays & Portals](#overlays-portals)
- [Components](#components)
- [Component Census](#component-census)
- [Component API Sketch](#component-api-sketch)
- [Starter Components](#starter-components)
- [Do's and Don'ts](#dos-and-donts)
- [Surfaces](#surfaces)
- [Elevation](#elevation)
- [Imagery](#imagery)
- [Assets & Media](#assets-media)
- [Layout](#layout)
- [Page Blueprint](#page-blueprint)
- [Grid & Composition](#grid-composition)
- [Landing Page Anatomy](#landing-page-anatomy)
- [Hero & Conversion](#hero-conversion)
- [Signature Devices](#signature-devices)
- [Content & Copy](#content-copy)
- [Accessibility Profile](#accessibility-profile)
- [Responsive](#responsive)
- [Responsive Behaviour](#responsive-behaviour)
- [Agent Prompt Guide](#agent-prompt-guide)
- [Quick Start](#quick-start)
- [Rebuild Checklist](#rebuild-checklist)
- [Extraction Coverage](#extraction-coverage)
- [Known Gaps](#known-gaps)

## At a Glance

The decisions that define this design. Everything below expands on these.

| Aspect | Value |
|--------|-------|
| Theme | dark, compact density |
| Core colors | canvas `#000000`, surface `#1a1a1a`, text `#b8b8b8` (10.6:1), accent `#ff9800` |
| Display type | EuclidCircularSemibold 600, 48px / 1.08, -0.96px tracking |
| Body type | -apple-system 500, 16px / 1.5 |
| Corner radius | 4px tags, 6px tags, 8px cards, 16px cards, pills (9999px) |
| Spacing | 4px base unit, 1020px container, 64px between sections, 8px card padding |
| Elevation | 3 shadow tiers, most used `rgb(0, 0, 0) 0px 0px 2px 0px, rgb(0, 0, 0) 0px 3px 9px 0px` |
| Motion | 350ms default with `ease-in-out`, honours reduced motion |
| Breakpoints | 300px, 320px, 329px, 440px, 480px, 548px |
| Page flow | Hero → Content section → Content section → Content section → Content section → Content section → Content section → Content section → Content section |

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Canvas | `#000000` | `--color-bg-canvas` | Page background — the base layer every other surface floats on · 4.14% of usage |
| Primary Text | `#b8b8b8` | `--color-text-primary` | Primary copy, headings, high-emphasis UI labels — 10.6:1 against canvas · 63.2% of usage |
| Secondary Text | `#8c8c8c` | `--color-text-secondary` | Supporting copy and descriptions — 6.2:1 against canvas · 5.74% of usage |
| Muted Text | `#ffffff` | `--color-text-muted` | Captions, placeholders, low-emphasis meta — 21.0:1 against canvas · 1.46% of usage |
| Brand Accent | `#ff9800` | `--color-accent` | Primary interactive color — buttons, links, key fills carry the brand energy · 4.21% of usage |
| Surface | `#1a1a1a` | `--color-bg-surface` | Elevated container fill — cards, nav bars, panels sitting on the canvas · 8.8% of usage |
| Border | `#464646` | `--color-border` | Hairline separators and card outlines · 1.8% of usage |
| Blue Mid | `#5b9cf6` | `--color-blue-mid` | Supporting text or icon color · 3.51% of usage |
| Cyan Mid | `#22ab94` | `--color-cyan-mid` | Supporting text or icon color · 2.86% of usage |
| Red Mid | `#f7525f` | `--color-red-mid` | Supporting text or icon color · 1.89% of usage |
| Gray Dark | `#636363` | `--color-gray-dark` | Supporting text or icon color · 0.76% of usage |
| Magenta Mid | `#ba68c8` | `--color-magenta-mid` | Supporting surface / fill color · 0.63% of usage |

**Gradients in use:**
- `linear-gradient(277deg, rgba(255, 255, 255, 0) 70.02%, rgba(91, 156, 246, 0.3) 1` (1 uses)

**Theming:** dark mode is available (html.dark class, data-theme="dark", color-scheme property); currently rendering dark. Turn on “Light + dark” in DesignMD to measure both palettes in one scan.

## Tokens — Typography

### -apple-system — body family
- **Weights:** 400, 500, 600, 700
- **Sizes:** 36px, 28px, 20px, 18px, 16px, 14px, 13px, 12px
- **Role:** Body and UI text — descriptions, labels, navigation. Weights 400/500/600/700.

### EuclidCircularSemibold — display family
- **Weights:** 600
- **Sizes:** 48px
- **Role:** Display and heading family — weight 600 carries headlines at 48px; smaller weights support sub-headings.

### Type Scale

| Role | Size | Line Height | Letter Spacing | Weight | Family |
|------|------|-------------|----------------|--------|--------|
| display | 48px | 1.08 | -0.96px | 600 | EuclidCircularSemibold |
| heading-xl | 36px | 1.22 | — | 600 | -apple-system |
| heading-lg | 28px | 1.29 | — | 600 | -apple-system |
| body | 16px | 1.5 | — | 500 | -apple-system |
| small | 14px | 1.29 | — | 400 | -apple-system |
| caption | 12px | 1.45 | 0.4px | 400 | -apple-system |
| micro | 10px | 1.6 | — | 600 | -apple-system |

## Iconography

- **Style:** filled
- **Size scale:** 9 / 18 / 28px (266 icons measured)
- **Delivery:** inline SVG
- **Illustration:** 7 larger vector graphics present (spot/ambient illustration is part of the language)

## Tokens — Spacing & Shapes

**Density:** compact

### Border Radius

| Context | Value | Usage |
|---------|-------|-------|
| tag | 6px | 465 elements |
| image | pill (fully rounded, 9999px) | 424 elements |
| card | 8px | 394 elements |
| button | 8px | 124 elements |
| other | pill (fully rounded, 9999px) | 73 elements |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| sm | `rgb(0, 0, 0) 0px 0px 2px 0px, rgb(0, 0, 0) 0px 3px 9px 0px` | `--shadow-sm` |
| md | `rgb(0, 0, 0) 0px 0px 6px 0px` | `--shadow-md` |
| lg | `rgba(0, 0, 0, 0.4) 0px 2px 4px 0px` | `--shadow-lg` |

### Layout

- **Page max-width:** 1020px
- **Section gap:** 64px
- **Card padding:** 8px
- **Element gap:** 2px
- **Spacing base unit:** 4px

## Effects & Treatments

- **Glassmorphism:** `backdrop-filter: blur(6px)` (1 surfaces) — frosted translucent panels
- **Gradients:** linear ×1
- **Masks & shapes:** 64 masked elements, 50 clip-paths
- **Blend modes:** background-normal, normal ×1 (duotone/tinting treatment)

## Tokens — Motion

### Duration scale

| Token | Value | Use |
|-------|-------|-----|
| `--duration-instant` | 1ms | press feedback, micro state changes (2 observed) |
| `--duration-fast` | 150ms | hover/color transitions (3 observed) |
| `--duration-base` | 350ms | default UI transitions (4 observed) |
| `--duration-moderate` | 500ms | panels, accordions, toasts (5 observed) |
| `--duration-slow` | 3000ms | hero reveals, page-level (2 observed) |

### Easing

| Token | Value | Character |
|-------|-------|-----------|
| `--ease-custom-1` | `ease-in-out` | used 113× |
| `--ease-custom-2` | `cubic-bezier(0.67, 0.00, 0.34, 1.00)` | used 21× |
| `--ease-custom-3` | `ease` | used 18× |
| `--ease-custom-4` | `ease-out` | used 6× |
| `--ease-custom-5` | `linear` | used 4× |

### Animation recipes (paste-ready)

```css
/* tremor-transform-F50gnfeY — trigger: on load; 3000ms linear, infinite */
@keyframes tremor-transform-f50gnfey {
  from { transform: rotate(0deg); }
  50% { transform: rotate(1deg); }
  75% { transform: rotate(-1deg); }
  to { transform: rotate(0deg); }
}
/* lookFirstAnimation-s9vf589d — trigger: scroll-linked; 1ms linear */
@keyframes lookfirstanimation-s9vf589d {
  from { opacity: 0; transform: scaleY(0); }
  20% { opacity: 0; }
  to { opacity: 1; transform: scaleY(1); }
}
/* animation: opacity — trigger: scroll; 500ms ease-in-out; target: div.container-sticky-ICFJVRVE */
/* animation: transform — trigger: scroll; 500ms ease-in-out; target: div.container-sticky-ICFJVRVE */
/* animation: div.block-fLCQaGQP — trigger: scroll; 0ms ; target: div.block-fLCQaGQP */
```

**Reduced motion:** the site defines `prefers-reduced-motion` overrides — replicate them.

## Design Token System

**Naming fingerprint:** bespoke — these 225 custom properties match no framework convention (Tailwind, shadcn/ui, MUI, Chakra, Bootstrap, Ant, Mantine, Material 3 and Open Props were all tested), and read as hand-authored: `--color-banana-yellow-100`, `--color-banana-yellow-200`, `--color-banana-yellow-300`, `--color-banana-yellow-400`, `--color-banana-yellow-50`.

**Scopes captured:** `:root, body` → dark (81 vars) · `[data-theme="light"]` → light (80 vars).

### Variable groups

| Group | Kind | Count | Examples |
|---|---|---|---|
| `--color-cold` | color | 19 | `--color-cold-gray…: #f2f2f2` `--color-cold…` |
| `--color-tan` | color | 18 | `--color-tan-orang…: #ffe0b2` `--color-tan-…` |
| `--color-ripe` | color | 17 | `--color-ripe-red-…: #fccbcd` `--color-ripe…` |
| `--color-iguana` | color | 14 | `--color-iguana-gr…: #c8e6c9` `--color-igua…` |
| `--color-banana` | color | 9 | `--color-banana-ye…: #fff9c4` `--color-bana…` |
| `--color-item` | mixed | 7 | `--color-item-acti…: var(--color-t…` `--col…` |
| `--color-bg` | color | 5 | `--color-bg-highli…: #000` `--color-bg-prim…` |
| `--color-text` | color | 4 | `--color-text-disa…: #555` `--color-text-pr…` |
| `--color-border` | color | 4 | `--color-border: #2b2b2b` `--color-border-c…` |
| `--color-input` | color | 4 | `--color-input-bg: #1a1a1a` `--color-input-…` |
| `--color-brand` | other | 3 | `--color-brand: var(--color-t…` `--color-br…` |
| `--color-danger` | color | 3 | `--color-danger: #cc2f3c` `--color-danger-a…` |

_+9 further groups not listed._

### Detected numeric scales

- `--color-cold` — #f9f9f9 / #f2f2f2 / #ebebeb / #dbdbdb / #c9c9c9 / #b8b8b8 / #a8a8a8 / #9c9c9c / #8c8c8c / grey / #707070 / #636363 (19 steps, colour ramp)
- `--color-tan` — #fff3e0 / #ffe0b2 / #ffcc80 / #ffb74d / #ffa726 / #ff9800 / #fb8c00 / #f57c00 / #ef6c00 / #e65100 (10 steps, colour ramp)
- `--color-ripe` — #ffebec / #fccbcd / #faa1a4 / #f77c80 / #f7525f / #f23645 / #cc2f3c / #b22833 / #991f29 / #801922 (10 steps, colour ramp)
- `--color-iguana` — #e8f5e9 / #c8e6c9 / #a5d6a7 / #81c784 / #66bb6a / #4caf50 / #43a047 / #388e3c / #2e7d32 / #1b5e20 (10 steps, colour ramp)
- `--color-banana` — #fffde7 / #fff9c4 / #fff59d / #fff176 / #ffee58 / #ffeb3b / #fdd835 / #fbc02d / #f9a825 (9 steps, colour ramp)

### Light / dark overrides

| Variable | Light | Dark | Uses |
|---|---|---|---|
| `--color-text-primary` | `#000000` | `#b8b8b8` | 36 |
| `--color-text-secondary` | `#707070` | `#8c8c8c` | 8 |
| `--color-bg-primary-hover` | `#f2f2f2` | `#1a1a1a` | 7 |
| `--color-danger-active` | `#cc2f3c` | `#f7525f` | 6 |
| `--color-toolbar-button-ba…` | `#f2f2f2` | — | 6 |
| `--color-body-bg` | `#ffffff` | `#000000` | 5 |
| `--color-success` | `var(--color-minty-gre…` | — | 5 |
| `--_1-cyUd` | — | `#00000000` | 4 |
| `--color-bg-primary` | `#ffffff` | `#131313` | 4 |
| `--color-success-hover` | `var(--color-minty-gre…` | — | 4 |
| `--color-button-hover-bg` | — | `#131313` | 3 |
| `--color-pane-bg` | `#ffffff` | `#000000` | 3 |
| `--color-text-disabled` | `#b8b8b8` | `#555555` | 3 |
| `--color-toolbar-button-te…` | `#000000` | — | 3 |

_+26 further overridden variables._

**Tokenised coverage:** 97% of the page's most-used colours resolve to a variable — this design is genuinely tokenised, so rebuild against the variables rather than the hex values.

### Paste-ready token block

```css
:root {
  /* color */
  --color-text-primary: var(--color-cold-gray-300);
  --color-cold-gray-500: grey;
  --_0-IUtT: #0000;
  --color-tan-orange-500: #ff9800;
  --color-white: #fff;
  --color-cold-gray-400: #9c9c9c;
  --color-text-secondary: var(--color-cold-gray-450);
  --color-bg-primary-hover: var(--color-cold-gray-800);
  --color-danger-active: var(--color-ripe-red-400);
  --color-ripe-red-500: #f23645;
  --color-body-bg: var(--color-black);
  --_1-cyUd: #0000;
  --_3-IUtT: #0000;
  --color-bg-primary: var(--color-cold-gray-850);
  --color-cold-gray-100: #f2f2f2;
  --color-cold-gray-900: #000;
  --color-tan-orange-a400: #ff9100;
  --color-button-hover-bg: var(--color-cold-gray-850);
  --color-cold-gray-550: #707070;
  --color-cold-gray-750: #2b2b2b;
  --color-pane-bg: var(--color-cold-gray-900);
  --color-ripe-red-400: #f7525f;
  --color-text-disabled: var(--color-cold-gray-650);
  --_0-6bYZ: var(--color-white);
  --color-accent-content: var(--color-white);
  --color-cold-gray-300: #b8b8b8;
  --color-cold-gray-600: #636363;
  --color-disabled-border-and-color: var(--color-cold-gray-800);
  --color-tan-orange-600: #fb8c00;
  --color-tan-orange-a600: #cc7014;
  --_0-__rq: var(--color-cold-gray-600);
  --_0-1GBr: var(--color-white);
  --_0-84ot: var(--color-cold-gray-800);
  --_0-AEQ9: var(--color-cold-gray-800);
  --_0-CaBI: var(--color-cold-gray-300);
  --_0-CpjZ: #0000;
  --_1-__rq: var(--color-cold-gray-800);
  --color-bg-secondary: var(--color-cold-gray-900);
  --color-chart-page-bg: var(--color-cold-gray-800);
  --color-cold-gray-450: #8c8c8c;
  --color-cold-gray-650: #555;
  --color-common-tooltip-bg: var(--color-cold-gray-750);
  --color-icons: var(--color-cold-gray-450);
  --color-legacy-bg-scroll-buttons: var(--color-cold-gray-550);
  --_0-_77g: #0000;
  --_0-2VVy: #0000;
  --_0-bosa: #0000;
  --_0-cM_L: #0000;
  --_0-emQu: #0000;
  --_0-IL37: #0000;
  --_0-Kdp9: var(--color-white);
  --_0-LFlA: var(--color-cold-gray-600);
  --_0-Mp72: var(--color-white);
  --_0-Ms8R: #0000;
  --_0-mZAH: var(--color-cold-gray-800);
  --_0-OPqL: var(--color-white);
  --_0-q7kR: var(--color-black);
  --_0-Wrme: #5b9cf64d;
  --color-cold-gray-800: #1a1a1a;
  --color-black: #000;
  --color-cold-gray-850: #131313;
  /* space */
  --cms-page-content-margin-top: 0;
}
```

### Dark theme override

Only the 18 variables that actually change are listed — the other 41 are byte-identical to `:root` and inherit from it. Paste this after the block above.

```css
[data-theme="dark"] {
  /* color */
  --_0-XvAz: #0000;
  --_0-Z8r0: var(--color-ripe-red-500);
  --_0-zqKG: var(--color-ripe-red-400);
  --_1-_77g: var(--color-white);
  --_1-euhQ: var(--color-ripe-red-500);
  --_1-IUtT: var(--color-tan-orange-500);
  --_1-Kdp9: var(--color-cold-gray-750);
  --_1-LFlA: #747474;
  --_1-mZAH: #464646;
  --_1-OPqL: var(--color-cold-gray-900);
  --_1-q7kR: var(--color-cold-gray-800);
  --_1-TwEC: var(--color-ripe-red-500);
  --_10-OPqL: var(--color-cold-gray-900);
  --_2-_77g: #0000;
  --_2-IUtT: var(--color-cold-gray-450);
  --_2-Kdp9: var(--color-cold-gray-300);
  --_2-LFlA: #424242;
  --_2-OPqL: #0000;
}
```

**Caveats:** 1 component/width-scoped var blocks skipped · 91 more light/dark differences not listed · 205 variables found, 200 most-used reported

## Scroll & Reveal Motion

The page reveals content as it scrolls. Measured over a full end-to-end scroll pass:

- **fade in** — 1 element (20% of 5 reveals)
- **slide up** — 1 element (20% of 5 reveals)

### Reveal inventory

| Animation | Properties | Duration | Easing | Target |
|---|---|---|---|---|
| `opacity` | `opacity` | 500ms | `ease-in-out` | `div.container-sticky-IC…` ×1 |
| `transform` | `transform` | 500ms | `ease-in-out` | `div.container-sticky-IC…` ×1 |
| — | `visibility` | — | — | `div.block-fLCQaGQP` ×3 |

### Paste-ready reveal CSS

```css
.reveal {
  opacity: 0;
}
.reveal.is-visible {
  animation: opacity 500ms ease-in-out both;
}

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal.is-visible { animation: none; opacity: 1; }
}
```

### How to wire it

- Observe with a single `IntersectionObserver` at `threshold: 0.15` and `rootMargin: "0px 0px -10% 0px"`, add `is-visible`, then `unobserve` — every measured reveal fired once on entry, none replayed on scroll-back.
- The page already declares `prefers-reduced-motion` overrides — ship the guard above; without it the rebuild is less accessible than the original.

## Micro-interactions

### Declared transitions

| Properties | Duration | Easing | Applies to |
|------------|----------|--------|------------|
| `background-color` | 200ms | `ease-in-out` | element (110 elements) |
| `min-height, padding-bottom` | 500ms | `cubic-bezier(0.67, 0, 0.34, 1)` | element (21 elements) |
| `background-color, opacity, color` | 60ms | `ease` | button (12 elements) |
| `opacity` | 150ms | `ease-out` | element (5 elements) |
| `background-color, color` | 350ms | `ease` | button (4 elements) |
| `transform` | 350ms | `ease` | element |
| `transform` | 350ms | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | element |
| `transform` | 880ms | `cubic-bezier(0.18, 1.14, 0.3, 1)` | element |

### Hover states (from live stylesheets)

- `.footerLinksColumnListItem-H5MmHsXE:hover` (97 elements) → color: var(--color-content-secondary-neutral-bold); fill: var(--color-content-secondary-neutral-bold)
- `.footerLinksColumnListItem-H5MmHsXE:hover` (97 elements) → background-color: var(--color-container-fill-primary-neutral-extra-light)
- `.badge-yixR96Ga:hover` (2 elements) → background-color: var(--color-button-fill_border-secondary-neutral-hover)
- `.textLink-s9vf589d:hover` (2 elements) → color: var(--color-link-primary-hover); fill: var(--color-link-primary-hover)
- `.button-zm3YRUFG:hover` (12 elements) → color: var(--tv-color-toolbar-button-text-hover,var(--color-toolbar-button-text-hover))
- `.button-zm3YRUFG.isInteractive-zm3YRUFG.isActive-zm3YRUFG:hover` (1 elements) → color: var(--tv-tool-widget-button-interactive-hover-color,var(--tv-tool-widget-button-interactiv
- `a:hover` (569 elements) → outline-width: 0px

### Active / pressed states

- `.footerLinksColumnListItem-H5MmHsXE:active` → color: var(--color-content-secondary-neutral-bold); fill: var(--color-content-secondary-neutral-bold)
- `.footerLinksColumnListItem-H5MmHsXE:active` → background-color: var(--color-container-fill-primary-neutral-light)
- `.badge-yixR96Ga:active` → background-color: var(--color-button-fill_border-secondary-neutral-active)
- `.textLink-s9vf589d:active` → color: var(--color-link-primary-active); fill: var(--color-link-primary-active)

### Interaction patterns

- **Sticky regions:** 22 sticky elements (headers or section rails)
- **Hover language:** predominantly *tint* (83% of 60 hover rules)
- **Cursor language:** pointer, default, auto

## Component State Matrix

### Actions

**Primary button** — 1 instance · exemplar `a.button-mLEhCrVw` · measured 216×40px

| State | Text | Other |
|---|---|---|
| **Base** | `#000000` | radius 8px · padding 0px 15px |
| Hover | — | outline outline-width:0px |
| Focus | — | outline outline-width:initial |
| Active / pressed | — | outline outline-width:0px |
| Disabled | #555 | — |

_Also changed but not modelled here: `display`._

**Secondary button** — 35 instances · exemplar `button.apply-common-tooltip` · measured 112×40px

| State | Transform | Other |
|---|---|---|
| **Base** | `none` | radius 8px · padding 8px 16px |
| Focus | — | outline outline-width:initial |
| Disabled | translateY(0px) | — |

_Also changed but not modelled here: `display`._

**Ghost button** — 28 instances · exemplar `a.button-AZ0fL83v` · measured 454×24px

| State | Text | Other |
|---|---|---|
| **Base** | `#5b9cf6` | radius 4px · padding 0px 0px |
| Hover | #3179f5 | outline outline-width:0px |
| Focus | — | outline outline-width:initial |
| Active / pressed | #bbd9fb | outline outline-width:0px |
| Disabled | #555 | — |

_Also changed but not modelled here: `display`._

**Icon button** — 14 instances · exemplar `button.floatingButton-G14faV6F` · measured 48×48px

| State | Other |
|---|---|
| **Base** | radius 24px · padding 1px 6px |
| Focus | outline outline-width:initial |

**Secondary button** — 7 instances · exemplar `button.apply-common-tooltip` · measured 60×40px

| State | Transform | Other |
|---|---|---|
| **Base** | `none` | radius 8px · padding 8px 16px |
| Focus | — | outline outline-width:initial |
| Disabled | translateY(0px) | — |

_Also changed but not modelled here: `display`._

**Ghost button** — 1 instance · exemplar `button.label-ql4iq1lU` · measured 40×18px

| State | Other |
|---|---|
| **Base** | radius 0px · padding 0px 0px |
| Focus | outline outline-width:initial |

### Form controls

**Radio** — 8 instances · exemplar `button.segmentedControlBase-Wsyc2…` · measured 34×34px

| State | Other |
|---|---|
| **Base** | radius 5px · padding 0px 0px |
| Focus | outline outline-width:initial |

**Radio** — 8 instances · exemplar `button.segmentedControlBase-Wsyc2…` · measured 34×34px

| State | Other |
|---|---|
| **Base** | radius 5px · padding 0px 0px |
| Focus | outline outline-width:initial |

### Navigation

**Link** — 90 instances · exemplar `a.container-wE7jIsPx` · measured 783×24px

| State | Other |
|---|---|
| **Base** | radius 0px · padding 0px 0px |
| Hover | outline outline-width:0px |
| Focus | outline outline-width:initial |
| Active / pressed | outline outline-width:0px |

**Tab** — 8 instances · exemplar `a#header-bonds.roundTabButton-Wa6…` · measured 149×28px

| State | Other |
|---|---|
| **Base** | radius 14px · padding 0px 11px |
| Hover | outline outline-width:0px |
| Focus | outline outline-width:initial |
| Active / pressed | outline outline-width:0px |

_Also changed but not modelled here: `display`._

**Link** — 12 instances · exemplar `a.containerLink-QjjAoTcT` · measured 564×52px

| State | Other |
|---|---|
| **Base** | radius 0px · padding 0px 0px |
| Hover | outline outline-width:0px |
| Focus | outline outline-width:initial |
| Active / pressed | outline outline-width:0px |

### Surfaces

**Chip / badge** — 18 instances · exemplar `div.pill-PiK5YZZ6` · measured 36×36px

| State | Other |
|---|---|
| **Base** | radius 4px · padding 4px 0px |
| Focus | outline outline-width:initial |

_+8 further archetypes were measured but not tabled._

### Interaction language

- **Hover language:** dominantly *other*. Of the 8 of 20 archetypes that respond to hover, 75% shift other, 25% shift color (one archetype can move several at once); 12 archetypes change nothing on hover.
- **Focus policy:** a real `outline` on 20 of 20 archetypes.
- **Warning:** 40 rules set `outline: none` — the design relies on its replacement ring existing. Never port the suppression without the ring.
- **Tap targets:** median 254×24px over 316 interactive elements; 271 (86%) fall under the 44px guidance — smallest: `div.button-XNUivTou` 8×40px, `button.button-3tCoNgsh` 12×13px.
- **Cursor language:** Chip / badge → `pointer`, Ghost button → `pointer`, Icon button → `default`, Link → `pointer`, Primary button → `pointer`.

## Overlays & Portals

These surfaces are `display:none` at rest; they were temporarily forced measurable off-screen and restored. Every value below is real, not inferred.

| Kind | Background | Radius | Shadow | Padding | Width |
|---|---|---|---|---|---|
| Tooltip — R | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |
| Tooltip — R | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |
| Tooltip — R | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |
| Tooltip — Pasar buka | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |
| Tooltip — R | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |
| Tooltip — R | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |
| Tooltip — R | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |
| Tooltip — R | `#00000000` | `0px` | `none` | `0px 0px` | `6px` |

### Layer, backdrop & entry

- **Tooltip** — text `#42bda8`, 10px type, transitions `all`.
- **Tooltip** — text `#42bda8`, 10px type, transitions `all`.
- **Tooltip** — text `#42bda8`, 10px type, transitions `all`.
- **Tooltip** — text `#42bda8`, 14px type, transitions `all`.
- **Tooltip** — text `#42bda8`, 10px type, transitions `all`.
- **Tooltip** — text `#42bda8`, 10px type, transitions `all`.
- **Tooltip** — text `#42bda8`, 10px type, transitions `all`.
- **Tooltip** — text `#42bda8`, 10px type, transitions `all`.

## Components

### Ghost / outline button
**Role:** primary action

#00000000 background, #b8b8b8 text, border-radius 0px, padding 0px 0px, -apple-system 500 16px. Transitions: all 0s.

### Ghost / outline button
**Role:** secondary variant (37 instances)

#00000000 background, #b8b8b8 text, border-radius 8px, padding 8px 16px, -apple-system 400 16px, 1px solid rgba(0, 0, 0, 0) border. Transitions: all 0s.

### Ghost / outline button
**Role:** secondary variant (31 instances)

#00000000 background, #5b9cf6 text, border-radius 4px, padding 0px 0px, -apple-system 600 16px. Transitions: all 0s.

### Card — `.container-Nw17R6N6` (8 instances)

#1a1a1a background, border-radius 64px, padding 0px 0px, 1px solid rgb(0, 0, 0) border, no shadow.

### Card — `.content-qRbTYRNp` (7 instances)

#131313 background, border-radius 64px, padding 20px 0px, no shadow.

### Card — `.widgetbar-tabs` (4 instances)

#000000 background, border-radius 0px, padding 0px 0px, no shadow.

### Text link (328 instances)

#b8b8b8 text, no underline by default, -apple-system 500 16px. Hover transition: all 0s.

### Heading stack

| Level | Sample | Font | Size | Line Height | Tracking |
|-------|--------|------|------|-------------|----------|
| H1 | Pasar Keseluruhan | EuclidCircularSemibold 600 | 48px | 52px | -0.96px |
| H2 | Indeks | -apple-system 600 | 36px | 44px | normal |
| H3 | Indeks-Indeks dunia | -apple-system 600 | 28px | 36px | normal |

## Component Census

Additional UI inventory detected on the page, with a measured exemplar per category:

| Component | Count | Measured exemplar |
|-----------|-------|-------------------|
| Tabs | 9 | bg rgb(242, 242, 242) · radius 14px · pad 0px 11px · 1px solid rgb(219, 219, 219) |
| Accordions / disclosures | 21 | radius 14px · pad 0px 11px · 1px solid rgba(0, 0, 0, 0) |
| Alerts / live regions | 26 | structural |
| Skeleton loaders | 45 | bg rgb(26, 26, 26) · radius 50% |
| Tooltips | 661 | structural |
| Tables / grids | 11 | structural |
| Stat blocks | 261 | structural |
| Charts | yes | 67 canvas elements |
| Badges / chips | 43 | bg rgb(19, 19, 19) · radius 4px · pad 4px 0px |

## Component API Sketch

### Props, from the measured variants

```ts
// Every union member below was measured on this page. Nothing is invented.
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';  // measured heights: 18 / 21 / 24 / 34px

interface ButtonProps {
  variant?: ButtonVariant;   // "primary" is the default — 84 instances
  size?: ButtonSize;
  iconOnly?: boolean;      // a square icon-only variant was measured
  disabled?: boolean;      // measured disabled state exists
  children: React.ReactNode;
}

type CardVariant = 'container-Nw17R6N6' | 'content-qRbTYRNp' | 'widgetbar-tabs';
interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
}
```

### React + Tailwind, using the measured values

```jsx
// Primary button — measured: #00000000 fill, #b8b8b8 text, 0px radius, 0px 0px padding, -apple-system 500 16px
export function Button({ children, ...props }) {
  return (
    <button
      className="inline-flex items-center justify-center font-medium text-base rounded-none px-0 py-0 bg-[#00000000] text-[#b8b8b8] transition-colors duration-[60ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00000000]"
      {...props}
    >
      {children}
    </button>
  );
}

// Card — measured: #1a1a1a surface, 64px radius, 0px 0px padding, #000000 border, flat, 8 instances
export function Card({ children }) {
  return <div className="bg-[#1a1a1a] rounded-[64px] px-0 py-0 border border-[#000000]">{children}</div>;
}
```

_Arbitrary values (`px-[18px]`, `bg-[#4f46e5]`) appear wherever the measured number has no Tailwind scale token — that is deliberate; rounding them to the nearest token changes the design._

## Starter Components

Working React + Tailwind v4 components built from the measured values — the same numbers as the tables above, already wired to the `@theme` tokens in Quick Start. Hover, focus and active classes come from the Component State Matrix. Start here instead of from a blank file.

```tsx
// Starter components generated by DesignMD from https://id.tradingview.com/markets/ on 2026-11-02.
// Every value below was measured on the page. Needs the Tailwind v4 @theme block from design.md.
import * as React from 'react';

const cx = (...parts: unknown[]) => parts.filter(Boolean).join(' ');

/* ---------------------------------------------------------------- Button */
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonBase = 'inline-flex items-center justify-center gap-2 whitespace-nowrap text-small font-normal rounded-md h-10 px-[15px] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-[#f2f2f2] text-bg-canvas border border-[#f2f2f2] hover:outline-2 hover:outline-offset-2 hover:outline-accent active:outline-2 active:outline-offset-2 active:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',  // measured on “Lihat IPO di seluruh dunia”
  secondary: 'text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',  // measured on “Seluruhnya”
  ghost: 'text-blue-mid hover:text-[#3179f5] hover:outline-2 hover:outline-offset-2 hover:outline-accent active:text-[#bbd9fb] active:outline-2 active:outline-offset-2 active:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',  // measured on “Lihat seluruh saham dengan p”
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return <button className={cx(buttonBase, buttonVariants[variant], className)} {...props} />;
}

/* ------------------------------------------------------------------ Card */
const cardBase = 'bg-bg-surface border border-bg-canvas rounded-2xl p-0';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
}

export function Card({ className, ...props }: CardProps) {
  return <div className={cx(cardBase, className)} {...props} />;
}

/* -------------------------------------------------------------- TextLink */
export function TextLink({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cx('text-text-primary font-medium no-underline hover:underline underline-offset-4 transition-colors', className)} {...props} />;
}

/* ------------------------------------------------------- Layout */
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('mx-auto w-full max-w-[1020px] px-8', className)} {...props} />;
}

export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cx('py-16', className)} {...props} />;
}

/* --------------------------------------------------------------- Heading */
const headingSizes = {
  1: 'text-display font-semibold',
  2: 'text-heading-xl font-semibold',
  3: 'text-heading-lg font-semibold',
} as const;

export function Heading({ level = 1, className, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 }) {
  const Tag = (["h1","h2","h3"] as const)[level - 1];
  return <Tag className={cx('font-display text-balance', headingSizes[level], className)} {...props} />;
}
```

## Do's and Don'ts

### Do
- Use `#000000` as the canvas and build every surface from the token table above — never invent intermediate grays
- Use #ff9800 exclusively for interactive moments (buttons, links, key fills) — it is the energy of the system
- Snap all spacing to the 4px base unit grid
- Use fully-rounded (pill, 9999px) radii for buttons and tags
- Default interactive transitions to 350ms with the extracted easing tokens

### Don't
- Do not introduce colors outside the 12-token palette extracted above
- Do not set body text in EuclidCircularSemibold — it is reserved for display; body runs in -apple-system
- Do not add springy/bounce motion — the source uses the timing functions listed under Tokens — Motion
- Do not stack multiple shadows

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas | `#000000` | Page background — the base layer |
| 1 | Surface | `#1a1a1a` | Cards, nav bars, panels floating on the canvas |
| 2 | Accent fill | `#ff9800` | Filled CTAs, highlight containers, brand moments |

## Elevation

- **Low:** `rgb(0, 0, 0) 0px 0px 2px 0px, rgb(0, 0, 0) 0px 3px 9px 0px` (28 uses)
- **Mid:** `rgb(0, 0, 0) 0px 0px 6px 0px` (8 uses)
- **High:** `rgba(0, 0, 0, 0.4) 0px 2px 4px 0px` (1 uses)

## Imagery

449 raster images and 0 inline SVGs were found. Dominant aspect ratios: 1:1, 14.02:1. Media is rounded at ~9999px or more. Photography or rendered imagery carries the visual weight.

## Assets & Media

### Image inventory

| Role | Rendered | Aspect | Fit | Loading | Alt |
|---|---|---|---|---|---|
| Logo (above fold) | 40×40px @2.4x · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |
| Logo | 36×36px · svg | 1:1 | — | — | **missing** |

_+298 further images on the page._

**Image pipeline:** 310 images (40 measured in detail); 0% ship a 2× source; 0% are lazy-loaded; 93% carry alt text; average aspect 1:1; formats svg ×310.

### Icon system

They are fill-first (only 0% of shapes are stroked) — solid glyphs, painted with `currentColor` on the fill.

| Icon property | Measured value |
|---|---|
| Icons sampled | 283 |
| Box sizes | 9 / 18 / 28px |
| Corners / caps | unknown |
| Delivery | mixed |
| Icon fonts | 272 glyphs (generic ×272) |

### Web fonts

| Family | Format | Weight | Display | Host |
|---|---|---|---|---|
| EuclidCircularSemibold | woff2 | 600 | swap | same-origin |

_5 `@font-face` rules in total (1 distinct families shown)._

The resolved fallback stacks — copy them verbatim; the fallbacks are what the page shows before the webfont lands:

```css
--font-body: -apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif;
--font-heading: EuclidCircularSemibold, sans-serif;
```

**Font delivery:** self-hosted from `same-origin`. 5 faces registered, 1 actually loaded and 4 never used — do not ship the dead weights.

**Brand marks:** theme-colour `object` / `object`.

### Rich media

- **Canvas:** 67 surfaces at 210×178, 210×178px, WebGL.

_Asset notes: 451 images on the page — inventory sampled the first 400 · background-image hunt capped at 1200 elements · 284 stylesheets — @font-face harvest read the first 60._

## Layout

Content is centered in a ~1020px max-width container. Sections breathe with ~64px vertical rhythm. Cards use ~8px padding. The hero heading is center-aligned.

## Page Blueprint

```text
┌──────────────────────────────────────────────────────────┐
│ 1. CONTENT                                623px · 91% vh │
│   #000000 (dark) · full-bleed                            │
├──────────────────────────────────────────────────────────┤
│ 2. CONTENT                               823px · 120% vh │
│   #000000 (dark) · 1 col · 1026px container · overlaps p…│
├──────────────────────────────────────────────────────────┤
│ 3. CONTENT                              3801px · 553% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 4. CONTENT                              3184px · 463% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 5. CONTENT                              3331px · 485% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 6. CONTENT                              2080px · 303% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 7. CONTENT                              1324px · 193% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 8. CONTENT                              1904px · 277% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 9. CONTENT                              2792px · 406% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 10. CONTENT                             2869px · 418% vh │
│   #000000 (dark) · 1 col · 1026px container              │
├──────────────────────────────────────────────────────────┤
│ 11. CONTENT                             2289px · 333% vh │
│   #000000 (dark) · 1 col · 1026px container · overlaps p…│
├──────────────────────────────────────────────────────────┤
│ 12. FOOTER                               993px · 145% vh │
│   #000000 (dark) · 2 cols · 1026px container · overlaps …│
├──────────────────────────────────────────────────────────┤
│ FOOTER                                 2 columns · 993px │
└──────────────────────────────────────────────────────────┘
```

| # | Band | Height | Container | Columns |
|---|---|---|---|---|
| 1 | Content | 623px (91% vh) | full-bleed | — |
| 2 | Content | 823px (120% vh) | 1026px / 0px gutter | 1 |
| 3 | Content | 3801px (553% vh) | 1026px / 0px gutter | 1 |
| 4 | Content | 3184px (463% vh) | 1026px / 0px gutter | 1 |
| 5 | Content | 3331px (485% vh) | 1026px / 0px gutter | 1 |
| 6 | Content | 2080px (303% vh) | 1026px / 0px gutter | 1 |
| 7 | Content | 1324px (193% vh) | 1026px / 0px gutter | 1 |
| 8 | Content | 1904px (277% vh) | 1026px / 0px gutter | 1 |
| 9 | Content | 2792px (406% vh) | 1026px / 0px gutter | 1 |
| 10 | Content | 2869px (418% vh) | 1026px / 0px gutter | 1 |
| 11 | Content | 2289px (333% vh) | 1026px / 0px gutter | 1 |
| 12 | Footer | 993px (145% vh) | 1026px / 32px gutter | 2 |

_Identical on all 12 bands: background #000000 dark, padding 0px._

### Band construction

All 12 bands are built on one shell — 0px of vertical padding. Height, background and column count are per band and sit in the table above; the bands below need something more.

- **1 · Content** — 0px side gutters; runs full-bleed, edge to edge.
- **2 · Content** — 0px side gutters; it overlaps the band above — negative margin or a translate, not document flow; inner surfaces use `#1a1a1a` on 75% of its elements and `#464646` on 25% of its elements; text `#b8b8b8` at 10.6:1 against the band; set in -apple-system 500 16px on 52% of its text and -apple-system 400 16px on 26% of its text.
- **3 · Content** — 0px side gutters; inner surfaces use `#1a1a1a` on 100% of its elements; text `#b8b8b8` at 10.6:1 against the band; set in -apple-system 500 16px on 68% of its text and -apple-system 400 11px on 21% of its text.
- **4 · Content** — 0px side gutters; inner surfaces use `#1a1a1a` on 50% of its elements and `#8c8c8c` on 50% of its elements; text `#b8b8b8` at 10.6:1 against the band; set in -apple-system 500 16px on 63% of its text and -apple-system 400 11px on 25% of its text.
- **5 · Content** — 0px side gutters; inner surfaces use `#1a1a1a` on 100% of its elements; text `#b8b8b8` at 10.6:1 against the band; set in -apple-system 500 16px on 68% of its text and -apple-system 400 11px on 21% of its text.
- **6 · Content** — 0px side gutters; inner surfaces use `#1a1a1a` on 50% of its elements and `#131313` on 25% of its elements; text `#b8b8b8` at 10.6:1 against the band; set in -apple-system 500 16px on 72% of its text and -apple-system 400 11px on 22% of its text.
- **7 · Content** — 0px side gutters; inner surfaces use `#1a1a1a` on 96% of its elements and `#131313` on 4% of its elements; text `#b8b8b8` at 10.6:1 against the band; set in -apple-system 500 16px on 96% of its text and -apple-system 600 36px on 4% of its text.
- **8 · Content** — 0px side gutters; inner surfaces use `#1a1a1a` on 31% of its elements and `#00c853` on 8% of its elements; text `#b8b8b8` at 10.6:1 against the band; set in -apple-system 500 16px on 59% of its text and -apple-system 600 12px on 15% of its text.

### Page chrome

- **Footer** — 2 columns (row-cluster), column widths 226 / 776px, 993px tall, padding 0px / 0px, 1026px inner container.

## Grid & Composition

**Container widths:** 1020px on 11 bands. The widest measured column is 1020px — build the shell at that width and let narrower bands opt down.

### Grid recipes

| Where | Display | Columns | Gap | Align / justify |
|---|---|---|---|---|
| `div.container-tRBrMTYb` | grid | 1 · `1fr` | 0px | normal / normal |
| `div.container-tRBrMTYb` | grid | 1 · `1fr` | 0px | normal / normal |
| `div.container-ypyYsAmc` | grid | 1 · `1fr` | 48px row / 64px column | normal / normal |
| `div.container-tRBrMTYb` | grid | 1 · `1fr` | 0px | normal / normal |
| `div.container-ypyYsAmc` | grid | 1 · `1fr` | 48px row / 64px column | normal / normal |
| `div.container-ypyYsAmc` | grid | 1 · `1fr` | 48px row / 64px column | normal / normal |
| `div.container-tRBrMTYb` | grid | 1 · `1fr` | 0px | normal / normal |
| `div.container-ypyYsAmc` | grid | 1 · `1fr` | 48px row / 64px column | normal / normal |
| `div.container-tRBrMTYb` | grid | 1 · `1fr` | 0px | normal / normal |
| `div.container-tRBrMTYb` | grid | 1 · `1fr` | 0px | normal / normal |

_+6 further measured containers._

### Z-index layer stack

| z | Role | Position | Element |
|---|---|---|---|
| 102 | Decor | fixed | `div.layout__area--right` · 246×687px |
| 101 | Header | sticky | `div.tv-header` · 1090×64px |
| 10 | Scrim | absolute | `div.overlayScrollWrap-l…` · 200×293px |
| 10 | Navigation | absolute | `div.skipNavigationItemW…` · 1×1px · #131313 |
| 5 | Decor | absolute | `div` · 200×36px |
| 5 | Decor | absolute | `div` · 200×36px |
| 5 | Decor | absolute | `div` · 200×36px |
| 5 | Decor | absolute | `div` · 200×36px |
| 5 | Decor | absolute | `div` · 200×36px |
| 5 | Badge | absolute | `div.rightScrollButton-C…` · 48×48px |

**Z-index scale in use:** `1` · `2` · `5` · `10` · `101` · `102` — reuse exactly these 6 steps, do not invent intermediate values.

**Vertical rhythm:** bands sit a median 64px apart, most commonly 64px, across 12 bands.

## Landing Page Anatomy

The page tells a conversion story in this order — rebuild sections in this sequence:

| Order | Section | Heading / evidence | Key elements |
|-------|---------|--------------------|--------------|
| 1 | Hero | Indeks | 44 images |
| 2 | Content section | Saham Indonesia | 86 images |
| 3 | Content section | Saham-saham dunia | 61 images |
| 4 | Content section | Crypto | 74 images |
| 5 | Content section | Kontrak berjangka dan komoditas | 64 images |
| 6 | Content section | Forex dan mata uang | 78 images |
| 7 | Content section | Obligasi Pemerintah | CTA: "Kustomisasi kurva" + "Lihat seluruh Obligasi Ind" + "Lihat seluruh obligasi 10Y" · 19 images |
| 8 | Content section | Obligasi Korporasi | CTA: "Lihat seluruh obligasi jan" · 36 images |
| 9 | Content section | ETF | 71 images |
| 10 | Footer | Ekonomi | 57 images |

**Section flow:** hero → content → content → content → content → content → content → content → content → footer

## Hero & Conversion

- **Hero CTA pair:** "1D" + "1Bln" + "3Bln"
- **Nav anatomy:** "Produk" logo · 5 links ("Produk", "Komunitas", "Pasar", "Broker", "Lebih lanjut")
- **CTA repetition:** "Tampilkan lebih banyak" ×21, "5Th" ×8, "Seluruhnya" ×8, "1D" ×7, "1Bln" ×7, "3Bln" ×7, "1Th" ×7, "Area" ×7 — the same conversion ask returns at every scroll depth
- **Full CTA copy inventory:** "Tampilkan lebih banyak" · "5Th" · "Seluruhnya" · "1D" · "1Bln" · "3Bln"

## Signature Devices

These patterns define the site's identity — repeat them across every new page:

1. **The Pill Button Language** — every interactive element is fully rounded (9999px radius) — buttons, tags, inputs and badges share one geometry
2. **Card-on-Canvas Contrast** — #1a1a1a surfaces float on a #000000 canvas — separation comes from background contrast, not shadows

## Content & Copy

### Copy per band

| Band | Eyebrow | Heading | CTA |
|---|---|---|---|
| Content | — | Indeks | "Tampilkan chart Indek…" + "Tampilkan chart… |
| Content | — | Saham Indonesia | "Tampilkan chart Bank …" + "Tampilkan chart… |
| Content | — | Saham-saham dunia | "Tampilkan chart Micro…" + "Tampilkan chart… |
| Content | — | Crypto | "Tampilkan chart Bitco…" + "Tampilkan chart… |
| Content | — | Kontrak berjangka dan komoditas | "Tampilkan chart Emas" + "Tampilkan chart P… |
| Content | — | Forex dan mata uang | "Tampilkan chart USD k…" + "Tampilkan chart… |
| Content | — | Obligasi Pemerintah | "Kustomisasi kurva" + "Lihat seluruh Obliga… |
| Content | — | Obligasi Korporasi | "Lihat seluruh obligas…" + "Lihat seluruh o… |
| Content | — | ETF | "Tampilkan chart State…" + "Tampilkan chart… |
| Content | — | Ekonomi | "Tampilkan chart GDP I…" + "Tampilkan chart… |

_1 further band carried no headline copy._

### Footer columns

- **** — Mematuhi SOC 2, Mematuhi GDPR
- **Penyaring** — Saham, ETF, Obligasi, Koin crypto, Pasangan CEX, Pasangan DEX, Pine
- **Heatmap** — Saham, ETF, Koin crypto
- **Kalender** — Ekonomi, Perolehan, Dividen, IPO
- **Produk lainnya** — Aliran berita, Portofolio, Kurva Imbal Hasil, Option, Peta Makro, Pine Script®, Server MCP
- **Aplikasi** — Mobile, Desktop
- **Also in the footer** — social: twitter, facebook, youtube, instagram, linkedin, telegram, tiktok, reddit; legal line "Data referensi tertentu disediakan oleh FactSet. Hak Cipta © 2026 FactSet Research Systems Inc."

### Pricing table

| Tier | Price | Badge | CTA | Key features |
|---|---|---|---|---|
| — | 49.500,96 EUR | — | — | — |
| — | 521,91 USD | — | Tampilkan chart Micro… | — |
| — | 387,00 EUR | — | Tampilkan chart LVMH | — |
| — | 1.412,8 EUR | — | Tampilkan chart Holdi… | — |
| AAPL | 344,63 USD | — | — | — |

### FAQ

- "Tampilkan lebih banyak"

_Built with `accordion` disclosures._

### Testimonials

> Indeks Harga Saham Gabungan IDX D 5.12 0,3730 POINT +1,25%
>
> — **Indeks Harga Saham Gabungan I…** (with avatar)

> Indeks saham syariah Indonesia D 17 0,9840 POINT +0,92%
>
> — **Indeks saham syariah Indonesi…** (with avatar)

> IDX LQ45 D 520, 7910 POINT +1,09%
>
> — **IDX LQ45 D** (with avatar)

### Voice & tone

- **Heading case:** sentence case — 60 sentence, 36 title, 4 upper across 100 headings. Match the dominant one exactly; mixing reads as a different brand.
- **Heading length:** 2.3 words on average over 45 headings — terse; write short declaratives.
- **Questions:** 0% of headlines are questions — every heading is a statement.
- **Reading level:** dense — 183 words per sentence, 6.3 letters per word.
- **Jargon:** low (0% of words).
- **Signature phrases:** "kontrak berjangka" ×7, "lihat seluruh" ×6, "mata uang" ×4, "saham indonesia" ×3, "saham-saham dunia" ×2, "berjangka dan" ×2 — repeat them; they are the vocabulary of the brand.

**Document metadata:** title "Pasar Hari Ini — Kutipan, Chart, dan Peristiwa — TradingView"; description "Lihat harga saham dan kurs forex live, lacak pasar crypto dan indeks pasar saham — seluruhnya dalam satu halaman."; heading hierarchy H1 ×1 · H2 ×10 · H3 ×38; lang `id`.

## Accessibility Profile

- **Contrast discipline:** 98% of measured text usage clears WCAG AA (4.5:1)
- **Focus design:** 21 :focus rules in stylesheets
- **Reduced motion:** `prefers-reduced-motion` overrides present
- **Semantics:** 3 landmarks · 487 ARIA-carrying elements · 93% of images have alt text

## Responsive

Breakpoints declared in stylesheets: `300px`, `320px`, `329px`, `440px`, `479px`, `480px`, `548px`, `568px`, `702px`, `767px`, `768px`, `958px`, `979px`, `1019px`, `1024px`, `1214px`, `1280px`, `1374px`, `1439px`, `1440px`, `1660px`, `1854px`, `1919px`, `1920px`, `2494px`, `2560px`.

Current viewport analyzed at 1150×687 (desktop-scale view).
 The site also uses container queries for component-level responsiveness.

## Responsive Behaviour

**Strategy:** mobile-first (`min-width` queries build up) — 328 min-width rules, 45 max-width rules, 5 range rules.

**Ladder:** the 12 breakpoints match no standard scale — they are custom to this site.

### Breakpoint matrix

| Tier | Query | Layout | Spacing | Type | Hidden / shown |
|---|---|---|---|---|---|
| xs | `≥300px` | grid retemplated | — | — | — |
| xs | `≥320px` | grid retemplated | — | — | — |
| <xs | `≤440px` | position absolute | padding-bottom 8px | — | — |
| <xs | `≤479px` | max-width none | padding-bottom 10px | type -10% | −1 |
| sm only | `480–767px` | — | — | — | −1 |
| sm | `≥548px` | flex-direction row | padding-bottom 0px | — | — |
| sm | `≥568px` | 2 col | margin-top 0px | — | −1 |
| md | `≥702px` | grid retemplated | space +50% | font-size var(--ui-lib-… | −3/+2 mobile-only |

Across the 12 stops the ladder rewrites 287 declarations in 161 rules, the heaviest being `md` at 89. Nothing else moves — anything not in the matrix above holds at every width.

### Mobile adaptation

- **Grid collapse:** 1 grid drops to a single column and 1 flex row turn into columns.
- **Spacing:** shifts -29% at mobile widths — padding and gaps shrink by roughly that much, not to an arbitrary smaller value.
- **Type:** shifts -12% at mobile widths — the whole scale moves, so keep the ratios.
- **Visibility:** 17 selectors hidden and 2 revealed by width (other, mobile-only).
- **Hero:** re-lays out at mobile — `'.tv-header--hero:not(.tv-header-…`, `'.tv-header--hero-full-logo.tv-he…`.

### Modern CSS in play

- **Container queries** are in use — components size to their container, not the viewport. Port the `@container` rules or the layout will not match at intermediate widths.
- **Intrinsic grids** — `auto-fit` / `minmax()` do the column maths instead of breakpoints.
- **`prefers-reduced-motion`** is honoured by the page itself — replicate the override, do not drop it.
- **`forced-colors`** (Windows high contrast) is handled.
- **Coarse-pointer** rules (`pointer: coarse` / `hover: none`) exist — hover affordances have touch fallbacks.
- **Orientation** queries are used.
- **Feature queries:** `not (pointer: coarse)` · `(prefers-reduced-motion: reduce)` · `(hover: none) and (pointer: coars…` · `(max-height: 440px) and (orientat…` — progressive enhancement is deliberate here.

_Caveats: 11 further width conditions were dropped past the 12-breakpoint cap. 4 declared breakpoint values had no capturable declarations (cross-origin or nested stylesheets). rem/em lengths were converted at the assumed 16px root font size._

## Agent Prompt Guide

**Quick Color Reference**
- canvas: #000000
- primary text: #b8b8b8
- secondary text: #8c8c8c
- muted text: #ffffff
- brand accent: #ff9800
- surface: #1a1a1a
- border: #464646
- blue mid: #5b9cf6

**Example Component Prompts**

1. Rebuild the full landing page in exactly this order: hero → content → content → content → content → content → content → content → content → footer. Use the Hero & Conversion spec for the first screen, one component recipe per section, and the section rhythm from the Layout metrics.
2. Create the primary button: #00000000 background, #b8b8b8 text, border-radius 0px, padding 0px 0px, font -apple-system 500 16px. On hover, transition all 0s.
3. Create a card: #1a1a1a background, border-radius 64px, padding 0px 0px, no shadow, 1px solid rgb(0, 0, 0) border.
4. Create the display heading: EuclidCircularSemibold weight 600, 48px, line-height 1.08, letter-spacing -0.96px, #b8b8b8 on #000000.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-bg-canvas: #000000;
  --color-text-primary: #b8b8b8;
  --color-text-secondary: #8c8c8c;
  --color-text-muted: #ffffff;
  --color-accent: #ff9800;
  --color-bg-surface: #1a1a1a;
  --color-border: #464646;
  --color-blue-mid: #5b9cf6;
  --color-cyan-mid: #22ab94;
  --color-red-mid: #f7525f;
  --color-gray-dark: #636363;
  --color-magenta-mid: #ba68c8;

  /* Typography — Font Families (by role) */
  --font-display: EuclidCircularSemibold, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif;

  /* Typography — Scale */
  --text-display: 48px;
  --leading-display: 1.08;
  --tracking-display: -0.96px;
  --text-heading-xl: 36px;
  --leading-heading-xl: 1.22;
  --text-heading-lg: 28px;
  --leading-heading-lg: 1.29;
  --text-body: 16px;
  --leading-body: 1.5;
  --text-small: 14px;
  --leading-small: 1.29;
  --text-caption: 12px;
  --leading-caption: 1.45;
  --tracking-caption: 0.4px;
  --text-micro: 10px;
  --leading-micro: 1.6;

  /* Layout */
  --page-max-width: 1020px;
  --section-gap: 64px;
  --card-padding: 8px;
  --element-gap: 2px;
  --spacing-unit: 4px;

  /* Border Radius */
  --radius-xs: 4px; /* tag, button */
  --radius-sm: 6px; /* tag */
  --radius-md: 8px; /* card, tag */
  --radius-lg: 16px; /* card, button */
  --radius-xl: 24px; /* button */
  --radius-2xl: 64px; /* card */
  --radius-full: 9999px; /* pills */

  /* Shadows */
  --shadow-sm: rgb(0, 0, 0) 0px 0px 2px 0px, rgb(0, 0, 0) 0px 3px 9px 0px;
  --shadow-md: rgb(0, 0, 0) 0px 0px 6px 0px;
  --shadow-lg: rgba(0, 0, 0, 0.4) 0px 2px 4px 0px;

  /* Motion */
  --duration-instant: 1ms;
  --duration-fast: 150ms;
  --duration-base: 350ms;
  --duration-moderate: 500ms;
  --duration-slow: 3000ms;
  --ease-custom-1: ease-in-out;
  --ease-custom-2: cubic-bezier(0.67, 0.00, 0.34, 1.00);
  --ease-custom-3: ease;
  --ease-custom-4: ease-out;
  --ease-custom-5: linear;

  /* Iconography */
  --icon-size: 18px;
}
```

### Tailwind v4

```css
@import "tailwindcss";

@theme {
  /* Colors → bg-*, text-*, border-* */
  --color-bg-canvas: #000000;
  --color-text-primary: #b8b8b8;
  --color-text-secondary: #8c8c8c;
  --color-text-muted: #ffffff;
  --color-accent: #ff9800;
  --color-bg-surface: #1a1a1a;
  --color-border: #464646;
  --color-blue-mid: #5b9cf6;
  --color-cyan-mid: #22ab94;
  --color-red-mid: #f7525f;
  --color-gray-dark: #636363;
  --color-magenta-mid: #ba68c8;

  /* Fonts → font-display, font-body, font-mono */
  --font-display: EuclidCircularSemibold, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, sans-serif;

  /* Type scale → text-display, text-body, … */
  --text-display: 48px;
  --text-display--line-height: 1.08;
  --text-display--letter-spacing: -0.96px;
  --text-display--font-weight: 600;
  --text-heading-xl: 36px;
  --text-heading-xl--line-height: 1.22;
  --text-heading-xl--font-weight: 600;
  --text-heading-lg: 28px;
  --text-heading-lg--line-height: 1.29;
  --text-heading-lg--font-weight: 600;
  --text-body: 16px;
  --text-body--line-height: 1.5;
  --text-body--font-weight: 500;
  --text-small: 14px;
  --text-small--line-height: 1.29;
  --text-caption: 12px;
  --text-caption--line-height: 1.45;
  --text-caption--letter-spacing: 0.4px;
  --text-micro: 10px;
  --text-micro--line-height: 1.6;
  --text-micro--font-weight: 600;

  /* Radius → rounded-* */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 64px;
  --radius-full: 9999px;

  /* Shadows → shadow-* */
  --shadow-sm: rgb(0, 0, 0) 0px 0px 2px 0px, rgb(0, 0, 0) 0px 3px 9px 0px;
  --shadow-md: rgb(0, 0, 0) 0px 0px 6px 0px;
  --shadow-lg: rgba(0, 0, 0, 0.4) 0px 2px 4px 0px;

  /* Easing → ease-* */
  --ease-custom-1: ease-in-out;
  --ease-custom-2: cubic-bezier(0.67, 0.00, 0.34, 1.00);
  --ease-custom-3: ease;
  --ease-custom-4: ease-out;
  --ease-custom-5: linear;

  /* Breakpoints → sm:, md:, lg:, … (measured from the source) */
  --breakpoint-sm: 300px;
  --breakpoint-md: 320px;
  --breakpoint-lg: 329px;
  --breakpoint-xl: 440px;
  --breakpoint-2xl: 480px;
}

/* Durations have no Tailwind namespace — use as duration-(--duration-base) */
:root {
  --duration-instant: 1ms;
  --duration-fast: 150ms;
  --duration-base: 350ms;
  --duration-moderate: 500ms;
  --duration-slow: 3000ms;
}
```

## Rebuild Checklist

Build in this order. Every item carries the measured numbers it needs — nothing here requires going back to the page.

- [ ] Paste the `:root` block from **Design Token System** — 225 custom properties across 21 naming groups. Nothing below should hard-code a value that exists there.
- [ ] Add the dark-theme override block — 40 variables change between light and dark.
- [ ] Set the type scale: 48 / 36 / 28 / 16 / 14 / 12 / 10px over 7 steps, -apple-system + EuclidCircularSemibold.
- [ ] Set the spacing scale: 2 / 4 / 5 / 6 / 7 / 8 / 9 / 12px on a 4px base unit.
- [ ] Set the radius scale: 4px (button), 5px (button), 6px (tag), 8px (button), 16px (button).
- [ ] Define 3 elevation steps, lightest first: `rgb(0, 0, 0) 0px 0px 2px 0px, rgb(0, 0, 0) …`, `rgb(0, 0, 0) 0px 0px 6px 0px`, `rgba(0, 0, 0, 0.4) 0px 2px 4px 0px`.
- [ ] Build the shell: a 1020px max-width centred container with 0px side gutters, bands separated by 64px.
- [ ] Paint the canvas `#000000` and set the body text colour from the palette — this is a dark page.
- [ ] Build the header: 64px tall, `position: sticky; top: 0`.
- [ ] Band 1 — **Content**: 623px tall, `#000000` background, 0px top padding. Headline: "Indeks".
- [ ] Band 2 — **Content**: 823px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Saham Indonesia".
- [ ] Band 3 — **Content**: 3801px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Saham-saham dunia".
- [ ] Band 4 — **Content**: 3184px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Crypto".
- [ ] Band 5 — **Content**: 3331px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Kontrak berjangka dan komoditas".
- [ ] Band 6 — **Content**: 2080px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Forex dan mata uang".
- [ ] Band 7 — **Content**: 1324px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Obligasi Pemerintah".
- [ ] Band 8 — **Content**: 1904px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Obligasi Korporasi".
- [ ] Band 9 — **Content**: 2792px tall, `#000000` background, 1026px container, 0px top padding. Headline: "ETF".
- [ ] Band 10 — **Content**: 2869px tall, `#000000` background, 1026px container, 0px top padding. Headline: "Ekonomi".
- [ ] Band 11 — **Content**: 2289px tall, `#000000` background, 1026px container, 0px top padding.
- [ ] Build the primary button: `#00000000` on `#b8b8b8` text, 0px radius, 0px 0px padding, -apple-system 500 16px — 84 instances on the page.
- [ ] Build the secondary button: 1px solid rgba(0, 0, 0, 0) border, 8px radius, 8px 16px padding, `#b8b8b8` text.
- [ ] Build the card: `#1a1a1a` surface, 64px radius, 0px 0px padding, 1px solid #000000 border, flat — 8 instances.
- [ ] Build the footer: 2 link columns, 993px tall, 8 social icons.
- [ ] Wire hover states in the page's own language — *other* on 8 of 20 archetypes. Copy the deltas from the state matrix; do not invent a lift where the page tints.
- [ ] Wire focus: outline.
- [ ] Wire disabled states on 5 archetypes — copy the exact opacity and cursor from the state matrix rather than graying by eye.
- [ ] Set the transition recipe: instant 1ms, fast 150ms, base 350ms, easing `ease-in-out`.
- [ ] Wire the scroll reveal: `opacity` on opacity over 500ms, fired once by IntersectionObserver.
- [ ] Add the breakpoint ladder: ≥300px / ≥320px / ≤440px / ≤479px / 480–767px / ≥548px / ≥568px / ≥702px / ≤767px / ≥768px / ≥958px / ≤1019px, mobile-first.
- [ ] At mobile widths: drop 1 grid to one column; shift spacing -29%; shift type -12%.
- [ ] Accessibility polish before shipping: 98% of text already clears 4.5:1 — fix the remainder rather than copying it; 271 tap targets sit under 44px — pad them out; alt text covers only 93% of images; there is no skip link — add one.

## Extraction Coverage

What was actually measured, and where the measurement stops. Read this before trusting a number above.

- **Scan:** 10705 elements styled · viewport 1150×687px · elapsed 9511ms.
- **Deep pass:** mode `full`, 40 scroll passes over 40 planned steps of 550px.
- **Page:** 26278px tall (38.3 viewports).
- **Lazy loading:** DOM went 11095 → 12596 nodes (1501 newly revealed elements) — content below the fold only exists after scrolling, so a static fetch would have missed it.
- **Bands sampled:** 12 viewport-height slices — they do not cover the whole page.
- **Stylesheets:** 284 read.
- **States & overlays:** 8 hidden surfaces revealed and measured; 20 component archetypes resolved from 390 indexed pseudo-state rules; 12 live focus probes.
- **Restoration:** verified — every injected style and attribute was removed after measuring.
- **Inventory:** 12 sections · 16 grid containers · 20 stacking layers · 40 images, 1 font faces · 11 copy bands · 225 custom properties · 12 breakpoints analysed.

### Limits reached during the scan

- 224 further stylesheets not indexed (cap 60)
- 52 further hidden overlays not measured (cap 8)
- background-image hunt capped at 1200 elements
- 1 component/width-scoped var blocks skipped
- 91 more light/dark differences not listed
- 11 further width conditions were dropped past the 12-breakpoint cap.
- 4 declared breakpoint values had no capturable declarations (cross-origin or nested stylesheets).

## Known Gaps

- assets: 451 images on the page — inventory sampled the first 400
- assets: background-image hunt capped at 1200 elements
- assets: 284 stylesheets — @font-face harvest read the first 60
