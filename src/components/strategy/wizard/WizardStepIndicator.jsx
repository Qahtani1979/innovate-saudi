import { CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../../LanguageContext';

export default function WizardStepIndicator({ steps, currentStep, onStepClick }) {
  const { language, t } = useLanguage();
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t({ en: `Step ${currentStep} of ${steps.length}`, ar: `الخطوة ${currentStep} من ${steps.length}` })}
        </p>
        <Badge variant="outline" className="text-xs">
          {Math.round(progress)}% {t({ en: 'Complete', ar: 'مكتمل' })}
        </Badge>
      </div>
      <Progress value={progress} className="h-2" />
      
      {/* Step indicators - hidden on mobile, horizontal scroll on tablet, wrap on desktop */}
      <div className="hidden md:flex flex-wrap justify-between gap-1 overflow-x-auto pb-2">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          const isClickable = step.num <= currentStep || isCompleted;
          
          return (
            <button
              key={step.num}
              onClick={() => isClickable && onStepClick?.(step.num)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1 flex-1 min-w-[50px] max-w-[80px] transition-all ${
                isActive ? 'opacity-100 scale-105' : isCompleted ? 'opacity-80' : 'opacity-40'
              } ${isClickable ? 'cursor-pointer hover:opacity-100' : 'cursor-not-allowed'}`}
            >
              <div className={`h-8 w-8 lg:h-10 lg:w-10 rounded-full flex items-center justify-center transition-colors ${
                isCompleted ? 'bg-green-600 text-white' :
                isActive ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5" /> : <StepIcon className="h-4 w-4 lg:h-5 lg:w-5" />}
              </div>
              <p className="text-[10px] lg:text-xs text-center font-medium line-clamp-2">
                {step.title[language]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Mobile: Show only current step info */}
      <div className="md:hidden flex items-center justify-center gap-2 py-2">
        {(() => {
          const currentStepData = steps.find(s => s.num === currentStep);
          const StepIcon = currentStepData?.icon;
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {StepIcon && <StepIcon className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">{currentStepData?.title[language]}</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
