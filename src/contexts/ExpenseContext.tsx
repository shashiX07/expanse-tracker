
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  isRecurring?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface ExpenseContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getBalance: () => number;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#FF6B6B', icon: '🍕' },
  { id: '2', name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
  { id: '3', name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
  { id: '4', name: 'Entertainment', color: '#96CEB4', icon: '🎬' },
  { id: '5', name: 'Bills & Utilities', color: '#FECA57', icon: '💡' },
  { id: '6', name: 'Health & Fitness', color: '#FF9FF3', icon: '💊' },
  { id: '7', name: 'Salary', color: '#54A0FF', icon: '💰' },
  { id: '8', name: 'Business', color: '#5F27CD', icon: '💼' },
];

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('expense-tracker-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('expense-tracker-categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-categories', JSON.stringify(categories));
  }, [categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(transaction =>
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updatedCategory: Partial<Category>) => {
    setCategories(prev =>
      prev.map(category =>
        category.id === id ? { ...category, ...updatedCategory } : category
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        getBalance,
        getTotalIncome,
        getTotalExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
