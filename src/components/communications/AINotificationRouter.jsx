import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Bell, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  NOTIFICATION_ROUTER_SYSTEM_PROMPT, 
  buildNotificationRouterPrompt, 
  NOTIFICATION_ROUTER_SCHEMA 
} from '@/lib/ai/prompts/communications';

export default function AINotificationRouter({ notification, userPreferences }) {
  const { language, t } = useLanguage();
  const [routing, setRouting] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeAndRoute = async () => {
    const result = await invokeAI({
      system_prompt: NOTIFICATION_ROUTER_SYSTEM_PROMPT,
      prompt: buildNotificationRouterPrompt({ notification, userPreferences }),
      response_json_schema: NOTIFICATION_ROUTER_SCHEMA
    });

    if (result.success) {
      setRouting(result.data);
      toast.success(t({ en: 'Routing analyzed', ar: 'التوجيه محلل' }));
    }
  };

  const urgencyColors = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700'
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Smart Notification Router', ar: 'موجه الإشعارات الذكي' })}
          </CardTitle>
          <Button onClick={analyzeAndRoute} disabled={isLoading || !isAvailable} size="sm" className="bg-indigo-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!routing && !isLoading && (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI determines urgency and optimal delivery channels', ar: 'الذكاء يحدد الإلحاح والقنوات المثلى' })}
            </p>
          </div>
        )}

        {routing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded border">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Urgency', ar: 'الإلحاح' })}</p>
                <Badge className={urgencyColors[routing.urgency]}>
                  {routing.urgency?.toUpperCase()}
                </Badge>
              </div>
              <div className="p-3 rounded border">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Priority', ar: 'الأولوية' })}</p>
                <p className="text-2xl font-bold text-indigo-600">{routing.priority}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-300">
              <p className="text-xs font-semibold text-blue-900 mb-2">
                {t({ en: 'Delivery Channels:', ar: 'قنوات التسليم:' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {routing.channels?.map((channel, i) => (
                  <Badge key={i} variant="outline">{channel}</Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded border border-green-300">
              <p className="text-xs font-semibold text-green-900 mb-1">
                {t({ en: 'Timing:', ar: 'التوقيت:' })}
              </p>
              <Badge className="bg-green-600 text-white">{routing.timing}</Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded border">
              <p className="text-xs text-slate-700">{routing.reasoning}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
