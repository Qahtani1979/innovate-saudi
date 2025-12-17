import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useLanguage } from '../../../LanguageContext';

/**
 * MainAIGeneratorCard - Standardized main AI generator for wizard steps
 * 
 * Variants:
 * - 'card': Full card with title, description, and buttons (Step3 style)
 * - 'button': Compact button only
 * - 'inline': Inline with other controls
 * - 'compact': Smaller card variant
 * 
 * @param {Object} props
 * @param {'card' | 'button' | 'inline' | 'compact'} props.variant - Display variant
 * @param {Object} props.title - { en: string, ar: string }
 * @param {Object} props.description - { en: string, ar: string }
 * @param {LucideIcon} props.icon - Custom icon (defaults to Sparkles)
 * @param {Function} props.onGenerate - Generation callback for "Generate All"
 * @param {Function} props.onGenerateSingle - Generation callback for "AI Add One"
 * @param {boolean} props.isGenerating - Loading state for Generate All
 * @param {boolean} props.isGeneratingSingle - Loading state for AI Add One
 * @param {boolean} props.isReadOnly - Disable interaction
 * @param {boolean} props.disabled - Additional disable condition
 * @param {string} props.className - Additional classes
 * @param {Object} props.buttonLabel - Custom button label { en, ar }
 * @param {Object} props.singleButtonLabel - Custom single button label { en, ar }
 * @param {boolean} props.showSingleButton - Show the "AI Add One" button
 * @param {React.ReactNode} props.children - Optional content below card
 */
export function MainAIGeneratorCard({
  variant = 'card',
  title,
  description,
  icon: Icon = Sparkles,
  onGenerate,
  onGenerateSingle,
  isGenerating = false,
  isGeneratingSingle = false,
  isReadOnly = false,
  disabled = false,
  className,
  buttonLabel,
  singleButtonLabel,
  showSingleButton = false,
  children
}) {
  const { t, language } = useLanguage();

  const defaultTitle = {
    en: 'AI-Powered Generation',
    ar: 'التوليد بالذكاء الاصطناعي'
  };

  const defaultDescription = {
    en: 'Generate content based on your strategic context',
    ar: 'إنشاء المحتوى بناءً على السياق الاستراتيجي'
  };

  const defaultButtonLabel = {
    en: isGenerating ? 'Generating...' : 'Generate All',
    ar: isGenerating ? 'جاري التوليد...' : 'إنشاء الكل'
  };

  const defaultSingleButtonLabel = {
    en: isGeneratingSingle ? 'Adding...' : 'AI Add One',
    ar: isGeneratingSingle ? 'جاري الإضافة...' : 'إضافة واحد'
  };

  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;
  const displayButtonLabel = buttonLabel || defaultButtonLabel;
  const displaySingleButtonLabel = singleButtonLabel || defaultSingleButtonLabel;

  const isDisabled = isGenerating || isReadOnly || disabled;
  const isSingleDisabled = isGeneratingSingle || isReadOnly || disabled;

  // Button-only variant
  if (variant === 'button') {
    return (
      <Button
        onClick={onGenerate}
        disabled={isDisabled}
        className={cn('gap-2', className)}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {t(displayButtonLabel)}
      </Button>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4 text-primary" />
          <span>{t(displayTitle)}</span>
        </div>
        <div className="flex items-center gap-2">
          {showSingleButton && onGenerateSingle && (
            <Button
              size="sm"
              variant="outline"
              onClick={onGenerateSingle}
              disabled={isSingleDisabled}
              className="gap-2"
            >
              {isGeneratingSingle ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
              {t(displaySingleButtonLabel)}
            </Button>
          )}
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={isDisabled}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {t(displayButtonLabel)}
          </Button>
        </div>
      </div>
    );
  }

  // Compact card variant
  if (variant === 'compact') {
    return (
      <Card className={cn(
        'border-primary/30 bg-primary/5',
        className
      )}>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{t(displayTitle)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showSingleButton && onGenerateSingle && (
              <Button
                size="sm"
                variant="outline"
                onClick={onGenerateSingle}
                disabled={isSingleDisabled}
                className="gap-2"
              >
                {isGeneratingSingle ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {t(displaySingleButtonLabel)}
              </Button>
            )}
            <Button
              size="sm"
              onClick={onGenerate}
              disabled={isDisabled}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {t(displayButtonLabel)}
            </Button>
          </div>
        </CardContent>
        {children}
      </Card>
    );
  }

  // Full card variant (default - Step3 style with gradient)
  return (
    <Card className={cn(
      'border-primary/30 bg-primary/5',
      className
    )}>
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold">{t(displayTitle)}</h4>
            <p className="text-sm text-muted-foreground">
              {t(displayDescription)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showSingleButton && onGenerateSingle && (
              <Button 
                onClick={onGenerateSingle} 
                variant="outline" 
                size="sm" 
                disabled={isSingleDisabled}
              >
                {isGeneratingSingle ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {t(displaySingleButtonLabel)}
              </Button>
            )}
            <Button 
              onClick={onGenerate} 
              disabled={isDisabled}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {t(displayButtonLabel)}
            </Button>
          </div>
        </div>
      </CardContent>
      {children}
    </Card>
  );
}

export default MainAIGeneratorCard;
