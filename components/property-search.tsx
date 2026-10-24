'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, BadgeCheck, BedDouble, Building2, Check, ChevronLeft, ChevronRight, Filter, Heart, MapPin, MessageCircle, Search, SlidersHorizontal, X } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

type Listing = {
  id: string; title: string; description?: string; locality: string; society?: string | null; price: number; purpose: string; type: string;
  bedrooms: number; bathrooms: number; area: number; furnishing?: string | null; brokerage?: string; ownerType?: string; images?: string[]; amenities?: string[]; contactPhone?: string | null; verifiedAt?: string | Date | null; nearestTransit?: string | null; status?: string
}
type Filters = { purpose: string; type: string; maxPrice: string; bedrooms: string; brokerage: string; preference: string; immediate: boolean; transit: string; transitMaxDistance: string }
const DEFAULT_FILTERS: Filters = { purpose: 'rent', type: '', maxPrice: '', bedrooms: '', brokerage: '', preference: '', immediate: false, transit: '', transitMaxDistance: '' }
const quick = [
  { label: 'Under ₹25k', update: { maxPrice: '25000' } },
  { label: 'No brokerage', update: { brokerage: 'owner' } },
  { label: '1 RK / 1 BHK', update: { bedrooms: '1' } },
  { label: 'Move in now', update: { immediate: true } },
]
const formatPrice = (amount: number, purpose: string) => `₹${new Intl.NumberFormat('en-IN').format(amount)}${purpose === 'rent' || purpose === 'pg' ? '/mo' : ''}`

