import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, Download, BarChart } from 'lucide-react';

export default function OpenDataCatalog() {
  const { t } = useLanguage();

  const datasets = [
    { 
      name: 'Municipal Challenges Dataset', 
      format: 'CSV/JSON', 
      records: 250, 
      updated: '2025-01-20',
      category: 'Challenges'
    },
    { 
      name: 'Pilot Projects Registry', 
      format: 'CSV/JSON', 
      records: 120, 
      updated: '2025-01-18',
      category: 'Pilots'
    },
    { 
      name: 'MII Scores & Rankings', 
      format: 'CSV/JSON', 
      records: 50, 
      updated: '2025-01-15',
      category: 'Analytics'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-teal-600" />
          {t({ en: 'Open Data Catalog', ar: 'كتالوج البيانات المفتوحة' })}
          <Badge className="ml-auto bg-amber-600">
            {t({ en: 'Basic', ar: 'أساسي' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <p className="text-amber-900 font-medium mb-2">
            {t({ en: 'Open Data Portal Expansion Needed', ar: 'توسع بوابة البيانات المفتوحة مطلوب' })}
          </p>
          <p className="text-amber-800 text-xs">
            {t({ en: 'Dedicated page with dataset catalog, API docs, visualizations, and usage analytics', ar: 'صفحة مخصصة مطلوبة' })}
          </p>
        </div>

        <div className="space-y-2">
          {datasets.map((dataset, idx) => (
            <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{dataset.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{dataset.format}</Badge>
                    <Badge variant="outline" className="text-xs">{dataset.records} records</Badge>
                    <span className="text-xs text-slate-500">Updated: {dataset.updated}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <BarChart className="h-3 w-3 mr-1" />
                    {t({ en: 'Preview', ar: 'معاينة' })}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    {t({ en: 'Download', ar: 'تنزيل' })}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Enhancement features:</p>
          <ul className="space-y-1 ml-4">
            <li>• Dedicated Open Data Portal page</li>
            <li>• API documentation & playground</li>
            <li>• Data visualization widgets</li>
            <li>• Usage analytics & tracking</li>
            <li>• Data quality indicators</li>
            <li>• Automated dataset updates</li>
            <li>• Dataset versioning</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
