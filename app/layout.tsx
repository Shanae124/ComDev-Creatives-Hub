"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "@/styles/ui-enhancements.css"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { useAuthStore } from "@/lib/auth-store"
import { usePathname } from "next/navigation"
import { NavHeader } from "@/components/nav-header"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/verify-email")

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Protexxa Learning Platform | Enterprise Cybersecurity Training</title>
        <meta
          name="description"
          content="Advanced learning management system powered by Protexxa. Featuring Protexxa Defender, CyberNations, and internal training programs."
        />
        <meta name="generator" content="v0.app" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-light-32x32.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icon-dark-32x32.png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0066cc" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#3b82f6" media="(prefers-color-scheme: dark)" />
        <script src="/course-content-init.js" defer></script>
      </head>
      <body className={`${geistSans.className} font-sans antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {isAuthenticated && !isAuthPage ? (
              <div className="min-h-screen flex flex-col">
                <NavHeader />
                <main className="flex-1 w-full">
                  <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
                    {children}
                  </div>
                </main>
              </div>
            ) : (
              children
            )}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
