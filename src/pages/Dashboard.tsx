
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, PenLine, GraduationCap, TestTube } from 'lucide-react'
import { useStore } from '@/store/useStore'
import CourseCard from '@/components/CourseCard'
import EmptyState from '@/components/EmptyState'
import PageTransition from '@/components/PageTransition'
import { Button } from '@/components/ui/button'

const Dashboard = () => {
  const { courses, fetchUserCourses, session } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect unauthenticated users
    if (session === null) navigate("/auth")
  }, [session, navigate])

  useEffect(() => {
    if (session) fetchUserCourses()
  }, [session, fetchUserCourses])

  return (
    <PageTransition>
      <div className="page-content">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl">Your Learning Journey</h1>
            <p className="text-muted-foreground max-w-2xl">
              Track your progress, continue learning, or discover new topics to explore.
            </p>
          </div>
        </div>

        <section className="mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-2xl font-display mb-0">Learning Paths</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/classroom">
              <motion.div
                className="book-cover flex items-center h-36 rounded-md"
                whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.2)' }}
              >
                <div className="flex flex-col items-start">
                  <h3 className="text-xl mb-1 font-display font-medium">Classroom</h3>
                  <p className="text-book-title/90 text-sm mb-3">Discover and learn new topics</p>
                  <div className="flex items-center text-xs">
                    <span>Explore now</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
                <div className="ml-auto">
                  <PenLine className="w-10 h-10 opacity-80" />
                </div>
              </motion.div>
            </Link>

            <Link to="/reviseroom">
              <motion.div
                className="book-cover flex items-center h-36 rounded-md"
                whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.2)' }}
              >
                <div className="flex flex-col items-start">
                  <h3 className="text-xl mb-1 font-display font-medium">Revise Room</h3>
                  <p className="text-book-title/90 text-sm mb-3">Review and solidify your knowledge</p>
                  <div className="flex items-center text-xs">
                    <span>Review now</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
                <div className="ml-auto">
                  <GraduationCap className="w-10 h-10 opacity-80" />
                </div>
              </motion.div>
            </Link>

            <Link to="/testroom">
              <motion.div
                className="book-cover flex items-center h-36 rounded-md"
                whileHover={{ y: -5, boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.2)' }}
              >
                <div className="flex flex-col items-start">
                  <h3 className="text-xl mb-1 font-display font-medium">Test Room</h3>
                  <p className="text-book-title/90 text-sm mb-3">Test your knowledge with quizzes</p>
                  <div className="flex items-center text-xs">
                    <span>Start testing</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
                <div className="ml-auto">
                  <TestTube className="w-10 h-10 opacity-80" />
                </div>
              </motion.div>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <h2 className="text-2xl font-display mb-0">Your Courses</h2>
          </div>

          {courses.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
            >
              {courses.map(course => (
                <motion.div key={course.id}>
                  <CourseCard
                    course={course}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={<BookOpen className="w-full h-full" />}
              title="No courses found"
              description={`You don't have any completed courses yet.`}
              action={
                <Link to="/classroom">
                  <Button>Find new topics to learn</Button>
                </Link>
              }
            />
          )}
        </section>
      </div>
    </PageTransition>
  )
}

export default Dashboard
