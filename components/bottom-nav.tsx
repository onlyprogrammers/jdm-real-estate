'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, Plus, Search, UserRound } from 'lucide-react'

const items = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'Shortlists', href: '/saved', icon: Heart },
  { label: 'Post property', href: '/post', icon: Plus },
  { label: 'Profile', href: '/profile', icon: UserRound },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[480px] items-end justify-around border-t border-[#e2e7e0] bg-[#fbfcfa]/95 px-2 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_25px_rgba(25,48,37,0.06)] backdrop-blur-lg md:hidden">
      {items.map(({ label, href, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link href={href} key={label} aria-label={`Go to ${label}`} aria-current={active ? 'page' : undefined} className={`flex min-w-14 flex-col items-center gap-1 text-[10px] font-medium transition-colors ${active ? 'text-[#174936]' : 'text-[#98a39c]'}`}>
            {label === 'Post property' ? <span className="-mt-6 flex size-12 items-center justify-center rounded-2xl bg-[#b7d649] text-[#174936] shadow-[0_6px_18px_rgba(137,163,31,0.3)]"><Icon size={22} strokeWidth={2.5} /></span> : <Icon size={19} fill={active && label === 'Shortlists' ? 'currentColor' : 'none'} />}
            <span>{label === 'Post property' ? 'Post' : label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
