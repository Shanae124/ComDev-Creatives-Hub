'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  FileText,
  Plus,
  Edit2,
  Eye,
  Trash2,
  Save,
  Code,
  Palette,
  Wand2,
  Lock,
  Unlock,
  Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PageBuilder() {
  const [pages, setPages] = useState([
    { id: 1, title: 'Course Welcome', created: '2024-01-15', status: 'published' },
    { id: 2, title: 'Learning Resources', created: '2024-01-18', status: 'draft' },
  ])
  
  const iframeRef = useRef(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState(null)
  const [editingText, setEditingText] = useState('')

  const [selectedPage, setSelectedPage] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [activeTab, setActiveTab] = useState('wysiwyg')
  const [htmlCode, setHtmlCode] = useState(`<div class="course-content">
  <h1>Welcome to Our Course</h1>
  <p>This is a sample page with HTML and CSS.</p>
  <style>
    .course-content {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: #0f3d6d;
      border-bottom: 3px solid #00bcd4;
      padding-bottom: 10px;
    }
  </style>
</div>`)

  const [cssCode, setCssCode] = useState(`/* Custom Styles */
.page-header {
  background: linear-gradient(135deg, #0f3d6d, #00bcd4);
  color: white;
  padding: 30px;
  border-radius: 8px;
}

.page-content {
  max-width: 900px;
  margin: 20px auto;
  line-height: 1.6;
}

.btn-primary {
  background-color: #0f3d6d;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #00bcd4;
}`)

  const [jsCode, setJsCode] = useState(`// JavaScript Interactivity
document.addEventListener('DOMContentLoaded', function() {
  // Auto-save functionality
  const saveButton = document.querySelector('.save-btn');
  if (saveButton) {
    saveButton.addEventListener('click', function() {
      console.log('Page saved!');
      alert('Page has been saved successfully!');
    });
  }
  
  // Toggle visibility of sections
  const toggles = document.querySelectorAll('.toggle-section');
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const content = this.nextElementSibling;
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
  });
});`)
  // Enable direct editing in iframe when edit mode is on
  useEffect(() => {
    if (iframeRef.current && editMode) {
      setTimeout(() => {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
        if (iframeDoc) {
          // Make all editable elements clickable
          iframeDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, li, a').forEach(elem => {
            elem.style.cursor = 'pointer'
            elem.style.outline = 'none'
            elem.addEventListener('click', (e) => {
              e.stopPropagation()
              handleElementSelect(e.target, elem)
            })
            elem.addEventListener('mouseenter', () => {
              elem.style.outline = '2px dashed #00bcd4'
              elem.style.outlineOffset = '2px'
            })
            elem.addEventListener('mouseleave', () => {
              if (selectedElement !== elem) {
                elem.style.outline = 'none'
              }
            })
          })
        }
      }, 100)
    }
  }, [editMode, htmlCode])

  const handleElementSelect = (element, realElement) => {
    setSelectedElement(realElement)
    setEditingText(realElement.innerText)
  }

  const updateElementText = () => {
    if (selectedElement) {
      selectedElement.innerText = editingText
      // Update HTML code to reflect changes
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
      const newHtml = iframeDoc.body.innerHTML
      setHtmlCode(newHtml)
    }
  }

  const insertElement = (tagName) => {
    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document
    if (selectedElement) {
      const newElem = iframeDoc.createElement(tagName)
      newElem.textContent = `New ${tagName.toUpperCase()}`
      selectedElement.appendChild(newElem)
      const newHtml = iframeDoc.body.innerHTML
      setHtmlCode(newHtml)
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Page Builder</h1>
            <p className="text-slate-600 dark:text-slate-400">Create and manage custom course pages</p>
          </div>
          <Button onClick={() => setShowEditor(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Page
          </Button>
        </div>

        {!showEditor ? (
          // Pages List View
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Page Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {pages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="font-medium text-slate-900 dark:text-white">{page.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{page.created}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPage(page)
                              setShowEditor(true)
                            }}
                            className="gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Editor View
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedPage ? 'Edit Page' : 'Create New Page'}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditor(false)
                  setSelectedPage(null)
                }}
              >
                Back to Pages
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <TabsList className="w-full justify-start border-b border-slate-200 dark:border-slate-700 rounded-none p-0 bg-transparent">
                <TabsTrigger value="wysiwyg" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                  <Wand2 className="w-4 h-4" />
                  WYSIWYG Editor
                </TabsTrigger>
                <TabsTrigger value="html" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                  <Code className="w-4 h-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="css" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                  <Palette className="w-4 h-4" />
                  CSS
                </TabsTrigger>
                <TabsTrigger value="javascript" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                  <Code className="w-4 h-4" />
                  JavaScript
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* WYSIWYG Editor Tab */}
              <TabsContent value="wysiwyg" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live WYSIWYG Editor</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditMode(!editMode)}
                        variant={editMode ? 'default' : 'outline'}
                        className="gap-2"
                      >
                        {editMode ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Disable Edit Mode
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            Enable Edit Mode
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {editMode && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        📝 Click any text element in the preview to edit it directly. Your changes will be saved instantly.
                      </p>
                      {selectedElement && (
                        <div className="space-y-3">
                          <label className="block font-medium text-slate-900 dark:text-white">
                            Editing: <span className="text-blue-600 dark:text-blue-400">{selectedElement.tagName}</span>
                          </label>
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full h-24 p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Edit text content..."
                          />
                          <div className="flex gap-2">
                            <Button onClick={updateElementText} size="sm" className="gap-2">
                              <Save className="w-4 h-4" />
                              Update Text
                            </Button>
                            <Button onClick={() => insertElement('p')} size="sm" variant="outline">
                              + Paragraph
                            </Button>
                            <Button onClick={() => insertElement('h3')} size="sm" variant="outline">
                              + Heading
                            </Button>
                            <Button onClick={() => insertElement('div')} size="sm" variant="outline">
                              + Section
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 overflow-hidden" style={{ opacity: editMode ? 1 : 0.7 }}>
                    <iframe
                      ref={iframeRef}
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <style>
                            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; }
                            * { transition: outline 0.2s ease; }
                            ${cssCode}
                          </style>
                        </head>
                        <body>
                          ${htmlCode}
                          <script>${jsCode}</script>
                        </body>
                        </html>
                      `}
                      className="w-full h-96 border-none"
                      title="WYSIWYG Editor"
                    />
                  </div>

                  {editMode && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      💡 Tip: Click elements to edit them. Use the buttons below to add new elements to your page.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* HTML Editor */}
              <TabsContent value="html" className="p-6">
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">HTML Code</label>
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your HTML code here..."
                />
              </TabsContent>

              {/* CSS Editor */}
              <TabsContent value="css" className="p-6">
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">CSS Styles</label>
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your CSS styles here..."
                />
              </TabsContent>

              {/* JavaScript Editor */}
              <TabsContent value="javascript" className="p-6">
                <label className="block mb-2 font-semibold text-slate-900 dark:text-white">JavaScript Code</label>
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full h-96 p-4 font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your JavaScript code here..."
                />
              </TabsContent>

              {/* Live Preview */}
              <TabsContent value="preview" className="p-6">
                <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 overflow-hidden">
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <style>
                          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                          ${cssCode}
                        </style>
                      </head>
                      <body>
                        ${htmlCode}
                        <script>${jsCode}</script>
                      </body>
                      </html>
                    `}
                    className="w-full h-96 border-none"
                    title="Page Preview"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Page
              </Button>
              <Button variant="outline">Save as Draft</Button>
              <Button variant="outline">Publish</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
