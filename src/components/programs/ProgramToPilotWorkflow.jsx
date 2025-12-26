import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { TestTube, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import usePilotMutations from '@/hooks/usePilotMutations';
import { toast } from 'sonner';
import {
  PROGRAM_PILOT_SYSTEM_PROMPT,
  buildProgramPilotPrompt,
  PROGRAM_PILOT_SCHEMA
} from '@/lib/ai/prompts/programs/pilotWorkflow';

export default function ProgramToPilotWorkflow({ program, graduateApplication }) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { user } = useAuth();
  const { createPilot } = usePilotMutations();

  // Use visibility-aware hooks
  const { data: municipalities = [] } = useMunicipalitiesWithVisibility({ includeNational: true });
  const { data: challenges = [] } = useChallengesWithVisibility({ status: 'approved' });

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    municipality_id: '',
    challenge_id: '',
    sector: 'innovation'
  });

  const handleAIGenerate = async () => {
    const result = await invokeAI({
      system_prompt: PROGRAM_PILOT_SYSTEM_PROMPT,
      prompt: buildProgramPilotPrompt({ program, graduateApplication }),
      response_json_schema: PROGRAM_PILOT_SCHEMA
    });

    if (result.success) {
      setFormData(prev => ({ ...prev, ...result.data }));
      toast.success(t({ en: 'Pilot proposal generated', ar: 'تم توليد مقترح التجربة' }));
    }
  };

  const handleSubmit = () => {
    createPilot.mutate({
      ...formData,
      stage: 'design',
      trl_start: 5,
      trl_target: 7
    }, {
      onSuccess: (pilot) => {
        toast.success(t({ en: 'Pilot created from program', ar: 'تم إنشاء التجربة من البرنامج' }));
        navigate(createPageUrl(`PilotDetail?id=${pilot.id}`));
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          <TestTube className="h-4 w-4 mr-2" />
          {t({ en: 'Launch Pilot', ar: 'إطلاق تجربة' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t({ en: 'Convert to Pilot', ar: 'تحويل لتجربة' })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />
          <Button onClick={handleAIGenerate} disabled={aiLoading || !isAvailable} variant="outline" className="w-full">
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Generating...', ar: 'جاري التوليد...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'AI Generate Proposal', ar: 'توليد ذكي للمقترح' })}
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (EN)</Label>
              <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>العنوان (AR)</Label>
              <Input value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} dir="rtl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Municipality</Label>
            <Select value={formData.municipality_id} onValueChange={(v) => setFormData({ ...formData, municipality_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select municipality" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description (EN)</Label>
            <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} rows={4} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>{t({ en: 'Cancel', ar: 'إلغاء' })}</Button>
            <Button onClick={handleSubmit} disabled={createPilot.isPending || !formData.municipality_id}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
