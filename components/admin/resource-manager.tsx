"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, LinkIcon, FileText, Video, Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Resource = {
  id: number
  name: string
  type: "file" | "link" | "video"
  url: string
  size?: string
}

export function ResourceManager() {
  const [resources, setResources] = useState<Resource[]>([])
  const [newResource, setNewResource] = useState({
    name: "",
    type: "link" as "file" | "link" | "video",
    url: "",
  })

  const addResource = () => {
    if (newResource.name && newResource.url) {
      setResources([
        ...resources,
        {
          id: Date.now(),
          ...newResource,
        },
      ])
      setNewResource({ name: "", type: "link", url: "" })
    }
  }

  const removeResource = (id: number) => {
    setResources(resources.filter((r) => r.id !== id))
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="h-4 w-4" />
      case "link":
        return <LinkIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-name">Resource Name</Label>
            <Input
              id="resource-name"
              placeholder="e.g., Lab Exercise PDF"
              value={newResource.name}
              onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-type">Resource Type</Label>
            <Select
              value={newResource.type}
              onValueChange={(value) => setNewResource({ ...newResource, type: value as "file" | "link" | "video" })}
            >
              <SelectTrigger id="resource-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File Upload</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newResource.type === "file" ? (
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex items-center gap-2">
                <Input id="file-upload" type="file" />
                <Button type="button" size="icon" variant="outline">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="resource-url">URL</Label>
              <Input
                id="resource-url"
                placeholder="https://example.com/resource"
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              />
            </div>
          )}

          <Button onClick={addResource} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </CardContent>
      </Card>

      {resources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Course Resources</h4>
          <div className="space-y-2">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{resource.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">{resource.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{resource.type}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeResource(resource.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
