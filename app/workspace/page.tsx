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

interface GeneratedPost {
  title: string
  platform: string
  dueDate: string
  angle: string
}

const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn', 'Pinterest']

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

const toDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getMonthGrid = (viewDate: Date) => {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

export default function WorkspacePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<WorkspaceTask[]>([])
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<string[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [campaignTheme, setCampaignTheme] = useState('')
  const [campaignPlan, setCampaignPlan] = useState<GeneratedPost[]>([])

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
        const parsedSaved = JSON.parse(saved) as {
          tasks?: WorkspaceTask[]
          notifiedTaskIds?: string[]
          selectedMonth?: string
        }
        setTasks(parsedSaved.tasks || [])
        setNotifiedTaskIds(parsedSaved.notifiedTaskIds || [])
        if (parsedSaved.selectedMonth) {
          setSelectedMonth(new Date(parsedSaved.selectedMonth))
        }
      } catch {
        setTasks([])
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true)
    }
  }, [router])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        tasks,
        notifiedTaskIds,
        selectedMonth: selectedMonth.toISOString(),
      })
    )
  }, [tasks, notifiedTaskIds, selectedMonth, storageKey, user])

  useEffect(() => {
    if (!notificationsEnabled || typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const pendingReminderIds: string[] = []

    tasks.forEach((task) => {
      if (task.status === 'done') return
      if (notifiedTaskIds.includes(task.id)) return

      const days = getDaysUntil(task.dueDate)
      if (days <= 1) {
        new Notification(days < 0 ? 'Overdue content task' : 'Upcoming content task', {
          body: `${task.title} • ${task.platform} • Due ${task.dueDate}`,
        })
        pendingReminderIds.push(task.id)
      }
    })

    if (pendingReminderIds.length > 0) {
      setNotifiedTaskIds((prev) => [...prev, ...pendingReminderIds])
    }
  }, [tasks, notificationsEnabled, notifiedTaskIds])

  const requestNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationsEnabled(permission === 'granted')
  }

  const createTask = (taskTitle: string, taskDueDate: string, taskPlatform: string, priority: TaskPriority = 'medium') => {
    const nextTask: WorkspaceTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: taskTitle,
      dueDate: taskDueDate,
      platform: taskPlatform,
      status: 'todo',
      priority,
    }
    setTasks((prev) => [nextTask, ...prev])
  }

  const addTask = () => {
    if (!title.trim() || !dueDate) return

    createTask(title.trim(), dueDate, platform, 'medium')
    setTitle('')
    setDueDate('')
    setPlatform('Instagram')
  }

  const updateStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)))
  }

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
    setNotifiedTaskIds((prev) => prev.filter((taskId) => taskId !== id))
  }

  const generateCampaignPlan = () => {
    if (!campaignTheme.trim()) return

    const today = new Date()
    const hooks = ['Behind the scenes', 'Transformation', '3 mistakes to avoid', 'Quick tutorial', 'Case study', 'Myth vs fact', 'Launch teaser']

    const generated = hooks.map((hook, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() + index)
      return {
        title: `${campaignTheme.trim()}: ${hook}`,
        platform: platforms[index % platforms.length],
        dueDate: toDateInput(date),
        angle: `Use a ${hook.toLowerCase()} angle with a strong CTA to comment or save.`,
      }
    })

    setCampaignPlan(generated)
  }

  const completion = tasks.length ? Math.round((tasks.filter((task) => task.status === 'done').length / tasks.length) * 100) : 0
  const dueSoon = tasks.filter((task) => task.status !== 'done' && getDaysUntil(task.dueDate) <= 2)
  const overdue = tasks.filter((task) => task.status !== 'done' && getDaysUntil(task.dueDate) < 0)
  const monthGrid = getMonthGrid(selectedMonth)

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Calendar Command Center</h2>
              <p className="text-sm text-gray-600">Visual month planner with task density and one-click date picking.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Prev
              </button>
              <div className="px-3 py-1.5 text-sm font-semibold text-gray-900">
                {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-xs font-semibold text-gray-600 mb-2">
            <div className="px-2 py-1">Sun</div><div className="px-2 py-1">Mon</div><div className="px-2 py-1">Tue</div><div className="px-2 py-1">Wed</div><div className="px-2 py-1">Thu</div><div className="px-2 py-1">Fri</div><div className="px-2 py-1">Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((date) => {
              const dateKey = toDateInput(date)
              const count = tasks.filter((task) => task.dueDate === dateKey).length
              const inMonth = date.getMonth() === selectedMonth.getMonth()
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setDueDate(dateKey)}
                  className={`min-h-20 border rounded-lg p-2 text-left hover:bg-gray-50 transition ${inMonth ? 'border-gray-200' : 'border-gray-100 bg-gray-50/50'}`}
                >
                  <div className={`text-xs font-semibold ${inMonth ? 'text-gray-700' : 'text-gray-400'}`}>{date.getDate()}</div>
                  {count > 0 && (
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-primary-100 text-primary-700">
                      {count} task{count > 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              )
            })}
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
              {platforms.map((item) => (
                <option key={item}>{item}</option>
              ))}
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

        <section className="card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Campaign Idea Engine</h2>
              <p className="text-sm text-gray-600">Generate a 7-post campaign sequence and convert ideas into tasks instantly.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                value={campaignTheme}
                onChange={(event) => setCampaignTheme(event.target.value)}
                placeholder="e.g. Spring product launch"
                className="px-3 py-2 border border-gray-300 rounded-lg w-full md:w-72"
              />
              <button
                onClick={generateCampaignPlan}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Generate
              </button>
            </div>
          </div>

          {campaignPlan.length > 0 && (
            <div className="space-y-3">
              {campaignPlan.map((idea, index) => (
                <div key={`${idea.title}-${index}`} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">{idea.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{idea.platform} • {idea.dueDate}</div>
                    <div className="text-sm text-gray-700 mt-1">{idea.angle}</div>
                  </div>
                  <button
                    onClick={() => createTask(idea.title, idea.dueDate, idea.platform, 'high')}
                    className="px-3 py-1.5 text-sm border border-primary-600 text-primary-700 rounded-lg hover:bg-primary-50"
                  >
                    Add as Task
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  campaignPlan.forEach((idea) => createTask(idea.title, idea.dueDate, idea.platform, 'high'))
                  setCampaignPlan([])
                }}
                className="px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-lg hover:bg-black transition"
              >
                Add Entire Campaign to Tasks
              </button>
            </div>
          )}
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Your live reminders are generated from due dates and update each time you sign in.</p>
              <button
                onClick={requestNotifications}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {notificationsEnabled ? 'Browser Alerts On' : 'Enable Browser Alerts'}
              </button>
            </div>
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
