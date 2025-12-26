export const CitizenIdeaScreeningGateConfig = {
  entity_type: 'CitizenIdea',
  gate_key: 'screening',
  gate_name: { en: 'Screening Gate', ar: 'بوابة الفرز' },
  description: { en: 'Initial screening of citizen ideas for clarity, feasibility, and relevance', ar: 'الفرز الأولي لأفكار المواطنين' },
  required_role: 'admin',
  stage_transition: {
    from: 'submitted',
    to: 'screened'
  },
  
  self_check_items: [
    { en: 'Idea is clear and well-articulated', ar: 'الفكرة واضحة ومعبر عنها جيداً' },
    { en: 'No toxic or inappropriate content', ar: 'لا محتوى ضار أو غير مناسب' },
    { en: 'Falls within municipal scope', ar: 'ضمن نطاق البلدية' },
    { en: 'Not a duplicate of existing idea', ar: 'ليست تكراراً لفكرة موجودة' }
  ],
  
  ai_checks: {
    enabled: true,
    features: ['clarity_score', 'feasibility_check', 'duplicate_detection', 'toxicity_scan', 'category_classification']
  },
  
  reviewer_checklist: [
    { en: 'Clarity and completeness of idea', ar: 'وضوح واكتمال الفكرة' },
    { en: 'Feasibility assessment', ar: 'تقييم الجدوى' },
    { en: 'Municipal relevance', ar: 'الصلة بالبلدية' },
    { en: 'Innovation potential', ar: 'إمكانية الابتكار' },
    { en: 'Resource requirements reasonable', ar: 'المتطلبات معقولة' }
  ],
  
  approval_center_integration: true,
  unified_component_support: true,
  sla_hours: 72,
  
  decision_options: ['approve', 'reject', 'request_more_info'],
  
  auto_actions: {
    on_approve: ['set_status_screened', 'assign_evaluator'],
    on_reject: ['notify_citizen', 'archive'],
    on_request_info: ['notify_citizen', 'set_pending']
  }
};
