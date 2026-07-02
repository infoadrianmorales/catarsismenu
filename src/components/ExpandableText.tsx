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
    // [2026-07-02] Reserva 2 líneas también cuando no hay descripción para
    // que el precio + CTA queden alineados con las tarjetas que sí la tienen.
    return <p className={cn("text-xs text-muted-foreground min-h-[2rem]", className)}>&nbsp;</p>;
  }

  const lineClampClass = maxLines === 2 ? 'line-clamp-2' : maxLines === 3 ? 'line-clamp-3' : 'line-clamp-2';

  return (
    <div className="space-y-1">
      {/* [2026-07-02] min-h-[2rem] reserva SIEMPRE el espacio de 2 líneas
          (~text-xs leading-relaxed) para que el CTA "AGREGAR AL CARRITO"
          quede a la misma altura entre tarjetas vecinas. */}
      <p 
        ref={textRef}
        className={cn(
          "text-xs text-muted-foreground leading-relaxed whitespace-normal transition-all duration-200 min-h-[2rem]",
          !isExpanded && lineClampClass,
          className
        )}
      >
        {text}
      </p>
      {/* [2026-06-05] ALINEACIÓN: reservar siempre el espacio de "Ver más" para igualar alturas entre tarjetas */}
      {isTruncated ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          // ACCESIBILIDAD [CONTRASTE]: #FF4D7A (ratio ~5.2:1) reemplaza text-primary (#DB1F54, ratio 3.82:1)
          className="text-xs text-[#FF4D7A] hover:text-[#FF4D7A]/80 font-medium transition-colors"
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      ) : (
        <span className="block text-xs font-medium opacity-0 select-none" aria-hidden="true">
          Ver más
        </span>
      )}
    </div>
  );
});

ExpandableText.displayName = 'ExpandableText';
