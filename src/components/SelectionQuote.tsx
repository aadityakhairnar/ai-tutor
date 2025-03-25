
import React, { useEffect, useState } from 'react';

interface SelectionQuoteProps {
  onQuoteSelected: (selectedText: string) => void;
  containerRef: React.RefObject<HTMLElement>;
}

const SelectionQuote: React.FC<SelectionQuoteProps> = ({ onQuoteSelected, containerRef }) => {
  useEffect(() => {
    const checkSelection = () => {
      const selection = window.getSelection();
      
      if (selection && !selection.isCollapsed && containerRef.current?.contains(selection.anchorNode)) {
        const text = selection.toString().trim();
        
        if (text && text.length > 5) {  // Only trigger for meaningful selections (more than 5 chars)
          onQuoteSelected(text);
        }
      }
    };

    // Detect text selection
    document.addEventListener('mouseup', checkSelection);
    document.addEventListener('touchend', checkSelection);
    
    return () => {
      document.removeEventListener('mouseup', checkSelection);
      document.removeEventListener('touchend', checkSelection);
    };
  }, [containerRef, onQuoteSelected]);

  // This component no longer renders any UI
  return null;
};

export default SelectionQuote;
