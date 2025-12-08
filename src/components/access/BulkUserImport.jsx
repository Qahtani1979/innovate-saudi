import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Upload, Download, Users, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BulkUserImport() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [validationResults, setValidationResults] = useState(null);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const downloadTemplate = () => {
    const template = [
      ['email', 'full_name', 'role_names', 'organization', 'job_title'],
      ['user1@example.com', 'John Doe', 'Municipality Director', 'Riyadh Municipality', 'Innovation Director'],
      ['user2@example.com', 'Jane Smith', 'Startup/Provider,Solution Provider', 'Tech Startup', 'CEO'],
    ];

    const csv = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast.success(t({ en: 'Template downloaded', ar: 'تم تنزيل القالب' }));
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i]?.trim() || '';
      });
      return obj;
    });
  };

  const validateUsers = (users) => {
    const errors = [];
    const valid = [];

    users.forEach((user, idx) => {
      const userErrors = [];

      // Email validation
      if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        userErrors.push('Invalid email');
      }

      // Name validation
      if (!user.full_name || user.full_name.length < 2) {
        userErrors.push('Name required');
      }

      // Role validation
      if (user.role_names) {
        const roleNames = user.role_names.split(',').map(r => r.trim());
        const invalidRoles = roleNames.filter(rn => !roles.find(r => r.name === rn));
        if (invalidRoles.length > 0) {
          userErrors.push(`Invalid roles: ${invalidRoles.join(', ')}`);
        }
      }

      if (userErrors.length > 0) {
        errors.push({ row: idx + 2, user, errors: userErrors });
      } else {
        valid.push(user);
      }
    });

    return { valid, errors };
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text);
      setPreview(parsed);

      const validation = validateUsers(parsed);
      setValidationResults(validation);
    };

    reader.readAsText(uploadedFile);
  };

  const importMutation = useMutation({
    mutationFn: async (users) => {
      const results = { success: [], failed: [] };

      for (const userData of users) {
        try {
          // Map role names to IDs
          const roleNames = userData.role_names ? userData.role_names.split(',').map(r => r.trim()) : [];
          const roleIds = roleNames
            .map(rn => roles.find(r => r.name === rn)?.id)
            .filter(Boolean);

          // Create user invitation
          const user = await base44.entities.User.create({
            email: userData.email,
            full_name: userData.full_name,
            assigned_roles: roleIds,
            organization: userData.organization,
            job_title: userData.job_title,
            onboarding_completed: false
          });

          // Send welcome email
          await base44.integrations.Core.SendEmail({
            to: userData.email,
            subject: 'Welcome to Saudi Innovates Platform',
            body: `Hello ${userData.full_name},\n\nYou have been invited to join the Saudi Innovates Platform.\n\nYour assigned roles: ${roleNames.join(', ')}\n\nPlease login to complete your profile.`
          });

          results.success.push(userData.email);
        } catch (error) {
          results.failed.push({ email: userData.email, error: error.message });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries(['users']);
      toast.success(t({ 
        en: `Imported ${results.success.length} users successfully!`, 
        ar: `تم استيراد ${results.success.length} مستخدم بنجاح!` 
      }));
      
      if (results.failed.length > 0) {
        toast.error(t({ 
          en: `${results.failed.length} users failed`, 
          ar: `فشل ${results.failed.length} مستخدم` 
        }));
      }

      setFile(null);
      setPreview([]);
      setValidationResults(null);
    }
  });

  const handleImport = () => {
    if (!validationResults || validationResults.valid.length === 0) {
      toast.error(t({ en: 'No valid users to import', ar: 'لا يوجد مستخدمين صالحين للاستيراد' }));
      return;
    }

    importMutation.mutate(validationResults.valid);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Bulk User Import', ar: 'استيراد جماعي للمستخدمين' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            {t({ en: 'Download Template', ar: 'تنزيل القالب' })}
          </Button>

          <label className="flex-1">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button className="w-full" variant={file ? 'default' : 'outline'} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : t({ en: 'Upload CSV', ar: 'رفع CSV' })}
              </span>
            </Button>
          </label>
        </div>

        {validationResults && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  {t({ en: 'Valid', ar: 'صالح' })}: {validationResults.valid.length}
                </AlertDescription>
              </Alert>

              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  {t({ en: 'Errors', ar: 'أخطاء' })}: {validationResults.errors.length}
                </AlertDescription>
              </Alert>
            </div>

            {validationResults.errors.length > 0 && (
              <div className="border rounded-lg p-4 bg-red-50 max-h-48 overflow-y-auto">
                <p className="text-sm font-medium text-red-900 mb-2">
                  {t({ en: 'Validation Errors:', ar: 'أخطاء التحقق:' })}
                </p>
                {validationResults.errors.map((error, idx) => (
                  <div key={idx} className="text-xs text-red-700 mb-1">
                    Row {error.row} ({error.user.email}): {error.errors.join(', ')}
                  </div>
                ))}
              </div>
            )}

            {validationResults.valid.length > 0 && (
              <>
                <div className="border rounded-lg p-4 bg-slate-50 max-h-64 overflow-y-auto">
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    {t({ en: 'Preview:', ar: 'معاينة:' })}
                  </p>
                  {validationResults.valid.slice(0, 10).map((user, idx) => (
                    <div key={idx} className="text-xs p-2 bg-white rounded mb-1 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{user.full_name}</span>
                        <span className="text-slate-600 ml-2">({user.email})</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.role_names || 'No role'}
                      </Badge>
                    </div>
                  ))}
                  {validationResults.valid.length > 10 && (
                    <p className="text-xs text-slate-500 mt-2">
                      + {validationResults.valid.length - 10} more...
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleImport} 
                  disabled={importMutation.isPending}
                  className="w-full bg-indigo-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t({ en: `Import ${validationResults.valid.length} Users`, ar: `استيراد ${validationResults.valid.length} مستخدم` })}
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}