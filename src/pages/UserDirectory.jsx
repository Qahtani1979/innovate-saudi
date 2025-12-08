import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Search, Users, Mail, Briefcase, Award, Filter, Sparkles, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';

function UserDirectory() {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list()
  });

  // Extract unique values for filters
  const allSkills = [...new Set(users.flatMap(u => u.skills || []))];
  const allDepartments = [...new Set(users.map(u => u.department).filter(Boolean))];
  const allRoles = [...new Set(users.map(u => u.role))];

  // Filter users
  const filteredUsers = users.filter(user => {
    const searchMatch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.job_title?.toLowerCase().includes(searchTerm.toLowerCase());

    const skillMatch = !skillFilter || user.skills?.includes(skillFilter);
    const roleMatch = !roleFilter || user.role === roleFilter;
    const deptMatch = !departmentFilter || user.department === departmentFilter;

    return searchMatch && skillMatch && roleMatch && deptMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-700 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '👥 User Directory', ar: '👥 دليل المستخدمين' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Find and connect with experts across the platform', ar: 'ابحث وتواصل مع الخبراء في المنصة' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{allSkills.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Unique Skills', ar: 'مهارات فريدة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{allDepartments.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Departments', ar: 'الإدارات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <Filter className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{filteredUsers.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Filtered Results', ar: 'النتائج المفلترة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t({ en: 'Search & Filter', ar: 'البحث والفلترة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search by name, email, title...', ar: 'ابحث بالاسم، البريد، المسمى...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>

            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Filter by skill', ar: 'تصفية بالمهارة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Skills</SelectItem>
                {allSkills.sort().map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Filter by role', ar: 'تصفية بالدور' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Roles</SelectItem>
                {allRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Filter by department', ar: 'تصفية بالإدارة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>All Departments</SelectItem>
                {allDepartments.sort().map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSkillFilter('');
                setRoleFilter('');
                setDepartmentFilter('');
              }}
            >
              {t({ en: 'Clear Filters', ar: 'مسح الفلاتر' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-slate-900 truncate">
                    {user.full_name}
                  </h3>
                  <p className="text-sm text-slate-600 truncate">{user.job_title || user.role}</p>
                  {user.department && (
                    <p className="text-xs text-slate-500 mt-1 truncate">{user.department}</p>
                  )}
                </div>
              </div>

              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {user.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {user.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {user.areas_of_expertise && user.areas_of_expertise.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">
                    {t({ en: 'Expertise:', ar: 'الخبرة:' })}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {user.areas_of_expertise.slice(0, 2).map((area, idx) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-700 text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <Link to={createPageUrl(`UserProfile?email=${user.email}`)}>
                    {t({ en: 'View Profile', ar: 'عرض الملف' })}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`mailto:${user.email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No users found matching your criteria', ar: 'لم يتم العثور على مستخدمين' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(UserDirectory, { requiredPermissions: [] });