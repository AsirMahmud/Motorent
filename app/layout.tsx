import type { Metadata, Viewport } from 'next'
import { Familjen_Grotesk, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin'
import { extractRouterConfig } from 'uploadthing/server'
import { AppProvider } from '@/lib/context'
import { AuthSessionProvider } from '@/components/session-provider'
import { Toaster } from '@/components/ui/sonner'
import { ourFileRouter } from '@/lib/uploadthing'
import './globals.css'

const manrope = Manrope({
  subsets: ["latin"],
  variable: '--font-manrope'
});

const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: '--font-familjen'
});

export const metadata: Metadata = {
  title: 'MotoRent - Rent any vehicle. Move freely.',
  description: 'Rent verified bikes and cars across Bangladesh or list your vehicles and grow your rental business.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${familjenGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <AuthSessionProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthSessionProvider>
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
      </body>
    </html>
  )
}
