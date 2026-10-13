# Claude Edits — Frontend Revamp

**Date:** 2026-10-13
**Scope:** `client/` only. No server, Prisma, contract or root-config changes.
**Git:** Nothing committed, staged or pushed. All changes are in the working tree for manual review.

---

## 1. Goals

| Request | How it was addressed |
|---|---|
| Premium, "3D-looking" site that fits the project | Custom canvas **TrustGlobe** (particle sphere, orbit rings, custody arcs), CSS-3D **LayerStack** (dual-ledger slabs), pointer-driven **Tilt** cards with glare, holographic 3D credential card |
| Minimalism, but content should feel filled | Editorial serif typography with dense, real project content: real Move function names, API routes, seeded role/permission counts, live block height |
| Every page consistent, with liquid glass | One token-based design system (`index.css` + `tailwind.config.js`). Every page uses the same `glass-card` / `glass-strong` / `liquid-rim` surfaces, `PageHeader`, `Panel`, `Badge` and `Modal` |
| Instrument Serif | Display font for all headlines, numerals, verdicts and editorial accents (italic). Inter for UI, JetBrains Mono for data |
| All display sizes optimised | Mobile-first layouts. Floating glass tab bar under `md`, icon-only nav at `md`, labelled nav at `lg+`. Tables collapse to cards. Modals become bottom sheets on phones. Safe-area insets handled |
| No new dependencies | All 3D is hand-written (canvas 2D projection and CSS transforms). Only already-installed packages are used: `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react`. `package.json` and `package-lock.json` were **not** touched |

---

## 2. Design system

### Tokens: `client/src/index.css`
- Colours are CSS variables stored as RGB channels (`--fg: 243 243 239`) so Tailwind opacity modifiers work (`bg-fg/5`, `border-line/10`).
- Two complete themes:
  - `:root`: light, warm paper `#f7f6f3`
  - `.dark`: deep ink `#06070a`
- Semantic tokens: `canvas`, `surface`, `elevated`, `fg` / `fg-muted` / `fg-subtle`, `line`, `accent` (mint, used sparingly), `ok`, `warn`, `bad`, `info`.
- This replaces the previous mix of hard-coded `slate-*` / `zinc-*` / `emerald-*` classes. Identity, Verify and Admin were previously **dark-only**; they now theme correctly.

### Liquid glass
- `.glass`: translucent gradient fill, `backdrop-filter: blur(22px) saturate(170%)`, inset specular highlight top and bottom, soft shadow.
- `.glass-strong`: higher-opacity variant for nav, modals and menus.
- `.glass-card`: same material **without** blur, used for content cards to keep long pages fast.
- `.liquid-rim`: a masked gradient border that catches light at one corner and picks up the accent at the other.
- Fallbacks: an `@supports not (backdrop-filter)` rule and a `prefers-reduced-transparency` rule both switch glass to solid surfaces for legibility.

### Components and utilities in CSS
- Buttons: `btn-primary`, `btn-accent`, `btn-glass`, `btn-ghost`, `btn-danger`, `btn-icon`, plus `btn-sm` and `btn-lg`. The size modifiers are declared *after* the variants so they win.
- Forms and data: `.input`, `.label`, `.data-table`, `.kv` (key/value rows), `.well` (inset data block), `.skeleton` (shimmer), `.eyebrow`, `.serif-accent`, `.text-shine`.
- Ambient backdrop: drifting aurora blobs, a fading blueprint grid and SVG film grain (`.ambient*`).
- `prefers-reduced-motion` disables animations globally.

### `client/tailwind.config.js`
- Colours map to the CSS tokens.
- Fluid `display-xl/lg/md/sm` font sizes. `display-xl` is clamped by both `vw` and `vh` so the hero fits short laptop screens.
- Easing curves: `silk`, `atelier`.
- Keyframes: `marquee`, `marquee-y`, `shimmer`, `pulse-ring`, `drift`, `travel`, `fade-up`.

### `client/index.html`
- Inline script applies the saved theme **before first paint**, so there is no light/dark flash.
- Added meta description, per-scheme `theme-color` and `viewport-fit=cover` for notched phones.
- Fonts now load once. The duplicate `@import` in CSS was removed.

---

## 3. New files

