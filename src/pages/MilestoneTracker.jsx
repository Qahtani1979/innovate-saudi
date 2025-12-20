import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Target, Search, Plus, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MilestoneTracker() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-due_date')
  });

  const filteredMilestones = milestones.filter(m => {
    const matchesSearch = !search || 
      m.milestone_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = entityFilter === 'all' || m.entity_type === entityFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesEntity && matchesStatus;
  });

  const stats = {
    total: milestones.length,
    upcoming: milestones.filter(m => {
      if (!m.due_date || m.status === 'completed') return false;
      const daysUntil = Math.floor((new Date(m.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 30;
    }).length,
    overdue: milestones.filter(m => {
      if (!m.due_date || m.status === 'completed') return false;
      return new Date(m.due_date) < new Date();
    }).length,
    completed: milestones.filter(m => m.status === 'completed').length,
    completion_rate: milestones.length > 0 
      ? (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 
      : 0
  };

  const statusColors = {
    pending: 'bg-slate-200 text-slate-700',
    in_progress: 'bg-blue-200 text-blue-700',
    at_risk: 'bg-amber-200 text-amber-700',
    completed: 'bg-green-200 text-green-700',
    delayed: 'bg-red-200 text-red-700',
    cancelled: 'bg-slate-300 text-slate-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Milestone Tracker', ar: 'متتبع المعالم' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Track milestones across pilots, programs, and projects', ar: 'تتبع المعالم عبر التجارب والبرامج والمشاريع' })}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add Milestone', ar: 'إضافة معلم' })}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Upcoming', ar: 'قادم' })}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Overdue', ar: 'متأخر' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'Completion Rate', ar: 'معدل الإنجاز' })}</p>
              <p className="text-2xl font-bold text-purple-600">{stats.completion_rate.toFixed(0)}%</p>
              <Progress value={stats.completion_rate} className="mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t({ en: 'Search milestones...', ar: 'البحث عن المعالم...' })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Entities', ar: 'كل الكيانات' })}</option>
              <option value="pilot">{t({ en: 'Pilots', ar: 'التجارب' })}</option>
              <option value="program">{t({ en: 'Programs', ar: 'البرامج' })}</option>
              <option value="rd_project">{t({ en: 'R&D', ar: 'البحث' })}</option>
              <option value="strategic_plan">{t({ en: 'Strategy', ar: 'الاستراتيجية' })}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Status', ar: 'كل الحالات' })}</option>
              <option value="in_progress">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</option>
              <option value="at_risk">{t({ en: 'At Risk', ar: 'معرض للخطر' })}</option>
              <option value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Upcoming Milestones', ar: 'المعالم القادمة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMilestones.slice(0, 20).map(milestone => {
              const isOverdue = milestone.due_date && milestone.status !== 'completed' && 
                new Date(milestone.due_date) < new Date();
              const daysUntil = milestone.due_date 
                ? Math.floor((new Date(milestone.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={milestone.id} className="p-4 border rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{milestone.milestone_name}</h3>
                        <Badge className={statusColors[milestone.status]}>
                          {milestone.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{milestone.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {milestone.entity_type}
                    </Badge>
                    {milestone.due_date && (
                      <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                        <Calendar className="h-4 w-4" />
                        {new Date(milestone.due_date).toLocaleDateString()}
                        {daysUntil !== null && !isOverdue && daysUntil <= 30 && (
                          <span className="text-amber-600 ml-1">({daysUntil}d)</span>
                        )}
                        {isOverdue && <AlertTriangle className="h-4 w-4 ml-1" />}
                      </div>
                    )}
                    {milestone.completion_percentage !== undefined && (
                      <div className="flex items-center gap-2 flex-1">
                        <Progress value={milestone.completion_percentage} className="flex-1 max-w-32" />
                        <span className="text-xs font-medium">{milestone.completion_percentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MilestoneTracker, { requiredPermissions: [] });