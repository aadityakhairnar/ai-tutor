import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, ClipboardList, RefreshCw, CalendarDays, BookOpen, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, Chapter, Course } from '@/store/useStore';
import { generateSyllabus, SyllabusChapter } from '@/services/openai';
import { generateChapterContent } from '@/services/contentGenerator';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Syllabus = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || 'Unknown Topic';
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const { setSyllabus, addCourse, courses, updateCourse } = useStore();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!topic || topic === 'Unknown Topic') {
        toast.error('Invalid topic. Please search again.');
        navigate('/classroom');
        return;
      }
      
      try {
        setLoading(true);
        const syllabusData = await generateSyllabus(topic);
        
        const formattedChapters: Chapter[] = syllabusData.map((chapter: SyllabusChapter, index: number) => ({
          id: `${id}-${index + 1}`,
          title: chapter.title,
          content: chapter.content,
          completed: false
        }));
        
        setChapters(formattedChapters);
        setSyllabus({
          id: id || '',
          topic,
          chapters: formattedChapters,
          loading: false
        });

        // Save the course and chapters to Supabase immediately
        if (user) {
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .insert({
              id,
              user_id: user.id,
              title: topic,
              description: `A comprehensive course about ${topic}.`,
              status: 'planned',
              progress: 0
            })
            .select()
            .single();

          if (courseError) {
            console.error('Error saving course:', courseError);
            return;
          }

          const { error: chaptersError } = await supabase
            .from('chapters')
            .insert(
              formattedChapters.map(chapter => ({
                course_id: id,
                title: chapter.title,
                content: chapter.content,
                completed: false
              }))
            );

          if (chaptersError) {
            console.error('Error saving chapters:', chaptersError);
            return;
          }
        }
        
        toast.success('Syllabus generated successfully');
      } catch (error) {
        console.error('Error generating syllabus:', error);
        toast.error('Failed to generate syllabus. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabus();
  }, [id, topic, setSyllabus, navigate, user]);
  
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const syllabusData = await generateSyllabus(topic);
      
      const formattedChapters: Chapter[] = syllabusData.map((chapter: SyllabusChapter, index: number) => ({
        id: `${id}-${index + 1}`,
        title: chapter.title,
        content: chapter.content,
        completed: false
      }));
      
      setChapters(formattedChapters);
      setSyllabus({
        id: id || '',
        topic,
        chapters: formattedChapters,
        loading: false
      });

      // Update the course and chapters in Supabase
      if (user) {
        const { error: chaptersError } = await supabase
          .from('chapters')
          .delete()
          .eq('course_id', id);

        if (chaptersError) {
          console.error('Error deleting old chapters:', chaptersError);
          return;
        }

        const { error: insertError } = await supabase
          .from('chapters')
          .insert(
            formattedChapters.map(chapter => ({
              course_id: id,
              title: chapter.title,
              content: chapter.content,
              completed: false
            }))
          );

        if (insertError) {
          console.error('Error updating chapters:', insertError);
          return;
        }
      }
      
      toast.success('Syllabus refreshed successfully');
    } catch (error) {
      console.error('Error refreshing syllabus:', error);
      toast.error('Failed to refresh syllabus. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartCourse = async () => {
    if (!user) {
      toast.error('Please sign in to start a course');
      return;
    }

    try {
      // Update course status in Supabase
      const { error: courseError } = await supabase
        .from('courses')
        .update({ status: 'ongoing' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (courseError) {
        console.error('Error updating course status:', courseError);
        return;
      }

      // Update local state
      const newCourse: Course = {
        id,
        title: topic,
        description: `A comprehensive course about ${topic}.`,
        status: 'ongoing',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chapters
      };
      
      const existingCourse = courses.find(course => course.id === id);
      if (existingCourse) {
        updateCourse(id, { status: 'ongoing' });
        toast.info('Course status updated to ongoing');
      } else {
        addCourse(newCourse);
        toast.success('Course added to your learning journey');
      }
      
      // If chapters exist, navigate to the first chapter and generate content
      if (chapters && chapters.length > 0) {
        const firstChapter = chapters[0];
        navigate(`/classroom/${id}/content/${firstChapter.id}`);
      }
    } catch (error) {
      console.error('Error starting course:', error);
      toast.error('Failed to start course. Please try again.');
    }
  };
  
  const handlePlanLater = async () => {
    if (!user) {
      toast.error('Please sign in to plan a course');
      return;
    }

    try {
      // Update course status in Supabase
      const { error: courseError } = await supabase
        .from('courses')
        .update({ status: 'planned' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (courseError) {
        console.error('Error updating course status:', courseError);
        return;
      }

      // Update local state
      const newCourse: Course = {
        id,
        title: topic,
        description: `A comprehensive course about ${topic}.`,
        status: 'planned',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chapters
      };
      
      const existingCourse = courses.find(course => course.id === id);
      if (existingCourse) {
        updateCourse(id, { status: 'planned' });
        toast.info('Course status updated to planned');
      } else {
        addCourse(newCourse);
        toast.success('Course added to your planned courses');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error planning course:', error);
      toast.error('Failed to plan course. Please try again.');
    }
  };

  const handleViewChapterContent = async (chapter: Chapter) => {
    if (!user) {
      toast.error('Please sign in to view chapter content');
      return;
    }

    try {
      // Update course status to ongoing if it's planned
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('status')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (courseError) {
        console.error('Error checking course status:', courseError);
        return;
      }

      if (courseData.status === 'planned') {
        const { error: updateError } = await supabase
          .from('courses')
          .update({ status: 'ongoing' })
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating course status:', updateError);
          return;
        }

        // Update local state
        const existingCourse = courses.find(course => course.id === id);
        if (existingCourse) {
          updateCourse(id, { status: 'ongoing' });
        } else {
          addCourse({
            id: id || '',
            title: topic,
            description: `A comprehensive course about ${topic}.`,
            status: 'ongoing',
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            chapters
          });
        }
      }
      
      // Navigate to the chapter content page
      navigate(`/classroom/${id}/content/${chapter.id}`);
    } catch (error) {
      console.error('Error viewing chapter content:', error);
      toast.error('Failed to view chapter content. Please try again.');
    }
  };
  
  return (
    <PageTransition>
      <div className="page-content">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 p-0 h-auto hover:bg-transparent"
            onClick={() => navigate('/classroom')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Classroom</span>
          </Button>
          
          <div className="bg-card rounded-lg p-6 shadow-page">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display mb-1">{topic}</h1>
                <p className="text-muted-foreground">Course Syllabus</p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Refresh Syllabus</span>
                </Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">Generating your personalized syllabus...</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-medium mb-4">Course Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-accent/50 rounded-md p-4 flex items-start">
                      <BookOpen className="w-5 h-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium">Chapters</h3>
                        <p className="text-2xl font-display">{chapters.length}</p>
                      </div>
                    </div>
                    <div className="bg-accent/50 rounded-md p-4 flex items-start">
                      <ClipboardList className="w-5 h-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium">Estimated Time</h3>
                        <p className="text-2xl font-display">{chapters.length * 2} hours</p>
                      </div>
                    </div>
                    <div className="bg-accent/50 rounded-md p-4 flex items-start">
                      <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium">Difficulty</h3>
                        <p className="text-2xl font-display">
                          {chapters.length <= 6 ? 'Beginner' : chapters.length <= 10 ? 'Intermediate' : 'Advanced'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-medium mb-4">Chapters</h2>
                  <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-accent/30 p-5 rounded-md"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-medium mb-2">
                              {index + 1}. {chapter.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">{chapter.content}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="self-start sm:self-center whitespace-nowrap"
                            onClick={() => handleViewChapterContent(chapter)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            <span>View Full Content</span>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button onClick={handleStartCourse} className="flex-1">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Start Learning Now</span>
                  </Button>
                  <Button variant="outline" onClick={handlePlanLater} className="flex-1">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>Plan to Learn Later</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Syllabus;
