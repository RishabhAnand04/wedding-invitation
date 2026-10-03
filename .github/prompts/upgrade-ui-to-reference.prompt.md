---
description: 'Session 2: make the wedding invitation look like the SitesPlaced "Royal Mandap" reference using the new painted assets in src/assets'
agent: agent
---

# Upgrade the invitation UI to match the reference

You are continuing an existing, working project. **Read [the session 1 build notes](../../docs/session-1-build-notes.md) first.** They cover the architecture, file map, motion details, tokens, testing and gotchas. Don't rebuild from scratch. Upgrade the existing Vite + vanilla JS + GSAP site.

- Reference site: <https://demo-wedding-royal.sitesplaced.com/>
- Reference layout values (local only, gitignored, never commit): [royal-dom.html](../../.playwright-mcp/royal-dom.html) (overlay and hero, first ~200 lines) and [royal-dom-rest.html](../../.playwright-mcp/royal-dom-rest.html) (celebrations → footer). Full-page capture: `.playwright-mcp/royal-full.png`.
- New painted assets: `src/assets/*.webp` (inventory, sizes and intended uses are in the build notes).

## Goal

When the reference and our site are viewed side by side at 390×844 and 1440×900, they should look and move alike (same art style, layering, textures, ornaments and ambient motion) while keeping our deliberate differences:

- **4 events**, in this order: Mehendi → Haldi → Engagement → Wedding. Order and count come from `src/content.js`.
- **No RSVP** section, form, or mention anywhere.
- Each event card has a dress-colour line and an **"Open in Google Maps"** link (`target="_blank" rel="noopener"`).
- The footer shows our families line and contacts. Never show "Crafted with SitesPlaced".
- Keep the optional sections (Story, Gallery, Things to Know, Music) behind their `enabled` flags, plus the Venues list.
- Keep `noindex,nofollow`, reduced-motion support, focus management, `lang="hi"` on Devanagari, and WCAG AA contrast (keep the darkened `--ink-muted` and `--gold-deep` unless contrast still passes with the reference values).
- All content stays in `src/content.js`.

## Step 0: confirm the right to use the assets (ask before anything else)

The new files have the same names as the reference's `/templates/wedding-royal/*.webp`. Use `vscode_askQuestions` to ask the user which applies:

1. **Licensed or own art** (bought from SitesPlaced, written permission, or the user created or generated it). Integrate the files, commit them and deploy normally.
2. **Not confirmed.** Integrate the files for **local preview only**:
   - Add the WebP art to `.gitignore`.
   - Make the art loader fall back to the committed SVG placeholders when a WebP is missing, so CI still builds (see Step 2).
   - Don't commit, push or deploy the WebP files. Tell the user the deployed site keeps placeholders until they supply licensed or original art (the style prompt in the original brief can be used to generate it).

Don't skip this step and don't decide it yourself.

## Step 1: baseline and diff list

Use the Playwright browser tools:

