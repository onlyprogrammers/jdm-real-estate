# Supabase setup

This project uses Supabase Postgres for listings and Better Auth, and Supabase Storage for uploaded property photos. The app keeps its existing Drizzle database layer.

## 1. Create the database

Create a Supabase project, then open **SQL Editor** and run `drizzle/0002_fresh_supabase.sql` for a new project. This creates the app and authentication tables, including the marketplace fields. If this is an existing JDM database, leave its existing tables in place and run `drizzle/0001_marketplace.sql` only if those marketplace columns are missing.

Copy the Postgres connection string from **Project Settings → Database → Connection string**. Use the pooler connection for serverless hosting, and preserve its SSL settings. Set it as `DATABASE_URL` in the local environment and your hosting provider's server environment. The app uses the same database for Better Auth and Drizzle.

Generate a long random value for `BETTER_AUTH_SECRET` and set `BETTER_AUTH_URL` to the deployed site origin (for example, `https://your-domain.example`). Never commit these values.

## 2. Create the image bucket

In **Storage**, create a bucket named `property-images` and make it public so published listing photos can be delivered by a stable CDN URL. Set the maximum object size to 8 MB and allow only `image/jpeg`, `image/png`, `image/webp`, and `image/avif`.

The app asks its server for a one-time signed upload URL after the owner signs in. The browser uploads directly to Storage; the database stores the resulting public image URL in the property's `images` JSON field. Keep both the secret API key and service role JWT server-only. Do not add a `NEXT_PUBLIC_` prefix to either or expose them in browser code.

## 3. Configure environment values

Copy `.env.example` to `.env.local` and fill in these values locally. Add the same values to the hosting provider's environment settings for production:

```dotenv
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-server-only-secret-key
SUPABASE_SERVICE_ROLE_KEY=your-legacy-service-role-jwt
SUPABASE_STORAGE_BUCKET=property-images
SUPABASE_JWKS_URL=https://your-project-ref.supabase.co/auth/v1/.well-known/jwks.json
```

Use your Supabase project's **Project URL**, publishable key, secret API key, and legacy `service_role` JWT from its API settings. The publishable key is safe to expose in a browser but is not needed for signed uploads. Supabase Storage requires a JWT in the `Authorization` header: the upload route sends `SUPABASE_SECRET_KEY` as `apikey` and `SUPABASE_SERVICE_ROLE_KEY` as the bearer JWT. The new `sb_secret_...` value is not a JWT and cannot fill both roles. Keep both server keys private and never prefix them with `NEXT_PUBLIC_`. Restart the local app after changing `.env.local`.

`DATABASE_URL` and `BETTER_AUTH_SECRET` are also required for account creation and sign-in. The URL/key you supplied are not database credentials, so they cannot replace the Postgres connection string or auth secret. Use the database connection string from **Project Settings → Database** and a newly generated random auth secret. Do not paste either secret into chat or commit it.

## Free-tier notes

Supabase currently lists 500 MB database size, 1 GB Storage, and a combined 10 GB monthly egress allowance on its Free plan. Free projects may pause after inactivity, and quotas can change; check the current [Supabase billing limits](https://supabase.com/docs/guides/platform/billing-on-supabase) before relying on it for production. The app caps each uploaded image at 8 MB and each listing at 8 photos to keep uploads manageable.
