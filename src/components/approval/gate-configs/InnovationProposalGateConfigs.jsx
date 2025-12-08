export const InnovationProposalSubmissionGateConfig = {
  entity_type: 'InnovationProposal',
  gate_key: 'submission',
  gate_name: { en: 'Submission Gate', ar: 'بوابة التقديم' },
  description: { en: 'Initial submission review for completeness', ar: 'مراجعة التقديم الأولي' },
  required_role: 'admin',
  
  self_check_items: [
    { en: 'All required fields completed', ar: 'جميع الحقول المطلوبة مكتملة' },
    { en: 'Team information provided', ar: 'معلومات الفريق مقدمة' },
    { en: 'Budget breakdown included', ar: 'تفصيل الميزانية مضمن' },
    { en: 'Implementation plan clear', ar: 'خطة التنفيذ واضحة' }
  ],
  
  ai_checks: {
    enabled: true,
    features: ['completeness_check', 'budget_reasonability', 'team_adequacy', 'innovation_type_classification']
  },
  
  reviewer_checklist: [
    { en: 'Proposal completeness', ar: 'اكتمال المقترح' },
    { en: 'Budget reasonability', ar: 'معقولية الميزانية' },
    { en: 'Team adequacy', ar: 'كفاية الفريق' },
    { en: 'Innovation clarity', ar: 'وضوح الابتكار' }
  ],
  
  decision_options: ['approve', 'reject', 'request_revision'],
  sla_hours: 48
};

export const InnovationProposalScreeningGateConfig = {
  entity_type: 'InnovationProposal',
  gate_key: 'screening',
  gate_name: { en: 'Technical Screening', ar: 'الفرز الفني' },
  description: { en: 'Technical evaluation of innovation proposal', ar: 'التقييم الفني للمقترح' },
  required_role: 'expert',
  
  ai_checks: {
    enabled: true,
    features: ['technical_feasibility', 'market_potential', 'competitive_analysis', 'risk_assessment']
  },
  
  reviewer_checklist: [
    { en: 'Technical feasibility (0-100)', ar: 'الجدوى الفنية' },
    { en: 'Innovation level (0-100)', ar: 'مستوى الابتكار' },
    { en: 'Market potential (0-100)', ar: 'إمكانات السوق' },
    { en: 'Risk assessment', ar: 'تقييم المخاطر' }
  ],
  
  decision_options: ['approve', 'reject', 'conditional'],
  sla_hours: 120
};

export const InnovationProposalStakeholderGateConfig = {
  entity_type: 'InnovationProposal',
  gate_key: 'stakeholder_alignment',
  gate_name: { en: 'Stakeholder Alignment', ar: 'توافق أصحاب المصلحة' },
  description: { en: 'Verify alignment with strategic goals and stakeholder buy-in', ar: 'التحقق من التوافق الاستراتيجي' },
  required_role: 'admin',
  
  reviewer_checklist: [
    { en: 'Strategic alignment verified', ar: 'التوافق الاستراتيجي متحقق' },
    { en: 'Key stakeholders identified', ar: 'أصحاب المصلحة محددون' },
    { en: 'Municipal support confirmed', ar: 'دعم البلدية مؤكد' },
    { en: 'Resource availability checked', ar: 'توفر الموارد متحقق' }
  ],
  
  decision_options: ['approve', 'conditional', 'reject'],
  sla_hours: 72
};