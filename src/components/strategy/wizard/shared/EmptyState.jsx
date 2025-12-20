import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

/**
 * Standard Empty State for wizard steps
 * Provides consistent placeholder when no data exists
 */
export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
  aiActionLabel,
  onAIAction,
  isGenerating = false,
  isReadOnly = false,
  language = 'en',
  className
}) {
  const defaultTitle = language === 'ar' ? 'لا توجد بيانات' : 'No data yet';
  const defaultDescription = language === 'ar' 
    ? 'أضف عنصرًا جديدًا للبدء'
    : 'Add a new item to get started';
  const defaultActionLabel = language === 'ar' ? 'إضافة' : 'Add New';
  const defaultAILabel = language === 'ar' ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI';

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted/50 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="font-semibold text-lg mb-1">
          {title || defaultTitle}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description || defaultDescription}
        </p>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          {!isReadOnly && onAction && (
            <Button onClick={onAction} className="gap-2">
              <Plus className="h-4 w-4" />
              {actionLabel || defaultActionLabel}
            </Button>
          )}

          {!isReadOnly && onAIAction && (
            <Button 
              variant="outline" 
              onClick={onAIAction}
              disabled={isGenerating}
              className="gap-2"
            >
              <Sparkles className={cn("h-4 w-4", isGenerating && "animate-spin")} />
              {aiActionLabel || defaultAILabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Compact empty state for inline use
 */
export function InlineEmptyState({
  message,
  actionLabel,
  onAction,
  isReadOnly = false,
  language = 'en',
  className
}) {
  const defaultMessage = language === 'ar' ? 'لا توجد عناصر' : 'No items';
  const defaultAction = language === 'ar' ? 'إضافة' : 'Add';

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 py-8 text-muted-foreground",
      className
    )}>
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">{message || defaultMessage}</span>
      {!isReadOnly && onAction && (
        <Button variant="link" size="sm" onClick={onAction} className="h-auto p-0">
          {actionLabel || defaultAction}
        </Button>
      )}
    </div>
  );
}

/**
 * Section empty state with icon
 */
export function SectionEmptyState({
  icon: Icon = FileText,
  title,
  subtitle,
  className
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 text-center",
      className
    )}>
      <Icon className="h-12 w-12 text-muted-foreground/30 mb-3" />
      {title && <p className="font-medium text-muted-foreground">{title}</p>}
      {subtitle && <p className="text-sm text-muted-foreground/70">{subtitle}</p>}
    </div>
  );
}

export default EmptyState;
