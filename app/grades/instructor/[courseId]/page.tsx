'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authStore } from '@/lib/auth-store';
import { Download, TrendingUp, TrendingDown, Award, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GradeItem {
  id: number;
  name: string;
  type: string;
  points_possible: number;
  category_name?: string;
}

interface StudentGrade {
  user_id: number;
  user_name: string;
  user_email: string;
  grades: { [itemId: number]: { score: number; percentage: number; letter_grade: string } };
  overall_percentage: number;
  overall_letter: string;
}

export default function InstructorGradebookPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([]);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchGradebook();
  }, [courseId]);

  const fetchGradebook = async () => {
    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/gradebook/courses/${courseId}/instructor`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGradeItems(data.gradeItems || []);
        setStudents(data.students || []);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load gradebook',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/gradebook/courses/${courseId}/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gradebook-course-${courseId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Gradebook exported successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export gradebook',
        variant: 'destructive'
      });
    }
  };

  const getLetterGradeColor = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'text-green-600 bg-green-50';
    if (grade === 'B' || grade === 'B+') return 'text-blue-600 bg-blue-50';
    if (grade === 'C' || grade === 'C+') return 'text-yellow-600 bg-yellow-50';
    if (grade === 'D' || grade === 'D+') return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const calculateStats = () => {
    if (students.length === 0) return { average: 0, highest: 0, lowest: 0 };

    const percentages = students.map(s => s.overall_percentage);
    return {
      average: percentages.reduce((a, b) => a + b, 0) / percentages.length,
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages)
    };
  };

  const stats = calculateStats();

  const filteredStudents = students.filter(student =>
    student.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading gradebook...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Gradebook</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all student grades
          </p>
        </div>

        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Class Average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.average.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Highest Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div className="text-3xl font-bold">{stats.highest.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Lowest Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div className="text-3xl font-bold">{stats.lowest.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Gradebook Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10 min-w-[200px]">Student</TableHead>
                  {gradeItems.map(item => (
                    <TableHead key={item.id} className="text-center min-w-[100px]">
                      <div>{item.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        {item.points_possible} pts
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center bg-gray-50 font-bold">Overall</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map(student => (
                  <TableRow key={student.user_id}>
                    <TableCell className="sticky left-0 bg-white z-10 font-medium">
                      <div>{student.user_name}</div>
                      <div className="text-xs text-muted-foreground">{student.user_email}</div>
                    </TableCell>
                    {gradeItems.map(item => {
                      const grade = student.grades[item.id];
                      return (
                        <TableCell key={item.id} className="text-center">
                          {grade ? (
                            <div>
                              <div className="font-medium">{grade.score}/{item.points_possible}</div>
                              <div className="text-xs text-muted-foreground">{grade.percentage}%</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center bg-gray-50">
                      <div className="flex items-center justify-center gap-2">
                        <div className="font-bold text-lg">{student.overall_percentage.toFixed(1)}%</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLetterGradeColor(student.overall_letter)}`}>
                          {student.overall_letter}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 && (
        <Card className="p-12 text-center">
          <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No students found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try a different search term' : 'No students are enrolled in this course'}
          </p>
        </Card>
      )}
    </div>
  );
}
