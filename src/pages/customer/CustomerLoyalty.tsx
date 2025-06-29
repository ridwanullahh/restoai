import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Trophy, Zap, Calendar, Award } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const CustomerLoyalty: React.FC = () => {
  const { customer, loyaltyPoints, orders } = useCustomer();

  const loyaltyTiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 499, color: 'bg-amber-600', benefits: ['5% discount on orders'] },
    { name: 'Silver', minPoints: 500, maxPoints: 999, color: 'bg-gray-400', benefits: ['10% discount', 'Free delivery'] },
    { name: 'Gold', minPoints: 1000, maxPoints: 1999, color: 'bg-yellow-500', benefits: ['15% discount', 'Free delivery', 'Priority support'] },
    { name: 'Platinum', minPoints: 2000, maxPoints: Infinity, color: 'bg-purple-600', benefits: ['20% discount', 'Free delivery', 'Priority support', 'Exclusive offers'] }
  ];

  const currentTier = loyaltyTiers.find(tier => loyaltyPoints >= tier.minPoints && loyaltyPoints <= tier.maxPoints) || loyaltyTiers[0];
  const nextTier = loyaltyTiers.find(tier => tier.minPoints > loyaltyPoints);
  const pointsToNextTier = nextTier ? nextTier.minPoints - loyaltyPoints : 0;

  const rewards = [
    { id: 1, name: 'Free Appetizer', points: 100, description: 'Get a free appetizer with your next order' },
    { id: 2, name: 'Free Delivery', points: 150, description: 'Free delivery on your next order' },
    { id: 3, name: '$5 Off', points: 250, description: '$5 discount on orders over $25' },
    { id: 4, name: 'Free Dessert', points: 200, description: 'Complimentary dessert with main course' },
    { id: 5, name: '$10 Off', points: 500, description: '$10 discount on orders over $50' },
    { id: 6, name: 'VIP Experience', points: 1000, description: 'Priority seating and special treatment' }
  ];

  const recentActivity = [
    { date: '2024-01-15', action: 'Earned 25 points', description: 'Order #1234' },
    { date: '2024-01-10', action: 'Redeemed 100 points', description: 'Free Appetizer' },
    { date: '2024-01-05', action: 'Earned 30 points', description: 'Order #1233' },
    { date: '2024-01-01', action: 'Bonus 50 points', description: 'New Year Special' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loyalty Program</h1>
        <p className="text-gray-600">Earn points and unlock exclusive rewards</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Status</h2>
                <p className="text-gray-600">Current tier and progress</p>
              </div>
              <div className={`p-3 rounded-full ${currentTier.color}`}>
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">{currentTier.name} Member</span>
                <span className="text-2xl font-bold text-purple-600">{loyaltyPoints} points</span>
              </div>
              
              {nextTier && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${((loyaltyPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {pointsToNextTier} points to {nextTier.name} tier
                  </p>
                </>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Your Benefits</h3>
              <div className="space-y-2">
                {currentTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-semibold text-gray-900">{orders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Points Earned</span>
                <span className="font-semibold text-gray-900">{loyaltyPoints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Tier</span>
                <span className="font-semibold text-gray-900">{currentTier.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-semibold text-gray-900">
                  {customer?.createdAt ? new Date(customer.createdAt).getFullYear() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tier Progress */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Loyalty Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {loyaltyTiers.map((tier, index) => (
              <div
                key={tier.name}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tier.name === currentTier.name
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${tier.color} mx-auto mb-3 flex items-center justify-center`}>
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{tier.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">
                    {tier.minPoints === 0 ? '0' : tier.minPoints}
                    {tier.maxPoints === Infinity ? '+' : ` - ${tier.maxPoints}`} points
                  </p>
                  <div className="space-y-1">
                    {tier.benefits.slice(0, 2).map((benefit, idx) => (
                      <p key={idx} className="text-xs text-gray-600">{benefit}</p>
                    ))}
                    {tier.benefits.length > 2 && (
                      <p className="text-xs text-gray-500">+{tier.benefits.length - 2} more</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Rewards */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Rewards</h2>
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`p-4 rounded-lg border transition-all ${
                    loyaltyPoints >= reward.points
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Gift className={`w-5 h-5 ${loyaltyPoints >= reward.points ? 'text-green-600' : 'text-gray-400'}`} />
                        <h3 className="font-medium text-gray-900">{reward.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                      <p className="text-sm font-medium text-purple-600">{reward.points} points</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={loyaltyPoints < reward.points}
                      variant={loyaltyPoints >= reward.points ? 'primary' : 'outline'}
                    >
                      {loyaltyPoints >= reward.points ? 'Redeem' : 'Locked'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default CustomerLoyalty;