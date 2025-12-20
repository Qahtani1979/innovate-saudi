import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Lightbulb, RefreshCw, Wand2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '../../../LanguageContext';

/**
 * AIActionButton - Standardized AI action button for wizard steps
 * 
 * @param {Object} props
 * @param {Function} props.onGenerate - Callback when AI action is triggered
 * @param {boolean} props.isGenerating - Loading state
 * @param {boolean} props.isReadOnly - Disable interaction
 * @param {string} props.variant - Button variant: 'generate' | 'enhance' | 'suggest' | 'analyze'
 * @param {string} props.size - Button size: 'default' | 'sm' | 'lg' | 'icon'
 * @param {Object} props.label - Custom label { en: string, ar: string }
 * @param {string} props.context - What is being generated (for tooltip/label)
 * @param {string} props.className - Additional classes
 */
export function AIActionButton({
  onGenerate,
  isGenerating = false,
  isReadOnly = false,
  variant = 'generate',
  size = 'default',
  label,
  context,
  className,
  disabled = false,
  ...props
}) {
  const { t } = useLanguage();
  
  const variants = {
    generate: {
      icon: Sparkles,
      defaultLabel: { en: 'Generate with AI', ar: 'توليد بالذكاء الاصطناعي' },
      loadingLabel: { en: 'Generating...', ar: 'جاري التوليد...' },
      buttonVariant: 'default',
      iconColor: 'text-yellow-500'
    },
    enhance: {
      icon: Wand2,
      defaultLabel: { en: 'Enhance with AI', ar: 'تحسين بالذكاء الاصطناعي' },
      loadingLabel: { en: 'Enhancing...', ar: 'جاري التحسين...' },
      buttonVariant: 'outline',
      iconColor: 'text-purple-500'
    },
    suggest: {
      icon: Lightbulb,
      defaultLabel: { en: 'AI Suggestions', ar: 'اقتراحات الذكاء الاصطناعي' },
      loadingLabel: { en: 'Getting suggestions...', ar: 'جاري الحصول على الاقتراحات...' },
      buttonVariant: 'outline',
      iconColor: 'text-amber-500'
    },
    analyze: {
      icon: Bot,
      defaultLabel: { en: 'AI Analysis', ar: 'تحليل الذكاء الاصطناعي' },
      loadingLabel: { en: 'Analyzing...', ar: 'جاري التحليل...' },
      buttonVariant: 'secondary',
      iconColor: 'text-blue-500'
    },
    refresh: {
      icon: RefreshCw,
      defaultLabel: { en: 'Regenerate', ar: 'إعادة التوليد' },
      loadingLabel: { en: 'Regenerating...', ar: 'جاري إعادة التوليد...' },
      buttonVariant: 'ghost',
      iconColor: 'text-muted-foreground'
    }
  };
  
  const config = variants[variant] || variants.generate;
  const Icon = config.icon;
  
  const displayLabel = label || (context 
    ? { 
        en: `${config.defaultLabel.en.replace('with AI', '')} ${context}`, 
        ar: `${config.defaultLabel.ar.replace('بالذكاء الاصطناعي', '')} ${context}` 
      }
    : config.defaultLabel
  );
  
  const currentLabel = isGenerating ? config.loadingLabel : displayLabel;
  
  return (
    <Button
      variant={config.buttonVariant}
      size={size}
      onClick={onGenerate}
      disabled={isGenerating || isReadOnly || disabled}
      className={cn(
        'gap-2 transition-all',
        isGenerating && 'opacity-80',
        className
      )}
      {...props}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className={cn('h-4 w-4', config.iconColor)} />
      )}
      {size !== 'icon' && t(currentLabel)}
    </Button>
  );
}

/**
 * AIActionGroup - Group of AI action buttons
 */
export function AIActionGroup({
  actions = [],
  isReadOnly = false,
  className
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {actions.map((action, index) => (
        <AIActionButton
          key={index}
          {...action}
          isReadOnly={isReadOnly}
        />
      ))}
    </div>
  );
}

/**
 * AIGenerateCard - Card wrapper for AI generation with preview
 */
export function AIGenerateCard({
  title,
  description,
  onGenerate,
  isGenerating,
  isReadOnly,
  children,
  className
}) {
  const { t } = useLanguage();
  
  return (
    <div className={cn(
      'border rounded-lg p-4 bg-gradient-to-br from-primary/5 to-transparent',
      className
    )}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          {title && (
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t(title)}
            </h4>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {t(description)}
            </p>
          )}
        </div>
        <AIActionButton
          onGenerate={onGenerate}
          isGenerating={isGenerating}
          isReadOnly={isReadOnly}
          size="sm"
        />
      </div>
      {children}
    </div>
  );
}

export default AIActionButton;
