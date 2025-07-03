import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Business Platform - Dominate Your Industry',
  description: 'Transform your business with AI-powered strategies and custom tools. Two powerful wizards to guide your digital transformation.',
  keywords: 'AI business, automation, digital transformation, business strategy, AI tools',
  authors: [{ name: 'AI Business Platform' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  )
}
