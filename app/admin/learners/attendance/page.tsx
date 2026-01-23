"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardCheck, Download, CheckCircle, XCircle, Clock } from "lucide-react"

interface AttendanceRecord {
  id: number
  studentName: string
  date: string
  status: "present" | "absent" | "late" | "excused"
  notes?: string
}

export default function AttendancePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      router.push('/dashboard')
      return
    }
    fetchAttendance()
  }, [user, date])

  const fetchAttendance = async () => {
    try {
      // Mock data
      setAttendance([
        { id: 1, studentName: "John Doe", date: "2026-01-23", status: "present" },
        { id: 2, studentName: "Jane Smith", date: "2026-01-23", status: "present" },
        { id: 3, studentName: "Bob Johnson", date: "2026-01-23", status: "absent", notes: "Sick" },
        { id: 4, studentName: "Alice Brown", date: "2026-01-23", status: "late" },
      ])
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateAttendance = async (recordId: number, status: string) => {
    // API call to update attendance
    setAttendance(prev =>
      prev.map(record =>
        record.id === recordId ? { ...record, status: status as any } : record
      )
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="h-5 w-5 text-green-500" />
      case "absent": return <XCircle className="h-5 w-5 text-red-500" />
      case "late": return <Clock className="h-5 w-5 text-yellow-500" />
      case "excused": return <CheckCircle className="h-5 w-5 text-blue-500" />
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'instructor')) return null

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Attendance Tracking
          </h1>
          <p className="text-muted-foreground">Record and monitor student attendance</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Attendance for {date?.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading attendance...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            <Badge variant={
                              record.status === "present" ? "default" :
                              record.status === "absent" ? "destructive" :
                              record.status === "late" ? "outline" : "secondary"
                            }>
                              {record.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                        <TableCell>
                          <Select
                            value={record.status}
                            onValueChange={(value) => updateAttendance(record.id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="excused">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
