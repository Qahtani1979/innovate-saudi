import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, User, Mail, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildConnectionsSuggesterPrompt, CONNECTIONS_SUGGESTER_SCHEMA } from '@/lib/ai/prompts/profiles';

export default function AIConnectionsSuggester({ currentUser }) {
  const { t, language } = useLanguage();
  const [suggestions, setSuggestions] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Early return if no user data
  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Connection Suggestions', ar: 'اقتراحات الاتصال بالذكاء الاصطناعي' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">{t({ en: 'Loading profile...', ar: 'جاري تحميل الملف...' })}</p>
        </CardContent>
      </Card>
    );
  }

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  const generateSuggestions = async () => {
    const otherUsers = allUsers.filter(u => u.email !== currentUser.email);
    
    const result = await invokeAI({
      prompt: buildConnectionsSuggesterPrompt(currentUser, otherUsers),
      response_json_schema: CONNECTIONS_SUGGESTER_SCHEMA
    });

    if (result.success) {
      setSuggestions(result.data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Connection Suggestions', ar: 'اقتراحات الاتصال الذكية' })}
          </div>
          <Button 
            onClick={generateSuggestions}
            disabled={isLoading || !isAvailable || !currentUser.skills?.length}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
            size="sm"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t({ en: 'Find Connections', ar: 'اقتراح اتصالات' })}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {!currentUser.skills?.length && (
          <div className="text-center py-8 text-slate-500 text-sm">
            {t({ en: 'Add skills to your profile to get AI connection suggestions', ar: 'أضف مهارات لملفك للحصول على اقتراحات' })}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            <span className="ml-3 text-sm text-slate-600">
              {t({ en: 'Analyzing network...', ar: 'جاري تحليل الشبكة...' })}
            </span>
          </div>
        )}

        {suggestions && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 pb-3 border-b">
              {suggestions.summary}
            </p>

            <div className="space-y-3">
              {suggestions.connections.map((connection, idx) => {
                const suggestedUser = allUsers.find(u => u.email === connection.user_email);
                if (!suggestedUser) return null;

                return (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{suggestedUser.full_name}</p>
                            <p className="text-sm text-slate-600">{suggestedUser.job_title || suggestedUser.role}</p>
                          </div>
                          <Badge className={
                            connection.connection_strength >= 80 ? 'bg-green-600' :
                            connection.connection_strength >= 60 ? 'bg-blue-600' :
                            'bg-slate-600'
                          }>
                            {connection.connection_strength}% match
                          </Badge>
                        </div>

                        {connection.shared_interests?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {connection.shared_interests.map((interest, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <p className="text-sm text-slate-700 mb-2 italic">
                          {connection.reason}
                        </p>

                        {connection.collaboration_opportunities?.length > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3 text-sm">
                            <p className="font-medium text-blue-900 mb-1">
                              {t({ en: 'Collaboration Ideas:', ar: 'أفكار التعاون:' })}
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-blue-800">
                              {connection.collaboration_opportunities.map((opp, i) => (
                                <li key={i}>{opp}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" asChild>
                            <a href={`mailto:${suggestedUser.email}`}>
                              <Mail className="h-3 w-3 mr-1" />
                              {t({ en: 'Contact', ar: 'تواصل' })}
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
