import { CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../../LanguageContext';

export default function WizardStepIndicator({ steps, currentStep, onStepClick }) {
  const { language, t } = useLanguage();
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {t({ en: `Step ${currentStep} of ${steps.length}`, ar: `الخطوة ${currentStep} من ${steps.length}` })}
        </p>
        <Badge variant="outline">
          {Math.round(progress)}% {t({ en: 'Complete', ar: 'مكتمل' })}
        </Badge>
      </div>
      <Progress value={progress} className="h-2" />
      
      {/* Step indicators - horizontal on desktop, wrap on mobile */}
      <div className="flex flex-wrap justify-center md:justify-between gap-2 md:gap-1">
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
              className={`flex flex-col items-center gap-1 flex-1 min-w-[60px] max-w-[100px] transition-all ${
                isActive ? 'opacity-100 scale-105' : isCompleted ? 'opacity-80' : 'opacity-40'
              } ${isClickable ? 'cursor-pointer hover:opacity-100' : 'cursor-not-allowed'}`}
            >
              <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                isCompleted ? 'bg-green-600 text-white' :
                isActive ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
              </div>
              <p className="text-xs text-center font-medium line-clamp-2">
                {step.title[language]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
