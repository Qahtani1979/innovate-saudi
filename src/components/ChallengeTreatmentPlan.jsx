import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Activity, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ChallengeTreatmentPlan({ challenge, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const [approach, setApproach] = useState(challenge.treatment_plan?.approach || '');
  const [milestones, setMilestones] = useState(challenge.treatment_plan?.milestones || []);
  const [assignedTo, setAssignedTo] = useState(challenge.treatment_plan?.assigned_to || '');

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Challenge.update(challenge.id, {
        status: 'in_treatment',
        treatment_plan: { approach, milestones, assigned_to: assignedTo }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge']);
      toast.success(t({ en: 'Treatment plan saved', ar: 'تم حفظ خطة المعالجة' }));
      onClose();
    }
  });

  const addMilestone = () => {
    setMilestones([...milestones, {
      name: '',
      due_date: '',
      status: 'pending',
      completed_date: null
    }]);
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <Card className="max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            {t({ en: 'Treatment Plan', ar: 'خطة المعالجة' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Challenge Info */}
        <div className="p-4 bg-slate-50 rounded-lg border">
          <p className="text-xs text-slate-500 mb-1">{challenge.code}</p>
          <p className="font-semibold text-slate-900">{challenge.title_en}</p>
        </div>

        {/* Progress */}
        {milestones.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-900">{t({ en: 'Treatment Progress', ar: 'تقدم المعالجة' })}</p>
              <Badge className="bg-blue-600 text-white">{progress}%</Badge>
            </div>
            <div className="text-xs text-blue-700">
              {completedCount} of {milestones.length} {t({ en: 'milestones completed', ar: 'معالم مكتملة' })}
            </div>
          </div>
        )}

        {/* Treatment Approach */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Treatment Approach', ar: 'نهج المعالجة' })}
          </label>
          <Textarea
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            placeholder={t({ en: 'Describe how this challenge will be addressed...', ar: 'صف كيف ستتم معالجة هذا التحدي...' })}
            rows={4}
          />
        </div>

        {/* Assigned To */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Assigned To (Email)', ar: 'معين إلى (البريد الإلكتروني)' })}
          </label>
          <Input
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder={t({ en: 'user@example.com', ar: 'user@example.com' })}
          />
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">
              {t({ en: 'Treatment Milestones', ar: 'معالم المعالجة' })}
            </label>
            <Button size="sm" variant="outline" onClick={addMilestone}>
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
            </Button>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 border rounded-lg bg-white">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={milestone.name}
                      onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                      placeholder={t({ en: 'Milestone name...', ar: 'اسم المعلم...' })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-500">{t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}</label>
                        <Input
                          type="date"
                          value={milestone.due_date}
                          onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">{t({ en: 'Status', ar: 'الحالة' })}</label>
                        <select
                          value={milestone.status}
                          onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option value="pending">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</option>
                          <option value="in_progress">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</option>
                          <option value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMilestone(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!approach || saveMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {t({ en: 'Save Treatment Plan', ar: 'حفظ خطة المعالجة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}