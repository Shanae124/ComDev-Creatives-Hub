import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonAPI, progressAPI } from '@/services/api';
import { Editor } from '@tinymce/tinymce-react';
import { Card, Button } from '@/components/UI';
import toast from 'react-hot-toast';

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  const fetchLessonData = async () => {
    try {
      const lessonRes = await lessonAPI.getById(id);
      setLesson(lessonRes.data);

      const progressRes = await progressAPI.getByLessonId(id);
      setProgress(progressRes.data);
    } catch (error) {
      toast.error('Failed to load lesson');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await progressAPI.update({
        lesson_id: id,
        status: 'completed',
        progress_percent: 100,
      });
      setProgress((prev) => ({ ...prev, status: 'completed', progress_percent: 100 }));
      toast.success('Lesson marked as complete!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!lesson) return <div className="p-8">Lesson not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-600">
            Type: {lesson.lesson_type} | Duration: {lesson.duration_minutes} min
          </p>
        </div>
        <Button
          onClick={handleMarkComplete}
          variant={progress?.status === 'completed' ? 'success' : 'primary'}
        >
          {progress?.status === 'completed' ? '✓ Completed' : 'Mark Complete'}
        </Button>
      </div>

      <Card title="Lesson Content">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content_html }}
        />
      </Card>

      <div className="mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Progress: {progress?.progress_percent || 0}% | Status: {progress?.status || 'not_started'}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progress?.progress_percent || 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
