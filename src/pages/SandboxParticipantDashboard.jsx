import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSandboxes } from '@/hooks/useSandboxes';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import {
  Shield, Activity, FileText, AlertCircle, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';

function SandboxParticipantDashboard() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [dataSubmission, setDataSubmission] = React.useState({ metric: '', value: '', notes: '' });

  const {
    useMyApplications,
    useProjectMilestones,
    useMonitoringData,
    useSubmitMonitoringData
  } = useSandboxes();

  const { data: myApplications = [] } = useMyApplications(user);

  const projectIds = myApplications.map(a => a.id);
  const { data: milestones = [] } = useProjectMilestones(projectIds);

  const sandboxIds = [...new Set(myApplications.map(a => a.sandbox_id))];
  const { data: monitoringData = [] } = useMonitoringData(sandboxIds);

  const submitDataMutation = useSubmitMonitoringData();

  const handleSubmitData = () => {
    submitDataMutation.mutate({ selectedProject, data: dataSubmission, user }, {
      onSuccess: () => {
        setDataSubmission({ metric: '', value: '', notes: '' });
        setSelectedProject(null); // Close modal on success
      }
    });
  };

  const activeProjects = myApplications.filter(a => a.status === 'approved');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: '🛡️ My Sandbox Projects', ar: '🛡️ مشاريع منطقة التجريب' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Monitor your sandbox testing projects', ar: 'راقب مشاريع الاختبار الخاصة بك' })}
        </p>
      </div>

      {/* Active Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeProjects.map((project) => {
          const projectMilestones = milestones.filter(m => m.project_id === project.id);
          const completed = projectMilestones.filter(m => m.status === 'completed').length;
          const progress = projectMilestones.length > 0
            ? Math.round((completed / projectMilestones.length) * 100)
            : 0;

          return (
            <Card key={project.id} className="border-2 border-blue-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{project.project_title || 'Sandbox Project'}</CardTitle>
                  <Badge className="bg-blue-600 text-white">{project.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</p>
                    <p className="text-xl font-bold text-blue-600">{progress}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">{t({ en: 'Milestones', ar: 'المعالم' })}</p>
                    <p className="text-xl font-bold text-slate-900">{completed}/{projectMilestones.length}</p>
                  </div>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedProject(project)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t({ en: 'Submit Data', ar: 'إرسال بيانات' })}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    {t({ en: 'View Details', ar: 'التفاصيل' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activeProjects.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="pt-12 pb-12 text-center">
              <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">{t({ en: 'No active sandbox projects', ar: 'لا توجد مشاريع نشطة' })}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Monitoring Data */}
      {monitoringData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              {t({ en: 'Recent Monitoring Data', ar: 'البيانات الحديثة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monitoringData.slice(0, 10).map((data) => (
                <div key={data.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{data.metric_name}</p>
                    <p className="text-xs text-slate-500">{new Date(data.timestamp).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline">{data.value}</Badge>
                  {data.alert_triggered && (
                    <AlertCircle className="h-4 w-4 text-red-600 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Submission Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProject(null)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>{t({ en: 'Submit Project Data', ar: 'إرسال بيانات المشروع' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  {t({ en: 'Metric Name', ar: 'اسم المقياس' })}
                </label>
                <Input
                  placeholder={t({ en: 'e.g., Test Success Rate', ar: 'مثل: معدل نجاح الاختبار' })}
                  value={dataSubmission.metric}
                  onChange={(e) => setDataSubmission(prev => ({ ...prev, metric: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  {t({ en: 'Value', ar: 'القيمة' })}
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={dataSubmission.value}
                  onChange={(e) => setDataSubmission(prev => ({ ...prev, value: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  {t({ en: 'Notes', ar: 'ملاحظات' })}
                </label>
                <Textarea
                  placeholder={t({ en: 'Additional context...', ar: 'سياق إضافي...' })}
                  value={dataSubmission.notes}
                  onChange={(e) => setDataSubmission(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitData}
                  disabled={!dataSubmission.metric || !dataSubmission.value || submitDataMutation.isPending}
                  className="flex-1 bg-blue-600"
                >
                  {t({ en: 'Submit', ar: 'إرسال' })}
                </Button>
                <Button
                  onClick={() => setSelectedProject(null)}
                  variant="outline"
                  className="flex-1"
                >
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(SandboxParticipantDashboard, { requiredPermissions: [] });