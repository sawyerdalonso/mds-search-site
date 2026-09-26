# MDS Search Website

Marketing website for [MDS Search](https://www.mdssearch.com), a founder-led retained and contingency executive search firm based in Los Angeles.

**Live site:** https://www.mdssearch.com

## Highlights

- **Static and fast.** Hand-written HTML, CSS and vanilla JavaScript with no build step or framework. Bootstrap 5.3 and Bootstrap Icons load from a CDN.
- **Client and candidate journeys.** Separate paths for hiring leaders (services, process, FAQ, contact) and candidates (open roles, confidential resume intake).
- **Netlify Forms** for the contact and candidate-intake forms, with honeypot spam protection and a branded thank-you page.
- **Responsive hero video** that plays on desktop and falls back to a still image on phones, Data Saver, slow connections and reduced-motion settings.
- **Privacy-aware visitor analytics.** A first-party consent layer loads the Apollo and Instantly trackers with a notice and opt-out, switches to opt-in for European visitors and honors Global Privacy Control.
- **SEO and sharing.** Clean extensionless URLs, canonical tags, sitemap, Open Graph images and schema.org structured data (organization, founder and FAQ).
- **Accessibility.** Semantic landmarks, skip link, labeled form controls, visible focus states and reduced-motion support.

## Tech stack

| Area | Choice |
| --- | --- |
| Markup and styles | HTML5, CSS custom properties, Bootstrap 5.3.3 |
| Scripting | Vanilla JavaScript (single IIFE, no dependencies) |
| Hosting | Netlify (auto-deploys from `main`), with Cloudflare DNS |
| Forms | Netlify Forms |
| Job board | Loxo embed |
| Formatting | Prettier |

## Project structure

```
├── index.html, about.html, clients.html, expertise.html,
│   candidates.html, jobs.html, contact.html, privacy.html
├── 404.html, thank-you.html   # noindexed utility pages
├── assets/
│   ├── css/styles.css         # design tokens, components and responsive rules
│   ├── js/main.js             # consent, navigation, hero video and footer year
│   ├── img/                   # logo marks, icons, hero still, founder portrait
│   └── video/hero.mp4         # hero background video
├── _redirects                 # clean URL rewrites for Netlify
├── _headers                   # security headers for Netlify
├── sitemap.xml, robots.txt
└── favicon.ico
```

## Local development

```bash
npm start        # serves the site at http://localhost:3000 with clean URLs
npm run format   # formats the HTML with Prettier
```

The navbar and footer are repeated in every page, so edit all HTML files when changing them. After editing `styles.css` or `main.js`, bump the `?v=` query string on every page so browsers and Cloudflare fetch the new version.

## Media guidelines

**Hero video.** Keep `assets/video/hero.mp4` 1920 px wide, H.264, silent, faststart-enabled and below 8 MB. The source has a 70 px black strip along the bottom, which both passes crop out:

```bash
ffmpeg -y -i source.mp4 -map 0:v:0 -vf crop=1920:1010:0:0,setsar=1 -c:v libx264 -preset slow -b:v 2100k -maxrate 2600k -bufsize 5200k -pix_fmt yuv420p -an -pass 1 -passlogfile /tmp/mds-hero-pass -f null /dev/null
ffmpeg -y -i source.mp4 -map 0:v:0 -vf crop=1920:1010:0:0,setsar=1 -c:v libx264 -preset slow -b:v 2100k -maxrate 2600k -bufsize 5200k -pix_fmt yuv420p -map_metadata -1 -movflags +faststart -an -pass 2 -passlogfile /tmp/mds-hero-pass assets/video/hero.mp4
```

**Logo.** `assets/img/logo-white.png` is the full-resolution master. The tightly cropped marks (`logo-mark*.png`), touch icon and favicons are derived from it.

**Founder portrait.** See `assets/img/team/README.md`.

## Credits

Designed and built by [Sawyer Alonso](https://github.com/sawyerdalonso). Site content, branding and photography © MDS Search.
