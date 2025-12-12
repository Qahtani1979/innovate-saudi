import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Monitor, Smartphone, Globe, Clock, MapPin, Shield, LogOut, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function SessionsDialog({ open, onOpenChange }) {
  const { t, isRTL } = useLanguage();
  const { session, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get device info from user agent
  const getDeviceInfo = (userAgent) => {
    if (!userAgent) return { type: 'desktop', name: 'Unknown Device' };
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return { type: 'mobile', name: 'Mobile Device' };
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return { type: 'tablet', name: 'Tablet' };
    }
    
    // Detect browser
    let browser = 'Browser';
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    
    return { type: 'desktop', name: browser };
  };

  const handleSignOutAllDevices = async () => {
    setIsLoading(true);
    try {
      // First try global signout for all devices
      await supabase.auth.signOut({ scope: 'global' });
      toast.success(t({ en: 'Signed out from all devices', ar: 'تم تسجيل الخروج من جميع الأجهزة' }));
    } catch (error) {
      // If session_not_found, that's fine - session was already invalidated
      if (error?.message?.includes('session_not_found')) {
        toast.success(t({ en: 'Signed out from all devices', ar: 'تم تسجيل الخروج من جميع الأجهزة' }));
      } else {
        console.error('Sign out error:', error);
        toast.error(t({ en: 'Failed to sign out', ar: 'فشل في تسجيل الخروج' }));
      }
    } finally {
      setIsLoading(false);
      // Always redirect to auth page
      window.location.href = '/Auth';
    }
  };

  const currentSession = session ? {
    created_at: session.created_at || new Date().toISOString(),
    expires_at: session.expires_at,
    device: getDeviceInfo(navigator.userAgent),
    isCurrent: true,
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t({ en: 'Active Sessions', ar: 'الجلسات النشطة' })}
          </DialogTitle>
          <DialogDescription>
            {t({ en: 'Manage your active sessions across devices', ar: 'إدارة جلساتك النشطة عبر الأجهزة' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentSession && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {currentSession.device.type === 'mobile' ? (
                      <Smartphone className="h-8 w-8 text-primary mt-1" />
                    ) : (
                      <Monitor className="h-8 w-8 text-primary mt-1" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{currentSession.device.name}</p>
                        <Badge className="bg-green-600 text-xs">
                          {t({ en: 'Current', ar: 'الحالي' })}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {t({ en: 'Started', ar: 'بدأت' })}: {format(new Date(currentSession.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      {currentSession.expires_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t({ en: 'Expires', ar: 'تنتهي' })}: {format(new Date(currentSession.expires_at * 1000), 'MMM d, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              {t({ 
                en: 'If you notice any suspicious activity, sign out from all devices and change your password immediately.', 
                ar: 'إذا لاحظت أي نشاط مشبوه، سجل الخروج من جميع الأجهزة وغيّر كلمة المرور فوراً.' 
              })}
            </p>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleSignOutAllDevices}
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoading 
                ? t({ en: 'Signing out...', ar: 'جاري الخروج...' })
                : t({ en: 'Sign Out From All Devices', ar: 'تسجيل الخروج من جميع الأجهزة' })
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
