import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Customer } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Progress from '../../components/common/Progress';

interface CustomerLoyaltyPageProps {
  customer: Customer | null;
}

const CustomerLoyaltyPage: React.FC<CustomerLoyaltyPageProps> = ({ customer }) => {
  const [rewards, setRewards] = useState([
    { id: '1', name: 'Free Appetizer', points: 100, description: 'Get any appetizer for free' },
    { id: '2', name: '10% Off Next Order', points: 200, description: '10% discount on your next order' },
    { id: '3', name: 'Free Dessert', points: 150, description: 'Choose any dessert on the house' },
    { id: '4', name: 'Free Main Course', points: 500, description: 'Get any main course for free' },
  ]);

  const currentPoints = customer?.loyaltyPoints || 0;
  const nextTierPoints = 1000;
  const progress = (currentPoints / nextTierPoints) * 100;

  const canRedeem = (requiredPoints: number) => currentPoints >= requiredPoints;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Loyalty & Rewards</h1>
        <p className="text-gray-600">Earn points and redeem amazing rewards</p>
      </div>

      {/* Points Overview */}
      <Card>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{currentPoints}</h2>
            <p className="text-gray-600">Available Points</p>
          </div>
          
          <div className="space-y-4">
            <Progress 
              value={progress} 
              variant="default" 
              showLabel 
              label="Progress to VIP Status"
              animated
            />
            <p className="text-sm text-gray-600 text-center">
              Earn {nextTierPoints - currentPoints} more points to reach VIP status!
            </p>
          </div>
        </div>
      </Card>

      {/* Available Rewards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${canRedeem(reward.points) ? 'border-orange-200' : 'opacity-60'}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                    </div>
                    <Badge variant={canRedeem(reward.points) ? 'success' : 'default'}>
                      {reward.points} pts
                    </Badge>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!canRedeem(reward.points)}
                    variant={canRedeem(reward.points) ? 'default' : 'outline'}
                  >
                    {canRedeem(reward.points) ? 'Redeem Now' : `Need ${reward.points - currentPoints} more points`}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How to Earn Points */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Earn Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Order Food</h3>
              <p className="text-sm text-gray-600">Earn 1 point for every $1 spent</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Write Reviews</h3>
              <p className="text-sm text-gray-600">Get 25 points for each review</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Special Events</h3>
              <p className="text-sm text-gray-600">Bonus points during promotions</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CustomerLoyaltyPage;
