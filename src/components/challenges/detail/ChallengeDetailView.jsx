/**
 * Challenge Detail View Component
 * Implements: dc-1 (structured layout), dc-2 (related entities), dc-3 (activity history)
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/components/permissions/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, MapPin, Building2, Target, Users, 
  FileText, Link2, Clock, AlertCircle, Lightbulb,
  BarChart3, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import ChallengeActivityTimeline from './ChallengeActivityTimeline';
import ChallengeRelatedEntities from './ChallengeRelatedEntities';
import ChallengeActions from './ChallengeActions';

// Status color mapping
const STATUS_COLORS = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  under_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  resolved: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
};

export function ChallengeDetailView({ challengeId, onClose, onUpdate }) {
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { isAdmin, hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch challenge details
  const { data: challenge, isLoading, error, refetch } = useQuery({
    queryKey: ['challenge-detail', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          municipalities:municipality_id(id, name_en, name_ar, logo_url),
          sectors:sector_id(id, name_en, name_ar, icon),
          regions:region_id(id, name_en, name_ar)
        `)
        .eq('id', challengeId)
        .eq('is_deleted', false)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId
  });
  
  // Check if user can edit
  const canEdit = isAdmin || 
    challenge?.challenge_owner_email === user?.email ||
    challenge?.review_assigned_to === user?.email ||
    hasPermission('challenges.edit');
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  // Error state
  if (error || !challenge) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'لم يتم العثور على التحدي' : 'Challenge Not Found'}
        </h3>
        <p className="text-muted-foreground mt-2">
          {language === 'ar' 
            ? 'التحدي المطلوب غير موجود أو ليس لديك صلاحية للوصول إليه' 
            : 'The requested challenge does not exist or you do not have permission to access it'}
        </p>
      </div>
    );
  }
  
  const title = language === 'ar' ? challenge.title_ar : challenge.title_en;
  const description = language === 'ar' ? challenge.description_ar : challenge.description_en;
  const municipality = challenge.municipalities;
  const sector = challenge.sectors;
  
  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header Section */}
      <div className="space-y-4">
        {/* Title and Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={STATUS_COLORS[challenge.status] || 'bg-muted'}>
                {challenge.status?.replace(/_/g, ' ')}
              </Badge>
              {challenge.priority && (
                <Badge variant="outline" className={PRIORITY_COLORS[challenge.priority]}>
                  {challenge.priority}
                </Badge>
              )}
              {challenge.is_featured && (
                <Badge variant="secondary">
                  {language === 'ar' ? 'مميز' : 'Featured'}
                </Badge>
              )}
              {challenge.is_confidential && (
                <Badge variant="destructive">
                  {language === 'ar' ? 'سري' : 'Confidential'}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {challenge.tagline_en && (
              <p className="text-muted-foreground">
                {language === 'ar' ? challenge.tagline_ar : challenge.tagline_en}
              </p>
            )}
          </div>
          
          {/* Actions (dc-4) */}
          <ChallengeActions 
            challenge={challenge} 
            canEdit={canEdit}
            onUpdate={() => {
              refetch();
              onUpdate?.();
            }}
          />
        </div>
        
        {/* Meta Information */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {municipality && (
            <div className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              <span>{language === 'ar' ? municipality.name_ar : municipality.name_en}</span>
            </div>
          )}
          {sector && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{language === 'ar' ? sector.name_ar : sector.name_en}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(challenge.created_at), 'PPP', { 
                locale: language === 'ar' ? ar : undefined 
              })}
            </span>
          </div>
          {challenge.citizen_votes_count > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{challenge.citizen_votes_count} {language === 'ar' ? 'صوت' : 'votes'}</span>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {language === 'ar' ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Lightbulb className="h-4 w-4" />
            {language === 'ar' ? 'التفاصيل' : 'Details'}
          </TabsTrigger>
          <TabsTrigger value="related" className="flex items-center gap-1">
            <Link2 className="h-4 w-4" />
            {language === 'ar' ? 'الروابط' : 'Related'}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {language === 'ar' ? 'النشاط' : 'Activity'}
          </TabsTrigger>
          {canEdit && (
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              {language === 'ar' ? 'التحليلات' : 'Analytics'}
            </TabsTrigger>
          )}
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Description */}
          {description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{description}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Problem Statement */}
          {(challenge.problem_statement_en || challenge.problem_statement_ar) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ar' ? 'بيان المشكلة' : 'Problem Statement'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">
                  {language === 'ar' ? challenge.problem_statement_ar : challenge.problem_statement_en}
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Current Situation & Desired Outcome */}
          <div className="grid md:grid-cols-2 gap-4">
            {(challenge.current_situation_en || challenge.current_situation_ar) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'الوضع الحالي' : 'Current Situation'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {language === 'ar' ? challenge.current_situation_ar : challenge.current_situation_en}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {(challenge.desired_outcome_en || challenge.desired_outcome_ar) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'النتيجة المرجوة' : 'Desired Outcome'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {language === 'ar' ? challenge.desired_outcome_ar : challenge.desired_outcome_en}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Root Cause */}
            {(challenge.root_cause_en || challenge.root_cause_ar) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'السبب الجذري' : 'Root Cause'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {language === 'ar' ? challenge.root_cause_ar : challenge.root_cause_en}
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ar' ? 'الميزانية والجدول الزمني' : 'Budget & Timeline'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {challenge.budget_estimate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'الميزانية المقدرة' : 'Estimated Budget'}
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-SA', {
                        style: 'currency',
                        currency: 'SAR'
                      }).format(challenge.budget_estimate)}
                    </span>
                  </div>
                )}
                {challenge.timeline_estimate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'الجدول الزمني المقدر' : 'Timeline Estimate'}
                    </span>
                    <span className="font-medium">{challenge.timeline_estimate}</span>
                  </div>
                )}
                {challenge.sla_due_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'تاريخ استحقاق SLA' : 'SLA Due Date'}
                    </span>
                    <span className="font-medium">
                      {format(new Date(challenge.sla_due_date), 'PP')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Tags & Keywords */}
          {(challenge.tags?.length > 0 || challenge.keywords?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ar' ? 'العلامات والكلمات المفتاحية' : 'Tags & Keywords'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {challenge.tags?.map((tag, i) => (
                    <Badge key={`tag-${i}`} variant="secondary">{tag}</Badge>
                  ))}
                  {challenge.keywords?.map((keyword, i) => (
                    <Badge key={`keyword-${i}`} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Affected Population */}
          {challenge.affected_population_size && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ar' ? 'السكان المتأثرون' : 'Affected Population'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-SA').format(
                      challenge.affected_population_size
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'شخص' : 'people'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Related Entities Tab (dc-2) */}
        <TabsContent value="related" className="mt-4">
          <ChallengeRelatedEntities challengeId={challengeId} challenge={challenge} />
        </TabsContent>
        
        {/* Activity Tab (dc-3) */}
        <TabsContent value="activity" className="mt-4">
          <ChallengeActivityTimeline challengeId={challengeId} />
        </TabsContent>
        
        {/* Analytics Tab */}
        {canEdit && (
          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'تحليلات التحدي' : 'Challenge Analytics'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{challenge.view_count || 0}</div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'المشاهدات' : 'Views'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{challenge.citizen_votes_count || 0}</div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الأصوات' : 'Votes'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{challenge.related_questions_count || 0}</div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الأسئلة' : 'Questions'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold">{challenge.linked_pilot_ids?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'التجارب' : 'Pilots'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default ChallengeDetailView;
