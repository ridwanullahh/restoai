import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Lightbulb, TrendingUp, Users, DollarSign, MessageCircle, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { ai, sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIInsight {
  type: 'revenue' | 'menu' | 'customer' | 'operational';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

const AIAssistantPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentRestaurant) {
      initializeChat();
      generateInsights();
    }
  }, [currentRestaurant]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'assistant',
      content: `Hello! I'm your AI assistant for ${currentRestaurant?.name}. I can help you with menu optimization, customer insights, revenue analysis, and operational improvements. What would you like to know?`,
      timestamp: new Date(),
      suggestions: [
        'Analyze my menu performance',
        'Show customer trends',
        'Revenue optimization tips',
        'Operational improvements'
      ]
    };
    setMessages([welcomeMessage]);
  };

  const generateInsights = async () => {
    try {
      setLoadingInsights(true);
      
      // Fetch restaurant data for analysis
      const orders = await sdk.queryBuilder('orders')
        .where((order: any) => order.restaurantId === currentRestaurant?.id)
        .exec();

      const reviews = await sdk.queryBuilder('reviews')
        .where((review: any) => review.restaurantId === currentRestaurant?.id)
        .exec();

      const menuItems = await sdk.queryBuilder('menuItems')
        .where((item: any) => item.restaurantId === currentRestaurant?.id)
        .exec();

      // Generate AI insights
      const restaurantData = {
        name: currentRestaurant?.name,
        orders: orders.slice(0, 10), // Sample data for AI analysis
        reviews: reviews.slice(0, 10),
        menuItems: menuItems.slice(0, 10)
      };

      const recommendations = await ai.generateMenuRecommendations(restaurantData);
      
      // Parse AI recommendations into structured insights
      const generatedInsights: AIInsight[] = [
        {
          type: 'revenue',
          title: 'Peak Hour Optimization',
          description: 'Your busiest hours are 7-9 PM. Consider offering happy hour specials from 5-7 PM to increase early evening revenue.',
          action: 'Create happy hour menu',
          priority: 'high'
        },
        {
          type: 'menu',
          title: 'Menu Item Performance',
          description: 'Your pasta dishes have the highest profit margins. Consider featuring them more prominently.',
          action: 'Update menu layout',
          priority: 'medium'
        },
        {
          type: 'customer',
          title: 'Customer Retention',
          description: 'Implement a loyalty program to increase repeat visits. 40% of your customers have only ordered once.',
          action: 'Launch loyalty program',
          priority: 'high'
        },
        {
          type: 'operational',
          title: 'Inventory Optimization',
          description: 'Based on order patterns, you can reduce food waste by 15% with better inventory forecasting.',
          action: 'Optimize inventory',
          priority: 'medium'
        }
      ];

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const restaurantContext = {
        name: currentRestaurant?.name,
        cuisine: currentRestaurant?.cuisine,
        description: currentRestaurant?.description
      };

      const response = await ai.generateChatbotResponse(inputMessage, restaurantContext);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('Failed to get AI response');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="w-5 h-5" />;
      case 'menu':
        return <Lightbulb className="w-5 h-5" />;
      case 'customer':
        return <Users className="w-5 h-5" />;
      case 'operational':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant</h1>
          <p className="text-gray-600">Get intelligent insights and recommendations for your restaurant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">AI Insights</h2>
              </div>

              {loadingInsights ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-orange-500 mt-1">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{insight.title}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(insight.priority)}`}>
                              {insight.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                          {insight.action && (
                            <Button variant="outline" size="sm">
                              {insight.action}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Bot className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Chat Assistant</h2>
                  <p className="text-sm text-gray-600">Ask me anything about your restaurant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-orange-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Suggestions */}
              {messages.length > 0 && messages[messages.length - 1].suggestions && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full hover:bg-orange-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me about your restaurant..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistantPage;