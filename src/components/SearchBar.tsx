import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <div className="container px-4 py-8">
      <div className="relative max-w-2xl mx-auto">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-secondary/40 rounded-full blur-xl" />
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
          <Input
            type="text"
            placeholder="🔍 Buscar por nombre o ingrediente…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-12 pr-12 h-14 bg-card/80 backdrop-blur-sm border-2 border-primary/30 focus:border-primary text-foreground text-lg placeholder:text-muted-foreground rounded-full shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
