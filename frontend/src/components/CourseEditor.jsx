import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';

export default function CourseEditor({ courseId, lessonId, initialContent, onSave }) {
  const [content, setContent] = useState(initialContent || '');
  const [title, setTitle] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);
  const { apiClient } = useAuth();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaving(true);
      const response = await apiClient.post(`/lessons/${lessonId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments([...attachments, response.data]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.put(`/lessons/${lessonId}`, {
        title,
        content,
      });
      onSave && onSave();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-4">Edit Lesson Content</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Lesson Title"
            className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="p-6 border-b">
          <label className="block text-sm font-semibold mb-2">Rich Content Editor</label>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image', 'video'],
                ['clean'],
              ],
            }}
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className="p-6 border-b">
          <label className="block text-sm font-semibold mb-2">Upload Files</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {attachments.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Attachments:</h3>
              <ul className="space-y-2">
                {attachments.map((att) => (
                  <li key={att.id} className="text-sm text-gray-600">
                    📎 {att.file_name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-lg flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      </div>
    </div>
  );
}
