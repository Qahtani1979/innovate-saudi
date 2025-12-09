import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function PeerMunicipalityLearningHub({ municipalityId, scalingPlan }) {
  const { language, t } = useLanguage();
  const [peerMatches, setPeerMatches] = useState([]);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const findPeers = async () => {
    try {
      const municipalities = await base44.entities.Municipality.list();
      const currentMuni = municipalities.find(m => m.id === municipalityId);

      const result = await invokeAI({
        prompt: `Find peer municipalities for knowledge sharing:

CURRENT MUNICIPALITY: ${currentMuni?.name_en}
- Size: ${currentMuni?.population}
- MII Score: ${currentMuni?.mii_score}
- Active Pilots: ${currentMuni?.active_pilots}
- Scaling Plan: ${scalingPlan?.solution_name}

OTHER MUNICIPALITIES (EARLY ADOPTERS):
${municipalities.filter(m => m.id !== municipalityId && m.mii_score >= (currentMuni?.mii_score || 0)).slice(0, 15).map(m => 
  `- ${m.name_en}: Pop ${m.population}, MII ${m.mii_score}, Pilots ${m.active_pilots}`
).join('\n')}

Find top 5 peer municipalities that:
1. Have similar context (size, region)
2. Are ahead in scaling journey
3. Can share relevant lessons
4. Match well for knowledge transfer`,
        response_json_schema: {
          type: "object",
          properties: {
            peer_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  municipality_name: { type: "string" },
                  similarity_score: { type: "number" },
                  why_good_match: { type: "string" },
                  key_lessons: { type: "array", items: { type: "string" } },
                  contact_recommendation: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.success) {
        setPeerMatches(result.data.peer_matches || []);
        toast.success(t({ en: `${result.data.peer_matches?.length || 0} peers found`, ar: `${result.data.peer_matches?.length || 0} أقران وُجدوا` }));
      }
    } catch (error) {
      toast.error(t({ en: 'Search failed', ar: 'فشل البحث' }));
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Peer Municipality Learning Hub', ar: 'مركز التعلم من البلديات النظيرة' })}
          </CardTitle>
          <Button onClick={findPeers} disabled={isLoading || !isAvailable} size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find Peers', ar: 'بحث عن أقران' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!peerMatches.length && !isLoading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI connects you with municipalities ahead in scaling journey', ar: 'الذكاء يربطك بالبلديات المتقدمة في رحلة التوسع' })}
            </p>
          </div>
        )}

        {peerMatches.length > 0 && (
          <div className="space-y-3">
            {peerMatches.map((peer, idx) => (
              <div key={idx} className="p-4 border-2 border-indigo-200 rounded-lg bg-white hover:border-indigo-400 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{peer.municipality_name}</h4>
                    <p className="text-xs text-slate-600 mt-1">{peer.why_good_match}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{peer.similarity_score}%</p>
                    <p className="text-xs text-slate-500">{t({ en: 'Match', ar: 'تطابق' })}</p>
                  </div>
                </div>

                {peer.key_lessons?.length > 0 && (
                  <div className="p-3 bg-indigo-50 rounded border border-indigo-200 mb-3">
                    <p className="text-sm font-medium text-indigo-900 mb-1">
                      {t({ en: 'Key Lessons:', ar: 'الدروس الرئيسية:' })}
                    </p>
                    <ul className="space-y-1">
                      {peer.key_lessons.map((lesson, i) => (
                        <li key={i} className="text-xs text-slate-700">✓ {lesson}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-900">
                    <strong>{t({ en: 'Next:', ar: 'التالي:' })}</strong> {peer.contact_recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
