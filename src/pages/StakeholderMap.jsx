import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Users, Plus, Target, TrendingUp, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StakeholderMap() {
  const { t } = useLanguage();
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');

  const { useGetAllStakeholders } = useStakeholders();
  const { data: stakeholders = [], isLoading } = useGetAllStakeholders();

  const filteredStakeholders = stakeholders.filter(s =>
    entityTypeFilter === 'all' || s.entity_type === entityTypeFilter
  );

  const stats = {
    total: stakeholders.length,
    key_stakeholders: stakeholders.filter(s => s.is_key_stakeholder).length,
    high_influence: stakeholders.filter(s => s.influence_level === 'very_high' || s.influence_level === 'high').length,
    supportive: stakeholders.filter(s => s.sentiment === 'supportive' || s.sentiment === 'strongly_supportive').length
  };

  // Power-Interest Matrix Data
  const matrixData = filteredStakeholders.map(s => {
    const influenceMap = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    const interestMap = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };

    return {
      name: s.stakeholder_name_en || s.stakeholder_name_ar,
      influence: influenceMap[s.influence_level] || 3,
      interest: interestMap[s.interest_level] || 3,
      quadrant: s.power_interest_quadrant,
      sentiment: s.sentiment,
      id: s.id
    };
  });

  const quadrantColors = {
    monitor: '#94a3b8',
    keep_informed: '#3b82f6',
    keep_satisfied: '#f59e0b',
    manage_closely: '#ef4444'
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
            {t({ en: 'Stakeholder Map', ar: 'خريطة أصحاب المصلحة' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Power-Interest matrix and engagement tracking', ar: 'مصفوفة القوة والاهتمام وتتبع المشاركة' })}
          </p>
        </div>
        <Link to={createPageUrl('EngagementTracker')}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Stakeholder', ar: 'إضافة صاحب مصلحة' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Key Stakeholders', ar: 'أصحاب مصلحة رئيسيون' })}</p>
                <p className="text-2xl font-bold text-red-600">{stats.key_stakeholders}</p>
              </div>
              <Target className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'High Influence', ar: 'تأثير عالي' })}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.high_influence}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Supportive', ar: 'داعم' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.supportive}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">{t({ en: 'All Entities', ar: 'كل الكيانات' })}</option>
            <option value="challenge">{t({ en: 'Challenges', ar: 'التحديات' })}</option>
            <option value="pilot">{t({ en: 'Pilots', ar: 'التجارب' })}</option>
            <option value="rd_project">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</option>
            <option value="program">{t({ en: 'Programs', ar: 'البرامج' })}</option>
          </select>
        </CardContent>
      </Card>

      {/* Power-Interest Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Power-Interest Matrix', ar: 'مصفوفة القوة والاهتمام' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="interest"
                name={t({ en: 'Interest', ar: 'الاهتمام' })}
                domain={[0, 6]}
                label={{ value: t({ en: 'Interest Level →', ar: 'مستوى الاهتمام ←' }), position: 'bottom' }}
              />
              <YAxis
                type="number"
                dataKey="influence"
                name={t({ en: 'Influence', ar: 'التأثير' })}
                domain={[0, 6]}
                label={{ value: t({ en: '↑ Power/Influence', ar: '↑ القوة/التأثير' }), angle: -90, position: 'left' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={matrixData} fill="#3b82f6">
                {matrixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={quadrantColors[entry.quadrant] || '#3b82f6'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: quadrantColors.monitor }}></div>
              <span>{t({ en: 'Monitor', ar: 'راقب' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: quadrantColors.keep_informed }}></div>
              <span>{t({ en: 'Keep Informed', ar: 'أبقِ على اطلاع' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: quadrantColors.keep_satisfied }}></div>
              <span>{t({ en: 'Keep Satisfied', ar: 'أبقِ راضياً' })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: quadrantColors.manage_closely }}></div>
              <span>{t({ en: 'Manage Closely', ar: 'أدِر بحذر' })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stakeholder List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'All Stakeholders', ar: 'جميع أصحاب المصلحة' })} ({filteredStakeholders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredStakeholders.map(stakeholder => (
              <div key={stakeholder.id} className="p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">
                      {stakeholder.stakeholder_name_en || stakeholder.stakeholder_name_ar}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {stakeholder.stakeholder_type?.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {stakeholder.role}
                      </Badge>
                      {stakeholder.power_interest_quadrant && (
                        <Badge className="text-xs" style={{ backgroundColor: quadrantColors[stakeholder.power_interest_quadrant] }}>
                          {stakeholder.power_interest_quadrant?.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-600">
                      {t({ en: 'Influence:', ar: 'التأثير:' })} <span className="font-medium">{stakeholder.influence_level}</span>
                    </p>
                    <p className="text-slate-600">
                      {t({ en: 'Interest:', ar: 'الاهتمام:' })} <span className="font-medium">{stakeholder.interest_level}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StakeholderMap, {
  requiredPermissions: ['stakeholder_view_all']
});