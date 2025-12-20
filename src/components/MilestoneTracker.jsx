import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLanguage } from './LanguageContext';
import { Calendar, Plus, X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function MilestoneTracker({ pilot }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: '', due_date: '', status: 'pending' });
  const { triggerEmail } = useEmailTrigger();

  const milestones = pilot?.milestones || [];

  const updateMutation = useMutation({
    mutationFn: (updatedMilestones) => base44.entities.Pilot.update(pilot.id, { milestones: updatedMilestones }),
    onSuccess: async (_, updatedMilestones) => {
      // Check if any milestone was just completed
      const justCompleted = updatedMilestones.find((m, i) => 
        m.completed && (!milestones[i] || !milestones[i].completed)
      );
      
      if (justCompleted) {
        await triggerEmail('pilot.milestone_completed', {
          entityType: 'pilot',
          entityId: pilot.id,
          variables: {
            pilot_title: pilot.title_en,
            pilot_code: pilot.code,
            milestone_name: justCompleted.name,
            milestone_due_date: justCompleted.due_date,
            completed_count: updatedMilestones.filter(m => m.completed).length,
            total_milestones: updatedMilestones.length
          }
        }).catch(err => console.error('Email trigger failed:', err));
      }

      queryClient.invalidateQueries(['pilot']);
      toast.success(t({ en: 'Milestones updated', ar: 'تم تحديث المعالم' }));
      setEditing(false);
    }
  });

  const toggleMilestone = (index) => {
    const updated = [...milestones];
    updated[index].completed = !updated[index].completed;
    updated[index].status = updated[index].completed ? 'completed' : 'pending';
    updateMutation.mutate(updated);
  };

  const addMilestone = () => {
    if (!newMilestone.name) return;
    const updated = [...milestones, { ...newMilestone, completed: false }];
    updateMutation.mutate(updated);
    setNewMilestone({ name: '', due_date: '', status: 'pending' });
  };

  const removeMilestone = (index) => {
    const updated = milestones.filter((_, i) => i !== index);
    updateMutation.mutate(updated);
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {t({ en: 'Milestones', ar: 'المعالم' })} ({completedCount}/{milestones.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
            <Edit className="h-4 w-4 mr-2" />
            {editing ? t({ en: 'Done', ar: 'تم' }) : t({ en: 'Edit', ar: 'تعديل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</span>
            <span className="font-semibold text-blue-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="space-y-2">
          {milestones.map((milestone, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              milestone.completed ? 'bg-green-50 border-green-200' : 'bg-white'
            }`}>
              <Checkbox
                checked={milestone.completed}
                onCheckedChange={() => toggleMilestone(index)}
                disabled={updateMutation.isPending}
              />
              <div className="flex-1">
                <p className={`font-medium text-sm ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {milestone.name}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>{milestone.due_date}</span>
                  <Badge variant="outline" className="text-xs">
                    {milestone.status || 'pending'}
                  </Badge>
                </div>
              </div>
              {editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium text-slate-700">
              {t({ en: 'Add New Milestone', ar: 'إضافة معلم جديد' })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder={t({ en: 'Milestone name', ar: 'اسم المعلم' })}
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
              />
              <Input
                type="date"
                value={newMilestone.due_date}
                onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
              />
            </div>
            <Button onClick={addMilestone} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}