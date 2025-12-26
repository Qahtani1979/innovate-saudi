import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { Calendar, Loader2 } from 'lucide-react';
import { useChallengeLinkedPrograms } from '@/hooks/useChallengeLinkedData';

export default function ChallengeProgramsTab({ challenge }) {
  const { language, t } = useLanguage();

  const { linkedPrograms, isLoading } = useChallengeLinkedPrograms(challenge);

  if (isLoading) {
    return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            {t({ en: 'Linked Programs', ar: 'البرامج المرتبطة' })} ({linkedPrograms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {linkedPrograms.length > 0 ? (
            <div className="space-y-3">
              {linkedPrograms.map((program) => (
                <Link
                  key={program.id}
                  to={createPageUrl(`ProgramDetail?id=${program.id}`)}
                  className="block p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">{program.code}</Badge>
                        <Badge className="text-xs">{program.program_type?.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="font-medium">
                        {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                      </p>
                      {program.tagline_en && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === 'ar' && program.tagline_ar ? program.tagline_ar : program.tagline_en}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {/* @ts-ignore */}
                        {program.timeline?.program_start && (
                          /* @ts-ignore */
                          <span>📅 {new Date(program.timeline.program_start).toLocaleDateString()}</span>
                        )}
                        {/* @ts-ignore */}
                        {program.duration_weeks && <span>⏱️ {program.duration_weeks} weeks</span>}
                      </div>
                    </div>
                    <Badge className={
                      program.status === 'active' ? 'bg-green-100 text-green-700' :
                        program.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                    }>
                      {program.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t({ en: 'No programs linked yet', ar: 'لا توجد برامج مرتبطة بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
