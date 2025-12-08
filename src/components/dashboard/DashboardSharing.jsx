import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

/**
 * Dashboard sharing functionality
 */
export default function DashboardSharing({ dashboardConfig, dashboardName }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  const shareUrl = `${window.location.origin}/shared-dashboard/${btoa(JSON.stringify(dashboardConfig))}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const shareViaEmail = async () => {
    if (!email) return;

    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Shared Dashboard: ${dashboardName}`,
        body: `View the shared dashboard here: ${shareUrl}`
      });
      toast.success('Dashboard shared via email');
      setEmail('');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to share dashboard');
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-xs" />
              <Button size="sm" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button size="sm" onClick={shareViaEmail}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}