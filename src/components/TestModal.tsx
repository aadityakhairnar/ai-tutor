import { useState, useEffect } from 'react';
import { TestTube, Loader2, X, Clock, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Course, Chapter } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { generateTestQuestions } from '@/services/contentGenerator';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  selectedChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  isGenerating: boolean;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface TestState {
  questions: Question[];
  selectedAnswers: (number | null)[];
  currentQuestion: number;
  timeLeft: number;
  testStarted: boolean;
  testCompleted: boolean;
  score: number;
}

const TestModal = ({ isOpen, onClose, course, selectedChapter, onChapterSelect, isGenerating }: TestModalProps) => {
  const [view, setView] = useState<'chapters' | 'preview' | 'test' | 'results'>('chapters');
  const [testState, setTestState] = useState<TestState>({
    questions: [],
    selectedAnswers: [],
    currentQuestion: 0,
    timeLeft: 0,
    testStarted: false,
    testCompleted: false,
    score: 0
  });
  const [loading, setLoading] = useState(false);
  const [testTitle, setTestTitle] = useState('');

  useEffect(() => {
    let timer: number;
    if (testState.testStarted && !testState.testCompleted && testState.timeLeft > 0) {
      timer = window.setInterval(() => {
        setTestState(prev => {
          if (prev.timeLeft <= 1) {
            clearInterval(timer);
            return {
              ...prev,
              testCompleted: true,
              timeLeft: 0
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testState.testStarted, testState.testCompleted, testState.timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectChapter = async (chapter: Chapter) => {
    onChapterSelect(chapter);
    setLoading(true);
    try {
      const questionsData = await generateTestQuestions(chapter.title, chapter.content, 5);
      
      // Format the returned questions
      const formattedQuestions = questionsData.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
      
      setTestTitle(`${chapter.title} Test`);
      setTestState({
        questions: formattedQuestions,
        selectedAnswers: Array(formattedQuestions.length).fill(null),
        currentQuestion: 0,
        timeLeft: 5 * 60, // 5 minutes in seconds
        testStarted: false,
        testCompleted: false,
        score: 0
      });
      setView('preview');
      toast.success(`Generated ${formattedQuestions.length} questions for ${chapter.title}`);
    } catch (error) {
      console.error("Failed to generate test questions:", error);
      toast.error('Failed to generate test questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntireCourse = async () => {
    setLoading(true);
    try {
      let allQuestions: Question[] = [];
      let index = 0;
      
      // Process chapters sequentially to avoid overwhelming the API
      for (const chapter of course.chapters || []) {
        try {
          const chapterQuestions = await generateTestQuestions(chapter.title, chapter.content, 3);
          
          const formattedQuestions = chapterQuestions.map((q) => ({
            id: ++index,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          }));
          
          allQuestions = [...allQuestions, ...formattedQuestions];
        } catch (error) {
          console.error(`Error generating questions for chapter ${chapter.title}:`, error);
        }
      }
      
      setTestTitle(`${course.title} Comprehensive Test`);
      setTestState({
        questions: allQuestions,
        selectedAnswers: Array(allQuestions.length).fill(null),
        currentQuestion: 0,
        timeLeft: 15 * 60, // 15 minutes in seconds
        testStarted: false,
        testCompleted: false,
        score: 0
      });
      setView('preview');
      toast.success(`Generated ${allQuestions.length} questions for the entire course`);
    } catch (error) {
      console.error("Failed to generate test for entire course:", error);
      toast.error('Failed to generate test questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    setTestState(prev => ({
      ...prev,
      testStarted: true
    }));
    setView('test');
  };

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    setTestState(prev => {
      const newSelectedAnswers = [...prev.selectedAnswers];
      newSelectedAnswers[questionIndex] = answerIndex;
      return {
        ...prev,
        selectedAnswers: newSelectedAnswers
      };
    });
  };

  const handleNextQuestion = () => {
    if (testState.currentQuestion < testState.questions.length - 1) {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (testState.currentQuestion > 0) {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
    }
  };

  const handleSubmitTest = () => {
    let correctAnswers = 0;
    testState.questions.forEach((question, index) => {
      if (testState.selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / testState.questions.length) * 100);
    
    setTestState(prev => ({
      ...prev,
      testCompleted: true,
      score
    }));
    
    setView('results');
  };

  const handleReturnToChapters = () => {
    setView('chapters');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course.title} - Test</DialogTitle>
          <DialogDescription>
            Select a chapter to test your knowledge or test the entire course
          </DialogDescription>
        </DialogHeader>

        {view === 'chapters' && (
          <>
            <div className="mb-4">
              <Button 
                variant="secondary" 
                className="w-full mb-4"
                onClick={handleSelectEntireCourse}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
                Test Entire Course (15 min)
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Chapters</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.chapters?.map((chapter) => (
                    <TableRow key={chapter.id}>
                      <TableCell>{chapter.title}</TableCell>
                      <TableCell>{chapter.completed ? 'Completed' : 'In Progress'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSelectChapter(chapter)}
                          disabled={loading}
                        >
                          {loading && selectedChapter?.id === chapter.id ? 
                            <Loader2 className="h-4 w-4 animate-spin" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {view === 'preview' && (
          <div className="space-y-4">
            <Button variant="outline" size="sm" onClick={handleReturnToChapters}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chapters
            </Button>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">{testTitle}</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Time Limit: {formatTime(testState.timeLeft)}</span>
                  </div>
                  <div>
                    <span>Questions: {testState.questions.length}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      You will have {formatTime(testState.timeLeft)} to complete {testState.questions.length} multiple-choice questions. 
                      Your score will be displayed at the end of the test.
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-end">
                <Button onClick={handleStartTest}>Start Test</Button>
              </div>
            </Card>
          </div>
        )}

        {view === 'test' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{testTitle}</h2>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span className={`font-medium ${testState.timeLeft < 60 ? 'text-red-500' : ''}`}>
                  {formatTime(testState.timeLeft)}
                </span>
              </div>
            </div>

            <Progress 
              value={(testState.currentQuestion + 1) / testState.questions.length * 100} 
              className="h-2"
            />

            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">
                    Question {testState.currentQuestion + 1} of {testState.questions.length}
                  </h3>
                  <p className="text-lg">
                    {testState.questions[testState.currentQuestion]?.question}
                  </p>

                  <RadioGroup
                    value={testState.selectedAnswers[testState.currentQuestion]?.toString()}
                    onValueChange={(value) => handleSelectAnswer(testState.currentQuestion, parseInt(value))}
                    className="space-y-3"
                  >
                    {testState.questions[testState.currentQuestion]?.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={testState.currentQuestion === 0}
              >
                Previous
              </Button>
              
              {testState.currentQuestion === testState.questions.length - 1 ? (
                <Button onClick={handleSubmitTest}>
                  Submit Test
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  Next
                </Button>
              )}
            </div>
          </div>
        )}

        {view === 'results' && (
          <div className="space-y-6">
            <Button variant="outline" size="sm" onClick={handleReturnToChapters}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chapters
            </Button>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                
                <div className="text-center py-4">
                  <div className="text-5xl font-bold mb-2">
                    {testState.score}%
                  </div>
                  <p className="text-muted-foreground">
                    {testState.score >= 80 ? 'Excellent work!' : 
                     testState.score >= 60 ? 'Good job!' : 
                     'Keep practicing!'}
                  </p>
                </div>
                
                <div className="space-y-4 mt-6">
                  <h3 className="font-medium">Question Summary</h3>
                  <div className="space-y-3">
                    {testState.questions.map((question, index) => {
                      const isCorrect = testState.selectedAnswers[index] === question.correctAnswer;
                      const hasAnswered = testState.selectedAnswers[index] !== null;
                      
                      return (
                        <div 
                          key={question.id} 
                          className={`p-3 rounded-md ${
                            isCorrect ? 'bg-green-50 border border-green-200' : 
                            hasAnswered ? 'bg-red-50 border border-red-200' : 
                            'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <p className="font-medium">{index + 1}. {question.question}</p>
                          <div className="mt-2 text-sm">
                            {hasAnswered ? (
                              <p>
                                {isCorrect ? (
                                  <span className="text-green-600">✓ Correct: {question.options[question.correctAnswer]}</span>
                                ) : (
                                  <>
                                    <span className="text-red-600">✗ Your answer: {question.options[testState.selectedAnswers[index]!]}</span>
                                    <br />
                                    <span className="text-green-600">Correct answer: {question.options[question.correctAnswer]}</span>
                                  </>
                                )}
                              </p>
                            ) : (
                              <p className="text-amber-600">No answer selected</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestModal;
