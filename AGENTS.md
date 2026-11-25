# Repository Guidelines

## Layout

- `public_html/` — static portfolio. Edit `index.html`, `homepage.css`, and `homepage.js` for homepage changes. Thumbnails live in `images/`.
- `src/main.ts` — background animation entry point. Under `src/`, `dom/` handles the triangle grid and events, `patterns/` stores animation patterns, `editor/` handles controls and serialization, and `assets/` holds the webpack HTML template and styles.
- `types/` — shared ambient declarations.

## Commands

- `npm ci` — install from the lockfile.
- `npm start` — open the hot-reloading webpack preview on port 3000.
- `npm run build` — compile production animation assets into ignored `dist/`.
- `npm run build:site` — rebuild and refresh tracked `bundle.js`, `bundle.js.map`, and `bgAnimation.css` in `public_html/` after animation changes.
- `npm run serve-static` — preview the portfolio on port 8000 with Python 3.

## Style

Use two spaces, LF, single quotes, semicolons, and Prettier’s 100-character print width. Use camelCase for functions and most modules (`timingFunctions.ts`) and PascalCase for classes (`EventChannel.ts`). `npm run format` rewrites TypeScript and CSS under `src/`. No lint script.

## Testing

`npm test` is a failing placeholder. No suite, test naming convention, or coverage target. Build animation changes and check the webpack preview. In the static preview, check affected interactions, narrow and wide layouts, and the browser console.

## Commits and PRs

Use short, lowercase, action-oriented subjects (`restyle background paper`). In PRs, summarize changes, list checks run, link related issues, and include screenshots or a short recording for visible changes.
