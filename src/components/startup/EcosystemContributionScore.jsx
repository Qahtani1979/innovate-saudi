import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Award, Users, Lightbulb, BookOpen } from 'lucide-react';

export default function EcosystemContributionScore({ startupId }) {
  const { t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['startup-activities', startupId],
    queryFn: async () => {
      const all = await base44.entities.UserActivity.list();
      return all.filter(a => a.entity_id === startupId);
    }
  });

  const { data: partnerships = [] } = useQuery({
    queryKey: ['startup-partnerships-eco', startupId],
    queryFn: async () => {
      const all = await base44.entities.Partnership.list();
      return all.filter(p => p.partner_a_id === startupId || p.partner_b_id === startupId);
    }
  });

  const { data: mentorships = [] } = useQuery({
    queryKey: ['startup-mentorships', startupId],
    queryFn: async () => {
      const all = await base44.entities.ProgramMentorship.list();
      return all.filter(m => m.mentor_startup_id === startupId);
    }
  });

  const { data: knowledge = [] } = useQuery({
    queryKey: ['startup-knowledge', startupId],
    queryFn: async () => {
      const all = await base44.entities.KnowledgeDocument.list();
      return all.filter(k => k.created_by === startupId);
    }
  });

  const contributionFactors = {
    partnerships: partnerships.length * 10,
    mentorships: mentorships.length * 15,
    knowledge: knowledge.length * 5,
    referrals: activities.filter(a => a.activity_type === 'startup_referral').length * 8,
    collaboration: activities.filter(a => a.activity_type === 'collaboration').length * 7
  };

  const totalScore = Math.min(
    Object.values(contributionFactors).reduce((sum, val) => sum + val, 0),
    100
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          {t({ en: 'Ecosystem Contribution Score', ar: 'نقاط المساهمة في النظام' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300 text-center">
          <p className="text-5xl font-bold text-amber-600 mb-2">{totalScore}</p>
          <p className="text-sm text-slate-700">{t({ en: 'Contribution Score', ar: 'نقاط المساهمة' })}</p>
          <Progress value={totalScore} className="mt-3" />
        </div>

        <div className="space-y-3">
          <ContributionFactor
            icon={Users}
            label={t({ en: 'Partnerships', ar: 'الشراكات' })}
            count={partnerships.length}
            points={contributionFactors.partnerships}
            color="text-purple-600"
          />
          <ContributionFactor
            icon={GraduationCap}
            label={t({ en: 'Mentorships', ar: 'التوجيه' })}
            count={mentorships.length}
            points={contributionFactors.mentorships}
            color="text-indigo-600"
          />
          <ContributionFactor
            icon={BookOpen}
            label={t({ en: 'Knowledge Shared', ar: 'المعرفة المشتركة' })}
            count={knowledge.length}
            points={contributionFactors.knowledge}
            color="text-green-600"
          />
          <ContributionFactor
            icon={Lightbulb}
            label={t({ en: 'Referrals', ar: 'الإحالات' })}
            count={activities.filter(a => a.activity_type === 'startup_referral').length}
            points={contributionFactors.referrals}
            color="text-pink-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ContributionFactor({ icon: Icon, label, count, points, color }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <div>
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="text-xs text-slate-600">{count} contributions</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-amber-600">+{points}</p>
        <p className="text-xs text-slate-500">points</p>
      </div>
    </div>
  );
}