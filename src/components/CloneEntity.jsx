import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { supabase } from '@/integrations/supabase/client';

export default function CloneEntity({ entity, entityType, buttonVariant = "outline" }) {
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const entityTypeToTable = {
    Challenge: 'challenges',
    Pilot: 'pilots',
    Solution: 'solutions',
    Program: 'programs'
  };

  const cloneMutation = useMutation({
    mutationFn: async () => {
      const clonedData = { ...entity };
      delete clonedData.id;
      delete clonedData.created_at;
      delete clonedData.updated_at;
      delete clonedData.created_by;
      
      if (newCode) {
        clonedData.code = newCode;
      } else {
        clonedData.code = `${entity.code}-COPY`;
      }

      if (clonedData.title_en) {
        clonedData.title_en = `${clonedData.title_en} (Copy)`;
      }
      if (clonedData.title_ar) {
        clonedData.title_ar = `${clonedData.title_ar} (نسخة)`;
      }
      if (clonedData.name_en) {
        clonedData.name_en = `${clonedData.name_en} (Copy)`;
      }

      clonedData.status = 'draft';
      clonedData.stage = 'pre_pilot';
      clonedData.is_published = false;

      const tableName = entityTypeToTable[entityType];
      const { data: result, error } = await supabase.from(tableName).insert(clonedData).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: (newEntity) => {
      queryClient.invalidateQueries([entityType.toLowerCase() + 's']);
      toast.success('Cloned successfully!');
      setOpen(false);
      
      const detailPages = {
        Challenge: 'ChallengeDetail',
        Pilot: 'PilotDetail',
        Solution: 'SolutionDetail',
        Program: 'ProgramDetail'
      };
      
      if (detailPages[entityType]) {
        navigate(createPageUrl(`${detailPages[entityType]}?id=${newEntity.id}`));
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Clone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone {entityType}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This will create a duplicate with status reset to draft. You can edit the new copy afterwards.
          </p>
          <div className="space-y-2">
            <Label>New Code (optional)</Label>
            <Input
              placeholder={`${entity.code}-COPY`}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => cloneMutation.mutate()} 
            disabled={cloneMutation.isPending}
            className="w-full"
          >
            {cloneMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Clone {entityType}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}