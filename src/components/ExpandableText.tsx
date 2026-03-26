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
          {/* ACCESIBILIDAD [CONTRASTE]: text-primary (#DB1F54) no pasa WCAG AA sobre fondos oscuros (ratio 3.82:1).
              Se usa #FF4D7A (ratio ~5.2:1) para cumplir el mínimo de 4.5:1. */}
          className="text-xs text-[#FF4D7A] hover:text-[#FF4D7A]/80 font-medium transition-colors"
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
});

ExpandableText.displayName = 'ExpandableText';
