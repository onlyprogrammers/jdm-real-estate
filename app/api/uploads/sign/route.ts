import { randomUUID } from 'crypto'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const maxFileBytes = 8 * 1024 * 1024
const mimeExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export async function POST(request: Request) {
  let session
  try {
    session = await auth.api.getSession({ headers: await headers() })
  } catch {
    return NextResponse.json({ error: 'Sign in before uploading photos.' }, { status: 401 })
  }
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in before uploading photos.' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const contentType = typeof body?.contentType === 'string' ? body.contentType.toLowerCase() : ''
  const size = Number(body?.size)
  const extension = mimeExtensions[contentType]
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/$/, '')
  const apiKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  // Storage still requires a JWT in Authorization. A new sb_secret_* key is
  // not a JWT, so pair it with the legacy service_role JWT when using that key format.
  const authorizationKey = process.env.SUPABASE_SERVICE_ROLE_KEY || (apiKey?.startsWith('eyJ') ? apiKey : undefined)
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'property-images'

  if (!extension || !Number.isInteger(size) || size <= 0 || size > maxFileBytes) {
    return NextResponse.json({ error: 'Choose a JPG, PNG, WebP, or AVIF image up to 8 MB.' }, { status: 400 })
  }
  if (!supabaseUrl || !apiKey || !authorizationKey) {
    return NextResponse.json({ error: 'Photo storage needs the Supabase URL, secret API key, and service_role JWT in the server environment.' }, { status: 503 })
  }
  if (authorizationKey.split('.').length !== 3) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY must be the JWT service_role key from Supabase. A generated placeholder cannot authorize Storage.' }, { status: 503 })
  }

  const path = `${session.user.id}/${randomUUID()}.${extension}`
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${encodeURIComponent(bucket)}/${encodedPath}`, {
      method: 'POST',
      // New sb_secret_* keys go in apikey. Storage also requires an auth JWT;
      // use the legacy service_role JWT for that header, never the sb_secret key.
      headers: { apikey: apiKey, authorization: `Bearer ${authorizationKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ upsert: false }),
      cache: 'no-store',
    })
    const data = await response.json().catch(() => null)
    if (!response.ok || typeof data?.url !== 'string' || typeof data?.token !== 'string') {
      console.error('Supabase signed upload URL request failed', response.status, data?.message || data?.error)
      return NextResponse.json({ error: 'Could not prepare this photo upload. Check the Supabase bucket setup.' }, { status: 502 })
    }
    const uploadUrl = new URL(data.url, `${supabaseUrl}/storage/v1/`)
    // Storage returns a relative `/object/...` path, relative to its API base.
    // Prefix the Storage API path when resolving it against the project URL.
    if (!uploadUrl.pathname.startsWith('/storage/v1/')) {
      uploadUrl.pathname = `/storage/v1${uploadUrl.pathname}`
    }
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`
    return NextResponse.json({ uploadUrl: uploadUrl.toString(), token: data.token, path, publicUrl })
  } catch (error) {
    console.error('Supabase upload URL request failed', error)
    return NextResponse.json({ error: 'Photo storage could not be reached. Please try again.' }, { status: 502 })
  }
}
