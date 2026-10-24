'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, BedDouble, Building2, Heart, MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

const localities = [
  { name: 'DLF Phase 3', note: 'Close to Cyber City', tag: 'Near Cyber City', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85' },
  { name: 'Sector 56', note: 'Golf Course Road', tag: 'Metro connected', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85' },
  { name: 'Sohna Road', note: 'Room to grow', tag: 'Family friendly', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85' },
]

const suggestions: { label: string; filters: Record<string, string> }[] = [
  { label: 'Under ₹25k', filters: { maxPrice: '25000' } },
  { label: 'No brokerage', filters: { brokerage: 'owner' } },
  { label: '1 RK / 1 BHK', filters: { bedrooms: '1' } },
  { label: 'Move in now', filters: { immediate: 'true' } },
]

type Listing = {
  id: string; title: string; locality: string; price: number; purpose: string; type: string
  bedrooms?: number | null; area?: number | null; images?: string[] | null; verifiedAt?: string | null
}

const money = (amount: number, purpose: string) => `₹${new Intl.NumberFormat('en-IN').format(amount)}${purpose === 'sale' ? '' : ' / month'}`

export function HomeScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [purpose, setPurpose] = useState('rent')
  const [menuOpen, setMenuOpen] = useState(false)
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsState, setListingsState] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const [saved, setSaved] = useState<string[]>([])

  useEffect(() => {
    let active = true
    fetch('/api/properties?page=1&pageSize=4')
      .then(async (response) => {
        const data = await response.json()
        if (!active) return
        setListings(Array.isArray(data.properties) ? data.properties : [])
        setListingsState(response.ok ? 'ready' : 'unavailable')
      })
      .catch(() => { if (active) setListingsState('unavailable') })
    try { setSaved(JSON.parse(localStorage.getItem('jdm:saved') || '[]')) } catch { setSaved([]) }
    const syncSaved = () => { try { setSaved(JSON.parse(localStorage.getItem('jdm:saved') || '[]')) } catch { setSaved([]) } }
    window.addEventListener('storage', syncSaved)
    window.addEventListener('jdm:saved-change', syncSaved)
    return () => { active = false; window.removeEventListener('storage', syncSaved); window.removeEventListener('jdm:saved-change', syncSaved) }
  }, [])

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams({ purpose, ...(query.trim() ? { q: query.trim() } : {}) })
    router.push(`/search?${params.toString()}`)
  }

  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem('jdm:saved', JSON.stringify(next))
    window.dispatchEvent(new Event('jdm:saved-change'))
  }

  return (
    <main className="min-h-screen bg-[#f6f6ef] text-[#17271f]">
      <section className="relative overflow-hidden bg-[#073c2c] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_48%,rgba(183,214,73,.17),transparent_34%),linear-gradient(112deg,#052f24_0%,#104631_58%,#174936_100%)]" />
        <div className="pointer-events-none absolute -right-20 top-24 h-[270px] w-[78%] opacity-[.13] sm:top-20 sm:h-[370px] sm:w-[68%] sm:opacity-[.2] lg:top-20 lg:h-[450px] lg:w-[660px] lg:opacity-40" aria-hidden="true">
          <div className="absolute bottom-0 right-5 h-[180px] w-28 border border-[#b7d649]/40 bg-gradient-to-t from-[#061d19] to-[#b7d649]/15 [clip-path:polygon(20%_0,78%_8%,100%_100%,0_100%)] sm:h-[250px] sm:w-40 lg:h-[300px] lg:w-48" />
          <div className="absolute bottom-0 right-32 h-[250px] w-28 border border-[#b7d649]/45 bg-gradient-to-t from-[#071f19] via-[#185c43] to-[#9aac4c]/30 [clip-path:polygon(40%_0,68%_10%,100%_100%,0_100%)] sm:right-44 sm:h-[340px] sm:w-40 lg:right-56 lg:h-[410px] lg:w-44" />
          <div className="absolute bottom-0 right-20 h-[160px] w-36 border border-[#b7d649]/35 bg-gradient-to-t from-[#071b17] to-[#71903c]/35 [clip-path:polygon(0_10%,100%_0,90%_100%,12%_100%)] sm:right-28 sm:h-[220px] sm:w-44 lg:right-36 lg:h-[250px] lg:w-52" />
          <div className="absolute right-24 top-8 size-16 rounded-full bg-[#d9e47e]/80 blur-[1px] sm:right-32 sm:size-20 lg:right-36 lg:top-10 lg:size-24" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#062d23] to-transparent" />
        </div>

        <header className="relative mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 sm:px-8 lg:px-10 lg:py-7">
          <Link href="/" className="flex items-center gap-3" aria-label="JDM Homes home">
            <span className="flex size-11 items-center justify-center rounded-full border border-[#9eaf2e]/70 text-[#b7d649] sm:size-[58px]"><Building2 size={23} strokeWidth={1.8} /></span>
            <span><span className="block text-[19px] font-bold tracking-[-.055em] sm:text-2xl">JDM <span className="text-[#b7d649]">Homes</span></span><span className="hidden text-[10px] font-semibold uppercase tracking-[.12em] text-white/70 sm:block">Gurugram real estate experts</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/80 md:flex" aria-label="Main menu"><Link className="hover:text-[#d8ef78]" href="/search">Explore homes</Link><Link className="hover:text-[#d8ef78]" href="/post">List a property</Link><Link className="hover:text-[#d8ef78]" href="/profile">My account</Link><Link href="/login" className="rounded-xl border border-white/25 px-4 py-2.5 text-white hover:bg-white/10">Sign in</Link></nav>
          <div className="relative flex items-center gap-2"><Link href="/search" aria-label="Search homes" className="flex size-10 items-center justify-center rounded-full border border-[#a7bb34]/55 text-white hover:bg-white/10 sm:size-[54px]"><Search size={21} /></Link><button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-home-menu" onClick={() => setMenuOpen((open) => !open)} className="flex size-10 items-center justify-center rounded-full border border-[#a7bb34]/55 text-white hover:bg-white/10 md:hidden">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
            {menuOpen && <nav id="mobile-home-menu" aria-label="Mobile menu" className="absolute right-0 top-full z-30 mt-3 flex w-52 flex-col rounded-2xl border border-[#e4e8dd] bg-[#fffefa] p-2 text-sm font-semibold text-[#263d31] shadow-xl md:hidden"><Link onClick={() => setMenuOpen(false)} href="/search" className="rounded-xl px-3 py-3 hover:bg-[#f1f4e8]">Explore homes</Link><Link onClick={() => setMenuOpen(false)} href="/post" className="rounded-xl px-3 py-3 hover:bg-[#f1f4e8]">List a property</Link><Link onClick={() => setMenuOpen(false)} href="/profile" className="rounded-xl px-3 py-3 hover:bg-[#f1f4e8]">My account</Link><Link onClick={() => setMenuOpen(false)} href="/login" className="rounded-xl px-3 py-3 hover:bg-[#f1f4e8]">Sign in</Link></nav>}
          </div>
        </header>

        <div className="relative mx-auto grid max-w-[1440px] items-center px-5 pb-20 pt-5 sm:px-10 sm:pb-28 sm:pt-7 lg:min-h-[500px] lg:grid-cols-[1fr_.8fr] lg:px-10 lg:pb-24 lg:pt-5">
          <div className="relative z-10 max-w-[670px]">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9bb834]/55 bg-white/[.04] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#c2df4a]"><Sparkles size={13} /> Gurugram, made more findable</p>
            <h1 className="max-w-[680px] text-[42px] font-medium leading-[.97] tracking-[-.055em] sm:text-6xl lg:text-[68px]">Find your corner<br className="hidden sm:block" /> of <span className="text-[#b7d649]">Gurugram.</span></h1>
            <p className="mt-5 max-w-[450px] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">From a first room near Cyber City to a family home on Golf Course Road, start with the neighbourhood that feels right.</p>
          </div>
          <div className="relative hidden min-h-[330px] lg:block" aria-hidden="true">
            <span className="absolute bottom-0 right-[20%] h-[240px] w-[74%] rotate-[-7deg] overflow-hidden rounded-t-[120px] border border-white/15 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85')] bg-cover bg-center opacity-50 mix-blend-screen shadow-[0_0_90px_rgba(183,214,73,.12)]" />
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-[1360px] px-4 sm:-mt-16 sm:px-8 lg:px-10">
        <div className="rounded-[22px] border border-[#e7e8df] bg-[#fffefa] p-3 shadow-[0_18px_48px_rgba(24,50,37,.13)] sm:rounded-[24px] sm:p-5 lg:p-6">
          <div className="flex gap-2 px-1 pb-3" role="group" aria-label="Listing purpose">
            {['rent', 'sale', 'pg'].map((item) => <button key={item} type="button" onClick={() => setPurpose(item)} aria-pressed={purpose === item} className={`min-h-10 rounded-xl px-4 text-xs font-bold capitalize transition ${purpose === item ? 'bg-[#eef1e2] text-[#183c2d]' : 'text-[#68746c] hover:bg-[#f3f4ef]'}`}>{item === 'pg' ? 'PG / Co-living' : item === 'sale' ? 'Buy' : 'Rent'}</button>)}
          </div>
          <form onSubmit={search} className="flex min-h-[58px] items-center gap-2 rounded-[15px] border border-[#e1e4df] bg-white p-1.5 pl-3 focus-within:border-[#a6bf3c] sm:min-h-[68px] sm:pl-5">
            <MapPin className="shrink-0 text-[#315d3d]" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search by locality or property" placeholder="Sector, society or landmark" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#89928c] sm:text-base" />
            <button aria-label="Search homes" className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-[#073c2c] px-4 text-sm font-bold text-white transition hover:bg-[#15513b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9c83b] sm:min-w-[66px]"><Search size={20} /><span className="hidden sm:inline">Search</span></button>
          </form>
          <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:grid sm:grid-cols-4">
            {suggestions.map((item) => <Link key={item.label} href={`/search?${new URLSearchParams({ purpose, ...item.filters })}`} className="flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#e2e4df] bg-white px-3 text-[11px] font-semibold text-[#43534a] transition hover:border-[#b5c85b] hover:bg-[#f9fbed] sm:text-sm"><SlidersHorizontal size={15} className="hidden text-[#607c22] sm:block" />{item.label}</Link>)}
          </div>
          <div className="mt-3 flex items-center gap-2 px-1 text-xs text-[#657168] sm:mt-4 sm:text-sm"><ShieldCheck size={17} className="shrink-0 text-[#66851e]" /> Local details that help you decide with confidence.</div>
        </div>
      </div>

      <section className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-8 sm:pt-12 lg:px-10 lg:pt-10">
        <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#829c28]">Explore Gurugram</p><h2 className="mt-2 text-[27px] font-semibold leading-tight tracking-[-.045em] sm:text-3xl">Gurugram, by neighbourhood.</h2><p className="mt-2 text-sm text-[#69776e] sm:text-base">Explore the places people love to live in.</p></div><Link href="/search" className="hidden min-h-11 items-center gap-3 rounded-xl border border-[#9aaf37] px-4 text-sm font-bold text-[#284832] sm:inline-flex">View all areas <ArrowRight size={17} /></Link></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">{localities.map((place) => <Link href={`/search?q=${encodeURIComponent(place.name)}`} key={place.name} className="group relative min-h-[205px] overflow-hidden rounded-[19px] bg-[#d7d8cf] sm:min-h-[235px] lg:min-h-[280px]"><img src={place.image} alt={`Homes in ${place.name}`} className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.045]" /><div className="absolute inset-0 bg-gradient-to-t from-[#071d16]/85 via-[#071d16]/15 to-transparent" /><span className="absolute right-3 top-3 rounded-full bg-[#104631]/95 px-3 py-1.5 text-[10px] font-bold text-white sm:right-4 sm:top-4 sm:text-xs">{place.tag}</span><div className="absolute inset-x-4 bottom-4 text-white sm:inset-x-5 sm:bottom-5"><p className="text-xl font-bold tracking-[-.035em] sm:text-2xl">{place.name}</p><p className="mt-1 text-xs text-white/85 sm:text-sm">{place.note}</p></div></Link>)}</div>
        <Link href="/search" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dfe3da] bg-white text-sm font-bold text-[#3c5d35] sm:hidden">View all areas <ArrowRight size={16} /></Link>
      </section>

      <section className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-8 sm:pt-12 lg:px-10">
        <div className="flex items-end justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#829c28]">New listed</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.045em] sm:text-3xl">Recently added homes</h2></div><Link href="/search" className="inline-flex items-center gap-1 text-sm font-bold text-[#294931]">See all <ArrowRight size={16} /></Link></div>
        {listingsState === 'loading' ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[0,1,2,3].map((item) => <div key={item} className="h-[260px] animate-pulse rounded-[17px] bg-[#e6e9df]" />)}</div> : listings.length ? <div className="hide-scrollbar mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">{listings.map((item) => <article key={item.id} className="group overflow-hidden rounded-[17px] border border-[#e3e6df] bg-white shadow-[0_5px_18px_rgba(29,46,35,.05)]"><Link href={`/property/${item.id}`} className="relative block h-[145px] overflow-hidden bg-[#e3e9dd] sm:h-[185px]">{item.images?.[0] ? <img src={item.images[0]} alt={item.title} className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex size-full items-center justify-center text-[#72836e]"><Building2 size={34} strokeWidth={1.3} /></div>}<span className="absolute left-2 top-2 rounded-md bg-[#b7d649] px-2 py-1 text-[9px] font-bold uppercase text-[#263d25]">New</span>{item.verifiedAt && <span className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-1 text-[9px] font-bold text-[#315246]">Verified</span>}</Link><div className="p-3"><div className="flex items-start justify-between gap-1"><Link href={`/property/${item.id}`} className="line-clamp-1 text-sm font-bold leading-5">{item.title}</Link><button type="button" aria-label={saved.includes(item.id) ? 'Remove from shortlist' : 'Save to shortlist'} aria-pressed={saved.includes(item.id)} onClick={() => toggleSaved(item.id)} className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[#315246] hover:bg-[#f1f5e5]"><Heart size={17} fill={saved.includes(item.id) ? 'currentColor' : 'none'} /></button></div><p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#718078]"><MapPin size={12} />{item.locality}</p><p className="mt-2 text-sm font-bold text-[#174936]">{money(item.price, item.purpose)}</p><p className="mt-2 flex items-center gap-1 border-t border-[#edf0ec] pt-2 text-[10px] text-[#65736a]"><BedDouble size={13} />{item.bedrooms ? `${item.bedrooms} bed` : item.type.replace('-', ' ')}{item.area ? ` · ${item.area.toLocaleString('en-IN')} sq.ft.` : ''}</p></div></article>)}</div> : <div className="mt-5 rounded-[18px] border border-dashed border-[#d4ddcf] bg-[#fbfcf7] px-5 py-7 text-center"><p className="text-base font-semibold">{listingsState === 'unavailable' ? 'Live listings are not connected yet' : 'No published homes yet'}</p><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#718078]">{listingsState === 'unavailable' ? 'Recently published properties will appear here once the marketplace database is available.' : 'Be among the first to share a home in Gurugram.'}</p><Link href="/post" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#174936] px-4 text-xs font-bold text-white">List your property <ArrowRight size={14} /></Link></div>}
      </section>

      <section className="mx-auto max-w-[1360px] px-4 pb-4 pt-9 sm:px-8 sm:pt-12 lg:px-10">
        <div className="relative overflow-hidden rounded-[22px] border border-[#e0e2d7] bg-[#f1f1e5] p-5 sm:flex sm:min-h-[200px] sm:items-center sm:px-9 sm:py-8"><div className="relative z-10 max-w-lg"><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#829c28]">A better move starts here</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em] sm:text-3xl">Have a home to share?</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#69776e]">Post your property and connect with people looking nearby.</p><Link href="/post" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b7d649] px-5 text-sm font-bold text-[#23412f] transition hover:bg-[#c7e65a]">List your property <ArrowRight size={16} /></Link></div><div className="pointer-events-none absolute -bottom-12 -right-2 hidden h-[230px] w-[380px] items-end justify-center sm:flex" aria-hidden="true"><div className="h-40 w-32 rounded-t-[65px] bg-[#315a3d] shadow-[inset_10px_0_15px_rgba(255,255,255,.12)]"/><span className="absolute bottom-0 right-[105px] h-[185px] w-[3px] bg-[#62734a]"/><span className="absolute bottom-[115px] right-[70px] size-16 rounded-full bg-[#708252]"/><span className="absolute bottom-[145px] right-[150px] size-20 rounded-full bg-[#879564]"/><span className="absolute bottom-0 right-10 h-[155px] w-[4px] bg-[#566d45]"/><span className="absolute bottom-[90px] right-1 size-16 rounded-full bg-[#84935f]"/></div></div>
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-[18px] border border-[#e5e7df] bg-white p-3 sm:grid-cols-4 sm:gap-0 sm:p-4">{[{ icon: ShieldCheck, title: 'Clear listing details', note: 'Know what is shared' }, { icon: Building2, title: 'Local knowledge', note: 'Gurugram focused' }, { icon: MapPin, title: 'Neighbourhood first', note: 'Find the right area' }, { icon: Heart, title: 'A simpler move', note: 'Search at your pace' }].map(({ icon: Icon, title, note }, index) => <div key={title} className={`flex items-center gap-2 px-2 py-2 sm:justify-center ${index % 2 === 1 ? '' : ''} ${index > 1 ? 'sm:border-l sm:border-[#e6e8e1]' : ''}`}><Icon size={22} className="shrink-0 text-[#718b21]" strokeWidth={1.6} /><div><p className="text-[11px] font-bold text-[#263d31] sm:text-xs">{title}</p><p className="mt-0.5 text-[10px] text-[#77837b]">{note}</p></div></div>)}</div>
      </section>

      <footer className="mx-auto max-w-[1360px] px-5 pb-5 pt-5 text-[11px] text-[#879189] sm:px-8 lg:px-10"><div className="flex flex-col justify-between gap-2 border-t border-[#e1e6dd] pt-5 sm:flex-row"><span>JDM Homes · Gurugram neighbourhood marketplace</span><span>Confirm ownership and visit before making a payment.</span></div></footer>
      <BottomNav />
    </main>
  )
}
