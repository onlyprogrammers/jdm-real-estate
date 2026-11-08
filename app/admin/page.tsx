'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, BadgeCheck, BedDouble, Building2, Check, Clock3, Droplets, LayoutDashboard, LoaderCircle, MapPin, RefreshCw, ShieldCheck, Users, X, Zap, Eye, EyeOff, Trash2, CircleDollarSign } from 'lucide-react'

type Property = {
  id: string; title: string; description?: string | null; locality: string; society?: string | null; city?: string | null
  price: number; purpose: string; type: string; status: string; createdAt: string; updatedAt?: string
  images?: string[] | null; amenities?: string[] | null; security?: string[] | null; ownerId: string
  ownerType?: string; brokerage?: string; tenantPreference?: string; bedrooms?: number; bathrooms?: number; area?: number
  contactPhone?: string | null; maintenance?: number | null; deposit?: number | null; furnishing?: string | null
  moveInDate?: string | null; powerBackup?: string | null; waterSource?: string | null; nearestTransit?: string | null
  transitDistanceMeters?: number | null; latitude?: number | null; longitude?: number | null; verifiedAt?: string | null
  owner?: { name: string | null; email: string | null } | null
}
type Lead = { id: string; propertyId: string; event: string; channel: string; createdAt: string; metadata?: Record<string, unknown> }
type Dashboard = { stats: { all: number; active: number; pending: number; leads: number }; pending: Property[]; properties: Property[]; leads: Lead[] }
type ActionStatus = 'published' | 'rejected' | 'sold' | 'hidden'

const money = (n: number, purpose: string) => purpose === 'rent' || purpose === 'pg' ? `₹${new Intl.NumberFormat('en-IN').format(n)}/mo` : `₹${new Intl.NumberFormat('en-IN').format(n)}`
const statusName = (status: string) => ({ pending_verification: 'Awaiting review', published: 'Published', rejected: 'Rejected', hidden: 'Hidden', sold: 'Sold', removed: 'Removed' }[status] || status.replaceAll('_', ' '))
const dateText = (value?: string | null) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not provided'