### `src/lib/`
- `cn.ts`: `clsx` + `tailwind-merge`, extended to know the custom `text-display-*` sizes. Without that, they were dropped when combined with colour classes; that bug was found and fixed during visual QA.
- `format.ts`: `truncateMiddle`, `formatDateTime`, `formatTime`, `formatRelative`, `greeting`.

### `src/hooks/`
- `useBodyScrollLock.ts`: locks page scroll under overlays and compensates for scrollbar width.
- `useFinePointer.ts`: detects mouse/trackpad so 3D tilt is disabled on touch devices.

### `src/components/ui/` (shared primitives)
- `Logo.tsx`: new brand mark, an "A" circled by an orbit. The favicon was updated to match.
- `Badge.tsx`: tone-based badges, plus `StatusBadge` and `ActionBadge`. These replace three duplicated `getStatusBadge` / `getActionBadge` functions.
- `Modal.tsx`: portal-rendered liquid-glass dialog. Escape to close, backdrop click, scroll lock, focus management, `role="dialog"`. On phones it becomes a bottom sheet with a grab handle.
- `PageHeader.tsx`: the consistent editorial header used on every console page.
- `Panel.tsx`: glass card with an optional titled header.
- `Tilt.tsx`: spring-physics 3D tilt with a pointer-following glare. Off on touch and with reduced motion.
- `Reveal.tsx`: fade-up when content scrolls into view.
- `AnimatedNumber.tsx`: count-up figures.
- `CopyButton.tsx`, `JsonView.tsx` (syntax-highlighted JSON rendered as React nodes, no `innerHTML`), `ThemeToggle.tsx`, `AmbientBackground.tsx`.

### `src/components/three/`
- `TrustGlobe.tsx`: dependency-free 3D canvas scene.
  - Fibonacci particle sphere with depth-bucketed draw calls.
  - Two tilted dotted orbit rings with glowing satellites, which are occluded when behind the sphere.
  - Great-circle "custody arcs" with a leading spark and an arrival ping.
  - Pointer parallax.
  - Reads colours from CSS tokens and follows theme changes live.
  - Performance: DPR capped at 2, pauses offscreen (IntersectionObserver) and when the tab is hidden, renders one static frame under reduced motion.
- `LayerStack.tsx`: isometric CSS-3D stack of PostgreSQL, SHA-256 reconciler and Aptos Move VM slabs. Each slab has real edge thickness, glowing packets travel between layers, and the layers spread apart on hover.

### `src/components/layout/`
- `AppShell.tsx`: authenticated shell.
  - Floating top bar that turns to glass on scroll.
  - Primary nav with a framer-motion `layoutId` sliding active pill.
  - System-status pill and theme toggle.
  - Floating glass bottom tab bar on mobile.
  - Slim footer.
- `UserMenu.tsx`: avatar dropdown showing name, email, organization, role badges and sign-out. It replaces the always-visible logout button.
- `nav.ts`: typed tab IDs and the nav item list. Admin appears only for ADMIN and MANAGER, as before.

### `src/components/landing/` (new landing sections)
- `LandingNav.tsx`: floating glass pill that compacts on scroll, plus a full-screen serif mobile menu.
- `HeroSection.tsx`: "Custody you can *prove.*" headline with a staggered mask reveal and the live TrustGlobe. Floating glass proof chips add depth, scroll parallax applies, and a 5-cell telemetry strip shows live block height.
- `StandardsMarquee.tsx`: edge-faded infinite ribbon of the standards used. It is screen-reader friendly.
- `ManifestoSection.tsx`: scroll-linked word-by-word reveal of the manifesto, followed by three tilt pillars.
- `CapabilitiesBento.tsx`: 7-tile bento with live mini-visuals:
  - DID document
  - RBAC coverage bars using the **real seeded counts**: ADMIN 12/12, MANAGER 8/12, AUDITOR 4/12, USER 3/12
  - Lifecycle chips
  - Auto-scrolling audit log
  - Dual-verification Venn
  - Argon2id hash
  - Tenant isolation
- `ArchitectureSection.tsx`: Ingest → Reconcile → Anchor steps beside the LayerStack.
- `LifecycleSection.tsx`: auto-advancing interactive state machine (Draft → Minted → Assigned → Transferred → Revoked). It shows the **real** API route and Move function for each state, e.g. `asset::mint_asset`.
- `VerifierSection.tsx`: "Don't trust us. *Verify.*" wrapper around the live verifier.
- `ClosingCta.tsx`: CTA card with the globe rising as a planet horizon.

