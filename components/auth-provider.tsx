"use client"

import { ReactNode, useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"

export function AuthProvider({ children }: { children: ReactNode }) {
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return <>{children}</>
}
