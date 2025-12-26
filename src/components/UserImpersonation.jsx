import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { UserCircle, LogIn, AlertTriangle } from 'lucide-react';

export default function UserImpersonation() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-purple-600" />
          {t({ en: 'User Impersonation', ar: 'انتحال صفة المستخدم' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-xs text-amber-900">{t({ en: 'Support tool - All actions are logged', ar: 'أداة دعم - جميع الإجراءات مسجلة' })}</p>
          </div>
        </div>
        
        <Input 
          placeholder={t({ en: 'Search user by email...', ar: 'البحث عن مستخدم بالبريد...' })}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="space-y-2">
          {['user1@example.sa', 'user2@example.sa'].map((email, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">{email}</p>
                <Badge variant="outline" className="text-xs mt-1">Municipality Admin</Badge>
              </div>
              <Button size="sm" variant="outline">
                <LogIn className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
