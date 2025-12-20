import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === 'light' && <Sun className="h-5 w-5" />}
          {theme === 'dark' && <Moon className="h-5 w-5" />}
          {theme === 'auto' && <Monitor className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('auto')}>
          <Monitor className="h-4 w-4 mr-2" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Dark mode CSS variables - add to globals.css or Layout
export const darkModeStyles = `
  .dark {
    --background: 222 47% 11%;
    --foreground: 213 31% 91%;
    --card: 222 47% 11%;
    --card-foreground: 213 31% 91%;
    --popover: 222 47% 11%;
    --popover-foreground: 213 31% 91%;
    --primary: 214 100% 50%;
    --primary-foreground: 222 47% 11%;
    --secondary: 217 33% 17%;
    --secondary-foreground: 213 31% 91%;
    --muted: 217 33% 17%;
    --muted-foreground: 213 20% 65%;
    --accent: 217 33% 17%;
    --accent-foreground: 213 31% 91%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 213 31% 91%;
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 214 100% 50%;
  }
`;