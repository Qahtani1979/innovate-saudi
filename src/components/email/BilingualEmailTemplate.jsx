
/**
 * Bilingual email templates
 */
export const emailTemplates = {
  welcome: {
    en: {
      subject: 'Welcome to Saudi Innovates',
      body: `
        <h1>Welcome to Saudi Innovates!</h1>
        <p>Dear {{userName}},</p>
        <p>Thank you for joining the National Municipal Innovation Platform.</p>
        <p>Your account has been created successfully.</p>
        <p><a href="{{loginUrl}}">Get Started</a></p>
      `
    },
    ar: {
      subject: 'مرحباً بك في الابتكار السعودي',
      body: `
        <h1 dir="rtl">مرحباً بك في الابتكار السعودي!</h1>
        <p dir="rtl">عزيزي {{userName}}،</p>
        <p dir="rtl">شكراً لانضمامك إلى المنصة الوطنية للابتكار البلدي.</p>
        <p dir="rtl">تم إنشاء حسابك بنجاح.</p>
        <p dir="rtl"><a href="{{loginUrl}}">ابدأ الآن</a></p>
      `
    }
  },
  challenge_approved: {
    en: {
      subject: 'Challenge Approved - {{challengeTitle}}',
      body: `
        <h2>Challenge Approved</h2>
        <p>Your challenge "{{challengeTitle}}" has been approved.</p>
        <p><a href="{{challengeUrl}}">View Challenge</a></p>
      `
    },
    ar: {
      subject: 'تمت الموافقة على التحدي - {{challengeTitle}}',
      body: `
        <h2 dir="rtl">تمت الموافقة على التحدي</h2>
        <p dir="rtl">تمت الموافقة على تحديك "{{challengeTitle}}".</p>
        <p dir="rtl"><a href="{{challengeUrl}}">عرض التحدي</a></p>
      `
    }
  },
  task_reminder: {
    en: {
      subject: 'Task Due Soon - {{taskTitle}}',
      body: `
        <h2>Task Reminder</h2>
        <p>Task "{{taskTitle}}" is due on {{dueDate}}.</p>
        <p><a href="{{taskUrl}}">View Task</a></p>
      `
    },
    ar: {
      subject: 'مهمة قريبة الموعد - {{taskTitle}}',
      body: `
        <h2 dir="rtl">تذكير بالمهمة</h2>
        <p dir="rtl">المهمة "{{taskTitle}}" مستحقة في {{dueDate}}.</p>
        <p dir="rtl"><a href="{{taskUrl}}">عرض المهمة</a></p>
      `
    }
  }
};

export function getBilingualEmail(templateKey, params, language = 'en') {
  const template = emailTemplates[templateKey];
  if (!template) return { subject: '', body: '' };

  const localized = template[language] || template.en;
  
  let subject = localized.subject;
  let body = localized.body;

  Object.keys(params).forEach(key => {
    const placeholder = `{{${key}}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), params[key]);
    body = body.replace(new RegExp(placeholder, 'g'), params[key]);
  });

  return { subject, body };
}
