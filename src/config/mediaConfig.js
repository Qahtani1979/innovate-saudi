// Storage bucket configuration for media management
export const STORAGE_BUCKETS = {
  uploads: { label: { en: 'General Uploads', ar: 'الرفعات العامة' }, public: true },
  challenges: { label: { en: 'Challenges', ar: 'التحديات' }, public: true },
  solutions: { label: { en: 'Solutions', ar: 'الحلول' }, public: true },
  pilots: { label: { en: 'Pilots', ar: 'المشاريع التجريبية' }, public: true },
  programs: { label: { en: 'Programs', ar: 'البرامج' }, public: true },
  'rd-projects': { label: { en: 'R&D Projects', ar: 'مشاريع البحث والتطوير' }, public: true },
  organizations: { label: { en: 'Organizations', ar: 'المنظمات' }, public: true },
  knowledge: { label: { en: 'Knowledge Base', ar: 'قاعدة المعرفة' }, public: true },
  events: { label: { en: 'Events', ar: 'الفعاليات' }, public: true },
  avatars: { label: { en: 'Avatars', ar: 'الصور الشخصية' }, public: true },
  'cv-uploads': { label: { en: 'CVs & Resumes', ar: 'السير الذاتية' }, public: false },
  temp: { label: { en: 'Temporary', ar: 'مؤقت' }, public: false },
};

export const FILE_CATEGORIES = [
  { value: 'primary', label: { en: 'Primary/Hero', ar: 'رئيسي' } },
  { value: 'gallery', label: { en: 'Gallery', ar: 'معرض' } },
  { value: 'document', label: { en: 'Document', ar: 'مستند' } },
  { value: 'attachment', label: { en: 'Attachment', ar: 'مرفق' } },
];

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileType = (filename) => {
  const ext = filename?.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return 'audio';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext)) return 'document';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'spreadsheet';
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'presentation';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'archive';
  return 'other';
};

export const getMimeCategory = (mimeType) => {
  if (!mimeType) return 'other';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  return 'other';
};
