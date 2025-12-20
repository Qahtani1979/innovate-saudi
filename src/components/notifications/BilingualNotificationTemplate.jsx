
/**
 * Bilingual notification templates
 */
export const bilingualTemplates = {
  challenge_approved: {
    en: {
      title: 'Challenge Approved',
      body: 'Your challenge "{{challengeTitle}}" has been approved and published.'
    },
    ar: {
      title: 'تمت الموافقة على التحدي',
      body: 'تمت الموافقة على تحديك "{{challengeTitle}}" ونشره.'
    }
  },
  pilot_milestone: {
    en: {
      title: 'Pilot Milestone Reached',
      body: 'Pilot "{{pilotTitle}}" reached milestone: {{milestoneName}}'
    },
    ar: {
      title: 'تم الوصول إلى معلم التجربة',
      body: 'وصلت التجربة "{{pilotTitle}}" إلى معلم: {{milestoneName}}'
    }
  },
  task_assigned: {
    en: {
      title: 'New Task Assigned',
      body: 'You have been assigned task: {{taskTitle}}'
    },
    ar: {
      title: 'مهمة جديدة مسندة',
      body: 'تم تعيين مهمة لك: {{taskTitle}}'
    }
  },
  approval_pending: {
    en: {
      title: 'Approval Required',
      body: '{{entityType}} "{{entityName}}" requires your approval'
    },
    ar: {
      title: 'موافقة مطلوبة',
      body: '{{entityType}} "{{entityName}}" يتطلب موافقتك'
    }
  }
};

export function getBilingualNotification(templateKey, params, language = 'en') {
  const template = bilingualTemplates[templateKey];
  if (!template) return { title: '', body: '' };

  const localized = template[language] || template.en;
  
  let title = localized.title;
  let body = localized.body;

  // Replace params
  Object.keys(params).forEach(key => {
    const placeholder = `{{${key}}}`;
    title = title.replace(placeholder, params[key]);
    body = body.replace(placeholder, params[key]);
  });

  return { title, body };
}