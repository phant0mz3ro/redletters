# Red Letters

Candlelit shared journal for redhead and jughead. Next.js + Supabase.

## Setup
1. Create a free Supabase project, open SQL Editor, run `sql/schema.sql`.
2. Copy `.env.example` to `.env.local` and fill it in
   (Supabase URL + service role key from Project Settings > API; pick a long random SESSION_SECRET and a passphrase for each of you).
3. Add photos to `public/avatars/` as `redhead.jpg` and `jughead.jpg`.
4. `npm install` then `npm run dev` and open http://localhost:3000

## Deploy (Vercel)
Push to GitHub, import in Vercel, add the same 5 env vars, deploy.
The service role key only lives server-side here; never expose it in client code.
