
import { useExpense } from '@/contexts/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { format, subDays, isAfter } from 'date-fns';

const Dashboard = () => {
  const { transactions, categories, getBalance, getTotalIncome, getTotalExpenses } = useExpense();

  const balance = getBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();

  // Recent transactions (last 7 days)
  const recentTransactions = transactions
    .filter(t => isAfter(new Date(t.date), subDays(new Date(), 7)))
    .slice(0, 5);

  // Category spending data
  const categoryData = categories.map(category => {
    const categoryExpenses = transactions
      .filter(t => t.category === category.name && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category.name,
      value: categoryExpenses,
      color: category.color,
      icon: category.icon,
    };
  }).filter(cat => cat.value > 0);

  // Monthly trend data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subDays(new Date(), i * 30);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthIncome = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'income' && tDate >= monthStart && tDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= monthStart && tDate <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      month: format(date, 'MMM'),
      income: monthIncome,
      expenses: monthExpenses,
    };
  }).reverse();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Total Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${balance >= 0 
          ? 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700' 
          : 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${balance >= 0 
              ? 'text-blue-800 dark:text-blue-200' 
              : 'text-orange-800 dark:text-orange-200'
            }`}>
              Balance
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${balance >= 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-orange-600 dark:text-orange-400'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 
              ? 'text-blue-900 dark:text-blue-100' 
              : 'text-orange-900 dark:text-orange-100'
            }`}>
              {formatCurrency(balance)}
            </div>
            <p className={`text-xs ${balance >= 0 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-orange-600 dark:text-orange-400'
            }`}>
              {balance >= 0 ? 'Healthy balance' : 'Budget deficit'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.icon} {category.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-500 dark:text-slate-400">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {transaction.category} • {format(new Date(transaction.date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
              No recent transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
