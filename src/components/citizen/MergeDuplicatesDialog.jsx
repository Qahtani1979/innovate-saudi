import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Network, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MergeDuplicatesDialog({ primaryIdea, duplicateIdeas, onClose }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const queryClient = useQueryClient();

  const mergeMutation = useMutation({
    mutationFn: async () => {
      // Merge all selected ideas into primary
      const allIdeas = [primaryIdea, ...duplicateIdeas.filter(d => selectedIds.includes(d.id))];
      
      // Combine vote counts
      const totalVotes = allIdeas.reduce((sum, idea) => sum + (idea.vote_count || 0), 0);
      
      // Combine comments
      const allSubmitters = allIdeas
        .filter(i => i.submitter_name)
        .map(i => i.submitter_name)
        .join(', ');

      // Update primary idea
      await base44.entities.CitizenIdea.update(primaryIdea.id, {
        vote_count: totalVotes,
        description: `${primaryIdea.description}\n\n[Merged from ${selectedIds.length} similar ideas. Co-submitters: ${allSubmitters}]`
      });

      // Mark duplicates as merged
      await Promise.all(
        selectedIds.map(id => 
          base44.entities.CitizenIdea.update(id, {
            status: 'duplicate',
            review_notes: `Merged into idea ${primaryIdea.id}`
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['citizen-ideas']);
      toast.success(`Merged ${selectedIds.length} duplicate ideas`);
      onClose();
    }
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            Merge Duplicate Ideas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-1">Primary Idea:</p>
            <p className="text-sm text-blue-800">{primaryIdea.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-blue-100 text-blue-700">{primaryIdea.vote_count || 0} votes</Badge>
              <Badge variant="outline">{primaryIdea.category}</Badge>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-2">Select duplicates to merge:</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {duplicateIdeas.map((idea) => (
                <label
                  key={idea.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedIds.includes(idea.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds([...selectedIds, idea.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== idea.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{idea.title}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{idea.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{idea.vote_count || 0} votes</Badge>
                      {idea.submitter_name && (
                        <span className="text-xs text-slate-500">by {idea.submitter_name}</span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 inline mr-1" />
              Selected duplicates will be marked as merged and their votes combined.
              All submitters will be credited in the description.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => mergeMutation.mutate()}
              disabled={selectedIds.length === 0 || mergeMutation.isPending}
              className="bg-purple-600"
            >
              Merge {selectedIds.length} Ideas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}