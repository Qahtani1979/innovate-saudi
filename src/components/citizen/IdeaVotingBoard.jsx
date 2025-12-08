import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { ThumbsUp, ThumbsDown, TrendingUp, MapPin } from 'lucide-react';

export default function IdeaVotingBoard() {
  const { language, t } = useLanguage();

  const { data: ideas = [] } = useQuery({
    queryKey: ['citizen-ideas'],
    queryFn: async () => {
      const all = await base44.entities.CitizenFeedback.list();
      return all
        .filter(f => f.feedback_type === 'suggestion')
        .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Trending Ideas', ar: 'الأفكار الرائجة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ideas.slice(0, 10).map((idea, idx) => (
            <div key={idea.id} className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="flex items-start gap-3">
                <div className="text-center">
                  <Button size="sm" variant="outline" className="w-12 h-12 flex flex-col">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold">{idea.vote_count || 0}</span>
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {idea.content.split('\n')[0].replace('IDEA: ', '')}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {idea.content.split('\n')[2]}
                      </p>
                    </div>
                    <Badge className="ml-2">#{idx + 1}</Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {!idea.is_anonymous && idea.citizen_name && (
                      <span>By {idea.citizen_name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {idea.location || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {ideas.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">
                {t({ en: 'No ideas submitted yet', ar: 'لا أفكار مقدمة بعد' })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}