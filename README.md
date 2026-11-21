# Not Alone at Midnight

A quiet website for people carrying grief, loneliness, anxiety, or a hard night.
Built with Next.js 14, Supabase, and Vercel.

## What is functional

- **Blog publishing**: write, save drafts, publish, unpublish, and delete posts at `/admin`. Posts use Markdown.
- **Newsletter signup**: forms on the home, blog, article, book, and about pages. Stores emails, ignores duplicates, supports one-click unsubscribe, and has a CSV export in admin.
- **Book landing page**: `/book`, with a "notify me" list tracked separately (the `source` column on each subscriber).
- **Contact form**: messages are saved and appear in admin.
- Also included: RSS feed, sitemap, robots.txt, and an optional welcome email through Resend.

## Run it on your computer (step by step)

1. Open a terminal in this folder.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open http://localhost:3000.

With no setup, it uses a local file (`.data/store.json`) so everything works right away.

To try the admin area locally:

1. Copy `.env.example` to `.env.local`.
2. Set `ADMIN_PASSWORD` to a long passphrase and `SESSION_SECRET` to any long random string.
3. Restart `npm run dev`, then go to http://localhost:3000/admin.

## Put it live (step by step)

### 1. Create the database
1. In Supabase, create a new project.
2. Open **SQL Editor**, click **New query**.
3. Paste everything from `supabase/schema.sql` and click **Run**.
4. Open **Project Settings > API** and copy the **Project URL** and the **service_role** key.

### 2. Deploy to Vercel
1. Push this folder to a new GitHub repository.
2. In Vercel, click **Add New > Project** and import the repository.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SITE_URL` (your real address, e.g. https://yourdomain.com)
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
4. Click **Deploy**.

### 3. Load the starter articles
On your computer, with the same Supabase values set in your terminal, run `npm run seed`.
This adds the five starter articles. It is safe to run twice and never overwrites edits.

### 4. Optional: email
Add `RESEND_API_KEY`, `EMAIL_FROM`, and `CONTACT_TO_EMAIL` in Vercel to send a welcome email
to new subscribers and get contact messages in your inbox. Without them the site still works.

## Where to change the words

- `lib/site.ts`: site name, tagline, book details and themes, crisis lines, navigation.
- `content/seed-posts.mjs`: the starter articles (or edit them in `/admin` after seeding).
- `app/about/page.tsx`: the About page. Please replace it with your own story.
- `app/resources/page.tsx`: the resource list. Please confirm phone numbers and links before launch.

## Security notes

- The database is only reached from the server. Row level security blocks the public key entirely.
- Admin uses a password plus a signed, httpOnly session cookie. Use a long passphrase.
- Article HTML is sanitized, so scripts in a post body are stripped.
- Forms include a honeypot field and a basic rate limit.
