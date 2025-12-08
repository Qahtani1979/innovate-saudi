import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, Upload, Download } from 'lucide-react';

export default function ResearchDataRepository({ projectId }) {
  const { language, t } = useLanguage();

  const datasets = [
    { name: 'Traffic Flow Data Q1-Q4 2024', size: '2.3 GB', format: 'CSV', downloads: 45 },
    { name: 'Citizen Complaint Analysis', size: '450 MB', format: 'JSON', downloads: 23 },
    { name: 'IoT Sensor Readings', size: '1.8 GB', format: 'Parquet', downloads: 67 }
  ];

  return (
    <Card className="border-2 border-cyan-300">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-600" />
            {t({ en: 'Research Data Repository', ar: 'مستودع بيانات البحث' })}
          </CardTitle>
          <Button size="sm" className="bg-cyan-600">
            <Upload className="h-4 w-4 mr-2" />
            {t({ en: 'Upload Dataset', ar: 'رفع بيانات' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {datasets.map((ds, i) => (
          <div key={i} className="p-3 bg-white rounded border flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{ds.name}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{ds.size}</Badge>
                <Badge variant="outline" className="text-xs">{ds.format}</Badge>
                <Badge className="bg-blue-600 text-xs">{ds.downloads} downloads</Badge>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}