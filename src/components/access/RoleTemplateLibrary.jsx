import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Download } from 'lucide-react';

export default function RoleTemplateLibrary({ onApplyTemplate }) {
  const { language, isRTL, t } = useLanguage();

  const templates = [
    {
      name: 'Municipality Admin',
      code: 'MUN_ADMIN',
      description: 'Full access to municipal challenges and pilots',
      permissions: { challenges: { create: true, read: true, update: true, delete: true }, pilots: { create: true, read: true, update: true, delete: false } }
    },
    {
      name: 'Startup User',
      code: 'STARTUP_USER',
      description: 'View challenges, submit solutions, manage pilots',
      permissions: { challenges: { read: true }, solutions: { create: true, read: true, update: true }, pilots: { read: true, update: true } }
    },
    {
      name: 'Researcher',
      code: 'RESEARCHER',
      description: 'Access R&D projects and living labs',
      permissions: { rd_projects: { create: true, read: true, update: true }, living_labs: { read: true } }
    },
    {
      name: 'Program Operator',
      code: 'PROGRAM_OP',
      description: 'Manage programs and applications',
      permissions: { programs: { create: true, read: true, update: true }, applications: { read: true, update: true } }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Role Templates', ar: 'قوالب الأدوار' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templates.map((template, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border-2 hover:border-indigo-300 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{template.name}</h4>
                  <p className="text-xs text-slate-600 mt-1">{template.description}</p>
                  <Badge className="mt-2 bg-indigo-100 text-indigo-700 text-xs">{template.code}</Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => onApplyTemplate?.(template)}
                  className="bg-indigo-600"
                >
                  <Download className="h-3 w-3 mr-1" />
                  {t({ en: 'Apply', ar: 'تطبيق' })}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}