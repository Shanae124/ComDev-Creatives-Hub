import fs from 'fs/promises'
import path from 'path'

export interface DbUser {
  id: number
  email: string
  password: string
  first_name: string
  last_name: string
  role: string
  avatar_url?: string
  bio?: string
  password_version?: number
  password_updated_at?: string
  force_password_reset?: boolean
}

interface DbSecurity {
  tokenVersion: number
}

interface DbCourse {
  id: number
  title: string
  description: string
  instructor_id: number
  is_published: boolean
}

interface DbEnrollment {
  id: number
  course_id: number
  student_id: number
  progress?: number
}

export interface MockDb {
  users: DbUser[]
  courses: DbCourse[]
  enrollments: DbEnrollment[]
  security: DbSecurity
  [key: string]: any
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')
let inMemoryDb: MockDb | null = null

const seedDb = (): MockDb => ({
  users: [],
  courses: [],
  enrollments: [],
  security: {
    tokenVersion: 1,
  },
})

const normalizeDb = (db: MockDb): MockDb => {
  if (!db.security) {
    db.security = { tokenVersion: 1 }
  }

  if (typeof db.security.tokenVersion !== 'number' || db.security.tokenVersion < 1) {
    db.security.tokenVersion = 1
  }

  db.users = (db.users || []).map((user) => ({
    ...user,
    password_version: user.password_version ?? 1,
    password_updated_at: user.password_updated_at ?? new Date().toISOString(),
    force_password_reset: user.force_password_reset ?? false,
  }))

  return db
}

export async function readDb(): Promise<MockDb> {
  if (inMemoryDb) return inMemoryDb

  try {
    const raw = await fs.readFile(DB_PATH, 'utf8')
    const parsed = normalizeDb(JSON.parse(raw) as MockDb)
    inMemoryDb = parsed
    return parsed
  } catch {
    const seed = seedDb()
    inMemoryDb = seed
    return seed
  }
}

export async function writeDb(db: MockDb): Promise<void> {
  inMemoryDb = db
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
  } catch {
  }
}
