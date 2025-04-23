import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  content: string;
  completed: boolean;
}

export interface Flashcard {
  id: string;
  chapterId: string;
  front: string;
  back: string;
}

export interface TestQuestion {
  id: string;
  chapterId: string;
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
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  removeCourse: (courseId: string) => void;
  setActiveCourse: (course: Course | null) => void;
  setSyllabus: (syllabus: StoreState['syllabus']) => void;
  markChapterCompleted: (courseId: string, chapterId: string, completed: boolean) => void;
  updateCourseStatus: (courseId: string, status: CourseStatus) => void;
  updateChapterContent: (courseId: string, chapterId: string, content: string) => void;
  getChapterContent: (courseId: string, chapterId: string) => string;
  getNextChapter: (courseId: string, currentChapterId: string) => Chapter | null;
  getPreviousChapter: (courseId: string, currentChapterId: string) => Chapter | null;
  addFlashcards: (courseId: string, chapterId: string, flashcards: Omit<Flashcard, 'id'>[]) => void;
  getFlashcardsForChapter: (courseId: string, chapterId: string) => Flashcard[];
  getFlashcardsForCourse: (courseId: string) => Flashcard[];
  addTestQuestions: (courseId: string, chapterId: string, questions: Omit<TestQuestion, 'id'>[]) => void;
  getTestQuestionsForChapter: (courseId: string, chapterId: string) => TestQuestion[];
  getTestQuestionsForCourse: (courseId: string) => TestQuestion[];
}

const sampleCourses: Course[] = [
  // Removed placeholder courses
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      courses: [],
      activeCourse: null,
      syllabus: null,
      flashcards: {},
      testQuestions: {},
      
      addCourse: (course) => set((state) => ({ 
        courses: [...state.courses, course] 
      })),
      
      updateCourse: (courseId, updates) => set((state) => ({ 
        courses: state.courses.map(course => 
          course.id === courseId ? { ...course, ...updates, updatedAt: new Date().toISOString() } : course
        ) 
      })),
      
      removeCourse: (courseId) => set((state) => ({ 
        courses: state.courses.filter(course => course.id !== courseId) 
      })),
      
      setActiveCourse: (course) => set({ activeCourse: course }),
      
      setSyllabus: (syllabus) => set({ syllabus }),
      
      markChapterCompleted: (courseId, chapterId, completed) => set((state) => {
        const updatedCourses = state.courses.map(course => {
          if (course.id === courseId && course.chapters) {
            const updatedChapters = course.chapters.map(chapter => 
              chapter.id === chapterId ? { ...chapter, completed } : chapter
            );
            
            const totalChapters = updatedChapters.length;
            const completedChapters = updatedChapters.filter(ch => ch.completed).length;
            const newProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
            
            return {
              ...course,
              chapters: updatedChapters,
              progress: newProgress,
              updatedAt: new Date().toISOString()
            };
          }
          return course;
        });
        
        return { courses: updatedCourses };
      }),
      
      updateCourseStatus: (courseId, status) => set((state) => ({
        courses: state.courses.map(course => 
          course.id === courseId 
            ? { ...course, status, updatedAt: new Date().toISOString() } 
            : course
        )
      })),
      
      updateChapterContent: (courseId, chapterId, content) => set((state) => {
        const updatedCourses = state.courses.map(course => {
          if (course.id === courseId && course.chapters) {
            const updatedChapters = course.chapters.map(chapter => 
              chapter.id === chapterId ? { ...chapter, content } : chapter
            );
            
            return {
              ...course,
              chapters: updatedChapters,
              updatedAt: new Date().toISOString()
            };
          }
          return course;
        });
        
        return { courses: updatedCourses };
      }),
      
      getChapterContent: (courseId, chapterId) => {
        const state = get();
        const course = state.courses.find(c => c.id === courseId);
        const chapter = course?.chapters?.find(ch => ch.id === chapterId);
        return chapter?.content || '';
      },
      
      getNextChapter: (courseId, currentChapterId) => {
        const state = get();
        const course = state.courses.find(c => c.id === courseId);
        
        if (!course?.chapters?.length) return null;
        
        const currentIndex = course.chapters.findIndex(ch => ch.id === currentChapterId);
        if (currentIndex < 0 || currentIndex >= course.chapters.length - 1) return null;
        
        return course.chapters[currentIndex + 1];
      },
      
      getPreviousChapter: (courseId, currentChapterId) => {
        const state = get();
        const course = state.courses.find(c => c.id === courseId);
        
        if (!course?.chapters?.length) return null;
        
        const currentIndex = course.chapters.findIndex(ch => ch.id === currentChapterId);
        if (currentIndex <= 0) return null;
        
        return course.chapters[currentIndex - 1];
      },
      
      addFlashcards: (courseId, chapterId, newFlashcards) => set((state) => {
        const courseFlashcards = state.flashcards[courseId] || [];
        const flashcardsWithIds = newFlashcards.map((card, index) => ({
          ...card,
          id: `${courseId}-${chapterId}-${Date.now()}-${index}`,
          chapterId
        }));
        
        return {
          flashcards: {
            ...state.flashcards,
            [courseId]: [...courseFlashcards, ...flashcardsWithIds]
          }
        };
      }),
      
      getFlashcardsForChapter: (courseId, chapterId) => {
        const state = get();
        const courseFlashcards = state.flashcards[courseId] || [];
        return courseFlashcards.filter(card => card.chapterId === chapterId);
      },
      
      getFlashcardsForCourse: (courseId) => {
        const state = get();
        return state.flashcards[courseId] || [];
      },
      
      addTestQuestions: (courseId, chapterId, newQuestions) => set((state) => {
        const courseQuestions = state.testQuestions[courseId] || [];
        const questionsWithIds = newQuestions.map((question, index) => ({
          ...question,
          id: `${courseId}-${chapterId}-${Date.now()}-${index}`,
          chapterId
        }));
        
        return {
          testQuestions: {
            ...state.testQuestions,
            [courseId]: [...courseQuestions, ...questionsWithIds]
          }
        };
      }),
      
      getTestQuestionsForChapter: (courseId, chapterId) => {
        const state = get();
        const courseQuestions = state.testQuestions[courseId] || [];
        return courseQuestions.filter(question => question.chapterId === chapterId);
      },
      
      getTestQuestionsForCourse: (courseId) => {
        const state = get();
        return state.testQuestions[courseId] || [];
      },
    }),
    {
      name: 'acampus-storage',
      partialize: (state) => ({ 
        courses: state.courses,
        flashcards: state.flashcards,
        testQuestions: state.testQuestions
      }),
    }
  )
);
