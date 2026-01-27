"use client"

import { cn } from "@/lib/utils"

interface CourseProgressRingProps {
  progress: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function CourseProgressRing({ 
  progress, 
  size = "md", 
  showLabel = true,
  className 
}: CourseProgressRingProps) {
  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: "text-xs" },
    md: { width: 80, stroke: 6, fontSize: "text-sm" },
    lg: { width: 120, stroke: 8, fontSize: "text-lg" }
  }

  const { width, stroke, fontSize } = sizes[size]
  const radius = (width - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getColor = (progress: number) => {
    if (progress < 30) return "stroke-red-500"
    if (progress < 70) return "stroke-yellow-500"
    return "stroke-green-500"
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={width} height={width} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", getColor(progress))}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", fontSize)}>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  )
}
