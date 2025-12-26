import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '../LanguageContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useMyRoleRequests } from '@/hooks/useRoleRequests';

/**
 * Compact role request status banner for profile page
 * Shows pending/approved/rejected role requests as a notification banner
 */
export default function RoleRequestStatusBanner() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: pendingRequests = [], isLoading } = useMyRoleRequests(user?.email);

  if (isLoading) {
    return null;
  }

  // Filter to show only recent requests (last 7 days for approved/rejected, all pending)
  const recentRequests = pendingRequests.filter(req => {
    if (req.status === 'pending') return true;
    const createdAt = new Date(req.updated_at || req.created_at);
    const daysDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  if (recentRequests.length === 0) {
    return null;
  }

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          variant: 'default',
          bgClass: 'bg-amber-50 border-amber-200',
          iconClass: 'text-amber-500',
          label: { en: 'Pending Review', ar: 'قيد المراجعة' }
        };
      case 'approved':
        return {
          icon: CheckCircle2,
          variant: 'success',
          bgClass: 'bg-green-50 border-green-200',
          iconClass: 'text-green-500',
          label: { en: 'Approved', ar: 'تمت الموافقة' }
        };
      case 'rejected':
        return {
          icon: XCircle,
          variant: 'destructive',
          bgClass: 'bg-red-50 border-red-200',
          iconClass: 'text-red-500',
          label: { en: 'Rejected', ar: 'مرفوض' }
        };
      default:
        return {
          icon: AlertCircle,
          variant: 'default',
          bgClass: 'bg-gray-50 border-gray-200',
          iconClass: 'text-gray-500',
          label: { en: status, ar: status }
        };
    }
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      municipality_staff: { en: 'Municipality Staff', ar: 'موظف بلدية' },
      provider: { en: 'Solution Provider', ar: 'مزود حلول' },
      expert: { en: 'Expert', ar: 'خبير' },
      researcher: { en: 'Researcher', ar: 'باحث' },
      citizen: { en: 'Citizen', ar: 'مواطن' },
      deputyship: { en: 'Deputyship', ar: 'وكالة' },
      viewer: { en: 'Viewer', ar: 'زائر' }
    };
    return roleLabels[role] || { en: role, ar: role };
  };

  return (
    <div className="space-y-2 mb-4">
      {recentRequests.map((request) => {
        const config = getStatusConfig(request.status);
        const StatusIcon = config.icon;
        const roleLabel = getRoleLabel(request.requested_role);

        return (
          <Alert key={request.id} className={`${config.bgClass} border`}>
            <StatusIcon className={`h-4 w-4 ${config.iconClass}`} />
            <AlertTitle className="flex items-center gap-2">
              {t({ en: 'Role Request', ar: 'طلب دور' })}
              <Badge variant="outline" className="text-xs">
                {t(roleLabel)}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-sm">
              {request.status === 'pending' && (
                t({
                  en: 'Your request is being reviewed by an administrator.',
                  ar: 'طلبك قيد المراجعة من قبل المسؤول.'
                })
              )}
              {request.status === 'approved' && (
                t({
                  en: 'Your request has been approved! Refresh the page to access your new role.',
                  ar: 'تمت الموافقة على طلبك! قم بتحديث الصفحة للوصول إلى دورك الجديد.'
                })
              )}
              {request.status === 'rejected' && (
                <>
                  {t({ en: 'Your request was not approved.', ar: 'لم تتم الموافقة على طلبك.' })}
                  {request.rejection_reason && (
                    <span className="block mt-1 text-muted-foreground">
                      {t({ en: 'Reason:', ar: 'السبب:' })} {request.rejection_reason}
                    </span>
                  )}
                </>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
