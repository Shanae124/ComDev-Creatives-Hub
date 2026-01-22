import axios from 'axios';

// Use Next.js API proxy (configured in next.config.mjs)
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (name: string, email: string, password: string, role: string = 'student') =>
    apiClient.post('/auth/register', { name, email, password, role }),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
};

// Instructor APIs
export const instructorAPI = {
  getFeatured: () => apiClient.get('/instructors', { headers: { Authorization: '' } }).catch(
    () => apiClient.get('/instructors')
  ),
};

// Course APIs
export const courseAPI = {
  getAll: () => apiClient.get('/courses'),
  // Admin view currently uses the same courses endpoint; adjust if a dedicated admin route is added.
  getAllAdmin: () => apiClient.get('/courses'),
  getById: (id: number | string) => apiClient.get(`/courses/${id}`),
  create: (data: any) => apiClient.post('/courses', data),
  update: (id: number | string, data: any) => apiClient.put(`/courses/${id}`, data),
  delete: (id: number | string) => apiClient.delete(`/courses/${id}`),
};

// Module APIs
export const moduleAPI = {
  getByCourseId: (courseId: number | string) =>
    apiClient.get(`/courses/${courseId}/modules`),
  create: (data: any) => apiClient.post('/modules', data),
  update: (id: number | string, data: any) => apiClient.put(`/modules/${id}`, data),
};

// Lesson APIs
export const lessonAPI = {
  getByModuleId: (moduleId: number | string) =>
    apiClient.get(`/modules/${moduleId}/lessons`),
  getById: (id: number | string) => apiClient.get(`/lessons/${id}`),
  create: (data: any) => apiClient.post('/lessons', data),
  update: (id: number | string, data: any) => apiClient.put(`/lessons/${id}`, data),
};

// Enrollment APIs
export const enrollmentAPI = {
  getAll: () => apiClient.get('/enrollments'),
  getByCourseId: (courseId: number | string) =>
    apiClient.get(`/courses/${courseId}/enrollments`),
  enroll: (userId: number | string, courseId: number | string) =>
    apiClient.post('/enroll', { user_id: userId, course_id: courseId }),
};

// Progress APIs
export const progressAPI = {
  getByLessonId: (lessonId: number | string) =>
    apiClient.get(`/lesson-progress/${lessonId}`),
  getByCourseId: (courseId: number | string) =>
    apiClient.get(`/courses/${courseId}/progress`),
  update: (data: any) => apiClient.post('/lesson-progress', data),
};

// Assignment APIs
export const assignmentAPI = {
  getByCourseId: (courseId: number | string) =>
    apiClient.get(`/courses/${courseId}/assignments`),
  getById: (id: number | string) => apiClient.get(`/assignments/${id}`),
  create: (data: any) => apiClient.post('/assignments', data),
};

// Submission APIs
export const submissionAPI = {
  create: (data: any) => apiClient.post('/submissions', data),
  getByAssignmentId: (assignmentId: number | string) =>
    apiClient.get(`/assignments/${assignmentId}/submissions`),
};

// Grade APIs
export const gradeAPI = {
  create: (data: any) => apiClient.post('/grades', data),
  getByCourseId: (courseId: number | string) =>
    apiClient.get(`/courses/${courseId}/grades`),
};

// Announcement APIs
export const announcementAPI = {
  getByCourseId: (courseId: number | string) =>
    apiClient.get(`/courses/${courseId}/announcements`),
  create: (data: any) => apiClient.post('/announcements', data),
};

export default apiClient;
