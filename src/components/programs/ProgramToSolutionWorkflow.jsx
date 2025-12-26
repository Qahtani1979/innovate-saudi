import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import useSolutionMutations from '@/hooks/useSolutionMutations';

export default function ProgramToSolutionWorkflow({ program, graduateApplication }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    provider_name: graduateApplication?.applicant_name || '',
    provider_type: 'startup',
    maturity_level: 'pilot_ready'
  });

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });
  const { createSolution } = useSolutionMutations();

  const handleAIGenerate = async () => {
    const response = await invokeAI({
      prompt: `A graduate from program "${program.name_en}" wants to launch their solution:

Program Focus: ${program.focus_areas?.join(', ') || 'Innovation'}
Graduate: ${graduateApplication?.applicant_name}
Project: ${graduateApplication?.project_description || 'Innovation project'}

Generate marketplace-ready solution profile:`,
      response_json_schema: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          tagline_en: { type: 'string' },
          tagline_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          value_proposition: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (response.success) {
      setFormData(prev => ({ ...prev, ...response.data }));
    }
  };

  const handleSubmit = () => {
    createSolution.mutate({
      solutionData: {
        ...formData,
        workflow_stage: 'draft',
        sectors: program.focus_areas || [],
        tags: [`program_graduate:${program.id}`]
      },
      programId: program.id,
      graduateName: graduateApplication?.applicant_name
    }, {
      onSuccess: (solution) => {
        navigate(createPageUrl(`SolutionDetail?id=${solution.id}`));
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Lightbulb className="h-4 w-4 mr-2" />
          {t({ en: 'Launch Solution', ar: 'إطلاق حل' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t({ en: 'Convert to Solution', ar: 'تحويل لحل' })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />

          <Button onClick={handleAIGenerate} disabled={isLoading || !isAvailable} variant="outline" className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Generating...', ar: 'جاري التوليد...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'AI Generate Profile', ar: 'توليد ذكي للملف' })}
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Solution Name (EN)</Label>
              <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>اسم الحل (AR)</Label>
              <Input value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} dir="rtl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (EN)</Label>
            <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} rows={4} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>{t({ en: 'Cancel', ar: 'إلغاء' })}</Button>
            <Button onClick={handleSubmit} disabled={createSolution.isPending}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t({ en: 'Create Solution', ar: 'إنشاء حل' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
