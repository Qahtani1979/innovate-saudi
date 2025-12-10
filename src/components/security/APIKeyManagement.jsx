import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Key, Copy, Trash, Eye, EyeOff, AlertCircle, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function APIKeyManagement() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [showKeys, setShowKeys] = useState({});
  const [newKeyName, setNewKeyName] = useState('');

  // Fetch API keys from platform_configs table
  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_configs')
        .select('*')
        .eq('config_type', 'api_key')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching API keys:', error);
        return [];
      }
      return data || [];
    }
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name) => {
      // Generate a secure-looking key (in production, this would be server-side)
      const key = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const maskedKey = `sk_***${key.slice(-8)}`;
      
      const { data, error } = await supabase
        .from('platform_configs')
        .insert({
          config_key: `api_key_${Date.now()}`,
          config_value: {
            name,
            key: maskedKey, // In production, store hashed key
            created: new Date().toISOString(),
            lastUsed: null
          },
          config_type: 'api_key',
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, fullKey: key }; // Return full key only on creation
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['api-keys']);
      setNewKeyName('');
      // Show the full key once
      toast.success(
        <div>
          <p>{t({ en: 'API key created!', ar: 'تم إنشاء مفتاح API!' })}</p>
          <code className="text-xs bg-slate-800 text-green-400 p-1 rounded block mt-2">
            {data.fullKey}
          </code>
          <p className="text-xs mt-1">{t({ en: 'Copy it now - you won\'t see it again!', ar: 'انسخه الآن - لن تراه مرة أخرى!' })}</p>
        </div>,
        { duration: 10000 }
      );
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to create API key', ar: 'فشل في إنشاء مفتاح API' }));
      console.error('Create key error:', error);
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('platform_configs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['api-keys']);
      toast.success(t({ en: 'API key deleted', ar: 'تم حذف مفتاح API' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to delete API key', ar: 'فشل في حذف مفتاح API' }));
      console.error('Delete key error:', error);
    }
  });

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    toast.success(t({ en: 'Copied to clipboard', ar: 'تم النسخ إلى الحافظة' }));
  };

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-600" />
          {t({ en: 'API Key Management', ar: 'إدارة مفاتيح API' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new key */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder={t({ en: 'Key name (e.g., Production API)', ar: 'اسم المفتاح (مثل: API الإنتاج)' })}
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <Button 
            className="bg-indigo-600"
            onClick={() => createKeyMutation.mutate(newKeyName)}
            disabled={!newKeyName.trim() || createKeyMutation.isPending}
          >
            {createKeyMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Keys list */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm">
              {t({ en: 'No API keys created yet', ar: 'لم يتم إنشاء مفاتيح API بعد' })}
            </div>
          ) : (
            apiKeys.map(keyConfig => {
              const keyData = keyConfig.config_value;
              return (
                <div key={keyConfig.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{keyData?.name || 'Unnamed Key'}</p>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setShowKeys({...showKeys, [keyConfig.id]: !showKeys[keyConfig.id]})}
                      >
                        {showKeys[keyConfig.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleCopy(keyData?.key || '')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteKeyMutation.mutate(keyConfig.id)}
                        disabled={deleteKeyMutation.isPending}
                      >
                        <Trash className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <code className="text-xs bg-slate-900 text-slate-100 p-1 rounded block">
                    {showKeys[keyConfig.id] ? keyData?.key : '••••••••••••••••••••'}
                  </code>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>{t({ en: 'Created', ar: 'أنشئ' })}: {keyData?.created ? new Date(keyData.created).toLocaleDateString() : 'Unknown'}</span>
                    {keyData?.lastUsed && (
                      <span>{t({ en: 'Last used', ar: 'آخر استخدام' })}: {new Date(keyData.lastUsed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-blue-800">
              <p className="font-medium">{t({ en: 'Security Note', ar: 'ملاحظة أمنية' })}</p>
              <p>{t({ en: 'API keys are shown only once when created. Keep them secure!', ar: 'تظهر مفاتيح API مرة واحدة فقط عند إنشائها. احتفظ بها آمنة!' })}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
