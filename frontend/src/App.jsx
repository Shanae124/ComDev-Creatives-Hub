import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/store';
import { Navbar, Sidebar } from '@/components/UI';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import CoursePage from '@/pages/CoursePage';
import LessonPage from '@/pages/LessonPage';
import '@/styles/index.css';

function App() {
  const { isAuthenticated, user, restoreSession } = useAuthStore();
  const [activePage, setActivePage] = useState('courses');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    toast.success('Logged out successfully');
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {isAuthenticated ? (
          <>
            <Route
              path="/*"
              element={
                <div className="flex h-screen bg-gray-100">
                  {showSidebar && (
                    <Sidebar
                      role={user?.role}
                      active={activePage}
                      onNavClick={setActivePage}
                    />
                  )}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar user={user} onLogout={handleLogout} />
                    <main className="flex-1 overflow-auto">
                      <Routes>
                        <Route path="/" element={<DashboardPage page={activePage} />} />
                        <Route path="/course/:id" element={<CoursePage />} />
                        <Route path="/lesson/:id" element={<LessonPage />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              }
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
