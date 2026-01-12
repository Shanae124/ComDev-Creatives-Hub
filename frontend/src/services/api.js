import axios from 'axios';
import { useAuthStore } from '../store/store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (name, email, password, role) =>
    apiClient.post('/auth/register', { name, email, password, role }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
};

// Course APIs
export const courseAPI = {
  getAll: () => apiClient.get('/courses'),
  getById: (id) => apiClient.get(`/courses/${id}`),
  create: (data) => apiClient.post('/courses', data),
  update: (id, data) => apiClient.put(`/courses/${id}`, data),
};

// Module APIs
export const moduleAPI = {
  getByCourseId: (courseId) => apiClient.get(`/courses/${courseId}/modules`),
  create: (data) => apiClient.post('/modules', data),
  update: (id, data) => apiClient.put(`/modules/${id}`, data),
};

// Lesson APIs
export const lessonAPI = {
  getByModuleId: (moduleId) => apiClient.get(`/modules/${moduleId}/lessons`),
  getById: (id) => apiClient.get(`/lessons/${id}`),
  create: (data) => apiClient.post('/lessons', data),
  update: (id, data) => apiClient.put(`/lessons/${id}`, data),
};

// Enrollment APIs
export const enrollmentAPI = {
  getAll: () => apiClient.get('/enrollments'),
  getByCourseId: (courseId) => apiClient.get(`/courses/${courseId}/enrollments`),
  enroll: (userId, courseId) => apiClient.post('/enroll', { user_id: userId, course_id: courseId }),
};

// Progress APIs
export const progressAPI = {
  getByLessonId: (lessonId) => apiClient.get(`/lesson-progress/${lessonId}`),
  getByCourseId: (courseId) => apiClient.get(`/courses/${courseId}/progress`),
  update: (data) => apiClient.post('/lesson-progress', data),
};

// Assignment APIs
export const assignmentAPI = {
  getByCourseId: (courseId) => apiClient.get(`/courses/${courseId}/assignments`),
  getById: (id) => apiClient.get(`/assignments/${id}`),
  create: (data) => apiClient.post('/assignments', data),
};

// Submission APIs
export const submissionAPI = {
  create: (data) => apiClient.post('/submissions', data),
  getByAssignmentId: (assignmentId) => apiClient.get(`/assignments/${assignmentId}/submissions`),
};

// Grade APIs
export const gradeAPI = {
  create: (data) => apiClient.post('/grades', data),
  getByCourseId: (courseId) => apiClient.get(`/courses/${courseId}/grades`),
};

export default apiClient;
