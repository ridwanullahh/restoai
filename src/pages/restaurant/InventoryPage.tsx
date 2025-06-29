import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Search, Filter, AlertTriangle, TrendingDown, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  lastRestocked?: string;
  expiryDate?: string;
}

const InventoryPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: '',
    costPerUnit: '',
    supplier: '',
    expiryDate: ''
  });

  const categories = ['all', 'Vegetables', 'Meat', 'Dairy', 'Grains', 'Spices', 'Beverages', 'Cleaning', 'Other'];
  const units = ['kg', 'lbs', 'pieces', 'liters', 'gallons', 'boxes', 'bottles'];

  useEffect(() => {
    if (currentRestaurant) {
      loadInventory();
    }
  }, [currentRestaurant]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const items = await sdk.queryBuilder<InventoryItem>('inventory')
        .where(item => item.restaurantId === currentRestaurant?.id)
        .sort('name')
        .exec();
      setInventory(items);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      currentStock: '',
      minStock: '',
      maxStock: '',
      unit: '',
      costPerUnit: '',
      supplier: '',
      expiryDate: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      const itemData = {
        restaurantId: currentRestaurant.id,
        name: formData.name,
        category: formData.category,
        currentStock: parseFloat(formData.currentStock),
        minStock: parseFloat(formData.minStock),
        maxStock: parseFloat(formData.maxStock),
        unit: formData.unit,
        costPerUnit: parseFloat(formData.costPerUnit),
        supplier: formData.supplier,
        expiryDate: formData.expiryDate || undefined,
        lastRestocked: new Date().toISOString()
      };

      if (editingItem) {
        await sdk.update('inventory', editingItem.id, itemData);
        toast.success('Inventory item updated successfully!');
      } else {
        await sdk.insert('inventory', itemData);
        toast.success('Inventory item added successfully!');
      }

      await loadInventory();
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      toast.error('Failed to save inventory item');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      maxStock: item.maxStock.toString(),
      unit: item.unit,
      costPerUnit: item.costPerUnit.toString(),
      supplier: item.supplier || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      await sdk.delete('inventory', item.id);
      toast.success('Inventory item deleted successfully!');
      await loadInventory();
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      toast.error('Failed to delete inventory item');
    }
  };

  const updateStock = async (item: InventoryItem, newStock: number) => {
    try {
      await sdk.update('inventory', item.id, { 
        currentStock: newStock,
        lastRestocked: new Date().toISOString()
      });
      toast.success('Stock updated successfully!');
      await loadInventory();
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error('Failed to update stock');
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) return 'low';
    if (item.currentStock >= item.maxStock) return 'high';
    return 'normal';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && getStockStatus(item) === 'low') ||
                        (stockFilter === 'normal' && getStockStatus(item) === 'normal') ||
                        (stockFilter === 'high' && getStockStatus(item) === 'high');
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockItems = inventory.filter(item => getStockStatus(item) === 'low');
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your restaurant's inventory</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Add Item
        </Button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(inventory.map(item => item.category)).size}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
              <option value="high">High Stock</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min/Max
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost per Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item, index) => {
                const status = getStockStatus(item);
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.supplier && (
                          <div className="text-sm text-gray-500">{item.supplier}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.currentStock} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.minStock} - {item.maxStock} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${item.costPerUnit.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockColor(status)}`}>
                        {status === 'low' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {status === 'high' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {status === 'normal' && <TrendingDown className="w-3 h-3 mr-1" />}
                        {status.charAt(0).toUpperCase() + status.slice(1)} Stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                          icon={<Edit className="w-4 h-4" />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          icon={<Trash2 className="w-4 h-4" />}
                        />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No inventory items found.</p>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        size="lg"
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock *
                </label>
                <input
                  type="number"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Stock *
                </label>
                <input
                  type="number"
                  name="minStock"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Stock *
                </label>
                <input
                  type="number"
                  name="maxStock"
                  value={formData.maxStock}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost per Unit *
                </label>
                <input
                  type="number"
                  name="costPerUnit"
                  value={formData.costPerUnit}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Supplier name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6">
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
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default InventoryPage;