'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, BadgeCheck, Check, ImagePlus, MapPin, ShieldCheck } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'

const field = 'mt-1 min-h-12 w-full rounded-xl border border-[#dfe5da] bg-white px-3.5 text-sm font-normal text-[#17271f] outline-none transition focus:border-[#8aa52a] focus:ring-2 focus:ring-[#e7f0cb]'
const localities = ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Golf Course Road', 'Golf Course Extension Road', 'Dwarka Expressway', 'Sohna Road', 'Sector 56', 'New Gurugram', 'Central Gurugram', 'Other Gurugram area']

export default function PostPage() {
  const [form, setForm] = useState({ title: '', description: '', type: 'apartment', purpose: 'sale', price: '', bedrooms: '2', bathrooms: '1', area: '', locality: '', society: '', contactPhone: '', photoUrl: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending'); setMessage('')
    const payload = { ...form, bedrooms: form.type === 'commercial' || form.type === 'plot' ? '0' : form.bedrooms, ownerType: 'owner', brokerage: 'owner', images: form.photoUrl ? [form.photoUrl] : [] }
    const response = await fetch('/api/properties/manage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => null)
    const result = await response?.json().catch(() => ({}))
    if (!response?.ok) { setState('error'); setMessage(result?.error || 'We could not submit your listing. Please try again.'); return }
    setState('done'); setMessage('Your property is in the review queue. It will appear publicly after the JDM team reviews the details.')
  }

  return <main className="min-h-screen bg-[#f6f6ef] text-[#17271f]"><div className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-8 sm:py-8">
    <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#58700e]"><ArrowLeft size={17}/>Back home</Link>
    <div className="mt-8 grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
      <aside className="lg:sticky lg:top-8 lg:self-start"><p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#819b20]">Owner workspace</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.06em] sm:text-5xl">List your place, simply.</h1><p className="mt-3 text-sm leading-6 text-[#738079]">Start with the essentials. The JDM team will follow up if anything else is needed.</p><div className="mt-6 space-y-3 rounded-[20px] border border-[#e2e1d6] bg-[#fffefa] p-4 shadow-[0_8px_24px_rgba(31,47,36,.04)]"><div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#edf1df]"><ShieldCheck className="text-[#77901f]" size={17}/></span><p className="pt-0.5 text-xs leading-5 text-[#66746c]"><strong className="text-[#344238]">Reviewed before publishing.</strong> New listings stay private until checked by the JDM team.</p></div><div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#edf1df]"><MapPin className="text-[#77901f]" size={17}/></span><p className="pt-0.5 text-xs leading-5 text-[#66746c]"><strong className="text-[#344238]">Gurugram focused.</strong> Add a sector or locality so nearby buyers can find you.</p></div></div></aside>
      <section>{state === 'done' ? <div className="rounded-[24px] border border-[#dce9b5] bg-[#f1f8d8] p-7 shadow-[0_16px_36px_rgba(80,102,35,.07)] sm:p-9"><span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#58700e]"><Check/></span><h2 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Listing sent for review</h2><p className="mt-2 text-sm leading-6 text-[#617069]">{message}</p><Link href="/profile" className="mt-5 inline-flex rounded-xl bg-[#174936] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#215c43]">View my listings</Link></div> : <form onSubmit={submit} className="rounded-[24px] border border-[#e1e1d8] bg-[#fffefa] p-5 shadow-[0_18px_48px_rgba(25,48,37,.065)] sm:p-7">
        <div className="mb-5"><h2 className="text-xl font-semibold">Property basics</h2><p className="mt-1 text-xs text-[#77847d]">A few clear details are enough to get started.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-bold text-[#58665e] sm:col-span-2">Listing title<input required minLength={8} maxLength={120} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Sunlit 2 BHK near Rapid Metro" className={field}/></label>
          <label className="text-xs font-bold text-[#58665e]">I want to<select value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} className={field}><option value="sale">Sell</option><option value="rent">Rent out</option></select></label>
          <label className="text-xs font-bold text-[#58665e]">Property type<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={field}><option value="apartment">Apartment / flat</option><option value="builder-floor">Builder floor / house</option><option value="plot">Residential plot</option><option value="commercial">Commercial space</option></select></label>
          <label className="text-xs font-bold text-[#58665e]">{form.purpose === 'rent' ? 'Monthly rent (₹)' : 'Expected price (₹)'}<input required type="number" min="1000" max="1000000000" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder={form.purpose === 'rent' ? '35000' : '15000000'} className={field}/></label>
          <label className="text-xs font-bold text-[#58665e]">Area (sq ft)<input required type="number" min="100" max="1000000" value={form.area} onChange={e=>setForm({...form,area:e.target.value})} placeholder="1250" className={field}/></label>
          {form.type !== 'plot' && form.type !== 'commercial' && <label className="text-xs font-bold text-[#58665e]">Bedrooms<input type="number" min="0" max="20" value={form.bedrooms} onChange={e=>setForm({...form,bedrooms:e.target.value})} className={field}/></label>}
          <label className="text-xs font-bold text-[#58665e]">Sector / locality<input required value={form.locality} onChange={e=>setForm({...form,locality:e.target.value})} list="gurugram-localities" placeholder="Sector 56" className={field}/><datalist id="gurugram-localities">{localities.map(item=><option key={item} value={item}/>)}</datalist></label>
          <label className="text-xs font-bold text-[#58665e]">Society / project <span className="font-normal text-[#8a928b]">(optional)</span><input value={form.society} onChange={e=>setForm({...form,society:e.target.value})} placeholder="Name of society or project" className={field}/></label>
          <label className="text-xs font-bold text-[#58665e]">Phone number <span className="font-normal text-[#8a928b]">(optional)</span><input type="tel" value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})} placeholder="+91 98…" className={field}/></label>
          <label className="text-xs font-bold text-[#58665e] sm:col-span-2">Short description <span className="font-normal text-[#8a928b]">(optional)</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} maxLength={4000} placeholder="Share what makes this property a good fit." className={`${field} py-3`}/></label>
          <label className="text-xs font-bold text-[#58665e] sm:col-span-2">Cover photo link <span className="font-normal text-[#8a928b]">(optional)</span><span className="mt-1 flex min-h-12 items-center gap-2 rounded-xl border border-dashed border-[#d5d9d0] px-3.5 text-sm font-normal text-[#7b847c]"><ImagePlus size={17}/><input type="url" value={form.photoUrl} onChange={e=>setForm({...form,photoUrl:e.target.value})} placeholder="Paste a link to your property photo" className="min-w-0 flex-1 bg-transparent outline-none"/></span></label>
          {form.photoUrl && <div className="sm:col-span-2"><img src={form.photoUrl} alt="Property photo preview" className="max-h-52 w-full object-cover" onError={e=>{e.currentTarget.style.display='none'}}/></div>}
          <div className="sm:col-span-2 rounded-xl border border-[#e6e9e2] bg-[#fafbf7] p-4 text-xs leading-5 text-[#6e7a71]"><p className="flex items-center gap-2 font-bold text-[#435248]"><BadgeCheck size={15} className="text-[#819b20]"/>What happens next</p><p className="mt-1">Your listing is submitted for review and does not appear in public search until it is approved.</p></div>
        </div>
        {message && state === 'error' && <p role="alert" className="mt-4 rounded-xl bg-[#fff1ee] p-3 text-sm text-[#923d32]">{message}</p>}
        <button disabled={state==='sending'} className="mt-6 min-h-12 w-full rounded-xl bg-[#174936] px-5 text-sm font-bold text-white transition hover:bg-[#215c43] disabled:cursor-wait disabled:opacity-60">{state==='sending'?'Submitting…':'Submit for review'}</button>
        <p className="mt-3 text-center text-[11px] text-[#889188]">You’ll need to sign in before submitting.</p>
      </form>}</section>
    </div>
  </div><BottomNav/></main>
}
