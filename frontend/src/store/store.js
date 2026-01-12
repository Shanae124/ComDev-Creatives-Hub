import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  restoreSession: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: true });
    }
  }
}));

export const useCourseStore = create((set) => ({
  courses: [],
  currentCourse: null,
  modules: [],
  lessons: [],

  setCourses: (courses) => set({ courses }),
  setCurrentCourse: (course) => set({ currentCourse: course }),
  setModules: (modules) => set({ modules }),
  setLessons: (lessons) => set({ lessons }),

  addCourse: (course) => set((state) => ({
    courses: [...state.courses, course]
  })),

  updateCourse: (id, updates) => set((state) => ({
    courses: state.courses.map(c => c.id === id ? { ...c, ...updates } : c)
  }))
}));

export const useProgressStore = create((set) => ({
  progress: {},

  setProgress: (lessonId, data) => set((state) => ({
    progress: { ...state.progress, [lessonId]: data }
  })),

  updateProgress: (lessonId, updates) => set((state) => ({
    progress: {
      ...state.progress,
      [lessonId]: { ...state.progress[lessonId], ...updates }
    }
  }))
}));
