"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code } from "lucide-react";

const DataImportGuide = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Data Import Reference Guide</h1>
        <p className="text-gray-600 mt-2">
          Complete field documentation for importing courses, modules, lessons, and more into ProtexxaLearn.
        </p>
      </div>

      <Alert>
        <Code className="h-4 w-4" />
        <AlertDescription>
          Share this page with colleagues to show them exactly what data structure is needed for importing courses.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
        </TabsList>

        {/* API Endpoints */}
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Endpoints</CardTitle>
              <CardDescription>
                Available endpoints for importing course data into the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* IMSCC Import */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">POST /import-course</h3>
                    <p className="text-sm text-gray-600">Import Brightspace IMSCC files</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">File Upload</span>
                </div>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                  Form Data: file (IMSCC format)
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Required:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>IMSCC file (field name: <code className="bg-gray-100 px-1">imscc</code>)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Response:</p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "message": "Import successful",
  "course": {
    "id": 7,
    "title": "Imported Course",
    "description": "...",
    "created_by": 1,
    "status": "draft"
  }
}`}
                  </pre>
                </div>
              </div>

              {/* HTML Course Import */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">POST /admin/import-html-course</h3>
                    <p className="text-sm text-gray-600">Import HTML-based courses with labs</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">JSON</span>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Required Fields:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code className="bg-gray-100 px-1">course_title</code> (string) - Name of the course</li>
                    <li><code className="bg-gray-100 px-1">modules_html</code> (array) - Array of module objects</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Optional Fields:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><code className="bg-gray-100 px-1">course_description</code> (string)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Example Request:</p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`POST /admin/import-html-course
Content-Type: application/json

