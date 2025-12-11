import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Plus, CheckCircle2, Clock, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ParticipantAssignmentSystem({ programId }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    points: 10
  });

  const { data: program } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!programId
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['program-applications', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_applications')
        .select('*')
        .eq('program_id', programId)
        .eq('status', 'accepted');
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const assignments = program?.assignments || [];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('programs')
        .update({
          assignments: [...assignments, {
            ...data,
            id: Date.now().toString(),
            created_date: new Date().toISOString(),
            created_by: user?.email,
            submissions: []
          }]
        })
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program', programId]);
      setShowForm(false);
      setNewAssignment({ title: '', description: '', due_date: '', points: 10 });
      toast.success(t({ en: 'Assignment created', ar: 'تم إنشاء المهمة' }));
    }
  });

  const getSubmissionCount = (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    return assignment?.submissions?.length || 0;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'Assignments & Deliverables', ar: 'المهام والمخرجات' })}
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Assignment', ar: 'مهمة جديدة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
            <Input
              placeholder={t({ en: 'Assignment title', ar: 'عنوان المهمة' })}
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
            />
            <Textarea
              placeholder={t({ en: 'Instructions and requirements', ar: 'التعليمات والمتطلبات' })}
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="date"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
              />
              <Input
                type="number"
                placeholder={t({ en: 'Points', ar: 'النقاط' })}
                value={newAssignment.points}
                onChange={(e) => setNewAssignment({...newAssignment, points: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => createMutation.mutate(newAssignment)}
                disabled={!newAssignment.title || createMutation.isPending}
              >
                {t({ en: 'Create', ar: 'إنشاء' })}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {assignments.length > 0 ? (
            assignments.map((assignment, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{assignment.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{assignment.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {assignment.due_date}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {assignment.points} points
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {getSubmissionCount(assignment.id)}/{applications.length}
                    </p>
                    <p className="text-xs text-slate-500">{t({ en: 'submitted', ar: 'مقدم' })}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No assignments yet', ar: 'لا توجد مهام بعد' })}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
