
import { useTheme } from '@/contexts/ThemeContext';
import { useExpense } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, Trash2, Moon, Sun, Database, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { transactions, categories } = useExpense();

  const exportData = () => {
    const data = {
      transactions,
      categories,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully!');
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          
          if (data.transactions && data.categories) {
            localStorage.setItem('expense-tracker-transactions', JSON.stringify(data.transactions));
            localStorage.setItem('expense-tracker-categories', JSON.stringify(data.categories));
            
            toast.success('Data imported successfully! Please refresh the page.');
          } else {
            toast.error('Invalid file format');
          }
        } catch (error) {
          toast.error('Error importing data: Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('expense-tracker-transactions');
      localStorage.removeItem('expense-tracker-categories');
      toast.success('All data cleared! Please refresh the page.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const dataSize = new Blob([JSON.stringify({ transactions, categories })]).size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-base font-medium">
                Dark Mode
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Switch between light and dark themes
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {transactions.length}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Transactions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {categories.length}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Categories</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatFileSize(dataSize)}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Data Size</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Backup & Restore</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Export your data for backup or import data from a previous backup
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={exportData} className="flex-1 gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button onClick={importData} variant="outline" className="flex-1 gap-2">
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Permanently delete all your data. This action cannot be undone.
              </p>
              <Button
                onClick={clearAllData}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Expense Tracker</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Version 1.0.0 - A modern expense tracking application
              </p>
            </div>
            <div>
              <h4 className="font-medium">Features</h4>
              <ul className="text-sm text-slate-500 dark:text-slate-400 list-disc list-inside space-y-1">
                <li>Track income and expenses</li>
                <li>Categorize transactions</li>
                <li>Visual spending analytics</li>
                <li>Dark mode support</li>
                <li>Data export/import</li>
                <li>Responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
