import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MultiPartyMatchmaker({ challengeId }) {
  const { language, t } = useLanguage();
  const [finding, setFinding] = useState(false);
  const [consortium, setConsortium] = useState(null);

  const findConsortium = async () => {
    setFinding(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create optimal consortium for complex challenge requiring:
- Tech provider (IoT/sensors)
- System integrator
- Maintenance operator
- Data analytics partner

Suggest 3-4 party consortium with clear roles and synergy explanation.`,
        response_json_schema: {
          type: "object",
          properties: {
            parties: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  party_name: { type: "string" },
                  role: { type: "string" },
                  contribution: { type: "string" },
                  synergy: { type: "string" }
                }
              }
            }
          }
        }
      });

      setConsortium(response.parties);
      toast.success(t({ en: 'Consortium formed', ar: 'الكونسورتيوم شُكّل' }));
    } catch (error) {
      toast.error(t({ en: 'Search failed', ar: 'فشل البحث' }));
    } finally {
      setFinding(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            {t({ en: 'Multi-Party Matchmaker', ar: 'مطابق متعدد الأطراف' })}
          </CardTitle>
          <Button onClick={findConsortium} disabled={finding} size="sm" className="bg-purple-600">
            {finding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Find Consortium', ar: 'إيجاد كونسورتيوم' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {consortium && (
          <div className="space-y-3">
            {consortium.map((party, i) => (
              <div key={i} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-600">{t({ en: `Party ${i + 1}`, ar: `طرف ${i + 1}` })}</Badge>
                  <h4 className="font-bold text-slate-900">{party.party_name}</h4>
                </div>
                <p className="text-sm text-purple-900 mb-2"><strong>{t({ en: 'Role:', ar: 'الدور:' })}</strong> {party.role}</p>
                <p className="text-xs text-slate-700 mb-2">{party.contribution}</p>
                <p className="text-xs text-purple-700 bg-white p-2 rounded">💡 {party.synergy}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}