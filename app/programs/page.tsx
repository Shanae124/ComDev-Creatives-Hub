'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authStore } from '@/lib/auth-store';
import { GraduationCap, Play, Lock, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Program {
  id: number;
  title: string;
  description: string;
  image_url: string;
  duration_weeks: number;
  level: string;
  status: string;
  org_id: number;
  total_courses: number;
}

interface Enrollment {
  id: number;
  program: Program;
  progress_percentage: number;
  completed_courses: number;
  enrolled_at: string;
  next_lesson: any;
}

export default function ProgramsPage() {
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = authStore.getState().token;
      
      const [programsRes, enrollmentsRes] = await Promise.all([
        fetch('http://localhost:3001/api/programs?status=active', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/programs/user/enrollments', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (programsRes.ok) {
        const data = await programsRes.json();
        setAvailablePrograms(data);
      }

      if (enrollmentsRes.ok) {
        const data = await enrollmentsRes.json();
        setEnrollments(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load programs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (programId: number) => {
    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/programs/${programId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'You are now enrolled in this program!'
        });
        fetchData();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to enroll',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        variant: 'destructive'
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="p-8">Loading programs...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      {/* My Enrollments */}
      {enrollments.length > 0 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Learning Paths</h1>
            <p className="text-muted-foreground mt-2">
              Continue your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {enrollment.program.image_url && (
                    <img 
                      src={enrollment.program.image_url} 
                      alt={enrollment.program.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <CardTitle>{enrollment.program.title}</CardTitle>
                  <CardDescription>{enrollment.program.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{enrollment.progress_percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage} />
                    <div className="text-xs text-muted-foreground">
                      {enrollment.completed_courses} of {enrollment.program.total_courses} courses completed
                    </div>
                  </div>

                  {enrollment.next_lesson ? (
                    <Button className="w-full" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Continue: {enrollment.next_lesson.title}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 justify-center p-4 bg-green-50 rounded">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Program Completed!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Programs */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Available Programs</h2>
          <p className="text-muted-foreground mt-2">
            Explore structured learning paths
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePrograms.map((program) => {
            const isEnrolled = enrollments.some(e => e.program.id === program.id);
            
            return (
              <Card key={program.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {program.image_url && (
                    <img 
                      src={program.image_url} 
                      alt={program.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getLevelColor(program.level)}>
                      {program.level}
                    </Badge>
                    {program.duration_weeks && (
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {program.duration_weeks} weeks
                      </Badge>
                    )}
                  </div>

                  <CardTitle>{program.title}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{program.total_courses} courses</span>
                  </div>

                  {isEnrolled ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Enrolled
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(program.id)}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Enroll Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {availablePrograms.length === 0 && (
          <Card className="p-12 text-center">
            <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No programs available</h3>
            <p className="text-muted-foreground">
              Check back later for new learning paths
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
