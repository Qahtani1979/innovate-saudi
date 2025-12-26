import { useState } from 'react';
import { useRoles } from '@/hooks/useRoles';
import { useUserMutations } from '@/hooks/useUserMutations';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Upload, Download, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BulkUserImport() {
  const { t } = useLanguage();
  const { data: roles = [] } = useRoles();
  const { inviteUsers } = useUserMutations();
  const { notify } = useNotificationSystem();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [validationResults, setValidationResults] = useState(null);

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

  const handleImport = async () => {
    if (!validationResults || validationResults.valid.length === 0) {
      toast.error(t({ en: 'No valid users to import', ar: 'لا يوجد مستخدمين صالحين للاستيراد' }));
      return;
    }

    const users = validationResults.valid;

    try {
      // 1. Send Invitations (Bulk)
      const invitationPayload = users.map(row => {
        const roleNames = row.role_names ? row.role_names.split(',').map(r => r.trim()) : [];
        const role = roles.find(r => r.name === roleNames[0]);
        return {
          email: row.email,
          full_name: row.full_name,
          role: role?.name || roleNames[0],
          organization_id: row.organization || null,
          metadata: {
            job_title: row.job_title,
            imported: true,
            role_names: row.role_names
          }
        };
      });

      await inviteUsers.mutateAsync(invitationPayload);

      // 2. Send Welcome Emails (if invitations were successful)
      await Promise.all(users.map(row =>
        notify({
          type: 'system_alert',
          entityType: 'user',
          entityId: 'bulk_import',
          recipientEmails: [row.email],
          title: 'Welcome to Innovate Saudi',
          message: `You have been invited to join the platform as ${row.role_names}.`,
          sendEmail: true,
          emailTemplate: 'auth.signup',
          emailVariables: {
            userName: row.full_name,
            assignedRoles: row.role_names,
            organization: row.organization || 'Innovate Saudi',
            loginUrl: `${window.location.origin}/login`
          }
        })
      ));

      toast.success(t({
        en: `Imported ${users.length} users successfully!`,
        ar: `تم استيراد ${users.length} مستخدم بنجاح!`
      }));

      setFile(null);
      setPreview([]);
      setValidationResults(null);

    } catch (error) {
      toast.error(t({
        en: `Failed to import users: ${error.message}`,
        ar: `فشل استيراد المستخدمين: ${error.message}`
      }));
    }
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
                  onClick={handleImport} // Changed to handleImport
                  disabled={!file || validationResults.errors.length > 0 || inviteUsers.isPending} // Adjusted disabled logic
                  className="w-full bg-indigo-600 flex items-center gap-2" // Added flex items-center gap-2
                >
                  {inviteUsers.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
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
