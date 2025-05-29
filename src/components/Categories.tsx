import { useState } from 'react';
import { useExpense, Category } from '@/contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Palette } from 'lucide-react';

const Categories = () => {
  const { categories, addCategory, updateCategory, deleteCategory, transactions } = useExpense();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    color: '#6B73FF',
    icon: '📁',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#6B73FF',
      icon: '📁',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.color || !formData.icon) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } else {
      addCategory(formData);
      setIsAddDialogOpen(false);
    }
    
    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string, categoryName: string) => {
    const transactionsInCategory = transactions.filter(t => t.category === categoryName);
    
    if (transactionsInCategory.length > 0) {
      if (!window.confirm(`This category has ${transactionsInCategory.length} transactions. Deleting it will remove the category from those transactions. Are you sure?`)) {
        return;
      }
    }
    
    deleteCategory(id);
  };

  const getCategoryUsage = (categoryName: string) => {
    return transactions.filter(t => t.category === categoryName).length;
  };

  const getCategorySpending = (categoryName: string) => {
    return transactions
      .filter(t => t.category === categoryName && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A6F', '#C44569', '#3C40C6', '#2ED573',
  ];

  const predefinedIcons = [
    '🍕', '🚗', '🛍️', '🎬', '💡', '💊', '💰', '💼', '🏠', '✈️',
    '📱', '👕', '⛽', '🎓', '🐕', '🎸', '📚', '💻', '🏥', '🍷',
  ];

  const CategoryForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          placeholder="Enter category name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label>Icon</Label>
        <div className="grid grid-cols-10 gap-2 mt-2 p-4 border rounded-lg">
          {predefinedIcons.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`w-8 h-8 text-lg hover:bg-slate-100 dark:hover:bg-slate-700 rounded ${
                formData.icon === icon ? 'bg-blue-100 dark:bg-blue-900' : ''
              }`}
              onClick={() => setFormData({ ...formData, icon })}
            >
              {icon}
            </button>
          ))}
        </div>
        <Input
          placeholder="Or enter custom emoji"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          className="mt-2"
          maxLength={2}
        />
      </div>

      <div>
        <Label>Color</Label>
        <div className="grid grid-cols-5 gap-2 mt-2 p-4 border rounded-lg">
          {predefinedColors.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-slate-900 dark:border-white' : 'border-slate-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
        <Input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="mt-2 h-10"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {editingCategory ? 'Update Category' : 'Add Category'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingCategory(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Categories</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const usage = getCategoryUsage(category.name);
          const spending = getCategorySpending(category.name);
          
          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {usage} transaction{usage !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Total Spent</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(spending)}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: category.color,
                        width: usage > 0 ? `${Math.min((spending / 1000) * 100, 100)}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Palette className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Create your first category to start organizing your transactions
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
