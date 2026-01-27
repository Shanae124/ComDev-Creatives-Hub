'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { authStore } from '@/lib/auth-store';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: number;
  question_text: string;
  type: string;
  options: string[];
  points: number;
}

interface Attempt {
  id: number;
  assessment_id: number;
  started_at: string;
  due_at: string;
  status: string;
  questions_data: Question[];
}

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    loadAttempt();
  }, [params.attemptId]);

  useEffect(() => {
    if (!attempt || !attempt.due_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const due = new Date(attempt.due_at).getTime();
      const remaining = Math.max(0, due - now);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        handleSubmit(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!attempt) return;

    const interval = setInterval(() => {
      autoSaveAnswers();
    }, 30000);

    return () => clearInterval(interval);
  }, [attempt, answers]);

  const loadAttempt = async () => {
    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/assessments/attempts/${params.attemptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAttempt(data);
        
        // Load saved answers
        if (data.saved_answers) {
          setAnswers(data.saved_answers);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load assessment',
          variant: 'destructive'
        });
        router.push('/assignments');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error',
        variant: 'destructive'
      });
    }
  };

  const autoSaveAnswers = async () => {
    if (!attempt || submitting) return;

    setAutoSaving(true);
    try {
      const token = authStore.getState().token;
      await fetch(`http://localhost:3001/api/assessments/attempts/${attempt.id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });
    } catch (error) {
      // Silently fail auto-save
    } finally {
      setAutoSaving(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleSubmit = async (timeExpired = false) => {
    if (submitting) return;

    const unansweredCount = attempt!.questions_data.length - Object.keys(answers).length;
    
    if (!timeExpired && unansweredCount > 0) {
      if (!confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/assessments/attempts/${attempt!.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        const results = await response.json();
        
        toast({
          title: 'Assessment Submitted',
          description: `Score: ${results.score}%`
        });

        router.push(`/assignments/results/${attempt!.id}`);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: timeExpired ? 'Time expired - your answers have been auto-submitted' : 'Failed to submit assessment',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  };

  if (!attempt) {
    return <div className="p-8">Loading assessment...</div>;
  }

  const currentQ = attempt.questions_data[currentQuestion];
  const progress = ((currentQuestion + 1) / attempt.questions_data.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold">Assessment</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {attempt.questions_data.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {autoSaving && (
                <span className="text-sm text-muted-foreground">Saving...</span>
              )}
              
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 ${timeRemaining < 300000 ? 'text-red-600' : ''}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm">{answeredCount}/{attempt.questions_data.length}</span>
              </div>
            </div>
          </div>

          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl">{currentQ.question_text}</CardTitle>
              <span className="text-sm font-medium text-muted-foreground">
                {currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQ.type === 'multiple_choice' && (
              <RadioGroup
                value={answers[currentQ.id]}
                onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
              >
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover:bg-gray-50 ${
                        answers[currentQ.id] === option ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => handleAnswerChange(currentQ.id, option)}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQ.type === 'true_false' && (
              <RadioGroup
                value={answers[currentQ.id]}
                onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
              >
                <div className="space-y-3">
                  {['true', 'false'].map((option) => (
                    <div
                      key={option}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer hover:bg-gray-50 ${
                        answers[currentQ.id] === option ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => handleAnswerChange(currentQ.id, option)}
                    >
                      <RadioGroupItem value={option} id={`option-${option}`} />
                      <Label htmlFor={`option-${option}`} className="flex-1 cursor-pointer capitalize">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {(currentQ.type === 'short_answer' || currentQ.type === 'essay') && (
              <Textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={currentQ.type === 'essay' ? 10 : 4}
                className="w-full"
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentQuestion < attempt.questions_data.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {attempt.questions_data.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded flex items-center justify-center font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-primary text-white'
                      : answers[q.id]
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
