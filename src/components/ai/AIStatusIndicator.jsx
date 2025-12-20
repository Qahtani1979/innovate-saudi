import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { AI_STATUS } from '@/hooks/useAIWithFallback';

/**
 * Shows AI availability status and rate limit warnings
 */
export default function AIStatusIndicator({ 
  status, 
  error, 
  rateLimitInfo, 
  showDetails = false,
  className = '' 
}) {
  const { t } = useLanguage();

  if (status === AI_STATUS.IDLE || status === AI_STATUS.LOADING) {
    return null;
  }

  if (status === AI_STATUS.RATE_LIMITED) {
    return (
      <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          {t({ 
            en: 'AI assistance is temporarily unavailable. You can continue without AI features.', 
            ar: 'مساعدة الذكاء الاصطناعي غير متاحة مؤقتاً. يمكنك المتابعة بدون ميزات AI.' 
          })}
          {rateLimitInfo?.daily_remaining === 0 && (
            <span className="block mt-1 text-xs">
              {t({ en: 'Limit resets at midnight UTC.', ar: 'يتم إعادة تعيين الحد عند منتصف الليل UTC.' })}
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === AI_STATUS.ERROR) {
    return (
      <Alert className={`border-red-200 bg-red-50 ${className}`}>
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 text-sm">
          {t({ 
            en: 'AI service error. Manual input is available.', 
            ar: 'خطأ في خدمة AI. الإدخال اليدوي متاح.' 
          })}
        </AlertDescription>
      </Alert>
    );
  }

  // Show usage warning if close to limit
  if (showDetails && rateLimitInfo && !rateLimitInfo.unlimited) {
    const usagePercent = rateLimitInfo.daily_limit > 0 
      ? (rateLimitInfo.daily_used / rateLimitInfo.daily_limit) * 100 
      : 0;

    if (usagePercent >= 80) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
            <Clock className="h-3 w-3 mr-1" />
            {rateLimitInfo.daily_remaining} {t({ en: 'AI requests left', ar: 'طلبات AI متبقية' })}
          </Badge>
        </div>
      );
    }

    if (usagePercent >= 50) {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <Badge variant="outline" className="border-muted text-muted-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            {rateLimitInfo.daily_remaining}/{rateLimitInfo.daily_limit}
          </Badge>
        </div>
      );
    }
  }

  return null;
}

/**
 * Badge showing AI is optional for a feature
 */
export function AIOptionalBadge({ className = '' }) {
  const { t } = useLanguage();
  
  return (
    <Badge variant="secondary" className={`text-xs ${className}`}>
      <Sparkles className="h-3 w-3 mr-1" />
      {t({ en: 'AI-assisted (optional)', ar: 'بمساعدة AI (اختياري)' })}
    </Badge>
  );
}
