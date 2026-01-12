import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { courseAPI, moduleAPI, lessonAPI } from '@/services/api';
import { Card, Button } from '@/components/UI';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const courseRes = await courseAPI.getById(id);
      setCourse(courseRes.data);

      const modulesRes = await moduleAPI.getByCourseId(id);
      setModules(modulesRes.data);
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsForModule = async (moduleId) => {
    try {
      const lessonsRes = await lessonAPI.getByModuleId(moduleId);
      setLessons((prev) => ({ ...prev, [moduleId]: lessonsRes.data }));
    } catch (error) {
      toast.error('Failed to load lessons');
    }
  };

  const handleModuleClick = (moduleId) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
      if (!lessons[moduleId]) {
        fetchLessonsForModule(moduleId);
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!course) return <div className="p-8">Course not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex gap-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {course.status}
          </span>
          <span className="text-gray-600">By {course.instructor_name || 'Unknown'}</span>
        </div>
      </div>

      {course.content_html && (
        <Card title="Course Overview" className="mb-8">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: course.content_html }}
          />
        </Card>
      )}

      <Card title="Course Modules">
        <div className="space-y-2">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg">
              <button
                onClick={() => handleModuleClick(module.id)}
                className="w-full text-left p-4 hover:bg-gray-100 transition flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{module.title}</h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
                <span className="text-xl">
                  {expandedModule === module.id ? '▼' : '▶'}
                </span>
              </button>

              {expandedModule === module.id && lessons[module.id] && (
                <div className="bg-gray-50 p-4 border-t">
                  {lessons[module.id].map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className="block p-3 mb-2 bg-white rounded hover:bg-blue-50 border-l-4 border-blue-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{lesson.title}</h4>
                          <p className="text-sm text-gray-500">{lesson.lesson_type}</p>
                        </div>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {lesson.duration_minutes} min
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
