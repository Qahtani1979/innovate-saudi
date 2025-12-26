/**
 * Challenge Actions Component
 * Implements: dc-4 (role-based action buttons)
 */

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/components/permissions/usePermissions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Edit, MoreVertical, Send, CheckCircle, XCircle,
  Eye, EyeOff, Archive, Trash2, Copy, Star, StarOff
} from 'lucide-react';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';
import { toast } from 'sonner';

export function ChallengeActions({ challenge, canEdit, onUpdate }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin, hasPermission, isMunicipalityStaff, isDeputyship } = usePermissions();
  const mutations = useChallengeMutations();

  const [confirmAction, setConfirmAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine available actions based on role and challenge state
  const isOwner = challenge.challenge_owner_email === user?.email;
  const isReviewer = challenge.review_assigned_to === user?.email;
  const isDraft = challenge.status === 'draft';
  const isSubmitted = challenge.status === 'submitted';
  const isUnderReview = challenge.status === 'under_review';
  const isApproved = challenge.status === 'approved';
  const isPublished = challenge.is_published;
  const isArchived = challenge.status === 'archived' || challenge.is_archived;

  // Action handlers
  const handleAction = async (action) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'submit':
          await mutations.submitChallenge.mutateAsync(challenge.id);
          toast.success(language === 'ar' ? 'تم تقديم التحدي للمراجعة' : 'Challenge submitted for review');
          break;

        case 'approve':
          await mutations.updateStatus.mutateAsync({
            id: challenge.id,
            status: 'approved',
            notes: 'Approved by reviewer'
          });
          toast.success(language === 'ar' ? 'تمت الموافقة على التحدي' : 'Challenge approved');
          break;

        case 'reject':
          await mutations.updateStatus.mutateAsync({
            id: challenge.id,
            status: 'rejected',
            notes: 'Rejected by reviewer'
          });
          toast.success(language === 'ar' ? 'تم رفض التحدي' : 'Challenge rejected');
          break;

        case 'publish':
          await mutations.updateChallenge.mutateAsync({
            id: challenge.id,
            is_published: true,
            status: 'published'
          });
          toast.success(language === 'ar' ? 'تم نشر التحدي' : 'Challenge published');
          break;

        case 'unpublish':
          await mutations.updateChallenge.mutateAsync({
            id: challenge.id,
            is_published: false
          });
          toast.success(language === 'ar' ? 'تم إلغاء نشر التحدي' : 'Challenge unpublished');
          break;

        case 'archive':
          await mutations.updateStatus.mutateAsync({
            id: challenge.id,
            status: 'archived'
          });
          toast.success(language === 'ar' ? 'تمت أرشفة التحدي' : 'Challenge archived');
          break;

        case 'delete':
          await mutations.deleteChallenge.mutateAsync(challenge.id);
          toast.success(language === 'ar' ? 'تم حذف التحدي' : 'Challenge deleted');
          break;

        case 'feature':
          await mutations.updateChallenge.mutateAsync({
            id: challenge.id,
            is_featured: !challenge.is_featured
          });
          toast.success(challenge.is_featured
            ? (language === 'ar' ? 'تم إزالة التمييز' : 'Removed from featured')
            : (language === 'ar' ? 'تم تمييز التحدي' : 'Challenge featured'));
          break;

        default:
          break;
      }

      onUpdate?.();
    } catch (error) {
      console.error('Action failed:', error);
      toast.error(language === 'ar' ? 'فشل الإجراء' : 'Action failed');
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    const url = `${window.location.origin}/challenges/${challenge.id}`;
    navigator.clipboard.writeText(url);
    toast.success(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
  };

  // Actions list based on permissions
  const primaryActions = [];
  const secondaryActions = [];
  const dangerActions = [];

  // Edit button (primary)
  if (canEdit && !isArchived) {
    primaryActions.push({
      key: 'edit',
      label: language === 'ar' ? 'تعديل' : 'Edit',
      icon: Edit,
      onClick: () => window.location.href = `/challenges/${challenge.id}/edit`
    });
  }

  // Submit for review (owner only, draft only)
  if ((isOwner || isAdmin) && isDraft) {
    primaryActions.push({
      key: 'submit',
      label: language === 'ar' ? 'تقديم للمراجعة' : 'Submit for Review',
      icon: Send,
      onClick: () => setConfirmAction('submit')
    });
  }

  // Review actions (reviewer or admin, submitted/under_review only)
  if ((isReviewer || isAdmin || isDeputyship) && (isSubmitted || isUnderReview)) {
    primaryActions.push({
      key: 'approve',
      label: language === 'ar' ? 'موافقة' : 'Approve',
      icon: CheckCircle,
      variant: 'default',
      onClick: () => setConfirmAction('approve')
    });
    primaryActions.push({
      key: 'reject',
      label: language === 'ar' ? 'رفض' : 'Reject',
      icon: XCircle,
      variant: 'destructive',
      onClick: () => setConfirmAction('reject')
    });
  }

  // Publish/Unpublish (admin or deputyship, approved only)
  if ((isAdmin || isDeputyship || hasPermission('challenges.publish')) && (isApproved || isPublished)) {
    if (!isPublished) {
      secondaryActions.push({
        key: 'publish',
        label: language === 'ar' ? 'نشر' : 'Publish',
        icon: Eye,
        onClick: () => setConfirmAction('publish')
      });
    } else {
      secondaryActions.push({
        key: 'unpublish',
        label: language === 'ar' ? 'إلغاء النشر' : 'Unpublish',
        icon: EyeOff,
        onClick: () => setConfirmAction('unpublish')
      });
    }
  }

  // Feature toggle (admin only)
  if (isAdmin) {
    secondaryActions.push({
      key: 'feature',
      label: challenge.is_featured
        ? (language === 'ar' ? 'إزالة التمييز' : 'Remove Featured')
        : (language === 'ar' ? 'تمييز' : 'Feature'),
      icon: challenge.is_featured ? StarOff : Star,
      onClick: () => handleAction('feature')
    });
  }

  // Share/Copy link
  secondaryActions.push({
    key: 'copy',
    label: language === 'ar' ? 'نسخ الرابط' : 'Copy Link',
    icon: Copy,
    onClick: handleCopyLink
  });

  // Archive (admin or owner)
  if ((isAdmin || isOwner) && !isArchived) {
    dangerActions.push({
      key: 'archive',
      label: language === 'ar' ? 'أرشفة' : 'Archive',
      icon: Archive,
      onClick: () => setConfirmAction('archive')
    });
  }

  // Delete (admin only)
  if (isAdmin) {
    dangerActions.push({
      key: 'delete',
      label: language === 'ar' ? 'حذف' : 'Delete',
      icon: Trash2,
      onClick: () => setConfirmAction('delete')
    });
  }

  // No actions available
  if (primaryActions.length === 0 && secondaryActions.length === 0 && dangerActions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Primary action buttons */}
        {primaryActions.slice(0, 2).map(action => (
          <Button
            key={action.key}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={isLoading}
          >
            <action.icon className="h-4 w-4 mr-1" />
            {action.label}
          </Button>
        ))}

        {/* More actions dropdown */}
        {(primaryActions.length > 2 || secondaryActions.length > 0 || dangerActions.length > 0) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Remaining primary actions */}
              {primaryActions.slice(2).map(action => (
                <DropdownMenuItem key={action.key} onClick={action.onClick}>
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}

              {primaryActions.length > 2 && secondaryActions.length > 0 && (
                <DropdownMenuSeparator />
              )}

              {/* Secondary actions */}
              {secondaryActions.map(action => (
                <DropdownMenuItem key={action.key} onClick={action.onClick}>
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}

              {dangerActions.length > 0 && <DropdownMenuSeparator />}

              {/* Danger actions */}
              {dangerActions.map(action => (
                <DropdownMenuItem
                  key={action.key}
                  onClick={action.onClick}
                  className="text-destructive focus:text-destructive"
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد الإجراء' : 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'submit' && (language === 'ar'
                ? 'هل تريد تقديم هذا التحدي للمراجعة؟ لن تتمكن من تعديله بعد التقديم.'
                : 'Do you want to submit this challenge for review? You won\'t be able to edit it after submission.')}
              {confirmAction === 'approve' && (language === 'ar'
                ? 'هل تريد الموافقة على هذا التحدي؟'
                : 'Do you want to approve this challenge?')}
              {confirmAction === 'reject' && (language === 'ar'
                ? 'هل تريد رفض هذا التحدي؟'
                : 'Do you want to reject this challenge?')}
              {confirmAction === 'publish' && (language === 'ar'
                ? 'هل تريد نشر هذا التحدي؟ سيكون مرئياً للجميع.'
                : 'Do you want to publish this challenge? It will be visible to everyone.')}
              {confirmAction === 'unpublish' && (language === 'ar'
                ? 'هل تريد إلغاء نشر هذا التحدي؟'
                : 'Do you want to unpublish this challenge?')}
              {confirmAction === 'archive' && (language === 'ar'
                ? 'هل تريد أرشفة هذا التحدي؟'
                : 'Do you want to archive this challenge?')}
              {confirmAction === 'delete' && (language === 'ar'
                ? 'هل أنت متأكد من حذف هذا التحدي؟ هذا الإجراء لا يمكن التراجع عنه.'
                : 'Are you sure you want to delete this challenge? This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(confirmAction)}
              disabled={isLoading}
              className={confirmAction === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isLoading
                ? (language === 'ar' ? 'جاري...' : 'Processing...')
                : (language === 'ar' ? 'تأكيد' : 'Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ChallengeActions;
