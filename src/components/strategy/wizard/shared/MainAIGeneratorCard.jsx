import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Brain, Wand2, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useLanguage } from '../../../LanguageContext';

/**
 * MainAIGeneratorCard - Standardized main AI generator for wizard steps
 * 
 * Variants:
 * - 'card': Full card with icon, title, description, button (Step1 style)
 * - 'button': Compact button only (Step9 style)
 * - 'inline': Inline with other controls
 * - 'compact': Smaller card variant
 * 
 * @param {Object} props
 * @param {'card' | 'button' | 'inline' | 'compact'} props.variant - Display variant
 * @param {Object} props.title - { en: string, ar: string }
 * @param {Object} props.description - { en: string, ar: string }
 * @param {LucideIcon} props.icon - Custom icon (defaults to Sparkles)
 * @param {Function} props.onGenerate - Generation callback
 * @param {boolean} props.isGenerating - Loading state
 * @param {boolean} props.isReadOnly - Disable interaction
 * @param {boolean} props.disabled - Additional disable condition
 * @param {string} props.className - Additional classes
 * @param {Object} props.buttonLabel - Custom button label { en, ar }
 * @param {React.ReactNode} props.children - Optional content below card
 */
export function MainAIGeneratorCard({
  variant = 'card',
  title,
  description,
  icon: Icon = Sparkles,
  onGenerate,
  isGenerating = false,
  isReadOnly = false,
  disabled = false,
  className,
  buttonLabel,
  children
}) {
  const { t, language } = useLanguage();

  const defaultTitle = {
    en: 'Generate with AI',
    ar: 'توليد بالذكاء الاصطناعي'
  };

  const defaultDescription = {
    en: 'Use AI to automatically generate content based on your strategic context',
    ar: 'استخدم الذكاء الاصطناعي لتوليد المحتوى تلقائيًا بناءً على السياق الاستراتيجي'
  };

  const defaultButtonLabel = {
    en: isGenerating ? 'Generating...' : 'Generate All',
    ar: isGenerating ? 'جاري التوليد...' : 'توليد الكل'
  };

  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;
  const displayButtonLabel = buttonLabel || defaultButtonLabel;

  const isDisabled = isGenerating || isReadOnly || disabled;

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
          <Icon className="h-4 w-4 text-yellow-500" />
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
        <Button
          size="sm"
          onClick={onGenerate}
          disabled={isDisabled}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Zap className="h-3 w-3" />
          )}
          {t(displayButtonLabel)}
        </Button>
      </div>
    );
  }

  // Compact card variant
  if (variant === 'compact') {
    return (
      <Card className={cn(
        'border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-accent/5',
        className
      )}>
        <CardContent className="flex items-center gap-3 p-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{t(displayTitle)}</p>
          </div>
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={isDisabled}
            className="gap-2 shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-yellow-500" />
            )}
            {t(displayButtonLabel)}
          </Button>
        </CardContent>
        {children}
      </Card>
    );
  }

  // Full card variant (default - Step1 style)
  return (
    <Card className={cn(
      'border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-accent/5',
      'hover:border-primary/30 transition-colors',
      className
    )}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base flex items-center gap-2">
            {t(displayTitle)}
            <Brain className="h-4 w-4 text-muted-foreground" />
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {t(displayDescription)}
          </p>
        </div>
        <Button
          onClick={onGenerate}
          disabled={isDisabled}
          className="gap-2 shrink-0"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t({ en: 'Generating...', ar: 'جاري التوليد...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-yellow-500" />
              {t(displayButtonLabel)}
            </>
          )}
        </Button>
      </CardContent>
      {children}
    </Card>
  );
}

export default MainAIGeneratorCard;
