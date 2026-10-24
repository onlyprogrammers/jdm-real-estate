'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Heart, Trash2 } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

type Item = { id: string; title: string; locality: string; price: number; purpose: string; bedrooms: number; area: number; brokerage?: string; powerBackup?: string; images?: string[] }

export function Shortlists({ mode }: { mode: 'saved' | 'compare' }) {
  const [ids, setIds] = useState<string[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const refresh = () => {
      try { const key = mode === 'saved' ? 'jdm:saved' : 'jdm:compare'; setIds(JSON.parse(localStorage.getItem(key) || '[]')) }
      catch { setIds([]) }
    }
    refresh()
    window.addEventListener('jdm:saved-change', refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener('jdm:saved-change', refresh); window.removeEventListener('storage', refresh) }
  }, [mode])
  useEffect(() => {
    if (!ids.length) { setItems([]); setLoading(false); return }
    setLoading(true); setError('')
    fetch(`/api/properties?ids=${ids.join(',')}&pageSize=40`).then(async (response) => {
      const data = await response.json()
      if (!response.ok && response.status !== 503) throw new Error(data.error || 'Could not load your shortlist.')
      const byId = new Map((data.properties as Item[] || []).map((item) => [item.id, item]))
      setItems(ids.map((id) => byId.get(id)).filter(Boolean) as Item[])
      if (response.status === 503) setError(data.message || data.error || '')
    }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Could not load your shortlist.')).finally(() => setLoading(false))
  }, [ids])
  function remove(id: string) {
    const next = ids.filter((value) => value !== id)
    localStorage.setItem(mode === 'saved' ? 'jdm:saved' : 'jdm:compare', JSON.stringify(next))
    setIds(next); window.dispatchEvent(new Event('jdm:saved-change'))
  }
  const money = (item: Item) => `₹${new Intl.NumberFormat('en-IN').format(item.price)}${item.purpose === 'rent' || item.purpose === 'pg' ? '/mo' : ''}`

  return <main className="min-h-screen bg-[#f6f6ef] px-4 py-6 pb-28 text-[#17271f] sm:px-8 sm:py-8"><div className="mx-auto max-w-5xl"><Link href="/search" className="flex items-center gap-2 text-sm font-bold text-[#58700e]"><ArrowLeft size={17} /> Explore homes</Link><p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#819b20]">Your shortlist</p><div className="mt-2 flex items-end justify-between"><div><h1 className="text-4xl font-semibold tracking-[-.06em]">{mode === 'saved' ? 'Homes worth keeping.' : 'Compare your options.'}</h1><p className="mt-2 text-sm text-[#738079]">{mode === 'saved' ? 'Your saved Gurugram homes, together.' : 'A side-by-side look at the details.'}</p></div>{mode === 'saved' && <Link href="/compare" className="rounded-xl border border-[#dfe3dc] bg-white px-3.5 py-2.5 text-xs font-bold">Compare homes</Link>}</div>
    {loading ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{[1,2,3,4].map((i) => <div className="h-52 animate-pulse rounded-2xl bg-[#e8ebe2]" key={i} />)}</div> : error ? <div className="mt-6 rounded-2xl bg-[#fbfaf2] p-5 text-sm text-[#626b60]">{error}</div> : !items.length ? <div className="mt-6 rounded-[24px] border border-dashed border-[#cfd8cc] bg-white p-8 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#edf3dc] text-[#658019]"><Heart size={20} /></span><h2 className="mt-4 text-xl font-semibold">{ids.length ? 'These listings are no longer available.' : mode === 'saved' ? 'Nothing saved yet.' : 'Pick a few homes to compare.'}</h2><p className="mt-2 text-sm text-[#738079]">Tap the heart or Compare button on any listing to keep it here.</p><Link href="/search" className="mt-4 inline-block rounded-xl bg-[#b7d649] px-4 py-2.5 text-sm font-bold text-[#174936]">Explore listings</Link></div> : mode === 'saved' ? <div className="mt-6 grid gap-4 sm:grid-cols-2">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-[20px] border border-[#e1e7df] bg-white"><Link href={`/property/${item.id}`} className="flex gap-4 p-3"><div className="size-28 shrink-0 overflow-hidden rounded-xl bg-[#e5e9df]">{item.images?.[0] && <img src={item.images[0]} alt="" className="size-full object-cover" />}</div><div className="min-w-0 flex-1 py-1"><p className="line-clamp-2 text-sm font-bold">{item.title}</p><p className="mt-1 text-xs text-[#77847d]">{item.locality}</p><p className="mt-3 text-sm font-bold text-[#174936]">{money(item)}</p></div></Link><div className="flex justify-between border-t border-[#edf0ec] px-4 py-3"><button onClick={() => remove(item.id)} className="flex items-center gap-1.5 text-xs font-semibold text-[#7e554e]"><Trash2 size={14} /> Remove</button><Link href={`/property/${item.id}`} className="flex items-center gap-1 text-xs font-bold text-[#58700e]">Details <ArrowRight size={14} /></Link></div></article>)}</div> : <div className="mt-6 overflow-x-auto rounded-[22px] border border-[#e1e7df] bg-white"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-[#e7ebe5]"><th className="p-5 text-xs uppercase tracking-wide text-[#829087]">Details</th>{items.map((item) => <th className="p-5" key={item.id}><Link href={`/property/${item.id}`} className="font-semibold hover:text-[#58700e]">{item.title}</Link><p className="mt-1 text-xs font-normal text-[#738079]">{item.locality}</p><button onClick={() => remove(item.id)} className="mt-2 text-xs font-semibold text-[#8b4e47]">Remove</button></th>)}</tr></thead><tbody>{[['Price', ...items.map(money)], ['Configuration', ...items.map((item) => item.bedrooms ? `${item.bedrooms} BHK` : 'Room / bed')], ['Area', ...items.map((item) => item.area ? `${item.area.toLocaleString('en-IN')} sq ft` : 'Not provided')], ['Brokerage', ...items.map((item) => item.brokerage === 'owner' ? 'Zero brokerage' : 'Confirm with lister')], ['Power backup', ...items.map((item) => item.powerBackup || 'Not provided')]].map((row) => <tr key={row[0]} className="border-b border-[#eef1ec] last:border-0"><th className="p-5 font-medium text-[#738079]">{row[0]}</th>{row.slice(1).map((value, index) => <td key={`${row[0]}-${index}`} className="p-5 font-semibold">{value}</td>)}</tr>)}</tbody></table><p className="px-5 pb-5 text-xs text-[#829087]">Availability and charges can change. Confirm all details with the owner before paying a token.</p></div>}
    </div><BottomNav /></main>
}
