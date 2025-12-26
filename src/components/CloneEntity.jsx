import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useEntityCloner } from '@/hooks/useEntityCloner';

export default function CloneEntity({ entity, entityType, buttonVariant = "outline" }) {
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const navigate = useNavigate();
  const { cloneEntityMutation } = useEntityCloner();

  const handleClone = () => {
    cloneEntityMutation.mutate({ entity, entityType, newCode }, {
      onSuccess: (newEntity) => {
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
  };

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
            onClick={handleClone}
            disabled={cloneEntityMutation.isPending}
            className="w-full"
          >
            {cloneEntityMutation.isPending ? (
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
