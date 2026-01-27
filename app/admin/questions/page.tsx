'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/auth-store';
import { FileQuestion, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Question {
  id: number;
  question_text: string;
  type: string;
  difficulty: string;
  category: string;
  points: number;
  options: any;
  correct_answer: any;
  created_at: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    question_text: '',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '',
    points: 1,
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionData = {
      question_text: formData.question_text,
      type: formData.type,
      difficulty: formData.difficulty,
      category: formData.category,
      points: formData.points,
      options: formData.type === 'multiple_choice' || formData.type === 'true_false' 
        ? formData.options.filter(opt => opt.trim())
        : null,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation
    };

    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Question created successfully'
        });
        setDialogOpen(false);
        fetchQuestions();
        resetForm();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to create question',
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

  const resetForm = () => {
    setFormData({
      question_text: '',
      type: 'multiple_choice',
      difficulty: 'medium',
      category: '',
      points: 1,
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: ''
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this question?')) return;

    try {
      const token = authStore.getState().token;
      const response = await fetch(`http://localhost:3001/api/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Question deleted'
        });
        fetchQuestions();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive'
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || q.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return <div className="p-8">Loading questions...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage assessment questions
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
              <DialogDescription>
                Add a new question to your question bank
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question_text">Question Text *</Label>
                <Textarea
                  id="question_text"
                  required
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Enter your question..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Question Type *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select 
                    value={formData.difficulty} 
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points *</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Chapter 1, Biology, History"
                />
              </div>

              {(formData.type === 'multiple_choice' || formData.type === 'true_false') && (
                <div className="space-y-2">
                  <Label>Answer Options *</Label>
                  {formData.type === 'multiple_choice' ? (
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-8 text-center font-medium">{String.fromCharCode(65 + index)}.</span>
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setFormData({ ...formData, options: ['True', 'False'] })}
                      >
                        True/False
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="correct_answer">Correct Answer *</Label>
                {formData.type === 'multiple_choice' ? (
                  <Select 
                    value={formData.correct_answer} 
                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.options.filter(opt => opt.trim()).map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {String.fromCharCode(65 + index)}. {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : formData.type === 'true_false' ? (
                  <Select 
                    value={formData.correct_answer} 
                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Textarea
                    id="correct_answer"
                    required
                    value={formData.correct_answer}
                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                    placeholder="Enter the correct answer..."
                    rows={2}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Question</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
            <SelectItem value="essay">Essay</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                      {question.type.replace('_', ' ')}
                    </span>
                    {question.category && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {question.category}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {question.points} {question.points === 1 ? 'point' : 'points'}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{question.question_text}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(question.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {question.options && (
              <CardContent>
                <div className="space-y-2">
                  {(Array.isArray(question.options) ? question.options : []).map((option: string, index: number) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded border ${
                        option === question.correct_answer ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                      {option === question.correct_answer && (
                        <span className="ml-2 text-xs text-green-600 font-medium">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card className="p-12 text-center">
          <FileQuestion className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No questions found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterType !== 'all' || filterDifficulty !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Create your first question to get started'}
          </p>
        </Card>
      )}
    </div>
  );
}
