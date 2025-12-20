import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function IdeaToChallengeConverter() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          {t({ en: 'Idea → Challenge', ar: 'فكرة ← تحدي' })}
          <Badge className="ml-auto bg-amber-600">Partial</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Conversion Workflow Incomplete</p>
              <p>Need admin workflow to convert citizen ideas to challenges</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border rounded-lg bg-purple-50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <p className="text-sm font-medium text-purple-900">AI-Assisted Conversion</p>
            </div>
            <ul className="text-xs text-purple-800 space-y-1">
              <li>• Auto-classify idea category</li>
              <li>• Detect duplicate ideas</li>
              <li>• Suggest priority score</li>
              <li>• Generate problem statement</li>
              <li>• Identify stakeholders</li>
              <li>• Recommend treatment track</li>
            </ul>
          </div>

          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium mb-2">Workflow Steps</p>
            <ol className="text-xs text-slate-600 space-y-1">
              <li>1. Admin reviews top-voted ideas</li>
              <li>2. Selects idea for conversion</li>
              <li>3. AI enriches with challenge template</li>
              <li>4. Admin refines and assigns municipality</li>
              <li>5. Creates official challenge</li>
              <li>6. Notifies idea submitter</li>
            </ol>
          </div>
        </div>

        <Button disabled className="w-full" variant="outline">
          {t({ en: 'Convert Selected Ideas', ar: 'تحويل الأفكار المختارة' })}
        </Button>
      </CardContent>
    </Card>
  );
}