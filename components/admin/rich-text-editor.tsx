"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Quote,
  LinkIcon,
  ImageIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual")

  const insertHTML = (tag: string) => {
    const textarea = document.getElementById("html-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let newText = ""

    switch (tag) {
      case "h1":
        newText = `<h1>${selectedText || "Heading 1"}</h1>`
        break
      case "h2":
        newText = `<h2>${selectedText || "Heading 2"}</h2>`
        break
      case "h3":
        newText = `<h3>${selectedText || "Heading 3"}</h3>`
        break
      case "bold":
        newText = `<strong>${selectedText || "bold text"}</strong>`
        break
      case "italic":
        newText = `<em>${selectedText || "italic text"}</em>`
        break
      case "underline":
        newText = `<u>${selectedText || "underlined text"}</u>`
        break
      case "ul":
        newText = `<ul>\n  <li>${selectedText || "List item"}</li>\n</ul>`
        break
      case "ol":
        newText = `<ol>\n  <li>${selectedText || "List item"}</li>\n</ol>`
        break
      case "code":
        newText = `<code>${selectedText || "code"}</code>`
        break
      case "blockquote":
        newText = `<blockquote>${selectedText || "Quote"}</blockquote>`
        break
      case "link":
        newText = `<a href="https://example.com">${selectedText || "link text"}</a>`
        break
      case "image":
        newText = `<img src="https://example.com/image.jpg" alt="${selectedText || "description"}" />`
        break
      default:
        return
    }

    const newContent = content.substring(0, start) + newText + content.substring(end)
    onChange(newContent)
  }

  const toolbarButtons = [
    { icon: Heading1, action: "h1", label: "Heading 1" },
    { icon: Heading2, action: "h2", label: "Heading 2" },
    { icon: Heading3, action: "h3", label: "Heading 3" },
    { icon: Bold, action: "bold", label: "Bold" },
    { icon: Italic, action: "italic", label: "Italic" },
    { icon: Underline, action: "underline", label: "Underline" },
    { icon: List, action: "ul", label: "Bullet List" },
    { icon: ListOrdered, action: "ol", label: "Numbered List" },
    { icon: Code, action: "code", label: "Code" },
    { icon: Quote, action: "blockquote", label: "Quote" },
    { icon: LinkIcon, action: "link", label: "Link" },
    { icon: ImageIcon, action: "image", label: "Image" },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
          {toolbarButtons.map((button, index) => (
            <div key={button.action} className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertHTML(button.action)}
                title={button.label}
              >
                <button.icon className="h-4 w-4" />
              </Button>
              {(index === 2 || index === 5 || index === 9) && <Separator orientation="vertical" className="mx-1 h-6" />}
            </div>
          ))}
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "visual" | "html")}>
          <div className="border-b border-border px-2">
            <TabsList className="h-9">
              <TabsTrigger value="visual" className="text-xs">
                Visual
              </TabsTrigger>
              <TabsTrigger value="html" className="text-xs">
                HTML
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="visual" className="m-0">
            <div
              className={cn("editor-content min-h-[400px] border-0")}
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              onInput={(e) => onChange(e.currentTarget.innerHTML)}
              suppressContentEditableWarning
            />
          </TabsContent>

          <TabsContent value="html" className="m-0">
            <textarea
              id="html-editor"
              className="min-h-[400px] w-full resize-none border-0 bg-background p-4 font-mono text-sm outline-none"
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter HTML content..."
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <h4 className="text-sm font-semibold mb-2">Preview</h4>
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content || "<p>Your content will appear here...</p>" }}
        />
      </div>
    </div>
  )
}
