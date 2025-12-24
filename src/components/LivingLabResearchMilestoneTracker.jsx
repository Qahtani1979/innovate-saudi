import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Target, CheckCircle2, X, Clock, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function LivingLabResearchMilestoneTracker({ lab, projectId, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();

  // For this component, we'll track milestones in the lab's current_projects array
  const project = lab?.current_projects?.find(p => p.id === projectId);
  const [milestones, setMilestones] = useState(project?.milestones || []);

  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    due_date: '',
    deliverables: '',
    status: 'pending'
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async () => {
      const updatedProjects = (lab.current_projects || []).map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            milestones: [...(p.milestones || []), { ...newMilestone, created_date: new Date().toISOString() }]
          };
        }
        return p;
      });

      await base44.entities.LivingLab.update(lab.id, {
        current_projects: updatedProjects
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab']);
      toast.success(t({ en: 'Milestone added', ar: 'تمت إضافة المعلم' }));
      setMilestones([...milestones, newMilestone]);
      setNewMilestone({
        name: '',
        description: '',
        due_date: '',
        deliverables: '',
        status: 'pending'
      });
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async (milestoneIndex) => {
      const updatedProjects = (lab.current_projects || []).map(p => {
        if (p.id === projectId) {
          const updatedMilestones = [...(p.milestones || [])];
          updatedMilestones[milestoneIndex] = {
            ...updatedMilestones[milestoneIndex],
            status: updatedMilestones[milestoneIndex].status === 'completed' ? 'pending' : 'completed',
            completed_date: updatedMilestones[milestoneIndex].status === 'completed' ? null : new Date().toISOString().split('T')[0]
          };
          return { ...p, milestones: updatedMilestones };
        }
        return p;
      });

      await base44.entities.LivingLab.update(lab.id, {
        current_projects: updatedProjects
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['living-lab']);
      toast.success(t({ en: 'Milestone updated', ar: 'تم تحديث المعلم' }));
    }
  });

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {t({ en: 'Research Milestones', ar: 'معالم البحث' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">{project?.project_name || 'Research Project'}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-600">Progress</p>
            <Badge className="bg-blue-600 text-white">{completedMilestones}/{milestones.length}</Badge>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
        </div>

        {/* Existing Milestones */}
        {milestones.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Project Milestones', ar: 'معالم المشروع' })}
            </p>
            {milestones.map((milestone, i) => (
              <div key={i} className={`p-3 border rounded-lg ${milestone.status === 'completed' ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-slate-900">{milestone.name}</p>
                      {milestone.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {milestone.due_date && (
                      <p className="text-xs text-slate-600">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Due: {milestone.due_date}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={milestone.status === 'completed' ? 'outline' : 'default'}
                    onClick={() => updateMilestoneMutation.mutate(i)}
                    className={milestone.status === 'completed' ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {milestone.status === 'completed' ? t({ en: 'Reopen', ar: 'إعادة فتح' }) : t({ en: 'Complete', ar: 'إكمال' })}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Milestone */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Add New Milestone', ar: 'إضافة معلم جديد' })}
          </p>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Milestone Name', ar: 'اسم المعلم' })}
            </label>
            <Input
              value={newMilestone.name}
              onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
              placeholder={t({ en: 'e.g., Data collection complete', ar: 'مثل: جمع البيانات مكتمل' })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Description', ar: 'الوصف' })}
            </label>
            <Textarea
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}
              </label>
              <Input
                type="date"
                value={newMilestone.due_date}
                onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Deliverables', ar: 'المخرجات' })}
              </label>
              <Input
                value={newMilestone.deliverables}
                onChange={(e) => setNewMilestone({ ...newMilestone, deliverables: e.target.value })}
                placeholder="Dataset, Report, etc."
              />
            </div>
          </div>

          <Button
            onClick={() => addMilestoneMutation.mutate()}
            disabled={!newMilestone.name || addMilestoneMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
          </Button>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} className="flex-1">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Done', ar: 'تم' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}