import { useState } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { useSandboxMilestones } from '@/hooks/useSandboxMilestones';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SandboxMilestoneManager({ application }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useAppQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    milestone_name: '',
    description: '',
    due_date: '',
    deliverables: '',
    status: 'pending'
  });

  const { milestones, createMilestone, updateMilestone, deleteMilestone } = useSandboxMilestones(application?.id);

  const resetForm = () => {
    setFormData({
      milestone_name: '',
      description: '',
      due_date: '',
      deliverables: '',
      status: 'pending'
    });
    setEditingMilestone(null);
  };

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      milestone_name: milestone.milestone_name,
      description: milestone.description || '',
      due_date: milestone.due_date,
      deliverables: milestone.deliverables || '',
      status: milestone.status
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingMilestone) {
      updateMilestone.mutate(
        { id: editingMilestone.id, data: formData },
        {
          onSuccess: () => {
            setDialogOpen(false);
            resetForm();
          }
        }
      );
    } else {
      createMilestone.mutate(formData, {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const statusConfig = {
    pending: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-100' },
    in_progress: { icon: Circle, color: 'text-blue-600', bg: 'bg-blue-100' },
    completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    delayed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' }
  };

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {t({ en: 'Project Milestones', ar: 'معالم المشروع' })}
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMilestone
                    ? t({ en: 'Edit Milestone', ar: 'تعديل المعلم' })
                    : t({ en: 'New Milestone', ar: 'معلم جديد' })
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>{t({ en: 'Title', ar: 'العنوان' })}</Label>
                  <Input
                    value={formData.milestone_name}
                    onChange={(e) => setFormData({ ...formData, milestone_name: e.target.value })}
                    placeholder="Complete safety testing phase"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Description', ar: 'الوصف' })}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Target Date', ar: 'التاريخ المستهدف' })}</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Deliverables', ar: 'المخرجات' })}</Label>
                  <Textarea
                    value={formData.deliverables}
                    onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                    rows={2}
                    placeholder="Safety test report, compliance certificate"
                  />
                </div>
                <div>
                  <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {t({ en: 'Cancel', ar: 'إلغاء' })}
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.milestone_name}>
                    {t({ en: 'Save', ar: 'حفظ' })}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((milestone) => {
              const config = statusConfig[milestone.status] || statusConfig.pending;
              const Icon = config.icon;
              const isOverdue = new Date(milestone.due_date) < new Date() && milestone.status !== 'completed';

              return (
                <div key={milestone.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{milestone.milestone_name}</h4>
                        {milestone.description && (
                          <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge className={config.bg + ' ' + config.color}>
                            {milestone.status.replace(/_/g, ' ')}
                          </Badge>
                          <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {milestone.due_date}
                          </span>
                        </div>
                        {milestone.deliverables && (
                          <p className="text-xs text-slate-500 mt-2">
                            <strong>Deliverables:</strong> {milestone.deliverables}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(milestone)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMilestone.mutate(milestone.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">
            {t({ en: 'No milestones defined yet', ar: 'لم يتم تحديد معالم بعد' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

