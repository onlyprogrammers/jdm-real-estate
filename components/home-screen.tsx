'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, BadgeCheck, Building2, ChevronDown, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

const localities = [
  { name: 'DLF Phase 3', note: 'Close to Cyber City', count: 'Owner homes', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85' },
  { name: 'Sector 56', note: 'Golf Course Road', count: 'Metro connected', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85' },
  { name: 'Sohna Road', note: 'Room to grow', count: 'Family friendly', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85' },
]

const suggestions: { label: string; filters: Record<string, string> }[] = [
  { label: 'Under ₹25k', filters: { maxPrice: '25000' } },
  { label: 'No brokerage', filters: { brokerage: 'owner' } },
  { label: '1 RK / 1 BHK', filters: { bedrooms: '1' } },
  { label: 'Move in now', filters: { immediate: 'true' } },
]

export function HomeScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [purpose, setPurpose] = useState('rent')

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams({ purpose, ...(query.trim() ? { q: query.trim() } : {}) })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-[#f6f6ef] text-[#17271f]">
      <div className="mx-auto min-h-screen max-w-[1440px] pb-28">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:py-7">
          <Link href="/" className="flex items-center gap-3" aria-label="JDM Homes home">
            <span className="flex size-11 items-center justify-center rounded-[15px] bg-[#174936] text-[#d8ef78]"><Building2 size={21} strokeWidth={2.4} /></span>
            <span><span className="block font-mono text-[9px] uppercase tracking-[.23em] text-[#7a877e]">Homes with a local point of view</span><span className="text-lg font-bold tracking-[-.05em]">JDM <span className="text-[#78951d]">Homes</span></span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#506158] md:flex" aria-label="Main menu">
            <Link className="hover:text-[#174936]" href="/search">Explore homes</Link><Link className="hover:text-[#174936]" href="/post">List a property</Link><Link className="hover:text-[#174936]" href="/profile">My account</Link>
            <Link href="/login" className="rounded-xl bg-[#174936] px-4 py-2.5 text-white">Sign in</Link>
          </nav>
          <Link href="/profile" className="flex size-10 items-center justify-center rounded-full border border-[#dce2d8] bg-white text-sm font-bold text-[#174936] md:hidden" aria-label="Profile">A</Link>
        </header>

        <section className="relative mx-4 overflow-hidden rounded-[30px] bg-[#174936] text-white sm:mx-8 lg:mx-auto lg:max-w-7xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_77%_10%,rgba(183,214,73,.22),transparent_32%),linear-gradient(115deg,#153e30_0%,#174936_54%,#265a43_100%)]" />
          <div className="relative grid min-h-[460px] items-center gap-7 px-6 py-9 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-14 lg:py-14">
            <div className="max-w-[630px]">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.17em] text-[#d9ef8b]"><Sparkles size={13} /> Gurugram, made more findable</p>
              <h1 className="max-w-xl text-[42px] font-semibold leading-[.98] tracking-[-.075em] sm:text-6xl lg:text-[72px]">Find your corner of <span className="text-[#d8ef78]">Gurugram.</span></h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-white/72 sm:text-base">From a first room near Cyber City to a family home on Golf Course Road, start with the neighbourhood that feels right.</p>

              <div className="mt-8 max-w-2xl rounded-[22px] bg-[#fbfcf7] p-2 text-[#17271f] shadow-[0_20px_55px_rgba(6,27,18,.22)]">
                <div className="flex gap-1 px-2 pt-1" role="group" aria-label="Listing purpose">
                  {['rent', 'sale', 'pg'].map((item) => <button key={item} type="button" onClick={() => setPurpose(item)} className={`rounded-full px-3 py-2 text-xs font-bold capitalize ${purpose === item ? 'bg-[#eaf3c9] text-[#31511c]' : 'text-[#738079] hover:bg-[#f1f3ed]'}`}>{item === 'pg' ? 'PG / Co-living' : item === 'sale' ? 'Buy' : 'Rent'}</button>)}
                </div>
                <form onSubmit={search} className="mt-1 flex items-center gap-2 rounded-[16px] border border-[#e5e9e1] bg-white p-2 pl-3 focus-within:border-[#a9c83b]">
                  <MapPin className="shrink-0 text-[#78951d]" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search by locality or property" placeholder="Sector, society or landmark" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#9aa39c]" />
                  <button className="flex min-h-11 items-center gap-2 rounded-[12px] bg-[#174936] px-4 text-sm font-bold text-white transition hover:bg-[#215c43] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9c83b]"><Search size={16} /><span className="hidden sm:inline">Search</span></button>
                </form>
                <div className="hide-scrollbar mt-2 flex gap-2 overflow-x-auto px-1 pb-1">{suggestions.map((item) => <Link key={item.label} href={`/search?${new URLSearchParams({ purpose, ...item.filters })}`} className="whitespace-nowrap rounded-full border border-[#e8ebe5] px-3 py-1.5 text-[11px] font-semibold text-[#647168] transition hover:border-[#bacd81] hover:bg-[#f6f9eb]">{item.label}</Link>)}</div>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-white/65"><ShieldCheck size={15} className="text-[#d8ef78]" /> Local details that help you decide with confidence.</div>
            </div>
            <div className="relative hidden min-h-[350px] lg:block">
              <div className="absolute right-5 top-1/2 h-[370px] w-[83%] -translate-y-1/2 rotate-[3deg] overflow-hidden rounded-[28px] border border-white/15 bg-[#d8d5c9] shadow-2xl">
                <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=90" alt="Sunlit contemporary living room in a Gurugram home" className="size-full object-cover" />
              </div>
              <div className="absolute bottom-8 left-0 max-w-[235px] rounded-[18px] border border-white/20 bg-[#f9faf4] p-4 text-[#17271f] shadow-xl">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#64801a]"><BadgeCheck size={15} /> Neighbourhood pick</div><p className="mt-2 text-lg font-semibold tracking-[-.04em]">A little more space to settle in.</p><p className="mt-1 text-xs text-[#77837b]">Homes from DLF Phase 3</p>
              </div>
              <div className="absolute right-0 top-9 rounded-full border border-white/20 bg-[#d8ef78] px-4 py-2 text-xs font-bold text-[#254530]">Owner listed · verified details</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pt-11 sm:px-8 lg:pt-16">
          <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-[#829c28]">Choose your map</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.055em] sm:text-3xl">Gurugram, by neighbourhood.</h2><p className="mt-2 text-sm text-[#77837b]">Start with the places people move here for.</p></div><Link href="/search" className="hidden items-center gap-1 text-sm font-bold text-[#4a6812] sm:flex">Explore all <ArrowRight size={16} /></Link></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">{localities.map((place, index) => <Link href={`/search?q=${encodeURIComponent(place.name)}`} key={place.name} className={`group relative min-h-[230px] overflow-hidden rounded-[22px] bg-[#d7d8cf] ${index === 0 ? 'sm:col-span-2 sm:min-h-[290px]' : 'sm:min-h-[290px]'}`}><img src={place.image} alt={`Homes in ${place.name}`} className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.04]" /><div className="absolute inset-0 bg-gradient-to-t from-[#0c2118]/80 via-[#0c2118]/10 to-transparent" /><span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#315246]">{place.count}</span><div className="absolute inset-x-5 bottom-5 text-white"><p className="text-xl font-semibold tracking-[-.04em]">{place.name}</p><p className="mt-1 text-xs text-white/75">{place.note}</p></div></Link>)}</div>
        </section>

        <section className="mx-auto mt-11 max-w-7xl px-5 sm:px-8 lg:mt-16"><div className="flex flex-col justify-between gap-4 rounded-[24px] border border-[#e2e7dc] bg-[#fbfcf7] p-6 sm:flex-row sm:items-center sm:p-8"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#829c28]">A better move starts here</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.05em]">Have a home to share?</h2><p className="mt-1 text-sm text-[#77837b]">Post the real details. Connect with people looking nearby.</p></div><Link href="/post" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b7d649] px-5 text-sm font-bold text-[#23412f] transition hover:bg-[#c7e65a]">List your property <ArrowRight size={16} /></Link></div></section>
        <footer className="mx-auto max-w-7xl px-5 pb-4 pt-9 text-xs text-[#879189] sm:px-8"><div className="flex flex-col justify-between gap-3 border-t border-[#e1e6dd] pt-5 sm:flex-row"><span>JDM Homes · Gurugram neighbourhood marketplace</span><span>Confirm ownership and visit before making a payment.</span></div></footer>
      </div>
      <BottomNav />
    </main>
  )
}
