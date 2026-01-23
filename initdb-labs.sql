-- Lab & Resources Schema Extension

CREATE TABLE IF NOT EXISTS labs (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lab_type VARCHAR(50) DEFAULT 'interactive' CHECK (lab_type IN ('interactive', 'simulation', 'practice', 'hands-on')),
  html_content LONGTEXT, -- Full HTML with embedded CSS and JS
  html_file_url VARCHAR(500), -- Alternative: URL to hosted HTML
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order INTEGER DEFAULT 1,
  duration_minutes INTEGER,
  difficulty VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  objectives JSONB, -- Array of learning objectives
  resources JSONB, -- Array of related resources
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_attempts (
  id SERIAL PRIMARY KEY,
  lab_id INTEGER REFERENCES labs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  time_spent_seconds INTEGER,
  completion_percent INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  notes JSONB, -- User's work/progress data
  UNIQUE(lab_id, user_id)
);

CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) DEFAULT 'document' CHECK (resource_type IN ('document', 'video', 'link', 'file', 'code')),
  url VARCHAR(500),
  file_path VARCHAR(500), -- For uploaded files
  content TEXT, -- For embedded content
  tags JSONB, -- Array of tags for organization
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_submissions (
  id SERIAL PRIMARY KEY,
  lab_id INTEGER REFERENCES labs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  submission_data JSONB, -- Lab completion data/results
  grade INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP,
  graded_by INTEGER REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_labs_course ON labs(course_id);
CREATE INDEX IF NOT EXISTS idx_labs_module ON labs(module_id);
CREATE INDEX IF NOT EXISTS idx_labs_status ON labs(status);
CREATE INDEX IF NOT EXISTS idx_lab_attempts_user ON lab_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_attempts_lab ON lab_attempts(lab_id);
CREATE INDEX IF NOT EXISTS idx_resources_course ON resources(course_id);
CREATE INDEX IF NOT EXISTS idx_lab_submissions_user ON lab_submissions(user_id);

COMMENT ON TABLE labs IS 'Interactive labs and hands-on activities for courses';
COMMENT ON TABLE lab_attempts IS 'Track student progress through labs';
COMMENT ON TABLE resources IS 'Course resources - documents, videos, links';
COMMENT ON TABLE lab_submissions IS 'Graded lab submissions from students';

SELECT 'Lab & Resources schema created successfully!' as message;
