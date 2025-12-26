import { useState } from 'react';
import { usePartnerships } from '@/hooks/usePartnerships';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Users, Plus, Search, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function PartnershipRegistry() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: partnerships = [], isLoading } = usePartnerships();

  const filteredPartnerships = partnerships.filter(p => {
    const matchesSearch = !searchQuery ||
      (p.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name_ar?.includes(searchQuery));
    const matchesType = filterType === 'all' || p.partnership_type === filterType;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: partnerships.length,
    active: partnerships.filter(p => p.status === 'active').length,
    avgHealth: partnerships.length > 0
      ? Math.round(partnerships.reduce((sum, p) => sum + (p.health_score || 0), 0) / partnerships.length)
      : 0
  };

  const getStatusColor = (status) => {
    const colors = {
      prospect: 'bg-blue-100 text-blue-700',
      negotiation: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-slate-100 text-slate-700',
      terminated: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Partnership Registry', ar: 'سجل الشراكات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Centralized partnership management and tracking', ar: 'إدارة وتتبع الشراكات المركزية' })}
          </p>
        </div>
        <Link to={createPageUrl('PartnershipCreate')}>
          <Button className="bg-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Partnership', ar: 'شراكة جديدة' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Partnerships', ar: 'إجمالي الشراكات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشطة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.avgHealth}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Health Score', ar: 'متوسط درجة الصحة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t({ en: 'Search partnerships...', ar: 'ابحث عن الشراكات...' })}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</option>
              <option value="rd_collaboration">{t({ en: 'R&D', ar: 'بحث' })}</option>
              <option value="pilot_partnership">{t({ en: 'Pilot', ar: 'تجربة' })}</option>
              <option value="strategic_alliance">{t({ en: 'Strategic', ar: 'استراتيجي' })}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Status', ar: 'جميع الحالات' })}</option>
              <option value="prospect">{t({ en: 'Prospect', ar: 'محتمل' })}</option>
              <option value="negotiation">{t({ en: 'Negotiation', ar: 'تفاوض' })}</option>
              <option value="active">{t({ en: 'Active', ar: 'نشط' })}</option>
              <option value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Partnerships List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</p>
        </div>
      ) : filteredPartnerships.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {t({ en: 'No partnerships found', ar: 'لا شراكات موجودة' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPartnerships.map((partnership) => {
            const completedMilestones = partnership.milestones?.filter(m => m.status === 'completed').length || 0;
            const totalMilestones = partnership.milestones?.length || 1;
            const progress = Math.round((completedMilestones / totalMilestones) * 100);

            return (
              <Card key={partnership.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {partnership.name_en || partnership.name_ar}
                        </h3>
                        <Badge className={getStatusColor(partnership.status)}>
                          {partnership.status}
                        </Badge>
                        <Badge variant="outline">
                          {partnership.partnership_type?.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-600 mb-3">
                        {partnership.scope_en || partnership.scope_ar}
                      </p>

                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-slate-500">{t({ en: 'Parties:', ar: 'الأطراف:' })}</span>
                          <span className="ml-2 font-medium">{partnership.parties?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">{t({ en: 'Progress:', ar: 'التقدم:' })}</span>
                          <span className="ml-2 font-medium">{progress}%</span>
                        </div>
                        {partnership.health_score && (
                          <div>
                            <span className="text-slate-500">{t({ en: 'Health:', ar: 'الصحة:' })}</span>
                            <span className={`ml-2 font-bold ${getHealthColor(partnership.health_score)}`}>
                              {partnership.health_score}
                            </span>
                          </div>
                        )}
                      </div>

                      {partnership.milestones && partnership.milestones.length > 0 && (
                        <div className="mt-3">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-slate-500 mt-1">
                            {completedMilestones}/{totalMilestones} {t({ en: 'milestones', ar: 'معالم' })}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link to={createPageUrl('PartnershipDetail') + `?id=${partnership.id}`}>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        {t({ en: 'Details', ar: 'التفاصيل' })}
                      </Button>
                    </Link>
                  </div>

                  {partnership.parties && partnership.parties.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {partnership.parties.slice(0, 3).map((party, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {party.organization_name} ({party.role})
                          </Badge>
                        ))}
                        {partnership.parties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{partnership.parties.length - 3} {t({ en: 'more', ar: 'المزيد' })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(PartnershipRegistry, { requiredPermissions: [] });
