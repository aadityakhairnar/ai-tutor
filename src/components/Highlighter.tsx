
import React, { useEffect, useRef } from 'react';

interface HighlighterProps {
  containerRef: React.RefObject<HTMLElement>;
  isActive: boolean;
}

const Highlighter: React.FC<HighlighterProps> = ({ containerRef, isActive }) => {
  const highlightClass = 'bg-amber-200 dark:bg-amber-700/70';
  
  useEffect(() => {
    const handleMouseUp = () => {
      if (!isActive || !containerRef.current) return;
      
      const selection = window.getSelection();
      
      if (selection && !selection.isCollapsed && containerRef.current.contains(selection.anchorNode)) {
        // Persist the selection for highlighting
        const range = selection.getRangeAt(0);
        
        if (range) {
          // Create a temp span to wrap the selection
          const span = document.createElement('span');
          span.className = highlightClass;
          
          try {
            range.surroundContents(span);
            selection.removeAllRanges(); // Clear selection after highlighting
          } catch (e) {
            console.error("Couldn't highlight due to DOM structure", e);
            // This can happen when selection crosses multiple DOM nodes
            // A more complex solution would be needed for those cases
          }
        }
      }
    };

    // Add and remove event listeners
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isActive, containerRef, highlightClass]);

  // This component doesn't render anything visible
  return null;
};

export default Highlighter;
