# Repository Guidelines

## Project Structure & Module Organization

This repository is a static marketing site deployed on Netlify. Top-level HTML files are individual pages, including `index.html`, audience/service pages, `404.html`, and the noindexed `thank-you.html`. Shared styling lives in `assets/css/styles.css`; interactive behavior is in `assets/js/main.js`. Images and video belong under `assets/img/` and `assets/video/`. Routing rules are defined in `_redirects`, while `robots.txt` and `sitemap.xml` support search indexing.

There is no template layer: navigation and footer markup is repeated in every page. Update all relevant HTML files when changing shared page chrome. Keep each page's `<body data-page="...">` value aligned with its navigation link's `data-nav` value.

## Build, Test, and Development Commands

- `npm start` — serves the repository at `http://localhost:3000` using `npx serve`.
- `python3 -m http.server 8080` — previews direct `.html` files but does not reproduce extensionless Netlify routes.
- `git diff --check` — detects whitespace errors before committing.

There is no compilation or production build step. Bootstrap, Bootstrap Icons, AOS, and Google Fonts are loaded from CDNs.

## Coding Style & Naming Conventions

Follow the existing HTML style and use semantic elements, descriptive `alt` text, and appropriate ARIA labels. Use two-space indentation for new nested HTML, CSS, and JavaScript; preserve nearby formatting when editing existing compact markup. Name CSS classes in lowercase kebab-case (for example, `.navbar-glass`) and JavaScript variables/functions in camelCase. Reuse the CSS custom properties in `:root` instead of introducing duplicate colors or spacing values. Keep JavaScript dependency-free and compatible with the current IIFE structure.

## Testing Guidelines

No automated test suite or coverage target is configured. Manually preview every changed page at desktop and mobile widths. Verify navigation highlighting, clean URL routes, responsive menus, AOS effects, forms/links, hero-video fallback behavior, and browser-console errors. For shared navigation or footer changes, inspect every top-level HTML page.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries such as `Refine and optimize site` and `Update README.md`. Keep commits focused and describe the user-visible change. Pull requests should include a concise summary, affected pages, manual verification steps, and linked issues when applicable. Add before/after screenshots for visual or responsive changes, and call out any CDN, routing, SEO, or asset changes.
