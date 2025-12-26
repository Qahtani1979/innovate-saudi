import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { TrendingUp, Plus, X, CheckCircle2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useSolutionMutations } from '@/hooks/useSolutionMutations';

export default function SolutionDeploymentTracker({ solution, onClose }) {
  const { t, isRTL } = useLanguage();
  const { updateSolution } = useSolutionMutations();

  const [deployments, setDeployments] = useState(solution?.deployments || []);
  const [newDeployment, setNewDeployment] = useState({
    organization: '',
    location: '',
    start_date: '',
    status: 'active',
    results: '',
    kpis_achieved: ''
  });

  const handleAddDeployment = async () => {
    const updatedDeployments = [...deployments, {
      ...newDeployment,
      recorded_date: new Date().toISOString().split('T')[0]
    }];

    try {
      await updateSolution.mutateAsync({
        id: solution.id,
        data: {
          deployments: updatedDeployments,
          deployment_count: updatedDeployments.filter(d => d.status !== 'terminated').length
        },
        activityLog: {
          type: 'deployment_added',
          description: `New deployment added at ${newDeployment.organization}`,
          metadata: { organization: newDeployment.organization }
        }
      });

      toast.success(t({ en: 'Deployment added', ar: 'تمت إضافة النشر' }));
      setDeployments(updatedDeployments);
      setNewDeployment({
        organization: '',
        location: '',
        start_date: '',
        status: 'active',
        results: '',
        kpis_achieved: ''
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const updateDeploymentStatus = async (index, newStatus) => {
    const updated = [...deployments];
    updated[index] = { ...updated[index], status: newStatus };

    try {
      await updateSolution.mutateAsync({
        id: solution.id,
        data: {
          deployments: updated,
          deployment_count: updated.filter(d => d.status !== 'terminated').length
        }
      });
      setDeployments(updated);
      toast.success(t({ en: 'Status updated', ar: 'تم تحديث الحالة' }));
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          {t({ en: 'Deployment Tracker', ar: 'متتبع عمليات النشر' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900">{solution?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">
            {deployments.filter(d => d.status === 'active').length} active • {deployments.length} total deployments
          </p>
        </div>

        {/* Existing Deployments */}
        {deployments.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Active Deployments', ar: 'عمليات النشر النشطة' })}
            </p>
            {deployments.map((dep, i) => (
              <div key={i} className={`p-3 border rounded-lg ${dep.status === 'active' ? 'bg-green-50 border-green-300' :
                dep.status === 'completed' ? 'bg-blue-50 border-blue-300' :
                  'bg-slate-50'
                }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900">{dep.organization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-slate-600" />
                      <p className="text-xs text-slate-600">{dep.location}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Since: {dep.start_date}</p>
                  </div>
                  <select
                    value={dep.status}
                    onChange={(e) => updateDeploymentStatus(i, e.target.value)}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                {dep.results && (
                  <p className="text-xs text-slate-700 italic">{dep.results}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add New Deployment */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Add New Deployment', ar: 'إضافة نشر جديد' })}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Organization', ar: 'المنظمة' })}
              </label>
              <Input
                value={newDeployment.organization}
                onChange={(e) => setNewDeployment({ ...newDeployment, organization: e.target.value })}
                placeholder={t({ en: 'e.g., Riyadh Municipality', ar: 'مثل: أمانة الرياض' })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Location', ar: 'الموقع' })}
              </label>
              <Input
                value={newDeployment.location}
                onChange={(e) => setNewDeployment({ ...newDeployment, location: e.target.value })}
                placeholder="City/Region"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Start Date', ar: 'تاريخ البدء' })}
            </label>
            <Input
              type="date"
              value={newDeployment.start_date}
              onChange={(e) => setNewDeployment({ ...newDeployment, start_date: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Results & Outcomes', ar: 'النتائج والمخرجات' })}
            </label>
            <Textarea
              value={newDeployment.results}
              onChange={(e) => setNewDeployment({ ...newDeployment, results: e.target.value })}
              rows={2}
              placeholder={t({ en: 'Describe results...', ar: 'وصف النتائج...' })}
            />
          </div>

          <Button
            onClick={handleAddDeployment}
            disabled={!newDeployment.organization || !newDeployment.start_date || updateSolution.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Deployment', ar: 'إضافة نشر' })}
          </Button>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onClose} className="flex-1">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Done', ar: 'تم' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}