---

## 4. Rewritten files (behaviour preserved)

All API endpoints, request bodies, state variables, handlers and permission logic are **unchanged** unless listed under §5.

| File | Visual changes |
|---|---|
| `App.tsx` | Uses `AppShell`; animated page transitions; session splash; route-level code splitting (see §5) |
| `pages/DashboardPage.tsx` | Greeting header; hero card with a large serif asset count, lifecycle distribution bar and embedded globe; tilt metric cards with count-up; quick-action tiles; activity timeline; **new "Latest on-chain transactions" panel** (the API already returned `recentTransactions`, but it was never shown) |
| `pages/IdentityPage.tsx` | Holographic tilting credential card (chip, guilloché rings, DID, holder, issue date); asset/interval stats from `identity.stats` (already in the API, previously unused); syntax-highlighted DID document; "Mine" shortcut in the resolver |
| `pages/AssetsPage.tsx` | Type glyphs, glass data table and mobile cards; lifecycle buttons deduplicated into one render function; visual type picker in the Create modal; warning before revoke; timeline-style ownership history |
| `pages/VerifyPage.tsx` | Pill search bar; rotating verdict seal (SVG text on a path); integrity progress meter; three-step explainer instead of a blank empty state; timeline custody chain |
| `pages/AuditPage.tsx` | Glass filter bar with a "Clear" action; relative and absolute timestamps; clickable rows; inspect modal with highlighted metadata JSON and copyable IDs |
| `pages/AdminPortalPage.tsx` | Segmented control with a sliding indicator; user stats row; role chips with inline revoke; role cards; categorised permission lists; **role assignment moved from an inline panel into a modal with a radio list** |
| `pages/LandingPage.tsx` | Composes the new sections; manifesto and auth now use `Modal` |
| `components/AuthModal.tsx` | Serif header, sliding Sign in / Create account control, animated register fields, icon inputs, `autocomplete` attributes, demo-account chips (same seeded credentials) |
| `components/InteractiveVerifierPreview.tsx` | Restyled terminal card; presets now point to **real seed data** (`#1`, "Enterprise Security Master Certificate", `#101`) |
| `components/landing/Footer.tsx` | Link columns, standards chips, live block-height capsule, oversized fading wordmark |
| `components/EmptyState.tsx`, `LoadingSkeleton.tsx`, `StatusAlert.tsx` | Token-based restyle; exported names and props unchanged |

---

## 5. Behaviour changes (intentional, please review)

1. **URL hash routing for console tabs.** The active tab is mirrored to `#/assets`, `#/audit` and so on, so refresh and browser back/forward now work. Unknown hashes and admin hashes for non-admins fall back to Overview. On logout the hash is cleared.
2. **Code splitting.** Pages load with `React.lazy`. The main bundle went from 506 kB to 328 kB (107 kB gzip), which clears Vite's 500 kB warning.
3. **Dashboard quick action.** "Access & RBAC" is shown only to admins and managers; others see "My identity". Previously non-admins got a button to a tab they couldn't see.
4. **Asset filters.** Client-side status chips with counts, plus search by name, #number, type or DID. No API change.
5. **Asset history modal.** Clears the previous asset's records and shows a loading state. Previously it briefly showed the wrong asset's history.
6. **Removed fabricated / misleading data:**
   - The landing verifier used to **invent a "VERIFIED" result** whenever the API was unreachable. It now shows an honest "verifier is offline" state.
   - The dashboard's hard-coded fallback block height `867,935,066` and the always-"100%" *State Parity* card were removed. The card now shows the real `blockchain.totalTransactions`.
   - The landing's default block height `859,420,119` now reads "Syncing…" until the API answers.
   - The footer's static "99.99% Parity" claim was removed.
7. **Removed the footer newsletter form.** It showed "Subscription confirmed" without sending anything, because no endpoint exists. It can be restored once a backend endpoint exists.
8. **Removed the hero background video.** It was an externally hosted CloudFront MP4; the self-contained 3D globe replaces it.

---

## 6. Deleted files

