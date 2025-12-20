import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Activity, CheckCircle, TrendingUp, Database, Zap, Users } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import SecurityHeadersConfig from '@/components/security/SecurityHeadersConfig';
import RateLimitingConfig from '@/components/api/RateLimitingConfig';
import TestingDashboard from '@/components/testing/TestingDashboard';
import BackupScheduler from '@/components/backup/BackupScheduler';
import RedisDeploymentPanel from '@/components/infrastructure/RedisDeploymentPanel';
import APMIntegrationPanel from '@/components/infrastructure/APMIntegrationPanel';
import BackendSecurityAudit from '@/components/security/BackendSecurityAudit';
import CSRFProtection from '@/components/security/CSRFProtection';
import InputValidationMiddleware from '@/components/security/InputValidationMiddleware';
import SessionTokenSecurity from '@/components/security/SessionTokenSecurity';
import DataEncryptionConfig from '@/components/security/DataEncryptionConfig';
import ThreatDetectionSystem from '@/components/security/ThreatDetectionSystem';
import DatabaseIndexing from '@/components/infrastructure/DatabaseIndexing';
import DatabaseIndexStrategy from '@/components/infrastructure/DatabaseIndexStrategy';
import ConnectionPoolingConfig from '@/components/performance/ConnectionPoolingConfig';
import PerformanceMetrics from '@/components/performance/PerformanceMetrics';
import PerformanceProfiler from '@/components/monitoring/PerformanceProfiler';
import APIGatewayConfig from '@/components/infrastructure/APIGatewayConfig';
import LoadBalancerConfig from '@/components/infrastructure/LoadBalancerConfig';
import MonitoringDashboard from '@/components/infrastructure/MonitoringDashboard';
import LoggingConfig from '@/components/infrastructure/LoggingConfig';
import AlertingSystem from '@/components/infrastructure/AlertingSystem';
import AlertManagementSystem from '@/components/monitoring/AlertManagementSystem';
import AutomatedBackupSystem from '@/components/backup/AutomatedBackupSystem';
import DeploymentPipeline from '@/components/deployment/DeploymentPipeline';
import TestAutomationDashboard from '@/components/testing/TestAutomationDashboard';
import UnitTestCoverage from '@/components/testing/UnitTestCoverage';
import IntegrationTestRunner from '@/components/testing/IntegrationTestRunner';
import E2ETestRunner from '@/components/testing/E2ETestRunner';
import ErrorBoundarySystem from '@/components/errors/ErrorBoundarySystem';
import QueryOptimizationPanel from '@/components/security/QueryOptimizationPanel';
import VotingSystemBackend from '@/components/citizen/VotingSystemBackend';
import IdeaToChallengeConverter from '@/components/citizen/IdeaToChallengeConverter';
import NewsPublishingWorkflow from '@/components/news/NewsPublishingWorkflow';
import OpenDataAPIDocumentation from '@/components/opendata/OpenDataAPIDocumentation';
import E2ETestingSuite from '@/components/testing/E2ETestingSuite';
import CICDPipeline from '@/components/cicd/CICDPipeline';
import WebSocketServer from '@/components/integration/WebSocketServer';
import PushNotificationConfig from '@/components/integration/PushNotificationConfig';
import WebhookBuilder from '@/components/webhooks/WebhookBuilder';
import ImageCDNConfig from '@/components/cdn/ImageCDNConfig';
import MobileOptimizationPanel from '@/components/mobile/MobileOptimizationPanel';
import NativeMobileApp from '@/components/mobile/NativeMobileApp';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import WidgetLibrary from '@/components/dashboards/WidgetLibrary';
import { VoiceAssistant } from '@/components/voice/VoiceAssistant';

