import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Home, CreditCard, Tag, Settings, Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar = ({ activeView, setActiveView }: SidebarProps) => {
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Check window size on mount and when it changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 768); // Open by default on medium screens and larger
    };
    
    // Set initial state
    checkScreenSize();
    
    // Add event listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button - Fixed position for small screens */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 md:hidden shadow-md"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay that appears behind the sidebar on small screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed h-full z-50 md:relative transition-all duration-300 ease-in-out",
          "w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ExpenseTracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your finances
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-12 text-left",
                  activeView === item.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                )}
                onClick={() => {
                  setActiveView(item.id);
                  // Close sidebar after selection on mobile
                  if (window.innerWidth < 768) {
                    setIsOpen(false);
                  }
                }}
              >
                <Icon size={20} />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full gap-2"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
