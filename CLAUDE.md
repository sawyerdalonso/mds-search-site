# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MDS Search is a static marketing website for an executive search firm. There is no build step, framework, or runtime package dependency. All files are served directly. GitHub `main` auto-deploys to Netlify, with Cloudflare providing DNS and proxying in front.

## Local Development

Serve the root with:

```bash
npm start
```

This serves `http://localhost:3000` and supports the site's extensionless public URLs. A basic Python static server can still open `.html` files directly but does not reproduce Netlify's clean-route rewrites.

HTML is formatted with Prettier (`npm run format`, config in `.prettierrc.json`); run it before committing HTML changes. There are no tests and no CI pipeline beyond Netlify's deploy preview.

## Architecture

**Pages:** Each page is a self-contained `.html` file (`index.html`, `about.html`, `clients.html`, `candidates.html`, `expertise.html`, `jobs.html`, `contact.html`, `privacy.html`, `404.html`, `thank-you.html`). The 404 and thank-you pages are noindexed.

**Shared structure:** Every page includes the same navbar and footer HTML inline — there is no templating or component system. When editing the navbar or footer, update every `.html` file.

**Styling:** `assets/css/styles.css` — a single flat stylesheet. CSS custom properties are defined at `:root` (`--mds-navy`, `--mds-blue`, `--mds-teal`, etc.). Bootstrap 5.3.3 CSS is loaded via CDN and extended/overridden by `styles.css`. Fonts are self-hosted in `assets/fonts/` (Inter for text, Source Serif 4 for large headings) and declared at the top of `styles.css`.

**Cache busting:** Every page loads `/assets/css/styles.css?v=YYYYMMDD` (add a letter suffix for same-day changes) and `/assets/js/main.js?v=YYYYMMDD`. After changing either file, bump the `v=` value in all 10 HTML files so browsers and Cloudflare fetch the new version.

**JavaScript:** `assets/js/main.js` — one IIFE that handles visitor-tracking consent (Apollo and Instantly), the navbar scroll state, active nav link highlighting via `data-page` / `data-nav`, dynamic year injection via `[data-year]`, the mobile menu toggle (Bootstrap's JS bundle is not loaded), and hero video loading/fallback.

**Tracking consent:** Apollo and Instantly load only through `loadOptionalTracking()` in `main.js`, never via tags in the HTML. Visitors outside Europe get a notice with an opt-out; visitors whose browser time zone is European get an opt-in prompt; a Global Privacy Control signal disables tracking entirely. Trackers never load on the candidate-facing pages listed in `noTrackingPages` (`candidates`, `jobs`, `thank-you`, `404`). Keep `privacy.html` in sync with any change to this behavior.

**External dependencies (CDN only):**
- Bootstrap 5.3.3 (CSS only)

**Icons:** `assets/img/icons.svg` is an SVG sprite of the Bootstrap Icons the site uses, referenced as `<svg class="bi" aria-hidden="true"><use href="/assets/img/icons.svg#bi-name"></use></svg>`. Add any new icon to the sprite from Bootstrap Icons 1.11.3.

**Routing:** Netlify's `_redirects` file maps clean URLs (`/about` → `/about.html` with 200 rewrites). Requests for the `.html` addresses are permanently redirected to the clean URLs with forced (`301!`) rules. Internal links, canonical tags, and sitemap entries use extensionless URLs on `https://www.mdssearch.com`.

**Headers:** `_headers` sets baseline security headers on Netlify. No Content-Security-Policy is set, because the trackers and the Loxo job-board embed load third-party scripts.

**Forms:** `contact.html` and `candidates.html` use Netlify Forms and redirect successful submissions to `/thank-you`. Preserve their form names, hidden `form-name` inputs, and honeypots.

## Page–Nav Wiring

Active nav state is driven by `data-page` on `<body>` and `data-nav` on each `<a>` in the navbar. When adding a new page, set `data-page="<slug>"` on `<body>` and ensure the corresponding nav link has `data-nav="<slug>"`.

## Hero Section

The hero uses a looping `<video>` with `assets/img/hero-fallback.jpg` as the poster (WebP versions are served through `image-set()`). Each `<source>` has a `data-src` (1920 px `hero.webm`, then `hero.mp4`) and a `data-src-small` (960 px `hero-960.webm` / `hero-960.mp4`, used below 768 px). JavaScript attaches the sources only when reduced motion is not requested and neither Data Saver nor a 2G connection is detected. It attempts muted inline playback, keeps the poster visible until playback starts, retries on the first user interaction if autoplay is blocked, and removes the video only when the last source fails. Keep the desktop video 1920 px wide in H.264, silent, faststart-enabled, cropped to remove the source black strip, and below 8 MB, and the phone files below 1 MB. See `README.md` for the encode commands.
