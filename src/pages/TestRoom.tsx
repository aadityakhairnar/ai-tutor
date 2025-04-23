
import { useState } from 'react';
import { TestTube, Clock, ChevronRight } from 'lucide-react';
import { Chapter } from '@/store/useStore';
import { useCourseData } from '@/hooks/useCourseData';
import EmptyState from '@/components/EmptyState';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import TestModal from '@/components/TestModal';

const TestRoom = () => {
  const { courses } = useCourseData();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);

  // Filter courses that are either completed or ongoing
  const availableCourses = courses.filter(
    course => course.status === 'completed' || course.status === 'ongoing'
  );

  const handleTestNow = (course) => {
    setSelectedCourse(course);
    setSelectedChapter(null);
    setIsTestModalOpen(true);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsGeneratingTest(true);
    // This would normally trigger test generation
    setTimeout(() => setIsGeneratingTest(false), 1000);
  };

  return (
    <PageTransition>
      <div className="page-content">
        <h1 className="font-display text-4xl">Test Room</h1>
        <p className="text-muted-foreground max-w-2xl mb-8">
          Challenge yourself with quizzes and assessments to test your knowledge.
        </p>
        
        {availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map(course => (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      {course.chapters?.filter(ch => ch.completed).length || 0} of {course.chapters?.length || 0} chapters completed
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                  <Button 
                    onClick={() => handleTestNow(course)}
                    className="w-full"
                  >
                    Test Now <TestTube className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<TestTube className="w-full h-full" />}
            title="No courses to test"
            description="Complete or start learning some courses to begin testing your knowledge."
            action={
              <Link to="/classroom">
                <Button>Go to Classroom</Button>
              </Link>
            }
          />
        )}
      </div>

      {selectedCourse && (
        <TestModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          course={selectedCourse}
          selectedChapter={selectedChapter}
          onChapterSelect={handleChapterSelect}
          isGenerating={isGeneratingTest}
        />
      )}
    </PageTransition>
  );
};

export default TestRoom;
