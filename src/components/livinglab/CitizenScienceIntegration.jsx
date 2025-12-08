import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Upload, Eye } from 'lucide-react';

export default function CitizenScienceIntegration({ labId }) {
  const { language, t } = useLanguage();

  const campaigns = [
    { name: 'Air Quality Monitoring', participants: 234, datapoints: 12450, status: 'active' },
    { name: 'Noise Level Mapping', participants: 156, datapoints: 8920, status: 'active' },
    { name: 'Green Space Survey', participants: 89, datapoints: 4560, status: 'completed' }
  ];

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            {t({ en: 'Citizen Science Integration', ar: 'تكامل علوم المواطنين' })}
          </CardTitle>
          <Button size="sm" className="bg-green-600">
            {t({ en: 'New Campaign', ar: 'حملة جديدة' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {campaigns.map((c, i) => (
          <div key={i} className="p-4 bg-white rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900">{c.name}</h4>
              <Badge className={c.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}>
                {c.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-blue-50 rounded text-center">
                <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-600">{c.participants}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Participants', ar: 'مشاركون' })}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded text-center">
                <Eye className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-600">{c.datapoints}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Data Points', ar: 'نقاط بيانات' })}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}