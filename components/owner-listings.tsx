'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, Building2, Eye, EyeOff, LoaderCircle, Plus, Trash2 } from 'lucide-react'

type OwnerListing = {
  id: string; title: string; locality: string; price: number; purpose: string; type: string; status: string
  images?: string[] | null; createdAt: string; verifiedAt?: string | null
}

const label = (status: string) => ({ pending_verification: 'Awaiting review', published: 'Published', rejected: 'Needs changes', hidden: 'Hidden', sold: 'Sold', removed: 'Removed' }[status] || status.replaceAll('_', ' '))
const price = (value: number, purpose: string) => `₹${new Intl.NumberFormat('en-IN').format(value)}${purpose === 'rent' || purpose === 'pg' ? '/mo' : ''}`

export function OwnerListings({ enabled }: { enabled: boolean }) {
  const [listings, setListings] = useState<OwnerListing[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/properties/manage', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load your listings.')
      setListings(Array.isArray(result.properties) ? result.properties : [])
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load your listings.') }
    finally { setLoading(false) }
  }, [enabled])
  useEffect(() => { void load() }, [load])

  async function update(item: OwnerListing, status: 'sold' | 'hidden' | 'published' | 'remove') {
    if (status === 'remove' && !window.confirm(`Remove “${item.title}” from the marketplace? It will be archived.`)) return
    setBusy(item.id); setError('')
    try {
      const response = await fetch(status === 'remove' ? `/api/properties/manage?id=${encodeURIComponent(item.id)}` : '/api/properties/manage', {
        method: status === 'remove' ? 'DELETE' : 'PATCH',
        ...(status !== 'remove' ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id, status }) } : {}),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update this listing.')
      if (status === 'remove') setListings(current => current.map(listing => listing.id === item.id ? { ...listing, status: 'removed' } : listing))
      else setListings(current => current.map(listing => listing.id === item.id ? { ...listing, status } : listing))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update this listing.') }
    finally { setBusy('') }
  }

  if (!enabled) return null
  return <section className="mt-6" aria-labelledby="owner-listings-title">
    <div className="flex items-end justify-between gap-3"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.17em] text-[#92784f]">Your homes</p><h2 id="owner-listings-title" className="mt-1 text-xl font-semibold">My listings</h2></div><Link href="/post" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#174936] px-3 text-xs font-bold text-white"><Plus size={14}/>List a property</Link></div>
    {error&&<p role="alert" className="mt-3 rounded-lg border border-[#ead9d4] bg-[#fff8f5] p-3 text-xs text-[#8b4e43]">{error}</p>}
    {loading?<div className="mt-3 flex min-h-24 items-center justify-center rounded-xl border border-[#e1e0d6] bg-[#fffefa] text-xs text-[#788078]"><LoaderCircle size={16} className="mr-2 animate-spin"/>Loading your database listings…</div>:listings.length===0?<div className="mt-3 rounded-xl border border-dashed border-[#d9ddd2] bg-[#fffefa] p-5 text-center"><p className="text-sm font-semibold">No listings yet</p><p className="mt-1 text-xs text-[#788078]">Properties you submit will appear here from the database.</p><Link href="/post" className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-[#d9ddd2] px-3 text-xs font-semibold">Create your first listing</Link></div>:<div className="mt-3 space-y-2">{listings.map(item=><article key={item.id} className="grid gap-3 rounded-xl border border-[#e1e0d6] bg-[#fffefa] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">{item.images?.[0]?<img src={item.images[0]} alt="" className="size-16 shrink-0 rounded-lg object-cover"/>:<div className="grid size-16 shrink-0 place-items-center rounded-lg bg-[#efede6] text-[#897c64]"><Building2 size={21}/></div>}<div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold">{item.title}</h3><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${item.status==='published'?'bg-[#edf4dd] text-[#476223]':item.status==='pending_verification'?'bg-[#f8f0db] text-[#806533]':item.status==='sold'||item.status==='removed'?'bg-[#f0eee9] text-[#74736c]':'bg-[#f9eae6] text-[#8b4e43]'}`}>{label(item.status)}</span></div><p className="mt-1 truncate text-[11px] text-[#788078]">{item.locality} · {price(item.price,item.purpose)} · {item.type.replaceAll('-',' ')}</p><p className="mt-1 text-[10px] text-[#92988f]">Submitted {new Date(item.createdAt).toLocaleDateString('en-IN')}</p></div></div>
      <div className="flex flex-wrap gap-1.5">{item.status==='published'&&<><button onClick={()=>void update(item,'sold')} disabled={busy===item.id} className="min-h-9 rounded-lg border border-[#dfe2d8] px-2.5 text-[10px] font-semibold disabled:opacity-50">Mark sold</button><button onClick={()=>void update(item,'hidden')} disabled={busy===item.id} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#dfe2d8] px-2.5 text-[10px] font-semibold disabled:opacity-50"><EyeOff size={12}/>Hide</button></>}{(item.status==='hidden'||item.status==='sold')&&item.verifiedAt&&<button onClick={()=>void update(item,'published')} disabled={busy===item.id} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#dfe2d8] px-2.5 text-[10px] font-semibold disabled:opacity-50"><Eye size={12}/>Relist</button>}{item.status==='pending_verification'&&<span className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[#f8f0db] px-2.5 text-[10px] font-semibold text-[#806533]"><BadgeCheck size={12}/>Under review</span>}{item.status!=='removed'&&<button onClick={()=>void update(item,'remove')} disabled={busy===item.id} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#ead9d4] px-2.5 text-[10px] font-semibold text-[#8b4e43] disabled:opacity-50"><Trash2 size={12}/>Remove</button>}</div>
    </article>)}</div>}
  </section>
}
