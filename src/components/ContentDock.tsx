import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, BookOpen, Highlighter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CourseMenu from '@/components/CourseMenu';
import { Chapter } from '@/store/useStore';

interface ContentDockProps {
  onOpenChat: () => void;
  onOpenSyllabus: () => void;
  courseTitle: string;
  chapters: Chapter[];
  activeChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  toggleHighlighter: () => void;
  isHighlighterActive: boolean;
}

const ContentDock: React.FC<ContentDockProps> = ({
  onOpenChat,
  onOpenSyllabus,
  courseTitle,
  chapters,
  activeChapterId,
  onSelectChapter,
  toggleHighlighter,
  isHighlighterActive
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Effect to handle clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMenu && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="fixed left-4 bottom-4 z-20 flex flex-col gap-2 items-center">
      <div className="flex flex-col gap-2 bg-card/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-border">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 hover:bg-primary/10"
          onClick={onOpenChat}
        >
          <HelpCircle className="h-5 w-5" />
          <span>Ask a Doubt</span>
        </Button>

        <Button
          ref={buttonRef}
          variant="ghost"
          size="sm"
          className="justify-start gap-2 hover:bg-primary/10"
          onClick={() => setShowMenu(!showMenu)}
        >
          <BookOpen className="h-5 w-5" />
          <span>Course Syllabus</span>
        </Button>

        <Button
          variant={isHighlighterActive ? "default" : "ghost"}
          size="sm"
          className={`justify-start gap-2 ${isHighlighterActive ? "bg-amber-500 hover:bg-amber-600" : "hover:bg-primary/10"}`}
          onClick={toggleHighlighter}
        >
          <Highlighter className="h-5 w-5" />
          <span>{isHighlighterActive ? "Disable Highlighter" : "Enable Highlighter"}</span>
        </Button>
      </div>

      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute bottom-16 left-0 bg-card rounded-lg shadow-lg border border-border animate-in fade-in slide-in-from-left-5 w-64"
        >
          <div className="p-3 border-b">
            <h3 className="font-medium">{courseTitle}</h3>
            <p className="text-xs text-muted-foreground">Course content</p>
          </div>
          <div className="max-h-[70vh] overflow-auto">
            <div className="p-2 space-y-1">
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => {
                    onSelectChapter(chapter.id);
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-start ${
                    activeChapterId === chapter.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}
                >
                  <span className="mr-2 font-medium">{index + 1}.</span>
                  <span className="flex-1">{chapter.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDock;
