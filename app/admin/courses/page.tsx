import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminCoursesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 lg:p-8">
          <AdminDashboard />
        </main>
      </div>
    </div>
  )
}
