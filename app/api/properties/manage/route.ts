import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { databaseConfigured, db } from '@/lib/db'
import { amenitiesMapping, pgRoomConfigurations, properties } from '@/lib/db/schema'

async function currentUserId() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    return session?.user?.id
  } catch {
    return undefined
  }
}

const clean = (value: unknown, max = 180) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function POST(request: Request) {
  if (!databaseConfigured) return NextResponse.json({ error: 'Listing storage is not configured. Add DATABASE_URL and apply the marketplace migration.' }, { status: 503 })
  const ownerId = await currentUserId()
  if (!ownerId) return NextResponse.json({ error: 'Sign in to submit a property for verification.' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Please submit valid listing details.' }, { status: 400 })

  const title = clean(body.title, 120)
  const description = clean(body.description, 4000)
  const locality = clean(body.locality, 100)
  const type = clean(body.type, 32).toLowerCase()
  const purpose = clean(body.purpose, 16).toLowerCase()
  const price = Number(body.price)
  const area = Number(body.area || 0)
  const bedrooms = Number(body.bedrooms || 0)
  const bathrooms = Number(body.bathrooms || 0)
  const allowedTypes = ['apartment', 'room', 'pg', 'builder-floor', 'plot', 'commercial']
  if (title.length < 8 || locality.length < 2 || !allowedTypes.includes(type) || !['rent', 'sale', 'pg'].includes(purpose) || !Number.isInteger(price) || price < 1000 || price > 1000000000) {
    return NextResponse.json({ error: 'Add a descriptive title, Gurugram locality, valid property type, and a price between ₹1,000 and ₹100 crore.' }, { status: 400 })
  }
  const features = Array.isArray(body.amenities) ? body.amenities.map((item: unknown) => clean(item, 48)).filter(Boolean).slice(0, 24) : []
  const images = Array.isArray(body.images) ? body.images.map((item: unknown) => clean(item, 1000)).filter((item: string) => /^https:\/\//i.test(item)).slice(0, 20) : []
  const id = randomUUID()
  const ownerType = body.ownerType === 'agent' ? 'agent' : 'owner'
  const brokerage = body.brokerage === 'owner' ? 'owner' : 'agent'
  try {
    const [property] = await db.insert(properties).values({
      id, ownerId, title, description, type, purpose, locality, city: 'Gurugram', society: clean(body.society, 120) || null,
      price, bedrooms: Number.isInteger(bedrooms) && bedrooms >= 0 ? Math.min(bedrooms, 20) : 0,
      bathrooms: Number.isInteger(bathrooms) && bathrooms >= 0 ? Math.min(bathrooms, 20) : 0,
      area: Number.isInteger(area) && area >= 0 ? Math.min(area, 1000000) : 0,
      status: 'pending_verification', images, amenities: features, ownerType, brokerage,
      tenantPreference: ['family', 'bachelor', 'working-professionals'].includes(body.tenantPreference) ? body.tenantPreference : 'any',
      maintenance: Number.isInteger(Number(body.maintenance)) && Number(body.maintenance) >= 0 ? Number(body.maintenance) : null,
      deposit: Number.isInteger(Number(body.deposit)) && Number(body.deposit) >= 0 ? Number(body.deposit) : null,
      furnishing: ['unfurnished', 'semi-furnished', 'furnished'].includes(body.furnishing) ? body.furnishing : null,
      powerBackup: ['none', 'partial', 'full'].includes(body.powerBackup) ? body.powerBackup : null,
      waterSource: ['municipal', 'borewell', 'tanker', 'mixed'].includes(body.waterSource) ? body.waterSource : null,
      security: Array.isArray(body.security) ? body.security.map((item: unknown) => clean(item, 40)).filter(Boolean).slice(0, 8) : [],
      latitude: body.latitude !== '' && body.latitude != null && Number.isFinite(Number(body.latitude)) && Math.abs(Number(body.latitude)) <= 90 ? Number(body.latitude) : null,
      longitude: body.longitude !== '' && body.longitude != null && Number.isFinite(Number(body.longitude)) && Math.abs(Number(body.longitude)) <= 180 ? Number(body.longitude) : null,
      nearestTransit: clean(body.nearestTransit, 100) || null,
      transitDistanceMeters: body.transitDistanceMeters !== '' && body.transitDistanceMeters != null && Number.isInteger(Number(body.transitDistanceMeters)) && Number(body.transitDistanceMeters) >= 0 && Number(body.transitDistanceMeters) <= 50000 ? Number(body.transitDistanceMeters) : null,
      contactPhone: /^\+?[0-9\s-]{8,18}$/.test(clean(body.contactPhone, 20)) ? clean(body.contactPhone, 20) : null,
    }).returning()
    if (features.length) await db.insert(amenitiesMapping).values(features.map((amenity: string) => ({ id: randomUUID(), propertyId: id, amenity, category: 'general' })))
    if (purpose === 'pg' || type === 'pg' || type === 'room') await db.insert(pgRoomConfigurations).values({ id: randomUUID(), propertyId: id, roomType: clean(body.roomType, 32) || 'private', totalBeds: Math.max(1, Math.min(20, Number(body.totalBeds) || 1)), availableBeds: Math.max(0, Math.min(20, Number(body.availableBeds) || 1)), genderPolicy: clean(body.genderPolicy, 24) || 'any', mealsIncluded: body.mealsIncluded === true, occupancy: clean(body.occupancy, 40) || null })
    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error('Property submission failed', error)
    return NextResponse.json({ error: 'Could not save this listing. Confirm the marketplace migration has been applied.' }, { status: 503 })
  }
}

export async function DELETE(request: Request) {
  if (!databaseConfigured) return NextResponse.json({ error: 'Listing storage is not configured.' }, { status: 503 })
  const ownerId = await currentUserId()
  if (!ownerId) return NextResponse.json({ error: 'Sign in to manage listings.' }, { status: 401 })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing listing id.' }, { status: 400 })
  try {
    await db.delete(properties).where(and(eq(properties.id, id), eq(properties.ownerId, ownerId)))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Property removal failed', error)
    return NextResponse.json({ error: 'Could not remove this listing.' }, { status: 503 })
  }
}
