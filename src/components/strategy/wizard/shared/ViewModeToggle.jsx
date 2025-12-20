import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Grid3X3, BarChart3, FileText } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Standard View Mode Toggle for wizard steps
 * Provides consistent switching between Cards, List, Matrix, and Summary views
 */

const VIEW_MODE_ICONS = {
  cards: LayoutGrid,
  list: List,
  matrix: Grid3X3,
  summary: BarChart3,
  phases: FileText,
  timeline: List,
  grid: Grid3X3,
};

const VIEW_MODE_LABELS = {
  cards: { en: 'Cards', ar: 'بطاقات' },
  list: { en: 'List', ar: 'قائمة' },
  matrix: { en: 'Matrix', ar: 'مصفوفة' },
  summary: { en: 'Summary', ar: 'ملخص' },
  phases: { en: 'Phases', ar: 'مراحل' },
  timeline: { en: 'Timeline', ar: 'جدول زمني' },
  grid: { en: 'Grid', ar: 'شبكة' },
};

export function ViewModeToggle({ 
  value, 
  onChange, 
  options = ['cards', 'list', 'summary'],
  language = 'en',
  size = 'sm',
  className 
}) {
  return (
    <div className={cn("flex border rounded-lg overflow-hidden bg-muted/30", className)}>
      {options.map((mode) => {
        const Icon = VIEW_MODE_ICONS[mode] || LayoutGrid;
        const label = VIEW_MODE_LABELS[mode]?.[language] || mode;
        const isActive = value === mode;

        return (
          <Button
            key={mode}
            variant={isActive ? 'secondary' : 'ghost'}
            size={size}
            onClick={() => onChange(mode)}
            className={cn(
              "rounded-none gap-1.5 flex-1 min-w-0",
              isActive && "bg-background shadow-sm"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline text-xs truncate">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}

export default ViewModeToggle;
