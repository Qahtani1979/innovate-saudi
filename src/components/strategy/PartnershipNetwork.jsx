import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Network, Building2, Rocket, GraduationCap, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildPartnershipNetworkPrompt, PARTNERSHIP_NETWORK_SCHEMA } from '@/lib/ai/prompts/partnerships';

export default function PartnershipNetwork() {
  const { language, isRTL, t } = useLanguage();
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rd_projects').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  // Build collaboration network
  const collaborations = [];
  pilots.forEach(p => {
    p.team?.forEach(member => {
      if (member.organization) {
        collaborations.push({
          type: 'pilot',
          org1: member.organization,
          project: p.title_en
        });
      }
    });
  });

  rdProjects.forEach(r => {
    r.partner_institutions?.forEach(partner => {
      collaborations.push({
        type: 'rd',
        org1: partner.name_en,
        project: r.title_en
      });
    });
  });

  const uniqueOrgs = [...new Set(collaborations.map(c => c.org1))];
  const totalCollaborations = collaborations.length;

  const generateAISuggestions = async () => {
    const response = await invokeAI({
      prompt: buildPartnershipNetworkPrompt(uniqueOrgs, totalCollaborations, pilots, rdProjects),
      response_json_schema: PARTNERSHIP_NETWORK_SCHEMA
    });

    if (response.success && response.data?.suggestions) {
      setAiSuggestions(response.data.suggestions);
      toast.success(t({ en: 'AI suggestions generated', ar: 'تم إنشاء الاقتراحات الذكية' }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              {t({ en: 'Partnership Network', ar: 'شبكة الشراكات' })}
            </CardTitle>
            <Button onClick={generateAISuggestions} disabled={isLoading || !isAvailable} variant="outline">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'AI Suggest', ar: 'اقتراح ذكي' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{uniqueOrgs.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Organizations', ar: 'منظمات' })}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Network className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{totalCollaborations}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Collaborations', ar: 'تعاون' })}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{collaborations.filter(c => c.type === 'pilot').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg text-center">
              <GraduationCap className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-indigo-600">{collaborations.filter(c => c.type === 'rd').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'R&D', ar: 'بحث' })}</p>
            </div>
          </div>

          {aiSuggestions && (
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-900">{t({ en: 'AI Partnership Suggestions', ar: 'اقتراحات الشراكة الذكية' })}</h4>
              {aiSuggestions.map((sug, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-purple-600">{sug.partner1}</Badge>
                    <span className="text-slate-400">+</span>
                    <Badge className="bg-pink-600">{sug.partner2}</Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? sug.opportunity_ar : sug.opportunity_en}
                  </p>
                  <p className="text-xs text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? sug.rationale_ar : sug.rationale_en}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}