1. Capture the reference and our site (`npm run dev`, open <http://localhost:5173/wedding-invitation/>) at **390×844** and **1440×900**. For each, capture: the overlay; the hero after opening; families; the celebrations stage at scene 1 and during a crossfade; things to know; the countdown; the footer.
2. Save captures to `.playwright-mcp/` only. Writing to `public/` reloads the dev server. Take each screenshot twice, because the first can be a stale frame.
3. Write a short, concrete diff list per section (art, spacing, sizes, layering, motion). Work through it below and re-check at the end.

## Step 2: asset pipeline

- Move the painted art into one place (suggested: `src/assets/art/`, keeping `paper.svg` and `damask.svg` where the CSS can still resolve them). Keep the SVG placeholders as the fallback.
- Replace the hard-coded `art()` lookup in `src/art.js` with a **build-time** resolver, for example:
  `import.meta.glob('./assets/art/*.{webp,svg}', { eager: true, query: '?url', import: 'default' })`.
  Prefer `name.webp`, fall back to `name.svg`. URLs must still honour Vite's `base`.
- Keep the **preloads** for the hero backdrop and the first scene. The `invitationHead()` plugin in `vite.config.js` currently builds `/art/...` URLs. Update it to match the new pipeline: either keep preload-critical images in `public/art/` with stable names, or emit preloads from the bundle in `generateBundle`/`transformIndexHtml`. Verify the hrefs in `dist/index.html`.
- Name mapping: `plate` replaces `thali`. Scene keys come from `events[].art` in `content.js`. Proposed defaults: Mehendi → `scene-mehndi`, Haldi → `scene-haldi`, Engagement → `scene-reception`, Wedding → `scene-mandap`. **Ask the user** whether Engagement should use `scene-reception` (couple in a palace hall) or `scene-sangeet` (night dance).
- **Use one hero image for every screen size (user decision).** `hero-backdrop.webp` is used on both phone and desktop:
  - Replace the `<picture>` in `hero()` (`src/render.js`) with a single `<img>`.
  - Drop the `hero-portrait` preload in `vite.config.js` and preload the backdrop without a `media` query.
  - Delete `public/art/hero-portrait.svg`.
  - Tune `object-position` (and the `inset:-12% 0 0` overscan if needed) so the central gate, pool and elephants frame well at 360–430px wide.
- **Textures:** `paper.webp` (560×560) and `damask.webp` (640×640) replace `paper.svg` and `damask.svg`. They are used in `.paper-tile` (560px, multiply, .5), `.damask-tile` (420px, multiply, .4) and `.event-card` (paper at 380px, multiply), as in the reference. Delete the SVG versions only if the licence gate in Step 0 allows committing the WebP files; otherwise keep the SVGs as the CI fallback.
- The scenes are **1080×717 (3:2)**, not 16:9. Check cover-cropping on phones (the card covers the lower half), and set a per-scene `object-position` in config if needed (for example `artPosition: '50% 35%'`).
- Images are 1080px wide, which is soft on large desktops. Don't upscale. Note it for the user, and use larger source files later if they become available.
- Still missing (keep the SVG placeholders, and ask whether the user has them): `vine-sprig`, `lotus-cluster`, `elephant` (reference `elephant-walk`), `peacock` (reference `peacock-side`), `skyline`.

## Step 3: UI parity, section by section

Use the exact values in the reference DOM files. Main items:

- **Ambient:** use `sun-medallion.webp`, `cloud-a/b.webp` and `marigold-strand.webp`. Match the reference sizes and positions: sun at `top:4%; right:7%; width:clamp(64px,9vw,120px); opacity:.5`; clouds at `12%/-2%` and `58%/-3%`; strands at `2.5%` (md+) and `right:3%`.
- **Overlay:** `plate.webp` at `clamp(120px,30vw,168px)` with `drop-shadow(0 14px 28px rgba(60,34,8,.3))`, and `ganesh-medallion.webp` at `inset:24%`. Remove our translucent card background (the reference card has none) **only if** text contrast still passes over the strands and damask. Use the corner size `clamp(54px,10vw,88px)` at an 8px inset.
- **Hero:** use `hero-backdrop.webp`, `hero-couple.webp` (the reference image width/height is 840×1260; ours is 640×964, so update the attributes) and `hero-foreground.webp` (**toran**, top, `max-height:32svh`, cover, `object-position:top`, z 30). Petals use `petal.webp` at 28px. Re-check overlap between the text panel and the couple at 1440×900 and 390×844, and adjust the panel's top padding or the couple's size only as far as the reference does.
- **Frames:** `corner-ornament.webp` for all corners (110px intrinsic, mirrored with scale transforms). Check how it looks on the 36px event-card corners and the card padding.
- **Celebrations:** paintings with the reference's gradient overlay. The paper-textured card stays. Match the reference card's border, outline, shadow and padding; read its truncated inline style from the live DOM with `browser_evaluate` if needed.
- **Floaters:** `parrots.webp` everywhere the reference uses it (families, gallery, venues/countdown area, footer), and clouds in the details/countdown sections. Keep the SVG elephant, peacock, vine and lotus until real art exists.
- **Gallery (optional):** the reference fills its arch frames with the scene paintings. Ask the user whether to enable "Captured Moments" with `scene-sangeet`, `scene-mehndi`, `scene-mandap` and `scene-reception` and short captions.
- **OG image:** after the visuals are final, regenerate `public/og.jpg` (1200×630 shot of the overlay). Capture to `.playwright-mcp/` and then copy it into `public/`.

## Step 4: motion parity

Inspect the live reference with Playwright to find inline transform values that change over time (`browser_evaluate` sampling `style.transform` every 250 ms on `[data-ambient-sun]`, `[data-ambient-cloud]`, `[data-hanging-strand]` and the floater wrappers). Then match:

- Sun: slow rotation **plus** a scale breath (around 1 ↔ 1.06).
- Clouds: horizontal drift; section clouds also get scroll parallax (`yPercent` around 6 on their wrapper).
- Strands: GSAP sway close to the reference amplitude and period.
- Parrots: a flight-like drift (x around ±24px with a slight rotate).
- Hero layers, the celebrations pin and crossfade, and reveals: compare timing and easing with the reference and tune them. Keep transform/opacity-only animation and the `focusin` scene handling.
- With reduced motion, all of this stays off.

## Step 5: verify (required before you report done)

- Side-by-side Playwright captures again (same viewports and sections as Step 1). Summarise the remaining differences.
- 360×640, 390×844 and 1440×900: no horizontal overflow, no broken images (`naturalWidth === 0`), no console errors.
- Reduced motion (`browser_emulate_media`): static cards, no petals or pin, instant open.
- Keyboard: Tab → Enter opens; focus lands on `#hero-title`; tabbing into a hidden scene's map link scrolls to it.
- `npm run build && npm run preview`: check the asset URLs in `dist/` include `/wedding-invitation/`, the preloads resolve, and file sizes are reasonable (aim for 300 KB or less per image).
- If Step 0 was "not confirmed": run `git status` and confirm no `.webp` art is staged, and confirm a clean CI-style build works without the WebP files (temporarily move them out of the folder, build, then put them back).

## Step 6: finish

- Commit locally with a clear message. **Ask before pushing.** The remote is `https://RishabhAnand04@github.com/RishabhAnand04/wedding-invitation.git` (the `gh` CLI is signed in as a different, work account).
- Remind the user that Pages must be enabled (**Settings → Pages → Source: GitHub Actions**) if it still isn't. Check with `gh api repos/RishabhAnand04/wedding-invitation/pages`.
- Add a "Session 2" section to `docs/session-1-build-notes.md`, or create `docs/session-2-notes.md`, covering what changed, the asset decisions and what's left.
