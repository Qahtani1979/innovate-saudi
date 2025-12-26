import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { GraduationCap, Users, Award } from 'lucide-react';
import { useStartupProfile, useStartupMentorship } from '@/hooks/useStartupEcosystem';

export default function StartupMentorshipMatcher({ startupId, onClose }) {
  const { t } = useLanguage();

  const { data: startup } = useStartupProfile(startupId);
  const { potentialMentors, requestMentorship } = useStartupMentorship(startupId);
  const mentors = potentialMentors.data || [];

  const handleRequestMentorship = (mentor) => {
    requestMentorship.mutate({
      mentorId: mentor.id,
      // @ts-ignore
      mentorEmail: mentor.contact_email,
      // @ts-ignore
      menteeEmail: startup?.contact_email,
      // @ts-ignore
      startupName: startup?.company_name_en,
      // @ts-ignore
      sectors: startup?.sectors
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Startup Mentorship', ar: 'توجيه الشركات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-900 font-medium mb-2">
            {t({ en: 'Learn from Successful Startups', ar: 'تعلم من الشركات الناجحة' })}
          </p>
          <p className="text-xs text-slate-600">
            {t({
              en: 'Connect with proven startups who have successfully deployed solutions with municipalities',
              ar: 'تواصل مع الشركات التي نشرت حلولاً بنجاح مع البلديات'
            })}
          </p>
        </div>

        {mentors.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">
              {t({ en: 'Suggested Mentors (AI-Matched)', ar: 'الموجهون المقترحون' })}
            </p>
            {mentors.map(mentor => (
              <div key={mentor.id} className="p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{mentor.name_en}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {mentor.performance_score || mentor.success_rate || 0}% Success
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {mentor.total_pilots_participated || 0} Clients
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRequestMentorship(mentor)}
                  >
                    {t({ en: 'Request', ar: 'طلب' })}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {t({ en: 'No mentors available yet', ar: 'لا يوجد موجهون متاحون بعد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}