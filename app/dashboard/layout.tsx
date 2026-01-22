"use client"

import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useState } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 bg-gradient-to-br from-background to-muted/20 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
