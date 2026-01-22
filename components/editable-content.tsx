'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditableContentProps {
  initialContent: string
  onSave: (content: string) => Promise<void>
  editable?: boolean
  className?: string
  contentType?: 'text' | 'html' | 'richtext'
}

export const EditableContent: React.FC<EditableContentProps> = ({
  initialContent,
  onSave,
  editable = false,
  className = '',
  contentType = 'text',
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving content:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setContent(initialContent)
    setIsEditing(false)
  }

  if (!isEditing && editable) {
    return (
      <div
        className={`group relative ${className}`}
        onMouseEnter={(e) => {
          const btn = e.currentTarget.querySelector('[data-edit-btn]') as HTMLElement
          if (btn) btn.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget.querySelector('[data-edit-btn]') as HTMLElement
          if (btn) btn.style.opacity = '0'
        }}
      >
        <div ref={contentRef} className="prose dark:prose-invert max-w-none">
          {contentType === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <div>{content}</div>
          )}
        </div>
        {editable && (
          <button
            data-edit-btn
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 opacity-0 transition-opacity p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            title="Edit content"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        {contentType === 'html' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-48 p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter content..."
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-24 p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter content..."
          />
        )}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div ref={contentRef} className={`prose dark:prose-invert max-w-none ${className}`}>
      {contentType === 'html' ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <div>{content}</div>
      )}
    </div>
  )
}

interface EditableListProps {
  initialItems: string[]
  onSave: (items: string[]) => Promise<void>
  editable?: boolean
  className?: string
}

export const EditableList: React.FC<EditableListProps> = ({
  initialItems,
  onSave,
  editable = false,
  className = '',
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [items, setItems] = useState(initialItems)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddItem = () => {
    setItems([...items, ''])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleUpdateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(items.filter((item) => item.trim()))
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving items:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setItems(initialItems)
    setIsEditing(false)
  }

  if (!isEditing && editable) {
    return (
      <div
        className={`group relative ${className}`}
        onMouseEnter={(e) => {
          const btn = e.currentTarget.querySelector('[data-edit-btn]') as HTMLElement
          if (btn) btn.style.opacity = '1'
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget.querySelector('[data-edit-btn]') as HTMLElement
          if (btn) btn.style.opacity = '0'
        }}
      >
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {editable && (
          <button
            data-edit-btn
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 opacity-0 transition-opacity p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            title="Edit list"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleUpdateItem(idx, e.target.value)}
                placeholder={`Item ${idx + 1}`}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => handleRemoveItem(idx)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          onClick={handleAddItem}
          variant="outline"
          size="sm"
          className="gap-2 w-full"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <span className="text-blue-500 font-bold">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
