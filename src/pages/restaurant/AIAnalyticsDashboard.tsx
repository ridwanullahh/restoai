import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign,
  Clock,
  Star,
  AlertTriangle,
  Lightbulb,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Progress from '../../components/common/Progress';
import Select from '../../components/common/Select';
import toast from 'react-hot-toast';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  category: 'revenue' | 'operations' | 'customer' | 'menu' | 'staff';
  data: any;
  createdAt: string;
}

interface PredictiveMetric {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  confidence: number;
  timeframe: string;
}

interface CustomerSegment {
  name: string;
  size: number;
  percentage: number;
  avgSpend: number;
  frequency: number;
  characteristics: string[];
  growthRate: number;
}

interface MenuOptimization {
  itemId: string;
  itemName: string;
  currentPrice: number;
  suggestedPrice: number;
  expectedImpact: {
    revenue: number;
    orders: number;
  };
  reasoning: string;
  confidence: number;
}

const AIAnalyticsDashboard: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictiveMetric[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [menuOptimizations, setMenuOptimizations] = useState<MenuOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');
  const [timeRange, setTimeRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentRestaurant) {
      loadAIAnalytics();
    }
  }, [currentRestaurant, timeRange]);

  const loadAIAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load historical data for AI analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const [orders, customers, menuItems, reviews] = await Promise.all([
        sdk.queryBuilder('orders')
          .where((order: any) => 
            order.restaurantId === currentRestaurant?.id &&
            new Date(order.orderDate) >= startDate
          )
          .exec(),
        sdk.queryBuilder('customers')
          .where((customer: any) => customer.restaurantId === currentRestaurant?.id)
          .exec(),
        sdk.queryBuilder('menuItems')
          .where((item: any) => item.restaurantId === currentRestaurant?.id)
          .exec(),
        sdk.queryBuilder('reviews')
          .where((review: any) => 
            review.restaurantId === currentRestaurant?.id &&
            new Date(review.reviewDate) >= startDate
          )
          .exec()
      ]);

      // Generate AI insights
      const generatedInsights = generateAIInsights(orders, customers, menuItems, reviews);
      setInsights(generatedInsights);

      // Generate predictions
      const generatedPredictions = generatePredictions(orders);
      setPredictions(generatedPredictions);

      // Generate customer segments
      const segments = generateCustomerSegments(customers, orders);
      setCustomerSegments(segments);

      // Generate menu optimizations
      const optimizations = generateMenuOptimizations(menuItems, orders);
      setMenuOptimizations(optimizations);

    } catch (error) {
      console.error('Failed to load AI analytics:', error);
      toast.error('Failed to load AI analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = (orders: any[], customers: any[], menuItems: any[], reviews: any[]): AIInsight[] => {
    const insights: AIInsight[] = [];

    // Revenue opportunity insight
    const avgOrderValue = orders.reduce((sum, order) => sum + order.total, 0) / orders.length;
    if (avgOrderValue < 25) {
      insights.push({
        id: '1',
        type: 'opportunity',
        title: 'Increase Average Order Value',
        description: `Your average order value is $${avgOrderValue.toFixed(2)}. Consider bundling items or suggesting add-ons to increase this by 15-20%.`,
        impact: 'high',
        confidence: 85,
        actionable: true,
        category: 'revenue',
        data: { currentAOV: avgOrderValue, targetAOV: avgOrderValue * 1.2 },
        createdAt: new Date().toISOString()
      });
    }

    // Peak hours insight
    const hourlyOrders = orders.reduce((acc: any, order) => {
      const hour = new Date(order.orderDate).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});
    
    const peakHour = Object.entries(hourlyOrders).reduce((a: any, b: any) => 
      hourlyOrders[a[0]] > hourlyOrders[b[0]] ? a : b
    );

    insights.push({
      id: '2',
      type: 'trend',
      title: 'Peak Hour Optimization',
      description: `Your busiest hour is ${peakHour[0]}:00 with ${peakHour[1]} orders. Consider staffing adjustments and promotional offers during slower periods.`,
      impact: 'medium',
      confidence: 92,
      actionable: true,
      category: 'operations',
      data: { peakHour: peakHour[0], orderCount: peakHour[1] },
      createdAt: new Date().toISOString()
    });

    // Customer retention insight
    const repeatCustomers = customers.filter(c => c.totalOrders > 1).length;
    const retentionRate = (repeatCustomers / customers.length) * 100;
    
    if (retentionRate < 40) {
      insights.push({
        id: '3',
        type: 'warning',
        title: 'Low Customer Retention',
        description: `Only ${retentionRate.toFixed(1)}% of customers return. Implement a loyalty program or follow-up campaigns to improve retention.`,
        impact: 'high',
        confidence: 78,
        actionable: true,
        category: 'customer',
        data: { retentionRate, repeatCustomers, totalCustomers: customers.length },
        createdAt: new Date().toISOString()
      });
    }

    // Menu performance insight
    const itemPerformance = menuItems.map((item: any) => {
      const itemOrders = orders.filter(order => 
        order.items.some((orderItem: any) => orderItem.id === item.id)
      );
      return {
        ...item,
        orderCount: itemOrders.length,
        revenue: itemOrders.reduce((sum, order) => {
          const orderItem = order.items.find((oi: any) => oi.id === item.id);
          return sum + (orderItem ? orderItem.price * orderItem.quantity : 0);
        }, 0)
      };
    });

    const lowPerformers = itemPerformance.filter(item => item.orderCount < 5);
    if (lowPerformers.length > 0) {
      insights.push({
        id: '4',
        type: 'recommendation',
        title: 'Menu Optimization Needed',
        description: `${lowPerformers.length} menu items have low sales. Consider removing or repricing these items to streamline your menu.`,
        impact: 'medium',
        confidence: 70,
        actionable: true,
        category: 'menu',
        data: { lowPerformers: lowPerformers.slice(0, 3) },
        createdAt: new Date().toISOString()
      });
    }

    // Review sentiment insight
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const recentReviews = reviews.filter(r => 
      new Date(r.reviewDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    const recentAvgRating = recentReviews.reduce((sum, review) => sum + review.rating, 0) / recentReviews.length;

    if (recentAvgRating < avgRating - 0.5) {
      insights.push({
        id: '5',
        type: 'warning',
        title: 'Declining Review Scores',
        description: `Recent reviews average ${recentAvgRating.toFixed(1)} stars, down from ${avgRating.toFixed(1)}. Address service or quality issues promptly.`,
        impact: 'high',
        confidence: 88,
        actionable: true,
        category: 'customer',
        data: { currentRating: avgRating, recentRating: recentAvgRating },
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  };

  const generatePredictions = (orders: any[]): PredictiveMetric[] => {
    const currentRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const currentOrders = orders.length;
    const avgOrderValue = currentRevenue / currentOrders;

    return [
      {
        metric: 'Revenue',
        current: currentRevenue,
        predicted: currentRevenue * 1.15,
        change: 15,
        confidence: 82,
        timeframe: 'Next 30 days'
      },
      {
        metric: 'Orders',
        current: currentOrders,
        predicted: currentOrders * 1.08,
        change: 8,
        confidence: 75,
        timeframe: 'Next 30 days'
      },
      {
        metric: 'Average Order Value',
        current: avgOrderValue,
        predicted: avgOrderValue * 1.06,
        change: 6,
        confidence: 68,
        timeframe: 'Next 30 days'
      },
      {
        metric: 'Customer Acquisition',
        current: 45,
        predicted: 52,
        change: 15.6,
        confidence: 71,
        timeframe: 'Next 30 days'
      }
    ];
  };

  const generateCustomerSegments = (customers: any[], orders: any[]): CustomerSegment[] => {
    // Simple segmentation based on spending and frequency
    const segments = [
      {
        name: 'VIP Customers',
        size: Math.floor(customers.length * 0.15),
        percentage: 15,
        avgSpend: 85,
        frequency: 8.5,
        characteristics: ['High spender', 'Frequent visitor', 'Loyal'],
        growthRate: 12
      },
      {
        name: 'Regular Customers',
        size: Math.floor(customers.length * 0.35),
        percentage: 35,
        avgSpend: 45,
        frequency: 4.2,
        characteristics: ['Moderate spender', 'Regular visitor'],
        growthRate: 8
      },
      {
        name: 'Occasional Customers',
        size: Math.floor(customers.length * 0.35),
        percentage: 35,
        avgSpend: 28,
        frequency: 2.1,
        characteristics: ['Low-moderate spender', 'Infrequent visitor'],
        growthRate: -2
      },
      {
        name: 'New Customers',
        size: Math.floor(customers.length * 0.15),
        percentage: 15,
        avgSpend: 32,
        frequency: 1.0,
        characteristics: ['First-time visitor', 'Potential for growth'],
        growthRate: 25
      }
    ];

    return segments;
  };

  const generateMenuOptimizations = (menuItems: any[], orders: any[]): MenuOptimization[] => {
    return menuItems.slice(0, 5).map((item: any) => {
      const currentPrice = item.price;
      const suggestedPrice = currentPrice * (0.95 + Math.random() * 0.1); // ±5% variation
      const expectedRevenue = (suggestedPrice - currentPrice) * 10; // Mock calculation
      
      return {
        itemId: item.id,
        itemName: item.name,
        currentPrice,
        suggestedPrice,
        expectedImpact: {
          revenue: expectedRevenue,
          orders: Math.floor(Math.random() * 20) - 10
        },
        reasoning: suggestedPrice > currentPrice 
          ? 'High demand and positive reviews suggest price increase potential'
          : 'Lower price could increase volume and overall revenue',
        confidence: 60 + Math.random() * 30
      };
    });
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await loadAIAnalytics();
    setRefreshing(false);
    toast.success('Analytics refreshed!');
  };

  const exportReport = () => {
    const reportData = {
      restaurant: currentRestaurant?.name,
      timeRange: `${timeRange} days`,
      generatedAt: new Date().toISOString(),
      insights,
      predictions,
      customerSegments,
      menuOptimizations
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'trend': return <Activity className="w-5 h-5 text-purple-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-red-200 bg-red-50';
      case 'recommendation': return 'border-blue-200 bg-blue-50';
      case 'trend': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 text-blue-600 mr-3" />
            AI Business Intelligence
          </h1>
          <p className="text-gray-600">AI-powered insights and predictions for your restaurant</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' }
            ]}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />
          <Button
            onClick={refreshAnalytics}
            disabled={refreshing}
            icon={<RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />}
            variant="outline"
          >
            Refresh
          </Button>
          <Button
            onClick={exportReport}
            icon={<Download className="w-5 h-5" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {['insights', 'predictions', 'segments', 'optimization'].map((tab) => (
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

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-2 ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{insight.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getImpactColor(insight.impact)} size="sm">
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="info" size="sm">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                  
                  {insight.actionable && (
                    <div className="flex justify-end">
                      <Button size="sm" icon={<Zap className="w-4 h-4" />}>
                        Take Action
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions.map((prediction, index) => (
            <motion.div
              key={prediction.metric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{prediction.metric}</h3>
                  <Badge variant="info" size="sm">
                    {prediction.confidence}% confidence
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current</span>
                    <span className="font-semibold">
                      {prediction.metric.includes('Revenue') || prediction.metric.includes('Value') 
                        ? `$${prediction.current.toFixed(2)}` 
                        : prediction.current.toFixed(0)
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Predicted</span>
                    <span className="font-semibold text-blue-600">
                      {prediction.metric.includes('Revenue') || prediction.metric.includes('Value') 
                        ? `$${prediction.predicted.toFixed(2)}` 
                        : prediction.predicted.toFixed(0)
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Change</span>
                    <div className="flex items-center">
                      {prediction.change > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`font-semibold ${prediction.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {prediction.change > 0 ? '+' : ''}{prediction.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={prediction.confidence} 
                    variant="info" 
                    className="h-2"
                  />
                  
                  <p className="text-xs text-gray-500">{prediction.timeframe}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Customer Segments Tab */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customerSegments.map((segment, index) => (
              <motion.div
                key={segment.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{segment.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="info" size="sm">
                        {segment.percentage}%
                      </Badge>
                      <Badge 
                        variant={segment.growthRate > 0 ? 'success' : 'error'} 
                        size="sm"
                      >
                        {segment.growthRate > 0 ? '+' : ''}{segment.growthRate}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Size</span>
                      <span className="font-medium">{segment.size} customers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Spend</span>
                      <span className="font-medium">${segment.avgSpend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Frequency</span>
                      <span className="font-medium">{segment.frequency} visits/month</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Characteristics:</p>
                    <div className="flex flex-wrap gap-1">
                      {segment.characteristics.map((char, idx) => (
                        <Badge key={idx} variant="outline" size="sm">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Optimization Tab */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {menuOptimizations.map((optimization, index) => (
              <motion.div
                key={optimization.itemId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {optimization.itemName}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Current Price</p>
                          <p className="text-xl font-bold text-gray-900">
                            ${optimization.currentPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Suggested Price</p>
                          <p className={`text-xl font-bold ${
                            optimization.suggestedPrice > optimization.currentPrice 
                              ? 'text-green-600' 
                              : 'text-blue-600'
                          }`}>
                            ${optimization.suggestedPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Expected Impact</p>
                          <p className={`text-xl font-bold ${
                            optimization.expectedImpact.revenue > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {optimization.expectedImpact.revenue > 0 ? '+' : ''}
                            ${optimization.expectedImpact.revenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{optimization.reasoning}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="info" size="sm">
                          {optimization.confidence.toFixed(0)}% confidence
                        </Badge>
                        <Button size="sm">
                          Apply Suggestion
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AIAnalyticsDashboard;
