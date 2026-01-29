import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { LazyToaster } from '@/components/ui/lazy-toaster'
import { QueryProvider } from '@/components/providers/query-provider'
import { UserProvider } from '@/hooks/use-user'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'optional',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'optional',
})

export const metadata: Metadata = {
  title: 'Rosetta',
  description: 'Article management platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <UserProvider>
              <div className="flex min-h-screen flex-col">
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
                >
                  Skip to content
                </a>
                <Header />
                <div id="main-content" className="flex-1">
                  {children}
                </div>
                <Footer />
              </div>
              <LazyToaster />
            </UserProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
