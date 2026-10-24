import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const databaseConfigured = Boolean(process.env.DATABASE_URL)
export const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://localhost/jdm_homes_unconfigured' })
export const db = drizzle(pool, { schema })
