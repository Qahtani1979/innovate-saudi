// Gate configurations for all entities
// Used by UnifiedWorkflowApprovalTab and ApprovalCenter

export const gateConfigs = {
  policy_recommendation: [
    {
      name: 'legal_review',
      label: { en: 'Legal Review', ar: 'المراجعة القانونية' },
      type: 'review',
      requiredRole: 'legal_officer',
      sla_days: 5,
      selfCheckItems: [
        { en: 'Legal citations verified', ar: 'تم التحقق من الاستشهادات القانونية' },
        { en: 'Regulatory framework identified', ar: 'تم تحديد الإطار التنظيمي' },
        { en: 'Stakeholder analysis complete', ar: 'تحليل أصحاب المصلحة مكتمل' },
        { en: 'Implementation steps defined', ar: 'خطوات التنفيذ محددة' }
      ],
      reviewerChecklistItems: [
        { en: 'Legal compliance verified', ar: 'التحقق من الامتثال القانوني' },
        { en: 'Regulatory citations accurate', ar: 'الاستشهادات التنظيمية دقيقة' },
        { en: 'No legal conflicts detected', ar: 'لا توجد تعارضات قانونية' },
        { en: 'Implementation feasible', ar: 'التنفيذ ممكن' }
      ],
      aiAssistance: {
        requester: 'Verify legal citations, check for conflicts with existing policies',
        reviewer: 'Analyze legal compliance, identify risks, suggest improvements'
      }
    },
    {
      name: 'public_consultation',
      label: { en: 'Public Consultation', ar: 'الاستشارة العامة' },
      type: 'compliance',
      requiredRole: 'policy_officer',
      sla_days: 30,
      selfCheckItems: [
        { en: 'Consultation plan prepared', ar: 'خطة الاستشارة جاهزة' },
        { en: 'Stakeholders identified', ar: 'أصحاب المصلحة محددون' },
        { en: 'Public URL configured', ar: 'رابط الاستشارة جاهز' },
        { en: 'Duration set (min 30 days)', ar: 'المدة محددة (30 يوم كحد أدنى)' }
      ],
      reviewerChecklistItems: [
        { en: 'Stakeholder list comprehensive', ar: 'قائمة أصحاب المصلحة شاملة' },
        { en: 'Consultation process transparent', ar: 'عملية الاستشارة شفافة' },
        { en: 'Feedback mechanism clear', ar: 'آلية التعليقات واضحة' },
        { en: 'Timeline adequate', ar: 'الجدول الزمني كافٍ' }
      ],
      aiAssistance: {
        requester: 'Suggest stakeholders, draft consultation questions',
        reviewer: 'Assess stakeholder coverage, identify missing groups'
      }
    },
    {
      name: 'council_approval',
      label: { en: 'Council Approval', ar: 'موافقة المجلس' },
      type: 'approval',
      requiredRole: 'council_member',
      sla_days: 14,
      selfCheckItems: [
        { en: 'All documents prepared', ar: 'كل الوثائق جاهزة' },
        { en: 'Budget implications documented', ar: 'الآثار المالية موثقة' },
        { en: 'Public consultation completed', ar: 'الاستشارة العامة مكتملة' },
        { en: 'Presentation ready', ar: 'العرض التقديمي جاهز' }
      ],
      reviewerChecklistItems: [
        { en: 'Policy aligns with strategic goals', ar: 'السياسة متوافقة مع الأهداف' },
        { en: 'Budget reasonable', ar: 'الميزانية معقولة' },
        { en: 'Public support documented', ar: 'الدعم العام موثق' },
        { en: 'Implementation viable', ar: 'التنفيذ قابل للتطبيق' }
      ],
      aiAssistance: {
        requester: 'Generate executive summary for council, highlight key benefits',
        reviewer: 'Analyze strategic alignment, assess risks, compare alternatives'
      }
    },
    {
      name: 'ministry_approval',
      label: { en: 'Ministry Approval', ar: 'موافقة الوزارة' },
      type: 'approval',
      requiredRole: 'ministry_representative',
      sla_days: 21,
      selfCheckItems: [
        { en: 'Council approval obtained', ar: 'موافقة المجلس حاصلة' },
        { en: 'National alignment verified', ar: 'التوافق الوطني محقق' },
        { en: 'Inter-municipal impact assessed', ar: 'الأثر بين البلديات مقيّم' },
        { en: 'Final documentation complete', ar: 'التوثيق النهائي مكتمل' }
      ],
      reviewerChecklistItems: [
        { en: 'National policy alignment', ar: 'التوافق مع السياسة الوطنية' },
        { en: 'No inter-ministry conflicts', ar: 'لا توجد تعارضات بين الوزارات' },
        { en: 'Scalability to other municipalities', ar: 'قابلية التوسع لبلديات أخرى' },
        { en: 'Final approval justified', ar: 'الموافقة النهائية مبررة' }
      ],
      aiAssistance: {
        requester: 'Verify national alignment, assess scalability potential',
        reviewer: 'Analyze national impact, identify scaling opportunities, check conflicts'
      }
    }
  ],

  challenge: [
    {
      name: 'submission',
      label: { en: 'Challenge Submission', ar: 'تقديم التحدي' },
      type: 'submission',
      requiredRole: 'challenge_reviewer',
      sla_days: 3,
      selfCheckItems: [
        { en: 'Problem statement clear', ar: 'بيان المشكلة واضح' },
        { en: 'Data/evidence attached', ar: 'البيانات والأدلة مرفقة' },
        { en: 'Stakeholders identified', ar: 'أصحاب المصلحة محددون' },
        { en: 'KPIs defined', ar: 'المؤشرات محددة' }
      ],
      reviewerChecklistItems: [
        { en: 'Challenge valid and clear', ar: 'التحدي صالح وواضح' },
        { en: 'Classification appropriate', ar: 'التصنيف مناسب' },
        { en: 'Priority score justified', ar: 'درجة الأولوية مبررة' },
        { en: 'No duplicates', ar: 'لا توجد تكرارات' }
      ],
      aiAssistance: {
        requester: 'Verify completeness, check for similar challenges, suggest improvements',
        reviewer: 'Detect duplicates, assess priority, recommend classification'
      }
    },
    {
      name: 'review',
      label: { en: 'Challenge Review', ar: 'مراجعة التحدي' },
      type: 'review',
      requiredRole: 'challenge_reviewer',
      sla_days: 7,
      selfCheckItems: [
        { en: 'All reviewer feedback addressed', ar: 'كل ملاحظات المراجع معالجة' },
        { en: 'Classification confirmed', ar: 'التصنيف مؤكد' },
        { en: 'Priority validated', ar: 'الأولوية محققة' },
        { en: 'Ready for approval', ar: 'جاهز للموافقة' }
      ],
      reviewerChecklistItems: [
        { en: 'Problem well-defined', ar: 'المشكلة محددة بشكل جيد' },
        { en: 'Evidence sufficient', ar: 'الأدلة كافية' },
        { en: 'Sector classification correct', ar: 'تصنيف القطاع صحيح' },
        { en: 'Priority appropriate', ar: 'الأولوية مناسبة' },
        { en: 'No security concerns', ar: 'لا مخاوف أمنية' }
      ],
      aiAssistance: {
        requester: 'Prepare for review, highlight improvements made',
        reviewer: 'Comprehensive analysis of challenge quality, detect issues, recommend approval decision'
      }
    },
    {
      name: 'treatment_approval',
      label: { en: 'Treatment Plan Approval', ar: 'موافقة خطة المعالجة' },
      type: 'approval',
      requiredRole: 'municipal_strategist',
      sla_days: 7,
      selfCheckItems: [
        { en: 'Treatment track selected', ar: 'مسار المعالجة محدد' },
        { en: 'Budget estimated', ar: 'الميزانية مقدرة' },
        { en: 'Timeline proposed', ar: 'الجدول الزمني مقترح' },
        { en: 'Success metrics defined', ar: 'مقاييس النجاح محددة' }
      ],
      reviewerChecklistItems: [
        { en: 'Track appropriate for challenge', ar: 'المسار مناسب للتحدي' },
        { en: 'Resources available', ar: 'الموارد متاحة' },
        { en: 'Timeline realistic', ar: 'الجدول الزمني واقعي' },
        { en: 'Expected impact justified', ar: 'الأثر المتوقع مبرر' }
      ],
      aiAssistance: {
        requester: 'Suggest optimal treatment track, estimate resources',
        reviewer: 'Validate track selection, assess feasibility, compare alternatives'
      }
    },
    {
      name: 'resolution',
      label: { en: 'Resolution Approval', ar: 'موافقة الحل' },
      type: 'approval',
      requiredRole: 'challenge_approver',
      sla_days: 5,
      selfCheckItems: [
        { en: 'Treatment completed', ar: 'المعالجة مكتملة' },
        { en: 'KPIs met', ar: 'المؤشرات محققة' },
        { en: 'Lessons learned documented', ar: 'الدروس المستفادة موثقة' },
        { en: 'Impact report ready', ar: 'تقرير الأثر جاهز' }
      ],
      reviewerChecklistItems: [
        { en: 'Original problem solved', ar: 'المشكلة الأصلية محلولة' },
        { en: 'KPI targets achieved', ar: 'أهداف المؤشرات محققة' },
        { en: 'Stakeholders satisfied', ar: 'أصحاب المصلحة راضون' },
        { en: 'Scalability assessed', ar: 'قابلية التوسع مقيمة' },
        { en: 'Resolution justified', ar: 'الحل مبرر' }
      ],
      aiAssistance: {
        requester: 'Verify resolution criteria met, generate impact summary',
        reviewer: 'Assess resolution quality, validate KPI achievement, recommend scaling opportunities'
      }
    }
  ],

  pilot: [
    {
      name: 'design_review',
      label: { en: 'Pilot Design Review', ar: 'مراجعة تصميم التجربة' },
      type: 'review',
      requiredRole: 'pilot_reviewer',
      sla_days: 5,
      selfCheckItems: [
        { en: 'Challenge linked', ar: 'التحدي مربوط' },
        { en: 'Solution linked', ar: 'الحل مربوط' },
        { en: 'Hypothesis clear', ar: 'الفرضية واضحة' },
        { en: 'KPIs defined with baselines', ar: 'المؤشرات محددة مع قيم أساسية' },
        { en: 'Budget breakdown complete', ar: 'تفصيل الميزانية مكتمل' }
      ],
      reviewerChecklistItems: [
        { en: 'Design sound', ar: 'التصميم سليم' },
        { en: 'KPIs measurable', ar: 'المؤشرات قابلة للقياس' },
        { en: 'Budget reasonable', ar: 'الميزانية معقولة' },
        { en: 'Risks identified', ar: 'المخاطر محددة' }
      ],
      aiAssistance: {
        requester: 'Verify completeness, suggest missing elements, validate KPIs',
        reviewer: 'Assess design quality, identify risks, benchmark budget'
      }
    },
    {
      name: 'launch_approval',
      label: { en: 'Launch Approval', ar: 'موافقة الإطلاق' },
      type: 'approval',
      requiredRole: 'pilot_approver',
      sla_days: 7,
      selfCheckItems: [
        { en: 'Team assigned', ar: 'الفريق معين' },
        { en: 'Resources secured', ar: 'الموارد محجوزة' },
        { en: 'Stakeholders aligned', ar: 'أصحاب المصلحة متوافقون' },
        { en: 'Launch checklist complete', ar: 'قائمة الإطلاق مكتملة' }
      ],
      reviewerChecklistItems: [
        { en: 'All prerequisites met', ar: 'كل المتطلبات محققة' },
        { en: 'Readiness confirmed', ar: 'الجاهزية مؤكدة' },
        { en: 'Risks acceptable', ar: 'المخاطر مقبولة' },
        { en: 'Approval justified', ar: 'الموافقة مبررة' }
      ],
      aiAssistance: {
        requester: 'Verify launch readiness, identify missing items',
        reviewer: 'Assess readiness score, predict success probability, flag risks'
      }
    }
  ],

  rd_proposal: [
    {
      name: 'submission',
      label: { en: 'Proposal Submission', ar: 'تقديم المقترح' },
      type: 'submission',
      requiredRole: 'rd_reviewer',
      sla_days: 3,
      selfCheckItems: [
        { en: 'Research plan complete', ar: 'خطة البحث مكتملة' },
        { en: 'Budget breakdown detailed', ar: 'تفصيل الميزانية مفصل' },
        { en: 'Team qualifications documented', ar: 'مؤهلات الفريق موثقة' },
        { en: 'Methodology clear', ar: 'المنهجية واضحة' }
      ],
      reviewerChecklistItems: [
        { en: 'Proposal aligned with R&D call', ar: 'المقترح متوافق مع دعوة البحث' },
        { en: 'Budget realistic', ar: 'الميزانية واقعية' },
        { en: 'Team qualified', ar: 'الفريق مؤهل' },
        { en: 'No duplicate proposals', ar: 'لا توجد مقترحات مكررة' }
      ],
      aiAssistance: {
        requester: 'Verify academic rigor, check team qualifications, suggest improvements',
        reviewer: 'Assess research quality, compare with similar proposals, score competitiveness'
      }
    },
    {
      name: 'academic_review',
      label: { en: 'Academic Review', ar: 'المراجعة الأكاديمية' },
      type: 'review',
      requiredRole: 'expert_reviewer',
      sla_days: 14,
      selfCheckItems: [
        { en: 'Literature review comprehensive', ar: 'مراجعة الأدبيات شاملة' },
        { en: 'Methodology scientifically sound', ar: 'المنهجية سليمة علمياً' },
        { en: 'Expected outputs realistic', ar: 'المخرجات المتوقعة واقعية' },
        { en: 'Ethics approval obtained (if needed)', ar: 'موافقة الأخلاقيات حاصلة (إن لزم)' }
      ],
      reviewerChecklistItems: [
        { en: 'Research novelty verified', ar: 'التحقق من حداثة البحث' },
        { en: 'Methodology appropriate', ar: 'المنهجية مناسبة' },
        { en: 'Expected impact significant', ar: 'الأثر المتوقع كبير' },
        { en: 'Commercialization potential assessed', ar: 'تقييم إمكانية التسويق' }
      ],
      aiAssistance: {
        requester: 'Analyze literature gaps, validate methodology, predict impact',
        reviewer: 'Compare with state-of-art, assess feasibility, score innovation level'
      }
    }
  ],

  program_application: [
    {
      name: 'submission',
      label: { en: 'Application Submission', ar: 'تقديم الطلب' },
      type: 'submission',
      requiredRole: 'program_screener',
      sla_days: 3,
      selfCheckItems: [
        { en: 'All required documents attached', ar: 'كل الوثائق المطلوبة مرفقة' },
        { en: 'Eligibility criteria met', ar: 'معايير الأهلية محققة' },
        { en: 'Team information complete', ar: 'معلومات الفريق مكتملة' },
        { en: 'Application questions answered', ar: 'أسئلة الطلب مجابة' }
      ],
      reviewerChecklistItems: [
        { en: 'Eligibility verified', ar: 'التحقق من الأهلية' },
        { en: 'Documents authentic', ar: 'الوثائق أصلية' },
        { en: 'Completeness confirmed', ar: 'الاكتمال مؤكد' },
        { en: 'No previous rejections', ar: 'لا توجد رفوضات سابقة' }
      ],
      aiAssistance: {
        requester: 'Check completeness, verify eligibility, suggest missing info',
        reviewer: 'Screen applications, detect duplicates, flag incomplete submissions'
      }
    },
    {
      name: 'selection',
      label: { en: 'Cohort Selection', ar: 'اختيار المجموعة' },
      type: 'approval',
      requiredRole: 'program_manager',
      sla_days: 7,
      selfCheckItems: [
        { en: 'Screening passed', ar: 'اجتاز الفحص' },
        { en: 'Fit score calculated', ar: 'درجة التوافق محسوبة' },
        { en: 'Interview completed', ar: 'المقابلة مكتملة' },
        { en: 'References checked', ar: 'المراجع محققة' }
      ],
      reviewerChecklistItems: [
        { en: 'Cohort diversity balanced', ar: 'تنوع المجموعة متوازن' },
        { en: 'Fit with program objectives', ar: 'التوافق مع أهداف البرنامج' },
        { en: 'Capacity available', ar: 'السعة متاحة' },
        { en: 'Selection justified', ar: 'الاختيار مبرر' }
      ],
      aiAssistance: {
        requester: 'Calculate fit score, highlight strengths, suggest improvements',
        reviewer: 'Rank applicants, optimize cohort mix, predict success probability'
      }
    }
  ],

  matchmaker_application: [
    {
      name: 'screening',
      label: { en: 'Initial Screening', ar: 'الفحص الأولي' },
      type: 'review',
      requiredRole: 'matchmaker_screener',
      sla_days: 2,
      selfCheckItems: [
        { en: 'Organization verified', ar: 'المنظمة محققة' },
        { en: 'Capabilities documented', ar: 'القدرات موثقة' },
        { en: 'Previous work showcased', ar: 'الأعمال السابقة معروضة' },
        { en: 'Matching preferences clear', ar: 'تفضيلات المطابقة واضحة' }
      ],
      reviewerChecklistItems: [
        { en: 'Organization legitimate', ar: 'المنظمة شرعية' },
        { en: 'Capabilities match platform needs', ar: 'القدرات تطابق احتياجات المنصة' },
        { en: 'No conflicts of interest', ar: 'لا توجد تضاربات مصالح' },
        { en: 'Ready for matching', ar: 'جاهز للمطابقة' }
      ],
      aiAssistance: {
        requester: 'Verify credentials, suggest capability areas, optimize profile',
        reviewer: 'Validate organization, assess quality, predict match success rate'
      }
    },
    {
      name: 'evaluation',
      label: { en: 'Match Evaluation', ar: 'تقييم المطابقة' },
      type: 'approval',
      requiredRole: 'matchmaker_evaluator',
      sla_days: 7,
      selfCheckItems: [
        { en: 'Match criteria defined', ar: 'معايير المطابقة محددة' },
        { en: 'Stakeholder input gathered', ar: 'مدخلات أصحاب المصلحة مجمعة' },
        { en: 'Engagement plan ready', ar: 'خطة المشاركة جاهزة' },
        { en: 'MoU template prepared', ar: 'قالب المذكرة جاهز' }
      ],
      reviewerChecklistItems: [
        { en: 'Match quality high', ar: 'جودة المطابقة عالية' },
        { en: 'Both parties aligned', ar: 'الطرفان متوافقان' },
        { en: 'Success probability acceptable', ar: 'احتمال النجاح مقبول' },
        { en: 'Resources available', ar: 'الموارد متاحة' }
      ],
      aiAssistance: {
        requester: 'Calculate match score, identify synergies, draft engagement plan',
        reviewer: 'Assess match quality, predict outcomes, suggest optimization'
      }
    }
  ],

  citizen_idea: [
    {
      name: 'screening',
      label: { en: 'Idea Screening', ar: 'فحص الفكرة' },
      type: 'review',
      requiredRole: 'idea_moderator',
      sla_days: 2,
      selfCheckItems: [],
      reviewerChecklistItems: [
        { en: 'No duplicate ideas', ar: 'لا توجد أفكار مكررة' },
        { en: 'Category appropriate', ar: 'التصنيف مناسب' },
        { en: 'Content quality acceptable', ar: 'جودة المحتوى مقبولة' },
        { en: 'No toxic content', ar: 'لا محتوى سام' }
      ],
      aiAssistance: {
        requester: 'Classify category, detect duplicates, score priority, check toxicity',
        reviewer: 'Verify AI classification, confirm duplicates, assess quality'
      }
    },
    {
      name: 'evaluation',
      label: { en: 'Expert Evaluation', ar: 'تقييم الخبراء' },
      type: 'approval',
      requiredRole: 'idea_evaluator',
      sla_days: 7,
      selfCheckItems: [],
      reviewerChecklistItems: [
        { en: 'Feasibility scored', ar: 'الجدوى مسجلة' },
        { en: 'Impact scored', ar: 'الأثر مسجل' },
        { en: 'Cost scored', ar: 'التكلفة مسجلة' },
        { en: 'Innovation scored', ar: 'الابتكار مسجل' },
        { en: 'Alignment scored', ar: 'التوافق مسجل' },
        { en: 'Urgency scored', ar: 'الأهمية مسجلة' },
        { en: 'Scalability scored', ar: 'قابلية التوسع مسجلة' },
        { en: 'Risk scored', ar: 'المخاطر مسجلة' }
      ],
      aiAssistance: {
        requester: 'Suggest conversion path based on idea type',
        reviewer: 'Multi-criteria analysis, recommend conversion (Challenge/Solution/Pilot/R&D), consensus support'
      }
    }
  ],

  innovation_proposal: [
    {
      name: 'submission',
      label: { en: 'Proposal Submission', ar: 'تقديم المقترح' },
      type: 'submission',
      requiredRole: 'innovation_screener',
      sla_days: 3,
      selfCheckItems: [
        { en: 'Program/Challenge linked', ar: 'البرنامج/التحدي مربوط' },
        { en: 'Implementation plan complete', ar: 'خطة التنفيذ مكتملة' },
        { en: 'Budget estimated', ar: 'الميزانية مقدرة' },
        { en: 'Team identified', ar: 'الفريق محدد' },
        { en: 'Success metrics defined', ar: 'مقاييس النجاح محددة' },
        { en: 'Strategic alignment documented', ar: 'التوافق الاستراتيجي موثق' }
      ],
      reviewerChecklistItems: [
        { en: 'Completeness verified', ar: 'الاكتمال محقق' },
        { en: 'Budget realistic', ar: 'الميزانية واقعية' },
        { en: 'Team qualified', ar: 'الفريق مؤهل' },
        { en: 'Alignment confirmed', ar: 'التوافق مؤكد' },
        { en: 'No duplicates', ar: 'لا توجد مكررات' }
      ],
      aiAssistance: {
        requester: 'Validate completeness, check budget reasonableness, assess team qualifications',
        reviewer: 'Comprehensive pre-screening, detect duplicates, score strategic fit'
      }
    },
    {
      name: 'screening',
      label: { en: 'Detailed Screening', ar: 'الفحص التفصيلي' },
      type: 'review',
      requiredRole: 'innovation_screener',
      sla_days: 5,
      selfCheckItems: [],
      reviewerChecklistItems: [
        { en: 'Eligibility criteria met', ar: 'معايير الأهلية محققة' },
        { en: 'Technical feasibility', ar: 'الجدوى الفنية' },
        { en: 'Budget appropriateness', ar: 'ملاءمة الميزانية' },
        { en: 'Strategic fit', ar: 'التوافق الاستراتيجي' },
        { en: 'Team capacity', ar: 'قدرة الفريق' },
        { en: 'Risk level acceptable', ar: 'مستوى المخاطر مقبول' }
      ],
      aiAssistance: {
        requester: 'Highlight strengths, identify gaps, suggest improvements',
        reviewer: 'Multi-dimensional scoring, rank proposals, predict success probability'
      }
    },
    {
      name: 'stakeholder_alignment',
      label: { en: 'Stakeholder Alignment', ar: 'توافق أصحاب المصلحة' },
      type: 'approval',
      requiredRole: 'municipal_strategist',
      sla_days: 7,
      selfCheckItems: [
        { en: 'Municipality buy-in obtained', ar: 'موافقة البلدية حاصلة' },
        { en: 'Department alignment confirmed', ar: 'توافق القسم مؤكد' },
        { en: 'Resource commitment secured', ar: 'التزام الموارد محقق' },
        { en: 'Success criteria agreed', ar: 'معايير النجاح متفق عليها' }
      ],
      reviewerChecklistItems: [
        { en: 'Stakeholder signatures collected', ar: 'توقيعات أصحاب المصلحة مجمعة' },
        { en: 'Alignment documented', ar: 'التوافق موثق' },
        { en: 'Commitment letters received', ar: 'رسائل الالتزام مستلمة' },
        { en: 'Conflicts resolved', ar: 'النزاعات محلولة' }
      ],
      aiAssistance: {
        requester: 'Identify key stakeholders, draft alignment plan',
        reviewer: 'Assess alignment strength, flag potential conflicts'
      }
    }
  ],

  program: [
    {
      name: 'launch_approval',
      label: { en: 'Program Launch Approval', ar: 'موافقة إطلاق البرنامج' },
      type: 'approval',
      requiredRole: 'program_approver',
      sla_days: 5,
      selfCheckItems: [
        { en: 'Program design complete', ar: 'تصميم البرنامج مكتمل' },
        { en: 'Budget allocated and approved', ar: 'الميزانية مخصصة ومعتمدة' },
        { en: 'Curriculum finalized', ar: 'المنهج نهائي' },
        { en: 'Mentors/experts assigned', ar: 'الموجهون/الخبراء معينون' },
        { en: 'Infrastructure ready (venue, tools)', ar: 'البنية التحتية جاهزة (مكان، أدوات)' },
        { en: 'Application system configured', ar: 'نظام التقديم جاهز' }
      ],
      reviewerChecklistItems: [
        { en: 'Program objectives clear and achievable', ar: 'أهداف البرنامج واضحة وقابلة للتحقيق' },
        { en: 'Budget realistic and sufficient', ar: 'الميزانية واقعية وكافية' },
        { en: 'Curriculum quality high', ar: 'جودة المنهج عالية' },
        { en: 'Mentor quality and capacity adequate', ar: 'جودة وسعة الموجهين كافية' },
        { en: 'Infrastructure confirmed', ar: 'البنية التحتية مؤكدة' },
        { en: 'Launch readiness verified', ar: 'جاهزية الإطلاق محققة' }
      ],
      aiAssistance: {
        requester: 'Verify launch readiness checklist, identify missing items, suggest timeline optimization',
        reviewer: 'Assess program design quality, validate budget allocation, check mentor qualifications, predict launch success'
      }
    },
    {
      name: 'selection_approval',
      label: { en: 'Cohort Selection Approval', ar: 'موافقة اختيار الدفعة' },
      type: 'approval',
      requiredRole: 'program_manager',
      sla_days: 7,
      selfCheckItems: [
        { en: 'All applications evaluated', ar: 'كل الطلبات مقيمة' },
        { en: 'Cohort composition balanced', ar: 'تكوين الدفعة متوازن' },
        { en: 'Capacity confirmed', ar: 'السعة مؤكدة' },
        { en: 'Onboarding plan ready', ar: 'خطة التأهيل جاهزة' }
      ],
      reviewerChecklistItems: [
        { en: 'Selection criteria applied fairly', ar: 'معايير الاختيار مطبقة بعدالة' },
        { en: 'Diversity targets met', ar: 'أهداف التنوع محققة' },
        { en: 'Cohort size optimal', ar: 'حجم الدفعة مثالي' },
        { en: 'No conflicts of interest', ar: 'لا تضارب مصالح' },
        { en: 'Selection justified', ar: 'الاختيار مبرر' }
      ],
      aiAssistance: {
        requester: 'Optimize cohort composition, calculate diversity score, predict graduation rate',
        reviewer: 'Validate selection process, assess cohort quality, identify potential issues'
      }
    },
    {
      name: 'mid_review',
      label: { en: 'Mid-Program Review', ar: 'المراجعة النصفية' },
      type: 'review',
      requiredRole: 'program_manager',
      sla_days: 3,
      selfCheckItems: [
        { en: 'Engagement metrics collected', ar: 'مقاييس المشاركة مجمعة' },
        { en: 'Progress vs plan assessed', ar: 'التقدم مقابل الخطة مقيّم' },
        { en: 'Issues/risks documented', ar: 'المشاكل/المخاطر موثقة' },
        { en: 'Participant feedback gathered', ar: 'ملاحظات المشاركين مجمعة' }
      ],
      reviewerChecklistItems: [
        { en: 'Program on track', ar: 'البرنامج على المسار الصحيح' },
        { en: 'Participant engagement acceptable', ar: 'مشاركة المشاركين مقبولة' },
        { en: 'Issues being addressed', ar: 'المشاكل قيد المعالجة' },
        { en: 'Pivot needed or continue as planned', ar: 'تحويل مطلوب أو استمرار كما مخطط' }
      ],
      aiAssistance: {
        requester: 'Analyze progress data, identify at-risk participants, suggest interventions',
        reviewer: 'Assess program health, predict completion success, recommend adjustments'
      }
    },
    {
      name: 'completion_review',
      label: { en: 'Program Completion Review', ar: 'مراجعة اكتمال البرنامج' },
      type: 'approval',
      requiredRole: 'program_approver',
      sla_days: 10,
      selfCheckItems: [
        { en: 'All outcomes measured', ar: 'كل النتائج مقاسة' },
        { en: 'Impact assessment complete', ar: 'تقييم الأثر مكتمل' },
        { en: 'Lessons learned documented', ar: 'الدروس المستفادة موثقة' },
        { en: 'Alumni plan in place', ar: 'خطة الخريجين موجودة' },
        { en: 'Final report ready', ar: 'التقرير النهائي جاهز' }
      ],
      reviewerChecklistItems: [
        { en: 'Success metrics achieved', ar: 'مقاييس النجاح محققة' },
        { en: 'Impact demonstrated', ar: 'الأثر مثبت' },
        { en: 'Lessons captured', ar: 'الدروس مستخرجة' },
        { en: 'Alumni engagement planned', ar: 'مشاركة الخريجين مخطط لها' },
        { en: 'Completion justified', ar: 'الاكتمال مبرر' }
      ],
      aiAssistance: {
        requester: 'Generate impact summary, extract key lessons, calculate ROI',
        reviewer: 'Assess overall program success, validate impact claims, recommend scaling/replication'
      }
    }
  ],

  solution: [
    {
      name: 'submission',
      label: { en: 'Solution Submission', ar: 'تقديم الحل' },
      type: 'submission',
      requiredRole: 'solution_reviewer',
      sla_days: 3,
      selfCheckItems: [
        { en: 'Solution profile complete (name, description, provider)', ar: 'ملف الحل مكتمل (الاسم، الوصف، المزود)' },
        { en: 'Technical documentation attached', ar: 'التوثيق التقني مرفق' },
        { en: 'Pricing model defined', ar: 'نموذج التسعير محدد' },
        { en: 'At least one use case documented', ar: 'حالة استخدام واحدة موثقة على الأقل' }
      ],
      reviewerChecklistItems: [
        { en: 'Profile quality adequate', ar: 'جودة الملف كافية' },
        { en: 'Documentation valid and complete', ar: 'التوثيق صالح ومكتمل' },
        { en: 'Provider information legitimate', ar: 'معلومات المزود شرعية' },
        { en: 'No duplicate solutions', ar: 'لا توجد حلول مكررة' },
        { en: 'Basic compliance check passed', ar: 'فحص الامتثال الأساسي ناجح' }
      ],
      aiAssistance: {
        requester: 'Verify profile completeness, check for similar solutions, suggest documentation improvements. Calculate profile_completeness_score from required fields.',
        reviewer: 'Analyze submission quality, detect duplicates using semantic search, validate provider legitimacy, calculate documentation_quality_score, assess credential_validity. Flag if provider_legitimacy_score < 70%.'
      }
    },
    {
      name: 'technical_verification',
      label: { en: 'Technical Verification', ar: 'التحقق التقني' },
      type: 'verification',
      requiredRole: 'expert_reviewer',
      sla_days: 7,
      selfCheckItems: [
        { en: 'TRL level documented with evidence', ar: 'مستوى TRL موثق مع الأدلة' },
        { en: 'Security & privacy addressed', ar: 'الأمان والخصوصية معالجة' },
        { en: 'Scalability evidence provided', ar: 'أدلة قابلية التوسع مقدمة' },
        { en: 'Case studies or references attached', ar: 'دراسات حالة أو مراجع مرفقة' },
        { en: 'Compliance certifications uploaded', ar: 'شهادات الامتثال مرفوعة' }
      ],
      reviewerChecklistItems: [
        { en: 'Technical quality meets standards', ar: 'الجودة التقنية تلبي المعايير' },
        { en: 'Security compliance verified (data protection, PDPL)', ar: 'التحقق من امتثال الأمان (حماية البيانات، PDPL)' },
        { en: 'Integration feasibility confirmed (APIs, standards)', ar: 'جدوى التكامل مؤكدة (APIs، المعايير)' },
        { en: 'Scalability validated (load testing, architecture)', ar: 'قابلية التوسع محققة (اختبار الحمل، الهندسة)' },
        { en: 'TRL level accurate and justified', ar: 'مستوى TRL دقيق ومبرر' },
        { en: 'Performance claims substantiated', ar: 'ادعاءات الأداء مدعومة' },
        { en: 'Architecture sound and documented', ar: 'الهندسة المعمارية سليمة وموثقة' },
        { en: 'Deployment prerequisites clear', ar: 'متطلبات النشر واضحة' }
      ],
      aiAssistance: {
        requester: 'Help prepare technical verification materials, validate TRL evidence, generate security documentation checklist. Auto-assess TRL from features and maturity level.',
        reviewer: 'Expert technical verification - assess TRL accuracy, security compliance (PDPL, ISO27001), scalability architecture, integration_feasibility via API documentation, calculate security_compliance_score and integration_feasibility_score. Flag if technical_quality_score < 70% or critical security gaps found.'
      }
    },
    {
      name: 'deployment_readiness',
      label: { en: 'Deployment Readiness', ar: 'جاهزية النشر' },
      type: 'approval',
      requiredRole: 'solution_approver',
      sla_days: 5,
      selfCheckItems: [
        { en: 'Support plan documented (SLAs, contact)', ar: 'خطة الدعم موثقة (SLAs، التواصل)' },
        { en: 'Pricing competitive and justified', ar: 'التسعير تنافسي ومبرر' },
        { en: 'Deployment guide complete', ar: 'دليل النشر مكتمل' },
        { en: 'Training materials available', ar: 'مواد التدريب متاحة' }
      ],
      reviewerChecklistItems: [
        { en: 'Deployment readiness confirmed', ar: 'جاهزية النشر مؤكدة' },
        { en: 'Support quality adequate', ar: 'جودة الدعم كافية' },
        { en: 'Pricing reasonable and competitive', ar: 'التسعير معقول وتنافسي' },
        { en: 'Market ready for pilot/deployment', ar: 'السوق جاهز للتجربة/النشر' },
        { en: 'All documentation complete', ar: 'كل التوثيق مكتمل' }
      ],
      aiAssistance: {
        requester: 'Optimize deployment documentation, benchmark pricing against similar solutions, validate support plan completeness.',
        reviewer: 'Assess deployment_readiness_score (composite of support, pricing, docs), calculate support_quality_score from SLA plans, calculate pricing_competitiveness_score via market comparison, verify market_readiness_check criteria. Approve if all scores > 70%.'
      }
    },
    {
      name: 'publishing',
      label: { en: 'Marketplace Publishing', ar: 'النشر في السوق' },
      type: 'approval',
      requiredRole: 'solution_approver',
      sla_days: 2,
      selfCheckItems: [
        { en: 'Public description polished and professional', ar: 'الوصف العام محسّن واحترافي' },
        { en: 'Marketing materials ready (images, video)', ar: 'المواد التسويقية جاهزة (صور، فيديو)' },
        { en: 'Keywords optimized for search', ar: 'الكلمات المفتاحية محسّنة للبحث' }
      ],
      reviewerChecklistItems: [
        { en: 'Public content appropriate and professional', ar: 'المحتوى العام مناسب واحترافي' },
        { en: 'SEO keywords optimized', ar: 'كلمات SEO محسّنة' },
        { en: 'Ready for marketplace visibility', ar: 'جاهز للظهور في السوق' }
      ],
      aiAssistance: {
        requester: 'Optimize solution for marketplace visibility, suggest keywords, enhance public description for engagement.',
        reviewer: 'Review public-facing content quality, validate SEO optimization, confirm marketplace readiness. Auto-approve if all criteria met.'
      }
    }
  ]
  };

  // Get gate config by entity type and gate name
export function getGateConfig(entityType, gateName) {
  const configs = gateConfigs[entityType] || [];
  return configs.find(g => g.name === gateName);
}

// Get all gates for an entity type
export function getEntityGates(entityType) {
  return gateConfigs[entityType] || [];
}

// Calculate SLA due date
export function calculateSLADueDate(gate, submissionDate = new Date()) {
  const dueDate = new Date(submissionDate);
  dueDate.setDate(dueDate.getDate() + (gate.sla_days || 7));
  return dueDate;
}

// Check if approval is overdue
export function isApprovalOverdue(approval) {
  if (!approval.sla_due_date || approval.status === 'approved' || approval.status === 'rejected') {
    return false;
  }
  return new Date() > new Date(approval.sla_due_date);
}