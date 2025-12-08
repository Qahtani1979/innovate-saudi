import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { 
  Shield, Building2, Lightbulb, Microscope, Calendar, Target, Globe, ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function PortalSwitcher({ user, currentPortal }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activePortal, setActivePortal] = useState(currentPortal || 'home');

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  // Map user roles to available portals
  const portals = [
    {
      id: 'executive',
      icon: Target,
      name: { en: 'Executive Portal', ar: 'بوابة القيادة' },
      color: 'purple',
      page: 'ExecutiveDashboard',
      requiredRoles: ['Executive Leadership', 'Super Admin']
    },
    {
      id: 'admin',
      icon: Shield,
      name: { en: 'Admin Portal', ar: 'بوابة الإدارة' },
      color: 'blue',
      page: 'AdminPortal',
      requiredRoles: ['Super Admin', 'Platform Administrator', 'GDISB Strategy Lead']
    },
    {
      id: 'municipality',
      icon: Building2,
      name: { en: 'Municipality Hub', ar: 'مركز البلدية' },
      color: 'green',
      page: 'MunicipalityDashboard',
      requiredRoles: ['Municipality Director', 'Municipality Innovation Officer']
    },
    {
      id: 'startup',
      icon: Lightbulb,
      name: { en: 'Startup Portal', ar: 'بوابة الشركات' },
      color: 'orange',
      page: 'StartupDashboard',
      requiredRoles: ['Startup/Provider', 'Solution Provider']
    },
    {
      id: 'academia',
      icon: Microscope,
      name: { en: 'Academia Portal', ar: 'بوابة الجامعات' },
      color: 'indigo',
      page: 'AcademiaDashboard',
      requiredRoles: ['Researcher/Academic', 'Research Lead']
    },
    {
      id: 'program',
      icon: Calendar,
      name: { en: 'Program Operator', ar: 'مشغل البرامج' },
      color: 'pink',
      page: 'ProgramOperatorPortal',
      requiredRoles: ['Program Operator']
    },
    {
      id: 'public',
      icon: Globe,
      name: { en: 'Public Portal', ar: 'البوابة العامة' },
      color: 'slate',
      page: 'PublicPortal',
      requiredRoles: [] // Available to all
    }
  ];

  // Get user's role names
  const userRoleNames = (user?.assigned_roles || [])
    .map(roleId => roles.find(r => r.id === roleId)?.name)
    .filter(Boolean);

  // Filter portals user has access to
  const availablePortals = portals.filter(portal => 
    portal.requiredRoles.length === 0 || 
    portal.requiredRoles.some(role => userRoleNames.includes(role))
  );

  // Store last portal in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lastPortal');
    if (stored && availablePortals.some(p => p.id === stored)) {
      setActivePortal(stored);
    }
  }, []);

  const handlePortalSwitch = (portalId, portalPage) => {
    setActivePortal(portalId);
    localStorage.setItem('lastPortal', portalId);
    navigate(createPageUrl(portalPage));
  };

  // Only show if user has access to multiple portals
  if (availablePortals.length <= 1) {
    return null;
  }

  const current = availablePortals.find(p => p.id === activePortal) || availablePortals[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[180px]">
          <CurrentIcon className={`h-4 w-4 text-${current.color}-600`} />
          <span className="font-medium">{current.name[t.language || 'en']}</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-slate-500">
          {t({ en: 'Switch Portal', ar: 'تبديل البوابة' })}
        </div>
        <DropdownMenuSeparator />
        {availablePortals.map((portal) => {
          const Icon = portal.icon;
          const isActive = portal.id === activePortal;

          return (
            <DropdownMenuItem
              key={portal.id}
              onClick={() => handlePortalSwitch(portal.id, portal.page)}
              className={isActive ? 'bg-slate-100' : ''}
            >
              <Icon className={`mr-3 h-4 w-4 text-${portal.color}-600`} />
              <span className="flex-1">{portal.name[t.language || 'en']}</span>
              {isActive && (
                <Badge variant="outline" className="text-xs">
                  {t({ en: 'Active', ar: 'نشط' })}
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}