import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, MessageSquare, FileText, CheckCircle2, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function PeerCollaborationHub({ programId }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    team_members: []
  });
  const [review, setReview] = useState({ rating: 5, feedback: '' });

  const { data: applications = [] } = useQuery({
    queryKey: ['program-participants', programId],
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

  const projects = program?.peer_projects || [];

  const createProjectMutation = useMutation({
    mutationFn: async (projectData) => {
      const newProjects = [...projects, {
        ...projectData,
        id: Date.now().toString(),
        created_date: new Date().toISOString(),
        created_by: user?.email || 'anonymous',
        reviews: []
      }];
      const { error } = await supabase
        .from('programs')
        .update({ peer_projects: newProjects })
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      setShowProjectForm(false);
      setNewProject({ title: '', description: '', team_members: [] });
      toast.success(t({ en: 'Team project created', ar: 'تم إنشاء مشروع الفريق' }));
    }
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ projectId, reviewData }) => {
      const updatedProjects = projects.map(p => 
        p.id === projectId ? {
          ...p,
          reviews: [...(p.reviews || []), {
            reviewer_email: user?.email || 'anonymous',
            rating: reviewData.rating,
            feedback: reviewData.feedback,
            review_date: new Date().toISOString()
          }]
        } : p
      );

      const { error } = await supabase
        .from('programs')
        .update({ peer_projects: updatedProjects })
        .eq('id', programId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      setShowReviewForm(null);
      setReview({ rating: 5, feedback: '' });
      toast.success(t({ en: 'Peer review submitted', ar: 'تم إرسال تقييم الأقران' }));
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t({ en: 'Peer Collaboration', ar: 'تعاون الأقران' })}
          </CardTitle>
          <Button size="sm" onClick={() => setShowProjectForm(!showProjectForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Team Project', ar: 'مشروع فريق' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showProjectForm && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
            <Input
              placeholder={t({ en: 'Project title', ar: 'عنوان المشروع' })}
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
            />
            <Textarea
              placeholder={t({ en: 'Project description and goals', ar: 'وصف المشروع والأهداف' })}
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => createProjectMutation.mutate(newProject)}
                disabled={!newProject.title || createProjectMutation.isPending}
              >
                {t({ en: 'Create', ar: 'إنشاء' })}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowProjectForm(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{project.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {project.team_members?.length || 0} {t({ en: 'members', ar: 'عضو' })}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {project.reviews?.length || 0} {t({ en: 'reviews', ar: 'تقييم' })}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowReviewForm(project.id)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {t({ en: 'Review', ar: 'تقييم' })}
                </Button>
              </div>

              {showReviewForm === project.id && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(r => (
                      <Star
                        key={r}
                        className={`h-5 w-5 cursor-pointer ${r <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        onClick={() => setReview({...review, rating: r})}
                      />
                    ))}
                  </div>
                  <Textarea
                    placeholder={t({ en: 'Your peer feedback...', ar: 'ملاحظاتك...' })}
                    value={review.feedback}
                    onChange={(e) => setReview({...review, feedback: e.target.value})}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => submitReviewMutation.mutate({ projectId: project.id, reviewData: review })}
                      disabled={submitReviewMutation.isPending}
                    >
                      {t({ en: 'Submit', ar: 'إرسال' })}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowReviewForm(null)}>
                      {t({ en: 'Cancel', ar: 'إلغاء' })}
                    </Button>
                  </div>
                </div>
              )}

              {project.reviews && project.reviews.length > 0 && showReviewForm !== project.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {project.reviews.slice(0, 2).map((r, i) => (
                    <div key={i} className="text-xs text-slate-600">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(r.rating)].map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-2">{r.reviewer_email}</span>
                      </div>
                      <p className="text-slate-700">{r.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {projects.length === 0 && !showProjectForm && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{t({ en: 'No team projects yet', ar: 'لا توجد مشاريع فريق بعد' })}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}