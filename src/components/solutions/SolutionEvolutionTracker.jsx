import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { History, Package } from 'lucide-react';

export default function SolutionEvolutionTracker({ solution }) {
  const { language, t } = useLanguage();

  const versionHistory = [
    {
      version: '2.0',
      date: solution.updated_date,
      changes: ['Updated pricing model', 'Added AI features', 'New deployment options'],
      type: 'major'
    },
    {
      version: '1.5',
      date: new Date(new Date(solution.updated_date || new Date()).setMonth(-2)).toISOString(),
      changes: ['Performance improvements', 'Bug fixes'],
      type: 'minor'
    },
    {
      version: '1.0',
      date: solution.created_date,
      changes: ['Initial release'],
      type: 'major'
    }
  ];

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          {t({ en: 'Solution Evolution', ar: 'تطور الحل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-6">
            {versionHistory.map((version, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-2 top-1 bg-white border-2 border-blue-300 rounded-full p-1">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-900">v{version.version}</p>
                    <Badge className={version.type === 'major' ? 'bg-purple-600' : 'bg-blue-600'}>
                      {version.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    {new Date(version.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                  <ul className="space-y-1">
                    {version.changes.map((change, j) => (
                      <li key={j} className="text-sm text-slate-700">• {change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 rounded border border-blue-300">
          <p className="text-xs text-slate-600">
            {t({ 
              en: 'AI monitors market changes and suggests updates when competitors add new features', 
              ar: 'الذكاء يراقب تغييرات السوق ويقترح التحديثات عندما يضيف المنافسون ميزات جديدة' 
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}