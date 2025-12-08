import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Plus, Save, Play, Settings, Trash2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function WorkflowDesigner() {
  const { language, isRTL, t } = useLanguage();
  const [workflows, setWorkflows] = useState([
    { id: 1, name: 'Challenge Review', steps: 3, active: true },
    { id: 2, name: 'Pilot Approval', steps: 5, active: true }
  ]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t({ en: 'Workflow Designer', ar: 'مصمم سير العمل' })}</h1>
          <p className="text-slate-600">{t({ en: 'Visual workflow builder', ar: 'بناء سير العمل المرئي' })}</p>
        </div>
        <Button className="bg-blue-600">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'New Workflow', ar: 'سير عمل جديد' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Workflows', ar: 'سير العمل' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workflows.map(wf => (
                <div key={wf.id} className={`p-3 border rounded-lg cursor-pointer ${selectedWorkflow === wf.id ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => setSelectedWorkflow(wf.id)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{wf.name}</span>
                    <Badge variant={wf.active ? 'default' : 'outline'}>{wf.active ? 'Active' : 'Draft'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{wf.steps} steps</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              {t({ en: 'Canvas', ar: 'لوحة الرسم' })}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline"><Settings className="h-4 w-4" /></Button>
                <Button size="sm" variant="outline"><Play className="h-4 w-4" /></Button>
                <Button size="sm"><Save className="h-4 w-4" /></Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg h-96 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <p className="text-slate-500 mb-4">{t({ en: 'Drag & drop workflow builder', ar: 'بناء سير العمل بالسحب والإفلات' })}</p>
                <Button variant="outline">{t({ en: 'Add Step', ar: 'إضافة خطوة' })}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(WorkflowDesigner, { requireAdmin: true });