# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MDS Search is a static marketing website for an executive search firm. There is no build step, no framework, no package manager. All files are served directly. The site is deployed on Netlify.

## Local Development

Open any `.html` file directly in a browser, or serve the root with any static file server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

There are no tests, no linter, and no CI pipeline beyond Netlify's deploy preview.

## Architecture

**Pages:** Each page is a self-contained `.html` file (`index.html`, `about.html`, `clients.html`, `candidates.html`, `expertise.html`, `jobs.html`, `contact.html`, `privacy.html`, `404.html`).

**Shared structure:** Every page includes the same navbar and footer HTML inline — there is no templating or component system. When editing the navbar or footer, update every `.html` file.

**Styling:** `assets/css/styles.css` — a single flat stylesheet. CSS custom properties are defined at `:root` (`--mds-navy`, `--mds-blue`, `--mds-teal`, etc.). Bootstrap 5.3.3 is loaded via CDN and extended/overridden by `styles.css`.

**JavaScript:** `assets/js/main.js` — one IIFE that handles: navbar glass effect on scroll, active nav link highlighting via `data-page` / `data-nav` attributes, AOS animation init, and dynamic year injection via `[data-year]`.

**External dependencies (CDN only):**
- Bootstrap 5.3.3 (CSS + JS bundle)
- Bootstrap Icons 1.11.3
- AOS 2.3.1 (scroll animations)
- Inter font (Google Fonts)

**Routing:** Netlify's `_redirects` file maps clean URLs (`/about` → `/about.html` with 200 rewrites).

## Page–Nav Wiring

Active nav state is driven by `data-page` on `<body>` and `data-nav` on each `<a>` in the navbar. When adding a new page, set `data-page="<slug>"` on `<body>` and ensure the corresponding nav link has `data-nav="<slug>"`.

## Animations

Scroll-triggered animations use AOS. Add `data-aos="fade-up"` (or similar) and optionally `data-aos-delay="<ms>"` to any element. AOS is initialized in `main.js` with `once: true`, `duration: 650`.

## Hero Section

The hero uses a looping `<video>` (`assets/video/hero.mp4`) with `assets/img/hero-fallback.jpg` as the poster. The video fades in via `.is-ready` class added by an inline script once `canplay` fires. On mobile or slow connections the poster image is shown.
