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
  content?: string;
  completed: boolean;
  position: number;
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
  activeCourse: Course | null;
  syllabus: {
    id: string;
    topic: string;
    chapters: Chapter[];
    loading: boolean;
  } | null;
  flashcards: Record<string, Flashcard[]>;
  testQuestions: Record<string, TestQuestion[]>;
  setActiveCourse: (course: Course | null) => void;
  setSyllabus: (syllabus: StoreState['syllabus']) => void;
  addFlashcards: (courseId: string, chapterId: string, flashcards: Omit<Flashcard, 'id'>[]) => void;
  getFlashcardsForChapter: (courseId: string, chapterId: string) => Flashcard[];
  getFlashcardsForCourse: (courseId: string) => Flashcard[];
  addTestQuestions: (courseId: string, chapterId: string, questions: Omit<TestQuestion, 'id'>[]) => void;
  getTestQuestionsForChapter: (courseId: string, chapterId: string) => TestQuestion[];
  getTestQuestionsForCourse: (courseId: string) => TestQuestion[];
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      activeCourse: null,
      syllabus: null,
      flashcards: {},
      testQuestions: {},
      
      setActiveCourse: (course) => set({ activeCourse: course }),
      setSyllabus: (syllabus) => set({ syllabus }),
      
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
        flashcards: state.flashcards,
        testQuestions: state.testQuestions
      }),
    }
  )
);
