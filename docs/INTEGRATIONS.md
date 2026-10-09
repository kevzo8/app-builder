# Integrations — from zero knowledge to live app

You built your app offline in DreamBuild. This guide takes it online.
Each service has: what it is (one line), cost, and click-by-click steps.
Do them in order: GitHub → Backend → Vercel → Domain.

---

## 1. GitHub — where your code lives (free)

**What:** Online folder for your code. Vercel reads from here.
**Cost:** ₱0, unlimited repos.

1. Make a GitHub account at github.com.
2. In DreamBuild Step 3, click **Export ZIP**, unzip it.
3. On GitHub, click **New repository**, name it `my-dream-app`, **Create**.
4. Follow GitHub's "push an existing repository" commands:
   `git init`, `git add -A`, `git commit -m "my app"`,
   `git branch -M main`, `git remote add origin YOUR-LINK`, `git push -u origin main`.
5. Done when you see your files on github.com.

## 2. Backend — where orders/bookings save

### Option A: Convex (recommended, easiest)

**What:** Online Excel that your app talks to. No SQL to learn.
**Cost:** ₱0 starter (~1M function calls/mo — enough for small shops/schools).

1. Make account at convex.dev.
2. In your project folder: `npm install convex`, then `npx convex dev`.
3. It prints a URL like `https://xxx.convex.cloud`. Copy it.
4. In Vercel (step 3), add env var `NEXT_PUBLIC_CONVEX_URL` = that URL.
5. Redeploy. Done — forms now save online.

### Option B: Supabase (if you think in Excel/SQL)

**What:** Real Postgres database with a spreadsheet-like table UI.
**Cost:** ₱0 free (500MB, pauses if idle 7 days — click Resume).

1. Make account at supabase.com → **New project**.
2. Go to **Table Editor** → create tables (e.g. `orders`, `bookings`).
3. **Project Settings → API**: copy `URL` + `anon key`.
4. In Vercel add env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Redeploy. Done.

## 3. Vercel — puts your app online (free)

**What:** Turns your GitHub code into a live link like `my-app.vercel.app`.
**Cost:** ₱0 Hobby (100GB bandwidth/mo).

1. Make account at vercel.com → **Sign in with GitHub**.
2. Click **Add New → Project** → pick your repo → **Import**.
3. If using Convex/Supabase, open **Environment Variables** and add the keys from step 2.
4. Click **Deploy**. Wait ~2 minutes.
5. Done when you get a `*.vercel.app` link. Every GitHub push redeploys automatically.

### Alternative: Netlify

Same idea, different company. Use if you want built-in contact forms without code:
netlify.com → **Add new site → Import from Git** → same env vars → **Deploy**.
Free: 100GB bandwidth, 300 build minutes/mo.

## 4. Domain — your own .com address

### Buy on Namecheap (~₱600/yr .com)

1. Go to namecheap.com, search your name (e.g. `mystoreph.com`).
2. Pay with PH card/GCash. Add free **WhoisGuard** (hides your personal info).
3. Done — you own it for 1 year. Renewal is usually higher than the promo price.

### Point it with Cloudflare (free, recommended)

**What:** Free phonebook that turns your .com into your Vercel app, plus free protection.
**Cost:** ₱0.

1. Make account at cloudflare.com → **Add a domain** → type your .com.
2. Cloudflare shows 2 nameservers (e.g. `xxx.ns.cloudflare.com`).
3. Go back to Namecheap → **Domain List → Manage → Nameservers → Custom DNS** → paste the 2 Cloudflare nameservers → Save.
4. Wait 5 min – 24 hrs. Cloudflare emails when active.
5. In Cloudflare → **DNS**: add `CNAME @ → cname.vercel-dns.com` (or follow Vercel's Add Domain instructions below).

### Connect domain to Vercel (free SSL)

1. Vercel project → **Settings → Domains** → type your .com → **Add**.
2. Vercel tells you what DNS record to add — copy it into Cloudflare DNS.
3. Wait a few minutes. Done — `https://yourname.com` works with free SSL (padlock).

### Alternative: keep Namecheap DNS

Skip Cloudflare. In Namecheap → **Advanced DNS**, add the records Vercel shows you.
Fine for week 1. Move to Cloudflare later for speed + free protection.

---

## Cheat sheet: what you pay

| Service | Free | Paid when |
|---|---|---|
| GitHub | Unlimited repos | Never (for starters) |
| Vercel | 100GB/mo | Popular shop with videos |
| Convex | ~1M calls/mo | Hundreds of daily orders |
| Supabase | 500MB DB | Big photo/many rows |
| Cloudflare | Unlimited DNS | Never (for starters) |
| Namecheap .com | — | ~₱600/yr, yearly |

**Tipid path total: ₱600/yr (domain only). Everything else ₱0 until you grow.**