export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [selected, setSelected] = useState<Property | null>(null)
  const [section, setSection] = useState<'overview' | 'listings' | 'leads'>('overview')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/admin', { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not load admin data.')
      setData(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load admin data.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!selected) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected])

  async function update(item: Property, status: ActionStatus) {
    setBusy(item.id); setError('')
    try {
      const response = await fetch('/api/admin', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id, status }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update listing.')
      setSelected(null); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update listing.') }
    finally { setBusy('') }
  }

  async function remove(item: Property) {
    if (!window.confirm(`Remove “${item.title}” from the marketplace? It will be archived and can be recovered from the database.`)) return
    setBusy(item.id); setError('')
    try {
      const response = await fetch(`/api/admin?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not remove property.')
      setSelected(null); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not remove property.') }
    finally { setBusy('') }
  }

  const stats = data?.stats
  const sections = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'listings', label: 'Property review', icon: Building2, count: stats?.pending }, { id: 'leads', label: 'Contact activity', icon: Users, count: stats?.leads }]
  return <main className="min-h-screen bg-[#f4f3ef] text-[#202620]">
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex shrink-0 flex-col bg-[#19251f] text-white lg:sticky lg:top-0 lg:h-screen lg:w-[248px]">
        <Link href="/" className="flex items-center gap-3 border-b border-white/10 px-5 py-5"><img src="/jdm-mark.svg" alt="" className="size-10"/><span><strong className="block text-[13px] tracking-[.12em]">JDM <span className="font-normal text-[#d5bd8e]">REAL ESTATE</span></strong><span className="mt-1 block text-[9px] uppercase tracking-[.16em] text-white/45">Administration</span></span></Link>
        <div className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">{sections.map(({ id,label,icon:Icon,count })=><button key={id} onClick={()=>setSection(id as typeof section)} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-xs font-medium transition lg:w-full ${section===id?'bg-white/10 text-white shadow-[inset_2px_0_0_#d5bd8e]':'text-white/55 hover:bg-white/5 hover:text-white'}`}><Icon size={16}/>{label}{count!==undefined&&<span className="ml-auto rounded-full bg-[#d5bd8e] px-2 py-0.5 text-[10px] font-bold text-[#19251f]">{count}</span>}</button>)}</div>
        <div className="mt-auto hidden border-t border-white/10 p-4 lg:block"><div className="flex items-center gap-2 text-[10px] text-white/50"><ShieldCheck size={15} className="text-[#d5bd8e]"/> Restricted admin workspace</div><Link href="/" className="mt-4 flex items-center gap-2 text-xs text-white/70 hover:text-white">View marketplace <ArrowUpRight size={14}/></Link></div>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-[#e3e0d7] bg-[#fbfaf7] px-5 py-4 sm:px-8 lg:px-10"><div><p className="text-[9px] font-semibold uppercase tracking-[.19em] text-[#92784f]">JDM operations</p><h1 className="mt-1 font-serif text-2xl">{section==='overview'?'Overview':section==='listings'?'Property review':'Contact activity'}</h1></div><button onClick={()=>void load()} disabled={loading} className="flex size-10 items-center justify-center rounded-lg border border-[#e1ded5] text-[#49564c] transition hover:border-[#c9c0ad] hover:bg-white" aria-label="Refresh dashboard"><RefreshCw size={16} className={loading?'animate-spin':''}/></button></header>
        <div className="mx-auto max-w-[1440px] p-4 sm:p-7 lg:p-10">
          {error&&<div role="alert" className="mb-5 border border-[#e8d7d3] bg-[#fff8f5] px-4 py-3 text-sm text-[#814b43]">{error}{error.includes('administrator')||error.includes('Sign in')?<Link href="/login" className="ml-2 font-semibold underline">Sign in</Link>:null}</div>}
          {!data&&loading?<div className="flex min-h-56 items-center justify-center text-sm text-[#778078]"><LoaderCircle className="mr-2 animate-spin" size={18}/>Loading workspace…</div>:!data?<div className="border border-[#e5e1d8] bg-white p-6"><h2 className="font-serif text-xl">Admin access needed</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#6f786f]">Sign in with an account included in the server’s <code>ADMIN_EMAILS</code> setting. This dashboard is protected on the server.</p><Link href="/login" className="mt-4 inline-flex min-h-10 items-center bg-[#26372e] px-4 text-xs font-semibold text-white">Go to sign in</Link></div>:<>
            {(section==='overview'||section==='listings')&&<>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{label:'All properties',value:stats?.all??0,icon:Building2},{label:'Published',value:stats?.active??0,icon:Check},{label:'Awaiting review',value:stats?.pending??0,icon:Clock3},{label:'Contact events',value:stats?.leads??0,icon:Users}].map(({label,value,icon:Icon})=><div key={label} className="rounded-xl border border-[#e4e1d8] bg-[#fffefa] p-5 shadow-[0_6px_20px_rgba(37,43,33,.035)]"><div className="flex items-center justify-between text-[#7c8178]"><span className="text-xs">{label}</span><span className="flex size-8 items-center justify-center rounded-lg bg-[#f0eee5] text-[#92784f]"><Icon size={16}/></span></div><p className="mt-4 font-serif text-3xl">{value}</p></div>)}</div>
              <div className="mt-8 flex items-end justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#92784f]">Moderation queue</p><h2 className="mt-1 font-serif text-2xl">Listings awaiting review</h2></div><span className="text-xs text-[#798077]">{data.pending.length} pending</span></div>
              {data.pending.length===0?<div className="mt-4 border border-[#e4e1d8] bg-[#fffefa] p-8 text-center"><p className="font-serif text-xl">Queue is clear</p><p className="mt-1 text-sm text-[#7b8179]">New owner submissions will appear here for review.</p></div>:<div className="mt-4 overflow-hidden border border-[#e4e1d8] bg-[#fffefa]">{data.pending.map(item=><article key={item.id} className="grid gap-3 border-b border-[#eeece6] p-4 last:border-0 sm:grid-cols-[1fr_auto] sm:p-5 lg:grid-cols-[minmax(240px,1.5fr)_1fr_140px_auto] lg:items-center"><button onClick={()=>setSelected(item)} className="flex min-w-0 items-center gap-3 text-left">{item.images?.[0]?<img src={item.images[0]} alt="" className="size-14 shrink-0 rounded-lg object-cover"/>:<div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#efede6] text-[#938568]"><Building2 size={19}/></div>}<span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.title}</span><span className="mt-1 block text-[10px] text-[#81867d]">{item.type.replaceAll('-',' ')} · submitted {new Date(item.createdAt).toLocaleDateString('en-IN')}</span></span></button><p className="text-xs text-[#687268]">{item.locality}, {item.city || 'Gurugram'}</p><p className="text-xs font-semibold">{money(item.price,item.purpose)}</p><div className="flex flex-wrap gap-2"><button onClick={()=>setSelected(item)} className="flex min-h-9 items-center gap-1.5 border border-[#e3dfd5] px-3 text-[10px] font-semibold"><Eye size={13}/>Details</button><button onClick={()=>void update(item,'published')} disabled={busy===item.id} className="flex min-h-9 items-center gap-1.5 bg-[#26372e] px-3 text-[10px] font-bold text-white disabled:opacity-50"><Check size={13}/>Approve</button><button onClick={()=>void update(item,'rejected')} disabled={busy===item.id} className="flex min-h-9 items-center gap-1.5 border border-[#e3dfd5] px-3 text-[10px] font-semibold text-[#76504a] disabled:opacity-50"><X size={13}/>Reject</button></div></article>)}</div>}
              {section==='listings'&&<div className="mt-10"><div className="flex items-end justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#92784f]">Database inventory</p><h2 className="mt-1 font-serif text-2xl">All recent properties</h2></div><span className="text-xs text-[#798077]">Latest {data.properties.length} records</span></div><div className="mt-4 overflow-hidden border border-[#e4e1d8] bg-[#fffefa]">{data.properties.length===0?<p className="p-6 text-sm text-[#798077]">No properties are stored in the database yet.</p>:data.properties.map(item=><div key={item.id} className="grid gap-2 border-b border-[#eeece6] p-4 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><button onClick={()=>setSelected(item)} className="flex min-w-0 items-center gap-3 text-left">{item.images?.[0]?<img src={item.images[0]} alt="" className="size-12 shrink-0 rounded-md object-cover"/>:<span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#efede6]"><Building2 size={17}/></span>}<span className="min-w-0"><span className="block truncate text-xs font-semibold">{item.title}</span><span className="mt-1 block text-[10px] text-[#81867d]">{item.locality} · {money(item.price,item.purpose)} · {statusName(item.status)}</span></span></button><div className="flex flex-wrap gap-1.5">{item.status==='published'&&<><button onClick={()=>void update(item,'sold')} disabled={busy===item.id} className="min-h-9 rounded-md border border-[#dcded3] px-2.5 text-[10px] font-semibold">Mark sold</button><button onClick={()=>void update(item,'hidden')} disabled={busy===item.id} className="flex min-h-9 items-center gap-1 rounded-md border border-[#dcded3] px-2.5 text-[10px] font-semibold"><EyeOff size={12}/>Hide</button></>}{(item.status==='hidden'||item.status==='sold')&&item.verifiedAt&&<button onClick={()=>void update(item,'published')} disabled={busy===item.id} className="min-h-9 rounded-md border border-[#dcded3] px-2.5 text-[10px] font-semibold">Restore</button>}{item.status!=='removed'&&<button onClick={()=>void remove(item)} disabled={busy===item.id} className="flex min-h-9 items-center gap-1 rounded-md border border-[#ead9d4] px-2.5 text-[10px] font-semibold text-[#8b4e43]"><Trash2 size={12}/>Remove</button>}</div></div>)}</div></div>}
            </>}
            {section==='leads'&&<><div className="mb-5 border border-[#e4e1d8] bg-[#fffefa] p-5"><p className="text-xs text-[#798077]">Recorded contact activity</p><p className="mt-2 font-serif text-3xl">{stats?.leads??0}</p></div><div className="overflow-hidden border border-[#e4e1d8] bg-[#fffefa]">{data.leads.length===0?<p className="p-6 text-sm text-[#798077]">No contact activity has been recorded.</p>:data.leads.map(lead=><div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeece6] px-5 py-4 last:border-0"><div><p className="text-sm font-semibold">{lead.event.replaceAll('_',' ')}</p><p className="mt-1 text-[10px] text-[#81867d]">Property {lead.propertyId.slice(0,8)} · {lead.channel}</p></div><p className="text-xs text-[#747b72]">{new Date(lead.createdAt).toLocaleString('en-IN')}</p></div>)}</div></>}
            {section==='overview'&&<div className="mt-8 border border-[#e4e1d8] bg-[#fffefa] p-5"><h2 className="font-serif text-xl">Operations at a glance</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a71]">Review owner-submitted listings before publication. Approved properties are read directly from the marketplace database. Hidden, sold and removed records stay out of public search.</p></div>}
          </>}
        </div>
      </section>
    </div>
    {selected&&<PropertyDialog property={selected} busy={busy===selected.id} onClose={()=>setSelected(null)} onStatus={(status)=>void update(selected,status)} onRemove={()=>void remove(selected)}/ >}
  </main>
}

function PropertyDialog({ property, busy, onClose, onStatus, onRemove }: { property: Property; busy: boolean; onClose: () => void; onStatus: (status: ActionStatus) => void; onRemove: () => void }) {
  const photos = Array.isArray(property.images) ? property.images : []
  const amenities = Array.isArray(property.amenities) ? property.amenities : []
  const security = Array.isArray(property.security) ? property.security : []
  const facts = [
    ['Property type', property.type.replaceAll('-', ' ')], ['Listing purpose', property.purpose], ['Price', money(property.price, property.purpose)],
    ['Bedrooms', property.bedrooms ?? 0], ['Bathrooms', property.bathrooms ?? 0], ['Area', property.area ? `${property.area.toLocaleString('en-IN')} sq ft` : 'Not provided'],
    ['Locality', property.locality], ['Society / project', property.society || 'Not provided'], ['City', property.city || 'Gurugram'],
    ['Owner type', property.ownerType || 'Not provided'], ['Brokerage', property.brokerage || 'Not provided'], ['Tenant preference', property.tenantPreference?.replaceAll('-', ' ') || 'Not provided'],
    ['Maintenance', property.maintenance ? money(property.maintenance, 'rent') : 'Not provided'], ['Deposit', property.deposit ? `₹${property.deposit.toLocaleString('en-IN')}` : 'Not provided'],
    ['Furnishing', property.furnishing || 'Not provided'], ['Power backup', property.powerBackup || 'Not provided'], ['Water source', property.waterSource || 'Not provided'],
    ['Move-in date', dateText(property.moveInDate)], ['Nearest transit', property.nearestTransit || 'Not provided'],
    ['Transit distance', property.transitDistanceMeters != null ? `${property.transitDistanceMeters} m` : 'Not provided'],
    ['Coordinates', property.latitude != null && property.longitude != null ? `${property.latitude}, ${property.longitude}` : 'Not provided'],
    ['Submitted', dateText(property.createdAt)], ['Last updated', dateText(property.updatedAt)], ['Verified', dateText(property.verifiedAt)],
  ] as const
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose()}}>
    <section role="dialog" aria-modal="true" aria-labelledby="property-dialog-title" className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-[#fbfaf7] shadow-2xl sm:rounded-2xl">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6e2d9] bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur sm:px-6"><div><p className="text-[9px] font-bold uppercase tracking-[.17em] text-[#92784f]">Full property record · {statusName(property.status)}</p><h2 id="property-dialog-title" className="mt-1 max-w-[70vw] truncate font-serif text-xl sm:text-2xl">{property.title}</h2></div><button onClick={onClose} className="grid size-10 place-items-center rounded-lg border border-[#e2ded5]" aria-label="Close details"><X size={18}/></button></header>
      <div className="space-y-5 p-4 sm:p-6">
        {photos.length>0?<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{photos.map((src,index)=><a href={src} target="_blank" rel="noreferrer" key={`${src}-${index}`} className="overflow-hidden rounded-lg bg-[#e9e7df]"><img src={src} alt={`${property.title} photo ${index+1}`} className="h-36 w-full object-cover transition hover:scale-[1.02] sm:h-44"/></a>)}</div>:<div className="grid h-28 place-items-center rounded-lg bg-[#efede6] text-sm text-[#798077]">No property photos provided</div>}
        <section><h3 className="text-sm font-semibold">Description</h3><p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#657168]">{property.description?.trim()||'No description provided.'}</p></section>
        <section className="grid gap-4 lg:grid-cols-[1fr_280px]"><div><h3 className="text-sm font-semibold">Property details</h3><dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{facts.map(([label,value])=><div key={label} className="rounded-md border border-[#e8e5dc] bg-white p-2.5"><dt className="text-[9px] uppercase tracking-wide text-[#879087]">{label}</dt><dd className="mt-1 break-words text-xs font-medium capitalize">{value}</dd></div>)}</dl></div><aside className="space-y-4"><div className="rounded-lg border border-[#e8e5dc] bg-white p-3"><h3 className="text-sm font-semibold">Owner contact</h3><p className="mt-2 text-xs font-medium">{property.owner?.name||'Owner name unavailable'}</p><p className="mt-1 break-all text-xs text-[#69766d]">{property.owner?.email||'Email unavailable'}</p>{property.contactPhone&&<a href={`tel:${property.contactPhone}`} className="mt-2 inline-block text-xs font-semibold text-[#31533f]">{property.contactPhone}</a>}</div><div className="rounded-lg border border-[#e8e5dc] bg-white p-3"><h3 className="text-sm font-semibold">Amenities & security</h3><div className="mt-2 flex flex-wrap gap-1.5">{[...amenities,...security].length? [...amenities,...security].map((value,index)=><span key={`${value}-${index}`} className="rounded-full bg-[#f0f2e9] px-2.5 py-1 text-[10px] capitalize text-[#59675d]">{value}</span>):<span className="text-xs text-[#798077]">None provided</span>}</div></div><div className="rounded-lg border border-[#e8e5dc] bg-white p-3 text-xs text-[#627067]"><p className="flex items-center gap-2"><Droplets size={14}/>Water: {property.waterSource||'not provided'}</p><p className="mt-2 flex items-center gap-2"><Zap size={14}/>Power: {property.powerBackup||'not provided'}</p><p className="mt-2 flex items-center gap-2"><CircleDollarSign size={14}/>Maintenance: {property.maintenance?money(property.maintenance,'rent'):'not provided'}</p><p className="mt-2 flex items-center gap-2"><BedDouble size={14}/>Beds: {property.bedrooms??0} · Baths: {property.bathrooms??0}</p><p className="mt-2 flex items-center gap-2"><MapPin size={14}/>{property.locality}</p></div></aside></section>
        <footer className="sticky bottom-0 -mx-4 flex flex-wrap gap-2 border-t border-[#e6e2d9] bg-[#fbfaf7]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          {property.status==='pending_verification'&&<><button disabled={busy} onClick={()=>onStatus('published')} className="flex min-h-10 items-center gap-1.5 rounded-md bg-[#26372e] px-3.5 text-xs font-bold text-white disabled:opacity-50"><BadgeCheck size={14}/>Approve listing</button><button disabled={busy} onClick={()=>onStatus('rejected')} className="flex min-h-10 items-center gap-1.5 rounded-md border border-[#e3dfd5] px-3.5 text-xs font-semibold text-[#76504a] disabled:opacity-50"><X size={14}/>Reject</button></>}
          {property.status==='published'&&<><button disabled={busy} onClick={()=>onStatus('sold')} className="flex min-h-10 items-center gap-1.5 rounded-md bg-[#26372e] px-3.5 text-xs font-semibold text-white disabled:opacity-50"><Check size={14}/>Mark sold</button><button disabled={busy} onClick={()=>onStatus('hidden')} className="flex min-h-10 items-center gap-1.5 rounded-md border border-[#e3dfd5] px-3.5 text-xs font-semibold disabled:opacity-50"><EyeOff size={14}/>Hide</button></>}
          {(property.status==='hidden'||property.status==='sold')&&property.verifiedAt&&<button disabled={busy} onClick={()=>onStatus('published')} className="flex min-h-10 items-center gap-1.5 rounded-md bg-[#26372e] px-3.5 text-xs font-semibold text-white disabled:opacity-50"><Eye size={14}/>Restore to market</button>}
          {property.status!=='removed'&&<button disabled={busy} onClick={onRemove} className="ml-auto flex min-h-10 items-center gap-1.5 rounded-md border border-[#ead9d4] px-3.5 text-xs font-semibold text-[#8b4e43] disabled:opacity-50"><Trash2 size={14}/>Remove</button>}
        </footer>
      </div>
    </section>
  </div>
}
