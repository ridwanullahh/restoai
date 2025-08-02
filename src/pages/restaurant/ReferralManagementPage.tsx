import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Share2, DollarSign, TrendingUp, Search, Filter, Eye, Check, X } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { Referral, Customer } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

interface ReferralWithDetails extends Referral {
  referrerName?: string;
  referrerEmail?: string;
  refereeName?: string;
}

const ReferralManagementPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [referrals, setReferrals] = useState<ReferralWithDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [referralSettings, setReferralSettings] = useState({
    enabled: true,
    referrerReward: 10,
    refereeReward: 5,
    minOrderAmount: 25,
    maxRewards: 100,
    rewardType: 'discount' as 'discount' | 'credit' | 'points'
  });

  useEffect(() => {
    if (currentRestaurant) {
      loadData();
    }
  }, [currentRestaurant]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load referrals
      const referralsData = await sdk.queryBuilder<Referral>('referrals')
        .where(ref => ref.restaurantId === currentRestaurant?.id)
        .sort('createdAt', 'desc')
        .exec();
      
      // Load customers to get names
      const customersData = await sdk.queryBuilder<Customer>('customers')
        .exec();
      setCustomers(customersData);
      
      // Enhance referrals with customer details
      const referralsWithDetails: ReferralWithDetails[] = referralsData.map(referral => {
        const referrer = customersData.find(c => c.id === referral.referrerId);
        const referee = customersData.find(c => c.id === referral.refereeId);
        
        return {
          ...referral,
          referrerName: referrer?.name,
          referrerEmail: referrer?.email,
          refereeName: referee?.name
        };
      });
      
      setReferrals(referralsWithDetails);
      
      // Load referral settings from restaurant settings
      if (currentRestaurant.settings?.referralProgram) {
        setReferralSettings(currentRestaurant.settings.referralProgram);
      }
      
    } catch (error) {
      console.error('Failed to load referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const updateReferralStatus = async (referralId: string, status: Referral['status']) => {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      
      await sdk.update('referrals', referralId, updateData);
      toast.success(`Referral ${status} successfully!`);
      await loadData();
    } catch (error) {
      console.error('Failed to update referral status:', error);
      toast.error('Failed to update referral status');
    }
  };

  const claimReward = async (referralId: string) => {
    try {
      await sdk.update('referrals', referralId, {
        rewardClaimed: true,
        updatedAt: new Date().toISOString()
      });
      toast.success('Reward claimed successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to claim reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  const saveReferralSettings = async () => {
    try {
      if (!currentRestaurant) return;
      
      const updatedSettings = {
        ...currentRestaurant.settings,
        referralProgram: referralSettings
      };
      
      await sdk.update('restaurants', currentRestaurant.id, {
        settings: updatedSettings,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Referral settings updated successfully!');
      setIsSettingsModalOpen(false);
    } catch (error) {
      console.error('Failed to update referral settings:', error);
      toast.error('Failed to update referral settings');
    }
  };

  const generateReferralLink = (customerId: string) => {
    const referralCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `${window.location.origin}/${currentRestaurant?.slug}?ref=${referralCode}`;
  };

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = referral.referrerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.referrerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.refereeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         referral.referralCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const totalRewardsPaid = referrals.filter(r => r.rewardClaimed).reduce((sum, r) => sum + r.rewardAmount, 0);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Referral Management</h1>
          <p className="text-gray-600">Manage your customer referral program and track rewards.</p>
        </div>
        <Button
          onClick={() => setIsSettingsModalOpen(true)}
          icon={<Gift className="w-5 h-5" />}
        >
          Referral Settings
        </Button>
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
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{totalReferrals}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedReferrals}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingReferrals}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rewards Paid</p>
                <p className="text-2xl font-bold text-gray-900">${totalRewardsPaid.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Share2 className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals found</h3>
          <p className="text-gray-600">
            {referrals.length === 0 
              ? 'No referrals have been made yet. Encourage customers to refer friends!'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReferrals.map((referral, index) => (
            <motion.div
              key={referral.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Share2 className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {referral.referrerName || 'Unknown'} → {referral.refereeName || referral.refereeEmail}
                          </h3>
                          <p className="text-sm text-gray-600">Code: {referral.referralCode}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Referrer</p>
                          <p className="font-medium text-gray-900">
                            {referral.referrerEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Referee</p>
                          <p className="font-medium text-gray-900">
                            {referral.refereeEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Reward Amount</p>
                          <p className="font-medium text-gray-900">${referral.rewardAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Created</p>
                          <p className="font-medium text-gray-900">{formatDate(referral.createdAt)}</p>
                        </div>
                      </div>
                      
                      {referral.completedAt && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            Completed on {formatDate(referral.completedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Reward: {referral.rewardClaimed ? 'Claimed' : 'Unclaimed'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {referral.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateReferralStatus(referral.id, 'completed')}
                            icon={<Check className="w-4 h-4" />}
                          >
                            Mark Completed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateReferralStatus(referral.id, 'expired')}
                            icon={<X className="w-4 h-4" />}
                            className="text-red-600 hover:text-red-700"
                          >
                            Mark Expired
                          </Button>
                        </>
                      )}
                      
                      {referral.status === 'completed' && !referral.rewardClaimed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => claimReward(referral.id)}
                          icon={<Gift className="w-4 h-4" />}
                        >
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Referral Settings Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Referral Program Settings"
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={referralSettings.enabled}
              onChange={(e) => setReferralSettings({ ...referralSettings, enabled: e.target.checked })}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
              Enable referral program
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Referrer Reward ($)"
              type="number"
              value={referralSettings.referrerReward.toString()}
              onChange={(e) => setReferralSettings({
                ...referralSettings,
                referrerReward: parseFloat(e.target.value) || 0
              })}
              min="0"
              step="0.01"
            />
            
            <Input
              label="Referee Reward ($)"
              type="number"
              value={referralSettings.refereeReward.toString()}
              onChange={(e) => setReferralSettings({
                ...referralSettings,
                refereeReward: parseFloat(e.target.value) || 0
              })}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Minimum Order Amount ($)"
              type="number"
              value={referralSettings.minOrderAmount.toString()}
              onChange={(e) => setReferralSettings({
                ...referralSettings,
                minOrderAmount: parseFloat(e.target.value) || 0
              })}
              min="0"
              step="0.01"
            />
            
            <Input
              label="Maximum Rewards per Customer ($)"
              type="number"
              value={referralSettings.maxRewards.toString()}
              onChange={(e) => setReferralSettings({
                ...referralSettings,
                maxRewards: parseFloat(e.target.value) || 0
              })}
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reward Type
            </label>
            <select
              value={referralSettings.rewardType}
              onChange={(e) => setReferralSettings({
                ...referralSettings,
                rewardType: e.target.value as any
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="discount">Discount</option>
              <option value="credit">Store Credit</option>
              <option value="points">Loyalty Points</option>
            </select>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">How it works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Customer shares their unique referral link</li>
              <li>• New customer signs up and places an order of ${referralSettings.minOrderAmount}+</li>
              <li>• Referrer gets ${referralSettings.referrerReward} reward</li>
              <li>• Referee gets ${referralSettings.refereeReward} reward</li>
              <li>• Maximum ${referralSettings.maxRewards} in rewards per customer</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsSettingsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveReferralSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ReferralManagementPage;
