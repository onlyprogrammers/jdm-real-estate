import { PropertySearch } from '@/components/property-search'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; purpose?: string; type?: string; maxPrice?: string; bedrooms?: string; brokerage?: string; preference?: string; immediate?: string; transit?: string; transitMaxDistance?: string }> }) {
  const params = await searchParams
  return <PropertySearch initialQuery={params.q ?? ''} initialPurpose={params.purpose ?? 'rent'} initialFilters={{ type: params.type, maxPrice: params.maxPrice, bedrooms: params.bedrooms, brokerage: params.brokerage, preference: params.preference, immediate: params.immediate === 'true', transit: params.transit, transitMaxDistance: params.transitMaxDistance }} />
}
