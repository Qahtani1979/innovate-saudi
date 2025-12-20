import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickFixWorkflow({ challenge, onComplete }) {
  const queryClient = useQueryClient();
  const [fixData, setFixData] = useState({
    fix_description: '',
    fix_cost: '',
    fix_timeline_days: '',
    responsible_team: '',
    fix_category: 'operational'
  });

  const quickFixMutation = useMutation({
    mutationFn: async (data) => {
      // Update challenge with quick fix resolution
      const { error } = await supabase.from('challenges').update({
        status: 'resolved',
        resolution_date: new Date().toISOString(),
        treatment_plan: {
          approach: 'quick_fix',
          ...data
        },
        track: 'operational'
      }).eq('id', challenge.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge resolved via quick fix');
      onComplete?.();
    }
  });

  const handleSubmit = () => {
    if (!fixData.fix_description) {
      toast.error('Please describe the fix implemented');
      return;
    }
    quickFixMutation.mutate(fixData);
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
          disabled={quickFixMutation.isPending}
          className="w-full bg-green-600"
        >
          {quickFixMutation.isPending ? (
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