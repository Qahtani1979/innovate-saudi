import { Link } from 'react-router-dom';
import { useRDProjects, useRDProposals, useRDCalls } from '@/hooks/useRDHooks';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Microscope, FileText, Clock, CheckCircle, AlertCircle, Plus, ArrowRight, Calendar, TrendingUp } from 'lucide-react';

function ResearcherWorkspace() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { data: myProjects = [] } = useRDProjects(user?.email);
  const { data: myProposals = [] } = useRDProposals(user?.email);
  const { data: openCalls = [] } = useRDCalls({ status: 'open' });

  const activeProjects = myProjects.filter(p => p.status === 'active');
  const pendingProposals = myProposals.filter(p => p.status === 'under_review');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Researcher Workspace', ar: 'مساحة عمل الباحث' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Manage your research projects and proposals', ar: 'إدارة مشاريعك البحثية ومقترحاتك' })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Microscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{activeProjects.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{pendingProposals.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pending Proposals', ar: 'مقترحات معلقة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Megaphone className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{openCalls.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Open Calls', ar: 'دعوات مفتوحة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">
              {myProjects.length > 0 ? (myProjects.reduce((sum, p) => sum + (p.trl_current || 0), 0) / myProjects.length).toFixed(1) : '0'}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg TRL', ar: 'متوسط TRL' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Link to={createPageUrl('RDProjectCreate')}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'New Project', ar: 'مشروع جديد' })}
              </Button>
            </Link>
            <Link to={createPageUrl('RDCalls')}>
              <Button className="w-full" variant="outline">
                <Megaphone className="h-4 w-4 mr-2" />
                {t({ en: 'Browse Calls', ar: 'تصفح الدعوات' })}
              </Button>
            </Link>
            <Link to={createPageUrl('ResearchOutputsHub')}>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'My Outputs', ar: 'مخرجاتي' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'My Active Projects', ar: 'مشاريعي النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.map(project => (
                <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                  <div className="p-4 border rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{project.title_en}</h3>
                        <p className="text-sm text-slate-600 mt-1">{project.research_area_en || project.research_area}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">TRL {project.trl_current || project.trl_start}</Badge>
                          <Badge className="bg-green-100 text-green-700">{project.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        {project.timeline?.end_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{project.timeline.end_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">{t({ en: 'No active projects', ar: 'لا توجد مشاريع نشطة' })}</p>
              <Link to={createPageUrl('RDProjectCreate')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t({ en: 'Start New Project', ar: 'بدء مشروع جديد' })}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Open Calls */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Open Research Calls', ar: 'دعوات البحث المفتوحة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openCalls.slice(0, 4).map(call => (
              <Link key={call.id} to={createPageUrl(`RDCallDetail?id=${call.id}`)}>
                <Card className="hover:shadow-lg transition-all border hover:border-indigo-400">
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-sm mb-2">{call.title_en}</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="text-xs">{call.call_type?.replace(/_/g, ' ')}</Badge>
                      {call.timeline?.submission_close && (
                        <span className="text-xs text-red-600">
                          {t({ en: 'Closes:', ar: 'يغلق:' })} {call.timeline.submission_close}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ResearcherWorkspace, { requiredPermissions: [] });
