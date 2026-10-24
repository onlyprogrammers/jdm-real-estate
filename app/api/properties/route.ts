import { NextResponse } from 'next/server'
import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm'
import { databaseConfigured, db } from '@/lib/db'
import { properties } from '@/lib/db/schema'

export async function GET(request: Request) {
  if (!databaseConfigured) return NextResponse.json({ properties: [], total: 0, page: 1, pageSize: 20, databaseConfigured: false, message: 'Add DATABASE_URL and apply the marketplace migration to load live listings.' }, { status: 503 })
  const params = new URL(request.url).searchParams
  const q = params.get('q')?.trim()
  const purpose = params.get('purpose')
  const type = params.get('type')
  const locality = params.get('locality')
  const brokerage = params.get('brokerage')
  const preference = params.get('preference')
  const transit = params.get('transit')
  const transitMaxDistance = Number(params.get('transitMaxDistance'))
  const minPrice = Number(params.get('minPrice'))
  const maxPrice = Number(params.get('maxPrice'))
  const bedrooms = Number(params.get('bedrooms'))
  const page = Math.max(1, Math.min(500, Number(params.get('page')) || 1))
  const pageSize = Math.max(1, Math.min(40, Number(params.get('pageSize')) || 20))
  const conditions = [eq(properties.status, 'published')]
  const ids = params.get('ids')?.split(',').filter((id) => /^[0-9a-f-]{36}$/i.test(id)).slice(0, 40)
  if (ids?.length) conditions.push(inArray(properties.id, ids))
  if (purpose && ['rent', 'sale', 'pg'].includes(purpose)) conditions.push(eq(properties.purpose, purpose))
  if (type && /^[a-z-]{1,32}$/i.test(type)) conditions.push(eq(properties.type, type))
  if (locality) conditions.push(ilike(properties.locality, `%${locality.slice(0, 80)}%`))
  if (brokerage === 'owner') conditions.push(eq(properties.brokerage, 'owner'))
  if (preference && ['family', 'bachelor', 'working-professionals', 'any'].includes(preference)) conditions.push(eq(properties.tenantPreference, preference))
  if (transit) conditions.push(ilike(properties.nearestTransit, `%${transit.slice(0, 80)}%`))
  if (Number.isFinite(transitMaxDistance) && transitMaxDistance > 0) conditions.push(lte(properties.transitDistanceMeters, transitMaxDistance))
  if (Number.isFinite(minPrice) && minPrice >= 0) conditions.push(gte(properties.price, minPrice))
  if (Number.isFinite(maxPrice) && maxPrice > 0) conditions.push(lte(properties.price, maxPrice))
  if (Number.isFinite(bedrooms) && bedrooms > 0) conditions.push(gte(properties.bedrooms, bedrooms))
  if (params.get('immediate') === 'true') conditions.push(or(sql`${properties.moveInDate} is null`, lte(properties.moveInDate, new Date()))!)
  if (q) conditions.push(or(ilike(properties.title, `%${q.slice(0, 100)}%`), ilike(properties.locality, `%${q.slice(0, 100)}%`), ilike(properties.society, `%${q.slice(0, 100)}%`), ilike(properties.description, `%${q.slice(0, 100)}%`))!)

  const lat = Number(params.get('lat'))
  const lng = Number(params.get('lng'))
  const radius = Math.max(100, Math.min(50000, Number(params.get('radius')) || 1500))
  if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    conditions.push(sql`${properties.latitude} is not null and ${properties.longitude} is not null and ST_DWithin(ST_SetSRID(ST_MakePoint(${properties.longitude}, ${properties.latitude}), 4326)::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})`)
  }
  try {
    const where = and(...conditions)
    const rows = await db.select().from(properties).where(where).orderBy(desc(properties.createdAt)).limit(pageSize).offset((page - 1) * pageSize)
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(properties).where(where)
    return NextResponse.json({ properties: rows, total, page, pageSize, databaseConfigured: true })
  } catch (error) {
    console.error('Property search failed', error)
    return NextResponse.json({ error: 'Listings are temporarily unavailable. Check the database migration and connection.' }, { status: 503 })
  }
}
