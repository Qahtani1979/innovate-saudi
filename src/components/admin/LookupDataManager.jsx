import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Building2, Briefcase, FileText, Shield } from 'lucide-react';
import { StatCard } from './lookup/shared/LookupTableStyles';
import DepartmentsTab from './lookup/DepartmentsTab';
import SpecializationsTab from './lookup/SpecializationsTab';
import CustomEntriesTab from './lookup/CustomEntriesTab';
import AutoApprovalRulesTab from './lookup/AutoApprovalRulesTab';

export default function LookupDataManager() {
  const { isRTL, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('departments');

  // Fetch counts for stats
  const { data: departmentsCount = 0 } = useQuery({
    queryKey: ['lookup-departments-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('lookup_departments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: specializationsCount = 0 } = useQuery({
    queryKey: ['lookup-specializations-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('lookup_specializations')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: pendingEntriesCount = 0 } = useQuery({
    queryKey: ['custom-entries-pending-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('custom_entries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: rulesCount = 0 } = useQuery({
    queryKey: ['auto-approval-rules-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('auto_approval_rules')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Building2}
          title={t({ en: 'Departments', ar: 'الأقسام' })}
          value={departmentsCount}
          colorClass="from-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard 
          icon={Briefcase}
          title={t({ en: 'Specializations', ar: 'التخصصات' })}
          value={specializationsCount}
          colorClass="from-teal-500/10 text-teal-600 dark:text-teal-400"
        />
        <StatCard 
          icon={FileText}
          title={t({ en: 'Pending Reviews', ar: 'المراجعات المعلقة' })}
          value={pendingEntriesCount}
          colorClass="from-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard 
          icon={Shield}
          title={t({ en: 'Auto-Approval Rules', ar: 'قواعد الموافقة التلقائية' })}
          value={rulesCount}
          colorClass="from-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">
            <Building2 className="h-4 w-4 mr-2" />
            {t({ en: 'Departments', ar: 'الأقسام' })}
          </TabsTrigger>
          <TabsTrigger value="specializations">
            <Briefcase className="h-4 w-4 mr-2" />
            {t({ en: 'Specializations', ar: 'التخصصات' })}
          </TabsTrigger>
          <TabsTrigger value="custom" className="relative">
            <FileText className="h-4 w-4 mr-2" />
            {t({ en: 'Custom Entries', ar: 'الإدخالات المخصصة' })}
            {pendingEntriesCount > 0 && (
              <Badge className="ml-2 bg-amber-500">{pendingEntriesCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Shield className="h-4 w-4 mr-2" />
            {t({ en: 'Auto-Approval', ar: 'الموافقة التلقائية' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="specializations">
          <SpecializationsTab />
        </TabsContent>

        <TabsContent value="custom">
          <CustomEntriesTab />
        </TabsContent>

        <TabsContent value="rules">
          <AutoApprovalRulesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
