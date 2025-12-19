import React from 'react';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const PilotAccessDenied = ({ 
  message,
  showBackButton = true,
  showHomeButton = true
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="m-4 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <ShieldX className="h-6 w-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">
          {language === 'ar' ? 'الوصول مرفوض' : 'Access Denied'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">
          {message || (language === 'ar' 
            ? 'ليس لديك صلاحية لعرض هذه التجربة'
            : "You don't have permission to view this pilot"
          )}
        </p>
        <div className="flex gap-2">
          {showBackButton && (
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'رجوع' : 'Go Back'}
            </Button>
          )}
          {showHomeButton && (
            <Button onClick={() => navigate('/pilots')}>
              <Home className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'قائمة التجارب' : 'Pilots List'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PilotAccessDenied;
