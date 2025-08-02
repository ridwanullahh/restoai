import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Calendar, Mail, Phone, Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { Customer, CustomerSegment, Order } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

interface CustomerWithStats extends Customer {
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  daysSinceLastOrder?: number;
}

const CRMPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'segments'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<CustomerSegment | null>(null);
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    criteria: {
      orderCount: { min: 0, max: 0 },
      totalSpent: { min: 0, max: 0 },
      lastOrderDays: 0,
      loyaltyPoints: { min: 0, max: 0 },
      averageOrderValue: { min: 0, max: 0 }
    }
  });

  useEffect(() => {
    if (currentRestaurant) {
      loadData();
    }
  }, [currentRestaurant]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load customers
      const customersData = await sdk.queryBuilder<Customer>('customers')
        .exec();
      
      // Load orders to calculate customer stats
      const ordersData = await sdk.queryBuilder<Order>('orders')
        .where(order => order.restaurantId === currentRestaurant?.id)
        .exec();
      setOrders(ordersData);
      
      // Calculate customer stats
      const customersWithStats: CustomerWithStats[] = customersData.map(customer => {
        const customerOrders = ordersData.filter(order => order.customerId === customer.id);
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
        const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
        const lastOrder = customerOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0];
        const daysSinceLastOrder = lastOrder ? 
          Math.floor((new Date().getTime() - new Date(lastOrder.orderDate).getTime()) / (1000 * 60 * 60 * 24)) : 
          undefined;
        
        return {
          ...customer,
          totalSpent,
          averageOrderValue,
          lastOrderDate: lastOrder?.orderDate,
          daysSinceLastOrder
        };
      });
      
      setCustomers(customersWithStats);
      
      // Load segments
      const segmentsData = await sdk.queryBuilder<CustomerSegment>('customerSegments')
        .where(seg => seg.restaurantId === currentRestaurant?.id)
        .sort('name')
        .exec();
      setSegments(segmentsData);
      
      // Update segment customer counts
      for (const segment of segmentsData) {
        const matchingCustomers = customersWithStats.filter(customer => 
          matchesSegmentCriteria(customer, segment.criteria)
        );
        
        if (matchingCustomers.length !== segment.customerCount) {
          await sdk.update('customerSegments', segment.id, {
            customerCount: matchingCustomers.length,
            updatedAt: new Date().toISOString()
          });
        }
      }
      
    } catch (error) {
      console.error('Failed to load CRM data:', error);
      toast.error('Failed to load CRM data');
    } finally {
      setLoading(false);
    }
  };

  const matchesSegmentCriteria = (customer: CustomerWithStats, criteria: any) => {
    // Order count criteria
    if (criteria.orderCount?.min && customer.totalOrders < criteria.orderCount.min) return false;
    if (criteria.orderCount?.max && customer.totalOrders > criteria.orderCount.max) return false;
    
    // Total spent criteria
    if (criteria.totalSpent?.min && customer.totalSpent < criteria.totalSpent.min) return false;
    if (criteria.totalSpent?.max && customer.totalSpent > criteria.totalSpent.max) return false;
    
    // Last order days criteria
    if (criteria.lastOrderDays && customer.daysSinceLastOrder && customer.daysSinceLastOrder > criteria.lastOrderDays) return false;
    
    // Loyalty points criteria
    if (criteria.loyaltyPoints?.min && customer.loyaltyPoints < criteria.loyaltyPoints.min) return false;
    if (criteria.loyaltyPoints?.max && customer.loyaltyPoints > criteria.loyaltyPoints.max) return false;
    
    // Average order value criteria
    if (criteria.averageOrderValue?.min && customer.averageOrderValue < criteria.averageOrderValue.min) return false;
    if (criteria.averageOrderValue?.max && customer.averageOrderValue > criteria.averageOrderValue.max) return false;
    
    return true;
  };

  const getCustomersInSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return [];
    
    return customers.filter(customer => matchesSegmentCriteria(customer, segment.criteria));
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (segmentFilter === 'all') return matchesSearch;
    
    const segment = segments.find(s => s.id === segmentFilter);
    if (!segment) return matchesSearch;
    
    return matchesSearch && matchesSegmentCriteria(customer, segment.criteria);
  });

  const resetSegmentForm = () => {
    setSegmentForm({
      name: '',
      description: '',
      criteria: {
        orderCount: { min: 0, max: 0 },
        totalSpent: { min: 0, max: 0 },
        lastOrderDays: 0,
        loyaltyPoints: { min: 0, max: 0 },
        averageOrderValue: { min: 0, max: 0 }
      }
    });
    setEditingSegment(null);
  };

  const handleSegmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      const segmentData = {
        ...segmentForm,
        restaurantId: currentRestaurant.id,
        customerCount: 0 // Will be calculated after creation
      };

      if (editingSegment) {
        await sdk.update('customerSegments', editingSegment.id, {
          ...segmentData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Segment updated successfully!');
      } else {
        await sdk.insert<CustomerSegment>('customerSegments', segmentData);
        toast.success('Segment created successfully!');
      }
      
      setIsSegmentModalOpen(false);
      resetSegmentForm();
      await loadData();
    } catch (error) {
      console.error('Failed to save segment:', error);
      toast.error('Failed to save segment');
    }
  };

  const handleEditSegment = (segment: CustomerSegment) => {
    setEditingSegment(segment);
    setSegmentForm({
      name: segment.name,
      description: segment.description || '',
      criteria: segment.criteria
    });
    setIsSegmentModalOpen(true);
  };

  const handleDeleteSegment = async (segment: CustomerSegment) => {
    if (!confirm('Are you sure you want to delete this segment? This action cannot be undone.')) return;

    try {
      await sdk.delete('customerSegments', segment.id);
      toast.success('Segment deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to delete segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCustomerTier = (customer: CustomerWithStats) => {
    if (customer.totalSpent >= 500) return { name: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (customer.totalSpent >= 200) return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (customer.totalSpent >= 50) return { name: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { name: 'Bronze', color: 'bg-orange-100 text-orange-800' };
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Relationship Management</h1>
          <p className="text-gray-600">Manage customer relationships and create targeted segments.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{customers.length}</span> total customers
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Customer Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${customers.length > 0 ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Repeat Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.totalOrders > 1).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.daysSinceLastOrder && c.daysSinceLastOrder <= 30).length}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'customers'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Customers ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'segments'
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Segments ({segments.length})
        </button>
      </div>

      {activeTab === 'customers' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Customers</option>
                {segments.map(segment => (
                  <option key={segment.id} value={segment.id}>{segment.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Customers List */}
          <div className="space-y-4">
            {filteredCustomers.map((customer, index) => {
              const tier = getCustomerTier(customer);
              return (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold text-lg">
                              {(customer.name || customer.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {customer.name || 'Unknown'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {customer.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${tier.color}`}>
                          {tier.name}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-lg font-semibold text-gray-900">{customer.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Spent</p>
                          <p className="text-lg font-semibold text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Order Value</p>
                          <p className="text-lg font-semibold text-gray-900">${customer.averageOrderValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Loyalty Points</p>
                          <p className="text-lg font-semibold text-gray-900">{customer.loyaltyPoints}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Last Order</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Segments Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Customer Segments</h2>
              <p className="text-sm text-gray-600">Create targeted customer groups based on behavior and preferences.</p>
            </div>
            <Button
              onClick={() => {
                resetSegmentForm();
                setIsSegmentModalOpen(true);
              }}
              icon={<Plus className="w-5 h-5" />}
            >
              Create Segment
            </Button>
          </div>

          {/* Segments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                        {segment.description && (
                          <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSegment(segment)}
                          icon={<Edit className="w-4 h-4" />}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSegment(segment)}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700"
                        />
                      </div>
                    </div>
                    
                    <div className="text-center py-4">
                      <p className="text-3xl font-bold text-orange-600">{segment.customerCount}</p>
                      <p className="text-sm text-gray-600">customers</p>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600">
                      {segment.criteria.orderCount?.min > 0 && (
                        <p>Min orders: {segment.criteria.orderCount.min}</p>
                      )}
                      {segment.criteria.totalSpent?.min > 0 && (
                        <p>Min spent: ${segment.criteria.totalSpent.min}</p>
                      )}
                      {segment.criteria.lastOrderDays > 0 && (
                        <p>Active within: {segment.criteria.lastOrderDays} days</p>
                      )}
                      {segment.criteria.loyaltyPoints?.min > 0 && (
                        <p>Min loyalty points: {segment.criteria.loyaltyPoints.min}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Segment Modal */}
      <Modal
        isOpen={isSegmentModalOpen}
        onClose={() => {
          setIsSegmentModalOpen(false);
          resetSegmentForm();
        }}
        title={editingSegment ? 'Edit Segment' : 'Create New Segment'}
        size="lg"
      >
        <form onSubmit={handleSegmentSubmit} className="space-y-6">
          <Input
            label="Segment Name"
            value={segmentForm.name}
            onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
            required
            placeholder="e.g., VIP Customers, New Customers"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={segmentForm.description}
              onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Describe this customer segment..."
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Segment Criteria</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Order Count"
                type="number"
                value={segmentForm.criteria.orderCount.min.toString()}
                onChange={(e) => setSegmentForm({
                  ...segmentForm,
                  criteria: {
                    ...segmentForm.criteria,
                    orderCount: { ...segmentForm.criteria.orderCount, min: parseInt(e.target.value) || 0 }
                  }
                })}
                min="0"
              />
              <Input
                label="Max Order Count"
                type="number"
                value={segmentForm.criteria.orderCount.max.toString()}
                onChange={(e) => setSegmentForm({
                  ...segmentForm,
                  criteria: {
                    ...segmentForm.criteria,
                    orderCount: { ...segmentForm.criteria.orderCount, max: parseInt(e.target.value) || 0 }
                  }
                })}
                min="0"
                placeholder="0 for no limit"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Total Spent ($)"
                type="number"
                value={segmentForm.criteria.totalSpent.min.toString()}
                onChange={(e) => setSegmentForm({
                  ...segmentForm,
                  criteria: {
                    ...segmentForm.criteria,
                    totalSpent: { ...segmentForm.criteria.totalSpent, min: parseFloat(e.target.value) || 0 }
                  }
                })}
                min="0"
                step="0.01"
              />
              <Input
                label="Max Total Spent ($)"
                type="number"
                value={segmentForm.criteria.totalSpent.max.toString()}
                onChange={(e) => setSegmentForm({
                  ...segmentForm,
                  criteria: {
                    ...segmentForm.criteria,
                    totalSpent: { ...segmentForm.criteria.totalSpent, max: parseFloat(e.target.value) || 0 }
                  }
                })}
                min="0"
                step="0.01"
                placeholder="0 for no limit"
              />
            </div>
            
            <Input
              label="Active Within (Days)"
              type="number"
              value={segmentForm.criteria.lastOrderDays.toString()}
              onChange={(e) => setSegmentForm({
                ...segmentForm,
                criteria: {
                  ...segmentForm.criteria,
                  lastOrderDays: parseInt(e.target.value) || 0
                }
              })}
              min="0"
              placeholder="0 for no limit"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Loyalty Points"
                type="number"
                value={segmentForm.criteria.loyaltyPoints.min.toString()}
                onChange={(e) => setSegmentForm({
                  ...segmentForm,
                  criteria: {
                    ...segmentForm.criteria,
                    loyaltyPoints: { ...segmentForm.criteria.loyaltyPoints, min: parseInt(e.target.value) || 0 }
                  }
                })}
                min="0"
              />
              <Input
                label="Max Loyalty Points"
                type="number"
                value={segmentForm.criteria.loyaltyPoints.max.toString()}
                onChange={(e) => setSegmentForm({
                  ...segmentForm,
                  criteria: {
                    ...segmentForm.criteria,
                    loyaltyPoints: { ...segmentForm.criteria.loyaltyPoints, max: parseInt(e.target.value) || 0 }
                  }
                })}
                min="0"
                placeholder="0 for no limit"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSegmentModalOpen(false);
                resetSegmentForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingSegment ? 'Update Segment' : 'Create Segment'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default CRMPage;
