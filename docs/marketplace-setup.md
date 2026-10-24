# JDM Homes marketplace setup

## What is wired up

- Property search reads published properties from PostgreSQL and supports purpose, keyword, type, budget, bedroom count, brokerage, tenant preference, move-in availability, transit anchors and pagination.
- Transit anchor and distance fields support filters such as within 1.5 km of HUDA City Centre or Rapid Metro. These are lister-provided distances; verify them before publication. Property coordinates enable the separate radius query.
- When latitude and longitude are supplied to `GET /api/properties`, the search applies a PostGIS `ST_DWithin` radius condition. Radius is in metres; the default is 1,500 m. The migration adds the matching geography expression index.
- Listing submissions require a Better Auth session, validate listing fields and start in `pending_verification`. Pending listings are intentionally excluded from public search.
- PG and shared-room bed counts are stored in `pg_room_configurations`, separate from complete-flat bedroom counts. Amenity mapping, locality references and contact-event tracking have their own tables.
- Saved and compare selections persist in the current browser. WhatsApp and call actions create lead events when the database is configured.

## Database setup

1. Create a PostgreSQL database on a provider that supports PostGIS (for example, Supabase or Neon) and set `DATABASE_URL` in the server environment. Also configure a strong `BETTER_AUTH_SECRET` and the deployed origin as `BETTER_AUTH_URL` for sign-in and protected posting.
2. Apply `drizzle/0001_marketplace.sql` to the existing JDM Homes database. This is an additive migration for the current Better Auth and properties schema. Make a database backup before applying it to production.
3. Enable the PostGIS extension in the provider dashboard first if the database role cannot run `CREATE EXTENSION` itself.
4. Start the Next.js app. Search and listing endpoints return an explicit unavailable response while `DATABASE_URL` is absent; they do not substitute fake live inventory.

The migration assumes the current app's existing tables (`user`, `session`, `account`, `verification`, `properties`, `saved_properties`, and `inquiries`) have already been created. Keep the existing camel-case Better Auth column names intact.

## External services

- Image upload is not active. The posting form accepts an HTTPS cover-image URL until a storage provider is configured. For uploads, add Cloudinary credentials server-side and implement signed upload flows; do not place API secrets in client code.
- WhatsApp buttons use the listing's supplied contact number and a `wa.me` link. Automated tenant matching requires a WhatsApp Business API provider, an approved template, consent capture, and server-side credentials. No credentials or outbound automation are assumed here.
- Owner identity checks and duplicate/fraud screening require operational review or a configured verification provider. The current product workflow holds new submissions in a pending queue; it does not claim automated verification.

## Search API

`GET /api/properties` accepts `q`, `purpose` (`rent`, `sale`, `pg`), `type`, `locality`, `minPrice`, `maxPrice`, `bedrooms`, `brokerage=owner`, `preference`, `transit`, `transitMaxDistance`, `immediate=true`, `page`, `pageSize`, and optional `lat`, `lng`, `radius`. Page size is capped at 40. `ids` is supported for browser shortlists.

The search's distance condition uses `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography` on the stored property coordinates. Keep longitude first in `ST_MakePoint`.

## Trust workflow follow-up

Before launch, add an admin-only moderation action to review `pending_verification` posts, record verification evidence, and change approved posts to `published`. For duplicate detection, compare normalized phone number, title/locality, price, and image hashes, then route likely matches to manual review. Add rate limits to anonymous lead events before exposing them to high traffic.
