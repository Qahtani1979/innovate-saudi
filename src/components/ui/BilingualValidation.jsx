import { useLanguage } from '../LanguageContext';

/**
 * Bilingual validation error messages
 */
export const validationMessages = {
  required: {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب'
  },
  email: {
    en: 'Invalid email format',
    ar: 'تنسيق البريد الإلكتروني غير صحيح'
  },
  minLength: (min) => ({
    en: `Minimum ${min} characters required`,
    ar: `الحد الأدنى ${min} أحرف مطلوب`
  }),
  maxLength: (max) => ({
    en: `Maximum ${max} characters allowed`,
    ar: `الحد الأقصى ${max} حرف مسموح`
  }),
  number: {
    en: 'Must be a number',
    ar: 'يجب أن يكون رقماً'
  },
  url: {
    en: 'Invalid URL format',
    ar: 'تنسيق الرابط غير صحيح'
  },
  date: {
    en: 'Invalid date',
    ar: 'تاريخ غير صحيح'
  },
  phone: {
    en: 'Invalid phone number',
    ar: 'رقم الهاتف غير صحيح'
  }
};

export function useValidation() {
  const { language } = useLanguage();

  const getMessage = (key, ...args) => {
    const msg = typeof validationMessages[key] === 'function' 
      ? validationMessages[key](...args)
      : validationMessages[key];
    return msg[language] || msg.en;
  };

  return { getMessage };
}

/**
 * Bilingual toast messages
 */
export const toastMessages = {
  success: {
    saved: { en: 'Saved successfully', ar: 'تم الحفظ بنجاح' },
    created: { en: 'Created successfully', ar: 'تم الإنشاء بنجاح' },
    updated: { en: 'Updated successfully', ar: 'تم التحديث بنجاح' },
    deleted: { en: 'Deleted successfully', ar: 'تم الحذف بنجاح' },
    approved: { en: 'Approved', ar: 'تمت الموافقة' },
    rejected: { en: 'Rejected', ar: 'تم الرفض' },
    sent: { en: 'Sent successfully', ar: 'تم الإرسال بنجاح' }
  },
  error: {
    generic: { en: 'Something went wrong', ar: 'حدث خطأ ما' },
    loadFailed: { en: 'Failed to load data', ar: 'فشل تحميل البيانات' },
    saveFailed: { en: 'Failed to save', ar: 'فشل الحفظ' },
    unauthorized: { en: 'Unauthorized', ar: 'غير مصرح' },
    notFound: { en: 'Not found', ar: 'غير موجود' }
  }
};

export function useToast() {
  const { language } = useLanguage();

  const success = (key) => {
    const msg = toastMessages.success[key];
    return msg ? msg[language] : key;
  };

  const error = (key) => {
    const msg = toastMessages.error[key];
    return msg ? msg[language] : key;
  };

  return { success, error };
}
