import { useState, useEffect } from 'react';
import { courseAPI, enrollmentAPI } from '@/services/api';
import { Card, Button, Modal, FormInput } from '@/components/UI';
import { Editor } from '@tinymce/tinymce-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/store';
import toast from 'react-hot-toast';

export default function DashboardPage({ page }) {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', content_html: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseAPI.getAll();
      setCourses(res.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await courseAPI.create(formData);
      toast.success('Course created successfully!');
      setShowModal(false);
      setFormData({ title: '', description: '', content_html: '' });
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create course');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentAPI.enroll(user.id, courseId);
      toast.success('Enrolled successfully!');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll');
    }
  };

  if (page === 'create-course') {
    return (
      <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
        <Card>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <FormInput
              label="Course Title"
              placeholder="Enter course title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <FormInput
              label="Course Description"
              placeholder="Enter course description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Content</label>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_KEY || ''}
                value={formData.content_html}
                onEditorChange={(content) => setFormData({ ...formData, content_html: content })}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: ['link', 'image', 'code'],
                  toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | link image'
                }}
              />
            </div>
            <Button variant="primary" className="w-full">Create Course</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {page === 'courses' ? 'My Courses' : 'Dashboard'}
        </h1>
        {user?.role === 'instructor' && (
          <Button onClick={() => setShowModal(true)} variant="success">
            ➕ New Course
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto"></div>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No courses available. {user?.role === 'instructor' && 'Create one to get started!'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} title={course.title}>
              <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <p className="text-sm text-gray-500 mb-4">By {course.instructor_name || 'Unknown'}</p>
              <div className="flex gap-2">
                <Link
                  to={`/course/${course.id}`}
                  className="flex-1 text-center bg-primary text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  View
                </Link>
                {user?.role === 'student' && (
                  <Button
                    onClick={() => handleEnroll(course.id)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Enroll
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        title="Create New Course"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <FormInput
            label="Title"
            placeholder="Course title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <FormInput
            label="Description"
            placeholder="Course description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Button variant="primary" className="w-full">Create</Button>
        </form>
      </Modal>
    </div>
  );
}
