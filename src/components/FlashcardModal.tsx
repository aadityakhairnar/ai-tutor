import { useState, useEffect } from 'react';
import { BookOpen, Loader2, X, ArrowLeft, ArrowRight, RotateCw, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Course, Chapter } from '@/store/useStore';
import { Card, CardContent } from '@/components/ui/card';
import { generateFlashcards } from '@/services/contentGenerator';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface FlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  selectedChapter: Chapter | null;
  onChapterSelect: (chapter: Chapter) => void;
  isGenerating: boolean;
}

type Flashcard = {
  id: number;
  front: string;
  back: string;
};

const FlashcardModal = ({ isOpen, onClose, course, selectedChapter, onChapterSelect, isGenerating }: FlashcardModalProps) => {
  const [view, setView] = useState<'chapters' | 'flashcards'>('chapters');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleSelectChapter = async (chapter: Chapter) => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    onChapterSelect(chapter);
    setLoading(true);
    try {
      const flashcardsData = await generateFlashcards(chapter.content || "", userId);
      
      const formattedFlashcards = flashcardsData.map((card, index) => ({
        id: index + 1,
        front: card.question,
        back: card.answer
      }));
      
      setFlashcards(formattedFlashcards);
      setCurrentFlashcard(0);
      setFlipped(false);
      setView('flashcards');
      toast.success(`Generated ${formattedFlashcards.length} flashcards for ${chapter.title}`);
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntireCourse = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      let allFlashcards: Flashcard[] = [];
      let index = 0;
      
      for (const chapter of course.chapters || []) {
        try {
          const chapterFlashcards = await generateFlashcards(chapter.content || "", userId);
          
          const formattedFlashcards = chapterFlashcards.map((card) => ({
            id: ++index,
            front: card.question,
            back: card.answer
          }));
          
          allFlashcards = [...allFlashcards, ...formattedFlashcards];
        } catch (error) {
          console.error(`Error generating flashcards for chapter ${chapter.title}:`, error);
        }
      }
      
      setFlashcards(allFlashcards);
      setCurrentFlashcard(0);
      setFlipped(false);
      setView('flashcards');
      toast.success(`Generated ${allFlashcards.length} flashcards for the entire course`);
    } catch (error) {
      console.error("Failed to generate flashcards for entire course:", error);
      toast.error('Failed to generate flashcards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
    if (currentFlashcard < flashcards.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(currentFlashcard - 1);
      setFlipped(false);
    }
  };

  const handleBackToChapters = () => {
    setView('chapters');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course.title} - Revision</DialogTitle>
          <DialogDescription>
            Select a chapter to revise or revise the entire course
          </DialogDescription>
        </DialogHeader>

        {view === 'chapters' ? (
          <>
            <div className="mb-4">
              <Button 
                variant="secondary" 
                className="w-full mb-4"
                onClick={handleSelectEntireCourse}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                Revise Entire Course
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Chapters</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {course.chapters?.map((chapter) => (
                    <TableRow key={chapter.id}>
                      <TableCell>{chapter.title}</TableCell>
                      <TableCell>{chapter.completed ? 'Completed' : 'In Progress'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSelectChapter(chapter)}
                          disabled={loading}
                        >
                          {loading && selectedChapter?.id === chapter.id ? 
                            <Loader2 className="h-4 w-4 animate-spin" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={handleBackToChapters}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chapters
              </Button>
              <div className="text-sm text-muted-foreground">
                {currentFlashcard + 1} of {flashcards.length}
              </div>
            </div>

            <div className="w-full h-80 relative">
              <Card 
                className={`w-full h-full flex items-center justify-center cursor-pointer transform transition-all duration-500 ${flipped ? 'rotate-y-180' : ''}`}
                onClick={handleFlip}
              >
                <CardContent className="p-6 text-center flex items-center justify-center h-full">
                  <div className={`absolute w-full h-full flex items-center justify-center p-6 backface-hidden ${flipped ? 'hidden' : 'block'}`}>
                    <h3 className="text-xl font-semibold">
                      {flashcards[currentFlashcard]?.front}
                    </h3>
                  </div>
                  <div className={`absolute w-full h-full flex items-center justify-center p-6 backface-hidden ${flipped ? 'block' : 'hidden'}`}>
                    <p>
                      {flashcards[currentFlashcard]?.back}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                Click to flip
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentFlashcard === 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleFlip}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleNext}
                disabled={currentFlashcard === flashcards.length - 1}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardModal;
