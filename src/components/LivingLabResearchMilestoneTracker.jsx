import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Target, CheckCircle2, X, Clock, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLivingLab, useLivingLabMutations } from '@/hooks/useLivingLab';

export default function LivingLabResearchMilestoneTracker({ lab: initialLab, projectId, onClose }) {
  const { t, isRTL } = useLanguage();

  // Reload lab data to ensure we have the latest projects state
  const { data: lab, isLoading: labLoading } = useLivingLab(initialLab?.id);
  const { updateProjectMilestones } = useLivingLabMutations(initialLab?.id);

  const project = lab?.current_projects?.find(p => p.id === projectId);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    if (project?.milestones) {
      setMilestones(project.milestones);
    }
  }, [project]);

  const [newMilestone, setNewMilestone] = useState({
    name: '',
    description: '',
    due_date: '',
    deliverables: '',
    status: 'pending'
  });

  const handleAddMilestone = () => {
    if (!newMilestone.name) return;

    const updatedMilestones = [
      ...milestones,
      { ...newMilestone, created_date: new Date().toISOString() }
    ];

    updateProjectMilestones.mutate({
      lab,
      projectId,
      milestones: updatedMilestones
    }, {
      onSuccess: () => {
        setMilestones(updatedMilestones);
        setNewMilestone({
          name: '',
          description: '',
          due_date: '',
          deliverables: '',
          status: 'pending'
        });
      }
    });
  };

  const handleToggleMilestone = (index) => {
    const updatedMilestones = milestones.map((m, i) => {
      if (i === index) {
        const isCurrentlyCompleted = m.status === 'completed';
        return {
          ...m,
          status: isCurrentlyCompleted ? 'pending' : 'completed',
          completed_date: isCurrentlyCompleted ? null : new Date().toISOString().split('T')[0]
        };
      }
      return m;
    });

    updateProjectMilestones.mutate({
      lab,
      projectId,
      milestones: updatedMilestones
    }, {
      onSuccess: () => {
        setMilestones(updatedMilestones);
      }
    });
  };

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;
  const isUpdating = updateProjectMilestones.isPending;

  if (labLoading) {
    return (
      <Card className="w-full flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </Card>
    );
  }

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
            <p className="text-xs text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</p>
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
                        {t({ en: 'Due:', ar: 'تاريخ الاستحقاق:' })} {milestone.due_date}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={milestone.status === 'completed' ? 'outline' : 'default'}
                    onClick={() => handleToggleMilestone(i)}
                    disabled={isUpdating}
                    className={milestone.status === 'completed' ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      milestone.status === 'completed' ? t({ en: 'Reopen', ar: 'إعادة فتح' }) : t({ en: 'Complete', ar: 'إكمال' })
                    )}
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
            onClick={handleAddMilestone}
            disabled={!newMilestone.name || isUpdating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
          </Button>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Done', ar: 'تم' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}