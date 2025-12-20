import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AlumniImpactTracker({ programId }) {
  const { language, t } = useLanguage();

  const { data: applications = [] } = useQuery({
    queryKey: ['alumni-impact', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_applications')
        .select('*')
        .eq('program_id', programId)
        .eq('status', 'accepted');
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('solutions').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const totalPilots = applications.reduce((sum, app) => 
    sum + pilots.filter(p => p.created_by === app.applicant_email).length, 0
  );

  const totalSolutions = applications.reduce((sum, app) => 
    sum + solutions.filter(s => s.created_by === app.applicant_email).length, 0
  );

  const impactData = applications.reduce((acc, app) => {
    const cohort = app.cohort || 'Cohort 1';
    if (!acc[cohort]) acc[cohort] = { cohort, pilots: 0, solutions: 0 };
    acc[cohort].pilots += pilots.filter(p => p.created_by === app.applicant_email).length;
    acc[cohort].solutions += solutions.filter(s => s.created_by === app.applicant_email).length;
    return acc;
  }, {});

  const chartData = Object.values(impactData);

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          {t({ en: 'Alumni Career & Impact', ar: 'المسار الوظيفي والتأثير للخريجين' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded text-center">
            <p className="text-2xl font-bold text-blue-600">{totalPilots}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots Launched', ar: 'تجارب أُطلقت' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded text-center">
            <p className="text-2xl font-bold text-green-600">{totalSolutions}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Solutions Created', ar: 'حلول أُنشئت' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded text-center">
            <p className="text-2xl font-bold text-amber-600">{applications.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Alumni', ar: 'إجمالي الخريجين' })}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-3">{t({ en: 'Impact by Cohort', ar: 'التأثير حسب الفوج' })}</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="cohort" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pilots" fill="#8b5cf6" name="Pilots" />
              <Bar dataKey="solutions" fill="#10b981" name="Solutions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}