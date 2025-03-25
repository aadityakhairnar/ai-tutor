import { useState, useEffect } from 'react';
import { TestTube, Loader2, X, Clock, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Course, Chapter } from '@/store/useStore';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
};

type TestState = {
  questions: Question[];
  selectedAnswers: (number | null)[];
  currentQuestion: number;
  timeLeft: number;
  testStarted: boolean;
  testCompleted: boolean;
  score: number;
};

const TestModal = ({ isOpen, onClose, course, selectedChapter, onChapterSelect, isGenerating }: TestModalProps) => {
  const [view, setView] = useState<'chapters' | 'test' | 'results'>('chapters');
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

    return () => clearInterval(timer);
  }, [testState.testStarted, testState.testCompleted, testState.timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSelectChapter = async (chapter: Chapter) => {
    onChapterSelect(chapter);
    setLoading(true);
    try {
      const mockQuestions = generateMockQuestions(chapter.title, 5);
      setTestTitle(`${chapter.title} Test`);
      setTestState({
        questions: mockQuestions,
        selectedAnswers: Array(mockQuestions.length).fill(null),
        currentQuestion: 0,
        timeLeft: 5 * 60,
        testStarted: false,
        testCompleted: false,
        score: 0
      });
      setView('test');
    } catch (error) {
      toast.error('Failed to generate test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntireCourse = async () => {
    setLoading(true);
    try {
      let allQuestions: Question[] = [];
      course.chapters?.forEach((chapter, index) => {
        const chapterQuestions = generateMockQuestions(chapter.title, 3, index * 3);
        allQuestions = [...allQuestions, ...chapterQuestions];
      });
      
      setTestTitle(`${course.title} Comprehensive Test`);
      setTestState({
        questions: allQuestions,
        selectedAnswers: Array(allQuestions.length).fill(null),
        currentQuestion: 0,
        timeLeft: 15 * 60,
        testStarted: false,
        testCompleted: false,
        score: 0
      });
      setView('test');
    } catch (error) {
      toast.error('Failed to generate test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    setTestState(prev => ({
      ...prev,
      testStarted: true
    }));
  };

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    setTestState(prev => {
      const updatedAnswers = [...prev.selectedAnswers];
      updatedAnswers[questionIndex] = answerIndex;
      return {
        ...prev,
        selectedAnswers: updatedAnswers
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

  const handleBackToChapters = () => {
    setView('chapters');
  };

  const generateMockQuestions = (chapterTitle: string, count: number, startId = 0): Question[] => {
    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        id: startId + i + 1,
        text: `Question about ${chapterTitle}: What is the main concept discussed in part ${i + 1}?`,
        options: [
          `Option A related to ${chapterTitle}`,
          `Option B related to ${chapterTitle}`,
          `Option C related to ${chapterTitle}`,
          `Option D related to ${chapterTitle}`
        ],
        correctAnswer: Math.floor(Math.random() * 4)
      });
    }
    return questions;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{view !== 'test' ? `${course.title} - Test` : testTitle}</DialogTitle>
          <DialogDescription>
            {view === 'chapters' && "Select a chapter to test or test your knowledge of the entire course"}
            {view === 'test' && !testState.testStarted && "Review the instructions and start when you're ready"}
            {view === 'test' && testState.testStarted && !testState.testCompleted && `Time remaining: ${formatTime(testState.timeLeft)}`}
            {view === 'results' && `You scored ${testState.score}% on this test`}
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
                    <TableHead className="w-[120px]">Action</TableHead>
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
                            <span className="flex items-center">
                              5 min <ChevronRight className="ml-1 h-4 w-4" />
                            </span>
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

        {view === 'test' && !testState.testStarted && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handleBackToChapters}>
                Back to Chapters
              </Button>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Test Instructions</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>This test contains {testState.questions.length} multiple-choice questions</li>
                  <li>You have {testState.timeLeft / 60} minutes to complete the test</li>
                  <li>You can navigate between questions using the Next and Previous buttons</li>
                  <li>You may change your answers at any time during the test</li>
                  <li>The test will automatically end when the time is up</li>
                  <li>Click 'Start Test' when you're ready to begin</li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <Button onClick={handleStartTest}>
                  Start Test <Clock className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {view === 'test' && testState.testStarted && !testState.testCompleted && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                Question {testState.currentQuestion + 1} of {testState.questions.length}
              </div>
              <div className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(testState.timeLeft)}
              </div>
            </div>
            
            <Progress 
              value={(testState.currentQuestion / testState.questions.length) * 100} 
              className="h-2 mb-4" 
            />
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">
                  {testState.questions[testState.currentQuestion]?.text}
                </h3>
                
                <RadioGroup
                  value={testState.selectedAnswers[testState.currentQuestion]?.toString() || ""}
                  onValueChange={(value) => handleSelectAnswer(testState.currentQuestion, parseInt(value))}
                  className="space-y-3"
                >
                  {testState.questions[testState.currentQuestion]?.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion}
                disabled={testState.currentQuestion === 0}
              >
                Previous
              </Button>
              
              {testState.currentQuestion < testState.questions.length - 1 ? (
                <Button 
                  onClick={handleNextQuestion}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmitTest}
                  variant="default"
                >
                  Submit Test
                </Button>
              )}
            </div>
          </div>
        )}

        {view === 'results' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold mb-2">Test Results</h3>
                  <div className="text-5xl font-bold mb-2">{testState.score}%</div>
                  <p className="text-muted-foreground">
                    {testState.score >= 70 
                      ? "Great job! You have a good understanding of this material." 
                      : "Keep studying! You're making progress but there's room for improvement."}
                  </p>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Question Summary</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Your Answer</TableHead>
                        <TableHead>Correct?</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testState.questions.map((question, idx) => (
                        <TableRow key={question.id}>
                          <TableCell>{`Q${idx + 1}`}</TableCell>
                          <TableCell>
                            {testState.selectedAnswers[idx] !== null 
                              ? `Option ${String.fromCharCode(65 + testState.selectedAnswers[idx]!)}` 
                              : "Not answered"}
                          </TableCell>
                          <TableCell>
                            {testState.selectedAnswers[idx] === question.correctAnswer 
                              ? "✓" 
                              : "✗"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4">
                <Button onClick={handleBackToChapters}>
                  Back to Chapters
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestModal;
