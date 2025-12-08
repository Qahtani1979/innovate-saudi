export const CitizenIdeaEvaluationGateConfig = {
  entity_type: 'CitizenIdea',
  gate_key: 'evaluation',
  gate_name: { en: 'Evaluation Gate', ar: 'بوابة التقييم' },
  description: { en: 'Multi-expert evaluation to determine idea merit and recommend action', ar: 'تقييم متعدد الخبراء' },
  required_role: 'expert',
  stage_transition: {
    from: 'screened',
    to: 'evaluated'
  },
  
  self_check_items: [
    { en: 'Reviewed idea details thoroughly', ar: 'مراجعة تفاصيل الفكرة بدقة' },
    { en: 'Assessed impact and feasibility', ar: 'تقييم الأثر والجدوى' },
    { en: 'Considered cost and timeline', ar: 'النظر في التكلفة والجدول' },
    { en: 'Determined best conversion path', ar: 'تحديد أفضل مسار للتحويل' }
  ],
  
  ai_checks: {
    enabled: true,
    features: ['impact_scoring', 'cost_estimation', 'timeline_prediction', 'conversion_recommendation', 'similar_ideas_analysis']
  },
  
  reviewer_checklist: [
    { en: 'Impact score (0-100)', ar: 'درجة الأثر' },
    { en: 'Feasibility score (0-100)', ar: 'درجة الجدوى' },
    { en: 'Innovation score (0-100)', ar: 'درجة الابتكار' },
    { en: 'Cost estimate (SAR)', ar: 'تقدير التكلفة' },
    { en: 'Timeline estimate (weeks)', ar: 'تقدير الجدول الزمني' },
    { en: 'Recommended action', ar: 'الإجراء الموصى به' }
  ],
  
  multi_evaluator: true,
  consensus_required: true,
  min_evaluators: 2,
  
  approval_center_integration: true,
  unified_component_support: true,
  sla_hours: 120,
  
  decision_options: [
    'approve',
    'convert_to_challenge',
    'convert_to_solution',
    'merge_with_existing',
    'request_more_info',
    'reject'
  ],
  
  auto_actions: {
    on_approve: ['notify_citizen', 'set_status_approved', 'add_to_implementation_queue'],
    on_convert: ['create_entity', 'link_entities', 'notify_citizen'],
    on_reject: ['notify_citizen_with_feedback', 'archive']
  }
};