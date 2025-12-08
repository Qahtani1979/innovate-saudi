import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LabToSolutionConverter({ rdProject, livingLabId }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [solutionData, setSolutionData] = useState({
    name_en: rdProject.title_en || '',
    description_en: rdProject.abstract_en || '',
    pricing_model: 'subscription'
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      // Create Solution
      const solution = await base44.entities.Solution.create({
        code: `SOL-LAB-${Date.now()}`,
        name_en: solutionData.name_en,
        name_ar: rdProject.title_ar,
        description_en: solutionData.description_en,
        description_ar: rdProject.abstract_ar,
        provider_name: rdProject.institution_en,
        provider_type: 'research_center',
        sectors: [rdProject.research_area_en],
        maturity_level: 'pilot_ready',
        trl: rdProject.trl_current || 6,
        pricing_model: solutionData.pricing_model,
        workflow_stage: 'verification_pending',
        is_verified: false
      });

      // Create certification
      await base44.entities.LabSolutionCertification.create({
        living_lab_id: livingLabId,
        solution_id: solution.id,
        certification_type: 'citizen_tested',
        certification_date: new Date().toISOString(),
        citizen_participants_count: rdProject.team_members?.length || 0,
        research_findings: rdProject.abstract_en,
        issued_by: user.email
      });

      // Update RDProject
      await base44.entities.RDProject.update(rdProject.id, {
        commercialization_potential_score: 75
      });

      return solution;
    },
    onSuccess: (solution) => {
      queryClient.invalidateQueries();
      toast.success(t({ en: 'Solution created from research', ar: 'تم إنشاء الحل من البحث' }));
      window.open(`/SolutionDetail?id=${solution.id}`, '_blank');
    }
  });

  return (
    <Card className="border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-600" />
          {t({ en: 'Commercialize as Solution', ar: 'تسويق كحل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder={t({ en: 'Solution Name', ar: 'اسم الحل' })}
          value={solutionData.name_en}
          onChange={(e) => setSolutionData(prev => ({ ...prev, name_en: e.target.value }))}
        />

        <Textarea
          placeholder={t({ en: 'Market-ready description...', ar: 'وصف جاهز للسوق...' })}
          value={solutionData.description_en}
          onChange={(e) => setSolutionData(prev => ({ ...prev, description_en: e.target.value }))}
        />

        <Button
          onClick={() => convertMutation.mutate()}
          disabled={!solutionData.name_en || convertMutation.isPending}
          className="w-full bg-green-600"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          {t({ en: 'Create Certified Solution', ar: 'إنشاء حل معتمد' })}
        </Button>
      </CardContent>
    </Card>
  );
}