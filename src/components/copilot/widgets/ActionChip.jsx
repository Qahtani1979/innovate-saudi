import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

/**
 * A small pill-shaped button representing a suggested action.
 * Used in "Typeahead" or "Next Steps".
 */
export function ActionChip({
    label,
    icon: Icon = Sparkles,
    onClick,
    className
}) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={cn(
                "rounded-full h-8 px-3 text-xs font-medium border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all",
                className
            )}
        >
            <Icon className="w-3.5 h-3.5 mr-1.5 text-primary" />
            {label}
        </Button>
    );
}
