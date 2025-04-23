import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course, Chapter, CourseStatus } from '@/store/useStore';
import { generateChapterContent } from '@/services/contentGenerator';

// Define types that match exactly with the database schema
type DbCourse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number | null;
  created_at: string | null;
  updated_at: string | null;
  user_id?: string;
};

type DbChapter = {
  id: string;
  title: string;
  completed: boolean | null;
  position: number;
  course_id: string;
  content: string | null;
};

// Transform database course to app course
const mapDbCourseToAppCourse = (dbCourse: DbCourse, dbChapters?: DbChapter[]): Course => {
  return {
    id: dbCourse.id,
    title: dbCourse.title,
    description: dbCourse.description || '',
    status: dbCourse.status as CourseStatus,
    progress: dbCourse.progress || 0,
    createdAt: dbCourse.created_at || new Date().toISOString(),
    updatedAt: dbCourse.updated_at || new Date().toISOString(),
    chapters: dbChapters?.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      completed: chapter.completed || false,
      position: chapter.position,
      content: chapter.content || undefined
    })) || []
  };
};

// Transform app course to database course
const mapAppCourseToDbCourse = (appCourse: Partial<Course>): Omit<DbCourse, 'user_id'> => {
  return {
    id: appCourse.id || undefined,
    title: appCourse.title || '',
    description: appCourse.description || null,
    status: appCourse.status || 'planned',
    progress: appCourse.progress || 0,
    created_at: appCourse.createdAt || null,
    updated_at: appCourse.updatedAt || null
  };
};

export const useCourseData = () => {
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      // First, fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Then, fetch all chapters for these courses
      const courseIds = coursesData.map(course => course.id);
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('*')
        .in('course_id', courseIds);

      if (chaptersError) throw chaptersError;

      // Map chapters to their respective courses
      return coursesData.map((course): Course => {
        const courseChapters = chaptersData.filter(chapter => chapter.course_id === course.id);
        return mapDbCourseToAppCourse(course, courseChapters);
      });
    },
  });

  const addCourse = useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const mappedData = mapAppCourseToDbCourse(courseData);

      // Insert course
      const { data: courseData1, error: courseError } = await supabase
        .from('courses')
        .insert({
          ...mappedData,
          title: mappedData.title || 'Untitled Course', // Ensure title is not empty
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // If there are chapters, insert them
      if (courseData.chapters && courseData.chapters.length > 0) {
        const chaptersData = courseData.chapters.map((chapter, index) => ({
          title: chapter.title,
          completed: chapter.completed || false,
          position: chapter.position || index,
          course_id: courseData1.id
        }));

        const { error: chaptersError } = await supabase
          .from('chapters')
          .insert(chaptersData);

        if (chaptersError) throw chaptersError;
      }

      return courseData1;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Course> & { id: string }) => {
      const mappedData = mapAppCourseToDbCourse(updates);
      
      const { error } = await supabase
        .from('courses')
        .update({
          ...mappedData,
          // Convert createdAt/updatedAt to created_at/updated_at format
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const updateChapter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Chapter> & { id: string }) => {
      const { error } = await supabase
        .from('chapters')
        .update({
          title: updates.title,
          completed: updates.completed,
          position: updates.position
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  // Helper function to get next and previous chapters
  const getNextChapter = (courseId: string, currentChapterId: string): Chapter | null => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.chapters) return null;
    
    const sortedChapters = [...course.chapters].sort((a, b) => a.position - b.position);
    const currentIndex = sortedChapters.findIndex(ch => ch.id === currentChapterId);
    
    if (currentIndex === -1 || currentIndex === sortedChapters.length - 1) return null;
    return sortedChapters[currentIndex + 1];
  };

  const getPreviousChapter = (courseId: string, currentChapterId: string): Chapter | null => {
    const course = courses.find(c => c.id === courseId);
    if (!course || !course.chapters) return null;
    
    const sortedChapters = [...course.chapters].sort((a, b) => a.position - b.position);
    const currentIndex = sortedChapters.findIndex(ch => ch.id === currentChapterId);
    
    if (currentIndex <= 0) return null;
    return sortedChapters[currentIndex - 1];
  };

  const markChapterCompleted = async (courseId: string, chapterId: string, completed: boolean) => {
    await updateChapter.mutateAsync({ id: chapterId, completed });
    
    // Update course progress
    const course = courses.find(c => c.id === courseId);
    if (course && course.chapters) {
      const totalChapters = course.chapters.length;
      const completedChapters = course.chapters.filter(ch => 
        ch.id === chapterId ? completed : ch.completed
      ).length;
      
      const progress = Math.round((completedChapters / totalChapters) * 100);
      await updateCourse.mutateAsync({ id: courseId, progress });
    }
  };

  const updateChapterContent = useMutation({
    mutationFn: async ({ courseId, chapterId, content }: { 
      courseId: string, 
      chapterId: string, 
      content: string 
    }) => {
      const { error } = await supabase
        .from('chapters')
        .update({ content })
        .eq('id', chapterId)
        .eq('course_id', courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate the courses query to refresh data
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    }
  });

  const generateAndStoreChapterContent = async (
    courseId: string, 
    chapterId: string, 
    chapterTitle: string
  ) => {
    try {
      // Generate content using existing content generator
      const generatedContent = await generateChapterContent(
        chapterTitle, 
        '' // Passing empty description as we don't have it
      );

      // Store the generated content
      await updateChapterContent.mutateAsync({
        courseId, 
        chapterId, 
        content: generatedContent
      });

      return generatedContent;
    } catch (error) {
      console.error('Failed to generate chapter content:', error);
      throw error;
    }
  };

  return {
    courses,
    isLoading,
    addCourse,
    updateCourse,
    updateChapter,
    markChapterCompleted,
    updateChapterContent: generateAndStoreChapterContent,
    getNextChapter,
    getPreviousChapter
  };
};
