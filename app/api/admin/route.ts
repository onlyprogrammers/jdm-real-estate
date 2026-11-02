import { and, count, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { databaseConfigured, db } from '@/lib/db'
import { leadsTracker, properties } from '@/lib/db/schema'

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
    const [all, active, pending, leadCount, pendingItems, recentLeads] = await Promise.all([
      db.select({ value: count() }).from(properties),
      db.select({ value: count() }).from(properties).where(eq(properties.status, 'published')),
      db.select({ value: count() }).from(properties).where(eq(properties.status, 'pending_verification')),
      db.select({ value: count() }).from(leadsTracker),
      db.select().from(properties).where(eq(properties.status, 'pending_verification')).orderBy(desc(properties.createdAt)).limit(50),
      db.select().from(leadsTracker).orderBy(desc(leadsTracker.createdAt)).limit(20),
    ])
    return NextResponse.json({ stats: { all: all[0].value, active: active[0].value, pending: pending[0].value, leads: leadCount[0].value }, pending: pendingItems, leads: recentLeads })
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
  const status = body?.status === 'published' ? 'published' : body?.status === 'rejected' ? 'rejected' : ''
  if (!id || !status) return NextResponse.json({ error: 'Choose a listing and valid review decision.' }, { status: 400 })
  try {
    const [property] = await db.update(properties).set({ status, ...(status === 'published' ? { verifiedAt: new Date(), updatedAt: new Date() } : { updatedAt: new Date() }) }).where(and(eq(properties.id, id), eq(properties.status, 'pending_verification'))).returning()
    if (!property) return NextResponse.json({ error: 'This listing is no longer awaiting review.' }, { status: 409 })
    return NextResponse.json({ property })
  } catch (error) {
    console.error('Admin listing review failed', error)
    return NextResponse.json({ error: 'Could not update this listing.' }, { status: 503 })
  }
}
