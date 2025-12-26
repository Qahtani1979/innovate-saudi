import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { 
  CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronRight, Clock,
  Database, FileText, Workflow, Users, Brain, Network, Target, Shield, TrendingUp, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function CoverageReportsAudit() {
  const { t, isRTL } = useLanguage();
  const [expandedReport, setExpandedReport] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('all');

  const standardSections = [
    { id: 1, name: 'Data Model & Entity Schema', icon: Database, required: true },
    { id: 2, name: 'Pages & Screens', icon: FileText, required: true },
    { id: 3, name: 'Workflows & Lifecycles', icon: Workflow, required: true },
    { id: 4, name: 'User Journeys (X Personas)', icon: Users, required: true },
    { id: 5, name: 'AI & Machine Learning Features', icon: Brain, required: true },
    { id: 6, name: 'Conversion Paths & Routing', icon: Network, required: true },
    { id: 7, name: 'Comparison Tables', icon: Target, required: false },
    { id: 8, name: 'RBAC & Access Control', icon: Shield, required: true },
    { id: 9, name: 'Integration Points', icon: Network, required: true }
  ];

  // TOTAL: 37 COVERAGE REPORTS (19 module + 18 system)
  const reportsData = [
    // === MODULE-SPECIFIC REPORTS (19) ===
    { name: 'ChallengesCoverageReport', completeness: 100, status: '✅ GOLD', sections: { 1:{status:'complete',score:100,notes:'60+ fields',actions:[]}, 2:{status:'complete',score:100,notes:'8 pages',actions:[]}, 3:{status:'complete',score:100,notes:'8 workflows',actions:[]}, 4:{status:'complete',score:100,notes:'7 personas',actions:[]}, 5:{status:'complete',score:100,notes:'17 AI features',actions:[]}, 6:{status:'complete',score:100,notes:'7 conversions',actions:[]}, 7:{status:'complete',score:100,notes:'Full comparisons',actions:[]}, 8:{status:'complete',score:100,notes:'6 permissions',actions:[]}, 9:{status:'complete',score:100,notes:'8 integrations',actions:[]} }, priority: 'reference', category: 'module' },
    { name: 'IdeasCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 1:{status:'complete',score:100,notes:'Full schema',actions:[]}, 2:{status:'complete',score:100,notes:'10 pages',actions:[]}, 3:{status:'complete',score:100,notes:'7 workflows',actions:[]}, 4:{status:'complete',score:100,notes:'8 personas',actions:[]}, 5:{status:'complete',score:100,notes:'11 AI features',actions:[]}, 6:{status:'complete',score:100,notes:'6 conversions',actions:[]}, 7:{status:'complete',score:100,notes:'Comparisons',actions:[]}, 8:{status:'complete',score:100,notes:'13 permissions',actions:[]}, 9:{status:'complete',score:100,notes:'6 integrations',actions:[]} }, priority: 'reference', category: 'module' },
    { name: 'CitizenEngagementCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 1:{status:'complete',score:100,notes:'3 entities',actions:[]}, 2:{status:'complete',score:100,notes:'8 pages',actions:[]}, 3:{status:'complete',score:100,notes:'6 workflows',actions:[]}, 4:{status:'complete',score:100,notes:'8 personas',actions:[]}, 5:{status:'complete',score:100,notes:'11 AI features',actions:[]}, 6:{status:'complete',score:100,notes:'Bidirectional paths',actions:[]}, 7:{status:'complete',score:100,notes:'Comparisons',actions:[]}, 8:{status:'complete',score:100,notes:'13 permissions',actions:[]}, 9:{status:'complete',score:100,notes:'Integrations',actions:[]} }, priority: 'reference', category: 'module' },
    { name: 'ExpertCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 1:{status:'complete',score:100,notes:'4 entities',actions:[]}, 2:{status:'complete',score:100,notes:'11 pages',actions:[]}, 3:{status:'complete',score:100,notes:'4 workflows',actions:[]}, 4:{status:'complete',score:100,notes:'6 personas',actions:[]}, 5:{status:'complete',score:100,notes:'4 AI features',actions:[]}, 6:{status:'complete',score:100,notes:'4 conversions',actions:[]}, 7:{status:'complete',score:100,notes:'Comparisons',actions:[]}, 8:{status:'complete',score:100,notes:'14 permissions',actions:[]}, 9:{status:'complete',score:100,notes:'7 integrations',actions:[]} }, priority: 'reference', category: 'module' },
    { name: 'SolutionsCoverageReport', completeness: 100, status: '✅ PLATINUM', sections: { 1:{status:'complete',score:100,notes:'50+ fields',actions:[]}, 2:{status:'complete',score:100,notes:'10 pages',actions:[]}, 3:{status:'complete',score:100,notes:'7 workflows',actions:[]}, 4:{status:'complete',score:100,notes:'9 personas',actions:[]}, 5:{status:'complete',score:100,notes:'11 AI features',actions:[]}, 6:{status:'complete',score:100,notes:'8 paths',actions:[]}, 7:{status:'complete',score:100,notes:'Comparisons',actions:[]}, 8:{status:'complete',score:100,notes:'Complete RBAC',actions:[]}, 9:{status:'complete',score:100,notes:'10 integrations',actions:[]} }, priority: 'reference', category: 'module' },
    { name: 'PilotsCoverageReport', completeness: 100, status: '✅ PLATINUM', sections: { 1:{status:'complete',score:100,notes:'70+ fields',actions:[]}, 2:{status:'complete',score:100,notes:'13 pages',actions:[]}, 3:{status:'complete',score:100,notes:'9 workflows',actions:[]}, 4:{status:'complete',score:100,notes:'10 personas',actions:[]}, 5:{status:'complete',score:100,notes:'12 AI features',actions:[]}, 6:{status:'complete',score:100,notes:'11 paths',actions:[]}, 7:{status:'complete',score:100,notes:'3 tables',actions:[]}, 8:{status:'complete',score:100,notes:'5 roles',actions:[]}, 9:{status:'complete',score:100,notes:'11 integrations',actions:[]} }, priority: 'reference', category: 'module' },
    { name: 'ProgramsCoverageReport', completeness: 100, status: '✅ PLATINUM', sections: { 1:{status:'complete',score:100,notes:'50+ fields',actions:[]}, 2:{status:'complete',score:100,notes:'9 pages',actions:[]}, 3:{status:'complete',score:100,notes:'7 workflows',actions:[]}, 4:{status:'complete',score:100,notes:'8 personas',actions:[]}, 5:{status:'complete',score:100,notes:'12 AI features',actions:[]}, 6:{status:'complete',score:100,notes:'13 paths',actions:[]}, 7:{status:'complete',score:100,notes:'3 tables',actions:[]}, 8:{status:'complete',score:100,notes:'5 roles',actions:[]}, 9:{status:'complete',score:100,notes:'11 integrations',actions:[]} }, priority: 'reference', category: 'module' },
    { name: 'RDCoverageReport', completeness: 95, status: '✅ NEAR COMPLETE', sections: { 1:{status:'complete',score:100,notes:'Complete',actions:[]}, 2:{status:'complete',score:100,notes:'All pages',actions:[]}, 3:{status:'complete',score:100,notes:'Full workflows',actions:[]}, 4:{status:'complete',score:100,notes:'Personas',actions:[]}, 5:{status:'complete',score:100,notes:'AI documented',actions:[]}, 6:{status:'complete',score:100,notes:'Conversions',actions:[]}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add R&D vs Pilot','Add R&D vs Program','Add Research vs Commercial']}, 8:{status:'complete',score:100,notes:'RBAC',actions:[]}, 9:{status:'complete',score:100,notes:'Integrations',actions:[]} }, priority: 'high', category: 'module' },
    { name: 'SandboxesCoverageReport', completeness: 65, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:90,notes:'Entities',actions:['Add field categories']}, 2:{status:'complete',score:90,notes:'Pages',actions:['Add features per page']}, 3:{status:'partial',score:40,notes:'Basic',actions:['Add 6-8 detailed workflows','Add stages','Add automation']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 7 personas','Document 10-15 step journeys']}, 5:{status:'partial',score:50,notes:'AI mentioned',actions:['Expand to 8-10 features','Add performance']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 4-5 conversion paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 3 comparison tables']}, 8:{status:'partial',score:50,notes:'Basic',actions:['Add 8-10 permissions','Add roles']}, 9:{status:'missing',score:0,notes:'NO integrations',actions:['Document 12+ integration points']} }, priority: 'high', category: 'module' },
    { name: 'LivingLabsCoverageReport', completeness: 65, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:90,notes:'Entities',actions:['Add categories']}, 2:{status:'complete',score:85,notes:'Pages',actions:['Add features']}, 3:{status:'partial',score:40,notes:'Basic',actions:['Add 7-8 workflows','Add stages']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 7 personas','Document journeys']}, 5:{status:'partial',score:50,notes:'AI',actions:['Expand features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 4 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 3 tables']}, 8:{status:'partial',score:50,notes:'Basic',actions:['Add permissions']}, 9:{status:'missing',score:0,notes:'NO integrations',actions:['Document 14+ integrations']} }, priority: 'high', category: 'module' },
    { name: 'PolicyRecommendationCoverageReport', completeness: 70, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:95,notes:'Entity',actions:['Add population']}, 2:{status:'complete',score:90,notes:'Pages',actions:['Add AI per page']}, 3:{status:'complete',score:95,notes:'4-gate workflow',actions:[]}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 6 personas','Document journeys']}, 5:{status:'complete',score:85,notes:'AI',actions:['Add 2-3 features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 4 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 3 tables']}, 8:{status:'partial',score:60,notes:'Basic',actions:['Add 10+ permissions']}, 9:{status:'missing',score:0,notes:'NO integrations',actions:['Document 10+ integrations']} }, priority: 'high', category: 'module' },
    { name: 'MatchmakerCoverageReport', completeness: 60, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:85,notes:'Entity',actions:['Add categories']}, 2:{status:'partial',score:60,notes:'Pages',actions:['Add features']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Create 6-7 workflows with stages']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 6 personas','Document journeys']}, 5:{status:'partial',score:30,notes:'AI barely',actions:['Document 8+ AI features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 3 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 2 tables']}, 8:{status:'missing',score:0,notes:'NO RBAC',actions:['Add 10+ permissions','Add roles']}, 9:{status:'missing',score:0,notes:'NO integrations',actions:['Document 10+ integrations']} }, priority: 'critical', category: 'module' },
    { name: 'ScalingCoverageReport', completeness: 60, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:85,notes:'Entity',actions:['Add categories']}, 2:{status:'partial',score:60,notes:'Pages',actions:['Add features']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Create 6 workflows with stages']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 6 personas','Document journeys']}, 5:{status:'partial',score:30,notes:'AI',actions:['Document 7+ features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 3 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 3 tables']}, 8:{status:'missing',score:0,notes:'NO RBAC',actions:['Add 8+ permissions']}, 9:{status:'missing',score:0,notes:'NO integrations',actions:['Document 12+ integrations']} }, priority: 'critical', category: 'module' },
    { name: 'OrganizationsCoverageReport', completeness: 55, status: '⚠️ SIMPLE', sections: { 1:{status:'complete',score:75,notes:'Entity',actions:['Expand detail']}, 2:{status:'complete',score:70,notes:'Pages',actions:['Add features']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Create 4 workflows']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 5 personas']}, 5:{status:'partial',score:45,notes:'AI',actions:['Expand detail']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 3 paths']}, 7:{status:'partial',score:30,notes:'Basic',actions:['Expand tables']}, 8:{status:'partial',score:50,notes:'Basic',actions:['Add permissions']}, 9:{status:'partial',score:40,notes:'Minimal',actions:['Document 12+ integrations']} }, priority: 'high', category: 'module' },
    { name: 'AcademiaCoverageReport', completeness: 50, status: '🔴 MINIMAL', sections: { 1:{status:'partial',score:50,notes:'4 entities',actions:['Expand schemas','Add categories']}, 2:{status:'partial',score:60,notes:'4 pages',actions:['Expand to 8+','Add features']}, 3:{status:'partial',score:45,notes:'Basic',actions:['Expand to 6+ workflows']}, 4:{status:'complete',score:75,notes:'8 personas',actions:['Fix gaps']}, 5:{status:'partial',score:40,notes:'10 AI',actions:['Fix integration']}, 6:{status:'complete',score:70,notes:'Paths',actions:['Fix partial']}, 7:{status:'complete',score:80,notes:'4 tables',actions:[]}, 8:{status:'missing',score:0,notes:'NO RBAC',actions:['Add 10+ permissions']}, 9:{status:'complete',score:75,notes:'12 integrations',actions:['Add detail']} }, priority: 'critical', category: 'module' },
    { name: 'StartupCoverageReport', completeness: 50, status: '🔴 MINIMAL', sections: { 1:{status:'partial',score:40,notes:'Entity',actions:['Full expansion','Add all fields']}, 2:{status:'partial',score:45,notes:'Some pages',actions:['Document 8+ pages']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Create 5+ workflows']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 6 personas']}, 5:{status:'partial',score:35,notes:'AI',actions:['Document 10+ features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 4 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 3 tables']}, 8:{status:'missing',score:0,notes:'NO RBAC',actions:['Add 10+ permissions']}, 9:{status:'partial',score:40,notes:'Minimal',actions:['Document 15+ integrations']} }, priority: 'critical', category: 'module' },
    { name: 'TaxonomyCoverageReport', completeness: 45, status: '🔴 MINIMAL', sections: { 1:{status:'partial',score:40,notes:'Basic',actions:['Full schemas for all 4 entities']}, 2:{status:'partial',score:35,notes:'Pages',actions:['Document 5+ pages']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Create 3 workflows']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 4 personas']}, 5:{status:'partial',score:30,notes:'AI',actions:['Document 6+ features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 3 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 2 tables']}, 8:{status:'missing',score:0,notes:'NO RBAC',actions:['Add 8+ permissions']}, 9:{status:'partial',score:35,notes:'Minimal',actions:['Document 20+ integrations']} }, priority: 'critical', category: 'module' },
    { name: 'GeographyCoverageReport', completeness: 45, status: '🔴 MINIMAL', sections: { 1:{status:'partial',score:40,notes:'Basic',actions:['Full schemas']}, 2:{status:'partial',score:35,notes:'Pages',actions:['Document 6+ pages']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Create 3 workflows']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 5 personas']}, 5:{status:'partial',score:30,notes:'AI',actions:['Document 6+ features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 3 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 3 tables']}, 8:{status:'missing',score:0,notes:'NO RBAC',actions:['Add 10+ permissions']}, 9:{status:'partial',score:35,notes:'Minimal',actions:['Document 18+ integrations']} }, priority: 'critical', category: 'module' },
    { name: 'StrategicPlanningCoverageReport', completeness: 40, status: '🔴 MINIMAL', sections: { 1:{status:'partial',score:35,notes:'Barely',actions:['Full entity schema']}, 2:{status:'partial',score:30,notes:'Pages',actions:['Document 8+ pages']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Create 5 workflows']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 6 personas']}, 5:{status:'partial',score:25,notes:'AI',actions:['Document 8+ features']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Document 4 paths']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add 3 tables']}, 8:{status:'missing',score:0,notes:'NO RBAC',actions:['Add 10+ permissions']}, 9:{status:'partial',score:30,notes:'Minimal',actions:['Document 25+ integrations']} }, priority: 'critical', category: 'module' },
    // === CROSS-CUTTING/SYSTEM REPORTS (18) ===
    { name: 'RBACCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 1:{status:'complete',score:100,notes:'RBAC model',actions:[]}, 2:{status:'complete',score:100,notes:'All pages',actions:[]}, 3:{status:'complete',score:100,notes:'Workflows',actions:[]}, 4:{status:'complete',score:100,notes:'Journeys',actions:[]}, 5:{status:'complete',score:100,notes:'AI role assignment',actions:[]}, 6:{status:'complete',score:100,notes:'Conversions',actions:[]}, 7:{status:'complete',score:100,notes:'Role comparisons',actions:[]}, 8:{status:'complete',score:100,notes:'Core RBAC',actions:[]}, 9:{status:'complete',score:100,notes:'Integrations',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'MenuRBACCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 1:{status:'complete',score:100,notes:'Menu permissions',actions:[]}, 2:{status:'complete',score:100,notes:'Menu items',actions:[]}, 8:{status:'complete',score:100,notes:'Access rules',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'WorkflowApprovalSystemCoverage', completeness: 100, status: '✅ COMPLETE', sections: { 1:{status:'complete',score:100,notes:'Approval entities',actions:[]}, 2:{status:'complete',score:100,notes:'Pages',actions:[]}, 3:{status:'complete',score:100,notes:'All workflows',actions:[]}, 4:{status:'complete',score:100,notes:'Journeys',actions:[]}, 8:{status:'complete',score:100,notes:'Approval RBAC',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'GateMaturityMatrix', completeness: 100, status: '✅ COMPLETE', sections: { 3:{status:'complete',score:100,notes:'All gates',actions:[]}, 4:{status:'complete',score:100,notes:'Gate journeys',actions:[]}, 8:{status:'complete',score:100,notes:'Gate permissions',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'StagesCriteriaCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 3:{status:'complete',score:100,notes:'All stages',actions:[]}, 4:{status:'complete',score:100,notes:'Stage journeys',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'CreateWizardsCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 2:{status:'complete',score:100,notes:'All wizards',actions:[]}, 3:{status:'complete',score:100,notes:'Creation workflows',actions:[]}, 4:{status:'complete',score:100,notes:'Creator journeys',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'EditPagesCoverageReport', completeness: 90, status: '✅ NEAR COMPLETE', sections: { 2:{status:'complete',score:100,notes:'All edit pages',actions:[]}, 4:{status:'complete',score:90,notes:'Editor journeys',actions:[]}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Add edit vs create workflow comparison']}, 8:{status:'complete',score:100,notes:'Edit permissions',actions:[]} }, priority: 'high', category: 'system' },
    { name: 'DetailPagesCoverageReport', completeness: 90, status: '✅ NEAR COMPLETE', sections: { 2:{status:'complete',score:100,notes:'All detail pages',actions:[]}, 3:{status:'partial',score:60,notes:'Workflow integration',actions:['Add workflow tab integration for all entities']}, 4:{status:'complete',score:90,notes:'Viewer journeys',actions:[]}, 8:{status:'complete',score:100,notes:'View permissions',actions:[]} }, priority: 'high', category: 'system' },
    { name: 'ConversionsCoverageReport', completeness: 95, status: '✅ NEAR COMPLETE', sections: { 3:{status:'complete',score:100,notes:'Conversion workflows',actions:[]}, 6:{status:'complete',score:95,notes:'All paths',actions:['Add automation for 3 remaining conversions']} }, priority: 'high', category: 'system' },
    { name: 'PortalDesignCoverage', completeness: 90, status: '✅ NEAR COMPLETE', sections: { 2:{status:'complete',score:100,notes:'All portals',actions:[]}, 4:{status:'complete',score:90,notes:'Portal journeys',actions:[]}, 7:{status:'partial',score:60,notes:'Comparisons',actions:['Add Executive vs Admin vs Operator comparison']}, 8:{status:'complete',score:100,notes:'Portal RBAC',actions:[]} }, priority: 'high', category: 'system' },
    { name: 'MenuCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 2:{status:'complete',score:100,notes:'All menu items',actions:[]}, 8:{status:'complete',score:100,notes:'Menu permissions',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'PlatformCoverageAudit', completeness: 95, status: '✅ NEAR COMPLETE', sections: { 1:{status:'complete',score:100,notes:'Platform entities',actions:[]}, 2:{status:'complete',score:100,notes:'All pages',actions:[]}, 5:{status:'complete',score:90,notes:'Platform AI',actions:['Update with latest AI features']}, 8:{status:'complete',score:100,notes:'Platform RBAC',actions:[]} }, priority: 'high', category: 'system' },
    { name: 'BilingualCoverageReports', completeness: 100, status: '✅ COMPLETE', sections: { 2:{status:'complete',score:100,notes:'All bilingual pages',actions:[]}, 4:{status:'complete',score:100,notes:'RTL journeys',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'InnovationProposalsCoverageReport', completeness: 100, status: '✅ COMPLETE', sections: { 1:{status:'complete',score:100,notes:'Proposal entity',actions:[]}, 2:{status:'complete',score:100,notes:'All pages',actions:[]}, 3:{status:'complete',score:100,notes:'Workflows',actions:[]}, 4:{status:'complete',score:100,notes:'Journeys',actions:[]}, 5:{status:'complete',score:100,notes:'AI features',actions:[]}, 6:{status:'complete',score:100,notes:'Conversions',actions:[]}, 8:{status:'complete',score:100,notes:'RBAC',actions:[]}, 9:{status:'complete',score:100,notes:'Integrations',actions:[]} }, priority: 'reference', category: 'system' },
    { name: 'MIICoverageReport', completeness: 70, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:90,notes:'MII entities',actions:['Add dimension breakdown']}, 2:{status:'complete',score:85,notes:'MII pages',actions:['Add features']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Add MII calculation workflow','Add improvement workflow']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 4 personas']}, 5:{status:'complete',score:80,notes:'AI',actions:['Add implementation']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['MII → Challenge','MII → Program']}, 7:{status:'missing',score:0,notes:'NO comparisons',actions:['Municipality comparison tables']} }, priority: 'high', category: 'system' },
    { name: 'PartnershipCoverageReport', completeness: 65, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:85,notes:'Partnership entity',actions:['Expand']}, 2:{status:'complete',score:75,notes:'Pages',actions:['Add features']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Add partnership formation','Add performance review']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 5 personas']}, 5:{status:'partial',score:60,notes:'AI',actions:['Add implementation']}, 6:{status:'missing',score:0,notes:'NO conversions',actions:['Org → Partnership','Pilot → Partnership']}, 8:{status:'partial',score:50,notes:'Basic',actions:['Add partnership permissions']} }, priority: 'high', category: 'system' },
    { name: 'CommunicationsCoverageReport', completeness: 60, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:80,notes:'Communication entities',actions:['Expand']}, 2:{status:'complete',score:70,notes:'Pages',actions:['Add features']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Add notification workflow','Add messaging workflow']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 4 personas']}, 5:{status:'partial',score:50,notes:'AI',actions:['Document AI routing']}, 8:{status:'partial',score:50,notes:'Basic',actions:['Add communication RBAC']} }, priority: 'high', category: 'system' },
    { name: 'DataManagementCoverageReport', completeness: 65, status: '⚠️ PARTIAL', sections: { 1:{status:'complete',score:85,notes:'Data entities',actions:['Expand']}, 2:{status:'complete',score:75,notes:'Pages',actions:['Add features']}, 3:{status:'missing',score:0,notes:'NO workflows',actions:['Add data quality workflow']}, 4:{status:'missing',score:0,notes:'NO journeys',actions:['Create 4 personas']}, 5:{status:'partial',score:60,notes:'AI',actions:['Add implementation']}, 8:{status:'complete',score:85,notes:'Data RBAC',actions:['Expand field security']} }, priority: 'high', category: 'system' }
  ];

  const completionStats = {
    total: reportsData.length,
    complete: reportsData.filter(r => r.completeness >= 95).length,
    partial: reportsData.filter(r => r.completeness >= 60 && r.completeness < 95).length,
    minimal: reportsData.filter(r => r.completeness < 60).length,
    avgCompleteness: Math.round(reportsData.reduce((sum, r) => sum + r.completeness, 0) / reportsData.length),
    reference: reportsData.filter(r => r.priority === 'reference').length,
    moduleReports: reportsData.filter(r => r.category === 'module').length,
    systemReports: reportsData.filter(r => r.category === 'system').length
  };

  const actionsByPriority = {
    critical: reportsData.filter(r => r.priority === 'critical'),
    high: reportsData.filter(r => r.priority === 'high'),
    reference: reportsData.filter(r => r.priority === 'reference')
  };

  const totalActions = reportsData.reduce((sum, report) => {
    return sum + Object.values(report.sections).reduce((sectionSum, section) => 
      sectionSum + (section.actions?.length || 0), 0);
  }, 0);

  const filteredReports = selectedPriority === 'all' 
    ? reportsData 
    : reportsData.filter(r => r.priority === selectedPriority);

  // Update history data
  const reportUpdates = {
    critical: [
      { name: 'GateMaturityMatrix', status: 'complete', updates: 'Updated PolicyRecommendation gates to 95% maturity with self-check + reviewer AI', date: '2025-01-15' },
      { name: 'ApprovalSystemImplementationPlan', status: 'complete', updates: 'Marked Phase 2 complete, updated policy deliverables status', date: '2025-01-15' },
      { name: 'StagesCriteriaCoverageReport', status: 'complete', updates: 'Added PolicyRecommendation 4-gate workflow with full criteria coverage', date: '2025-01-14' },
      { name: 'ChallengesCoverageReport', status: 'complete', updates: 'Updated Challenge→Policy workflow to reflect full approval system', date: '2025-01-14' },
      { name: 'PilotsCoverageReport', status: 'complete', updates: 'Upgraded to PLATINUM - added citizen journeys, conversion workflows, comparison tables', date: '2025-01-16' },
      { name: 'SolutionsCoverageReport', status: 'complete', updates: 'Upgraded to PLATINUM - added all 9 sections to 100%', date: '2025-01-16' },
      { name: 'ProgramsCoverageReport', status: 'complete', updates: 'Upgraded to PLATINUM - completed all missing sections', date: '2025-01-16' },
      { name: 'EntitiesWorkflowTracker', status: 'complete', updates: 'Added PolicyRecommendation entity with 7 workflows, 100% coverage', date: '2025-01-14' },
      { name: 'ValidationDashboard', status: 'complete', updates: 'Updated journey coverage scores, added Policy journey (100%)', date: '2025-01-14' }
    ],
    recent: [
      { name: 'ComprehensiveReportAudit', status: 'updated', updates: 'Expanded from 19 to 37 reports with full system coverage', date: '2025-01-17' },
      { name: 'CoverageReportStandardization', status: 'updated', updates: 'Updated to track all 37 reports (19 module + 18 system)', date: '2025-01-17' }
    ]
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t({ en: '📊 Coverage Reports Master Audit - All 37 Reports', ar: '📊 التدقيق الرئيسي لتقارير التغطية - جميع التقارير' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: `Comprehensive audit: ${completionStats.moduleReports} module reports + ${completionStats.systemReports} system reports = ${completionStats.total} total | ${totalActions} actions tracked`, ar: `تدقيق شامل: ${completionStats.total} تقرير إجمالي` })}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t({ en: 'Overview & Stats', ar: 'نظرة عامة' })}
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Target className="h-4 w-4 mr-2" />
            {t({ en: 'Detailed Audits', ar: 'التدقيق المفصل' })}
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            {t({ en: 'Update History', ar: 'سجل التحديثات' })}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & STATS */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-slate-50 to-white">
              <CardContent className="pt-6 text-center">
                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">{completionStats.total}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Total Reports', ar: 'إجمالي' })}</p>
                <p className="text-xs text-slate-500 mt-1">{completionStats.moduleReports}M + {completionStats.systemReports}S</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-600">{completionStats.complete}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Complete (95%+)', ar: 'مكتمل' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-amber-600">{completionStats.partial}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Partial (60-94%)', ar: 'جزئي' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-white">
              <CardContent className="pt-6 text-center">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-red-600">{completionStats.minimal}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Minimal (<60%)', ar: 'أدنى' })}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">{completionStats.avgCompleteness}%</p>
                <p className="text-xs text-slate-600">{t({ en: 'Avg Complete', ar: 'متوسط' })}</p>
              </CardContent>
            </Card>
          </div>

          {/* Standard Sections Reference */}
          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {t({ en: 'Standard Sections (9) - Gold Standard Template', ar: 'الأقسام المعيارية (9)' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {standardSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div key={section.id} className={`p-4 border-2 rounded-lg ${section.required ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-slate-700" />
                        <Badge className={section.required ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}>
                          {section.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">{section.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section Coverage Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Section Coverage Matrix - All 37 Reports', ar: 'مصفوفة تغطية الأقسام' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b-2 bg-slate-50">
                      <th className="text-left py-2 px-2 sticky left-0 bg-slate-50">Report</th>
                      {standardSections.map(sec => (
                        <th key={sec.id} className="text-center py-2 px-1">{sec.id}</th>
                      ))}
                      <th className="text-center py-2 px-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.map((report) => (
                      <tr key={report.name} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-2 font-medium text-xs sticky left-0 bg-white">
                          {report.name}
                          <Badge className="ml-1 text-xs" variant="outline">{report.category === 'module' ? 'M' : 'S'}</Badge>
                        </td>
                        {standardSections.map(sec => {
                          const section = report.sections[sec.id];
                          return (
                            <td key={sec.id} className="text-center py-2 px-1">
                              {section?.status === 'complete' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                              ) : section?.status === 'partial' ? (
                                <AlertCircle className="h-4 w-4 text-amber-600 mx-auto" />
                              ) : sec.required ? (
                                <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center py-2 px-2 font-bold">{report.completeness}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded text-xs">
                <p className="text-blue-900">
                  <strong>Legend:</strong> M=Module, S=System | 
                  <CheckCircle2 className="h-3 w-3 text-green-600 inline mx-1" /> = Complete | 
                  <AlertCircle className="h-3 w-3 text-amber-600 inline mx-1" /> = Partial | 
                  <XCircle className="h-3 w-3 text-red-600 inline mx-1" /> = Missing Required
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Plan */}
          <Card className="border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                {t({ en: 'Standardization Status - All 37 Reports', ar: 'حالة التوحيد' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-100 rounded-lg border-2 border-green-400">
                <p className="font-bold text-green-900 mb-2">✅ COMPLETE ({completionStats.complete}/{completionStats.total} - {Math.round(completionStats.complete/completionStats.total*100)}%)</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-green-800">
                  <div>
                    <p className="font-semibold mb-1">Module Reports (7):</p>
                    <ul className="space-y-0.5">
                      <li>✅ Challenges (Gold)</li>
                      <li>✅ Ideas</li>
                      <li>✅ Citizen Engagement</li>
                      <li>✅ Expert System</li>
                      <li>✅ Solutions (Platinum)</li>
                      <li>✅ Pilots (Platinum)</li>
                      <li>✅ Programs (Platinum)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">System Reports (14):</p>
                    <ul className="space-y-0.5">
                      <li>✅ RBAC Coverage</li>
                      <li>✅ Menu RBAC</li>
                      <li>✅ Workflow & Approval</li>
                      <li>✅ Gate Maturity</li>
                      <li>✅ Stages & Criteria</li>
                      <li>✅ Create Wizards</li>
                      <li>✅ Menu Coverage</li>
                      <li>✅ Bilingual Coverage</li>
                      <li>✅ Innovation Proposals</li>
                      <li>+ 5 more near-complete (90-95%)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-400">
                <p className="font-bold text-amber-900 mb-2">⚠️ PARTIAL ({completionStats.partial}/{completionStats.total} - {Math.round(completionStats.partial/completionStats.total*100)}%)</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>⚠️ Sandboxes (65%) - Add workflows, journeys, RBAC</li>
                  <li>⚠️ Living Labs (65%) - Add workflows, journeys, RBAC</li>
                  <li>⚠️ Policy (70%) - Add journeys, conversions</li>
                  <li>⚠️ Organizations (55%) - Expand from simple</li>
                  <li>⚠️ MII (70%) - Add workflows, journeys</li>
                  <li>⚠️ Partnerships (65%) - Add workflows</li>
                  <li>⚠️ Communications (60%) - Add workflows</li>
                  <li>⚠️ Data Management (65%) - Add workflows</li>
                </ul>
              </div>

              <div className="p-4 bg-red-100 rounded-lg border-2 border-red-400">
                <p className="font-bold text-red-900 mb-2">🔴 MINIMAL ({completionStats.minimal}/{completionStats.total} - {Math.round(completionStats.minimal/completionStats.total*100)}%)</p>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>🔴 Matchmaker (60%) - Build workflows, journeys, RBAC</li>
                  <li>🔴 Scaling (60%) - Build workflows, journeys, RBAC</li>
                  <li>🔴 Academia (50%) - Build missing sections</li>
                  <li>🔴 Startup (50%) - Build from scratch</li>
                  <li>🔴 Taxonomy (45%) - Build from scratch</li>
                  <li>🔴 Geography (45%) - Build from scratch</li>
                  <li>🔴 Strategic Planning (40%) - Build from scratch</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-100 rounded-lg">
                <p className="font-bold text-purple-900 mb-2">📊 Estimated Effort (All 37 Reports)</p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• <strong>Complete ({completionStats.complete}):</strong> No work needed ✅</li>
                  <li>• <strong>Partial ({completionStats.partial}):</strong> ~{completionStats.partial * 3} hours (2-4h each)</li>
                  <li>• <strong>Minimal ({completionStats.minimal}):</strong> ~{completionStats.minimal * 8} hours (6-10h each)</li>
                  <li>• <strong>Total Effort:</strong> ~{completionStats.partial * 3 + completionStats.minimal * 8} hours ({Math.round((completionStats.partial * 3 + completionStats.minimal * 8) / 8)} working days)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section Coverage Summary */}
          <Card className="border-2 border-indigo-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                {t({ en: 'Coverage by Section Across All 37 Reports', ar: 'التغطية حسب القسم' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {standardSections.map(section => {
                  const sectionScores = reportsData.map(r => r.sections[section.id]?.score || 0);
                  const avgScore = Math.round(sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length);
                  const completeCount = reportsData.filter(r => r.sections[section.id]?.status === 'complete').length;
                  
                  return (
                    <div key={section.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <section.icon className="h-5 w-5 text-slate-700" />
                          <h4 className="font-semibold text-slate-900">{section.name}</h4>
                          <Badge className={section.required ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                            {section.required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{
                            color: avgScore >= 90 ? '#16a34a' : avgScore >= 60 ? '#d97706' : '#dc2626'
                          }}>
                            {avgScore}%
                          </div>
                          <p className="text-xs text-slate-500">{completeCount}/{reportsData.length} complete</p>
                        </div>
                      </div>
                      <Progress value={avgScore} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Priority Recommendations */}
          <Card className="border-2 border-red-300">
            <CardHeader>
              <CardTitle className="text-red-900">
                {t({ en: `🎯 Prioritized Action Plan (${totalActions} Total Actions)`, ar: `🎯 خطة العمل` })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                  <p className="font-bold text-red-900 mb-2">🔴 Critical ({actionsByPriority.critical.length})</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    {actionsByPriority.critical.map(r => (
                      <li key={r.name}>• {r.name.replace('CoverageReport', '')} ({r.completeness}%)</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
                  <p className="font-bold text-amber-900 mb-2">⚠️ High ({actionsByPriority.high.length})</p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {actionsByPriority.high.slice(0, 8).map(r => (
                      <li key={r.name}>• {r.name.replace('CoverageReport', '').replace('Coverage', '')} ({r.completeness}%)</li>
                    ))}
                    {actionsByPriority.high.length > 8 && <li className="text-xs">+ {actionsByPriority.high.length - 8} more</li>}
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                  <p className="font-bold text-green-900 mb-2">✅ Reference ({actionsByPriority.reference.length})</p>
                  <p className="text-xs text-slate-600 mb-2">Complete - use as templates</p>
                  <ul className="text-sm text-green-800 space-y-0.5">
                    <li>• Challenges (Gold)</li>
                    <li>• Solutions, Pilots, Programs (Platinum)</li>
                    <li>• Ideas, Citizen, Expert</li>
                    <li>+ 14 system reports</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-purple-100 rounded-lg">
                <p className="font-bold text-purple-900 mb-3">📊 Effort Breakdown</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-green-800">Reference ({actionsByPriority.reference.length}): 0 hours</p>
                    <p className="text-xs text-slate-600">Complete ✅</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">High ({actionsByPriority.high.length}): ~{actionsByPriority.high.length * 3}h</p>
                    <p className="text-xs text-slate-600">2-4 hours each</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">Critical ({actionsByPriority.critical.length}): ~{actionsByPriority.critical.length * 8}h</p>
                    <p className="text-xs text-slate-600">6-10 hours each</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-purple-300">
                  <p className="text-sm font-bold text-purple-900">
                    Total: ~{actionsByPriority.high.length * 3 + actionsByPriority.critical.length * 8} hours ({Math.round((actionsByPriority.high.length * 3 + actionsByPriority.critical.length * 8) / 8)} working days)
                  </p>
                </div>
              </div>

              {/* Bottom Line */}
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="font-bold text-blue-900 mb-2">🎯 Bottom Line</p>
                <p className="text-sm text-blue-800">
                  <strong>Total Coverage:</strong> {completionStats.total} reports ({completionStats.moduleReports} module + {completionStats.systemReports} system)
                  <br/>
                  <strong>Current State:</strong> {completionStats.reference}/{completionStats.total} ({Math.round(completionStats.reference/completionStats.total*100)}%) at gold/platinum standard
                  <br/><br/>
                  <strong>Verification:</strong>
                  <br/>✅ All {completionStats.total} reports audited section-by-section
                  <br/>✅ {totalActions} specific actions documented
                  <br/>✅ Priorities assigned: {actionsByPriority.critical.length} Critical, {actionsByPriority.high.length} High, {actionsByPriority.reference.length} Reference
                  <br/><br/>
                  <strong>Biggest Gaps:</strong> User Journeys (7 missing), Workflows (6 weak), Conversion Paths (6 missing), RBAC (8 weak), Comparisons (8 missing), Integrations (6 weak)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: DETAILED SECTION AUDITS */}
        <TabsContent value="audit" className="space-y-6">
          {/* Priority Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 flex-wrap">
                <Button variant={selectedPriority === 'all' ? 'default' : 'outline'} onClick={() => setSelectedPriority('all')} size="sm">
                  All ({reportsData.length})
                </Button>
                <Button variant={selectedPriority === 'reference' ? 'default' : 'outline'} onClick={() => setSelectedPriority('reference')} size="sm" className="bg-green-600">
                  ✅ Reference ({actionsByPriority.reference.length})
                </Button>
                <Button variant={selectedPriority === 'high' ? 'default' : 'outline'} onClick={() => setSelectedPriority('high')} size="sm" className="bg-amber-600">
                  ⚠️ High ({actionsByPriority.high.length})
                </Button>
                <Button variant={selectedPriority === 'critical' ? 'default' : 'outline'} onClick={() => setSelectedPriority('critical')} size="sm" className="bg-red-600">
                  🔴 Critical ({actionsByPriority.critical.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Report Cards */}
          {filteredReports.map((report) => (
            <Card key={report.name} className={`border-2 ${
              report.completeness >= 95 ? 'border-green-300' :
              report.completeness >= 60 ? 'border-amber-300' : 'border-red-300'
            }`}>
              <CardHeader>
                <button onClick={() => setExpandedReport(expandedReport === report.name ? null : report.name)} className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        report.completeness >= 95 ? 'bg-green-100' :
                        report.completeness >= 60 ? 'bg-amber-100' : 'bg-red-100'
                      }`}>
                        <span className="text-2xl font-bold" style={{
                          color: report.completeness >= 95 ? '#16a34a' :
                                 report.completeness >= 60 ? '#d97706' : '#dc2626'
                        }}>
                          {report.completeness}%
                        </span>
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={
                            report.status.includes('✅') ? 'bg-green-600 text-white' :
                            report.status.includes('⚠️') ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
                          }>{report.status}</Badge>
                          <Badge variant="outline" className="text-xs">{report.category}</Badge>
                          <span className="text-xs text-slate-500">
                            {Object.values(report.sections).filter(s => s.status === 'complete').length}/{Object.keys(report.sections).length} sections
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link to={createPageUrl(report.name)}>
                        <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>View Report</Button>
                      </Link>
                      {expandedReport === report.name ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </div>
                  </div>
                </button>
              </CardHeader>

              {expandedReport === report.name && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(report.sections).map(([sectionId, sectionData]) => {
                      const sectionInfo = standardSections.find(s => s.id === parseInt(sectionId));
                      const Icon = sectionInfo.icon;
                      
                      return (
                        <div key={sectionId} className={`p-4 border-2 rounded-lg ${
                          sectionData.status === 'complete' ? 'bg-green-50 border-green-300' :
                          sectionData.status === 'partial' ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-slate-700" />
                              <Badge className={
                                sectionData.status === 'complete' ? 'bg-green-600 text-white' :
                                sectionData.status === 'partial' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white'
                              }>{sectionData.status}</Badge>
                            </div>
                            <div className="text-2xl font-bold" style={{
                              color: sectionData.score >= 90 ? '#16a34a' :
                                     sectionData.score >= 60 ? '#d97706' : '#dc2626'
                            }}>{sectionData.score}%</div>
                          </div>

                          <h4 className="font-semibold text-sm text-slate-900 mb-2">
                            {sectionId}. {sectionInfo.name}
                          </h4>
                          <p className="text-xs text-slate-600 mb-3">{sectionData.notes}</p>

                          {sectionData.actions && sectionData.actions.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-red-900 mb-1">
                                🔧 Actions ({sectionData.actions.length}):
                              </p>
                              <ul className="space-y-1">
                                {sectionData.actions.map((action, idx) => (
                                  <li key={idx} className="text-xs text-red-700 flex items-start gap-1">
                                    <span className="flex-shrink-0">•</span>
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {sectionData.actions?.length === 0 && sectionData.status === 'complete' && (
                            <div className="flex items-center gap-1 text-xs text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Complete</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
                    <p className="font-semibold text-blue-900 mb-2">
                      📋 Total Actions: {Object.values(report.sections).reduce((sum, s) => sum + (s.actions?.length || 0), 0)}
                    </p>
                    <Progress value={report.completeness} className="h-3" />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* TAB 3: UPDATE HISTORY */}
        <TabsContent value="history" className="space-y-6">
          <Card className="border-2 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="h-6 w-6" />
                {t({ en: 'Recent Critical Updates', ar: 'التحديثات الحرجة الأخيرة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportUpdates.critical.map((report, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={createPageUrl(report.name)} className="font-semibold text-green-900 hover:underline">
                        {report.name}
                      </Link>
                      <Badge className="bg-green-600 text-white text-xs">{report.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{report.updates}</p>
                    <p className="text-xs text-slate-500 mt-1">{report.date}</p>
                  </div>
                </div>
              ))}
              {reportUpdates.recent.map((report, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-900">{report.name}</span>
                      <Badge className="bg-blue-600 text-white text-xs">{report.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{report.updates}</p>
                    <p className="text-xs text-slate-500 mt-1">{report.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-4 border-green-400 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900 text-2xl">
                <CheckCircle2 className="h-8 w-8" />
                {t({ en: '✅ Coverage Status Summary', ar: '✅ ملخص الحالة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border-2 border-green-300">
                  <h4 className="font-bold text-green-900 mb-3">All 37 Reports Tracked & Verified</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-green-800 mb-2">✅ Module Reports (19):</p>
                      <ul className="text-slate-700 space-y-1 pl-4">
                        <li>• 7 Complete/Reference (Challenges, Ideas, Citizen, Expert, Solutions, Pilots, Programs)</li>
                        <li>• 1 Near-Complete (R&D 95%)</li>
                        <li>• 4 Partial (Sandboxes, Living Labs, Policy, Organizations)</li>
                        <li>• 7 Minimal (Matchmaker, Scaling, Academia, Startup, Taxonomy, Geography, Strategic)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-teal-800 mb-2">✅ System Reports (18):</p>
                      <ul className="text-slate-700 space-y-1 pl-4">
                        <li>• 14 Complete/Reference (RBAC, Menu, Workflow, Gates, Stages, Wizards, etc.)</li>
                        <li>• 4 Partial (MII, Partnerships, Communications, Data Management)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center py-6">
                  <p className="text-2xl font-bold text-green-900 mb-2">
                    ✅ All 37 Coverage Reports Reviewed
                  </p>
                  <p className="text-slate-600">
                    {completionStats.complete} complete ({Math.round(completionStats.complete/completionStats.total*100)}%) • 
                    {completionStats.partial} partial ({Math.round(completionStats.partial/completionStats.total*100)}%) • 
                    {completionStats.minimal} minimal ({Math.round(completionStats.minimal/completionStats.total*100)}%)
                    <br/>
                    {totalActions} specific actions identified • ~{actionsByPriority.high.length * 3 + actionsByPriority.critical.length * 8} hours remaining effort
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(CoverageReportsAudit, { requireAdmin: true });
