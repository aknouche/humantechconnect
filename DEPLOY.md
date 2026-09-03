# Deploy guide

The site is built with [Eleventy](https://www.11ty.dev/) (a static site generator) and deploys
to [Cloudflare Pages](https://pages.cloudflare.com/) for free. The contact form is handled by a
small Cloudflare Pages Function (`functions/api/contact.js`) that sends email via
[Resend](https://resend.com) (also free at this volume).

## 1. Deploy the site on Cloudflare Pages

1. Go to **dash.cloudflare.com** and sign up (free).
2. In the left sidebar: **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize Cloudflare to access your GitHub account, then pick the `humantechconnect` repo.
4. On the build settings screen, set:
   - **Framework preset**: `Eleventy`
   - **Build command**: `npm run build`
   - **Build output directory**: `_site`
5. Click **Save and Deploy**. In under a minute you'll get a live URL like
   `humantechconnect.pages.dev`. Every future push to this branch redeploys automatically.

## 2. Set up the contact form (Resend)

The form won't send email until you do this. It's the only piece you have to configure.

1. Go to **resend.com** and sign up (free, 100 emails/day, 3,000/month).
2. **API Keys → Create API Key** → copy the key (starts with `re_`).
3. Back in Cloudflare: your Pages project → **Settings → Environment variables → Add variable**.
   Add these two (as **Production**, and again as **Preview** if you want previews to work too):
   - `RESEND_API_KEY` = the key you just copied (click **Encrypt** so it's stored as a secret)
   - `CONTACT_TO_EMAIL` = the inbox that should receive form submissions (e.g. your own email)
4. Click **Save**, then **Retry deployment** (or push any commit) so the function picks up the
   new variables.
5. Test it: submit the contact form on the live site and check the inbox.

Optional: `CONTACT_FROM_EMAIL`. If you later verify your own domain in Resend, set this to
something like `Kontakt <hej@humantechconnect.se>` so emails come from your domain instead of
Resend's shared test address. Not required to get started.

## 3. Add a custom domain

1. Buy a domain if you haven't: [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)
   sells at cost (~$9–10/yr `.com`), or use a Swedish registrar (Loopia, Domainnameshop, One.com)
   for a `.se` domain (~100–150 SEK/yr), which may read as more trustworthy to a Swedish audience.
2. In the Cloudflare Pages project: **Custom domains → Set up a custom domain** → enter your
   domain.
3. - If the domain is registered through Cloudflare, DNS is configured automatically.
   - If it's registered elsewhere, Cloudflare shows you exactly what nameservers or DNS records
     to add at your registrar. Follow the on-screen instructions.
4. HTTPS is issued automatically, usually within a few minutes.

## Local development (optional)

```
npm install
npm run serve
```

Opens the site at `http://localhost:8080` with live reload. The contact form's `/api/contact`
endpoint only works once deployed to Cloudflare Pages (or via the Cloudflare `wrangler pages dev`
CLI). Locally it will show the "something went wrong" message, which is expected.
