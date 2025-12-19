import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

/**
 * Access Denied component for Solutions
 * Implements dc-2: Access denied shown for unauthorized users
 */
export default function SolutionAccessDenied({ reason }) {
  const { t, isRTL } = useLanguage();
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="max-w-md w-full border-destructive/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-destructive">
            {t({ en: 'Access Denied', ar: 'الوصول مرفوض' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {reason || t({ 
              en: 'You do not have permission to view this solution.',
              ar: 'ليس لديك صلاحية لعرض هذا الحل.'
            })}
          </p>
          
          <div className="flex gap-3 justify-center pt-2">
            <Link to="/solutions">
              <Button variant="outline">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Back to Solutions', ar: 'العودة للحلول' })}
              </Button>
            </Link>
            <Link to="/login">
              <Button>
                <LogIn className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Sign In', ar: 'تسجيل الدخول' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
