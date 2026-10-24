import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { query } = await request.json().catch(() => ({ query: '' }))
  const text = String(query || '').toLowerCase()
  const filters = { purpose: text.includes('buy') ? 'sale' : text.includes('rent') ? 'rent' : undefined, type: text.includes('plot') ? 'plot' : text.includes('room') ? 'room' : text.includes('flat') || text.includes('apartment') ? 'apartment' : undefined, locality: text.match(/sector\s*\d+[a-z]?/)?.[0] }
  return NextResponse.json({ filters, message: 'Search intent understood. Results are filtered using your preferences.' })
}