{
  "course_title": "Web Development Basics",
  "course_description": "Learn HTML, CSS, and JavaScript",
  "modules_html": [
    {
      "title": "HTML Fundamentals",
      "description": "Introduction to HTML",
      "html_content": "<h2>HTML Tutorial</h2>...",
      "objectives": ["Learn tags", "Write semantic HTML"]
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courses Table</CardTitle>
              <CardDescription>
                Structure and fields for course records in the database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-2 font-semibold">Field</th>
                      <th className="text-left p-2 font-semibold">Type</th>
                      <th className="text-left p-2 font-semibold">Required</th>
                      <th className="text-left p-2 font-semibold">Description</th>
                      <th className="text-left p-2 font-semibold">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">id</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">Auto</td>
                      <td className="p-2 text-xs">Unique identifier</td>
                      <td className="p-2 text-xs">1</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">title</td>
                      <td className="p-2 text-xs">string</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Course name (1-255 chars)</td>
                      <td className="p-2 text-xs">Web Development 101</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">description</td>
                      <td className="p-2 text-xs">text</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Course description/overview</td>
                      <td className="p-2 text-xs">Learn the basics...</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">content_html</td>
                      <td className="p-2 text-xs">text</td>
                      <td className="p-2 text-xs"></td>
                      <td className="p-2 text-xs">Rich HTML course content</td>
                      <td className="p-2 text-xs">&lt;h2&gt;Welcome&lt;/h2&gt;...</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">created_by</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Instructor/creator user ID</td>
                      <td className="p-2 text-xs">2</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">status</td>
                      <td className="p-2 text-xs">enum</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">draft | published | archived</td>
                      <td className="p-2 text-xs">published</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">created_at</td>
                      <td className="p-2 text-xs">timestamp</td>
                      <td className="p-2 text-xs">Auto</td>
                      <td className="p-2 text-xs">Creation timestamp</td>
                      <td className="p-2 text-xs">2024-01-26</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 p-4 rounded space-y-2">
                <p className="font-semibold text-sm">API Example (Create Course):</p>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`POST /courses
Content-Type: application/json

{
  "title": "Introduction to Python",
  "description": "Learn Python programming from scratch",
  "content_html": "<h2>Welcome to Python</h2>...",
  "status": "published"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modules Table</CardTitle>
              <CardDescription>
                Structure for organizing lessons within courses. Each course contains modules,
                each module contains lessons.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-2 font-semibold">Field</th>
                      <th className="text-left p-2 font-semibold">Type</th>
                      <th className="text-left p-2 font-semibold">Required</th>
                      <th className="text-left p-2 font-semibold">Description</th>
                      <th className="text-left p-2 font-semibold">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">id</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">Auto</td>
                      <td className="p-2 text-xs">Unique identifier</td>
                      <td className="p-2 text-xs">1</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">course_id</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Parent course ID (foreign key)</td>
                      <td className="p-2 text-xs">3</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">title</td>
                      <td className="p-2 text-xs">string</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Module title (1-255 chars)</td>
                      <td className="p-2 text-xs">Unit 1: Variables</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">description</td>
                      <td className="p-2 text-xs">text</td>
                      <td className="p-2 text-xs"></td>
                      <td className="p-2 text-xs">Module overview</td>
                      <td className="p-2 text-xs">Learn about variables and types...</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">sort_order</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Display order (1, 2, 3...)</td>
                      <td className="p-2 text-xs">1</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">created_at</td>
                      <td className="p-2 text-xs">timestamp</td>
                      <td className="p-2 text-xs">Auto</td>
                      <td className="p-2 text-xs">Creation timestamp</td>
                      <td className="p-2 text-xs">2024-01-26</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 p-4 rounded space-y-2">
                <p className="font-semibold text-sm">API Example (Create Module):</p>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`POST /modules
Content-Type: application/json

{
  "course_id": 3,
  "title": "Module 1: Getting Started",
  "description": "Introduction and setup",
  "sort_order": 1
}`}
                </pre>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> Modules are the organizational unit between courses and lessons.
                  All lessons must be attached to a module. Modules are displayed in sort_order.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons */}
        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lessons Table</CardTitle>
              <CardDescription>
                Structure for lesson content within modules. Lessons contain the actual learning material.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-2 font-semibold">Field</th>
                      <th className="text-left p-2 font-semibold">Type</th>
                      <th className="text-left p-2 font-semibold">Required</th>
                      <th className="text-left p-2 font-semibold">Description</th>
                      <th className="text-left p-2 font-semibold">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">id</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">Auto</td>
                      <td className="p-2 text-xs">Unique identifier</td>
                      <td className="p-2 text-xs">1</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">module_id</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Parent module ID (foreign key)</td>
                      <td className="p-2 text-xs">5</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">title</td>
                      <td className="p-2 text-xs">string</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Lesson title (1-255 chars)</td>
                      <td className="p-2 text-xs">Lesson 1.1: Variable Basics</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">content_html</td>
                      <td className="p-2 text-xs">text</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Lesson HTML content</td>
                      <td className="p-2 text-xs">&lt;h2&gt;Variables&lt;/h2&gt;...</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">lesson_type</td>
                      <td className="p-2 text-xs">enum</td>
                      <td className="p-2 text-xs"></td>
                      <td className="p-2 text-xs">reading | video | quiz | lab | interactive</td>
                      <td className="p-2 text-xs">reading</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">duration_minutes</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs"></td>
                      <td className="p-2 text-xs">Estimated completion time</td>
                      <td className="p-2 text-xs">15</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">sort_order</td>
                      <td className="p-2 text-xs">integer</td>
                      <td className="p-2 text-xs">✓</td>
                      <td className="p-2 text-xs">Display order within module</td>
                      <td className="p-2 text-xs">1</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-2 font-mono text-xs bg-gray-50">created_at</td>
                      <td className="p-2 text-xs">timestamp</td>
                      <td className="p-2 text-xs">Auto</td>
                      <td className="p-2 text-xs">Creation timestamp</td>
                      <td className="p-2 text-xs">2024-01-26</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 p-4 rounded space-y-2">
                <p className="font-semibold text-sm">API Example (Create Lesson):</p>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`POST /lessons
Content-Type: application/json

{
  "module_id": 5,
  "title": "Understanding Variables",
  "content_html": "<h2>Variables Explained</h2><p>A variable is...</p>",
  "lesson_type": "reading",
  "duration_minutes": 20,
  "sort_order": 1
}`}
                </pre>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded">
                <p className="font-semibold text-sm">Lesson Type Options:</p>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-white px-2 py-1 rounded">reading</code> - Text-based content (default)</li>
                  <li><code className="bg-white px-2 py-1 rounded">video</code> - Video lesson</li>
                  <li><code className="bg-white px-2 py-1 rounded">quiz</code> - Assessment/quiz</li>
                  <li><code className="bg-white px-2 py-1 rounded">lab</code> - Hands-on lab/practical</li>
                  <li><code className="bg-white px-2 py-1 rounded">interactive</code> - Interactive content</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Workflow Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start: Data Import Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-sm">1</div>
              <div>
                <p className="font-semibold">Create a Course</p>
                <p className="text-sm text-gray-600">POST /courses with title, description, and status</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-sm">2</div>
              <div>
                <p className="font-semibold">Add Modules to Course</p>
                <p className="text-sm text-gray-600">POST /modules with course_id, title, and sort_order</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-sm">3</div>
              <div>
                <p className="font-semibold">Add Lessons to Modules</p>
                <p className="text-sm text-gray-600">POST /lessons with module_id, title, content_html, and sort_order</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-sm">4</div>
              <div>
                <p className="font-semibold">Publish Course</p>
                <p className="text-sm text-gray-600">PATCH /courses/:id with status: 'published'</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notes for Colleagues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-base mb-2">🔐 Authentication Required</p>
            <p className="text-gray-700">All API endpoints require JWT authentication. Use your instructor or admin account to get a token first via POST /auth/login</p>
          </div>
          <div>
            <p className="font-semibold text-base mb-2">📊 Cascading Relationships</p>
            <p className="text-gray-700">Courses → Modules → Lessons. Each level must exist before creating the next level.</p>
          </div>
          <div>
            <p className="font-semibold text-base mb-2">🔄 IMSCC Import</p>
            <p className="text-gray-700">For Brightspace exports, use POST /import-course with IMSCC file - this automatically creates courses, modules, and lessons from the archive.</p>
          </div>
          <div>
            <p className="font-semibold text-base mb-2">🚀 Production URL</p>
            <p className="text-gray-700 font-mono">https://protexxalearn-production.up.railway.app</p>
          </div>
          <div>
            <p className="font-semibold text-base mb-2">👤 Test Accounts</p>
            <p className="text-gray-700">
              Instructor: <code className="bg-gray-100 px-2 py-1">instructor@test.com</code> / <code className="bg-gray-100 px-2 py-1">Password123</code><br />
              Admin: <code className="bg-gray-100 px-2 py-1">admin@test.com</code> / <code className="bg-gray-100 px-2 py-1">Password123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportGuide;
