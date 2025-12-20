import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Plus } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function TemplateLibraryManager() {
  const { t } = useLanguage();

  const templates = [
    { name: 'Challenge Submission Template', type: 'challenge', uses: 45 },
    { name: 'Pilot Proposal Template', type: 'pilot', uses: 32 },
    { name: 'R&D Call Template', type: 'rd_call', uses: 12 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-purple-600" />
          {t({ en: 'Template Library Manager', ar: 'مدير مكتبة القوالب' })}
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'New Template', ar: 'قالب جديد' })}
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{template.name}</p>
                  <p className="text-sm text-slate-600">{template.uses} times used</p>
                </div>
                <Button variant="outline" size="sm">
                  {t({ en: 'Edit', ar: 'تحرير' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(TemplateLibraryManager, { requireAdmin: true });