export default function SystemHealthDashboard() {
  const { language, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-health'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('id').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-health'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('id').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities-health'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_activities')
        .select('id, activity_type, description, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
    }
  });

  const { data: expertProfiles = [] } = useQuery({
    queryKey: ['experts-health'],
    queryFn: async () => {
      const { data } = await supabase.from('expert_profiles').select('id, is_active');
      return data || [];
    }
  });

  const { data: expertAssignments = [] } = useQuery({
    queryKey: ['assignments-health'],
    queryFn: async () => {
      const { data } = await supabase.from('expert_assignments').select('id, status, due_date');
      return data || [];
    }
  });

  const { data: expertEvaluations = [] } = useQuery({
    queryKey: ['evaluations-health'],
    queryFn: async () => {
      const { data } = await supabase.from('expert_evaluations').select('id');
      return data || [];
    }
  });

  const activeExperts = expertProfiles.filter(e => e.is_active).length;
  const pendingAssignments = expertAssignments.filter(a => a.status === 'pending').length;
  const overdueAssignments = expertAssignments.filter(a => 
    a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed'
  ).length;
  const expertSystemHealth = overdueAssignments > 0 ? 'warning' : pendingAssignments > 10 ? 'warning' : 'success';

  const healthMetrics = [
    {
      label: { en: 'Platform Status', ar: 'حالة المنصة' },
      value: 'Operational',
      status: 'success',
      icon: CheckCircle
    },
    {
      label: { en: 'Database', ar: 'قاعدة البيانات' },
      value: `${challenges.length + pilots.length} records`,
      status: 'success',
      icon: Database
    },
    {
      label: { en: 'Activity Rate', ar: 'معدل النشاط' },
      value: `${activities.length} / hour`,
      status: 'success',
      icon: Activity
    },
    {
      label: { en: 'Response Time', ar: 'وقت الاستجابة' },
      value: '< 200ms',
      status: 'success',
      icon: Zap
    }
  ];

  return (
    <PageLayout>
      <PageHeader
        icon={Activity}
        title={t({ en: 'System Health', ar: 'صحة النظام' })}
        description={t({ en: 'Monitor platform performance and status', ar: 'مراقبة أداء وحالة المنصة' })}
        stats={[
          { icon: CheckCircle, value: '99.9%', label: t({ en: 'Uptime', ar: 'وقت التشغيل' }) },
          { icon: Database, value: healthMetrics[1]?.value, label: t({ en: 'Data Records', ar: 'سجلات البيانات' }) },
          { icon: Zap, value: '< 200ms', label: t({ en: 'Response Time', ar: 'زمن الاستجابة' }) },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {healthMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <Card key={i} className="border-2 border-green-200">
              <CardContent className="pt-6 text-center">
                <Icon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-sm text-slate-600">{metric.label[language]}</p>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  {t({ en: 'Healthy', ar: 'سليم' })}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expert System Health */}
      <Card className={`border-2 ${expertSystemHealth === 'success' ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t({ en: 'Expert System Health', ar: 'صحة نظام الخبراء' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{activeExperts}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Active Experts', ar: 'خبراء نشطون' })}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{pendingAssignments}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className={`text-2xl font-bold ${overdueAssignments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {overdueAssignments}
              </p>
              <p className="text-xs text-slate-600">{t({ en: 'Overdue', ar: 'متأخر' })}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {expertEvaluations.length}
              </p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Reviews', ar: 'إجمالي المراجعات' })}</p>
            </div>
          </div>
          <Badge className={`mt-3 w-full justify-center ${expertSystemHealth === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {expertSystemHealth === 'success' ? '✅ Healthy' : '⚠️ Needs Attention'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activities.slice(0, 10).map((activity, i) => (
              <div key={activity.id || i} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                <span className="text-slate-700">{activity.description || activity.activity_type}</span>
                <span className="text-slate-500 text-xs">{activity.created_at ? new Date(activity.created_at).toLocaleDateString() : '-'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security & Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <SecurityHeadersConfig />
        <RateLimitingConfig />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <TestingDashboard />
        <BackupScheduler />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RedisDeploymentPanel />
          <APMIntegrationPanel />
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Security & Compliance', ar: 'الأمان والامتثال' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BackendSecurityAudit />
          <CSRFProtection />
          <InputValidationMiddleware />
          <SessionTokenSecurity />
          <DataEncryptionConfig />
          <ThreatDetectionSystem />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Infrastructure & Performance', ar: 'البنية التحتية والأداء' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DatabaseIndexing />
          <DatabaseIndexStrategy />
          <ConnectionPoolingConfig />
          <PerformanceMetrics />
          <PerformanceProfiler />
          <APIGatewayConfig />
          <LoadBalancerConfig />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Monitoring & Operations', ar: 'المراقبة والعمليات' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MonitoringDashboard />
          <LoggingConfig />
          <AlertingSystem />
          <AlertManagementSystem />
          <AutomatedBackupSystem />
          <DeploymentPipeline />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Testing & Quality Assurance', ar: 'الاختبار وضمان الجودة' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TestingDashboard />
          <TestAutomationDashboard />
          <UnitTestCoverage />
          <IntegrationTestRunner />
          <E2ETestRunner />
          <ErrorBoundarySystem />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Database & Queries', ar: 'قاعدة البيانات والاستعلامات' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QueryOptimizationPanel />
          <ConnectionPoolingConfig />
          <DatabaseIndexing />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Public & Citizen Engagement', ar: 'المشاركة العامة والمواطنين' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VotingSystemBackend />
          <IdeaToChallengeConverter />
          <NewsPublishingWorkflow />
          <OpenDataAPIDocumentation />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Testing & Quality Assurance', ar: 'الاختبار وضمان الجودة' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UnitTestCoverage />
          <E2ETestingSuite />
          <CICDPipeline />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Integration & Communication', ar: 'التكامل والتواصل' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WebSocketServer />
          <PushNotificationConfig />
          <WebhookBuilder />
          <ImageCDNConfig />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t({ en: 'Mobile & Analytics', ar: 'الموبايل والتحليلات' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MobileOptimizationPanel />
          <NativeMobileApp />
          <AdvancedAnalyticsDashboard />
          <WidgetLibrary />
          <VoiceAssistant />
        </div>
      </div>
    </PageLayout>
  );
}