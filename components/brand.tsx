import Link from 'next/link'

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <Link href="/" aria-label="JDM Real Estate home" className={`inline-flex min-w-0 items-center gap-2.5 ${inverse ? 'text-white' : 'text-[#18271f]'}`}>
      <img src="/jdm-mark.svg" alt="" className="size-9 shrink-0 sm:size-10" />
      <span className="min-w-0 leading-tight">
        <span className="block whitespace-nowrap text-[13px] font-bold tracking-[.08em] sm:text-sm">
          JDM <span className={inverse ? 'font-normal text-[#d5bd8e]' : 'font-normal text-[#a88b5c]'}>REAL ESTATE</span>
        </span>
        {!compact && <span className={`mt-0.5 block text-[9px] uppercase tracking-[.14em] ${inverse ? 'text-white/55' : 'text-[#657168]'}`}>Gurugram · Local expertise</span>}
      </span>
    </Link>
  )
}
