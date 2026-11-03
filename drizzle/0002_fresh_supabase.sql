-- Bootstrap the application tables for a fresh Supabase Postgres project.
-- For an existing JDM database, do not run this file; apply 0001_marketplace.sql instead.
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false, image text,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS "session" (
  id text PRIMARY KEY, "expiresAt" timestamp NOT NULL, token text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_userId_idx ON "session"("userId");
CREATE TABLE IF NOT EXISTS "account" (
  id text PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, "accessToken" text,
  "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp, scope text, password text,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_userId_idx ON "account"("userId");
CREATE TABLE IF NOT EXISTS "verification" (
  id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL, "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id text PRIMARY KEY, "ownerId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title text NOT NULL, description text NOT NULL DEFAULT '', type text NOT NULL,
  purpose text NOT NULL DEFAULT 'rent', city text NOT NULL DEFAULT 'Gurugram', locality text NOT NULL,
  society text, price integer NOT NULL, bedrooms integer NOT NULL DEFAULT 0,
  bathrooms integer NOT NULL DEFAULT 0, area integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft', images jsonb NOT NULL DEFAULT '[]'::jsonb,
  amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  "ownerType" text NOT NULL DEFAULT 'owner', "tenantPreference" text NOT NULL DEFAULT 'any',
  brokerage text NOT NULL DEFAULT 'agent', maintenance integer, deposit integer, furnishing text,
  "moveInDate" timestamp, "powerBackup" text, "waterSource" text,
  security jsonb NOT NULL DEFAULT '[]'::jsonb, latitude double precision, longitude double precision,
  "nearestTransit" text, "transitDistanceMeters" integer, "contactPhone" text,
  "verifiedAt" timestamp, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS properties_search_idx ON properties (city, purpose, status, price);
CREATE INDEX IF NOT EXISTS properties_locality_idx ON properties (locality);
CREATE INDEX IF NOT EXISTS properties_owner_idx ON properties ("ownerId");
CREATE INDEX IF NOT EXISTS properties_geography_idx ON properties USING gist
  ((ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography))
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE TABLE IF NOT EXISTS localities (
  id text PRIMARY KEY, state text NOT NULL DEFAULT 'Haryana', city text NOT NULL DEFAULT 'Gurugram',
  name text NOT NULL, slug text NOT NULL, "parentName" text, latitude double precision,
  longitude double precision, landmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now(), UNIQUE (city, slug)
);
CREATE INDEX IF NOT EXISTS localities_city_idx ON localities (city);
CREATE TABLE IF NOT EXISTS amenities_mapping (
  id text PRIMARY KEY, "propertyId" text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity text NOT NULL, category text NOT NULL DEFAULT 'general', UNIQUE ("propertyId", amenity)
);
CREATE INDEX IF NOT EXISTS amenities_property_idx ON amenities_mapping ("propertyId");
CREATE TABLE IF NOT EXISTS pg_room_configurations (
  id text PRIMARY KEY, "propertyId" text NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  "roomType" text NOT NULL DEFAULT 'private', "totalBeds" integer NOT NULL DEFAULT 1,
  "availableBeds" integer NOT NULL DEFAULT 1, "genderPolicy" text NOT NULL DEFAULT 'any',
  "mealsIncluded" boolean NOT NULL DEFAULT false, occupancy text
);
CREATE TABLE IF NOT EXISTS saved_properties (
  id text PRIMARY KEY, "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "propertyId" text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  "createdAt" timestamp NOT NULL DEFAULT now(), UNIQUE ("userId", "propertyId")
);
CREATE TABLE IF NOT EXISTS inquiries (
  id text PRIMARY KEY, "propertyId" text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  "userId" text REFERENCES "user"(id) ON DELETE SET NULL, name text NOT NULL, email text NOT NULL,
  phone text, message text NOT NULL, status text NOT NULL DEFAULT 'new',
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leads_tracker (
  id text PRIMARY KEY, "propertyId" text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  "userId" text REFERENCES "user"(id) ON DELETE SET NULL, channel text NOT NULL DEFAULT 'web',
  event text NOT NULL DEFAULT 'inquiry', metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_property_created_idx ON leads_tracker ("propertyId", "createdAt");
