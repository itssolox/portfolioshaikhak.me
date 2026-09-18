# portfolioshaikhak.me

Personal portfolio of Akamal Shaikh — live at [portfolioshaikhak.me](https://portfolioshaikhak.me).

React + Vite + Tailwind frontend with live LeetCode and GitHub stats, GSAP scroll animations and Lenis smooth scrolling. The site follows the system light/dark preference.

## Structure

- `artifacts/portfolio/` — the site (pages: `/`, `/work/graphrag`, `/work/placement-predictor`)
- `artifacts/api-server/` — Express API that proxies LeetCode/GitHub stats for local development (`/api/stats/*`)
- `lib/api-spec/openapi.yaml` — API contract; `lib/api-client-react` and `lib/api-zod` are generated from it

## Develop

```sh
pnpm install
PORT=8080 pnpm --filter @workspace/api-server run dev              # API on :8080
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/portfolio run dev   # site on :5173
pnpm run typecheck
```

The site calls the API at `/api`. On Replit the workspace proxy routes that prefix to the API server; elsewhere, add a Vite `server.proxy` entry for `/api` or build the static variant below.

## Deploy

Pushing to `main` runs [`deploy-pages.yml`](.github/workflows/deploy-pages.yml), which:

1. fetches the current LeetCode/GitHub stats into `artifacts/portfolio/public/data/`,
2. builds the site with `VITE_STATS_SOURCE=static` so it reads those snapshots (GitHub Pages has no server),
3. publishes the build to GitHub Pages.

The same workflow runs every 6 hours to refresh the stats. From the Replit workspace, `scripts/publish-github.sh "message"` pushes the current working copy to `main`.
