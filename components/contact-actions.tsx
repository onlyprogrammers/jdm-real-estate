'use client'

import { useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'

export function ContactActions({ propertyId, phone, whatsapp }: { propertyId: string; phone: string | null; whatsapp?: string }) {
  const [notice, setNotice] = useState('')
  function track(event: 'whatsapp_click' | 'call_click') {
    void fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ propertyId, event }) })
  }
  return <div className="mt-5"><div className="flex flex-col gap-2 sm:flex-row"><a href={whatsapp} target={whatsapp ? '_blank' : undefined} rel="noreferrer" onClick={(event) => { if (!whatsapp) { event.preventDefault(); setNotice('Owner contact will be available after the listing is verified.') } else track('whatsapp_click') }} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#174936] text-sm font-bold text-white"><MessageCircle size={17} /> WhatsApp owner</a><a href={phone ? `tel:${phone}` : undefined} onClick={(event) => { if (!phone) { event.preventDefault(); setNotice('Phone contact has not been shared for this listing.') } else track('call_click') }} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dfe3dc] px-5 text-sm font-bold text-[#385047]"><Phone size={16} /> Call</a></div>{notice && <p role="status" className="mt-2 text-xs text-[#758078]">{notice}</p>}</div>
}