These were replaced by the new landing sections and nothing imports them (verified by a clean `tsc`):
- `client/src/components/landing/AboutSection.tsx` → `ManifestoSection.tsx`
- `client/src/components/landing/FeaturedVideoSection.tsx` → `ArchitectureSection.tsx`
- `client/src/components/landing/PhilosophySection.tsx` → merged into Manifesto and Architecture
- `client/src/components/landing/ServicesSection.tsx` → `CapabilitiesBento.tsx`

**Left in place (unused before this revamp, awaiting your decision):**
- `client/src/components/Card3D.tsx`: superseded by `ui/Tilt.tsx`
- `client/src/components/NetworkMesh.tsx`: superseded by `three/TrustGlobe.tsx`
- `client/src/lib/api.ts`: axios client that nothing imports (axios is also not listed in `client/package.json`)

---

## 7. Verification

- `npx tsc --noEmit` in `client/`: **passes** (exit 0).
- `vite build`: **passes**. The build was written to a scratch directory, so `client/dist` was not touched.
- **Visual QA:** headless Firefox screenshots of every page at 1440×900 and 390×844, in dark and light themes, with the auth and create-asset modals opened.
  - Console pages were rendered against a local fixture API in a temp directory, so **the real backend and database were not called** and no audit rows were written.
  - Issues found and fixed during QA:
    - hero overflowing 900px-tall screens
    - oversized gaps between sections
    - two bare bento tiles
    - closing-CTA globe scale
    - `tailwind-merge` dropping the display sizes
    - `btn-sm` / `btn-lg` being overridden
    - translucent modals without backdrop blur
- **Not verified:**
  - Real-device Safari/iOS rendering (no device available)
  - Live data from your backend
  - `npm run lint`: `client/` has no ESLint 9 config (`eslint.config.js`), so the lint script cannot run there. This was the case before this change.

---

## 8. Follow-ups worth considering

- Delete the three unused files in §6 (needs your approval).
- Add an `eslint.config.js` for the client so `npm run lint` works.
- If you later want a true WebGL scene (shaders, bloom), `three` / `@react-three/fiber` would be the next step. That means a new dependency, so it was intentionally not added.

---
---

# Revision 2: Full Visual Overhaul

**Date:** 2026-10-13 (same day, second pass)
**Trigger:** Feedback on revision 1:
- "doesn't look premium / looks vibecoded"
- "don't like the gradient background"
- "liquid glass is too much"
- "3D isn't proper across the landing page"
- "pages aren't end to end on desktop"
- "make animations smoother, faster, 60fps"

**Approved by the user before starting:**
- Install `three` and `lenis`.
- "Monochrome editorial" direction.

**Git:** nothing committed, staged or pushed.

> Revision 2 **supersedes most of revision 1's visual layer**: tokens, glass system, ambient background, canvas globe, LayerStack, floating nav, Tilt cards. Revision 1's behavioural changes (§5 above) still stand: hash routing, code splitting, honest verifier offline state, removed fabricated metrics.

## R2.1 Dependencies (approved)

| Package | Version | Why |
|---|---|---|
| `three` | ^0.186.1 | Real GPU-rendered WebGL scene across the landing page |
| `lenis` | ^1.3.26 | Inertial smooth scrolling (marketing site only) |
| `@types/three` (dev) | ^0.186.0 | Types |

- Installed with `npm install three lenis -w client` and `npm install -D @types/three -w client`.
- This changed `client/package.json` and `package-lock.json`. Your existing root `package.json` edits were untouched.
- Backups of both manifests were taken first.
- Verified afterwards that the server's native `argon2` still hashes correctly.
- Not installed: `@react-three/fiber`. Plain three.js is lighter and gives full control of the render loop.

## R2.2 New visual language: monochrome editorial

- **Removed entirely:**
  - aurora gradient background, film grain and blueprint grid
  - liquid-glass surfaces (`glass*`, `liquid-rim`)
  - Tilt cards
  - the "Word, *italic word.*" heading formula
  - uppercase tracked "eyebrow" labels
  - icon-in-a-box card headers
  - 24–40px rounded cards
  - pill-shaped chips everywhere
- **Palette:**
  - Near-black `#0A0A0A` / off-white `#FAFAFA`, with three greys for text hierarchy and hairline borders (`line/8%–14%`).
  - **One accent**, signal orange (`#FF5B1F` dark / `#E8470F` light). It is reserved for *live / current* state only: live dot, active nav item, current custody interval, active lifecycle stage, and about 2% of particles.
