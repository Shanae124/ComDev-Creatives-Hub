'use client'

import React, { useState } from 'react'
import {
  BarChart3,
  Download,
  Upload,
  Settings,
  Eye,
  Edit2,
  TrendingUp,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Gradebook() {
  const [selectedCourse, setSelectedCourse] = useState('Math 101')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  const courses = ['Math 101', 'English 101', 'History 101', 'Science 101']

  const students = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      enrollment: '2024-01-15',
      assignments: [95, 87, 92, 88],
      quizzes: [90, 88, 85],
      midterm: 92,
      final: null,
      participation: 85,
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      enrollment: '2024-01-15',
      assignments: [88, 90, 85, 91],
      quizzes: [92, 89, 88],
      midterm: 89,
      final: null,
      participation: 90,
    },
    {
      id: 3,
      name: 'Carol White',
      email: 'carol@example.com',
      enrollment: '2024-01-16',
      assignments: [78, 82, 80, 85],
      quizzes: [75, 78, 80],
      midterm: 82,
      final: null,
      participation: 75,
    },
    {
      id: 4,
      name: 'David Brown',
      email: 'david@example.com',
      enrollment: '2024-01-16',
      assignments: [92, 95, 94, 96],
      quizzes: [95, 93, 94],
      midterm: 96,
      final: null,
      participation: 95,
    },
  ]

  const calculateAverage = (grades) => {
    const validGrades = grades.filter((g) => g !== null && g !== undefined)
    return validGrades.length > 0
      ? Math.round((validGrades.reduce((a, b) => a + b, 0) / validGrades.length) * 10) / 10
      : 0
  }

  const calculateCourseGrade = (student) => {
    const allGrades = [
      ...student.assignments,
      ...student.quizzes,
      student.midterm,
      student.participation,
    ].filter((g) => g !== null)
    return calculateAverage(allGrades)
  }

  const getLetterGrade = (score) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Gradebook</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage student grades and performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Setup
            </Button>
          </div>
        </div>

        {/* Course Selector & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
            </div>
          </div>
        </div>

        {/* Gradebook Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Class Average',
              value: Math.round(
                students.reduce((acc, s) => acc + calculateCourseGrade(s), 0) / students.length
              ),
            },
            {
              label: 'Highest Grade',
              value: Math.max(...students.map((s) => calculateCourseGrade(s))),
            },
            {
              label: 'Lowest Grade',
              value: Math.min(...students.map((s) => calculateCourseGrade(s))),
            },
            {
              label: 'Total Students',
              value: students.length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Gradebook Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">A1</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">A2</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">A3</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">A4</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Quiz Avg</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Midterm</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Final</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Participation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Course Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {students.map((student) => {
                  const courseGrade = calculateCourseGrade(student)
                  const letterGrade = getLetterGrade(courseGrade)

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{student.email}</p>
                        </div>
                      </td>

                      {/* Assignment Grades */}
                      {student.assignments.map((grade, i) => (
                        <td key={`a${i}`} className="px-6 py-4">
                          <span className="font-medium text-slate-900 dark:text-white">{grade}</span>
                        </td>
                      ))}

                      {/* Quiz Average */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {calculateAverage(student.quizzes)}
                        </span>
                      </td>

                      {/* Midterm */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {student.midterm || '-'}
                        </span>
                      </td>

                      {/* Final */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {student.final || '-'}
                        </span>
                      </td>

                      {/* Participation */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {student.participation}
                        </span>
                      </td>

                      {/* Course Grade */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-lg text-slate-900 dark:text-white">
                            {courseGrade}
                          </p>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {letterGrade}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade Distribution Chart */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Grade Distribution
          </h3>
          <div className="flex items-end gap-2 h-64">
            {['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (0-59)'].map((grade, i) => {
              const count = students.filter(
                (s) => {
                  const g = calculateCourseGrade(s)
                  const ranges = [
                    { min: 90, max: 100 },
                    { min: 80, max: 89 },
                    { min: 70, max: 79 },
                    { min: 60, max: 69 },
                    { min: 0, max: 59 },
                  ]
                  return g >= ranges[i].min && g <= ranges[i].max
                }
              ).length
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-secondary rounded-t"
                    style={{ height: `${(count / students.length) * 100}%` }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{count}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{grade}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
