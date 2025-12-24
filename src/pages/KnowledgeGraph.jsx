
import { useChallengesWithVisibility } from '../hooks/useChallengesWithVisibility';
import { useSolutionsWithVisibility } from '../hooks/useSolutionsWithVisibility';
import { usePilotsWithVisibility } from '../hooks/usePilotsWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { AlertCircle, Lightbulb, TestTube } from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';
import ProtectedPage from '../components/permissions/ProtectedPage';

function KnowledgeGraph() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useChallengesWithVisibility();
  const { data: solutions = [] } = useSolutionsWithVisibility();
  const { data: pilots = [] } = usePilotsWithVisibility();

  const connections = [
    { from: 'Challenges', to: 'Solutions', count: challenges.length * 2.3, type: 'AI Match' },
    { from: 'Challenges', to: 'Pilots', count: pilots.length, type: 'Direct' },
    { from: 'Solutions', to: 'Pilots', count: pilots.length, type: 'Implementation' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Knowledge Graph', ar: 'Ù…Ø®Ø·Ø· Ø§Ù„Ù…Ø¹Ø±ÙØ©' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Explore relationships between challenges, solutions, and pilots', ar: 'Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø¹Ù„Ø§Ù‚Ø§Øª Ø¨ÙŠÙ† Ø§Ù„ØªØ­Ø¯ÙŠØ§Øª ÙˆØ§Ù„Ø­Ù„ÙˆÙ„ ÙˆØ§Ù„ØªØ¬Ø§Ø±Ø¨' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'Ø§Ù„ØªØ­Ø¯ÙŠØ§Øª' })}</p>
                <p className="text-3xl font-bold text-red-600">{challenges.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'Ø§Ù„Ø­Ù„ÙˆÙ„' })}</p>
                <p className="text-3xl font-bold text-green-600">{solutions.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'Ø§Ù„ØªØ¬Ø§Ø±Ø¨' })}</p>
                <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <NetworkGraph challenges={challenges} solutions={solutions} pilots={pilots} />

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Connection Strength', ar: 'Ù‚ÙˆØ© Ø§Ù„Ø§ØªØµØ§Ù„' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connections.map((conn, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{conn.from}</Badge>
                    <span className="text-slate-400">â†’</span>
                    <Badge variant="outline">{conn.to}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{Math.round(conn.count)}</p>
                    <p className="text-xs text-slate-500">{conn.type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(KnowledgeGraph, { requiredPermissions: [] });
