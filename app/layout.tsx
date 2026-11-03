import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jdm-real-estate.vercel.app'),
  title: {
    default: 'JDM Real Estate | Property in Gurugram',
    template: '%s | JDM Real Estate',
  },
  description: 'Find a home that fits your life in Gurugram. Explore reviewed listings, compare your options, and get local guidance from JDM Real Estate.',
  applicationName: 'JDM Real Estate',
  keywords: ['Gurugram property', 'homes in Gurugram', 'Gurugram rentals', 'property for sale', 'JDM Real Estate'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'JDM Real Estate',
    title: 'JDM Real Estate | Property in Gurugram',
    description: 'Find a home that fits your life in Gurugram with reviewed listings and local guidance.',
  },
  icons: {
    icon: [{ url: '/jdm-mark.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f2e9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
