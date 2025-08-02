import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Percent, DollarSign, Gift, Calendar, Users, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { Discount, MenuItem, CustomerSegment } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const DiscountManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'buy-one-get-one',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    active: true,
    applicableItems: [] as string[],
    customerSegments: [] as string[]
  });

  useEffect(() => {
    if (currentRestaurant) {
      loadData();
    }
  }, [currentRestaurant]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load discounts
      const discountsData = await sdk.queryBuilder<Discount>('discounts')
        .where(d => d.restaurantId === currentRestaurant?.id)
        .sort('createdAt', 'desc')
        .exec();
      setDiscounts(discountsData);
      
      // Load menu items for discount application
      const menuItemsData = await sdk.queryBuilder<MenuItem>('menuItems')
        .where(item => item.restaurantId === currentRestaurant?.id)
        .sort('name')
        .exec();
      setMenuItems(menuItemsData);
      
      // Load customer segments
      const segmentsData = await sdk.queryBuilder<CustomerSegment>('customerSegments')
        .where(seg => seg.restaurantId === currentRestaurant?.id)
        .sort('name')
        .exec();
      setCustomerSegments(segmentsData);
    } catch (error) {
      console.error('Failed to load discount data:', error);
      toast.error('Failed to load discount data');
    } finally {
      setLoading(false);
    }
  };

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'percentage',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: '',
      validUntil: '',
      active: true,
      applicableItems: [],
      customerSegments: []
    });
    setEditingDiscount(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      const discountData = {
        ...formData,
        code: formData.code || generateDiscountCode(),
        restaurantId: currentRestaurant.id
      };

      if (editingDiscount) {
        await sdk.update('discounts', editingDiscount.id, {
          ...discountData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Discount updated successfully!');
      } else {
        await sdk.insert<Discount>('discounts', discountData);
        toast.success('Discount created successfully!');
      }
      
      setIsAddModalOpen(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Failed to save discount:', error);
      toast.error('Failed to save discount');
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      code: discount.code || '',
      type: discount.type,
      value: discount.value,
      minOrderAmount: discount.minOrderAmount || 0,
      maxDiscount: discount.maxDiscount || 0,
      usageLimit: discount.usageLimit || 0,
      validFrom: discount.validFrom || '',
      validUntil: discount.validUntil || '',
      active: discount.active,
      applicableItems: discount.applicableItems,
      customerSegments: discount.customerSegments
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (discount: Discount) => {
    if (!confirm('Are you sure you want to delete this discount? This action cannot be undone.')) return;

    try {
      await sdk.delete('discounts', discount.id);
      toast.success('Discount deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to delete discount:', error);
      toast.error('Failed to delete discount');
    }
  };

  const toggleActive = async (discount: Discount) => {
    try {
      await sdk.update('discounts', discount.id, {
        active: !discount.active,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Discount ${discount.active ? 'disabled' : 'enabled'} successfully!`);
      await loadData();
    } catch (error) {
      console.error('Failed to update discount status:', error);
      toast.error('Failed to update discount status');
    }
  };

  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (discount.code && discount.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || discount.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && discount.active) ||
                         (statusFilter === 'inactive' && !discount.active) ||
                         (statusFilter === 'expired' && discount.validUntil && new Date(discount.validUntil) < new Date());
    return matchesSearch && matchesType && matchesStatus;
  });

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="w-5 h-5" />;
      case 'fixed': return <DollarSign className="w-5 h-5" />;
      case 'buy-one-get-one': return <Gift className="w-5 h-5" />;
      default: return <Percent className="w-5 h-5" />;
    }
  };

  const getDiscountValue = (discount: Discount) => {
    switch (discount.type) {
      case 'percentage': return `${discount.value}%`;
      case 'fixed': return `$${discount.value}`;
      case 'buy-one-get-one': return 'BOGO';
      default: return `${discount.value}`;
    }
  };

  const getStatusColor = (discount: Discount) => {
    if (!discount.active) return 'bg-gray-100 text-gray-800';
    if (discount.validUntil && new Date(discount.validUntil) < new Date()) return 'bg-red-100 text-red-800';
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (discount: Discount) => {
    if (!discount.active) return 'Inactive';
    if (discount.validUntil && new Date(discount.validUntil) < new Date()) return 'Expired';
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return 'Limit Reached';
    return 'Active';
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Discount Management</h1>
          <p className="text-gray-600">Create and manage discount codes and promotions.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Create Discount
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search discounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="buy-one-get-one">BOGO</option>
            </select>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {filteredDiscounts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Percent className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discounts found</h3>
          <p className="text-gray-600 mb-4">
            {discounts.length === 0 
              ? 'Create your first discount to start offering promotions to customers.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {discounts.length === 0 && (
            <Button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              icon={<Plus className="w-5 h-5" />}
            >
              Create First Discount
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiscounts.map((discount, index) => (
            <motion.div
              key={discount.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className={`relative overflow-hidden ${!discount.active ? 'opacity-60' : ''}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        {getDiscountIcon(discount.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{discount.name}</h3>
                        <p className="text-2xl font-bold text-orange-600">{getDiscountValue(discount)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(discount)}`}>
                      {getStatusText(discount)}
                    </span>
                  </div>
                  
                  {discount.code && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Discount Code:</p>
                      <p className="font-mono text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                        {discount.code}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {discount.minOrderAmount > 0 && (
                      <p>Min order: ${discount.minOrderAmount}</p>
                    )}
                    {discount.maxDiscount > 0 && discount.type === 'percentage' && (
                      <p>Max discount: ${discount.maxDiscount}</p>
                    )}
                    {discount.usageLimit > 0 && (
                      <p>Usage: {discount.usageCount}/{discount.usageLimit}</p>
                    )}
                    {discount.validFrom && (
                      <p className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Valid from: {new Date(discount.validFrom).toLocaleDateString()}
                      </p>
                    )}
                    {discount.validUntil && (
                      <p className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Valid until: {new Date(discount.validUntil).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  {(discount.applicableItems.length > 0 || discount.customerSegments.length > 0) && (
                    <div className="mb-4">
                      {discount.applicableItems.length > 0 && (
                        <p className="text-xs text-gray-500 mb-1">
                          Applies to {discount.applicableItems.length} menu items
                        </p>
                      )}
                      {discount.customerSegments.length > 0 && (
                        <p className="text-xs text-gray-500">
                          For {discount.customerSegments.length} customer segments
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(discount)}
                        className={discount.active ? 'text-green-600' : 'text-red-600'}
                        icon={discount.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      >
                        {discount.active ? 'Active' : 'Inactive'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(discount)}
                        icon={<Edit className="w-4 h-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(discount)}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Discount Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingDiscount ? 'Edit Discount' : 'Create New Discount'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Discount Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Summer Special, New Customer Discount"
            />
            
            <Input
              label="Discount Code (Optional)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Leave empty to auto-generate"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
                <option value="buy-one-get-one">Buy One Get One</option>
              </select>
            </div>
            
            <Input
              label={formData.type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              type="number"
              value={formData.value.toString()}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              max={formData.type === 'percentage' ? "100" : undefined}
              step={formData.type === 'percentage' ? "1" : "0.01"}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Order Amount ($)"
              type="number"
              value={formData.minOrderAmount.toString()}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              placeholder="0 for no minimum"
            />
            
            {formData.type === 'percentage' && (
              <Input
                label="Maximum Discount Amount ($)"
                type="number"
                value={formData.maxDiscount.toString()}
                onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                placeholder="0 for no maximum"
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Usage Limit"
              type="number"
              value={formData.usageLimit.toString()}
              onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
              min="0"
              placeholder="0 for unlimited"
            />
            
            <Input
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            />
            
            <Input
              label="Valid Until"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>
          
          {/* Applicable Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Menu Items (Optional)
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {menuItems.map(item => (
                <label key={item.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={formData.applicableItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          applicableItems: [...formData.applicableItems, item.id]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          applicableItems: formData.applicableItems.filter(id => id !== item.id)
                        });
                      }
                    }}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to apply to all menu items
            </p>
          </div>
          
          {/* Customer Segments */}
          {customerSegments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Segments (Optional)
              </label>
              <div className="space-y-2">
                {customerSegments.map(segment => (
                  <label key={segment.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.customerSegments.includes(segment.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            customerSegments: [...formData.customerSegments, segment.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            customerSegments: formData.customerSegments.filter(id => id !== segment.id)
                          });
                        }
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{segment.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to apply to all customers
              </p>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active (available for use)
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
              {editingDiscount ? 'Update Discount' : 'Create Discount'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default DiscountManagementPage;