- **Type:**
  - **Geist** (UI) and **Geist Mono** (data and labels) replace Inter / JetBrains Mono.
  - **Instrument Serif** for all display type, from page titles up to `display-2xl` hero (`clamp(4.75rem, min(11vw,19vh), 13rem)`).
- **Shape:** 8px buttons and inputs, 12px cards, 6px badges. Hairline grids instead of floating cards on the landing page.
- **Glass:** survives only as a subtle `backdrop-blur-md` on the sticky nav bars. Modals and menus are solid surfaces.
- **Motion:** only `transform` / `opacity` (plus colour) transitions, 150–300ms, `cubic-bezier(0.16,1,0.3,1)`.
  - Page transitions dropped the expensive `filter: blur()`: now 200ms opacity plus a 6px slide.
  - Spring animations were replaced with short tweens.

## R2.3 Full-bleed layout ("end to end")

- A `--gutter` token (16 / 24 / 32px) and a `.gutter` class replace every centred `max-w-7xl mx-auto` container.
- **Landing:** every section spans the viewport. Grids are drawn with full-width hairlines, plus `SectionLabel` rows such as `(02) … Architecture`.
- **Console:** a new **full-height sidebar layout** (`AppShell`):
  - 248px sidebar with logo, organization, nav (sliding active highlight) and the user with sign-out
  - a sticky top bar showing the breadcrumb (`Org / Page`), system status and theme toggle
  - content running edge to edge to the right edge
  - below `lg`, a compact top bar plus a bottom tab bar

## R2.4 The 3D: `components/three/ParticleField.tsx`

- **One WebGL `THREE.Points` object** (16k particles desktop, 9k mobile) fixed behind the entire landing page, in **a single draw call**.
- **Scroll-driven morphing between four shapes**, each matched to its section:

  | Section | Shape | Meaning |
  |---|---|---|
  | Hero, Manifesto, CTA | ringed sphere | network / identity |
  | Architecture | three stacked plates | PostgreSQL · reconciler · Aptos |
  | Lifecycle | double helix with rungs | chain of custody |
  | Platform | 3×3×3 lattice | structure |

- Sections steer the object declaratively with `data-scene`, `data-x`, `data-y`, `data-scale`, `data-opacity`, `data-mobile-opacity` and `data-rx`.
- **Morphing runs entirely in the vertex shader.** It is staggered per particle, with a mid-flight "dissolve and reform" lift and an idle shimmer. The CPU updates only a few uniforms per frame.
- **Timing:** a shape holds for its whole section and finishes forming as the next section enters the lower third of the screen.
- Frame-rate-independent damping (`1 - exp(-dt·k)`) for scroll, pointer parallax and placement.
- **Performance and robustness:**
  - DPR capped at 1.75, no MSAA (unneeded for points)
  - pauses when the tab is hidden
  - graceful no-op without WebGL
  - reduced-motion users get a still object that only follows scroll
  - follows the light/dark theme live (additive blending in dark, normal in light)
- **Lazy-loaded** after first paint. The landing chunk dropped to 48 kB; three.js sits in its own 524 kB (134 kB gzip) deferred chunk.
  - `vite.config.ts`: `build.chunkSizeWarningLimit` raised to 600, with a comment explaining this chunk.

## R2.5 Smooth scroll: `lib/smoothScroll.ts`

- A Lenis singleton (`autoRaf`, exponential easing), created only on the landing page and destroyed on leaving it.
- Touch devices keep native scrolling. Reduced-motion users never get an instance.
- `scrollToId` / `scrollToTop` go through Lenis when it is active.
- `useBodyScrollLock` now also stops and starts Lenis. Modal bodies are marked `data-lenis-prevent`.

## R2.6 Landing page, rebuilt

