import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CourseStatus = 'completed' | 'ongoing' | 'planned';

export interface Course {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  content?: string;
  completed: boolean;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface StoreState {
  courses: Course[];
  activeCourse: Course | null;
  syllabus: {
    id: string;
    topic: string;
    chapters: Chapter[];
    loading: boolean;
  } | null;
  flashcards: Record<string, Flashcard[]>;
  testQuestions: Record<string, TestQuestion[]>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>;
  removeCourse: (courseId: string) => Promise<void>;
  setActiveCourse: (course: Course | null) => void;
  setSyllabus: (syllabus: StoreState['syllabus']) => void;
  markChapterCompleted: (courseId: string, chapterId: string, completed: boolean) => Promise<void>;
  updateCourseStatus: (courseId: string, status: CourseStatus) => Promise<void>;
  updateChapterContent: (courseId: string, chapterId: string, content: string) => Promise<void>;
  getChapterContent: (courseId: string, chapterId: string) => string;
  getNextChapter: (courseId: string, currentChapterId: string) => Chapter | null;
  getPreviousChapter: (courseId: string, currentChapterId: string) => Chapter | null;
  addFlashcards: (courseId: string, chapterId: string, flashcards: Omit<Flashcard, 'id'>[]) => void;
  getFlashcardsForChapter: (courseId: string, chapterId: string) => Flashcard[];
  getFlashcardsForCourse: (courseId: string) => Flashcard[];
  addTestQuestions: (courseId: string, chapterId: string, questions: Omit<TestQuestion, 'id'>[]) => void;
  getTestQuestionsForChapter: (courseId: string, chapterId: string) => TestQuestion[];
  getTestQuestionsForCourse: (courseId: string) => TestQuestion[];
  loadUserCourses: () => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      courses: [],
      activeCourse: null,
      syllabus: null,
      flashcards: {},
      testQuestions: {},
      
      loadUserCourses: async () => {
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (coursesError) {
          console.error('Error loading courses:', coursesError);
          return;
        }

        // Load chapters for each course
        const coursesWithChapters = await Promise.all(
          coursesData.map(async (course) => {
            const { data: chaptersData, error: chaptersError } = await supabase
              .from('chapters')
              .select('*')
              .eq('course_id', course.id)
              .order('created_at', { ascending: true });

            if (chaptersError) {
              console.error('Error loading chapters:', chaptersError);
              return {
                id: course.id,
                title: course.title,
                description: course.description || '',
                status: course.status,
                progress: course.progress || 0,
                createdAt: course.created_at,
                updatedAt: course.updated_at,
                chapters: []
              };
            }

            return {
              id: course.id,
              title: course.title,
              description: course.description || '',
              status: course.status,
              progress: course.progress || 0,
              createdAt: course.created_at,
              updatedAt: course.updated_at,
              chapters: chaptersData.map(chapter => ({
                id: chapter.id.toString(),
                title: chapter.title,
                content: chapter.content || '',
                completed: chapter.completed
              }))
            };
          })
        );

        set({ courses: coursesWithChapters });
      },
      
      addCourse: async (course) => {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: course.title,
            description: course.description,
            status: course.status,
            progress: course.progress
          })
          .select()
          .single();

        if (courseError) {
          console.error('Error adding course:', courseError);
          return;
        }

        // Add chapters if they exist
        if (course.chapters && course.chapters.length > 0) {
          const { error: chaptersError } = await supabase
            .from('chapters')
            .insert(
              course.chapters.map(chapter => ({
                course_id: courseData.id,
                title: chapter.title,
                content: chapter.content,
                completed: chapter.completed
              }))
            );

          if (chaptersError) {
            console.error('Error adding chapters:', chaptersError);
            return;
          }
        }

