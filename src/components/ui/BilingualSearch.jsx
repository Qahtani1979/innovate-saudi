import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

/**
 * Bilingual search that queries both EN and AR fields
 */
export default function BilingualSearch({ onSearch, placeholder }) {
  const [query, setQuery] = React.useState('');

  const handleSearch = (value) => {
    setQuery(value);
    
    // Return bilingual search filters
    const searchFilter = {
      $or: [
        { name_en: { $regex: value, $options: 'i' } },
        { name_ar: { $regex: value, $options: 'i' } },
        { title_en: { $regex: value, $options: 'i' } },
        { title_ar: { $regex: value, $options: 'i' } },
        { description_en: { $regex: value, $options: 'i' } },
        { description_ar: { $regex: value, $options: 'i' } }
      ]
    };

    onSearch(searchFilter, value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder || 'Search in both languages...'}
        className="pl-10"
      />
    </div>
  );
}
