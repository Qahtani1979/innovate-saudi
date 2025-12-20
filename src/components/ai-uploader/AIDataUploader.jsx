/**
 * AI-Powered Data Uploader - Main Component
 * Guided wizard with full file support and AI-enhanced validation
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, Brain, CheckCircle, AlertTriangle, Sparkles, X
} from 'lucide-react';
import { toast } from 'sonner';

import StepFileUpload from './steps/StepFileUpload';
import StepEntityDetection from './steps/StepEntityDetection';
import StepFieldMapping from './steps/StepFieldMapping';
import StepValidation from './steps/StepValidation';
import StepReview from './steps/StepReview';
import StepImport from './steps/StepImport';

const STEPS = [
  { id: 'upload', title: 'Upload File', icon: Upload, description: 'Upload your data file' },
  { id: 'detect', title: 'Entity Detection', icon: Brain, description: 'AI detects entity type' },
  { id: 'mapping', title: 'Field Mapping', icon: FileText, description: 'Map columns to fields' },
  { id: 'validation', title: 'Validation', icon: AlertTriangle, description: 'Validate & enrich data' },
  { id: 'review', title: 'Review', icon: CheckCircle, description: 'Review changes' },
  { id: 'import', title: 'Import', icon: Sparkles, description: 'Import data' }
];

export default function AIDataUploader({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadState, setUploadState] = useState({
    file: null,
    fileType: null,
    extractedData: null,
    detectedEntity: null,
    entityConfidence: 0,
    fieldMappings: {},
    validationResults: null,
    enrichedData: null,
    importResults: null
  });

  const updateState = useCallback((updates) => {
    setUploadState(prev => ({ ...prev, ...updates }));
  }, []);

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback((results) => {
    toast.success(`Successfully imported ${results?.inserted || 0} records`);
    onComplete?.(results);
  }, [onComplete]);

  const renderStep = () => {
    const stepProps = {
      state: uploadState,
      updateState,
      onNext: goNext,
      onBack: goBack
    };

    switch (STEPS[currentStep].id) {
      case 'upload':
        return <StepFileUpload {...stepProps} />;
      case 'detect':
        return <StepEntityDetection {...stepProps} />;
      case 'mapping':
        return <StepFieldMapping {...stepProps} />;
      case 'validation':
        return <StepValidation {...stepProps} />;
      case 'review':
        return <StepReview {...stepProps} />;
      case 'import':
        return <StepImport {...stepProps} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Data Uploader
            </CardTitle>
            <CardDescription>
              Upload any file - AI will extract, map, validate and import your data
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mt-4 overflow-x-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div 
                key={step.id}
                className={`flex flex-col items-center gap-1 min-w-[80px] ${
                  isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                  ${isActive ? 'border-primary bg-primary/10' : 
                    isCompleted ? 'border-green-600 bg-green-50' : 'border-muted'}
                `}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium text-center">{step.title}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {/* Current Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
      </CardContent>
    </Card>
  );
}
