import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { TestTube, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useQuery } from '@tanstack/react-query';

export default function ProgramToPilotWorkflow({ program, graduateApplication }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

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
    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Graduate from "${program.name_en}" wants to pilot their innovation:

Graduate: ${graduateApplication?.applicant_name}
Project: ${graduateApplication?.project_description || 'Innovation project'}
Program Focus: ${program.focus_areas?.join(', ')}

Generate pilot proposal:`,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            objective_en: { type: 'string' },
            objective_ar: { type: 'string' },
            hypothesis: { type: 'string' },
            methodology: { type: 'string' }
          }
        }
      });
      setFormData(prev => ({ ...prev, ...result }));
      toast.success(t({ en: 'Pilot proposal generated', ar: 'تم توليد مقترح التجربة' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const pilot = await base44.entities.Pilot.create({
        ...formData,
        stage: 'design',
        trl_start: 5,
        trl_target: 7
      });

      await base44.entities.ChallengeRelation.create({
        challenge_id: program.id,
        related_entity_type: 'pilot',
        related_entity_id: pilot.id,
        relation_role: 'derived_from'
      });

      await base44.entities.SystemActivity.create({
        entity_type: 'program',
        entity_id: program.id,
        activity_type: 'pilot_created',
        performed_by: user.email,
        timestamp: new Date().toISOString(),
        metadata: { pilot_id: pilot.id }
      });

      toast.success(t({ en: 'Pilot created', ar: 'تم إنشاء التجربة' }));
      navigate(createPageUrl(`PilotDetail?id=${pilot.id}`));
    } catch (error) {
      toast.error(t({ en: 'Failed to create pilot', ar: 'فشل إنشاء التجربة' }));
    } finally {
      setLoading(false);
    }
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
          <Button onClick={handleAIGenerate} disabled={aiLoading} variant="outline" className="w-full">
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
              <Input value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>العنوان (AR)</Label>
              <Input value={formData.title_ar} onChange={(e) => setFormData({...formData, title_ar: e.target.value})} dir="rtl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Municipality</Label>
            <Select value={formData.municipality_id} onValueChange={(v) => setFormData({...formData, municipality_id: v})}>
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
            <Textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} rows={4} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>{t({ en: 'Cancel', ar: 'إلغاء' })}</Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.municipality_id}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}