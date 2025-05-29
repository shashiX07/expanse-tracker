
import { useState, useEffect } from 'react';
import { ExpenseProvider } from '@/contexts/ExpenseContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Transactions from '@/components/Transactions';
import Categories from '@/components/Categories';
import Settings from '@/components/Settings';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'categories':
        return <Categories />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <ExpenseProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
          <div className="flex h-screen">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto p-6">
                {renderActiveView()}
              </div>
            </main>
          </div>
        </div>
      </ExpenseProvider>
    </ThemeProvider>
  );
};

export default Index;
