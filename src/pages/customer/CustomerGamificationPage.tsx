import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Gift, 
  Target, 
  Zap,
  Crown,
  Medal,
  Award,
  Calendar,
  TrendingUp,
  Users,
  Flame,
  CheckCircle,
  Lock
} from 'lucide-react';
import { Customer } from '../../types';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Progress from '../../components/common/Progress';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'orders' | 'spending' | 'reviews' | 'social' | 'special';
  requirement: number;
  reward: {
    points: number;
    badge?: string;
    discount?: number;
  };
  unlocked: boolean;
  progress: number;
  unlockedAt?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  requirement: number;
  progress: number;
  reward: {
    points: number;
    bonus?: string;
  };
  expiresAt: string;
  completed: boolean;
}

interface Leaderboard {
  rank: number;
  customerId: string;
  customerName: string;
  points: number;
  avatar?: string;
  isCurrentUser: boolean;
}

interface CustomerGamificationPageProps {
  customer: Customer | null;
}

const CustomerGamificationPage: React.FC<CustomerGamificationPageProps> = ({ customer }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('achievements');
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);

  useEffect(() => {
    if (customer) {
      loadGamificationData();
    }
  }, [customer]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      
      // Load customer orders and reviews for progress calculation
      const orders = await sdk.queryBuilder('orders')
        .where((order: any) => order.customerId === customer?.id)
        .exec();
      
      const reviews = await sdk.queryBuilder('reviews')
        .where((review: any) => review.customerEmail === customer?.email)
        .exec();

      // Calculate achievements
      const achievementsList: Achievement[] = [
        {
          id: 'first-order',
          title: 'First Bite',
          description: 'Place your first order',
          icon: <Star className="w-6 h-6" />,
          category: 'orders',
          requirement: 1,
          reward: { points: 50 },
          unlocked: orders.length >= 1,
          progress: Math.min(orders.length, 1),
          unlockedAt: orders.length >= 1 ? orders[0].orderDate : undefined
        },
        {
          id: 'regular-customer',
          title: 'Regular Customer',
          description: 'Place 10 orders',
          icon: <Trophy className="w-6 h-6" />,
          category: 'orders',
          requirement: 10,
          reward: { points: 200, discount: 10 },
          unlocked: orders.length >= 10,
          progress: Math.min(orders.length, 10)
        },
        {
          id: 'food-critic',
          title: 'Food Critic',
          description: 'Write 5 reviews',
          icon: <Medal className="w-6 h-6" />,
          category: 'reviews',
          requirement: 5,
          reward: { points: 150, badge: 'critic' },
          unlocked: reviews.length >= 5,
          progress: Math.min(reviews.length, 5)
        },
        {
          id: 'big-spender',
          title: 'Big Spender',
          description: 'Spend $500 total',
          icon: <Crown className="w-6 h-6" />,
          category: 'spending',
          requirement: 500,
          reward: { points: 300, discount: 15 },
          unlocked: (customer?.totalSpent || 0) >= 500,
          progress: Math.min(customer?.totalSpent || 0, 500)
        },
        {
          id: 'early-bird',
          title: 'Early Bird',
          description: 'Order before 10 AM',
          icon: <Zap className="w-6 h-6" />,
          category: 'special',
          requirement: 1,
          reward: { points: 75 },
          unlocked: orders.some(o => new Date(o.orderDate).getHours() < 10),
          progress: orders.some(o => new Date(o.orderDate).getHours() < 10) ? 1 : 0
        },
        {
          id: 'weekend-warrior',
          title: 'Weekend Warrior',
          description: 'Order 5 times on weekends',
          icon: <Award className="w-6 h-6" />,
          category: 'special',
          requirement: 5,
          reward: { points: 100 },
          unlocked: false,
          progress: orders.filter(o => {
            const day = new Date(o.orderDate).getDay();
            return day === 0 || day === 6;
          }).length
        }
      ];

      setAchievements(achievementsList);

      // Generate daily/weekly challenges
      const challengesList: Challenge[] = [
        {
          id: 'daily-order',
          title: 'Daily Treat',
          description: 'Place an order today',
          type: 'daily',
          requirement: 1,
          progress: orders.filter(o => 
            new Date(o.orderDate).toDateString() === new Date().toDateString()
          ).length,
          reward: { points: 25 },
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          completed: false
        },
        {
          id: 'weekly-reviews',
          title: 'Review Master',
          description: 'Write 3 reviews this week',
          type: 'weekly',
          requirement: 3,
          progress: 1, // Mock progress
          reward: { points: 100, bonus: 'Free appetizer' },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false
        },
        {
          id: 'monthly-spending',
          title: 'Monthly Milestone',
          description: 'Spend $100 this month',
          type: 'monthly',
          requirement: 100,
          progress: 45, // Mock progress
          reward: { points: 200, bonus: '20% off next order' },
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false
        }
      ];

      setChallenges(challengesList);

      // Mock leaderboard data
      const leaderboardData: Leaderboard[] = [
        { rank: 1, customerId: '1', customerName: 'Sarah Johnson', points: 2450, isCurrentUser: false },
        { rank: 2, customerId: '2', customerName: 'Mike Chen', points: 2200, isCurrentUser: false },
        { rank: 3, customerId: customer?.id || '', customerName: customer?.name || 'You', points: customer?.loyaltyPoints || 0, isCurrentUser: true },
        { rank: 4, customerId: '4', customerName: 'Emma Davis', points: 1800, isCurrentUser: false },
        { rank: 5, customerId: '5', customerName: 'Alex Rodriguez', points: 1650, isCurrentUser: false }
      ];

      setLeaderboard(leaderboardData);

      // Calculate level and streak
      const points = customer?.loyaltyPoints || 0;
      const calculatedLevel = Math.floor(points / 500) + 1;
      const xpForNextLevel = (calculatedLevel * 500) - points;
      
      setLevel(calculatedLevel);
      setXpToNextLevel(xpForNextLevel);
      setStreak(7); // Mock streak data

    } catch (error) {
      console.error('Failed to load gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimAchievement = async (achievement: Achievement) => {
    try {
      // Add points to customer account
      const newPoints = (customer?.loyaltyPoints || 0) + achievement.reward.points;
      
      await sdk.update('customers', customer?.id, {
        loyaltyPoints: newPoints,
        updatedAt: new Date().toISOString()
      });

      toast.success(`Achievement unlocked! +${achievement.reward.points} points`);
      
      // Reload data to reflect changes
      await loadGamificationData();
    } catch (error) {
      console.error('Failed to claim achievement:', error);
      toast.error('Failed to claim achievement');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'orders': return <ShoppingBag className="w-4 h-4" />;
      case 'spending': return <DollarSign className="w-4 h-4" />;
      case 'reviews': return <Star className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'special': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards & Achievements</h1>
        <p className="text-gray-600">Complete challenges and unlock achievements to earn rewards!</p>
      </div>

      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="text-center">
            <Crown className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total Points</p>
            <p className="text-2xl font-bold text-gray-900">{customer?.loyaltyPoints || 0}</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <Flame className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="text-2xl font-bold text-gray-900">{streak} days</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Achievements</p>
            <p className="text-2xl font-bold text-gray-900">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
          <span className="text-sm text-gray-600">Level {level} → {level + 1}</span>
        </div>
        <Progress 
          value={((500 - xpToNextLevel) / 500) * 100} 
          variant="default" 
          animated 
          className="h-3"
        />
        <p className="text-sm text-gray-600 mt-2">
          {xpToNextLevel} points to next level
        </p>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1">
        {['achievements', 'challenges', 'leaderboard'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                hover 
                className={`cursor-pointer ${achievement.unlocked ? 'border-green-200 bg-green-50' : 'opacity-75'}`}
                onClick={() => {
                  setSelectedAchievement(achievement);
                  setIsAchievementModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {achievement.unlocked ? achievement.icon : <Lock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {achievement.progress}/{achievement.requirement}
                    </span>
                  </div>
                  <Progress 
                    value={(achievement.progress / achievement.requirement) * 100}
                    variant={achievement.unlocked ? 'success' : 'default'}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryIcon(achievement.category)} size="sm">
                      {achievement.category}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      +{achievement.reward.points} points
                    </span>
                  </div>
                  {achievement.unlocked && (
                    <Button size="sm" onClick={(e) => {
                      e.stopPropagation();
                      claimAchievement(achievement);
                    }}>
                      Claim
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                      <Badge className={getChallengeTypeColor(challenge.type)} size="sm">
                        {challenge.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="text-sm font-medium">
                      {new Date(challenge.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">
                      {challenge.progress}/{challenge.requirement}
                    </span>
                  </div>
                  <Progress 
                    value={(challenge.progress / challenge.requirement) * 100}
                    variant="default"
                    animated
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">Reward: </span>
                    <span className="text-sm font-medium">
                      {challenge.reward.points} points
                      {challenge.reward.bonus && ` + ${challenge.reward.bonus}`}
                    </span>
                  </div>
                  {challenge.completed && (
                    <Button size="sm">Claim Reward</Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Leaderboard</h3>
            {leaderboard.map((entry, index) => (
              <div
                key={entry.customerId}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  entry.isCurrentUser ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {entry.rank}
                  </div>
                  <Avatar name={entry.customerName} src={entry.avatar} />
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.customerName}
                      {entry.isCurrentUser && ' (You)'}
                    </p>
                    <p className="text-sm text-gray-600">{entry.points} points</p>
                  </div>
                </div>
                {entry.rank <= 3 && (
                  <div className="text-right">
                    {entry.rank === 1 && <Crown className="w-6 h-6 text-yellow-500" />}
                    {entry.rank === 2 && <Medal className="w-6 h-6 text-gray-500" />}
                    {entry.rank === 3 && <Award className="w-6 h-6 text-orange-500" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Achievement Details Modal */}
      <Modal
        isOpen={isAchievementModalOpen}
        onClose={() => {
          setIsAchievementModalOpen(false);
          setSelectedAchievement(null);
        }}
        title="Achievement Details"
      >
        {selectedAchievement && (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                selectedAchievement.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {selectedAchievement.unlocked ? selectedAchievement.icon : <Lock className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{selectedAchievement.title}</h3>
              <p className="text-gray-600 mt-2">{selectedAchievement.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {selectedAchievement.progress}/{selectedAchievement.requirement}
                  </span>
                </div>
                <Progress 
                  value={(selectedAchievement.progress / selectedAchievement.requirement) * 100}
                  variant={selectedAchievement.unlocked ? 'success' : 'default'}
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Rewards</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• {selectedAchievement.reward.points} loyalty points</li>
                  {selectedAchievement.reward.discount && (
                    <li>• {selectedAchievement.reward.discount}% discount on next order</li>
                  )}
                  {selectedAchievement.reward.badge && (
                    <li>• Special "{selectedAchievement.reward.badge}" badge</li>
                  )}
                </ul>
              </div>

              {selectedAchievement.unlockedAt && (
                <div className="text-center text-sm text-gray-500">
                  Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAchievementModalOpen(false);
                  setSelectedAchievement(null);
                }}
              >
                Close
              </Button>
              {selectedAchievement.unlocked && (
                <Button onClick={() => claimAchievement(selectedAchievement)}>
                  Claim Reward
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default CustomerGamificationPage;
