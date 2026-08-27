# NORVIK JEWELS — Auth starter

Next.js 14 (App Router) + Supabase Auth. Black-and-white theme, using your
real logo and product photography.

## What's included

- `/login` and `/signup` — each with:
  - **Email tab**: email + password
  - **Phone tab**: phone number → OTP → verify
  - **Google** and **Facebook** buttons (Supabase OAuth)
  - A **required Terms/Privacy checkbox** — every action (email submit, send
    OTP, Google, Facebook) is disabled until it's checked
- `/account` — protected route, redirects signed-out users to `/login`
- `middleware.ts` — refreshes the Supabase session on every request and
  guards `/account/*`
- `/auth/callback` — handles the redirect after email confirmation, a
  magic-link click, or an OAuth sign-in
- Real assets: `public/images/logo-full.png` (your logo), product photos in
  `public/images/`, and `app/favicon.ico` generated from the diamond+N
  monogram cropped out of your logo

## Setup

1. **Create a Supabase project** at supabase.com (free tier is fine to start).
2. In **Project Settings → API**, copy the Project URL and anon public key.
3. Copy `.env.local.example` to `.env.local` and fill in those two values.
4. In **Authentication → URL Configuration**, add your site's callback URL,
   e.g. `http://localhost:3000/auth/callback` for local dev.
5. Install and run:

   ```bash
   npm install
   npm run dev
   ```

6. Visit `http://localhost:3000/signup` to create a test account.

### Turning on phone (OTP) login

Supabase needs an SMS provider connected — go to **Authentication →
Providers → Phone** and connect Twilio (or MessageBird/Vonage). Without this
configured, the "Send OTP" button will return an error. There's a per-SMS
cost from the provider once live.

### Turning on Google / Facebook

Go to **Authentication → Providers** in Supabase, enable Google and
Facebook, and paste in the Client ID/Secret from each platform's developer
console. Each provider needs your Supabase callback URL
(`https://<project-ref>.supabase.co/auth/v1/callback`) registered as an
authorized redirect URI on their side.

### Email sending

Supabase's default email sender is shared and rate-limited — fine for
development. Add a custom SMTP provider under **Project Settings → Auth →
SMTP Settings** before launch so confirmation emails land reliably and carry
your own domain.

## Database — Prisma

Prisma manages the products/orders/customers schema, connected to the same
Postgres database Supabase already gives you. `prisma/schema.prisma` has the
full model set (products, variants, categories, collections, orders, order
items, addresses, wishlist, coupons) matching the developer brief.

**One-time setup:**

1. In Supabase, go to **Project Settings → Database → Connection string**.
   Copy both the **pooled** connection (port 6543) and the **direct**
   connection (port 5432).
2. In `.env.local`, fill in `DATABASE_URL` (pooled) and `DIRECT_URL` (direct)
   using those, with your real database password.

**Commands you'll actually run:**

```bash
# Generates the typed Prisma Client from schema.prisma — runs automatically
# after npm install, but rerun manually anytime you edit the schema
npx prisma generate

# Creates and applies a migration from your schema changes — use this
# whenever you add/change a model during development
npx prisma migrate dev --name describe-your-change

# Opens a GUI at localhost:5555 to browse and edit table data by hand
npx prisma studio

# Applies existing migrations to a fresh database (staging/production) —
# does NOT create new migrations, only replays what's already committed
npx prisma migrate deploy

# Pulls an existing database's structure into schema.prisma — useful if
# tables already exist in Supabase and you want Prisma to catch up
npx prisma db pull
```

**Typical first run:**

```bash
npx prisma migrate dev --name init
```

This reads `schema.prisma`, creates all the tables in your Supabase
database, and generates the client so `import { prisma } from '@/lib/prisma'`
works in your API routes and Server Components.

**Important — `profiles.id` isn't created by Prisma.** It's meant to mirror
Supabase's own `auth.users.id` for each signed-up user. After
`migrate dev`, add a Postgres trigger (in the Supabase SQL editor) that
inserts a matching `profiles` row whenever a new `auth.users` row is
created — otherwise you'll get foreign-key errors the first time an order
or wishlist item references a brand-new user.

## Forgot password

`/reset-password` — user enters their email, gets a reset link.
`/reset-password/confirm` — the link lands here (via `/auth/callback`) and
lets them set a new password. Both are fully working, no extra setup needed
beyond email sending (see the SMTP note above).

## Phone (OTP) login — currently hidden

The Phone tab is built but switched off until Twilio is connected, so the
UI only shows Email + Google + Facebook for now. To bring it back once
Twilio is set up: open `components/auth-form.tsx` and flip
`PHONE_AUTH_ENABLED` to `true` near the top of the file. No other code
changes needed — the OTP send/verify logic is already in place.

## Notes for the next build phase

- User profile fields beyond `full_name` (phone, addresses) should live in a
  `profiles` table keyed on `auth.users.id`, not in Supabase auth metadata.
- Once the products/orders schema exists, extend `/account` to show real
  order history and saved addresses per the developer brief.
