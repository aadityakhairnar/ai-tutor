
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';

interface SelectionQuoteProps {
  onQuoteSelected: (selectedText: string) => void;
  containerRef: React.RefObject<HTMLElement>;
}

const SelectionQuote: React.FC<SelectionQuoteProps> = ({ onQuoteSelected, containerRef }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkSelection = () => {
      const selection = window.getSelection();
      
      if (selection && !selection.isCollapsed && containerRef.current?.contains(selection.anchorNode)) {
        const text = selection.toString().trim();
        
        if (text) {
          setSelectedText(text);
          
          // Get the selection rectangle and position the button
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          setPosition({
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX
          });
          
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    };

    // Detect text selection
    document.addEventListener('mouseup', checkSelection);
    document.addEventListener('touchend', checkSelection);
    
    // Hide the button when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (isVisible && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', checkSelection);
      document.removeEventListener('touchend', checkSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, containerRef]);

  const handleQuoteClick = () => {
    onQuoteSelected(selectedText);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 50,
      }}
    >
      <Button
        ref={buttonRef}
        variant="secondary"
        size="sm"
        className="shadow-md rounded-full"
        onClick={handleQuoteClick}
      >
        <Quote className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SelectionQuote;
