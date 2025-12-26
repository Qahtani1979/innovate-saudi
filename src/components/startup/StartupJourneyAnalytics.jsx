
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Calendar, Rocket, Target, Building2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSolutions } from '@/hooks/useSolutions';
import { usePilotsList } from '@/hooks/usePilots';
import { useStartup } from '@/hooks/useStartupEcosystem';

export default function StartupJourneyAnalytics({ startupId }) {
  const { t } = useLanguage();

  const { data: startup } = useStartup(startupId);
  const { solutions = [] } = useSolutions({ publishedOnly: false });
  const providerSolutions = solutions.filter(s => s.provider_id === startupId);
  const providerSolutionIds = providerSolutions.map(s => s.id);

  const { data: allPilots = [] } = usePilotsList();
  const pilots = allPilots.filter(p => providerSolutionIds.includes(p.solution_id));

  // Derive unique municipalities (clients) from pilots
  const uniqueMunicipalities = new Set(pilots.map(p => p.municipality_id).filter(Boolean));

  const registrationDate = startup?.created_at ? new Date(startup.created_at) : null;
  const daysSinceRegistration = registrationDate
    // @ts-ignore
    ? Math.floor((new Date() - registrationDate) / (1000 * 60 * 60 * 24))
    : 0;

  const milestones = [
    { event: 'Registration', date: startup?.created_at, icon: Rocket },
    { event: 'First Solution', date: providerSolutions[0]?.created_at, icon: Target },
    // @ts-ignore
    { event: 'Verification', date: startup?.verification_date, icon: Badge },
    { event: 'First Pilot', date: pilots[0]?.created_at, icon: TrendingUp }
  ].filter(m => m.date);

  const growthData = [
    { month: 'Month 0', solutions: 0, pilots: 0, clients: 0 },
    { month: 'Month 1', solutions: providerSolutions.length > 0 ? 1 : 0, pilots: 0, clients: 0 },
    { month: 'Month 2', solutions: providerSolutions.length, pilots: Math.floor(pilots.length * 0.3), clients: 0 },
    { month: 'Month 3', solutions: providerSolutions.length, pilots: Math.floor(pilots.length * 0.6), clients: Math.floor(uniqueMunicipalities.size * 0.5) },
    { month: 'Now', solutions: providerSolutions.length, pilots: pilots.length, clients: uniqueMunicipalities.size }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Startup Journey Analytics', ar: 'تحليلات رحلة الشركة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{daysSinceRegistration}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Days Active', ar: 'أيام نشط' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{providerSolutions.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <Rocket className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{pilots.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <Building2 className="h-6 w-6 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-600">{uniqueMunicipalities.size}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Clients', ar: 'العملاء' })}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">
            {t({ en: 'Growth Trajectory', ar: 'مسار النمو' })}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="solutions" stroke="#3b82f6" name="Solutions" />
              <Line type="monotone" dataKey="pilots" stroke="#8b5cf6" name="Pilots" />
              <Line type="monotone" dataKey="clients" stroke="#10b981" name="Clients" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            {t({ en: 'Key Milestones', ar: 'المعالم الرئيسية' })}
          </p>
          <div className="space-y-2">
            {milestones.map((milestone, i) => {
              const Icon = milestone.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{milestone.event}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">✓</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}