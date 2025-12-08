import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MultiInstitutionCollaboration({ projectId }) {
  const { language, t } = useLanguage();
  const [finding, setFinding] = useState(false);
  const [partners, setPartners] = useState(null);

  const findPartners = async () => {
    setFinding(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest research institution partners for multi-institution collaboration:

Project needs: Advanced AI research, smart city deployment expertise, civic tech experience

Available institutions: King Saud University, KAUST, King Fahd University, KACST, Aramco Research

Recommend 3-4 institutions with complementary capabilities and collaboration synergy.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  institution: { type: "string" },
                  role: { type: "string" },
                  expertise: { type: "string" },
                  synergy_score: { type: "number" }
                }
              }
            }
          }
        }
      });

      setPartners(response.recommendations);
      toast.success(t({ en: 'Partners identified', ar: 'الشركاء محددون' }));
    } catch (error) {
      toast.error(t({ en: 'Search failed', ar: 'فشل البحث' }));
    } finally {
      setFinding(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Multi-Institution Collaboration', ar: 'التعاون متعدد المؤسسات' })}
          </CardTitle>
          <Button onClick={findPartners} disabled={finding} size="sm" className="bg-indigo-600">
            {finding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Find Partners', ar: 'إيجاد شركاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {partners && (
          <div className="space-y-3">
            {partners.map((p, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border-2 border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{p.institution}</h4>
                  <Badge className="bg-indigo-600">{p.synergy_score}% match</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2"><strong>Role:</strong> {p.role}</p>
                <p className="text-xs text-slate-600">{p.expertise}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}