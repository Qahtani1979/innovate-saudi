export const RDProjectKickoffGateConfig = {
  entity_type: 'RDProject',
  gate_key: 'kickoff',
  gate_name: { en: 'Project Kickoff Gate', ar: 'بوابة بدء المشروع' },
  description: { en: 'Final approval before R&D project execution begins', ar: 'الموافقة النهائية قبل بدء التنفيذ' },
  required_role: 'admin',
  
  self_check_items: [
    { en: 'Team fully assembled', ar: 'الفريق مجمّع بالكامل' },
    { en: 'Budget approved and allocated', ar: 'الميزانية معتمدة ومخصصة' },
    { en: 'Research plan finalized', ar: 'خطة البحث نهائية' },
    { en: 'Ethics approval obtained (if needed)', ar: 'موافقة الأخلاقيات (إن لزم)' },
    { en: 'Collaboration agreements signed', ar: 'اتفاقيات التعاون موقعة' }
  ],
  
  ai_checks: {
    enabled: true,
    features: ['team_completeness_check', 'budget_validation', 'timeline_feasibility', 'risk_assessment']
  },
  
  reviewer_checklist: [
    { en: 'All prerequisites met', ar: 'جميع المتطلبات مستوفاة' },
    { en: 'PI confirmation received', ar: 'تأكيد الباحث الرئيسي' },
    { en: 'Institution support verified', ar: 'دعم المؤسسة متحقق' },
    { en: 'Milestones clearly defined', ar: 'المعالم محددة بوضوح' },
    { en: 'Risk mitigation plan adequate', ar: 'خطة تخفيف المخاطر كافية' }
  ],
  
  approval_center_integration: true,
  unified_component_support: true,
  inline_approval_support: true,
  sla_hours: 72,
  
  decision_options: ['approve', 'conditional', 'defer'],
  
  auto_actions: {
    on_approve: ['set_status_active', 'set_start_date', 'trigger_budget_release', 'notify_team', 'create_kickoff_activity'],
    on_conditional: ['create_conditions_list', 'notify_pi'],
    on_defer: ['set_on_hold', 'log_reason']
  }
};