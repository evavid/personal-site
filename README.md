# Eva Vidmar — personal site

Static [Astro](https://astro.build) site: blog posts in Markdown, projects pulled from GitHub at build time. Hosted free on Cloudflare Pages.

## Run it locally

```sh
npm install
npm run dev        # http://localhost:4321, live reload
npm run build      # production build into dist/
```

## Everyday tasks

| I want to… | Do this |
|---|---|
| Write a post | Add a `.md` file to `src/content/posts/` (copy `hello-world.md`). `draft: true` hides it from the live site. |
| Link a post to a repo | Add `project: repo-name` to the post's frontmatter. |
| Choose which repos show | List them in `projects` in `src/config.ts` (empty = most recently updated). |
| Change name, links, tagline | `src/config.ts` |
| Use my real photos | Put `cover.jpg` and `portrait.jpg` in `public/images/`, update the paths in `src/config.ts`. |
| Change colours / type | Tokens at the top of `src/styles/global.css`. |

## Deploy (Cloudflare Workers, free)

1. Push this folder to a GitHub repository.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**, pick the repo.
3. Build command `npm run build`, deploy command `npx wrangler deploy` (config in `wrangler.jsonc`; its `name` must match the Worker name).
4. Optional, under **Settings → Variables**: `GITHUB_TOKEN` (a fine-grained token with public read access only), which raises the GitHub API rate limit.
5. Every push to `main` redeploys. Live at https://personal-site.eva-vidmar2.workers.dev until a custom domain is added (**Settings → Domains & Routes**).

When you get a domain, update `url` in `src/config.ts` so RSS and the sitemap use it.

### Daily refresh of GitHub data

`.github/workflows/daily-rebuild.yml` triggers a rebuild every morning so stars and commits stay current. Create a deploy hook in Cloudflare (**Settings → Builds → Deploy hooks**) and save its URL as a GitHub repository secret named `CF_DEPLOY_HOOK`.
