'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { ArrowLeft, BadgeCheck, Check, ImagePlus, MapPin, ShieldCheck } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { Brand } from '@/components/brand'

const field = 'mt-1 min-h-12 w-full rounded-xl border border-[#dfe5da] bg-white px-3.5 text-sm font-normal text-[#17271f] outline-none transition focus:border-[#8aa52a] focus:ring-2 focus:ring-[#e7f0cb]'
const localities = ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Golf Course Road', 'Golf Course Extension Road', 'Dwarka Expressway', 'Sohna Road', 'Sector 56', 'New Gurugram', 'Central Gurugram', 'Other Gurugram area']

export default function PostPage() {
  const [form, setForm] = useState({ title: '', description: '', type: 'apartment', purpose: 'sale', price: '', bedrooms: '2', bathrooms: '1', area: '', locality: '', society: '', contactPhone: '' })
  const [photos, setPhotos] = useState<{ file: File; preview: string; url?: string }[]>([])
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  function choosePhotos(files: FileList | null) {
    if (!files) return
    const selected = Array.from(files)
    if (photos.length + selected.length > 8) { setMessage('Add up to 8 photos.'); return }
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
    const invalid = selected.find(file => !allowed.has(file.type) || file.size > 8 * 1024 * 1024)
    if (invalid) { setMessage('Use JPG, PNG, WebP, or AVIF photos up to 8 MB each.'); return }
    setMessage('')
    setPhotos(current => [...current, ...selected.map(file => ({ file, preview: URL.createObjectURL(file) }))])
  }

  function removePhoto(index: number) {
    setPhotos(current => {
      URL.revokeObjectURL(current[index].preview)
      return current.filter((_, i) => i !== index)
    })
  }

  async function uploadPhotos() {
    const uploaded: string[] = []
    for (const photo of photos) {
      if (photo.url) { uploaded.push(photo.url); continue }
      const signResponse = await fetch('/api/uploads/sign', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contentType: photo.file.type, size: photo.file.size }),
      })
      const signed = await signResponse.json().catch(() => ({}))
      if (!signResponse.ok) throw new Error(signed.error || 'Could not prepare a photo upload.')
      const uploadUrl = new URL(signed.uploadUrl)
      uploadUrl.searchParams.set('token', signed.token)
      const response = await fetch(uploadUrl, { method: 'PUT', headers: { 'content-type': photo.file.type, 'x-upsert': 'false' }, body: photo.file })
      if (!response.ok) throw new Error('A photo could not be uploaded. Please retry.')
      uploaded.push(signed.publicUrl)
    }
    return uploaded
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending'); setMessage('')
    try {
      const images = await uploadPhotos()
      const payload = { ...form, bedrooms: form.type === 'commercial' || form.type === 'plot' ? '0' : form.bedrooms, ownerType: 'owner', brokerage: 'owner', images }
      const response = await fetch('/api/properties/manage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result?.error || 'We could not submit your listing. Please try again.')
    } catch (error) {
      setState('error'); setMessage(error instanceof Error ? error.message : 'We could not submit your listing. Please try again.'); return
    }
    setState('done'); setMessage('Your property is in the review queue. It will appear publicly after the JDM team reviews the details.')
  }

  return <main className="min-h-screen bg-[#f6f6ef] text-[#17271f]"><div className="mx-auto max-w-5xl px-4 py-5 pb-20 sm:px-8 sm:py-8">
    <header className="flex items-center justify-between"><Brand compact/><Link href="/search" className="flex min-h-10 items-center gap-1.5 text-xs font-semibold text-[#58700e]"><ArrowLeft size={15}/>Browse</Link></header>
    <div className="mt-5 grid gap-4 lg:mt-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-6">
      <aside className="lg:sticky lg:top-8 lg:self-start"><p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#819b20]">Owner workspace</p><h1 className="mt-1.5 text-3xl font-semibold tracking-[-.05em] sm:text-5xl">List your place, simply.</h1><p className="mt-2 text-xs leading-5 text-[#738079] sm:mt-3 sm:text-sm sm:leading-6">Start with the essentials. The JDM team will follow up if anything else is needed.</p><div className="mt-4 space-y-2 rounded-xl border border-[#e2e1d6] bg-[#fffefa] p-3 shadow-[0_6px_18px_rgba(31,47,36,.035)] sm:mt-6 sm:space-y-3 sm:rounded-[20px] sm:p-4"><div className="flex gap-2.5"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#edf1df]"><ShieldCheck className="text-[#77901f]" size={15}/></span><p className="pt-0.5 text-[11px] leading-4 text-[#66746c]"><strong className="text-[#344238]">Reviewed before publishing.</strong> New listings stay private until checked by the JDM team.</p></div><div className="flex gap-2.5"><span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#edf1df]"><MapPin className="text-[#77901f]" size={15}/></span><p className="pt-0.5 text-[11px] leading-4 text-[#66746c]"><strong className="text-[#344238]">Gurugram focused.</strong> Add a sector or locality so nearby buyers can find you.</p></div></div></aside>
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
          <div className="sm:col-span-2"><p className="text-xs font-bold text-[#58665e]">Property photos <span className="font-normal text-[#8a928b]">(optional · up to 8)</span></p><input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={e=>{choosePhotos(e.currentTarget.files); e.currentTarget.value=''}}/><button type="button" onClick={()=>fileInput.current?.click()} className="mt-1 flex min-h-12 w-full items-center gap-2 rounded-xl border border-dashed border-[#d5d9d0] px-3.5 text-left text-sm font-normal text-[#7b847c] transition hover:border-[#8aa52a]"><ImagePlus size={17}/><span>Add photos from your device</span><span className="ml-auto text-[11px]">8 MB max each</span></button>{photos.length > 0 && <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{photos.map((photo, index)=><div key={`${photo.file.name}-${index}`} className="relative overflow-hidden rounded-xl border border-[#e1e1d8]"><img src={photo.preview} alt={`Property photo ${index+1}`} className="h-28 w-full object-cover"/><button type="button" onClick={()=>removePhoto(index)} aria-label={`Remove photo ${index+1}`} className="absolute right-1 top-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold text-white">Remove</button></div>)}</div>}</div>
          <div className="sm:col-span-2 rounded-xl border border-[#e6e9e2] bg-[#fafbf7] p-4 text-xs leading-5 text-[#6e7a71]"><p className="flex items-center gap-2 font-bold text-[#435248]"><BadgeCheck size={15} className="text-[#819b20]"/>What happens next</p><p className="mt-1">Your listing is submitted for review and does not appear in public search until it is approved.</p></div>
        </div>
        {message && state === 'error' && <p role="alert" className="mt-4 rounded-xl bg-[#fff1ee] p-3 text-sm text-[#923d32]">{message}</p>}
        <button disabled={state==='sending'} className="mt-6 min-h-12 w-full rounded-xl bg-[#174936] px-5 text-sm font-bold text-white transition hover:bg-[#215c43] disabled:cursor-wait disabled:opacity-60">{state==='sending'?'Submitting…':'Submit for review'}</button>
        <p className="mt-3 text-center text-[11px] text-[#889188]">You’ll need to sign in before submitting.</p>
      </form>}</section>
    </div>
  </div><BottomNav/></main>
}
