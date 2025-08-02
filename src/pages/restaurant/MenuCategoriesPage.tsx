import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Image, Eye, EyeOff } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { MenuCategory } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const MenuCategoriesPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    active: true,
    image: ''
  });

  useEffect(() => {
    if (currentRestaurant) {
      loadCategories();
    }
  }, [currentRestaurant]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await sdk.queryBuilder<MenuCategory>('menuCategories')
        .where(cat => cat.restaurantId === currentRestaurant?.id)
        .sort('displayOrder')
        .exec();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load menu categories:', error);
      toast.error('Failed to load menu categories');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      displayOrder: categories.length,
      active: true,
      image: ''
    });
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      if (editingCategory) {
        await sdk.update('menuCategories', editingCategory.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Category updated successfully!');
      } else {
        await sdk.insert<MenuCategory>('menuCategories', {
          ...formData,
          restaurantId: currentRestaurant.id
        });
        toast.success('Category created successfully!');
      }
      
      setIsAddModalOpen(false);
      resetForm();
      await loadCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder,
      active: category.active,
      image: category.image || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (category: MenuCategory) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    try {
      await sdk.delete('menuCategories', category.id);
      toast.success('Category deleted successfully!');
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const toggleActive = async (category: MenuCategory) => {
    try {
      await sdk.update('menuCategories', category.id, {
        active: !category.active,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Category ${category.active ? 'disabled' : 'enabled'} successfully!`);
      await loadCategories();
    } catch (error) {
      console.error('Failed to update category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const updateDisplayOrder = async (categoryId: string, newOrder: number) => {
    try {
      await sdk.update('menuCategories', categoryId, {
        displayOrder: newOrder,
        updatedAt: new Date().toISOString()
      });
      await loadCategories();
    } catch (error) {
      console.error('Failed to update display order:', error);
      toast.error('Failed to update display order');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Categories</h1>
          <p className="text-gray-600">Organize your menu items into categories for better navigation.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Image className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">Create your first menu category to organize your items.</p>
          <Button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            icon={<Plus className="w-5 h-5" />}
          >
            Add Category
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className={`relative overflow-hidden ${!category.active ? 'opacity-60' : ''}`}>
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      #{category.displayOrder}
                    </span>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(category)}
                        className={category.active ? 'text-green-600' : 'text-red-600'}
                        icon={category.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      >
                        {category.active ? 'Active' : 'Inactive'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        icon={<Edit className="w-4 h-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDisplayOrder(category.id, Math.max(0, category.displayOrder - 1))}
                      disabled={index === 0}
                    >
                      Move Up
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateDisplayOrder(category.id, category.displayOrder + 1)}
                      disabled={index === categories.length - 1}
                    >
                      Move Down
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Appetizers, Main Courses, Desserts"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of this category..."
            />
          </div>
          
          <Input
            label="Category Image URL"
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          
          <Input
            label="Display Order"
            type="number"
            value={formData.displayOrder.toString()}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            min="0"
          />
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active (visible to customers)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default MenuCategoriesPage;
