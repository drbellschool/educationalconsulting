# Lone Star Teacher HallPass Website

Static landing page for Lone Star Teacher HallPass.

## Files

- `index.html` — the website
- `CNAME` — custom domain setting for GitHub Pages

## Publish on GitHub Pages

1. Go to Settings → Pages.
2. Source: Deploy from a branch.
3. Branch: `main`, folder: `/root`.
4. Save.
5. Add the GoDaddy DNS records for GitHub Pages.

## Add real demo links

Open `index.html` and find:

```js
const LINKS = {
  adminDemo: "#",
  teacherDemo: "#",
  studentDemo: "#",
  quote: "#",
  booking: "#"
};
```

Replace the `#` symbols with the real Apps Script demo, quote, and Google Calendar booking links.
