import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Award, CheckCircle2 } from 'lucide-react';
import { useCitizenIdeas } from '@/hooks/useCitizenIdeas';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

export default function CitizenFeedbackLoop({ citizenEmail }) {
  const { language, t } = useLanguage();

  const { ideas: ideasQuery } = useCitizenIdeas({
    citizenEmail,
    limit: 100
  });
  const ideas = ideasQuery.data || [];

  const { data: allChallenges = [] } = useChallengesWithVisibility({
    limit: 1000 // Get enough to find local matches
  });

  // Client-side filtering as per original logic
  const ideaIds = ideas.map(i => i.id);
  const challenges = allChallenges.filter(c =>
    // @ts-ignore - citizen_idea_ids might be custom
    c.citizen_idea_ids?.some(id => ideaIds.includes(id))
  );

  const convertedIdeas = ideas.filter(i => i.status === 'converted_to_challenge');
  const impactfulIdeas = convertedIdeas.filter(i => {
    const challenge = challenges.find(c => c.id === i.converted_challenge_id);
    return challenge?.linked_pilot_ids?.length > 0;
  });

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-teal-600" />
          {t({ en: 'Your Impact Journey', ar: 'رحلة تأثيرك' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
            <p className="text-2xl font-bold text-blue-600">{ideas.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Ideas Submitted', ar: 'أفكار مقدمة' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300 text-center">
            <p className="text-2xl font-bold text-green-600">{convertedIdeas.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Became Challenges', ar: 'أصبحت تحديات' })}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
            <p className="text-2xl font-bold text-purple-600">{impactfulIdeas.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Led to Pilots', ar: 'أدت لتجارب' })}</p>
          </div>
        </div>

        <div className="space-y-2">
          {ideas.slice(0, 5).map((idea) => {
            const challenge = challenges.find(c => c.id === idea.converted_challenge_id);

            return (
              <div key={idea.id} className="p-3 bg-white rounded border">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-900">{idea.title}</h4>
                  <Badge className={
                    idea.status === 'converted_to_challenge' ? 'bg-green-600' :
                      idea.status === 'under_review' ? 'bg-yellow-600' : 'bg-blue-600'
                  }>
                    {idea.status}
                  </Badge>
                </div>

                {challenge && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                    <CheckCircle2 className="h-3 w-3 inline text-green-600 mr-1" />
                    <span className="text-green-700">
                      {t({ en: `Became Challenge: ${challenge.title_en || challenge.title_ar}`, ar: `أصبح تحدي: ${challenge.title_ar || challenge.title_en}` })}
                    </span>
                  </div>
                )}

                {challenge?.linked_pilot_ids?.length > 0 && (
                  <div className="mt-1 p-2 bg-purple-50 rounded text-xs">
                    <Award className="h-3 w-3 inline text-purple-600 mr-1" />
                    <span className="text-purple-700">
                      {t({ en: `${challenge.linked_pilot_ids.length} pilot(s) launched!`, ar: `${challenge.linked_pilot_ids.length} تجربة أُطلقت!` })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {impactfulIdeas.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300">
            <div className="flex items-start gap-2">
              <Award className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {t({ en: '🎉 Impact Recognition', ar: '🎉 تقدير التأثير' })}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {t({
                    en: `Your ideas led to real change! ${impactfulIdeas.length} idea(s) resulted in municipal pilots.`,
                    ar: `أفكارك أدت لتغيير حقيقي! ${impactfulIdeas.length} فكرة أدت لتجارب بلدية.`
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
