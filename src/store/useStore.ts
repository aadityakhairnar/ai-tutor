
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'
import { Session } from '@supabase/supabase-js'

export type CourseStatus = 'completed' | 'ongoing' | 'planned'

export interface Course {
  id: string
  title: string
  description: string
  status: CourseStatus
  progress: number
  createdAt: string
  updatedAt: string
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  content: string
  completed: boolean
}

interface SyllabusData {
  id: string
  topic: string
  chapters: Chapter[]
  loading: boolean
}

interface StoreState {
  courses: Course[]
  loading: boolean
  session: Session | null
  fetchUserCourses: () => Promise<void>
  setSession: (session: Session | null) => void
  markCourseAsDone: (courseId: string) => Promise<void>
  removeCourse: (courseId: string) => void
  // Add missing functions
  updateCourse: (courseId: string, updates: Partial<Course>) => void
  markChapterCompleted: (courseId: string, chapterId: string, completed: boolean) => void
  updateChapterContent: (courseId: string, chapterId: string, content: string) => void
  getNextChapter: (courseId: string, currentChapterId: string) => Chapter | null
  getPreviousChapter: (courseId: string, currentChapterId: string) => Chapter | null
  setSyllabus: (data: SyllabusData) => void
  addCourse: (course: Course) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      courses: [],
      loading: false,
      session: null,
      fetchUserCourses: async () => {
        set({ loading: true })
        const { session } = get()
        if (!session) {
          set({ courses: [], loading: false })
          return
        }
        // Get done_courses for this user and join with course info
        let { data: doneData, error } = await supabase
          .from('done_courses')
          .select('*')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false })
        if (error) {
          set({ courses: [], loading: false })
          return
        }
        // Here you'd usually join with a "courses" table. For now, just mock some static details.
        const courses: Course[] =
          doneData?.map((done) => ({
            id: done.course_id,
            title: `Course #${done.course_id}`,
            description: 'Course description for demo.',
            status: 'completed' as CourseStatus,
            progress: 100,
            createdAt: done.completed_at,
            updatedAt: done.completed_at,
            chapters: [],
          })) || []
        set({ courses, loading: false })
      },
      setSession: (session) => set({ session }),
      markCourseAsDone: async (courseId: string) => {
        const { session, fetchUserCourses } = get()
        if (!session) return
        await supabase.from('done_courses').insert([
          { user_id: session.user.id, course_id: courseId },
        ])
        fetchUserCourses()
      },
      removeCourse: (courseId: string) => {
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== courseId),
        }))
      },
      // Implement missing functions
      updateCourse: (courseId: string, updates: Partial<Course>) => {
        set((state) => ({
          courses: state.courses.map(course =>
            course.id === courseId ? { ...course, ...updates } : course
          ),
        }))
      },
      markChapterCompleted: (courseId: string, chapterId: string, completed: boolean) => {
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                chapters: course.chapters?.map(chapter => 
                  chapter.id === chapterId ? { ...chapter, completed } : chapter
                ),
                progress: completed 
                  ? calculateProgress([...(course.chapters || []).map(ch => 
                      ch.id === chapterId ? { ...ch, completed: true } : ch
                    )])
                  : calculateProgress([...(course.chapters || []).map(ch => 
                      ch.id === chapterId ? { ...ch, completed: false } : ch
                    )])
              }
            }
            return course
          })
        }))
      },
      updateChapterContent: (courseId: string, chapterId: string, content: string) => {
        set((state) => ({
          courses: state.courses.map(course => {
            if (course.id === courseId) {
              return {
                ...course,
                chapters: course.chapters?.map(chapter => 
                  chapter.id === chapterId ? { ...chapter, content } : chapter
                )
              }
            }
            return course
          })
        }))
      },
      getNextChapter: (courseId: string, currentChapterId: string) => {
        const { courses } = get()
        const course = courses.find(c => c.id === courseId)
        if (!course || !course.chapters) return null
        
        const currentIndex = course.chapters.findIndex(ch => ch.id === currentChapterId)
        if (currentIndex === -1 || currentIndex >= course.chapters.length - 1) return null
        
        return course.chapters[currentIndex + 1]
      },
      getPreviousChapter: (courseId: string, currentChapterId: string) => {
        const { courses } = get()
        const course = courses.find(c => c.id === courseId)
        if (!course || !course.chapters) return null
        
        const currentIndex = course.chapters.findIndex(ch => ch.id === currentChapterId)
        if (currentIndex <= 0) return null
        
        return course.chapters[currentIndex - 1]
      },
      setSyllabus: (data: SyllabusData) => {
        // This function doesn't modify state directly,
        // but would be used when generating a syllabus
      },
      addCourse: (course: Course) => {
        set((state) => ({
          courses: [...state.courses, course]
        }))
      }
    }),
    {
      name: 'acampus-storage-v2', // Updated to a new version
      partialize: (state) => ({
        courses: state.courses,
        session: state.session,
      }),
    }
  )
)

// Helper function to calculate course progress
function calculateProgress(chapters: Chapter[]): number {
  if (!chapters || chapters.length === 0) return 0
  const completedChapters = chapters.filter(ch => ch.completed).length
  return Math.round((completedChapters / chapters.length) * 100)
}
