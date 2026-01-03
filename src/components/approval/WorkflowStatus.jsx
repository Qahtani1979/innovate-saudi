import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function WorkflowStatus({ approvals }) {
  if (!approvals || approvals.length === 0) return null;

  const getStatusIcon = (decision) => {
    switch (decision) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'conditional': return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    conditional: 'bg-amber-100 text-amber-700'
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700">Approval Workflow</h4>
      {approvals.sort((a, b) => a.priority - b.priority).map((approval, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
          {getStatusIcon(approval.decision)}
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 capitalize">
              {approval.approver_role?.replace(/_/g, ' ')}
            </p>
            {approval.comments && (
              <p className="text-xs text-slate-600 mt-1">{approval.comments}</p>
            )}
          </div>
          <Badge className={statusColors[approval.decision]}>
            {approval.decision}
          </Badge>
        </div>
      ))}
    </div>
  );
}