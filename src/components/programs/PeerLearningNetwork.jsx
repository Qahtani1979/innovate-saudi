import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function PeerLearningNetwork({ programId, participants }) {
  const { language, t } = useLanguage();
  const [forming, setForming] = useState(false);
  const [pods, setPods] = useState(null);

  const formPods = async () => {
    setForming(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Form optimal learning pods for this program cohort:

Participants: ${participants?.slice(0, 15).map(p => 
  `${p.startup_name || p.organization_name} - Sector: ${p.sector} - Experience: ${p.experience_level || 'N/A'}`
).join('\n')}

Create 3-5 learning pods (3-5 people each) with:
1. Complementary skills (strong in X pairs with weak in X)
2. Sector diversity
3. Experience level balance
4. Collaboration potential`,
        response_json_schema: {
          type: "object",
          properties: {
            pods: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pod_name: { type: "string" },
                  members: { type: "array", items: { type: "string" } },
                  focus_areas: { type: "array", items: { type: "string" } },
                  synergy_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      setPods(response.pods);
      toast.success(t({ en: 'Learning pods formed', ar: 'مجموعات التعلم شُكلت' }));
    } catch (error) {
      toast.error(t({ en: 'Formation failed', ar: 'فشل التشكيل' }));
    } finally {
      setForming(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Peer Learning Network', ar: 'شبكة التعلم من الأقران' })}
          </CardTitle>
          {!pods && (
            <Button onClick={formPods} disabled={forming} size="sm" className="bg-indigo-600">
              {forming ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Form Pods', ar: 'تشكيل المجموعات' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!pods && !forming && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI creates optimal learning pods with complementary skills', ar: 'الذكاء ينشئ مجموعات تعلم مثلى بمهارات تكميلية' })}
            </p>
          </div>
        )}

        {pods && (
          <div className="space-y-3">
            {pods.map((pod, i) => (
              <div key={i} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-indigo-900">{pod.pod_name}</h4>
                  <Badge className="bg-indigo-600">
                    {t({ en: `${pod.synergy_score}% synergy`, ar: `${pod.synergy_score}% تآزر` })}
                  </Badge>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Members:', ar: 'الأعضاء:' })}</p>
                  <div className="flex flex-wrap gap-1">
                    {pod.members?.map((member, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{member}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Focus Areas:', ar: 'مجالات التركيز:' })}</p>
                  <div className="flex flex-wrap gap-1">
                    {pod.focus_areas?.map((area, j) => (
                      <Badge key={j} className="bg-purple-100 text-purple-700 text-xs">{area}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  <MessageSquare className="h-3 w-3 mr-2" />
                  {t({ en: 'Pod Workspace', ar: 'مساحة المجموعة' })}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}