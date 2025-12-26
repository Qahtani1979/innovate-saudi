import { useState } from 'react';
import { useExpertAssignmentsWithDetails } from '@/hooks/useExpertData';
import { useExpertAssignmentMutations } from '@/hooks/useExpertAssignmentMutations';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Target,
  FileText,
  Loader2,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ExpertAssignmentQueue() {
  const { language, isRTL, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('pending');
  const { user } = useAuth();

  const { data: assignmentDetails = [], isLoading } = useExpertAssignmentsWithDetails(user?.email);
  // Derive assignments for stats total if needed, or just use assignmentDetails length.
  // The original code used `assignments.length` for total. assignmentDetails has the same length.
  const assignments = assignmentDetails;

  const { acceptAssignment, declineAssignment } = useExpertAssignmentMutations();


  const pendingAssignments = assignmentDetails.filter(a => a.status === 'pending');
  const activeAssignments = assignmentDetails.filter(a => ['accepted', 'in_progress'].includes(a.status));
  const completedAssignments = assignmentDetails.filter(a => a.status === 'completed');

  const getEntityLabel = (type) => {
    const labels = {
      challenge: t({ en: 'Challenge', ar: 'تحدي' }),
      pilot: t({ en: 'Pilot', ar: 'تجربة' }),
      rd_project: t({ en: 'R&D Project', ar: 'مشروع بحث' }),
      rd_proposal: t({ en: 'R&D Proposal', ar: 'مقترح بحث' }),
      program: t({ en: 'Program', ar: 'برنامج' }),
      solution: t({ en: 'Solution', ar: 'حل' })
    };
    return labels[type] || type;
  };

  const getAssignmentTypeLabel = (type) => {
    const labels = {
      evaluator: t({ en: 'Evaluator', ar: 'مقيّم' }),
      mentor: t({ en: 'Mentor', ar: 'مرشد' }),
      advisor: t({ en: 'Advisor', ar: 'مستشار' }),
      reviewer: t({ en: 'Reviewer', ar: 'مراجع' }),
      panel_member: t({ en: 'Panel Member', ar: 'عضو لجنة' })
    };
    return labels[type] || type;
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700'
  };

  return (
    <PageLayout>
      <PageHeader
        icon={ClipboardList}
        title={t({ en: 'My Expert Assignments', ar: 'مهامي كخبير' })}
        description={t({ en: 'Manage your evaluation and advisory assignments', ar: 'إدارة مهام التقييم والاستشارة' })}
        stats={[
          { icon: AlertCircle, value: pendingAssignments.length, label: t({ en: 'Pending', ar: 'معلقة' }) },
          { icon: Clock, value: activeAssignments.length, label: t({ en: 'Active', ar: 'نشطة' }) },
          { icon: CheckCircle2, value: completedAssignments.length, label: t({ en: 'Completed', ar: 'مكتملة' }) },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلقة' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingAssignments.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشطة' })}</p>
                <p className="text-3xl font-bold text-blue-600">{activeAssignments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
                <p className="text-3xl font-bold text-green-600">{completedAssignments.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'المجموع' })}</p>
                <p className="text-3xl font-bold text-purple-600">{assignments.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            {t({ en: 'Pending', ar: 'معلقة' })} ({pendingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            {t({ en: 'Active', ar: 'نشطة' })} ({activeAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t({ en: 'Completed', ar: 'مكتملة' })} ({completedAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">{t({ en: 'No pending assignments', ar: 'لا توجد مهام معلقة' })}</p>
              </CardContent>
            </Card>
          ) : (
            pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-l-4 border-yellow-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {getAssignmentTypeLabel(assignment.assignment_type)}
                        </Badge>
                        <Badge variant="outline">
                          {getEntityLabel(assignment.entity_type)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {assignment.entity?.title_en || assignment.entity?.name_en || t({ en: 'New Assignment', ar: 'مهمة جديدة' })}
                      </h3>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{t({ en: 'Assigned:', ar: 'تاريخ التعيين:' })} {new Date(assignment.assigned_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        </div>
                        {assignment.due_date && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{t({ en: 'Due:', ar: 'موعد التسليم:' })} {new Date(assignment.due_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                          </div>
                        )}
                        {assignment.hours_estimated && (
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>{t({ en: 'Estimated:', ar: 'المدة المقدرة:' })} {assignment.hours_estimated} {t({ en: 'hours', ar: 'ساعة' })}</span>
                          </div>
                        )}
                      </div>
                      {assignment.notes && (
                        <p className="text-sm text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                          {assignment.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => acceptAssignment.mutate(assignment.id)}
                      disabled={acceptAssignment.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {acceptAssignment.isPending ? (
                        <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                      ) : (
                        <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      )}
                      {t({ en: 'Accept', ar: 'قبول' })}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const reason = prompt(t({ en: 'Reason for declining (optional):', ar: 'سبب الرفض (اختياري):' }));
                        if (reason !== null) {
                          declineAssignment.mutate({ id: assignment.id, reason });
                        }
                      }}
                      disabled={declineAssignment.isPending}
                    >
                      <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Decline', ar: 'رفض' })}
                    </Button>
                    <Link to={createPageUrl(`ExpertEvaluationWorkflow?assignment_id=${assignment.id}`)}>
                      <Button variant="outline">
                        <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeAssignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">{t({ en: 'No active assignments', ar: 'لا توجد مهام نشطة' })}</p>
              </CardContent>
            </Card>
          ) : (
            activeAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-l-4 border-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusColors[assignment.status]}>
                          {assignment.status === 'accepted' ? t({ en: 'Accepted', ar: 'مقبول' }) : t({ en: 'In Progress', ar: 'قيد التنفيذ' })}
                        </Badge>
                        <Badge variant="outline">
                          {getEntityLabel(assignment.entity_type)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {assignment.entity?.title_en || assignment.entity?.name_en || getAssignmentTypeLabel(assignment.assignment_type)}
                      </h3>
                      {assignment.due_date && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span>{t({ en: 'Due:', ar: 'الموعد:' })} {new Date(assignment.due_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link to={createPageUrl(`ExpertEvaluationWorkflow?assignment_id=${assignment.id}`)}>
                    <Button className="w-full">
                      <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Continue Evaluation', ar: 'متابعة التقييم' })}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAssignments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">{t({ en: 'No completed assignments yet', ar: 'لا توجد مهام مكتملة بعد' })}</p>
              </CardContent>
            </Card>
          ) : (
            completedAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-l-4 border-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-green-100 text-green-700">
                      {t({ en: 'Completed', ar: 'مكتمل' })}
                    </Badge>
                    <Badge variant="outline">
                      {getEntityLabel(assignment.entity_type)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {getAssignmentTypeLabel(assignment.assignment_type)}
                  </h3>
                  <div className="text-sm text-slate-600">
                    {t({ en: 'Completed:', ar: 'اكتمل في:' })} {new Date(assignment.completed_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(ExpertAssignmentQueue, { requiredPermissions: ['expert_evaluate'] });