export function PropertySearch({ initialQuery = '', initialPurpose = 'rent', initialFilters = {} }: { initialQuery?: string; initialPurpose?: string; initialFilters?: Partial<Filters> }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, ...initialFilters, purpose: ['rent', 'sale', 'pg'].includes(initialPurpose) ? initialPurpose : 'rent' })
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [databaseConfigured, setDatabaseConfigured] = useState(true)
  const [total, setTotal] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [compared, setCompared] = useState<string[]>([])

  const activeCount = useMemo(() => Number(Boolean(filters.type)) + Number(Boolean(filters.maxPrice)) + Number(Boolean(filters.bedrooms)) + Number(Boolean(filters.brokerage)) + Number(Boolean(filters.preference)) + Number(filters.immediate) + Number(Boolean(filters.transit)), [filters])

  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem('jdm:saved') || '[]'))
      setCompared(JSON.parse(localStorage.getItem('jdm:compare') || '[]'))
    } catch { setSaved([]); setCompared([]) }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ page: '1', pageSize: '24', purpose: filters.purpose })
    if (query.trim()) params.set('q', query.trim())
    if (filters.type) params.set('type', filters.type)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms)
    if (filters.brokerage) params.set('brokerage', filters.brokerage)
    if (filters.preference) params.set('preference', filters.preference)
    if (filters.transit) params.set('transit', filters.transit)
    if (filters.transitMaxDistance) params.set('transitMaxDistance', filters.transitMaxDistance)
    if (filters.immediate) params.set('immediate', 'true')
    setLoading(true); setError('')
    fetch(`/api/properties?${params}`, { signal: controller.signal }).then(async (response) => {
      const data = await response.json()
      setDatabaseConfigured(data.databaseConfigured !== false)
      if (!response.ok && response.status !== 503) throw new Error(data.error || 'Could not load listings.')
      setListings(Array.isArray(data.properties) ? data.properties : [])
      setTotal(Number(data.total) || 0)
      if (response.status === 503) setError(data.message || data.error || '')
    }).catch((cause: unknown) => {
      if (cause instanceof Error && cause.name !== 'AbortError') setError(cause.message || 'Listings could not be loaded. Please try again.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, filters])

  function toggleSave(id: string) {
    const next = saved.includes(id) ? saved.filter((value) => value !== id) : [...saved, id]
    setSaved(next); localStorage.setItem('jdm:saved', JSON.stringify(next)); window.dispatchEvent(new Event('jdm:saved-change'))
  }
  function toggleCompare(id: string) {
    const next = compared.includes(id) ? compared.filter((value) => value !== id) : compared.length >= 3 ? compared : [...compared, id]
    setCompared(next); localStorage.setItem('jdm:compare', JSON.stringify(next))
  }
  function applyQuick(update: Partial<Filters>) { setFilters((current) => ({ ...current, ...update })) }

  return (
    <main className="min-h-screen bg-[#f6f6ef] px-4 pb-28 pt-5 text-[#17271f] sm:px-8 sm:pt-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-sm font-bold text-[#42630f]"><ArrowLeft size={17} /> JDM Homes</Link><Link href="/profile" aria-label="Open profile" className="flex size-10 items-center justify-center rounded-full bg-[#174936] text-sm font-bold text-[#d8ef78]">A</Link></header>
        <div className="mt-7 grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div><p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#819b20]"><MapPin size={13} /> Haryana · Gurugram</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">A home that fits<br className="hidden sm:block" /> your Gurugram.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#738079]">Search by sector, society, metro stop or the little things that make a place feel right.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); router.replace(`/search?${new URLSearchParams({ ...(query ? { q: query } : {}), purpose: filters.purpose })}`) }} className="flex min-h-14 items-center gap-2 rounded-[17px] border border-[#dfe5da] bg-white p-2 pl-4 shadow-[0_8px_25px_rgba(25,48,37,.04)] focus-within:border-[#97b73a]"><Search className="shrink-0 text-[#789018]" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Sector 56, Cyber City or DLF Phase 3" aria-label="Search localities" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa39c]" /><button type="button" onClick={() => setFilterOpen(true)} className="relative flex size-10 items-center justify-center rounded-xl bg-[#eef4db] text-[#45611b]" aria-label="Open filters"><SlidersHorizontal size={18} />{activeCount > 0 && <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#174936] text-[9px] text-white">{activeCount}</span>}</button><button className="hidden rounded-xl bg-[#174936] px-5 py-3 text-sm font-bold text-white sm:block">Search</button></form>
        </div>
        <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">{['rent', 'sale', 'pg'].map((purpose) => <button key={purpose} onClick={() => applyQuick({ purpose })} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold capitalize ${filters.purpose === purpose ? 'border-[#174936] bg-[#174936] text-white' : 'border-[#dfe3dc] bg-white text-[#617069]'}`}>{purpose === 'sale' ? 'Buy' : purpose === 'pg' ? 'PG / Co-living' : 'Rent'}</button>)}{quick.map((chip) => <button key={chip.label} onClick={() => applyQuick(chip.update)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold ${Object.entries(chip.update).every(([key, value]) => filters[key as keyof Filters] === value) ? 'border-[#cfdf9a] bg-[#eff6d9] text-[#405b13]' : 'border-[#dfe3dc] bg-white text-[#617069]'}`}>{chip.label}</button>)}</div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-[#e2e7dd] pb-4"><div><h2 className="text-xl font-semibold tracking-[-.04em]">{query ? `Places matching “${query}”` : 'Homes with a local point of view'}</h2><p className="mt-1 text-xs text-[#829087]">{loading ? 'Finding current listings…' : `${total} ${total === 1 ? 'listing' : 'listings'} · Gurugram`}</p></div><div className="flex items-center gap-2"><Link href="/compare" className="rounded-xl border border-[#dfe3dc] bg-white px-3 py-2 text-xs font-bold text-[#52635a]">Compare{compared.length ? ` (${compared.length})` : ''}</Link><button onClick={() => setFilterOpen(true)} className="flex items-center gap-1 rounded-xl border border-[#dfe3dc] bg-white px-3 py-2 text-xs font-bold text-[#52635a]"><Filter size={14} /> All filters{activeCount ? ` · ${activeCount}` : ''}</button></div></div>

        {error && !databaseConfigured && <aside className="mt-5 flex gap-3 rounded-2xl border border-[#e6e4d7] bg-[#fbfaf2] p-4 text-sm text-[#5e665c]"><Building2 className="mt-0.5 shrink-0 text-[#839b2a]" size={18} /><div><p className="font-semibold text-[#344238]">Live listings are not connected yet</p><p className="mt-1 text-xs leading-5">{error} You can finish exploring the marketplace now; configure the database to publish and search real homes.</p></div></aside>}
        {error && databaseConfigured && <div role="alert" className="mt-5 rounded-2xl border border-[#f0d5cd] bg-[#fff7f4] p-4 text-sm text-[#8d392f]">{error}</div>}

        {loading ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-[340px] animate-pulse rounded-[22px] bg-[#e8ebe2]" />)}</div> : listings.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{listings.map((item) => <article key={item.id} className="group overflow-hidden rounded-[22px] border border-[#e1e7df] bg-white shadow-[0_8px_24px_rgba(25,48,37,.045)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,48,37,.1)]">
          <div className="relative h-[220px] overflow-hidden bg-[#e5e9df] sm:h-[190px]">
            {item.images?.[0] ? <img src={item.images[0]} alt={item.title} className="size-full object-cover transition duration-500 group-hover:scale-[1.025]" /> : <div className="flex size-full items-center justify-center bg-[linear-gradient(140deg,#e6ebdd,#cdd9c6)] text-[#71856b]"><Building2 size={36} strokeWidth={1.2} /></div>}
            <div className="absolute left-3 top-3 flex gap-1.5">{item.verifiedAt && <span className="flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#315246]"><BadgeCheck size={13} className="text-[#79941d]" /> Verified</span>}{item.brokerage === 'owner' && <span className="rounded-full bg-[#e5f2b7] px-2.5 py-1.5 text-[10px] font-bold text-[#38510b]">Zero brokerage</span>}</div>
            <button onClick={() => toggleSave(item.id)} aria-label={saved.includes(item.id) ? 'Remove from shortlist' : 'Save to shortlist'} className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full shadow-sm transition ${saved.includes(item.id) ? 'bg-[#d8ef78] text-[#174936]' : 'bg-white/95 text-[#385047] hover:bg-white'}`}><Heart size={17} fill={saved.includes(item.id) ? 'currentColor' : 'none'} /></button>
            <span className="absolute bottom-3 left-3 rounded-full bg-[#15221d]/75 px-2.5 py-1 text-[10px] font-semibold capitalize text-white">{item.type.replace('-', ' ')} · {item.purpose === 'sale' ? 'For sale' : item.purpose === 'pg' ? 'PG / co-living' : 'For rent'}</span>
          </div>
          <div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/property/${item.id}`} className="line-clamp-2 text-[16px] font-bold leading-snug tracking-[-.025em] hover:text-[#42630f]">{item.title}</Link><p className="mt-1.5 flex items-center gap-1 text-xs text-[#77847d]"><MapPin size={13} className="shrink-0" />{item.locality}{item.society ? ` · ${item.society}` : ''}{item.nearestTransit ? ` · ${item.nearestTransit}` : ''}</p></div><p className="whitespace-nowrap text-sm font-bold text-[#174936]">{formatPrice(item.price, item.purpose)}</p></div>
            <p className="mt-3 flex items-center gap-1.5 border-t border-[#edf0ec] pt-3 text-xs text-[#65736a]"><BedDouble size={14} className="text-[#899d37]" />{item.bedrooms ? `${item.bedrooms} BHK` : item.type === 'room' || item.type === 'pg' ? 'Room / bed' : 'Configuration open'}{item.area ? ` · ${item.area.toLocaleString('en-IN')} sq ft` : ''}{item.furnishing ? ` · ${item.furnishing}` : ''}</p>
            <div className="mt-4 flex gap-2"><a href={item.contactPhone ? `https://wa.me/${item.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I’m interested in ${item.title} on JDM Homes.`)}` : undefined} target={item.contactPhone ? '_blank' : undefined} rel="noreferrer" onClick={(event) => { if (!item.contactPhone) { event.preventDefault(); window.alert('The owner contact will be available after this listing is verified.'); return } void fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ propertyId: item.id, event: 'whatsapp_click' }) }) }} className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#e9f5c0] text-xs font-bold text-[#38510b] hover:bg-[#dced9e]"><MessageCircle size={15} /> WhatsApp</a><button onClick={() => toggleCompare(item.id)} aria-pressed={compared.includes(item.id)} className={`min-h-10 rounded-xl border px-3 text-xs font-semibold ${compared.includes(item.id) ? 'border-[#c9d990] bg-[#f4f8e6] text-[#42630f]' : 'border-[#dfe3dc] text-[#617069]'}`}>{compared.includes(item.id) ? <><Check size={14} className="mr-1 inline" />Added</> : 'Compare'}</button><Link href={`/property/${item.id}`} aria-label={`View ${item.title}`} className="flex size-10 items-center justify-center rounded-xl bg-[#174936] text-white"><ArrowRight size={16} /></Link></div>
          </div>
        </article>)}</div> : <section className="mt-6 rounded-[24px] border border-dashed border-[#cfd8cc] bg-white p-8 text-center sm:p-12"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#edf3dc] text-[#658019]"><Search size={21} /></span><h3 className="mt-4 text-xl font-semibold">{databaseConfigured ? 'No homes match these filters yet.' : 'Your next home starts with a search.'}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#738079]">{databaseConfigured ? 'Try a nearby sector, widen your budget, or clear filters to see more options.' : 'Once the marketplace database is connected, published homes around Gurugram will appear here.'}</p><div className="mt-5 flex flex-wrap justify-center gap-2"><button onClick={() => { setFilters(DEFAULT_FILTERS); setQuery('') }} className="rounded-xl bg-[#174936] px-4 py-2.5 text-sm font-bold text-white">Clear search</button><Link href="/post" className="rounded-xl border border-[#dfe3dc] px-4 py-2.5 text-sm font-bold text-[#47621d]">List a property</Link></div></section>}
      </div>

      {filterOpen && <div className="fixed inset-0 z-40 bg-[#14231c]/45" onMouseDown={(event) => { if (event.target === event.currentTarget) setFilterOpen(false) }}><section role="dialog" aria-modal="true" aria-labelledby="filter-title" className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-[26px] bg-[#fbfcf8] px-5 pb-[max(22px,env(safe-area-inset-bottom))] pt-5 shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[430px] sm:rounded-none sm:pt-7">
        <div className="flex items-center justify-between border-b border-[#e4e9df] pb-4"><div><p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#829c28]">Find your fit</p><h2 id="filter-title" className="mt-1 text-2xl font-semibold">Filters</h2></div><button onClick={() => setFilterOpen(false)} className="flex size-10 items-center justify-center rounded-full border border-[#e0e5db] bg-white" aria-label="Close filters"><X size={18} /></button></div>
        <div className="space-y-6 py-5"><FilterGroup label="Home type"><div className="grid grid-cols-2 gap-2">{[['', 'Any home'], ['apartment', 'Apartment'], ['room', 'Room / PG'], ['builder-floor', 'Builder floor'], ['plot', 'Plot'], ['commercial', 'Commercial']].map(([value, label]) => <button key={value} onClick={() => setFilters((current) => ({ ...current, type: value }))} className={`min-h-11 rounded-xl border px-3 text-left text-xs font-semibold ${filters.type === value ? 'border-[#174936] bg-[#edf4dd] text-[#31511c]' : 'border-[#dfe5da] bg-white text-[#637168]'}`}>{filters.type === value && <Check size={13} className="mr-1 inline" />}{label}</button>)}</div></FilterGroup>
          <FilterGroup label="Maximum monthly rent / price"><select value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))} className="min-h-12 w-full rounded-xl border border-[#dfe5da] bg-white px-3 text-sm"><option value="">Any budget</option><option value="15000">Up to ₹15,000</option><option value="25000">Up to ₹25,000</option><option value="35000">Up to ₹35,000</option><option value="50000">Up to ₹50,000</option></select></FilterGroup>
          <FilterGroup label="Bedrooms"><div className="flex gap-2">{[['', 'Any'], ['1', '1+'], ['2', '2+'], ['3', '3+']].map(([value, label]) => <button key={value} onClick={() => setFilters((current) => ({ ...current, bedrooms: value }))} className={`min-h-11 flex-1 rounded-xl border text-sm font-semibold ${filters.bedrooms === value ? 'border-[#174936] bg-[#edf4dd] text-[#31511c]' : 'border-[#dfe5da] bg-white text-[#637168]'}`}>{label}</button>)}</div></FilterGroup>
          <FilterGroup label="Who is it for?"><select value={filters.preference} onChange={(event) => setFilters((current) => ({ ...current, preference: event.target.value }))} className="min-h-12 w-full rounded-xl border border-[#dfe5da] bg-white px-3 text-sm"><option value="">Any tenant preference</option><option value="family">Family friendly</option><option value="bachelor">Bachelor friendly</option><option value="working-professionals">Working professionals</option></select></FilterGroup>
          <FilterGroup label="Near a commute anchor"><select value={filters.transit} onChange={(event) => setFilters((current) => ({ ...current, transit: event.target.value }))} className="min-h-12 w-full rounded-xl border border-[#dfe5da] bg-white px-3 text-sm"><option value="">Any location</option><option value="HUDA City Centre">HUDA City Centre Metro</option><option value="Rapid Metro">Rapid Metro</option><option value="CyberHub">CyberHub</option><option value="Cyber City">Cyber City</option></select></FilterGroup>
          {filters.transit && <FilterGroup label="Maximum distance"><select value={filters.transitMaxDistance} onChange={(event) => setFilters((current) => ({ ...current, transitMaxDistance: event.target.value }))} className="min-h-12 w-full rounded-xl border border-[#dfe5da] bg-white px-3 text-sm"><option value="">Any distance</option><option value="500">Within 500 m</option><option value="1000">Within 1 km</option><option value="1500">Within 1.5 km</option><option value="3000">Within 3 km</option></select></FilterGroup>}
          <label className="flex min-h-12 items-center justify-between rounded-xl border border-[#e2e7dd] bg-white px-3 text-sm font-semibold">Zero brokerage <input type="checkbox" checked={filters.brokerage === 'owner'} onChange={(event) => setFilters((current) => ({ ...current, brokerage: event.target.checked ? 'owner' : '' }))} className="size-5 accent-[#174936]" /></label>
          <label className="flex min-h-12 items-center justify-between rounded-xl border border-[#e2e7dd] bg-white px-3 text-sm font-semibold">Available to move in now <input type="checkbox" checked={filters.immediate} onChange={(event) => setFilters((current) => ({ ...current, immediate: event.target.checked }))} className="size-5 accent-[#174936]" /></label>
        </div>
        <div className="sticky bottom-0 flex gap-2 border-t border-[#e4e9df] bg-[#fbfcf8] py-4"><button onClick={() => setFilters(DEFAULT_FILTERS)} className="flex-1 rounded-xl border border-[#dfe5da] py-3 text-sm font-bold text-[#58665e]">Clear all</button><button onClick={() => setFilterOpen(false)} className="flex-[1.4] rounded-xl bg-[#174936] py-3 text-sm font-bold text-white">Show {total} homes</button></div>
      </section></div>}
      <BottomNav />
    </main>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) { return <fieldset><legend className="mb-2 text-sm font-bold text-[#31443a]">{label}</legend>{children}</fieldset> }
