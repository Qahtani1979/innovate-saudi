import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from './LanguageContext';
import { History, GitCompare, Calendar } from 'lucide-react';

export default function RegulatoryVersionHistory({ exemption }) {
  const { language, isRTL, t } = useLanguage();
  const [compareVersions, setCompareVersions] = useState({ v1: null, v2: null });

  // Mock version history - in production, fetch from audit logs or version table
  const versions = [
    {
      version: exemption.version || '1.0',
      date: exemption.updated_date,
      author: exemption.created_by || 'System',
      changes: 'Current version',
      status: 'active',
      data: exemption
    },
    {
      version: '0.9',
      date: '2025-01-10',
      author: 'legal@mot.gov.sa',
      changes: 'Updated speed limit conditions from 50km/h to 40km/h in residential areas',
      status: 'superseded',
      data: {
        ...exemption,
        conditions: [...(exemption.conditions || []), 'Maximum speed: 50km/h in all zones']
      }
    },
    {
      version: '0.5',
      date: '2024-12-15',
      author: 'admin@gdisb.sa',
      changes: 'Initial draft creation',
      status: 'draft',
      data: {
        ...exemption,
        status: 'draft'
      }
    }
  ];

  const renderDiff = () => {
    if (!compareVersions.v1 || !compareVersions.v2) return null;

    const v1 = versions.find(v => v.version === compareVersions.v1)?.data;
    const v2 = versions.find(v => v.version === compareVersions.v2)?.data;

    if (!v1 || !v2) return null;

    const changes = [];
    
    // Compare conditions
    if (JSON.stringify(v1.conditions) !== JSON.stringify(v2.conditions)) {
      changes.push({
        field: 'Conditions',
        old: v1.conditions || [],
        new: v2.conditions || []
      });
    }

    // Compare duration
    if (v1.duration_months !== v2.duration_months) {
      changes.push({
        field: 'Duration',
        old: `${v1.duration_months} months`,
        new: `${v2.duration_months} months`
      });
    }

    // Compare risk level
    if (v1.risk_level !== v2.risk_level) {
      changes.push({
        field: 'Risk Level',
        old: v1.risk_level,
        new: v2.risk_level
      });
    }

    return (
      <div className="space-y-4">
        {changes.length > 0 ? (
          changes.map((change, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <p className="font-semibold text-slate-900 mb-3">{change.field}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-xs font-medium text-red-700 mb-1">v{compareVersions.v1}</p>
                  {Array.isArray(change.old) ? (
                    <ul className="text-sm text-slate-700 space-y-1">
                      {change.old.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-700">{change.old}</p>
                  )}
                </div>
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">v{compareVersions.v2}</p>
                  {Array.isArray(change.new) ? (
                    <ul className="text-sm text-slate-700 space-y-1">
                      {change.new.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-700">{change.new}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-500 py-8">No differences found</p>
        )}
      </div>
    );
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    superseded: 'bg-slate-100 text-slate-700',
    draft: 'bg-yellow-100 text-yellow-700'
  };

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-600" />
          {t({ en: 'Version History', ar: 'تاريخ الإصدارات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeline">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timeline">
              {t({ en: 'Timeline', ar: 'الجدول الزمني' })}
            </TabsTrigger>
            <TabsTrigger value="compare">
              {t({ en: 'Compare', ar: 'مقارنة' })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <div className="space-y-4">
              {versions.map((version, idx) => (
                <div key={idx} className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-l-0">
                  <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-purple-600 border-2 border-white" />
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono">v{version.version}</Badge>
                        <Badge className={statusColors[version.status]}>{version.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-1">{version.changes}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {version.date}
                        </span>
                        <span>by {version.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compare" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    {t({ en: 'Version 1', ar: 'الإصدار 1' })}
                  </label>
                  <select
                    className="w-full border rounded-lg p-2 text-sm"
                    value={compareVersions.v1 || ''}
                    onChange={(e) => setCompareVersions({...compareVersions, v1: e.target.value})}
                  >
                    <option value="">Select version...</option>
                    {versions.map(v => (
                      <option key={v.version} value={v.version}>v{v.version}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    {t({ en: 'Version 2', ar: 'الإصدار 2' })}
                  </label>
                  <select
                    className="w-full border rounded-lg p-2 text-sm"
                    value={compareVersions.v2 || ''}
                    onChange={(e) => setCompareVersions({...compareVersions, v2: e.target.value})}
                  >
                    <option value="">Select version...</option>
                    {versions.map(v => (
                      <option key={v.version} value={v.version}>v{v.version}</option>
                    ))}
                  </select>
                </div>
              </div>

              {compareVersions.v1 && compareVersions.v2 ? (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-4">
                    <GitCompare className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-slate-900">
                      {t({ en: 'Changes', ar: 'التغييرات' })}
                    </h4>
                  </div>
                  {renderDiff()}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">
                  {t({ en: 'Select two versions to compare', ar: 'اختر إصدارين للمقارنة' })}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}