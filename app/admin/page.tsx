'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, Building2, Check, Clock3, LayoutDashboard, LoaderCircle, RefreshCw, ShieldCheck, Users, X } from 'lucide-react'

type Property = { id: string; title: string; locality: string; price: number; purpose: string; type: string; status: string; createdAt: string; images?: string[] | null; ownerId: string }
type Lead = { id: string; propertyId: string; event: string; channel: string; createdAt: string; metadata?: Record<string, unknown> }
type Dashboard = { stats: { all: number; active: number; pending: number; leads: number }; pending: Property[]; leads: Lead[] }
const money = (n: number, purpose: string) => purpose === 'rent' || purpose === 'pg' ? `₹${new Intl.NumberFormat('en-IN').format(n)}/mo` : `₹${new Intl.NumberFormat('en-IN').format(n)}`

export default function AdminPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
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

  async function review(item: Property, status: 'published' | 'rejected') {
    setBusy(item.id); setError('')
    try {
      const response = await fetch('/api/admin', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: item.id, status }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update listing.')
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update listing.') }
    finally { setBusy('') }
  }

  const stats = data?.stats
  const sections = [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'listings', label: 'Property review', icon: Building2, count: stats?.pending }, { id: 'leads', label: 'Contact activity', icon: Users, count: stats?.leads }]
  return <main className="min-h-screen bg-[#f4f3ef] text-[#202620] lg:min-h-screen">
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
              {data.pending.length===0?<div className="mt-4 border border-[#e4e1d8] bg-[#fffefa] p-8 text-center"><p className="font-serif text-xl">Queue is clear</p><p className="mt-1 text-sm text-[#7b8179]">New owner submissions will appear here for review.</p></div>:<div className="mt-4 overflow-hidden border border-[#e4e1d8] bg-[#fffefa]"><div className="hidden grid-cols-[minmax(260px,1.6fr)_1fr_140px_180px] border-b border-[#ebe8e0] px-5 py-3 text-[9px] font-bold uppercase tracking-[.14em] text-[#85897f] lg:grid"><span>Property</span><span>Location</span><span>Asking price</span><span>Review</span></div>{data.pending.map(item=><article key={item.id} className="grid gap-3 border-b border-[#eeece6] p-4 last:border-0 sm:grid-cols-[1fr_auto] sm:p-5 lg:grid-cols-[minmax(260px,1.6fr)_1fr_140px_180px] lg:items-center"><div className="flex min-w-0 items-center gap-3">{item.images?.[0]?<img src={item.images[0]} alt="" className="size-14 shrink-0 object-cover"/>:<div className="grid size-14 shrink-0 place-items-center bg-[#efede6] text-[#938568]"><Building2 size={19}/></div>}<div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-1 text-[10px] text-[#81867d]">{item.type.replaceAll('-',' ')} · submitted {new Date(item.createdAt).toLocaleDateString('en-IN')}</p></div></div><p className="text-xs text-[#687268]">{item.locality}, Gurugram</p><p className="text-xs font-semibold">{money(item.price,item.purpose)}</p><div className="flex gap-2"><button onClick={()=>void review(item,'published')} disabled={busy===item.id} className="flex min-h-9 items-center gap-1.5 bg-[#26372e] px-3 text-[10px] font-bold text-white disabled:opacity-50"><Check size={13}/>Approve</button><button onClick={()=>void review(item,'rejected')} disabled={busy===item.id} className="flex min-h-9 items-center gap-1.5 border border-[#e3dfd5] px-3 text-[10px] font-semibold text-[#76504a] disabled:opacity-50"><X size={13}/>Reject</button></div></article>)}</div>}
            </>}
            {section==='leads'&&<><div className="mb-5 border border-[#e4e1d8] bg-[#fffefa] p-5"><p className="text-xs text-[#798077]">Recorded contact activity</p><p className="mt-2 font-serif text-3xl">{stats?.leads??0}</p></div><div className="overflow-hidden border border-[#e4e1d8] bg-[#fffefa]">{data.leads.length===0?<p className="p-6 text-sm text-[#798077]">No contact activity has been recorded.</p>:data.leads.map(lead=><div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeece6] px-5 py-4 last:border-0"><div><p className="text-sm font-semibold">{lead.event.replaceAll('_',' ')}</p><p className="mt-1 text-[10px] text-[#81867d]">Property {lead.propertyId.slice(0,8)} · {lead.channel}</p></div><p className="text-xs text-[#747b72]">{new Date(lead.createdAt).toLocaleString('en-IN')}</p></div>)}</div></>}
            {section==='overview'&&<div className="mt-8 border border-[#e4e1d8] bg-[#fffefa] p-5"><h2 className="font-serif text-xl">Operations at a glance</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#737a71]">Review owner-submitted listings before publication. Only approved listings become public, and review decisions are recorded by the server. Contact events here include recorded property call and WhatsApp actions.</p></div>}
          </>}
        </div>
      </section>
    </div>
  </main>
}
