# MDS Search Website

Static Bootstrap marketing site for MDS Search, an independent executive-search firm. Netlify hosts and auto-deploys the site from GitHub; Cloudflare provides DNS and proxying in front of Netlify. Netlify Forms handles the contact and candidate-intake forms.

## Local development

```bash
npm start
```

The site is available at `http://localhost:3000`. Use this server when testing extensionless routes such as `/about` and `/contact`.

## File map

- Top-level `.html` files — public pages plus `404.html` and the noindexed form success page, `thank-you.html`
- `assets/css/styles.css` — custom design and responsive rules
- `assets/js/main.js` — navigation, AOS, current year, and hero-video fallback behavior
- `assets/img/` and `assets/video/` — brand and hero media
- `_redirects` — Netlify clean-URL rewrites
- `sitemap.xml` and `robots.txt` — search-engine discovery

## Hero video encoding

Keep `assets/video/hero.mp4` 1920 px wide in H.264, without audio, below 8 MB, and with faststart metadata. The source includes a 70 px bottom black strip, so retain the crop in both passes:

```bash
ffmpeg -y -i source.mp4 -map 0:v:0 -vf crop=1920:1010:0:0,setsar=1 -c:v libx264 -preset slow -b:v 2100k -maxrate 2600k -bufsize 5200k -pix_fmt yuv420p -an -pass 1 -passlogfile /tmp/mds-hero-pass -f null /dev/null
ffmpeg -y -i source.mp4 -map 0:v:0 -vf crop=1920:1010:0:0,setsar=1 -c:v libx264 -preset slow -b:v 2100k -maxrate 2600k -bufsize 5200k -pix_fmt yuv420p -map_metadata -1 -movflags +faststart -an -pass 2 -passlogfile /tmp/mds-hero-pass assets/video/hero.mp4
```

Preview the result on desktop and mobile before replacing the deployed asset.
