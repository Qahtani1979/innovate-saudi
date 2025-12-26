
import { useSandboxIncidents } from '@/hooks/useSandboxIncidents';
import { useRegulatoryExemptions } from '@/hooks/useRegulatoryExemptions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Share2, Download } from 'lucide-react';

export default function SandboxKnowledgeExchange({ sandboxId }) {
  const { language, t } = useLanguage();

  // Fetch all resolved incidents across all sandboxes
  const { data: allIncidents = [] } = useSandboxIncidents({
    status: 'resolved',
    limit: 50
  });

  // Fetch all active exemptions across all sandboxes
  const { data: allExemptions = [] } = useRegulatoryExemptions({
    status: 'active',
    limit: 50
  });

  const sharedProtocols = allIncidents
    .filter(i => i.resolution && i.status === 'resolved')
    .reduce((acc, incident) => {
      const key = incident.incident_type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(incident);
      return acc;
    }, {});

  const exemptionTemplates = allExemptions
    .filter(e => e.status === 'active')
    .reduce((acc, exemption) => {
      const key = exemption.regulation_category || 'general';
      if (!acc[key]) acc[key] = [];
      acc[key].push(exemption);
      return acc;
    }, {});

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t({ en: 'Cross-Sandbox Knowledge Library', ar: 'مكتبة المعرفة عبر المناطق' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300 text-center">
              <p className="text-sm text-slate-600 mb-1">{t({ en: 'Safety Protocols', ar: 'بروتوكولات السلامة' })}</p>
              <p className="text-3xl font-bold text-green-600">{Object.keys(sharedProtocols).length}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
              <p className="text-sm text-slate-600 mb-1">{t({ en: 'Exemption Templates', ar: 'قوالب الإعفاءات' })}</p>
              <p className="text-3xl font-bold text-purple-600">{Object.keys(exemptionTemplates).length}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-3">
              {t({ en: 'Shared Safety Protocols', ar: 'بروتوكولات السلامة المشتركة' })}
            </h4>
            <div className="space-y-2">
              {Object.entries(sharedProtocols).slice(0, 5).map(([type, incidents]) => (
                <div key={type} className="p-3 bg-white rounded-lg border hover:border-blue-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900 capitalize">{type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {t({ en: 'Used in', ar: 'مستخدم في' })} {incidents.length} {t({ en: 'incidents', ar: 'حوادث' })}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      {t({ en: 'Use', ar: 'استخدم' })}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-3">
              {t({ en: 'Exemption Templates by Category', ar: 'قوالب الإعفاءات حسب الفئة' })}
            </h4>
            <div className="space-y-2">
              {Object.entries(exemptionTemplates).slice(0, 5).map(([category, exemptions]) => (
                <div key={category} className="p-3 bg-white rounded-lg border hover:border-purple-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">{category}</Badge>
                      <p className="text-xs text-slate-600">
                        {exemptions.length} {t({ en: 'templates available', ar: 'قالب متاح' })}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-3 w-3 mr-1" />
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
