import { useState } from 'react';
import { useRLSValidation } from '@/hooks/useRLSValidation';
import { validationTests as importedValidationTests } from '@/lib/validations/rlsTests';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Play, Database,
  User, Users, Building2, Zap
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RLSValidationDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    testResults,
    testing,
    runValidationTest,
    runAllValidationTests
  } = useRLSValidation();
  const [testUserEmail, setTestUserEmail] = useState('');

  // Imported from lib
  const validationTests = importedValidationTests;

  const runTest = (test) => runValidationTest(test.id, test.test);
  const runAllTests = () => runAllValidationTests(validationTests);

  const getResultIcon = (testId) => {
    const result = testResults[testId];
    if (!result) return <AlertTriangle className="h-5 w-5 text-slate-400" />;
    return result.pass
      ? <CheckCircle2 className="h-5 w-5 text-green-600" />
      : <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Ownership': return <User className="h-4 w-4" />;
      case 'Role Permission': return <Shield className="h-4 w-4" />;
      case 'Municipality Isolation': return <Building2 className="h-4 w-4" />;
      case 'Team Membership': return <Users className="h-4 w-4" />;
      case 'Delegation': return <Zap className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const categories = [...new Set(validationTests.map(t => t.category))];
  const passedTests = Object.values(testResults).filter(r => r.pass).length;
  const failedTests = Object.values(testResults).filter(r => !r.pass).length;
  const totalTests = validationTests.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 p-8 text-white">
        <Shield className="absolute top-4 right-4 h-32 w-32 opacity-10" />
        <h1 className="text-4xl font-bold mb-2">
          {t({ en: '🧪 RLS Validation Dashboard', ar: '🧪 لوحة التحقق من RLS' })}
        </h1>
        <p className="text-lg text-white/90">
          {t({
            en: 'Test Row-Level Security policies to ensure proper data access control',
            ar: 'اختبار سياسات أمان مستوى الصفوف لضمان التحكم الصحيح في الوصول للبيانات'
          })}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-sm">Current User: <strong>{user?.email}</strong></span>
          <Badge variant="secondary">Role: {user?.role}</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300">
          <CardContent className="p-6 text-center">
            <Database className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{totalTests}</p>
            <p className="text-sm text-slate-600">Total Tests</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-300">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{passedTests}</p>
            <p className="text-sm text-slate-600">Passed</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-300">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{failedTests}</p>
            <p className="text-sm text-slate-600">Failed</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-amber-300">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{totalTests - passedTests - failedTests}</p>
            <p className="text-sm text-slate-600">Not Run</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={runAllTests}
              disabled={testing}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {testing ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Test as user email (optional)"
                value={testUserEmail}
                onChange={(e) => setTestUserEmail(e.target.value)}
              />
              <Button variant="outline" disabled>Impersonate</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results by Category */}
      {categories.map(category => {
        const categoryTests = validationTests.filter(t => t.category === category);
        const categoryPassed = categoryTests.filter(t => testResults[t.id]?.pass).length;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                </div>
                <Badge variant="outline">
                  {categoryPassed}/{categoryTests.length} passed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryTests.map(test => {
                  const result = testResults[test.id];
                  return (
                    <div key={test.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
                      <div className="flex-shrink-0 mt-1">
                        {getResultIcon(test.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">{test.description}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-white px-2 py-1 rounded border">{test.entity}</code>
                              {test.requiresRole && (
                                <Badge variant="outline" className="text-xs">Role: {test.requiresRole}</Badge>
                              )}
                              {test.requiresPermission && (
                                <Badge variant="outline" className="text-xs">Permission: {test.requiresPermission}</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTest(test)}
                            disabled={testing}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                        {result && (
                          <div className={`text-xs p-2 rounded ${result.pass ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {result.message}
                            <span className="text-slate-500 ml-2">
                              • {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Implementation Status */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">
            {t({ en: 'RLS Implementation Status', ar: 'حالة تنفيذ RLS' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold mb-2">Pre-Deployment (Current)</h4>
              <p className="text-sm text-slate-600 mb-3">
                RLS policies not yet deployed. This dashboard shows expected test results once deployed.
              </p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>✓ All SQL scripts prepared</li>
                <li>✓ RBAC permissions mapped to policies</li>
                <li>✓ Test suite ready for validation</li>
                <li>⏳ Awaiting platform team deployment</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-300">
              <h4 className="font-semibold text-amber-900 mb-2">Post-Deployment Checklist</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>□ Run all validation tests</li>
                <li>□ Verify municipality isolation works</li>
                <li>□ Test with different user roles</li>
                <li>□ Confirm delegation permissions work</li>
                <li>□ Monitor query performance</li>
                <li>□ Test team-based access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RLSValidationDashboard, {
  requiredPermissions: ['platform_admin', 'security_manage']
});
