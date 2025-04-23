
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { generateChapterContent } from '@/services/contentGenerator';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import DoubtsChat from '@/components/DoubtsChat';
import SelectionQuote from '@/components/SelectionQuote';
import ContentDock from '@/components/ContentDock';
import Highlighter from '@/components/Highlighter';

const ContentPage = () => {
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { 
    courses, 
    updateCourse, 
    markChapterCompleted, 
    updateChapterContent,
    getNextChapter,
    getPreviousChapter
  } = useStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contentDisplayed, setContentDisplayed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isHighlighterActive, setIsHighlighterActive] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const course = courses.find(c => c.id === courseId);
  const chapter = course?.chapters?.find(ch => ch.id === chapterId);
  
  const previousChapter = courseId && chapterId ? getPreviousChapter(courseId, chapterId) : null;
  const nextChapter = courseId && chapterId ? getNextChapter(courseId, chapterId) : null;
  
  useEffect(() => {
    if (!course) {
      toast.error('Course not found');
      navigate('/dashboard');
      return;
    }
    
    if (!chapter) {
      toast.error('Chapter not found');
      navigate(`/classroom/course/${courseId}`);
      return;
    }
    
    const hasContent = chapter.content && chapter.content.length > 100;
    if (hasContent) {
      setContentDisplayed(true);
    } else {
      generateContent();
    }
  }, [course, chapter, courseId, chapterId, navigate]);
  
  const generateContent = async () => {
    if (!course || !chapter || !courseId) return;
    
    setIsLoading(true);
    setProgress(0);
    setContentDisplayed(false);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      const content = await generateChapterContent(chapter.title, chapter.content || "");
      
      updateChapterContent(courseId, chapter.id, content);
      
      setProgress(100);
      setContentDisplayed(true);
      
      toast.success('Chapter content generated successfully');
    } catch (error) {
      console.error("Failed to generate chapter content:", error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };
  
  const handleChapterCompletion = (completed: boolean) => {
    if (course && chapter && courseId) {
      markChapterCompleted(courseId, chapter.id, completed);
      
      if (completed) {
        toast.success('Chapter marked as completed');
      } else {
        toast.info('Chapter marked as incomplete');
      }
    }
  };
  
  const navigateToCourse = () => {
    navigate(`/classroom/course/${courseId}`);
  };
  
  const navigateToChapter = (targetChapterId: string) => {
    navigate(`/classroom/${courseId}/content/${targetChapterId}`);
  };
  
  const openChat = () => {
    setSelectedText('');
    setIsChatOpen(true);
  };
  
  const handleTextSelection = (text: string) => {
    setSelectedText(text);
    setIsChatOpen(true);
  };

  const toggleHighlighter = () => {
    setIsHighlighterActive(!isHighlighterActive);
    
    if (!isHighlighterActive) {
      toast.info('Highlighter mode enabled. Select text to highlight it.');
    } else {
      toast.info('Highlighter mode disabled. Select text to ask doubts.');
    }
  };
  
  if (!course || !chapter) {
    return (
      <PageTransition>
        <div className="page-content flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </PageTransition>
    );
  }
  
  const hasContent = chapter.content && chapter.content.length > 100;
  
  return (
    <PageTransition>
      <div className="page-content">
        <Button
          variant="ghost"
          className="mb-6 p-0 h-auto hover:bg-transparent"
          onClick={navigateToCourse}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back to Course</span>
        </Button>
        
        <div className="bg-card rounded-lg shadow-page overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-display">{chapter.title}</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChapterCompletion(!chapter.completed)}
              >
                {chapter.completed ? (
                  <>
                    <Circle className="mr-2 h-4 w-4" />
                    <span>Mark as Incomplete</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Mark as Complete</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={generateContent}
                disabled={isLoading}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Generate Content</span>
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-md mb-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {progress < 100 ? 'Generating comprehensive content...' : 'Almost done...'}
                  </p>
                </div>
                <div className="space-y-4 w-full max-w-3xl mt-8">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-8 w-1/2 mt-6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ) : hasContent && contentDisplayed ? (
              <div ref={contentRef} className="prose prose-stone dark:prose-invert max-w-none relative">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight]}
                >
                  {chapter.content}
                </ReactMarkdown>
                
                <SelectionQuote 
                  containerRef={contentRef} 
                  onQuoteSelected={handleTextSelection}
                  disabled={isHighlighterActive}
                />
                
                <Highlighter
                  containerRef={contentRef}
                  isActive={isHighlighterActive}
                />
              </div>
            ) : hasContent && !contentDisplayed ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">The content for this chapter has already been generated.</p>
                <Button 
                  onClick={() => setContentDisplayed(true)}
                  className="mt-2"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Full Content
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">Generating content for this chapter...</p>
                <Button 
                  onClick={generateContent}
                  className="mt-2"
                  disabled={isLoading}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate & View Content
                </Button>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => previousChapter && navigateToChapter(previousChapter.id)}
                disabled={!previousChapter}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span>Previous Chapter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => nextChapter && navigateToChapter(nextChapter.id)}
                disabled={!nextChapter}
              >
                <span>Next Chapter</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <ContentDock
          onOpenChat={openChat}
          onOpenSyllabus={() => {}}
          courseTitle={course.title}
          chapters={course.chapters}
          activeChapterId={chapter.id}
          onSelectChapter={navigateToChapter}
          toggleHighlighter={toggleHighlighter}
          isHighlighterActive={isHighlighterActive}
        />
        
        <DoubtsChat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          context={chapter?.content || ''} 
          selectedText={selectedText}
        />
      </div>
    </PageTransition>
  );
};

export default ContentPage;
