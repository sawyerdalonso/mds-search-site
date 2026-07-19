# SYNC.md — Shared Coordination File

**Purpose:** This file is the shared working memory for two AI agents collaborating on the MDS Search website: **Claude Code** (Anthropic) and **GPT 5.6 Sol** (OpenAI). Both agents read this file *before every action* and update it *after every meaningful action or decision*, so neither one acts on stale context.

---

## Collaboration Protocol (both agents follow this)

1. **Read this entire file before taking any action.** Assume the other agent may have changed the repo or the plan since you last looked.
2. **After any meaningful action or decision, append an entry to the Activity Log** (bottom of this file) with: timestamp, which agent, what you did/decided, and any files touched.
3. **Never silently override the other agent's work.** If you disagree with something the other agent did, do NOT just revert it — write a note in the "Open Questions / Handoffs" section explaining the concern and, when it affects direction, defer to the user.
4. **Keep the "Current State of the Repo" section accurate.** If you change hosting facts, form wiring, or the video pipeline, update that section.
5. **The user (Sawyer) is the decision-maker.** Neither agent changes a locked decision (see below) without the user's explicit say-so. If new information contradicts a locked decision, flag it in "Open Questions / Handoffs" rather than acting on it.
6. **Do not commit or push** unless the user has asked for it in the current session. Note pending commits in the Activity Log.
7. **Attribute clearly.** Every log entry names the agent so the user can trace who did what.

---

## Project Overview

- **Site:** MDS Search — marketing website for an independent executive-search recruiter (company "MDSSearch").
- **Repo:** `/home/sawye/projects/mds-search-site` — GitHub remote `https://github.com/sawyerdalonso/mds-search-site.git`.
- **Stack:** Static HTML/CSS/JS. **No build step, no framework, no package manager.** Files served directly.
- **Pages (10):** `index.html`, `about.html`, `expertise.html`, `clients.html`, `candidates.html`, `jobs.html`, `contact.html`, `privacy.html`, `404.html`, `thank-you.html`.
- **Styling:** single stylesheet `assets/css/styles.css` (~304 lines). CSS custom properties at `:root`. Bootstrap 5.3.3 loaded via CDN and overridden by this stylesheet.
- **JS:** single IIFE `assets/js/main.js` — navbar scroll effect, active-nav highlighting via `data-page`/`data-nav`, dynamic year, reduced-motion-aware lazy hero loading, autoplay attempt, and clean fallback handling.
- **Shared chrome:** navbar and footer are **duplicated inline in every page** (no templating). Editing them means editing all 10 files.
- **CDN deps:** Bootstrap 5.3.3, Bootstrap Icons 1.11.3, Inter font (Google Fonts). AOS was removed because fast scrolling could leave content hidden.

---

## Current State of the Repo / Hosting (VERIFIED FACTS)

These were confirmed live, not assumed:

