'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowUpRight, Heart, House, LogOut, MessageCircle, UserRound } from 'lucide-react'
import { BottomNav } from '@/components/bottom-nav'
import { Brand } from '@/components/brand'
import { authClient } from '@/lib/auth-client'
import { OwnerListings } from '@/components/owner-listings'

const profileItems = [
  { label: 'Saved homes', note: 'Keep your shortlist close.', href: '/saved', icon: Heart },
  { label: 'My listings', note: 'Manage the places you post.', href: '/post', icon: House },
  { label: 'Inquiries', note: 'Stay on top of conversations.', href: '/post', icon: MessageCircle },
]

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [signingOut, setSigningOut] = useState(false)
  const user = session?.user

  async function signOut() {
    setSigningOut(true)
    const result = await authClient.signOut()
    if (!result.error) {
      await authClient.getSession()
      router.refresh()
    }
    setSigningOut(false)
  }

  return <main className="min-h-screen bg-[#f5f2e9] px-4 py-5 pb-20 text-[#17271f] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-3xl">
      <Brand compact />
      <section className="relative mt-5 overflow-hidden rounded-2xl border border-[#345c47] bg-[#174936] p-5 text-white shadow-[0_16px_36px_rgba(23,73,54,.14)] sm:mt-8 sm:rounded-[26px] sm:p-9">
        <div aria-hidden="true" className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -right-2 -top-14 size-52 rounded-full border border-white/10" />
        <div className="relative">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#d5bd8e]">Your JDM profile</p>
          {isPending ? <><h1 className="mt-1.5 text-3xl font-semibold sm:text-4xl">Checking your account…</h1><p className="mt-2.5 text-xs text-white/70 sm:text-sm">One moment while we load your profile.</p></> : user ? <>
            <h1 className="mt-1.5 max-w-lg text-3xl font-semibold sm:text-4xl">Welcome, {user.name || 'home seeker'}.</h1>
            <p className="mt-2.5 max-w-md break-all text-xs leading-5 text-white/70 sm:text-sm sm:leading-6">{user.email}</p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
              <Link href="/saved" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#d5bd8e] px-3.5 py-2 text-xs font-bold text-[#174936] transition hover:bg-[#e4d3b4] sm:text-sm"><Heart size={15} />Saved homes</Link>
              <button type="button" onClick={signOut} disabled={signingOut} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/25 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-60 sm:text-sm"><LogOut size={15} />{signingOut ? 'Signing out…' : 'Sign out'}</button>
            </div>
          </> : <>
            <h1 className="mt-1.5 max-w-lg text-3xl font-semibold sm:text-4xl">Welcome to your home base.</h1>
            <p className="mt-2.5 max-w-md text-xs leading-5 text-white/70 sm:text-sm sm:leading-6">Sign in to bring your saved homes, listings, and conversations together.</p>
            <Link href="/login" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#d5bd8e] px-3.5 py-2 text-xs font-bold text-[#174936] transition hover:bg-[#e4d3b4] sm:mt-6 sm:text-sm">Sign in to continue <ArrowUpRight size={14} /></Link>
            <Link href="/signup" className="ml-3 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-white/80 hover:text-white sm:text-sm">Create account <ArrowUpRight size={14} /></Link>
          </>}
        </div>
      </section>
      <section aria-label="Profile shortcuts" className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-3 sm:gap-3">
        {profileItems.map(({ label, note, href, icon: Icon }) => <Link href={href} key={label} className="group rounded-xl border border-[#e1e0d6] bg-[#fffefa] p-3 shadow-[0_4px_14px_rgba(31,47,36,.03)] transition hover:-translate-y-0.5 hover:border-[#cbd3bd] hover:shadow-[0_12px_28px_rgba(31,47,36,.08)] sm:rounded-2xl sm:p-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#edf1df] text-[#506733]"><Icon size={16} /></span>
          <span className="mt-2.5 flex items-center justify-between text-xs font-semibold sm:mt-4 sm:text-sm">{label}<ArrowUpRight size={14} className="text-[#8a9683] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#31533f]" /></span>
          <span className="mt-0.5 block text-[11px] leading-4 text-[#829087]">{note}</span>
          <span className="mt-2 flex items-center gap-1.5 border-t border-[#eeece4] pt-2 text-[9px] font-medium text-[#879187] sm:mt-3 sm:pt-3 sm:text-[10px]">{isPending ? 'Loading account…' : user ? <><UserRound size={12} />Available in your account</> : 'Sign in to view'}</span>
        </Link>)}
      </section>
      <OwnerListings enabled={Boolean(user)} />
    </div>
    <BottomNav />
  </main>
}
