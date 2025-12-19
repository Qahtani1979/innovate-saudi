import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Users } from 'lucide-react';

export default function ChallengeStakeholdersTab({ challenge }) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {challenge.stakeholders && challenge.stakeholders.length > 0 ? (
          <div className="space-y-3">
            {challenge.stakeholders.map((stakeholder, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-900">{stakeholder.name}</p>
                  <Badge variant="outline" className="text-xs">{stakeholder.role}</Badge>
                </div>
                {stakeholder.involvement && (
                  <p className="text-sm text-slate-600">{stakeholder.involvement}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">{t({ en: 'No stakeholders listed', ar: 'لا يوجد أصحاب مصلحة' })}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
