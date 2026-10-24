-- JDM Homes marketplace expansion. Apply after the existing Better Auth/property schema.
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS society text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "ownerType" text NOT NULL DEFAULT 'owner';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "tenantPreference" text NOT NULL DEFAULT 'any';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS brokerage text NOT NULL DEFAULT 'agent';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS maintenance integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnishing text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "moveInDate" timestamptz;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "powerBackup" text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "waterSource" text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS security jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "nearestTransit" text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "transitDistanceMeters" integer;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "contactPhone" text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS "verifiedAt" timestamptz;

-- The coordinate expression index supports the ST_DWithin geography filter used by search.
CREATE INDEX IF NOT EXISTS properties_geography_idx ON properties USING gist
  ((ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography))
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS properties_search_idx ON properties (city, purpose, status, price);
CREATE INDEX IF NOT EXISTS properties_locality_idx ON properties (locality);
CREATE INDEX IF NOT EXISTS properties_owner_idx ON properties ("ownerId");

CREATE TABLE IF NOT EXISTS localities (
  id text PRIMARY KEY,
  state text NOT NULL DEFAULT 'Haryana',
  city text NOT NULL DEFAULT 'Gurugram',
  name text NOT NULL,
  slug text NOT NULL,
  "parentName" text,
  latitude double precision,
  longitude double precision,
  landmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city, slug)
);
CREATE INDEX IF NOT EXISTS localities_city_idx ON localities (city);

CREATE TABLE IF NOT EXISTS amenities_mapping (
  id text PRIMARY KEY,
  "propertyId" text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  UNIQUE ("propertyId", amenity)
);
CREATE INDEX IF NOT EXISTS amenities_property_idx ON amenities_mapping ("propertyId");

CREATE TABLE IF NOT EXISTS pg_room_configurations (
  id text PRIMARY KEY,
  "propertyId" text NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  "roomType" text NOT NULL DEFAULT 'private',
  "totalBeds" integer NOT NULL DEFAULT 1,
  "availableBeds" integer NOT NULL DEFAULT 1,
  "genderPolicy" text NOT NULL DEFAULT 'any',
  "mealsIncluded" boolean NOT NULL DEFAULT false,
  occupancy text
);

CREATE TABLE IF NOT EXISTS leads_tracker (
  id text PRIMARY KEY,
  "propertyId" text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  "userId" text,
  channel text NOT NULL DEFAULT 'web',
  event text NOT NULL DEFAULT 'inquiry',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_property_created_idx ON leads_tracker ("propertyId", "createdAt");

-- Standardize old admin-created category values before new filters are used.
UPDATE properties SET purpose = 'sale' WHERE purpose = 'buy';
UPDATE properties SET purpose = 'pg' WHERE purpose = 'co-living';

