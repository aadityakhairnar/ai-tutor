
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

interface StoreState {
  courses: Course[]
  loading: boolean
  session: Session | null
  fetchUserCourses: () => Promise<void>
  setSession: (session: Session | null) => void
  markCourseAsDone: (courseId: string) => Promise<void>
  removeCourse: (courseId: string) => void
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
            status: 'completed',
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
