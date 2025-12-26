import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Workflow, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function VisualWorkflowBuilder({ entityType = 'Challenge' }) {
  const { language, isRTL, t } = useLanguage();
  const [stages, setStages] = useState([
    { id: 1, name: 'Draft', color: 'bg-slate-400' },
    { id: 2, name: 'Under Review', color: 'bg-blue-500' },
    { id: 3, name: 'Approved', color: 'bg-green-500' }
  ]);

  const addStage = () => {
    setStages([...stages, { id: Date.now(), name: 'New Stage', color: 'bg-purple-500' }]);
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-indigo-600" />
          {t({ en: `Visual Workflow Builder - ${entityType}`, ar: `بناء سير العمل المرئي - ${entityType}` })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-4">
          {stages.map((stage, i) => (
            <React.Fragment key={stage.id}>
              <div className="flex-shrink-0">
                <div className={`p-4 rounded-lg ${stage.color} text-white min-w-[150px] relative group`}>
                  <p className="font-semibold text-sm mb-2">{stage.name}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/30"
                    onClick={() => setStages(stages.filter(s => s.id !== stage.id))}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {i < stages.length - 1 && (
                <ArrowRight className="h-6 w-6 text-slate-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
          <Button onClick={addStage} variant="outline" className="flex-shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">{t({ en: 'Total Stages', ar: 'إجمالي المراحل' })}</p>
            <p className="text-2xl font-bold text-indigo-600">{stages.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">{t({ en: 'Transitions', ar: 'الانتقالات' })}</p>
            <p className="text-2xl font-bold text-purple-600">{stages.length - 1}</p>
          </div>
        </div>

        <Button className="w-full bg-indigo-600">
          {t({ en: 'Save Workflow', ar: 'حفظ سير العمل' })}
        </Button>
      </CardContent>
    </Card>
  );
}
