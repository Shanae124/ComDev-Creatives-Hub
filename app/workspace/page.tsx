'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type TaskStatus = 'todo' | 'in-progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'

interface WorkspaceTask {
  id: string
  title: string
  dueDate: string
  platform: string
  status: TaskStatus
  priority: TaskPriority
}

const eventSuggestions = [
  { name: 'International Women’s Day', date: '2026-03-08', category: 'Global' },
  { name: 'St. Patrick’s Day', date: '2026-03-17', category: 'Seasonal' },
  { name: 'Earth Day', date: '2026-04-22', category: 'Cause' },
  { name: 'Mother’s Day (US)', date: '2026-05-10', category: 'Retail' },
  { name: 'Father’s Day (US)', date: '2026-06-21', category: 'Retail' },
  { name: 'Back to School', date: '2026-08-15', category: 'Seasonal' },
  { name: 'Black Friday', date: '2026-11-27', category: 'Retail' },
  { name: 'Cyber Monday', date: '2026-11-30', category: 'Retail' },
  { name: 'Christmas', date: '2026-12-25', category: 'Seasonal' },
]

const getDaysUntil = (dateString: string) => {
  const now = new Date()
  const target = new Date(dateString)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function WorkspacePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<WorkspaceTask[]>([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [platform, setPlatform] = useState('Instagram')

  const storageKey = useMemo(() => {
    const fallback = 'creator-workspace-anon'
    if (!user) return fallback
    return `creator-workspace-${user.id || user.email || fallback}`
  }, [user])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const parsed = JSON.parse(userData)
    setUser(parsed)

    const saved = localStorage.getItem(`creator-workspace-${parsed.id || parsed.email || 'anon'}`)
    if (saved) {
      try {
        const parsedSaved = JSON.parse(saved) as { tasks: WorkspaceTask[] }
        setTasks(parsedSaved.tasks || [])
      } catch {
        setTasks([])
      }
    }
  }, [router])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(storageKey, JSON.stringify({ tasks }))
  }, [tasks, storageKey, user])

  const addTask = () => {
    if (!title.trim() || !dueDate) return

    const nextTask: WorkspaceTask = {
      id: `${Date.now()}`,
      title: title.trim(),
      dueDate,
      platform,
      status: 'todo',
      priority: 'medium',
    }

    setTasks((prev) => [nextTask, ...prev])
    setTitle('')
    setDueDate('')
    setPlatform('Instagram')
  }

  const updateStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)))
  }

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const completion = tasks.length ? Math.round((tasks.filter((task) => task.status === 'done').length / tasks.length) * 100) : 0
  const dueSoon = tasks.filter((task) => task.status !== 'done' && getDaysUntil(task.dueDate) <= 2)
  const overdue = tasks.filter((task) => task.status !== 'done' && getDaysUntil(task.dueDate) < 0)

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Creator Workspace</h1>
            <p className="text-sm text-gray-600">Private planning, reminders, and production tools.</p>
          </div>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid md:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="text-sm text-gray-600">Progress</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{completion}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-gray-600">Due Soon (48h)</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{dueSoon.length}</div>
          </div>
          <div className="card p-5">
            <div className="text-sm text-gray-600">Overdue</div>
            <div className="text-3xl font-bold text-red-600 mt-1">{overdue.length}</div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Content Calendar Tasks</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Task title"
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option>Instagram</option>
              <option>TikTok</option>
              <option>YouTube</option>
              <option>Facebook</option>
              <option>LinkedIn</option>
              <option>Pinterest</option>
            </select>
            <button onClick={addTask} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
              Add Task
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {tasks.length === 0 && <p className="text-sm text-gray-600">No tasks yet. Add your first content task above.</p>}
            {tasks.map((task) => {
              const days = getDaysUntil(task.dueDate)
              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {task.platform} • Due {task.dueDate}
                      {days < 0 ? ' • Overdue' : days === 0 ? ' • Due today' : ` • ${days} day(s) left`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={(event) => updateStatus(task.id, event.target.value as TaskStatus)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button onClick={() => removeTask(task.id)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Suggested Events & Holidays</h2>
            <p className="text-sm text-gray-600 mb-4">Use these as content prompts. Add any relevant one as a personal task.</p>
            <div className="space-y-2">
              {eventSuggestions.map((event) => {
                const days = getDaysUntil(event.date)
                return (
                  <div key={event.name} className="border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{event.name}</div>
                      <div className="text-xs text-gray-600">{event.date} • {event.category}</div>
                    </div>
                    <button
                      onClick={() => {
                        setTitle(`${event.name} campaign`)
                        setDueDate(event.date)
                      }}
                      className="text-xs px-2.5 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Use
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Reminder Check</h2>
            <p className="text-sm text-gray-600 mb-4">Your live reminders are generated from due dates and update each time you sign in.</p>
            <div className="space-y-2">
              {overdue.length === 0 && dueSoon.length === 0 && (
                <div className="text-sm text-gray-700">No urgent reminders right now.</div>
              )}
              {overdue.map((task) => (
                <div key={`overdue-${task.id}`} className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-3 py-2 text-sm">
                  Overdue: {task.title} ({task.platform})
                </div>
              ))}
              {dueSoon.map((task) => (
                <div key={`soon-${task.id}`} className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-sm">
                  Due soon: {task.title} ({task.platform})
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Embedded Creation Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <a href="https://www.photopea.com/" target="_blank" rel="noreferrer" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-primary-700">Open Photo Editor (Photopea)</a>
            <a href="https://www.capcut.com/editor" target="_blank" rel="noreferrer" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-center hover:bg-gray-50">Open Video Editor (CapCut)</a>
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-800">Photo Editor (Embedded)</div>
              <div className="aspect-video">
                <iframe title="Photopea" src="https://www.photopea.com/" className="w-full h-full" allow="clipboard-read; clipboard-write" allowFullScreen />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-800">Video Editor (Embedded)</div>
              <div className="aspect-video">
                <iframe title="Canva Video" src="https://www.canva.com/video-editor/" className="w-full h-full" allowFullScreen />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">If a provider blocks embed in your browser, use the Open buttons above to continue in a new tab.</p>
        </section>
      </main>
    </div>
  )
}
