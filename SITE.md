# stepkowski.dev — site notes

This repo does two jobs at once:

1. `README.md` at the repo root is the **GitHub profile README** shown at
   github.com/m-stepkowski (GitHub special-cases a repo named exactly your
   username).
2. Everything else in the repo is the source for the **Astro site**
   deployed to `stepkowski.dev` via GitHub Pages.

These don't collide because GitHub Pages, configured through the Actions
flow below, publishes a **build artifact** (`dist/`, uploaded by
`actions/upload-pages-artifact`), not the raw repo contents. The profile
README at the repo root is never part of that artifact.

This file — not the profile README — is where any "how the site works"
documentation belongs.

## Stack

- **Astro** (official `blog` starter template), Markdown content
  collections, Shiki for syntax highlighting (dual light/dark themes,
  configured in `astro.config.mjs`)
- `@astrojs/rss` for the RSS feed (`/rss.xml`)
- `@astrojs/sitemap` for `/sitemap-index.xml`
- No client-side JS framework, no CSS framework — plain CSS in
  `src/styles/global.css`, dark/light mode via `prefers-color-scheme`
- Deployed with GitHub Actions → GitHub Pages
  (`.github/workflows/deploy.yml`)

## Local development

```sh
git clone git@github.com:m-stepkowski/m-stepkowski.git
cd m-stepkowski
npm install
npm run dev       # http://localhost:4321
```

```sh
npm run build     # builds to ./dist
npm run preview   # serves the production build locally
```

## Adding a new post

1. Add a Markdown (or `.mdx`) file to `src/content/blog/`. The filename
   (minus extension) becomes the URL slug: `src/content/blog/my-post.md` →
   `/blog/my-post/`.
2. Frontmatter:

   ```yaml
   ---
   title: 'Post title'
   description: 'One or two sentences — used in the post list, RSS, and meta tags.'
   pubDate: 2026-08-20
   canonicalURL: 'https://stepkowski.dev/blog/my-post/' # optional
   # updatedDate: 2026-08-21                            # optional
   # heroImage: '../../assets/some-image.jpg'           # optional
   ---
   ```

   `canonicalURL` defaults to the post's own URL on this site if omitted.
   Set it explicitly when cross-posting elsewhere (dev.to, Hashnode) and
   pointing their canonical-link field back here — the frontmatter field
   already round-trips into the `<link rel="canonical">` tag via
   `src/components/BaseHead.astro`.

3. Start the body directly with prose — don't repeat the title as a
   Markdown `# H1`; the layout renders `title` from frontmatter as the H1
   already.
4. Push to `main`. The Actions workflow builds and deploys automatically.

The post list on the homepage and `/blog` (`src/components/PostList.astro`)
sorts by `pubDate` descending — newest first, no manual list to maintain.

## Deploy pipeline

`.github/workflows/deploy.yml` runs on every push to `main`:

1. `npm ci && npm run build`
2. `actions/upload-pages-artifact` uploads `./dist`
3. `actions/deploy-pages` publishes it

This is the official Actions-based Pages flow, not "deploy from a branch" —
GitHub Pages must be configured for it (see below).

## What you still need to do (not done by this session)

### 1. GitHub repo + Pages settings

- Create the repo as `m-stepkowski/m-stepkowski` on GitHub (empty, no
  README/gitignore — this local repo already has both) and push this code
  to it. Exact commands are in the terminal output / commit message from
  the session that built this.
- In the repo, go to **Settings → Pages**:
  - **Source**: "GitHub Actions" (not "Deploy from a branch"). This is
    required for the `upload-pages-artifact` / `deploy-pages` workflow to
    be allowed to publish.
  - **Custom domain**: enter `stepkowski.dev` and save. GitHub will verify
    it (may take a few minutes once DNS below is live) and offer to
    enforce HTTPS — turn that on once the certificate is issued.
  - If you also want `www.stepkowski.dev` to work, add it as an
    additional custom domain here, or set up the CNAME record below and
    let GitHub redirect it — GitHub Pages only serves one canonical
    domain at a time (whatever's in `public/CNAME`), and redirects the
    other.

Because `public/CNAME` (containing `stepkowski.dev`) is committed and gets
copied into every build, the custom domain setting will keep surviving
future deploys even if Pages settings ever get reset — but the *first*
time, you still need to set it in Settings → Pages once, so GitHub issues
the TLS certificate.

### 2. DNS records at your registrar

For the apex domain `stepkowski.dev`, point it at GitHub Pages' IPs. If
your registrar supports ALIAS/ANAME (Cloudflare, some others) prefer that
over raw A records — it's more resilient if GitHub's IPs change. Otherwise
use GitHub's four A records:

| Type  | Host / Name | Value                | Notes                          |
| ----- | ----------- | --------------------- | ------------------------------- |
| A     | `@`         | `185.199.108.153`      | GitHub Pages                    |
| A     | `@`         | `185.199.109.153`      | GitHub Pages                    |
| A     | `@`         | `185.199.110.153`      | GitHub Pages                    |
| A     | `@`         | `185.199.111.153`      | GitHub Pages                    |
| ALIAS/ANAME | `@`   | `m-stepkowski.github.io` | use instead of the 4 A records, if supported |

Optional, only if you want `www.stepkowski.dev` to also resolve:

| Type  | Host / Name | Value                     |
| ----- | ----------- | -------------------------- |
| CNAME | `www`       | `m-stepkowski.github.io`   |

Verify GitHub's current recommended IPs at
[docs.github.com — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
before adding them — they're documented as stable but GitHub is the source
of truth, not this file.

## RSS

`/rss.xml` is generated by `src/pages/rss.xml.js` from the same content
collection as the post list — no separate list to keep in sync. Validate it
after the first deploy with the [W3C Feed Validator](https://validator.w3.org/feed/)
or `curl https://stepkowski.dev/rss.xml`.
