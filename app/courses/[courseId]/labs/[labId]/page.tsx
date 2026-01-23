"use client"

import { useParams } from "next/navigation"
import LabViewer from "@/components/lab-viewer"

export default function LabPage() {
  const params = useParams()
  const labId = params.labId as string
  const courseId = params.courseId as string

  return <LabViewer labId={labId} courseId={courseId} />
}
