'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/auth-store';
import { Upload, Package, Play, Trash2, FileArchive, CheckCircle2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SCORMPackage {
  id: number;
  title: string;
  version: string;
  identifier: string;
  course_id: number;
  scos: any[];
  manifest_data: any;
  created_at: string;
}

interface Course {
  id: number;
  title: string;
}

export default function SCORMPage() {
  const [packages, setPackages] = useState<SCORMPackage[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authStore.getState().token;
      
      const [packagesRes, coursesRes] = await Promise.all([
        fetch('http://localhost:3001/api/scorm/packages', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json();
        setPackages(packagesData);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(coursesData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load SCORM packages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast({
          title: 'Invalid File',
          description: 'Please upload a ZIP file',
          variant: 'destructive'
        });
        return;
      }
      if (file.size > 500 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Maximum file size is 500MB',
          variant: 'destructive'
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCourse) {
      toast({
        title: 'Missing Information',
        description: 'Please select a file and course',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('scorm', selectedFile);
    formData.append('courseId', selectedCourse);

    try {
      const token = authStore.getState().token;
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          toast({
            title: 'Success',
            description: 'SCORM package uploaded successfully'
          });
          setDialogOpen(false);
          setSelectedFile(null);
          setSelectedCourse('');
          fetchData();
        } else {
          toast({
            title: 'Upload Failed',
            description: 'Failed to upload SCORM package',
            variant: 'destructive'
          });
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        toast({
          title: 'Network Error',
          description: 'Failed to upload file',
          variant: 'destructive'
        });
        setUploading(false);
      });

      xhr.open('POST', 'http://localhost:3001/api/scorm/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload SCORM package',
        variant: 'destructive'
      });
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this SCORM package? This cannot be undone.')) return;

    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/scorm/packages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'SCORM package deleted'
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete package',
        variant: 'destructive'
      });
    }
  };

  const handleLaunch = (packageId: number, scoId: string) => {
    const url = `/scorm-player?package=${packageId}&sco=${scoId}`;
    window.open(url, '_blank', 'width=1024,height=768');
  };

  if (loading) {
    return <div className="p-8">Loading SCORM packages...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SCORM Content</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage SCORM 1.2 and SCORM 2004 packages
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload SCORM Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload SCORM Package</DialogTitle>
              <DialogDescription>
                Upload a SCORM 1.2 or SCORM 2004 ZIP package (max 500MB)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>SCORM Package (ZIP)</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                    id="scorm-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="scorm-upload" className="cursor-pointer">
                    <FileArchive className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    {selectedFile ? (
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Click to select a ZIP file
                      </p>
                    )}
                  </label>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedCourse || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-green-500 flex items-center justify-center text-white">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{pkg.title}</CardTitle>
                    <CardDescription>SCORM {pkg.version}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{pkg.scos?.length || 0} SCOs</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(pkg.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {pkg.scos?.slice(0, 3).map((sco: any, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleLaunch(pkg.id, sco.identifier)}
                    >
                      <Play className="w-3 h-3 mr-2" />
                      {sco.title}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(pkg.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No SCORM packages</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first SCORM package to get started
          </p>
        </Card>
      )}
    </div>
  );
}
