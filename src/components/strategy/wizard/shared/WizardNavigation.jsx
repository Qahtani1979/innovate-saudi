import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * WizardNavigation - Reusable navigation component for wizard steps
 * Can be placed at top or bottom of wizard
 */
export function WizardNavigation({
  currentStep,
  totalSteps = 18,
  onBack,
  onNext,
  onSave,
  isSaving = false,
  isReviewMode = false,
  showProgress = true,
  showSave = true,
  compact = false,
  language = 'en',
  className
}) {
  const progress = (currentStep / totalSteps) * 100;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const t = (obj) => language === 'ar' ? obj.ar : obj.en;

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between gap-4", className)}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          disabled={isFirstStep}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          {t({ en: 'Back', ar: 'السابق' })}
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {currentStep}/{totalSteps}
          </Badge>
          {showProgress && (
            <Progress value={progress} className="w-20 h-1.5" />
          )}
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onNext} 
          disabled={isLastStep}
          className="gap-1"
        >
          {t({ en: 'Next', ar: 'التالي' })}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <Button 
        variant="outline" 
        onClick={onBack} 
        disabled={isFirstStep}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        {t({ en: 'Back', ar: 'السابق' })}
      </Button>

      <div className="flex items-center gap-3">
        {showProgress && (
          <>
            <span className="text-sm text-muted-foreground">
              {t({ en: 'Step', ar: 'خطوة' })} {currentStep} / {totalSteps}
            </span>
            <Progress value={progress} className="w-32 h-2" />
            <Badge variant={progress >= 80 ? 'default' : 'secondary'}>
              {Math.round(progress)}%
            </Badge>
          </>
        )}
      </div>

      <div className="flex gap-2">
        {showSave && !isReviewMode && (
          <Button 
            variant="outline" 
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Save', ar: 'حفظ' })}
          </Button>
        )}
        
        {!isLastStep && (
          <Button onClick={onNext}>
            {t({ en: 'Next', ar: 'التالي' })}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * CompactStepIndicator - Minimal step indicator for top of wizard
 */
export function CompactStepIndicator({
  currentStep,
  totalSteps = 18,
  stepTitle,
  onBack,
  onNext,
  language = 'en',
  className
}) {
  const progress = (currentStep / totalSteps) * 100;
  const t = (obj) => language === 'ar' ? obj.ar : obj.en;

  return (
    <div className={cn(
      "flex items-center justify-between p-3 bg-muted/30 rounded-lg border",
      className
    )}>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onBack} 
        disabled={currentStep === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex-1 mx-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">
            {t({ en: 'Step', ar: 'خطوة' })} {currentStep}/{totalSteps}
          </span>
          {stepTitle && (
            <span className="text-sm font-medium truncate max-w-[200px]">
              {typeof stepTitle === 'object' ? stepTitle[language] : stepTitle}
            </span>
          )}
          <span className="text-xs font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <Button 
        variant="ghost" 
        size="icon"
        onClick={onNext} 
        disabled={currentStep === totalSteps}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default WizardNavigation;
