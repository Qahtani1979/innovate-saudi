import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RoleAuditDetail from './RoleAuditDetail';

export default function RoleAuditDialog({ roleId, open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Role Audit Details</DialogTitle>
        </DialogHeader>
        <RoleAuditDetail roleId={roleId} />
      </DialogContent>
    </Dialog>
  );
}