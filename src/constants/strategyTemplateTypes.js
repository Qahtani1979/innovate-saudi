/**
 * Centralized Strategy Template Types
 * Single source of truth for template type definitions
 */

import { Lightbulb, Zap, Leaf, Building2, Globe, Users } from 'lucide-react';

export const STRATEGY_TEMPLATE_TYPES = [
  { 
    id: 'innovation', 
    name_en: 'Innovation Strategy', 
    name_ar: 'استراتيجية الابتكار',
    icon: Lightbulb,
    color: 'bg-amber-500'
  },
  { 
    id: 'digital_transformation', 
    name_en: 'Digital Transformation', 
    name_ar: 'التحول الرقمي',
    icon: Zap,
    color: 'bg-blue-500'
  },
  { 
    id: 'sustainability', 
    name_en: 'Sustainability', 
    name_ar: 'الاستدامة',
    icon: Leaf,
    color: 'bg-green-500'
  },
  { 
    id: 'sector_specific', 
    name_en: 'Sector Specific', 
    name_ar: 'خاص بالقطاع',
    icon: Building2,
    color: 'bg-purple-500'
  },
  { 
    id: 'municipality', 
    name_en: 'Municipality Scale', 
    name_ar: 'نطاق البلدية',
    icon: Globe,
    color: 'bg-cyan-500'
  },
  { 
    id: 'smart_city', 
    name_en: 'Smart City', 
    name_ar: 'المدينة الذكية',
    icon: Zap,
    color: 'bg-indigo-500'
  },
  { 
    id: 'citizen_services', 
    name_en: 'Citizen Services', 
    name_ar: 'خدمات المواطنين',
    icon: Users,
    color: 'bg-rose-500'
  }
];

export const TEMPLATE_CATEGORIES = [
  { id: 'system', name_en: 'Official Templates', name_ar: 'القوالب الرسمية' },
  { id: 'community', name_en: 'Community', name_ar: 'المجتمع' },
  { id: 'organization', name_en: 'Organization', name_ar: 'المنظمة' },
  { id: 'personal', name_en: 'Personal', name_ar: 'شخصي' }
];

export const getTemplateTypeInfo = (typeId) => 
  STRATEGY_TEMPLATE_TYPES.find(t => t.id === typeId);

export const getTemplateCategoryInfo = (categoryId) => 
  TEMPLATE_CATEGORIES.find(c => c.id === categoryId);
