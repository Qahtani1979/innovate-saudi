import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { createPageUrl } from '@/utils';
import { TestTube, Loader2 } from 'lucide-react';
import { usePilotsWithVisibility } from '@/hooks/visibility';

export default function ChallengePilotsTab({ pilots: propPilots, challengeId }) {
  const { t } = useLanguage();
  const { data: allPilots = [], isLoading } = usePilotsWithVisibility();

  // Use prop if provided, otherwise filter fetched data
  const pilots = propPilots || allPilots.filter(p => p.challenge_id === challengeId);

  if (isLoading && !propPilots) {
    return <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            {t({ en: 'Related Pilots', ar: 'التجارب المرتبطة' })} ({pilots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pilots.length > 0 ? (
            <div className="space-y-3">
              {pilots.map((pilot) => (
                <Link
                  key={pilot.id}
                  to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                  className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{pilot.title_en}</p>
                      <p className="text-sm text-slate-600 mt-1">{pilot.municipality_id}</p>
                    </div>
                    <Badge>{pilot.stage?.replace(/_/g, ' ')}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No pilots linked yet', ar: 'لا توجد تجارب مرتبطة بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
