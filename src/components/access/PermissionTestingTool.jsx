import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { useBackendPermission } from './BackendPermissionValidator';
import { CheckCircle2, XCircle, Play, Shield } from 'lucide-react';

export default function PermissionTestingTool() {
  const { t } = useLanguage();
  const { validatePermission, validateFieldAccess } = useBackendPermission();
  const [testConfig, setTestConfig] = useState({
    permission: '',
    entity_type: '',
    entity_id: '',
    action: ''
  });
  const [fieldTestConfig, setFieldTestConfig] = useState({
    entity_type: '',
    field_name: '',
    operation: 'read'
  });
  const [result, setResult] = useState(null);
  const [fieldResult, setFieldResult] = useState(null);

  const runPermissionTest = async () => {
    const res = await validatePermission(
      testConfig.permission || null,
      testConfig.entity_type || null,
      testConfig.entity_id || null,
      testConfig.action || null
    );
    setResult(res);
  };

  const runFieldTest = async () => {
    const res = await validateFieldAccess(
      fieldTestConfig.entity_type,
      fieldTestConfig.field_name,
      fieldTestConfig.operation
    );
    setFieldResult(res);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t({ en: 'Permission Testing Tool', ar: 'أداة اختبار الصلاحيات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">
              {t({ en: 'Test Entity Permission', ar: 'اختبار صلاحية الكيان' })}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Permission (e.g., challenge_create)"
                value={testConfig.permission}
                onChange={(e) => setTestConfig({ ...testConfig, permission: e.target.value })}
              />
              <Input
                placeholder="Entity Type (e.g., challenge)"
                value={testConfig.entity_type}
                onChange={(e) => setTestConfig({ ...testConfig, entity_type: e.target.value })}
              />
              <Input
                placeholder="Entity ID (optional)"
                value={testConfig.entity_id}
                onChange={(e) => setTestConfig({ ...testConfig, entity_id: e.target.value })}
              />
              <Input
                placeholder="Action (e.g., create, edit)"
                value={testConfig.action}
                onChange={(e) => setTestConfig({ ...testConfig, action: e.target.value })}
              />
            </div>
            <Button onClick={runPermissionTest} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {t({ en: 'Test Permission', ar: 'اختبار الصلاحية' })}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg border-2 ${result.allowed ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.allowed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {result.allowed ? 
                      t({ en: 'Permission Granted', ar: 'الصلاحية ممنوحة' }) :
                      t({ en: 'Permission Denied', ar: 'الصلاحية مرفوضة' })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 mb-2">{result.reason}</p>
                {result.user_permissions && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-600 mb-1">
                      {t({ en: 'User Permissions:', ar: 'صلاحيات المستخدم:' })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {result.user_permissions.slice(0, 10).map((perm, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {result.user_permissions.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{result.user_permissions.length - 10}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-medium">
              {t({ en: 'Test Field-Level Security', ar: 'اختبار أمان مستوى الحقل' })}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Entity Type (e.g., Challenge)"
                value={fieldTestConfig.entity_type}
                onChange={(e) => setFieldTestConfig({ ...fieldTestConfig, entity_type: e.target.value })}
              />
              <Input
                placeholder="Field Name (e.g., budget)"
                value={fieldTestConfig.field_name}
                onChange={(e) => setFieldTestConfig({ ...fieldTestConfig, field_name: e.target.value })}
              />
              <select
                className="px-3 py-2 border rounded-md"
                value={fieldTestConfig.operation}
                onChange={(e) => setFieldTestConfig({ ...fieldTestConfig, operation: e.target.value })}
              >
                <option value="read">Read</option>
                <option value="write">Write</option>
              </select>
            </div>
            <Button onClick={runFieldTest} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {t({ en: 'Test Field Access', ar: 'اختبار الوصول للحقل' })}
            </Button>

            {fieldResult && (
              <div className={`p-4 rounded-lg border-2 ${fieldResult.allowed ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {fieldResult.allowed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    {fieldResult.allowed ? 
                      t({ en: 'Access Granted', ar: 'الوصول ممنوح' }) :
                      t({ en: 'Access Denied', ar: 'الوصول مرفوض' })}
                  </span>
                  {fieldResult.sensitive && (
                    <Badge variant="destructive" className="text-xs">Sensitive Field</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-700">{fieldResult.reason}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}