
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, Circle } from 'lucide-react';
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

const ContentPage = () => {
  const { courseId, chapterId } = useParams<{ courseId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { courses, updateCourse, markChapterCompleted } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the course and chapter
  const course = courses.find(c => c.id === courseId);
  const chapter = course?.chapters?.find(ch => ch.id === chapterId);
  
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
    
    // If the chapter has no content or minimal content, generate it
    if (!chapter.content || chapter.content.length < 100) {
      generateChapterContent();
    }
  }, [course, chapter, courseId, navigate]);
  
  const generateChapterContent = async () => {
    if (!course || !chapter) return;
    
    setIsLoading(true);
    try {
      const content = await generateChapterContent(chapter.title, chapter.content || "");
      
      // Update chapter content in the store
      const updatedChapters = course.chapters?.map(ch => 
        ch.id === chapterId ? { ...ch, content } : ch
      );
      
      if (updatedChapters) {
        updateCourse(course.id, { 
          chapters: updatedChapters,
          updatedAt: new Date().toISOString()
        });
      }
      
      toast.success('Chapter content generated successfully');
    } catch (error) {
      console.error("Failed to generate chapter content:", error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChapterCompletion = (completed: boolean) => {
    if (course && chapter) {
      markChapterCompleted(course.id, chapter.id, completed);
      
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
            
            <Separator className="my-6" />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Generating comprehensive content for this topic...</p>
              </div>
            ) : chapter.content && chapter.content.length > 100 ? (
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex, rehypeHighlight]}
                >
                  {chapter.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No detailed content available for this chapter yet.</p>
                <Button onClick={generateChapterContent}>
                  Generate Content
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ContentPage;
