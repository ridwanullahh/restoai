import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Plus, Search, Filter, Calendar, Percent, DollarSign, Users, Edit, Trash2, Play, Pause } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface Promotion {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  description: string;
  type: 'discount' | 'bogo' | 'free_item' | 'percentage';
  value: number;
  minimumOrder?: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
  applicableItems?: string[];
}

const PromotionsPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage' as Promotion['type'],
    value: '',
    minimumOrder: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    applicableItems: [] as string[]
  });

  const promotionTypes = [
    { value: 'percentage', label: 'Percentage Off' },
    { value: 'discount', label: 'Fixed Amount Off' },
    { value: 'bogo', label: 'Buy One Get One' },
    { value: 'free_item', label: 'Free Item' }
  ];

  useEffect(() => {
    if (currentRestaurant) {
      loadPromotions();
    }
  }, [currentRestaurant]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const promoData = await sdk.queryBuilder<Promotion>('promotions')
        .where(promo => promo.restaurantId === currentRestaurant?.id)
        .sort('validFrom', 'desc')
        .exec();
      setPromotions(promoData);
    } catch (error) {
      console.error('Failed to load promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumOrder: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      applicableItems: []
    });
    setEditingPromotion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      const promoData = {
        restaurantId: currentRestaurant.id,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        minimumOrder: formData.minimumOrder ? parseFloat(formData.minimumOrder) : undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        active: true,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        usedCount: 0,
        applicableItems: formData.applicableItems
      };

      if (editingPromotion) {
        await sdk.update('promotions', editingPromotion.id, promoData);
        toast.success('Promotion updated successfully!');
      } else {
        await sdk.insert('promotions', promoData);
        toast.success('Promotion created successfully!');
      }

      await loadPromotions();
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save promotion:', error);
      toast.error('Failed to save promotion');
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value.toString(),
      minimumOrder: promotion.minimumOrder?.toString() || '',
      validFrom: promotion.validFrom.split('T')[0],
      validUntil: promotion.validUntil.split('T')[0],
      usageLimit: promotion.usageLimit?.toString() || '',
      applicableItems: promotion.applicableItems || []
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (promotion: Promotion) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await sdk.delete('promotions', promotion.id);
      toast.success('Promotion deleted successfully!');
      await loadPromotions();
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      toast.error('Failed to delete promotion');
    }
  };

  const togglePromotionStatus = async (promotion: Promotion) => {
    try {
      await sdk.update('promotions', promotion.id, { active: !promotion.active });
      toast.success(`Promotion ${promotion.active ? 'deactivated' : 'activated'} successfully!`);
      await loadPromotions();
    } catch (error) {
      console.error('Failed to update promotion status:', error);
      toast.error('Failed to update promotion status');
    }
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);

    if (!promotion.active) return 'inactive';
    if (now < validFrom) return 'scheduled';
    if (now > validUntil) return 'expired';
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) return 'exhausted';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'exhausted':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      case 'discount':
        return <DollarSign className="w-5 h-5" />;
      case 'bogo':
        return <Gift className="w-5 h-5" />;
      case 'free_item':
        return <Gift className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const formatPromotionValue = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}% off`;
      case 'discount':
        return `$${promotion.value} off`;
      case 'bogo':
        return 'Buy 1 Get 1 Free';
      case 'free_item':
        return 'Free Item';
      default:
        return promotion.value.toString();
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || promotion.type === typeFilter;
    const status = getPromotionStatus(promotion);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const promotionStats = {
    total: promotions.length,
    active: promotions.filter(p => getPromotionStatus(p) === 'active').length,
    scheduled: promotions.filter(p => getPromotionStatus(p) === 'scheduled').length,
    totalUsage: promotions.reduce((sum, p) => sum + p.usedCount, 0)
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Promotions & Offers</h1>
          <p className="text-gray-600">Create and manage promotional campaigns</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Create Promotion
        </Button>
      </div>

      {/* Promotion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{promotionStats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{promotionStats.active}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{promotionStats.scheduled}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">{promotionStats.totalUsage}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Users className="w-6 h-6 text-orange-600" />
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
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {promotionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map((promotion, index) => {
          const status = getPromotionStatus(promotion);
          return (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="relative overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-orange-500">
                        {getPromotionIcon(promotion.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                      </div>
                    </div>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold text-orange-500 mb-2">
                      {formatPromotionValue(promotion)}
                    </div>
                    
                    {promotion.minimumOrder && (
                      <p className="text-sm text-gray-600">
                        Minimum order: ${promotion.minimumOrder}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valid from:</span>
                      <span className="text-gray-900">
                        {new Date(promotion.validFrom).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valid until:</span>
                      <span className="text-gray-900">
                        {new Date(promotion.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {promotion.usageLimit && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Usage:</span>
                        <span className="text-gray-900">
                          {promotion.usedCount} / {promotion.usageLimit}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(promotion)}
                        icon={<Edit className="w-4 h-4" />}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(promotion)}
                        icon={<Trash2 className="w-4 h-4" />}
                      />
                    </div>
                    
                    <Button
                      variant={promotion.active ? "outline" : "primary"}
                      size="sm"
                      onClick={() => togglePromotionStatus(promotion)}
                      icon={promotion.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    >
                      {promotion.active ? 'Pause' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No promotions found matching your criteria.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={editingPromotion ? 'Edit Promotion' : 'Create Promotion'}
        size="lg"
      >
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter promotion name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {promotionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe the promotion..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === 'percentage' ? 'Percentage (%)' : 'Value ($)'} *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order ($)
                </label>
                <input
                  type="number"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From *
                </label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until *
                </label>
                <input
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Unlimited"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited usage</p>
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
                {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default PromotionsPage;