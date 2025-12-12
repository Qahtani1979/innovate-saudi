import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Users,
  Target,
  Send,
  Loader2,
  CheckCircle2,
  Star,
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ExpertMatchingEnginePage() {
  const [entityType, setEntityType] = useState('challenge');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [matches, setMatches] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [hoursEstimated, setHoursEstimated] = useState(10);
  const [compensation, setCompensation] = useState(0);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, isLoading: matching, status, error, rateLimitInfo } = useAIWithFallback();
  const { user: currentUser } = useAuth();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data } = await supabase.from('solutions').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: rdProposals = [] } = useQuery({
    queryKey: ['rd-proposals'],
    queryFn: async () => {
      const { data } = await supabase.from('rd_proposals').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('rd_projects').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: programApps = [] } = useQuery({
    queryKey: ['program-apps'],
    queryFn: async () => {
      const { data } = await supabase.from('program_applications').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: matchmakerApps = [] } = useQuery({
    queryKey: ['matchmaker-apps'],
    queryFn: async () => {
      const { data } = await supabase.from('matchmaker_applications').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: scalingPlans = [] } = useQuery({
    queryKey: ['scaling-plans'],
    queryFn: async () => {
      const { data } = await supabase.from('scaling_plans').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    }
  });

  const { data: experts = [] } = useQuery({
    queryKey: ['expert-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('expert_profiles').select('*');
      return data || [];
    }
  });

  const { data: existingAssignments = [] } = useQuery({
    queryKey: ['all-expert-assignments'],
    queryFn: async () => {
      const { data } = await supabase.from('expert_assignments').select('*');
      return data || [];
    }
  });

  const assignMutation = useMutation({
    mutationFn: async (expertEmails) => {
      const assignments = expertEmails.map(email => ({
        expert_email: email,
        entity_type: entityType,
        entity_id: selectedEntityId,
        assignment_type: 'evaluator',
        assigned_date: new Date().toISOString(),
        assigned_by: currentUser?.email || '',
        due_date: dueDate || undefined,
        hours_estimated: hoursEstimated,
        compensation: compensation || undefined,
        notes: assignmentNotes || undefined,
        status: 'pending'
      }));

      const created = await Promise.all(assignments.map(a => base44.entities.ExpertAssignment.create(a)));

      // Send notifications
      for (const email of expertEmails) {
        try {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: `New Expert Assignment: ${entityType.replace(/_/g, ' ')}`,
            body: `You have been assigned to evaluate a ${entityType.replace(/_/g, ' ')}. Please check your Expert Assignment Queue.${dueDate ? `\n\nDue Date: ${dueDate}` : ''}${assignmentNotes ? `\n\nNotes: ${assignmentNotes}` : ''}`
          });
        } catch (error) {
          console.error('Failed to send notification to', email, error);
        }
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expert-assignments']);
      toast.success(t({ en: 'Experts assigned and notified', ar: 'تم تعيين وإخطار الخبراء' }));
      setSelectedExperts([]);
      setMatches([]);
      setDueDate('');
      setHoursEstimated(10);
      setCompensation(0);
      setAssignmentNotes('');
    }
  });

  const findMatches = async () => {
    if (!selectedEntityId) {
      toast.error(t({ en: 'Please select an entity', ar: 'يرجى اختيار كيان' }));
      return;
    }

    const entityMap = {
      challenge: challenges,
      pilot: pilots,
      solution: solutions,
      rd_proposal: rdProposals,
      rd_project: rdProjects,
      program_application: programApps,
      matchmaker_application: matchmakerApps,
      scaling_plan: scalingPlans
    };

    const entities = entityMap[entityType] || [];
    const entity = entities.find(e => e.id === selectedEntityId);

    if (!entity) {
      toast.error(t({ en: 'Entity not found', ar: 'لم يتم العثور على الكيان' }));
      return;
    }

    const entityDesc = entity.title_en || entity.name_en || entity.description_en || entity.abstract_en || '';
    const entitySector = entity.sector || entity.research_area_en || '';

    // Calculate expert workload
    const expertWorkload = {};
    existingAssignments.filter(a => ['pending', 'in_progress'].includes(a.status)).forEach(a => {
      expertWorkload[a.expert_email] = (expertWorkload[a.expert_email] || 0) + (a.hours_estimated || 0);
    });

    const prompt = `Match experts to this ${entityType}:

Entity: ${entityDesc.substring(0, 400)}
Sector: ${entitySector}

Available Experts:
${experts.filter(e => e.is_active && e.is_verified).map(e => {
  const workload = expertWorkload[e.user_email] || 0;
  return `- ${e.user_email}: ${e.expertise_areas?.join(', ')} | Sectors: ${e.sector_specializations?.join(', ')} | Available: ${Math.max(0, (e.availability_hours_per_month || 20) - workload)}h/month`;
}).join('\n')}

Return top 10 most relevant experts considering:
1. Expertise-entity alignment
2. Sector specialization match
3. Availability (prefer experts with >5h/month available)
4. Past performance (rating if >0)

Include match scores (0-100) and reasons.`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                expert_email: { type: 'string' },
                match_score: { type: 'number' },
                reason: { type: 'string' },
                availability_ok: { type: 'boolean' },
                potential_conflict: { type: 'boolean' }
              }
            }
          }
        }
      }
    });

    if (result.success && result.data?.matches) {
      const matchedExperts = result.data.matches.map(m => {
        const expertData = experts.find(e => e.user_email === m.expert_email);
        const currentWorkload = expertWorkload[m.expert_email] || 0;
        const availableHours = Math.max(0, (expertData?.availability_hours_per_month || 20) - currentWorkload);
        
        return {
          ...expertData,
          match_score: m.match_score,
          match_reason: m.reason,
          availability_ok: m.availability_ok,
          potential_conflict: m.potential_conflict,
          current_workload: currentWorkload,
          available_hours: availableHours
        };
      }).filter(e => e.id);

      setMatches(matchedExperts);
      toast.success(t({ en: 'AI matching complete', ar: 'اكتملت المطابقة الذكية' }));
    }
  };

  const getEntitiesByType = () => {
    const map = {
      challenge: challenges,
      pilot: pilots,
      solution: solutions,
      rd_proposal: rdProposals,
      rd_project: rdProjects,
      program_application: programApps,
      matchmaker_application: matchmakerApps,
      scaling_plan: scalingPlans
    };
    return map[entityType] || [];
  };

  const entities = getEntitiesByType();

  return (
    <PageLayout>
      <PageHeader
        icon={Zap}
        title={t({ en: 'Expert Matching Engine', ar: 'محرك مطابقة الخبراء' })}
        description={t({ en: 'AI-powered expert assignment with workload balancing', ar: 'تعيين الخبراء بالذكاء الاصطناعي مع توازن الأعباء' })}
        stats={[
          { icon: Users, value: experts.filter(e => e.is_verified).length, label: t({ en: 'Verified Experts', ar: 'خبراء موثقين' }) },
          { icon: Target, value: matches.length, label: t({ en: 'Matches Found', ar: 'مطابقات' }) },
        ]}
      />

      {/* Selection Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {t({ en: 'Select Entity & Assignment Details', ar: 'اختر الكيان وتفاصيل المهمة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Entity Type', ar: 'نوع الكيان' })}
              </label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="challenge">{t({ en: 'Challenge', ar: 'تحدي' })}</SelectItem>
                  <SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجربة' })}</SelectItem>
                  <SelectItem value="solution">{t({ en: 'Solution', ar: 'حل' })}</SelectItem>
                  <SelectItem value="rd_proposal">{t({ en: 'R&D Proposal', ar: 'مقترح بحث' })}</SelectItem>
                  <SelectItem value="rd_project">{t({ en: 'R&D Project', ar: 'مشروع بحث' })}</SelectItem>
                  <SelectItem value="program_application">{t({ en: 'Program Application', ar: 'طلب برنامج' })}</SelectItem>
                  <SelectItem value="matchmaker_application">{t({ en: 'Matchmaker Application', ar: 'طلب التوفيق' })}</SelectItem>
                  <SelectItem value="scaling_plan">{t({ en: 'Scaling Plan', ar: 'خطة التوسع' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Select Entity', ar: 'اختر الكيان' })}
              </label>
              <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Choose...', ar: 'اختر...' })} />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.title_en || entity.name_en || entity.code || 'Untitled'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                <Calendar className="h-4 w-4 inline mr-1" />
                {t({ en: 'Due Date', ar: 'تاريخ الاستحقاق' })}
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                <Clock className="h-4 w-4 inline mr-1" />
                {t({ en: 'Hours Estimated', ar: 'الساعات المقدرة' })}
              </label>
              <Input
                type="number"
                value={hoursEstimated}
                onChange={(e) => setHoursEstimated(parseInt(e.target.value))}
                min={1}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                <DollarSign className="h-4 w-4 inline mr-1" />
                {t({ en: 'Compensation (SAR)', ar: 'التعويض (ريال)' })}
              </label>
              <Input
                type="number"
                value={compensation}
                onChange={(e) => setCompensation(parseFloat(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Assignment Notes (optional)', ar: 'ملاحظات المهمة (اختياري)' })}
            </label>
            <Textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder={t({ en: 'Any special instructions...', ar: 'أي تعليمات خاصة...' })}
              rows={2}
            />
          </div>

          <Button
            onClick={findMatches}
            disabled={!selectedEntityId || matching}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {matching ? (
              <Loader2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <Sparkles className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Find Best Matches (AI)', ar: 'البحث عن أفضل مطابقات (ذكاء)' })}
          </Button>
        </CardContent>
      </Card>

      {/* Matches */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {t({ en: 'AI-Recommended Experts', ar: 'الخبراء الموصى بهم' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {matches.map((expert) => (
              <div key={expert.id} className={`p-4 border-2 rounded-lg transition-all ${
                expert.potential_conflict ? 'border-red-300 bg-red-50' :
                !expert.availability_ok ? 'border-amber-300 bg-amber-50' :
                'border-slate-200 hover:border-purple-300'
              }`}>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {expert.user_email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{expert.title} {expert.user_email?.split('@')[0]}</h4>
                          {expert.is_verified && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-slate-600">{expert.position}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {expert.expert_rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-amber-600">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{expert.expert_rating.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="text-xs text-slate-500">
                            {expert.available_hours}h available
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{expert.match_score}%</div>
                        <div className="text-xs text-slate-500">{t({ en: 'Match', ar: 'تطابق' })}</div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 mb-2">{expert.match_reason}</p>

                    {expert.potential_conflict && (
                      <div className="p-2 bg-red-100 border border-red-300 rounded mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-700">{t({ en: 'Potential conflict of interest', ar: 'تضارب محتمل في المصالح' })}</span>
                      </div>
                    )}

                    {!expert.availability_ok && (
                      <div className="p-2 bg-amber-100 border border-amber-300 rounded mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-xs text-amber-700">{t({ en: 'Low availability - overloaded', ar: 'توفر منخفض - محمّل' })}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mb-3">
                      {expert.expertise_areas?.slice(0, 4).map((area, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      variant={selectedExperts.includes(expert.user_email) ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedExperts(prev =>
                          prev.includes(expert.user_email)
                            ? prev.filter(e => e !== expert.user_email)
                            : [...prev, expert.user_email]
                        );
                      }}
                      className={selectedExperts.includes(expert.user_email) ? 'bg-green-600' : ''}
                      disabled={expert.potential_conflict}
                    >
                      {selectedExperts.includes(expert.user_email) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {t({ en: 'Selected', ar: 'محدد' })}
                        </>
                      ) : (
                        t({ en: 'Select', ar: 'اختر' })
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {selectedExperts.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-700">
                    {selectedExperts.length} {t({ en: 'experts selected', ar: 'خبراء محددين' })}
                  </span>
                </div>
                <Button
                  onClick={() => assignMutation.mutate(selectedExperts)}
                  disabled={assignMutation.isPending || !dueDate}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600"
                >
                  {assignMutation.isPending ? (
                    <Loader2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                  ) : (
                    <Send className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  )}
                  {t({ en: 'Send Assignments & Notify', ar: 'إرسال المهام وإخطار' })}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(ExpertMatchingEnginePage, {
  requiredPermissions: ['expert_assign']
});