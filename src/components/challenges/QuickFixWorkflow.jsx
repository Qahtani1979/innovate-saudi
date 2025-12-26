import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';

export default function QuickFixWorkflow({ challenge, onComplete }) {
  const { updateChallenge } = useChallengeMutations();
  const [fixData, setFixData] = useState({
    fix_description: '',
    fix_cost: '',
    fix_timeline_days: '',
    responsible_team: '',
    fix_category: 'operational'
  });

  const handleSubmit = () => {
    if (!fixData.fix_description) {
      toast.error('Please describe the fix implemented');
      return;
    }

    updateChallenge.mutate({
      id: challenge.id,
      data: {
        status: 'resolved',
        resolution_date: new Date().toISOString(),
        track: 'operational',
        treatment_plan: {
          approach: 'quick_fix',
          ...fixData
        }
      },
      activityLog: {
        activity_type: 'resolved',
        description: 'Challenge resolved via Quick Fix',
        details: fixData
      }
    }, {
      onSuccess: () => {
        // onSuccess handled by hook (toast), but we want custom toast? 
        // The hook handles generic success. We can add additional actions here if needed.
        // But hook's onSuccess runs first? No, passed options override? 
        // TanStack Query v5: callbacks on mutate override? No, they run in addition or override depending on config.
        // Actually, updateChallenge definition in hook has its own onSuccess.
        // If I pass { onSuccess } to mutate, it fires *after* mutationFn settles. 
        // Ideally rely on hook's defaults for standard stuff.
        toast.success('Challenge resolved via quick fix');
        onComplete?.();
      }
    });
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          Quick Fix Resolution (No Pilot Required)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-green-50 rounded-lg border border-green-300">
          <p className="text-sm text-green-900">
            <strong>Quick Fix Path:</strong> For low-complexity operational challenges that can be resolved
            directly without experimentation. Ideal for maintenance issues, simple process improvements,
            or administrative fixes.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Fix Description *
          </label>
          <Textarea
            value={fixData.fix_description}
            onChange={(e) => setFixData({ ...fixData, fix_description: e.target.value })}
            placeholder="Describe the operational fix implemented..."
            className="h-24"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Cost (SAR)
            </label>
            <Input
              type="number"
              value={fixData.fix_cost}
              onChange={(e) => setFixData({ ...fixData, fix_cost: e.target.value })}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Timeline (Days)
            </label>
            <Input
              type="number"
              value={fixData.fix_timeline_days}
              onChange={(e) => setFixData({ ...fixData, fix_timeline_days: e.target.value })}
              placeholder="7"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Responsible Team
          </label>
          <Input
            value={fixData.responsible_team}
            onChange={(e) => setFixData({ ...fixData, responsible_team: e.target.value })}
            placeholder="Department or team responsible"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={updateChallenge.isPending}
          className="w-full bg-green-600"
        >
          {updateChallenge.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Mark Challenge as Resolved (Quick Fix)
        </Button>
      </CardContent>
    </Card>
  );
}
