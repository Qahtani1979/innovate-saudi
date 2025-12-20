import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';

function AuthenticatedUserMenu({ showDashboardLink, showName, variant, user, logout }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  
  const defaultDashboard = '/dashboard';
  const dashboardLabel = { en: 'Dashboard', ar: 'لوحة التحكم' };

  const handleLogout = async () => {
    // Just call logout - it handles the redirect internally
    await logout(true);
    // Don't navigate here - logout() handles redirect to /Auth
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.full_name;
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.full_name || t({ en: 'User', ar: 'مستخدم' });
  };

  const iconMargin = isRTL ? 'ml-2' : 'mr-2';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`gap-2 ${variant === 'compact' ? 'px-2' : 'px-2 sm:px-3'}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white text-sm font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {showName && (
            <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
              {getUserName()}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56 bg-background">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{getUserName()}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />

        {showDashboardLink && (
          <DropdownMenuItem asChild>
            <Link to={defaultDashboard} className="cursor-pointer">
              <LayoutDashboard className={`h-4 w-4 ${iconMargin}`} />
              {language === 'en' ? dashboardLabel.en : dashboardLabel.ar}
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link to={createPageUrl('UserProfile')} className="cursor-pointer">
            <User className={`h-4 w-4 ${iconMargin}`} />
            {t({ en: 'My Profile', ar: 'ملفي الشخصي' })}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to={createPageUrl('Settings')} className="cursor-pointer">
            <Settings className={`h-4 w-4 ${iconMargin}`} />
            {t({ en: 'Settings', ar: 'الإعدادات' })}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
          <LogOut className={`h-4 w-4 ${iconMargin}`} />
          {t({ en: 'Sign Out', ar: 'تسجيل الخروج' })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UserAvatarMenu({ 
  showDashboardLink = true, 
  showName = true,
  variant = 'default'
}) {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <AuthenticatedUserMenu 
      showDashboardLink={showDashboardLink}
      showName={showName}
      variant={variant}
      user={user}
      logout={logout}
    />
  );
}
