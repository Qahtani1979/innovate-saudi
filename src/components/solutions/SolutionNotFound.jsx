import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';

/**
 * 404 Not Found component for Solutions
 * Implements dc-1: 404 handling for invalid IDs
 */
export default function SolutionNotFound({ solutionId }) {
  const { t, isRTL } = useLanguage();
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>
            {t({ en: 'Solution Not Found', ar: 'الحل غير موجود' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t({ 
              en: 'The solution you are looking for does not exist or has been removed.',
              ar: 'الحل الذي تبحث عنه غير موجود أو تمت إزالته.'
            })}
          </p>
          
          {solutionId && (
            <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
              ID: {solutionId}
            </p>
          )}
          
          <div className="flex gap-3 justify-center pt-2">
            <Link to="/solutions">
              <Button variant="outline">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Back to Solutions', ar: 'العودة للحلول' })}
              </Button>
            </Link>
            <Link to="/solutions">
              <Button>
                <Search className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Browse Solutions', ar: 'تصفح الحلول' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