        // Reload courses to get the latest data
        await get().loadUserCourses();
      },
      
      updateCourse: async (courseId, updates) => {
        const { error } = await supabase
          .from('courses')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId);

        if (error) {
          console.error('Error updating course:', error);
          return;
        }

        // Reload courses to get the latest data
        await get().loadUserCourses();
      },
      
      removeCourse: async (courseId) => {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', courseId);

        if (error) {
          console.error('Error removing course:', error);
          return;
        }

        // Reload courses to get the latest data
        await get().loadUserCourses();
      },
      
      setActiveCourse: (course) => set({ activeCourse: course }),
      
      setSyllabus: (syllabus) => set({ syllabus }),
      
      markChapterCompleted: async (courseId, chapterId, completed) => {
        const { error } = await supabase
          .from('chapters')
          .update({
            completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', chapterId)
          .eq('course_id', courseId);

        if (error) {
          console.error('Error marking chapter completed:', error);
          return;
        }

        // Update course progress
        const { data: chapters } = await supabase
          .from('chapters')
          .select('completed')
          .eq('course_id', courseId);

        if (chapters) {
          const totalChapters = chapters.length;
          const completedChapters = chapters.filter(ch => ch.completed).length;
          const newProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

          await get().updateCourse(courseId, { progress: newProgress });
        }
      },
      
      updateCourseStatus: async (courseId, status) => {
        await get().updateCourse(courseId, { status });
      },
      
      updateChapterContent: async (courseId, chapterId, content) => {
        const { error } = await supabase
          .from('chapters')
          .update({
            content,
            updated_at: new Date().toISOString()
          })
          .eq('id', chapterId)
          .eq('course_id', courseId);

        if (error) {
          console.error('Error updating chapter content:', error);
          return;
        }

        // Reload courses to get the latest data
        await get().loadUserCourses();
      },
      
      getChapterContent: (courseId, chapterId) => {
        const course = get().courses.find(c => c.id === courseId);
        const chapter = course?.chapters?.find(ch => ch.id === chapterId);
        return chapter?.content || '';
      },
      
      getNextChapter: (courseId, currentChapterId) => {
        const course = get().courses.find(c => c.id === courseId);
        if (!course?.chapters) return null;
        
        const currentIndex = course.chapters.findIndex(ch => ch.id === currentChapterId);
        if (currentIndex === -1 || currentIndex === course.chapters.length - 1) return null;
        
        return course.chapters[currentIndex + 1];
      },
      
      getPreviousChapter: (courseId, currentChapterId) => {
        const course = get().courses.find(c => c.id === courseId);
        if (!course?.chapters) return null;
        
        const currentIndex = course.chapters.findIndex(ch => ch.id === currentChapterId);
        if (currentIndex <= 0) return null;
        
        return course.chapters[currentIndex - 1];
      },
      
      addFlashcards: (courseId, chapterId, flashcards) => {
        set(state => ({
          flashcards: {
            ...state.flashcards,
            [`${courseId}-${chapterId}`]: flashcards.map((f, index) => ({
              ...f,
              id: `${courseId}-${chapterId}-${index}`
            }))
          }
        }));
      },
      
      getFlashcardsForChapter: (courseId, chapterId) => {
        return get().flashcards[`${courseId}-${chapterId}`] || [];
      },
      
      getFlashcardsForCourse: (courseId) => {
        return Object.entries(get().flashcards)
          .filter(([key]) => key.startsWith(`${courseId}-`))
          .flatMap(([_, cards]) => cards);
      },
      
      addTestQuestions: (courseId, chapterId, questions) => {
        set(state => ({
          testQuestions: {
            ...state.testQuestions,
            [`${courseId}-${chapterId}`]: questions.map((q, index) => ({
              ...q,
              id: `${courseId}-${chapterId}-${index}`
            }))
          }
        }));
      },
      
      getTestQuestionsForChapter: (courseId, chapterId) => {
        return get().testQuestions[`${courseId}-${chapterId}`] || [];
      },
      
      getTestQuestionsForCourse: (courseId) => {
        return Object.entries(get().testQuestions)
          .filter(([key]) => key.startsWith(`${courseId}-`))
          .flatMap(([_, questions]) => questions);
      }
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        flashcards: state.flashcards,
        testQuestions: state.testQuestions
      })
    }
  )
);
