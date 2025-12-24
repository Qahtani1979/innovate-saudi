import { useState } from 'react';
import { useRisks } from '@/hooks/useRisks';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { AlertTriangle, Search, Plus, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RiskRegister() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const { data: risks = [], isLoading } = useRisks();

  const filteredRisks = risks.filter(r => {
    const matchesSearch = !search ||
      r.risk_title?.toLowerCase().includes(search.toLowerCase()) ||
      r.risk_description?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const stats = {
    total: risks.length,
    critical: risks.filter(r => r.severity === 'critical').length,
    high: risks.filter(r => r.severity === 'high').length,
    active: risks.filter(r => r.status === 'active').length,
    mitigated: risks.filter(r => r.status === 'mitigated').length
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-700 border-blue-300',
    medium: 'bg-amber-100 text-amber-700 border-amber-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    critical: 'bg-red-100 text-red-700 border-red-300'
  };

  const statusColors = {
    identified: 'bg-slate-200 text-slate-700',
    active: 'bg-amber-200 text-amber-700',
    monitoring: 'bg-blue-200 text-blue-700',
    mitigated: 'bg-green-200 text-green-700',
    realized: 'bg-red-200 text-red-700',
    closed: 'bg-slate-300 text-slate-700'
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
            {t({ en: 'Risk Register', ar: 'سجل المخاطر' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Enterprise risk management across all initiatives', ar: 'إدارة المخاطر المؤسسية عبر جميع المبادرات' })}
          </p>
        </div>
        <Link to={createPageUrl('RiskDashboard')}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Risk', ar: 'مخاطرة جديدة' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Risks', ar: 'إجمالي المخاطر' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Critical', ar: 'حرج' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'High', ar: 'عالي' })}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.active}</p>
              </div>
              <Shield className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Mitigated', ar: 'مُخفّف' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.mitigated}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
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
                  placeholder={t({ en: 'Search risks...', ar: 'البحث عن المخاطر...' })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Severity', ar: 'كل المستويات' })}</option>
              <option value="critical">{t({ en: 'Critical', ar: 'حرج' })}</option>
              <option value="high">{t({ en: 'High', ar: 'عالي' })}</option>
              <option value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</option>
              <option value="low">{t({ en: 'Low', ar: 'منخفض' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Risks List */}
      <div className="space-y-3">
        {filteredRisks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No risks found', ar: 'لا توجد مخاطر' })}</p>
            </CardContent>
          </Card>
        ) : (
          filteredRisks.map(risk => (
            <Card key={risk.id} className={`border-2 ${severityColors[risk.severity] || 'border-slate-200'}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-slate-900">{risk.risk_title}</h3>
                      <Badge className={severityColors[risk.severity]}>
                        {risk.severity}
                      </Badge>
                      <Badge className={statusColors[risk.status] || 'bg-slate-200'}>
                        {risk.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{risk.risk_description}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div>
                        <span className="font-medium">{t({ en: 'Impact:', ar: 'التأثير:' })}</span> {risk.impact || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">{t({ en: 'Likelihood:', ar: 'الاحتمالية:' })}</span> {risk.likelihood || 'N/A'}
                      </div>
                      {risk.risk_score && (
                        <div>
                          <span className="font-medium">{t({ en: 'Score:', ar: 'النقاط:' })}</span> {risk.risk_score}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {risk.mitigation_plan && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-medium text-green-900 mb-1">
                      {t({ en: 'Mitigation Plan:', ar: 'خطة التخفيف:' })}
                    </p>
                    <p className="text-sm text-slate-700">{risk.mitigation_plan}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(RiskRegister, {
  requiredPermissions: ['risk_view_all']
});