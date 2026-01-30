import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export const ExpandableText = memo(({ text, maxLines = 2, className }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        // Compare scrollHeight with clientHeight to detect truncation
        setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
      }
    };

    checkTruncation();
    
    // Recheck on window resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text]);

  if (!text) {
    return <p className={cn("text-xs text-muted-foreground", className)}>&nbsp;</p>;
  }

  const lineClampClass = maxLines === 2 ? 'line-clamp-2' : maxLines === 3 ? 'line-clamp-3' : 'line-clamp-2';

  return (
    <div className="space-y-1">
      <p 
        ref={textRef}
        className={cn(
          "text-xs text-muted-foreground leading-relaxed whitespace-normal transition-all duration-200",
          !isExpanded && lineClampClass,
          className
        )}
      >
        {text}
      </p>
      {isTruncated && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
});

ExpandableText.displayName = 'ExpandableText';
