import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from './LanguageContext';
import { Rocket, X, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { createNotification } from './AutoNotification';

export default function RDProjectKickoffWorkflow({ project, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [kickoffDate, setKickoffDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectLead, setProjectLead] = useState(project.principal_investigator?.name || '');
  const [kickoffNotes, setKickoffNotes] = useState('');

  const kickoffMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.RDProject.update(project.id, {
        status: 'active',
        timeline: {
          ...project.timeline,
          start_date: data.kickoffDate,
          milestones: data.milestones
        },
        kickoff_notes: data.notes
      });

      await createNotification({
        title: 'R&D Project Kicked Off',
        body: `Research project "${project.title_en}" has officially started!`,
        type: 'success',
        priority: 'high',
        linkUrl: `RDProjectDetail?id=${project.id}`,
        entityType: 'rd_project',
        entityId: project.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-project']);
      toast.success(t({ en: 'Project kicked off successfully', ar: 'تم بدء المشروع بنجاح' }));
      onClose();
    }
  });

  const generateMilestones = () => {
    const duration = project.duration_months || 12;
    const milestones = [];
    
    // Generate quarterly milestones
    for (let i = 1; i <= Math.ceil(duration / 3); i++) {
      const monthOffset = i * 3;
      const dueDate = new Date(kickoffDate);
      dueDate.setMonth(dueDate.getMonth() + monthOffset);
      
      milestones.push({
        name: `Q${i} Review`,
        description: `Quarter ${i} progress review and deliverables`,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending',
        requires_approval: true,
        deliverables: [`Q${i} Progress Report`, `Updated Research Outputs`]
      });
    }

    // Add final milestone
    const endDate = new Date(kickoffDate);
    endDate.setMonth(endDate.getMonth() + duration);
    milestones.push({
      name: 'Final Deliverables',
      description: 'Complete all research outputs and final reporting',
      due_date: endDate.toISOString().split('T')[0],
      status: 'pending',
      requires_approval: true,
      deliverables: ['Final Research Report', 'All Publications', 'Datasets', 'Impact Assessment']
    });

    return milestones;
  };

  const handleKickoff = () => {
    const milestones = generateMilestones();
    kickoffMutation.mutate({
      kickoffDate,
      projectLead,
      notes: kickoffNotes,
      milestones
    });
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          {t({ en: 'Project Kickoff', ar: 'بدء المشروع' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{project.title_en}</p>
          <p className="text-xs text-slate-600 mt-1">{project.institution}</p>
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Official Start Date', ar: 'تاريخ البدء الرسمي' })}</Label>
          <Input
            type="date"
            value={kickoffDate}
            onChange={(e) => setKickoffDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Project Lead', ar: 'قائد المشروع' })}</Label>
          <Input
            value={projectLead}
            onChange={(e) => setProjectLead(e.target.value)}
            placeholder={t({ en: 'Name of project lead', ar: 'اسم قائد المشروع' })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ en: 'Kickoff Notes', ar: 'ملاحظات البدء' })}</Label>
          <Textarea
            value={kickoffNotes}
            onChange={(e) => setKickoffNotes(e.target.value)}
            placeholder={t({ en: 'Any notes from kickoff meeting...', ar: 'أي ملاحظات من اجتماع البدء...' })}
            rows={3}
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                {t({ en: 'Auto-Generated Milestones', ar: 'المعالم المُنشأة تلقائياً' })}
              </p>
              <p className="text-xs text-slate-700">
                {t({ 
                  en: `${Math.ceil((project.duration_months || 12) / 3)} quarterly review milestones + final deliverables will be created`, 
                  ar: `سيتم إنشاء ${Math.ceil((project.duration_months || 12) / 3)} معالم مراجعة ربع سنوية + المخرجات النهائية` 
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleKickoff}
            disabled={kickoffMutation.isPending || !kickoffDate}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Rocket className="h-4 w-4 mr-2" />
            {t({ en: 'Launch Project', ar: 'إطلاق المشروع' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}