Though this is forked from "Frontend Boilerplate with React, Redux & TypeScript,"
it only contains Typescript now. And the dev scripts, hot reloading, build tools, etc.

## Project pages

Preview the portfolio with `npm run serve-static`. Feature pages live at
`public_html/projects/<slug>.html` and share `projects.css` and the homepage
palette in `public_html/site-theme.css`. Keep the homepage links pointed at
these feature pages. Add feature-only images under `projects/media/<slug>/`.

The feature pages and their local media are versioned here. Launch links use the
existing demo builds under `public_html/with/` and `public_html/where/`. Copy
those builds from the existing site into a fresh checkout when testing demos
locally, and retain them when deploying the static pages.