- **Hosting is Netlify.** GitHub `main` auto-deploys to Netlify. Live responses carry `x-nf-request-id` and `cache-status: "Netlify Edge"` headers — Netlify's signature.
- **Cloudflare is only DNS/proxy in front** of Netlify (its `server: cloudflare` / `cf-ray` headers sit on top of Netlify's). Cloudflare does NOT host or build the site.
- **The live site serves the latest GitHub commit** `9f11fe1` (verified: live pages contain the `preload="metadata"` video attr, the `prefers-reduced-motion` CSS block, and `logo-white.png` — all unique to that commit). So the GitHub → Netlify pipeline is working.
- **Apex → www:** `https://mdssearch.com` 301-redirects to `https://www.mdssearch.com`. Canonical host is therefore **`https://www.mdssearch.com`**.
- **Netlify Forms are live and working.** Two forms:
  - `contact.html` — form `name="contact"` (fields: name, email, type, company, message).
  - `candidates.html` — form `name="candidate-intake"` (fields: name, email, location, profile_link, role_interests, industries, notes).
  - Netlify strips the `data-netlify` attribute at deploy time (confirmed on the live `/contact` page), proving Netlify Forms processing is active. **Keep these forms as-is; do NOT switch form providers.**
  - Both forms now use `action="/thank-you"` in the working tree; `_redirects` maps that clean route to the branded, noindexed `thank-you.html` page.
- **The currently deployed `assets/video/hero.mp4` is still 51 MB** until this working tree is approved and deployed. The working-tree poster is `assets/img/hero-fallback.jpg` (115 KB).
- **Hero video is now optimized and cleanly cropped in the working tree:** 5,772,845 bytes (down 88.7% from 51,021,020), 22 seconds, 1920×1010 H.264 High profile at 30 fps, no audio, and faststart metadata before the media payload. The source's 70 px bottom black strip is removed from both the video and poster. The initial uncropped compression measured SSIM 0.990990 against the original; representative frames were visually near-identical.
- **ffmpeg is NOT installed locally** (WSL2). `node`/`npx` and `python3` are available. No sudo assumed.
- **Local dev:** `npm start` / `npx serve -p 3000 .` supports clean routes. Python's simple server can preview direct `.html` paths but does not reproduce clean-route rewrites.

---

## LOCKED DECISIONS (made with the user — do not change without user sign-off)

1. **Stay on Netlify.** Do not migrate to Cloudflare Pages. Keep GitHub → Netlify auto-deploy and Netlify Forms. (Cloudflare remains DNS-only in front.)
2. **Keep the existing forms / Netlify Forms.** No Web3Forms, no Formspree, no Pages Functions. (A branded thank-you page IS wanted — see Scope.)
3. **Restore the moving hero background by compressing the video** (target ~4–8 MB, ~1080p, H.264, no audio, faststart). Same look, far lighter.
4. **Respect `prefers-reduced-motion`** — visitors with the OS "Reduce motion" setting see the polished still image; everyone else sees the video. But implement it *cleanly* (current code does `display:none` bluntly). NOTE: the user's own machine may have reduce-motion enabled, which likely explains why *they* see no movement — we should show them how to check/toggle it.
5. **Design aesthetic = deliberately NO gradients.** The owner removed all gradients in commit `9f11fe1` specifically to kill the "AI-generated feel." All polish must honor this: solid colors, restrained shadows, real photography/iconography. **Forbidden:** gradients (except the two existing hero readability scrims), glassmorphism, purple/neon glows, emoji as icons, generic "AI-slop" styling. Goal: **professional, human, trustworthy — must not look AI-made.**
6. **The market-facing redesign is recruiter-approved and live.** Keep its client-first hierarchy, visual system, founder positioning and rebuilt Home/Clients/Expertise/About/Contact pages.
7. **Site must scale and look perfect on every device** (phones, tablets, desktop).
8. **Use extensionless public URLs sitewide** (`/about`, `/contact`, etc.), including internal links, canonicals, and sitemap entries.
9. **Attempt hero autoplay on mobile, then fall back cleanly to the still image on rejection/error.** Reduced-motion visitors still receive the still without attempting playback.
10. **Use the transparent logo consistently, with an intentional solid/background treatment or other restrained adjustment where required for contrast.** Do not silently alter the underlying brand mark.
11. **Protect recruiter-approved architecture and positioning.** GPT may propose polish, improvements, and larger overhauls, but must disclose planned changes; substantive information-architecture, brand, or positioning changes require a reviewable proposal/preview before implementation.
12. **GPT owns the complete workstream for now** because the user has lost access to Fable/Claude. Avoid a cross-agent task split until the user says otherwise.
13. **Use “Start a search” for client conversion CTAs.** It intentionally routes to the Contact page, where visitors can call, email, or send the Netlify contact form; no scheduling service is currently required.
14. **Legal-copy cleanup is authorized but reviewable.** GPT may improve the privacy and EEO wording, but must report the exact changes so the recruiter can approve them.
15. **Public Accounting is a current practice area.** Include Tax, Assurance & Advisory for public accounting firms between Finance and Operations where functional practices are listed.
16. **Founder headshot is integrated:** the optimized site asset is `assets/img/team/howard-braithwaite.jpg`; the locally preserved `assets/img/team/howard-braithwaite-original.png` source is ignored and must not be committed.
17. **Founder portrait treatment is framed and restrained.** Keep the approved headshot smaller than the surrounding navy panel, inside its light matte/frame with intentional negative space; do not return to the earlier full-bleed treatment without recruiter approval.

---

## FOUNDATION PASS CHECKLIST (resolved in the working tree)

The items below describe the pre-pass defects retained for traceability. They were implemented, validated and deployed to production in July 2026.

**Hero / video:**
- Hero "no longer moves" — root cause is the new `prefers-reduced-motion → .hero video{display:none}` block (`styles.css:139-141`, added in `9f11fe1`) combined with the 51 MB file + `preload="metadata"` delaying/missing the `canplay` event that triggers the fade-in.
- **On mobile the video does not play and an ugly centered play button appears** (iOS blocked-autoplay symptom). Must be fixed so mobile cleanly shows the still poster with no play-button overlay.
- CSS/JS selector mismatch: JS targets `.hero-video` (class), CSS targets `.hero video` (element). Works today but fragile — unify.

**Responsive / CSS polish:**
- `styles.css:154` `.hero-title{white-space:nowrap}` overflows horizontally at ~992–1200px widths.
- `styles.css:296-303` overlapping/contradictory `.job-embed` media queries (max-992 88vh, max-576 92vh, 768–1199.98 92vh) — rationalize.
- `styles.css:177` leftover `filter:none` and duplicated `box-shadow` on `.btn-primary:hover` — dead code from gradient removal.
- Full device-width audit needed: 360 / 390 / 768 / 992 / 1200 / 1440 px on every page.

**Consistency:**
- `index.html:48` navbar logo uses `logo-white.png` with **no width/height**; all 8 other pages use `logo-transparent.png` at `38x38`. Unify deliberately (pick the one that looks right, add dimensions to prevent layout shift).

**SEO / meta (all 9 pages):**
- No `<link rel="canonical">` anywhere → add, using `https://www.mdssearch.com` host.
- No `twitter:image`; no `apple-touch-icon` (note: `assets/img/favicon.png` is currently unused — candidate to repurpose).
- `sitemap.xml` lists `.html` URLs while `_redirects` maps clean URLs — make consistent.
- Decide whether to convert internal links to extensionless (Netlify `_redirects` already maps clean URLs) — recommend + justify.

**Forms UX:**
- No branded success page — Netlify shows its generic off-brand success screen. Add a branded `thank-you.html` matching site chrome, wire both forms' `action` to it, add `_redirects` entry, `noindex` it.

**Docs:**
- `CLAUDE.md` / `README.md` say "deployed on Netlify" (still true) but should document the **Cloudflare-DNS-in-front** reality and the **video encode instructions**.

---

## DELIVERABLE: "Proposed Upgrades" list (resolved through approved redesign)
The approved redesign delivered the visual, positioning and founder-photography upgrades. Testimonials, client logos, placement statistics and case studies remain future options only when genuine source material is available and recruiter-approved.

---

## Open Questions / Handoffs
_(Agents: put anything you need the other agent or the user to resolve here.)_

- **[Resolved]** The interrupted Claude plan was superseded by the user-approved GPT implementation plan and completed foundation pass.
- **[Resolved by user]** Use a temporary FFmpeg binary outside the repository, without adding a project dependency. Target approximately 6 MB with an 8 MB ceiling, 1080p H.264, no audio, and faststart, subject to a visual-quality check before replacing the original.

---

## Activity Log
_(Append newest entries at the bottom. Format: `YYYY-MM-DD — [Agent] — action / decision / files.`)_

- 2026-07-17 — [Claude Code] — Created SYNC.md. Captured verified hosting facts (Netlify hosts; Cloudflare = DNS only; live site = commit `9f11fe1`), locked decisions (stay Netlify, keep forms, compress video, respect reduced-motion, no-gradient aesthetic, polish + propose-upgrades scope), the full bug/issue list, and the collaboration protocol. No repo files changed yet. Planning was interrupted by an API credit error before a step-by-step execution plan was finalized.
- 2026-07-17 — [GPT 5.6 Sol] — Completed the kickoff read-only verification pass. Confirmed the recorded hero/video, responsive CSS, logo consistency, SEO/meta, sitemap, forms-success, redirects, and documentation issues still match the working tree; no implementation changes made. Flagged one decision tension for the user: mobile-still behavior versus video for all non-reduced-motion visitors. `AGENTS.md` and `SYNC.md` are currently untracked; `AGENTS.md` was created earlier at the user's request. Files touched: `SYNC.md` (activity log only).
- 2026-07-17 — [GPT 5.6 Sol] — Read the complete repository text (all HTML, CSS, JS, configuration, routing, SEO, docs, and coordination files), inspected all image assets, parsed video container metadata, reviewed shared chrome consistency and recent Git history, and ran read-only structural checks. Recorded the user's decisions: GPT owns all work; temporary FFmpeg compression; extensionless URLs; mobile autoplay with clean fallback; transparent logo with contrast treatment; preserve recruiter-approved architecture unless a disclosed proposal is approved. No site implementation changes made. Files touched: `SYNC.md` (facts, decisions, handoff, and activity log only).
- 2026-07-17 — [GPT 5.6 Sol] — User approved the objective foundation pass and clarified that “Book a call” should continue routing to Contact; a founder headshot may be available later, but testimonials/logos/results are not yet available; privacy and EEO wording may be improved provided the exact revisions are reported for recruiter review. Established an implementation plan; no site implementation changes yet. Files touched: `SYNC.md` (decisions and activity log only).
- 2026-07-17 — [GPT 5.6 Sol] — Downloaded a temporary FFmpeg binary under `/tmp` (no repository dependency), encoded the hero with two-pass H.264 at a 6 MB-class target, stripped audio and third-party comment metadata, enabled faststart, and validated resolution/duration/codec/container structure plus SSIM and representative frames before replacement. `hero.mp4` is now 5,752,701 bytes (88.7% smaller), 1080p/30 fps, silent, and visually near-identical. Files touched: `assets/video/hero.mp4`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — Implemented the approved foundation changes in the working tree: reduced-motion-aware lazy hero loading with mobile autoplay/error/timeout fallback; unified hero selectors; responsive headline and job-board rules; removed navbar backdrop blur; standardized the transparent navbar logo on a solid contrast tile; added 700 font weight; converted internal links and sitemap/robots hosts to clean `www` URLs; added canonicals, Open Graph URLs, Twitter images, touch icons and noindex directives; added `/thank-you` form actions, route and branded page; corrected homepage/about copy; revised privacy and recruiting-specific EEO wording; updated README, CLAUDE and AGENTS guidance. No commit, push or deployment. Files touched: all HTML pages, `thank-you.html`, `assets/css/styles.css`, `assets/js/main.js`, `_redirects`, `sitemap.xml`, `robots.txt`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — Completed validation. Static checks passed for 10 pages, clean routes, local assets, unique IDs, headings, labels, image attributes, JSON-LD, canonical/sitemap agreement, Netlify form wiring, JavaScript syntax and whitespace. Playwright rendered all 10 pages at 360/390/768/992/1200/1440 px (60 combinations); an initial 12 px Bootstrap gutter overflow on four phone layouts was found and fixed, after which the full matrix passed. Normal hero playback succeeded at all widths; reduced-motion and forced autoplay-rejection tests both removed the source and showed the still; reduced-motion AOS content remained visible; mobile navigation opened and navigated correctly. `npm start` returned 200 for all nine public clean routes. One transient console message originated inside Loxo's third-party AddToAny integration, not a local asset or MDS script. No commit, push or deployment. Files touched after validation: `assets/css/styles.css`, `assets/js/main.js`, all HTML pages (decorative logo alt cleanup), `README.md`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — Fixed the reported home-hero headline regression: `.hero h1` had greater specificity than `.hero-title`, so its shorthand margin overrode the intended auto side margins. Scoped the centering rule as `.hero h1.hero-title` and verified exact 0 px center offset at 360/390/768/992/1200/1440 px. A second 60-combination browser audit found no page overflow, off-screen content, failed images, navbar/heading collisions, or overlapping controls. Visual review then exposed a 70 px black strip baked into the source mountain media; re-encoded from the original with a 1920×1010 crop and regenerated the matching poster crop, eliminating the strip without changing the image content. README encoding instructions now preserve the crop. No commit, push or deployment. Files touched: `assets/css/styles.css`, `assets/video/hero.mp4`, `assets/img/hero-fallback.jpg`, `README.md`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — User authorized committing and pushing the complete validated pass. Because `main` auto-deploys to production and legal/copy changes still need recruiter approval, created dedicated branch `review/foundation-polish` for review while leaving `main` untouched. The recommended next step is a pull request/Netlify deploy preview for recruiter review before merging to production.
- 2026-07-17 — [GPT 5.6 Sol] — User clarified that the pushed branch is the completed technical foundation and explicitly authorized a new uncommitted market-facing redesign for localhost recruiter review. Benchmarked the official sites of leading search firms, then implemented a client-first visual system: stronger typography and spacing, solid navy/blue/warm surfaces, conversion-oriented navigation, proof bar using existing facts, redesigned home positioning/process/expertise/founder sections, and rebuilt Clients, Expertise, About and Contact pages. Added an intentional Howard Braithwaite monogram portrait area that can be replaced by a real headshot after approval; did not fabricate testimonials, client logos, placement data or performance statistics. Standardized footer positioning and “Start a search” CTAs. Removed AOS and its CDN requests after browser testing showed fast scrolling could leave content hidden. The redesign remains uncommitted and unpushed. Validation passed static checks plus all 10 pages at 360/390/768/992/1200/1440 px, hero playback, reduced-motion fallback and mobile navigation. Files touched: all HTML pages (shared AOS/footer cleanup), `index.html`, `about.html`, `clients.html`, `expertise.html`, `contact.html`, `assets/css/styles.css`, `assets/js/main.js`, `README.md`, `CLAUDE.md`, `AGENTS.md`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — Recruiter approved the full redesign with four requested revisions: title-case “Executive Search” in every footer; title-case “Retained + Contingency” and “C‑Suite to Senior IC” in the homepage proof bar; add Tax, Assurance & Advisory for public accounting firms between Finance and Operations; and reserve the founder image treatment for the forthcoming headshot. Implemented all copy changes, added the Public Accounting practice to the homepage, Expertise page, Clients positioning, About recency statement and candidate role example, and added responsive practice layouts. Updated the approved privacy notice date to July 2026. Organized local hygiene with `.gitignore`, removed obsolete AOS data attributes, and documented the future image at `assets/img/team/howard-braithwaite.jpg`. The full 10-page × 6-width audit, video playback, reduced-motion fallback and mobile navigation passed with zero failures. Changes remain uncommitted and unpushed pending the headshot. Files touched: all HTML pages, `assets/css/styles.css`, `.gitignore`, `assets/img/team/README.md`, `README.md`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — User clarified that Public Accounting should not receive special visual emphasis. Removed the blue-highlight styling and full-width treatment, then converted the Home and Expertise practice collections to centered wrapping layouts: four equal cards followed by three centered cards on desktop, two-column centered wrapping on tablets, and one column on phones. The five-card Expertise industry collection now also centers its final card. Browser geometry and screenshot review passed at 390/768/992/1200/1440 px with equal card backgrounds, exactly centered incomplete rows and zero overflow. Changes remain uncommitted and unpushed. Files touched: `index.html`, `expertise.html`, `assets/css/styles.css`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — User reported that the longer Tax, Assurance & Advisory descriptions still produced uneven card heights while resizing. Replaced the content-dependent wrapping layouts with explicit equal-track CSS grids while preserving the centered 4+3 desktop, centered 2+2+2+1 tablet and single-column phone arrangements; the 2+2+1 industry grid follows the same equal-height rule. Headless-browser measurement confirmed one identical rendered height for every card in each collection at 390/768/992/1200/1440 px, exact final-row centering and zero overflow. Screenshot review passed. Changes remain uncommitted and unpushed. Files touched: `assets/css/styles.css`, `SYNC.md`.
- 2026-07-17 — [GPT 5.6 Sol] — Integrated the recruiter-approved founder portrait. Used the built-in image editing workflow for a conservative identity-preserving restoration (detail recovery, restrained noise reduction and exposure/color correction), then created a 1200×1200, 97 KB JPEG at `assets/img/team/howard-braithwaite.jpg`. Preserved the user upload locally as ignored `howard-braithwaite-original.png`. Replaced both HB monograms with responsive, accessible portrait panels and solid navy nameplates; updated asset documentation and ignore rules. Visual crop review passed on Home/About at 390/768/1440 px. A fresh 10-page × 6-width audit passed all 60 layouts with zero failures, including image loading and mobile navigation. Changes remain uncommitted and unpushed. Files touched: `index.html`, `about.html`, `assets/css/styles.css`, `.gitignore`, `README.md`, `assets/img/team/README.md`, `assets/img/team/howard-braithwaite.jpg`, `SYNC.md`.
- 2026-07-17 — [Repository release] — Recruiter approved the complete redesign and founder portrait. Committed the approved work as `34cd4a0`, fast-forwarded `main` from `9f11fe1` through the foundation and redesign commits, and pushed `main` to GitHub. Verified production serves the new homepage headline, approved Retained + Contingency copy and `howard-braithwaite.jpg`. The redesign is live at `https://www.mdssearch.com`.
- 2026-07-19 — [Site refinement] — Recruiter loved the completed site but requested a smaller, framed founder headshot on Home and About. Replaced the full-bleed portrait treatment with a centered off-white matte/frame, restrained shadow and intentional navy negative space while leaving the approved image file unchanged. Visual review passed at 390/768/1440 px; portrait loading and crop checks passed at 390/768/992/1200/1440 px; the full 10-page × 6-width browser audit passed all 60 layouts with zero failures. Changes remain uncommitted and unpushed. Files touched: `index.html`, `about.html`, `assets/css/styles.css`, `SYNC.md`.

---

## >>> RESUME INSTRUCTION FOR A FUTURE AGENT <<<

Read this entire file before acting, inspect the working tree and latest Activity Log, and preserve all locked decisions. The recruiter-approved foundation and redesign are deployed on `main`. A recruiter-requested smaller framed portrait treatment is implemented and fully validated locally but remains uncommitted and unpushed. Next, obtain final user approval and commit/push only when explicitly directed.
