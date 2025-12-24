import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { Users, Search, Sparkles, Mail } from 'lucide-react';
import { useAlumniNetwork } from '@/hooks/useAlumniNetwork';

export default function AlumniNetworkHub({ programId }) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const { applications, solutions, pilots } = useAlumniNetwork(programId);

  const alumni = applications.map(app => ({
    ...app,
    startup_name: app.applicant_org_name || app.applicant_name,
    sector: app.focus_sector || 'General',
    solutions_count: solutions.filter(s => s.created_by === app.applicant_email).length,
    pilots_count: pilots.filter(p => p.created_by === app.applicant_email).length
  }));

  const filteredAlumni = alumni.filter(a => {
    const matchesSearch = !searchQuery ||
      a.startup_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sector?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || a.sector === filter;
    return matchesSearch && matchesFilter;
  });

  const sectors = [...new Set(alumni.map(a => a.sector).filter(Boolean))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'Alumni Network', ar: 'شبكة الخريجين' })}
          <Badge variant="outline" className="ml-auto">{alumni.length} {t({ en: 'alumni', ar: 'خريج' })}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t({ en: 'Search alumni...', ar: 'ابحث عن خريجين...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            {t({ en: 'All', ar: 'الكل' })}
          </Button>
          {sectors.map(sector => (
            <Button
              key={sector}
              size="sm"
              variant={filter === sector ? 'default' : 'outline'}
              onClick={() => setFilter(sector)}
            >
              {sector}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAlumni.map((alumnus, idx) => (
            <div key={idx} className="p-3 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-slate-900">{alumnus.startup_name}</h4>
                  <Badge variant="outline" className="mt-1 text-xs">{alumnus.sector}</Badge>
                  {alumnus.cohort && (
                    <p className="text-xs text-slate-600 mt-1">Cohort {alumnus.cohort}</p>
                  )}
                  {(alumnus.solutions_count > 0 || alumnus.pilots_count > 0) && (
                    <div className="flex gap-1 mt-1">
                      {alumnus.solutions_count > 0 && (
                        <Badge variant="outline" className="text-xs">{alumnus.solutions_count} solutions</Badge>
                      )}
                      {alumnus.pilots_count > 0 && (
                        <Badge variant="outline" className="text-xs">{alumnus.pilots_count} pilots</Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="ghost">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">{t({ en: 'No alumni found', ar: 'لم يتم العثور على خريجين' })}</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'AI: Suggest Collaboration Opportunities', ar: 'الذكاء الاصطناعي: اقترح فرص التعاون' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}