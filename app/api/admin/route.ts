import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { databaseConfigured, db } from '@/lib/db'
import { leadsTracker, properties, user } from '@/lib/db/schema'

async function authorized() {
  const configured = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  if (!configured.length) return { ok: false as const, status: 503, error: 'Admin access is not configured. Add ADMIN_EMAILS on the server.' }
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.email || !configured.includes(session.user.email.toLowerCase())) return { ok: false as const, status: 403, error: 'An administrator account is required.' }
    return { ok: true as const }
  } catch {
    return { ok: false as const, status: 401, error: 'Sign in with an administrator account.' }
  }
}

export async function GET() {
  const access = await authorized()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!databaseConfigured) return NextResponse.json({ error: 'Listing storage is not configured.' }, { status: 503 })
  try {
    const [all, active, pending, leadCount, pendingItems, allItems, recentLeads] = await Promise.all([
      db.select({ value: count() }).from(properties),
      db.select({ value: count() }).from(properties).where(eq(properties.status, 'published')),
      db.select({ value: count() }).from(properties).where(eq(properties.status, 'pending_verification')),
      db.select({ value: count() }).from(leadsTracker),
      db.select({ property: properties, owner: { name: user.name, email: user.email } }).from(properties).leftJoin(user, eq(properties.ownerId, user.id)).where(eq(properties.status, 'pending_verification')).orderBy(desc(properties.createdAt)).limit(50),
      db.select({ property: properties, owner: { name: user.name, email: user.email } }).from(properties).leftJoin(user, eq(properties.ownerId, user.id)).orderBy(desc(properties.createdAt)).limit(100),
      db.select().from(leadsTracker).orderBy(desc(leadsTracker.createdAt)).limit(20),
    ])
    const attachOwner = (rows: typeof pendingItems) => rows.map(({ property, owner }) => ({ ...property, owner }))
    return NextResponse.json({
      stats: { all: all[0].value, active: active[0].value, pending: pending[0].value, leads: leadCount[0].value },
      pending: attachOwner(pendingItems), properties: attachOwner(allItems), leads: recentLeads,
    })
  } catch (error) {
    console.error('Admin dashboard load failed', error)
    return NextResponse.json({ error: 'Could not load the admin workspace.' }, { status: 503 })
  }
}

export async function PATCH(request: Request) {
  const access = await authorized()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!databaseConfigured) return NextResponse.json({ error: 'Listing storage is not configured.' }, { status: 503 })
  const body = await request.json().catch(() => null)
  const id = typeof body?.id === 'string' ? body.id.slice(0, 80) : ''
  const status = ['published', 'rejected', 'sold', 'hidden'].includes(body?.status) ? body.status as 'published' | 'rejected' | 'sold' | 'hidden' : ''
  if (!id || !status) return NextResponse.json({ error: 'Choose a property and valid status.' }, { status: 400 })
  try {
    const [current] = await db.select().from(properties).where(eq(properties.id, id)).limit(1)
    if (!current) return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
    const allowed = status === 'published'
      ? current.status === 'pending_verification' || (current.status === 'hidden' && Boolean(current.verifiedAt))
      : status === 'rejected'
        ? current.status === 'pending_verification'
        : status === 'sold'
          ? current.status === 'published'
          : current.status === 'published'
    if (!allowed) return NextResponse.json({ error: 'This property cannot move to that status.' }, { status: 409 })
    const [property] = await db.update(properties).set({ status, ...(status === 'published' && current.status === 'pending_verification' ? { verifiedAt: new Date() } : {}), updatedAt: new Date() }).where(eq(properties.id, id)).returning()
    return NextResponse.json({ property })
  } catch (error) {
    console.error('Admin listing update failed', error)
    return NextResponse.json({ error: 'Could not update this listing.' }, { status: 503 })
  }
}

export async function DELETE(request: Request) {
  const access = await authorized()
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status })
  if (!databaseConfigured) return NextResponse.json({ error: 'Listing storage is not configured.' }, { status: 503 })
  const id = new URL(request.url).searchParams.get('id')?.slice(0, 80)
  if (!id) return NextResponse.json({ error: 'Missing property id.' }, { status: 400 })
  try {
    const [property] = await db.update(properties).set({ status: 'removed', updatedAt: new Date() }).where(and(eq(properties.id, id), inArray(properties.status, ['pending_verification', 'published', 'rejected', 'hidden', 'sold']))).returning()
    if (!property) return NextResponse.json({ error: 'Property not found or already removed.' }, { status: 404 })
    return NextResponse.json({ property })
  } catch (error) {
    console.error('Admin property removal failed', error)
    return NextResponse.json({ error: 'Could not remove this property.' }, { status: 503 })
  }
}
