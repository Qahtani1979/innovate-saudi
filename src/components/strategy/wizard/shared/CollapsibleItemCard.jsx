import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Standard Collapsible Item Card for wizard steps
 * Provides consistent expandable cards with progress indicators
 */
export function CollapsibleItemCard({
  isOpen,
  onToggle,
  onRemove,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  completeness = 0,
  badge,
  badgeVariant = 'secondary',
  isReadOnly = false,
  isDraggable = false,
  className,
  headerExtra,
  children
}) {
  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className={cn(
        "transition-all duration-200",
        isOpen && "ring-2 ring-primary/20",
        className
      )}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4">
            <div className="flex items-center gap-3">
              {/* Drag Handle */}
              {isDraggable && !isReadOnly && (
                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}

              {/* Icon */}
              {Icon && (
                <div className={cn("p-2 rounded-lg shrink-0", iconBg)}>
                  <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium truncate">{title || 'Untitled'}</h4>
                  {badge && (
                    <Badge variant={badgeVariant} className="shrink-0 text-xs">
                      {badge}
                    </Badge>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>

              {/* Header Extra Content */}
              {headerExtra}

              {/* Progress Indicator */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", getProgressColor(completeness))}
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{Math.round(completeness)}%</span>
                </div>

                {/* Remove Button */}
                {!isReadOnly && onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {/* Expand/Collapse Icon */}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

/**
 * Simple non-collapsible card with progress
 */
export function SimpleItemCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  completeness = 0,
  onRemove,
  isReadOnly = false,
  className,
  children
}) {
  const getProgressColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card className={cn("transition-all", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className={cn("p-2 rounded-lg shrink-0", iconBg)}>
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-medium truncate">{title || 'Untitled'}</h4>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all", getProgressColor(completeness))}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                {!isReadOnly && onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={onRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mb-2">{subtitle}</p>
            )}
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CollapsibleItemCard;
