import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CheckCircle2, Clock, EyeOff } from 'lucide-react';

export default function StatusWorkflow({ entity, currentStatus, onStatusChange, entityType }) {
  const challengeStatuses = [
    { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700' },
    { value: 'in_treatment', label: 'In Treatment', color: 'bg-purple-100 text-purple-700' },
    { value: 'resolved', label: 'Resolved', color: 'bg-teal-100 text-teal-700' },
    { value: 'archived', label: 'Archived', color: 'bg-slate-200 text-slate-600' }
  ];

  const pilotStages = [
    { value: 'pre_pilot', label: 'Pre-Pilot', color: 'bg-slate-100 text-slate-700' },
    { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-700' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
    { value: 'evaluation', label: 'Evaluation', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
    { value: 'scaled', label: 'Scaled', color: 'bg-teal-100 text-teal-700' },
    { value: 'terminated', label: 'Terminated', color: 'bg-red-100 text-red-700' }
  ];

  const statuses = entityType === 'Challenge' ? challengeStatuses : pilotStages;
  const current = statuses.find(s => s.value === currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Badge className={current?.color}>
            {current?.label || currentStatus}
          </Badge>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            disabled={status.value === currentStatus}
          >
            <div className="flex items-center gap-2">
              {status.value === 'approved' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {status.value === 'under_review' && <Clock className="h-4 w-4 text-yellow-600" />}
              {status.value === 'archived' && <EyeOff className="h-4 w-4 text-slate-600" />}
              <span>{status.label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}