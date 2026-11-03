export type SampleProperty = {
  id: string
  title: string
  locality: string
  price: number
  purpose: 'sale' | 'rent'
  type: 'apartment' | 'builder-floor' | 'commercial'
  bedrooms: number
  area: number
  images: string[]
  sample: true
}

// Demonstration content only. These are not real or available listings.
export const sampleProperties: SampleProperty[] = [
  {
    id: 'sample-golf-course-apartment',
    title: 'Sunlit 3 BHK apartment',
    locality: 'Golf Course Road, Gurugram',
    price: 24500000,
    purpose: 'sale',
    type: 'apartment',
    bedrooms: 3,
    area: 1850,
    images: ['/images/sample-apartment.webp'],
    sample: true,
  },
  {
    id: 'sample-dlf-builder-floor',
    title: 'Contemporary builder floor',
    locality: 'DLF Phase 3, Gurugram',
    price: 38500000,
    purpose: 'sale',
    type: 'builder-floor',
    bedrooms: 4,
    area: 2400,
    images: ['/images/sample-builder-floor.webp'],
    sample: true,
  },
  {
    id: 'sample-dwarka-rental',
    title: 'Calm 2 BHK city home',
    locality: 'Dwarka Expressway, Gurugram',
    price: 42000,
    purpose: 'rent',
    type: 'apartment',
    bedrooms: 2,
    area: 1320,
    images: ['/images/sample-apartment.webp'],
    sample: true,
  },
  {
    id: 'sample-central-office',
    title: 'Flexible office suite',
    locality: 'Central Gurugram',
    price: 125000,
    purpose: 'rent',
    type: 'commercial',
    bedrooms: 0,
    area: 1450,
    images: ['/images/sample-builder-floor.webp'],
    sample: true,
  },
]