| Section | Notes |
|---|---|
| `LandingNav` | Full-width bar, transparent until scroll, link underline animation, solid full-screen mobile menu |
| `HeroSection` | Huge bottom-left serif headline with a line-mask reveal (descender clipping fixed); bottom rail with copy, CTAs and live facts (network, ledger height, standard) |
| `PrimitivesStrip` (new) | Identity / Access / Custody / Audit as a 4-column hairline grid |
| `ManifestoSection` | Monochrome scroll-linked word reveal |
| `ArchitectureSection` | Ingest / Reconcile / Anchor beside the plate stack |
| `LifecycleSection` | 5 states; the row nearest the viewport centre activates (IntersectionObserver); real API routes and Move functions |
| `CapabilitiesSection` (replaces CapabilitiesBento) | 6-cell full-bleed grid |
| `VerifierSection` | 4/8 split with the live verifier |
| `ClosingCta` | "Start proving what you hold." over the sphere |
| `Footer` | Hairline columns and a full-width serif wordmark |

- Deleted: `StandardsMarquee.tsx` and `CapabilitiesBento.tsx`.

## R2.7 Console pages

- **Overview (Dashboard):** decorative globe card replaced by a data-dense layout:
  - KPI strip (assets, identities, ledger height, on-chain transactions)
  - lifecycle distribution bar
  - recent-operations table
  - Shortcuts, Latest transactions and Consensus node panels
- **Page titles** are now plain: Overview, Identity, Assets, Verify, Audit log, Access control.
- **Identity:** the rainbow holographic card was replaced by a **monochrome passport-style data page** with a dot grid, seal watermark and machine-readable zone, plus a slight 3D lean that straightens on hover.
- **Assets:** row actions are no longer tinted green/blue/orange/red. Mint is primary, Assign/Transfer are secondary, Revoke is quiet red text.
- **Verify, Audit, Admin:**
  - accent removed from DIDs, hashes and badges
  - segmented controls use the 6px system
  - the role-assignment radio list uses neutral selection
- **Scroll-reveal animations removed from console pages** so content appears immediately.
- **Shared components restyled:** `Modal` (solid, 280ms tween), `Badge` (hairline, square dot), `PageHeader`, `Panel`, `EmptyState`, `StatusAlert`, `LoadingSkeleton`, `AuthModal`, `InteractiveVerifierPreview`, `JsonView` (monochrome highlighting).

## R2.8 Files

- **New:** `components/three/ParticleField.tsx`, `lib/smoothScroll.ts`, `components/landing/SectionLabel.tsx`, `components/landing/PrimitivesStrip.tsx`, `components/landing/CapabilitiesSection.tsx`.
- **Deleted (all created in revision 1):** `ui/Tilt.tsx`, `ui/AmbientBackground.tsx`, `three/TrustGlobe.tsx`, `three/LayerStack.tsx`, `hooks/useFinePointer.ts`, `landing/StandardsMarquee.tsx`, `landing/CapabilitiesBento.tsx`.
- **Rewritten or restyled:** `index.html`, `public/favicon.svg`, `tailwind.config.js`, `vite.config.ts`, `src/index.css`, `App.tsx`, `lib/cn.ts`, `hooks/useBodyScrollLock.ts`, every file in `components/ui/`, `components/layout/*`, every file in `components/landing/`, every page, `AuthModal`, `InteractiveVerifierPreview`, `EmptyState`, `StatusAlert`, `LoadingSkeleton`.

## R2.9 Verification

- `npx tsc --noEmit`: **exit 0**. `vite build`: **passes with no warnings**. The build was written to a scratch directory, so `client/dist` was not touched.
- **Visual QA** with headless Firefox at 1440×900 and 390×844, dark and light, using fixture API data (your backend and database were never called):
  - Landing: every section, including the WebGL morph states (sphere, plates, helix, lattice, CTA sphere)
  - All six console pages
  - Auth and create-asset modals
- **WebGL in the harness:** headless Firefox can't screenshot a WebGL canvas directly. The scratch-only harness forced `preserveDrawingBuffer` and snapshotted the canvas to an image. No test hooks were added to project code.
- Issues found and fixed during QA:
  - oversized, "snowy" particles
  - morph timing (shape was mid-dissolve while its section was being read)
  - descender clipping in the hero
  - accent overuse
  - rainbow action buttons
  - mobile text legibility over the 3D (added `data-mobile-opacity`)
  - truncated KPI on mobile
- **Not verified:** real-GPU frame timing (I can't measure fps headlessly; the design keeps per-frame CPU work to a few uniform writes and a single draw call), Safari/iOS on a real device, and live backend data.
