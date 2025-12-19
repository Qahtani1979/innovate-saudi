import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Database, FileText } from 'lucide-react';

export default function ChallengeDataTab({ challenge }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {challenge.data_evidence && challenge.data_evidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              {t({ en: 'Data & Evidence', ar: 'البيانات والأدلة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {challenge.data_evidence.map((evidence, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="text-xs mb-2">{evidence.type}</Badge>
                      <p className="text-sm text-muted-foreground">{evidence.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">Source: {evidence.source}</p>
                      {evidence.date && (
                        <p className="text-xs text-muted-foreground">Date: {evidence.date}</p>
                      )}
                    </div>
                  </div>
                  {evidence.url && (
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <a href={evidence.url} target="_blank" rel="noopener noreferrer">View Data</a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {challenge.attachments && challenge.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Attachments', ar: 'المرفقات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {challenge.attachments.map((attachment, i) => (
                <a
                  key={i}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{attachment.type}</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!challenge.data_evidence || challenge.data_evidence.length === 0) && 
       (!challenge.attachments || challenge.attachments.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">{t({ en: 'No evidence or attachments yet', ar: 'لا توجد أدلة أو مرفقات بعد' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
