import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { databaseConfigured, db } from '@/lib/db'
import { leadsTracker, properties } from '@/lib/db/schema'

export async function POST(request: Request) {
  if (!databaseConfigured) return NextResponse.json({ error: 'Lead tracking is not configured.' }, { status: 503 })
  const body = await request.json().catch(() => null)
  const propertyId = typeof body?.propertyId === 'string' ? body.propertyId.slice(0, 80) : ''
  const event = ['whatsapp_click', 'call_click', 'inquiry'].includes(body?.event) ? body.event : ''
  if (!propertyId || !event) return NextResponse.json({ error: 'A listing and contact action are required.' }, { status: 400 })
  try {
    const [listing] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, propertyId)).limit(1)
    if (!listing) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    let userId: string | undefined
    try { userId = (await auth.api.getSession({ headers: await headers() }))?.user?.id } catch { /* Anonymous viewing is supported. */ }
    await db.insert(leadsTracker).values({ id: randomUUID(), propertyId, userId, channel: 'web', event, metadata: { referrer: request.headers.get('referer')?.slice(0, 300) || null } })
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Lead tracking failed', error)
    return NextResponse.json({ error: 'Could not record this contact action.' }, { status: 503 })
  }
}
