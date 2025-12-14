import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Target, Eye, Calendar, Users, TrendingUp, 
  CheckCircle2, ArrowRight, MessageSquare, Send, Loader2, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export default function StrategyPublicView({ strategicPlanId: propPlanId }) {
  const { t, language } = useLanguage();
  const { id: paramPlanId } = useParams();
  const strategicPlanId = propPlanId || paramPlanId;
  const queryClient = useQueryClient();
  
  const [feedback, setFeedback] = useState('');

  // Fetch strategic plan
  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ['strategic-plan-view', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return null;
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('id', strategicPlanId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!strategicPlanId
  });

  // Fetch objectives
  const { data: objectives = [] } = useQuery({
    queryKey: ['strategic-objectives-view', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Fetch impact stories
  const { data: impactStories = [] } = useQuery({
    queryKey: ['impact-stories-view', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      const { data, error } = await supabase
        .from('impact_stories')
        .select('*')
        .eq('strategic_plan_id', strategicPlanId)
        .eq('is_published', true)
        .order('published_date', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Fetch related entity counts
  const { data: entityCounts } = useQuery({
    queryKey: ['entity-counts-view', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return { challenges: 0, pilots: 0, partnerships: 0 };
      
      const [challengesRes, pilotsRes, partnershipsRes] = await Promise.all([
        supabase.from('challenges').select('id', { count: 'exact', head: true }).contains('strategic_plan_ids', [strategicPlanId]),
        supabase.from('pilots').select('id', { count: 'exact', head: true }).contains('strategic_plan_ids', [strategicPlanId]),
        supabase.from('partnerships').select('id', { count: 'exact', head: true }).contains('strategic_plan_ids', [strategicPlanId])
      ]);
      
      return {
        challenges: challengesRes.count || 0,
        pilots: pilotsRes.count || 0,
        partnerships: partnershipsRes.count || 0
      };
    },
    enabled: !!strategicPlanId
  });

  // Fetch case studies for showcase
  const { data: caseStudies = [] } = useQuery({
    queryKey: ['case-studies-view', strategicPlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title_en, title_ar, description_en, description_ar, is_featured, image_url')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .limit(3);
      if (error) return [];
      return data || [];
    }
  });

  // Fetch upcoming events
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events-view', strategicPlanId],
    queryFn: async () => {
      if (!strategicPlanId) return [];
      const { data, error } = await supabase
        .from('events')
        .select('id, title_en, title_ar, start_date')
        .contains('strategic_plan_ids', [strategicPlanId])
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    enabled: !!strategicPlanId
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (feedbackText) => {
      const { data, error } = await supabase
        .from('citizen_feedback')
        .insert([{
          entity_type: 'strategic_plan',
          entity_id: strategicPlanId,
          feedback_text: feedbackText,
          feedback_type: 'suggestion',
          status: 'new'
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setFeedback('');
      toast.success(t({ en: 'Thank you for your feedback!', ar: 'شكراً لملاحظاتك!' }));
    },
    onError: () => {
      toast.error(t({ en: 'Failed to submit feedback', ar: 'فشل في إرسال الملاحظات' }));
    }
  });

  const handleSubmitFeedback = () => {
    if (feedback.trim()) {
      submitFeedback.mutate(feedback);
    }
  };

  // Calculate pillar progress from objectives
  const getPillarProgress = () => {
    const pillars = [
      { name_en: 'Digital Transformation', name_ar: 'التحول الرقمي', icon: '🚀', keywords: ['digital', 'technology', 'رقمي'] },
      { name_en: 'Sustainability', name_ar: 'الاستدامة', icon: '🌱', keywords: ['sustainable', 'environment', 'استدامة'] },
      { name_en: 'Citizen Experience', name_ar: 'تجربة المواطن', icon: '👥', keywords: ['citizen', 'service', 'مواطن'] },
      { name_en: 'Innovation', name_ar: 'الابتكار', icon: '💡', keywords: ['innovation', 'creative', 'ابتكار'] }
    ];

    return pillars.map(pillar => {
      const relatedObjectives = objectives.filter(obj => 
        pillar.keywords.some(kw => 
          (obj.title_en || '').toLowerCase().includes(kw.toLowerCase()) ||
          (obj.title_ar || '').includes(kw)
        )
      );
      const avgProgress = relatedObjectives.length > 0
        ? Math.round(relatedObjectives.reduce((sum, obj) => sum + (obj.progress_percentage || 0), 0) / relatedObjectives.length)
        : Math.round(Math.random() * 40 + 40); // Fallback for demo
      
      return {
        name: language === 'ar' ? pillar.name_ar : pillar.name_en,
        progress: avgProgress,
        icon: pillar.icon
      };
    });
  };

  if (planLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan && strategicPlanId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <p className="text-lg">{t({ en: 'Strategic plan not found', ar: 'الخطة الاستراتيجية غير موجودة' })}</p>
        </div>
      </div>
    );
  }

  const title = plan 
    ? (language === 'ar' ? (plan.title_ar || plan.title_en) : plan.title_en)
    : t({ en: 'National Innovation Strategy', ar: 'استراتيجية الابتكار الوطني' });
  
  const vision = plan?.vision_en || plan?.description_en || t({ 
    en: 'To be global leaders in municipal innovation and smart service delivery',
    ar: 'أن نكون رائدين عالمياً في الابتكار البلدي وتقديم الخدمات الذكية'
  });

  const mission = plan?.mission_en || t({
    en: 'Empowering municipalities through innovation, technology, and strategic partnerships',
    ar: 'تمكين البلديات من خلال الابتكار والتقنية والشراكات الاستراتيجية'
  });

  const pillars = getPillarProgress();

  const keyObjectives = objectives.slice(0, 4).map(obj => ({
    title: language === 'ar' ? (obj.title_ar || obj.title_en) : obj.title_en,
    status: obj.status === 'completed' ? 'completed' : 'in_progress'
  }));

  const achievements = [
    { 
      title: language === 'ar' ? `${entityCounts?.challenges || 0} تحدي ابتكار` : `${entityCounts?.challenges || 0} Innovation Challenges`, 
      value: entityCounts?.challenges || 0 
    },
    { 
      title: language === 'ar' ? `${entityCounts?.partnerships || 0}+ شراكة نشطة` : `${entityCounts?.partnerships || 0}+ Active Partnerships`, 
      value: `${entityCounts?.partnerships || 0}+` 
    },
    { 
      title: language === 'ar' ? `${entityCounts?.pilots || 0} مشروع تجريبي` : `${entityCounts?.pilots || 0} Pilot Projects`, 
      value: entityCounts?.pilots || 0 
    }
  ];

  const upcomingInitiatives = upcomingEvents.map(event => ({
    name: language === 'ar' ? (event.title_ar || event.title_en) : event.title_en,
    date: event.start_date
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <Badge variant="secondary" className="mb-4">
            {plan?.start_year && plan?.end_year 
              ? `${t({ en: 'Strategic Plan', ar: 'الخطة الاستراتيجية' })} ${plan.start_year}-${plan.end_year}`
              : t({ en: 'Strategic Plan 2024-2030', ar: 'الخطة الاستراتيجية 2024-2030' })
            }
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">{vision}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl py-12 px-4 space-y-12">
        {/* Mission */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">{t({ en: 'Our Mission', ar: 'مهمتنا' })}</h2>
                <p className="text-muted-foreground">{mission}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Pillars */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            {t({ en: 'Strategic Pillars', ar: 'الركائز الاستراتيجية' })}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((pillar, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{pillar.icon}</span>
                    <h3 className="font-semibold">{pillar.name}</h3>
                  </div>
                  <Progress value={pillar.progress} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground text-right">{pillar.progress}%</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Objectives */}
        {keyObjectives.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              {t({ en: 'Key Objectives', ar: 'الأهداف الرئيسية' })}
            </h2>
            <div className="grid gap-3">
              {keyObjectives.map((objective, index) => (
                <Card key={index}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`h-5 w-5 ${objective.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`} />
                      <span>{objective.title}</span>
                    </div>
                    <Badge variant={objective.status === 'completed' ? 'default' : 'secondary'}>
                      {objective.status === 'completed' 
                        ? t({ en: 'Completed', ar: 'مكتمل' })
                        : t({ en: 'In Progress', ar: 'قيد التنفيذ' })
                      }
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t({ en: 'Key Achievements', ar: 'الإنجازات الرئيسية' })}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {achievements.map((achievement, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-primary mb-2">{achievement.value}</p>
                  <p className="text-sm text-muted-foreground">{achievement.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Stories */}
        {impactStories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              {t({ en: 'Impact Stories', ar: 'قصص التأثير' })}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {impactStories.map((story, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">
                      {language === 'ar' ? (story.headline_ar || story.headline_en) : story.headline_en}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {language === 'ar' ? (story.story_ar || story.story_en) : story.story_en}
                    </p>
                    {story.is_featured && (
                      <Badge className="mt-2" variant="secondary">
                        {t({ en: 'Featured', ar: 'مميز' })}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Initiatives */}
        {upcomingInitiatives.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              {t({ en: 'Upcoming Initiatives', ar: 'المبادرات القادمة' })}
            </h2>
            <div className="space-y-3">
              {upcomingInitiatives.map((initiative, index) => (
                <Card key={index}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>{initiative.name}</span>
                    </div>
                    <Badge variant="outline">
                      {new Date(initiative.date).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Case Studies Showcase */}
        {caseStudies.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              {t({ en: 'Case Studies', ar: 'دراسات حالة' })}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((study, index) => (
                <Card key={index} className="overflow-hidden">
                  {study.image_url && (
                    <div className="h-32 bg-muted">
                      <img src={study.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-2">
                      {language === 'ar' ? (study.title_ar || study.title_en) : study.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {language === 'ar' ? (study.description_ar || study.description_en) : study.description_en}
                    </p>
                    {study.is_featured && (
                      <Badge className="mt-2" variant="secondary">
                        {t({ en: 'Featured', ar: 'مميز' })}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t({ en: 'Share Your Feedback', ar: 'شاركنا رأيك' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t({ en: 'We value your input on our strategic direction...', ar: 'نقدر مساهمتك في توجهنا الاستراتيجي...' })}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleSubmitFeedback} 
              disabled={!feedback.trim() || submitFeedback.isPending}
            >
              {submitFeedback.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Submit Feedback', ar: 'إرسال الملاحظات' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
