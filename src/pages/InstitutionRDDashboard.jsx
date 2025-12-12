import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Microscope, TrendingUp, Award, BookOpen, DollarSign, Users, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function InstitutionRDDashboard() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['institution-rd-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('rd_projects').select('*');
      return data || [];
    },
    enabled: !!user
  });

  const { data: rdProposals = [] } = useQuery({
    queryKey: ['institution-rd-proposals'],
    queryFn: async () => {
      const { data } = await supabase.from('rd_proposals').select('*');
      return data || [];
    },
    enabled: !!user
  });

  const activeProjects = rdProjects.filter(p => p.status === 'active');
  const completedProjects = rdProjects.filter(p => p.status === 'completed');
  const totalPublications = rdProjects.reduce((sum, p) => sum + (p.publications?.length || 0), 0);
  const totalBudget = rdProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const avgTRL = rdProjects.length > 0 ? (rdProjects.reduce((sum, p) => sum + (p.trl_current || 0), 0) / rdProjects.length).toFixed(1) : 0;

  const statusData = [
    { name: t({ en: 'Active', ar: 'نشط' }), value: rdProjects.filter(p => p.status === 'active').length, color: '#10b981' },
    { name: t({ en: 'Completed', ar: 'مكتمل' }), value: rdProjects.filter(p => p.status === 'completed').length, color: '#3b82f6' },
    { name: t({ en: 'Proposal', ar: 'مقترح' }), value: rdProjects.filter(p => p.status === 'proposal').length, color: '#a855f7' },
    { name: t({ en: 'On Hold', ar: 'معلق' }), value: rdProjects.filter(p => p.status === 'on_hold').length, color: '#f59e0b' }
  ];

  const trlDistribution = Array.from({ length: 9 }, (_, i) => ({
    trl: `TRL ${i + 1}`,
    count: rdProjects.filter(p => Math.floor(p.trl_current || p.trl_start || 0) === i + 1).length
  }));

  return (
    <PageLayout>
      <PageHeader
        icon={Microscope}
        title={{ en: 'Institution R&D Dashboard', ar: 'لوحة البحث والتطوير المؤسسي' }}
        description={{ en: 'Research portfolio and performance analytics', ar: 'محفظة البحث وتحليلات الأداء' }}
        stats={[
          { icon: Microscope, value: rdProjects.length, label: { en: 'Projects', ar: 'المشاريع' } },
          { icon: Target, value: activeProjects.length, label: { en: 'Active', ar: 'نشط' } },
          { icon: TrendingUp, value: avgTRL, label: { en: 'Avg TRL', ar: 'متوسط النضج' } }
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <Microscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{rdProjects.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Projects', ar: 'إجمالي المشاريع' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{activeProjects.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{completedProjects.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-4 text-center">
            <BookOpen className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{totalPublications}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Publications', ar: 'منشورات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{(totalBudget / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Budget', ar: 'إجمالي الميزانية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-600">{avgTRL}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg TRL', ar: 'متوسط النضج' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Project Status Distribution', ar: 'توزيع حالة المشاريع' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'TRL Distribution', ar: 'توزيع مستوى النضج' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trlDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trl" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Research Projects', ar: 'المشاريع البحثية النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeProjects.map(project => (
              <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                <div className="p-4 border rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{project.title_en}</h3>
                      <p className="text-sm text-slate-600 mt-1">{project.research_area_en || project.research_area}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">TRL {project.trl_current || project.trl_start}</Badge>
                        <Badge>{project.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600">{project.duration_months} months</div>
                      <div className="text-sm font-medium text-amber-600">{(project.budget / 1000).toFixed(0)}K SAR</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(InstitutionRDDashboard, { requiredPermissions: ['rd_project_view_all'] });