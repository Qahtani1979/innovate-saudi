import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, Target, Sparkles, Filter } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MultiYearRoadmap() {
  const { language, isRTL, t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('timeline'); // timeline | gantt

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rd-calls'],
    queryFn: () => base44.entities.RDCall.list()
  });

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

  const getInitiativesByYear = (year) => {
    return {
      pilots: pilots.filter(p => {
        const startYear = p.timeline?.pilot_start ? new Date(p.timeline.pilot_start).getFullYear() : null;
        return startYear === year;
      }),
      programs: programs.filter(p => {
        const startYear = p.timeline?.program_start ? new Date(p.timeline.program_start).getFullYear() : null;
        return startYear === year;
      }),
      rdCalls: rdCalls.filter(r => {
        const startYear = r.timeline?.application_open ? new Date(r.timeline.application_open).getFullYear() : null;
        return startYear === year;
      })
    };
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📅 Multi-Year Innovation Roadmap', ar: '📅 خارطة الابتكار متعددة السنوات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: '5-year Gantt timeline: initiatives, dependencies, and milestones', ar: 'جدول زمني لـ5 سنوات: المبادرات والاعتماديات والمعالم' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Year-by-Year View', ar: 'عرض سنة بسنة' })}</CardTitle>
            <div className="flex gap-2">
              {years.map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedYear(year)}
                  className={selectedYear === year ? 'bg-blue-600' : ''}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {years.map(year => {
            const initiatives = getInitiativesByYear(year);
            const total = initiatives.pilots.length + initiatives.programs.length + initiatives.rdCalls.length;

            return (
              <div key={year} className={`mb-6 ${selectedYear !== year && 'opacity-40'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {year}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${Math.min(100, (total / 10) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{total} {t({ en: 'initiatives', ar: 'مبادرة' })}</p>
                  </div>
                </div>

                {selectedYear === year && (
                  <div className="grid grid-cols-3 gap-4 ml-16">
                    <Card className="border-blue-200">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
                        <p className="text-2xl font-bold text-blue-600">{initiatives.pilots.length}</p>
                        <div className="mt-2 space-y-1">
                          {initiatives.pilots.slice(0, 3).map(p => (
                            <Link key={p.id} to={createPageUrl(`PilotDetail?id=${p.id}`)}>
                              <p className="text-xs text-slate-600 hover:text-blue-600 truncate">
                                • {language === 'ar' ? p.title_ar : p.title_en}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Programs', ar: 'برامج' })}</p>
                        <p className="text-2xl font-bold text-purple-600">{initiatives.programs.length}</p>
                        <div className="mt-2 space-y-1">
                          {initiatives.programs.slice(0, 3).map(p => (
                            <Link key={p.id} to={createPageUrl(`ProgramDetail?id=${p.id}`)}>
                              <p className="text-xs text-slate-600 hover:text-purple-600 truncate">
                                • {language === 'ar' ? p.name_ar : p.name_en}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'R&D Calls', ar: 'دعوات بحثية' })}</p>
                        <p className="text-2xl font-bold text-green-600">{initiatives.rdCalls.length}</p>
                        <div className="mt-2 space-y-1">
                          {initiatives.rdCalls.slice(0, 3).map(r => (
                            <Link key={r.id} to={createPageUrl(`RDCallDetail?id=${r.id}`)}>
                              <p className="text-xs text-slate-600 hover:text-green-600 truncate">
                                • {language === 'ar' ? r.title_ar : r.title_en}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MultiYearRoadmap, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead'] });