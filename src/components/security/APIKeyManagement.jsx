import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Key, Copy, Trash, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function APIKeyManagement() {
  const { t } = useLanguage();
  const [showKeys, setShowKeys] = useState({});

  const mockKeys = [
    { id: 1, name: 'Production API', key: 'sk_live_*********************', created: '2025-01-15', lastUsed: '2025-01-20' },
    { id: 2, name: 'Staging API', key: 'sk_test_*********************', created: '2025-01-10', lastUsed: '2025-01-19' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-600" />
          {t({ en: 'API Key Management', ar: 'إدارة مفاتيح API' })}
          <Badge className="ml-auto bg-amber-600">Pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Backend Implementation Required</p>
              <p>API key generation, validation, and rotation system needed</p>
            </div>
          </div>
        </div>

        <Button className="w-full bg-indigo-600">
          <Key className="h-4 w-4 mr-2" />
          {t({ en: 'Generate New Key', ar: 'إنشاء مفتاح جديد' })}
        </Button>

        <div className="space-y-2">
          {mockKeys.map(key => (
            <div key={key.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{key.name}</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setShowKeys({...showKeys, [key.id]: !showKeys[key.id]})}>
                    {showKeys[key.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success('Copied')}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
              <code className="text-xs bg-slate-900 text-slate-100 p-1 rounded block">{key.key}</code>
              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                <span>Created: {key.created}</span>
                <span>Last used: {key.lastUsed}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}