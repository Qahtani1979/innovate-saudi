import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from "@/components/ui/button";
import {
  Network,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Globe,
  User,
  LogOut,
  Sparkles,
  Target,
  Shield,
  Microscope,
  Building2,
  Rocket,
  Calendar
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import ArabicFontOptimizer from './components/ui/ArabicFontOptimizer';
import AIAssistant from './components/AIAssistant';
import PortalSwitcher from './components/layout/PortalSwitcher';
import PersonaHeader from './components/layout/PersonaHeader';
import PersonaSidebar from './components/layout/PersonaSidebar';
import { Badge } from "@/components/ui/badge";
import { usePermissions } from './components/permissions/usePermissions';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';
import { useAuth } from '@/lib/AuthContext';
import OnboardingWizard from './components/onboarding/OnboardingWizard';

function LayoutContent({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { language, isRTL, toggleLanguage } = useLanguage();
  const { user, hasPermission, hasAnyPermission, isAdmin, isDeputyship, isMunicipality } = usePermissions();
  const { persona, menuVisibility, defaultDashboard } = usePersonaRouting();
  const { isAuthenticated, userProfile, checkAuth, logout } = useAuth();

  // Show onboarding wizard for new users who haven't completed it
  useEffect(() => {
    if (isAuthenticated && userProfile) {
      if (userProfile.onboarding_completed === true) {
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, userProfile]);


  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setSearchOpen(true);
    try {
      const [challenges, pilots, solutions, programs] = await Promise.all([
        base44.entities.Challenge.filter({ title_en: { $regex: query, $options: 'i' } }, '-created_date', 3),
        base44.entities.Pilot.filter({ title_en: { $regex: query, $options: 'i' } }, '-created_date', 3),
        base44.entities.Solution.filter({ name_en: { $regex: query, $options: 'i' } }, '-created_date', 3),
        base44.entities.Program.filter({ name_en: { $regex: query, $options: 'i' } }, '-created_date', 2)
      ]);

      setSearchResults([
        ...challenges.map(c => ({ type: 'Challenge', name: c.title_en || c.title_ar, id: c.id, page: 'ChallengeDetail' })),
        ...pilots.map(p => ({ type: 'Pilot', name: p.title_en || p.title_ar, id: p.id, page: 'PilotDetail' })),
        ...solutions.map(s => ({ type: 'Solution', name: s.name_en || s.name_ar, id: s.id, page: 'SolutionDetail' })),
        ...programs.map(p => ({ type: 'Program', name: p.name_en || p.name_ar, id: p.id, page: 'ProgramDetail' }))
      ]);
    } catch (error) {
      console.error('Search error:', error);
    }
  };


  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        :root {
          --primary: 214 100% 25%;
          --primary-foreground: 0 0% 100%;
          --accent: 174 72% 45%;
          --accent-foreground: 0 0% 100%;
          --success: 142 71% 45%;
          --warning: 38 92% 50%;
          --destructive: 0 84% 60%;
        }
        
        .nav-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-item:hover {
          transform: translateX(${isRTL ? '-4px' : '4px'});
        }
        
        .active-nav {
          background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
          background-size: 1000px 100%;
        }
      `}</style>

      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="flex h-16 items-center gap-2 md:gap-4 px-3 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-slate-100 flex-shrink-0"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm md:text-lg font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
                {language === 'en' ? 'Saudi Innovates' : 'الابتكار السعودي'}
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">
                {language === 'en' ? 'National Municipal Innovation Platform' : 'المنصة الوطنية للابتكار البلدي'}
              </p>
            </div>
          </div>

          <div className="flex-1 flex justify-center max-w-2xl mx-auto relative hidden lg:flex">
            <div className="relative w-full">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setSearchOpen(true)}
                placeholder={language === 'en' ? 'Search challenges, pilots, solutions...' : 'ابحث عن التحديات، التجارب، الحلول...'}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
              />
              
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-96 overflow-y-auto z-50">
                  {searchResults.map((result, idx) => (
                    <Link
                      key={idx}
                      to={createPageUrl(result.page) + `?id=${result.id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <Badge className="text-xs">{result.type}</Badge>
                      <span className="text-sm text-slate-900 flex-1">{result.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden md:block">
              <PortalSwitcher user={user} currentPortal="home" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 md:gap-2 px-2 md:px-4">
                  <Network className="h-4 w-4" />
                  <span className="text-xs md:text-sm hidden sm:inline">{language === 'en' ? 'Portals' : 'البوابات'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
                {isAdmin && (
                  <Link to={createPageUrl('ExecutiveDashboard')}>
                    <DropdownMenuItem>
                      <Target className="mr-2 h-4 w-4 text-purple-600" />
                      {language === 'en' ? 'Executive' : 'القيادة'}
                    </DropdownMenuItem>
                  </Link>
                )}
                {isAdmin && (
                  <Link to={createPageUrl('AdminPortal')}>
                    <DropdownMenuItem>
                      <Shield className="mr-2 h-4 w-4 text-blue-600" />
                      {language === 'en' ? 'Admin' : 'الإدارة'}
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link to={createPageUrl('MunicipalityDashboard')}>
                  <DropdownMenuItem>
                    <Building2 className="mr-2 h-4 w-4 text-green-600" />
                    {language === 'en' ? 'Municipality' : 'البلدية'}
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl('StartupDashboard')}>
                  <DropdownMenuItem>
                    <Rocket className="mr-2 h-4 w-4 text-orange-600" />
                    {language === 'en' ? 'Startup' : 'الشركات'}
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl('AcademiaDashboard')}>
                  <DropdownMenuItem>
                    <Microscope className="mr-2 h-4 w-4 text-indigo-600" />
                    {language === 'en' ? 'Academia' : 'الأكاديميين'}
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <Link to={createPageUrl('ProgramOperatorPortal')}>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4 text-pink-600" />
                      {language === 'en' ? 'Program Operator' : 'مشغل البرامج'}
                    </DropdownMenuItem>
                  </Link>
                )}
                <Link to={createPageUrl('PublicPortal')}>
                  <DropdownMenuItem>
                    <Globe className="mr-2 h-4 w-4 text-slate-600" />
                    {language === 'en' ? 'Public' : 'العامة'}
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hover:bg-slate-100 flex-shrink-0 gap-2 px-3"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">{language === 'en' ? 'عربي' : 'EN'}</span>
            </Button>

            <Link to={createPageUrl('NotificationCenter')}>
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 flex-shrink-0">
                <Bell className="h-4 md:h-5 w-4 md:w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
            </Link>

            {/* Persona Badge */}
            <div className="hidden lg:block">
              <PersonaHeader size="small" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 md:gap-2 hover:bg-slate-100 px-2 md:px-4">
                  <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                    <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                  <span className="text-xs md:text-sm font-medium hidden sm:inline truncate max-w-[100px] md:max-w-none">{user?.full_name || 'User'}</span>
                  <ChevronDown className="h-3 md:h-4 w-3 md:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
                <Link to={createPageUrl('UserProfile')}>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    {language === 'en' ? 'Profile' : 'الملف الشخصي'}
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl('Settings')}>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    {language === 'en' ? 'Settings' : 'الإعدادات'}
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {language === 'en' ? 'Logout' : 'تسجيل الخروج'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Persona-specific Sidebar */}
        <PersonaSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global AI Assistant */}
      <AIAssistant context={{ page: currentPageName }} />

      {/* Onboarding Wizard for new users */}
      {showOnboarding && (
        <OnboardingWizard 
          onComplete={() => {
            setShowOnboarding(false);
            checkAuth?.();
          }}
          onSkip={() => {
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}

export default function Layout(props) {
  return <LayoutContent {...props} />;
}