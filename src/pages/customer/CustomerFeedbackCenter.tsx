import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Camera, 
  Mic,
  Send,
  Award,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  Smile,
  Meh,
  Frown,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { Customer } from '../../types';
import { sdk } from '../../lib/config';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Progress from '../../components/common/Progress';
import toast from 'react-hot-toast';

interface FeedbackItem {
  id: string;
  type: 'review' | 'suggestion' | 'complaint' | 'compliment';
  rating?: number;
  title: string;
  content: string;
  category: 'food' | 'service' | 'ambiance' | 'cleanliness' | 'value' | 'overall';
  orderId?: string;
  media: string[];
  mood: 'happy' | 'neutral' | 'sad';
  isAnonymous: boolean;
  status: 'pending' | 'acknowledged' | 'resolved';
  response?: {
    content: string;
    respondedAt: string;
    respondedBy: string;
  };
  createdAt: string;
  helpful: number;
  notHelpful: number;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  resolutionTime: number;
  categoryBreakdown: {
    [key: string]: {
      count: number;
      avgRating: number;
    };
  };
  moodDistribution: {
    happy: number;
    neutral: number;
    sad: number;
  };
}

interface CustomerFeedbackCenterProps {
  customer: Customer | null;
}

const CustomerFeedbackCenter: React.FC<CustomerFeedbackCenterProps> = ({ customer }) => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submit');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    type: 'review',
    rating: 5,
    title: '',
    content: '',
    category: 'overall',
    orderId: '',
    mood: 'happy',
    isAnonymous: false,
    media: [] as string[]
  });

  useEffect(() => {
    if (customer) {
      loadFeedbackData();
    }
  }, [customer]);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);
      
      // Load customer's feedback
      const feedbackData = await sdk.queryBuilder<FeedbackItem>('feedback')
        .where((item: any) => item.customerId === customer?.id)
        .sort('createdAt', 'desc')
        .exec();
      
      setFeedback(feedbackData);

      // Calculate stats
      const totalFeedback = feedbackData.length;
      const averageRating = feedbackData
        .filter(f => f.rating)
        .reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackData.filter(f => f.rating).length;
      
      const categoryBreakdown = feedbackData.reduce((acc: any, item) => {
        if (!acc[item.category]) {
          acc[item.category] = { count: 0, avgRating: 0, totalRating: 0 };
        }
        acc[item.category].count++;
        if (item.rating) {
          acc[item.category].totalRating += item.rating;
          acc[item.category].avgRating = acc[item.category].totalRating / acc[item.category].count;
        }
        return acc;
      }, {});

      const moodDistribution = feedbackData.reduce((acc: any, item) => {
        acc[item.mood] = (acc[item.mood] || 0) + 1;
        return acc;
      }, { happy: 0, neutral: 0, sad: 0 });

      setStats({
        totalFeedback,
        averageRating: averageRating || 0,
        responseRate: 85, // Mock data
        resolutionTime: 24, // Mock data in hours
        categoryBreakdown,
        moodDistribution
      });

    } catch (error) {
      console.error('Failed to load feedback data:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    try {
      const feedbackData = {
        customerId: customer?.id,
        customerName: newFeedback.isAnonymous ? 'Anonymous' : customer?.name,
        customerEmail: customer?.email,
        type: newFeedback.type,
        rating: newFeedback.type === 'review' ? newFeedback.rating : undefined,
        title: newFeedback.title,
        content: newFeedback.content,
        category: newFeedback.category,
        orderId: newFeedback.orderId || undefined,
        media: newFeedback.media,
        mood: newFeedback.mood,
        isAnonymous: newFeedback.isAnonymous,
        status: 'pending',
        helpful: 0,
        notHelpful: 0,
        createdAt: new Date().toISOString()
      };

      await sdk.insert('feedback', feedbackData);
      toast.success('Thank you for your feedback! We appreciate your input.');
      
      setIsFeedbackModalOpen(false);
      setNewFeedback({
        type: 'review',
        rating: 5,
        title: '',
        content: '',
        category: 'overall',
        orderId: '',
        mood: 'happy',
        isAnonymous: false,
        media: []
      });
      
      await loadFeedbackData();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Voice recording started. Speak now!');
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setNewFeedback(prev => ({
            ...prev,
            content: prev.content + ' ' + finalTranscript
          }));
        }
      };
      
      recognition.onerror = () => {
        toast.error('Voice recognition error. Please try again.');
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        toast.success('Voice recording completed!');
      };
      
      recognition.start();
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="w-5 h-5 text-green-600" />;
      case 'neutral': return <Meh className="w-5 h-5 text-yellow-600" />;
      case 'sad': return <Frown className="w-5 h-5 text-red-600" />;
      default: return <Meh className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return <Star className="w-5 h-5 text-yellow-600" />;
      case 'suggestion': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'complaint': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'compliment': return <Heart className="w-5 h-5 text-pink-600" />;
      default: return <MessageCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'acknowledged': return 'warning';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Center</h1>
          <p className="text-gray-600">Share your experience and help us improve</p>
        </div>
        <Button
          onClick={() => setIsFeedbackModalOpen(true)}
          icon={<MessageCircle className="w-5 h-5" />}
        >
          Give Feedback
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <div className="flex mt-1">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolutionTime}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1">
        {['submit', 'history', 'insights'].map((tab) => (
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

      {/* Submit Feedback Tab */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Feedback</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => {
                      setNewFeedback({ ...newFeedback, type: 'compliment', mood: 'happy' });
                      setIsFeedbackModalOpen(true);
                    }}
                  >
                    <Smile className="w-8 h-8 text-green-600 mb-2" />
                    <span className="text-sm">Great Experience</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => {
                      setNewFeedback({ ...newFeedback, type: 'suggestion', mood: 'neutral' });
                      setIsFeedbackModalOpen(true);
                    }}
                  >
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm">Suggestion</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex-col"
                    onClick={() => {
                      setNewFeedback({ ...newFeedback, type: 'complaint', mood: 'sad' });
                      setIsFeedbackModalOpen(true);
                    }}
                  >
                    <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
                    <span className="text-sm">Issue</span>
                  </Button>
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  icon={<Star className="w-5 h-5" />}
                >
                  Write Detailed Review
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Be Specific</p>
                    <p className="text-sm text-gray-600">Mention specific dishes, staff members, or experiences</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Camera className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Add Photos</p>
                    <p className="text-sm text-gray-600">Pictures help us understand your experience better</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Be Constructive</p>
                    <p className="text-sm text-gray-600">Help us improve with actionable feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <Card className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-600 mb-4">Share your first experience with us!</p>
              <Button onClick={() => setIsFeedbackModalOpen(true)}>
                Give Feedback
              </Button>
            </Card>
          ) : (
            feedback.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="info" size="sm" className="capitalize">
                            {item.type}
                          </Badge>
                          <Badge variant="outline" size="sm" className="capitalize">
                            {item.category}
                          </Badge>
                          {getMoodIcon(item.mood)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(item.status)} size="sm">
                        {item.status}
                      </Badge>
                      {item.rating && (
                        <div className="flex">
                          {renderStars(item.rating)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{item.content}</p>
                  
                  {item.media.length > 0 && (
                    <div className="flex space-x-2 mb-4">
                      {item.media.map((media, idx) => (
                        <img
                          key={idx}
                          src={media}
                          alt="Feedback media"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                  
                  {item.response && (
                    <div className="bg-orange-50 border-l-4 border-orange-200 p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="font-medium text-orange-800">Restaurant Response</span>
                      </div>
                      <p className="text-orange-700">{item.response.content}</p>
                      <p className="text-sm text-orange-600 mt-2">
                        Responded by {item.response.respondedBy} on {new Date(item.response.respondedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 hover:text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{item.helpful}</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-red-600">
                        <ThumbsDown className="w-4 h-4" />
                        <span>{item.notHelpful}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(stats.categoryBreakdown).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">{category}</span>
                        <span className="text-sm text-gray-600">{data.count} feedback</span>
                      </div>
                      <Progress 
                        value={(data.count / stats.totalFeedback) * 100}
                        variant="default"
                        className="h-2"
                      />
                      {data.avgRating > 0 && (
                        <div className="flex items-center mt-1">
                          <div className="flex mr-2">
                            {renderStars(Math.round(data.avgRating))}
                          </div>
                          <span className="text-xs text-gray-500">{data.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smile className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Happy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(stats.moodDistribution.happy / stats.totalFeedback) * 100}
                      variant="success"
                      className="w-20 h-2"
                    />
                    <span className="text-sm text-gray-600">{stats.moodDistribution.happy}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Meh className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium">Neutral</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(stats.moodDistribution.neutral / stats.totalFeedback) * 100}
                      variant="warning"
                      className="w-20 h-2"
                    />
                    <span className="text-sm text-gray-600">{stats.moodDistribution.neutral}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Frown className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">Sad</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(stats.moodDistribution.sad / stats.totalFeedback) * 100}
                      variant="error"
                      className="w-20 h-2"
                    />
                    <span className="text-sm text-gray-600">{stats.moodDistribution.sad}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Feedback Modal */}
      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Share Your Feedback"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Feedback Type"
              options={[
                { value: 'review', label: 'Review' },
                { value: 'suggestion', label: 'Suggestion' },
                { value: 'complaint', label: 'Complaint' },
                { value: 'compliment', label: 'Compliment' }
              ]}
              value={newFeedback.type}
              onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value })}
            />
            
            <Select
              label="Category"
              options={[
                { value: 'overall', label: 'Overall Experience' },
                { value: 'food', label: 'Food Quality' },
                { value: 'service', label: 'Service' },
                { value: 'ambiance', label: 'Ambiance' },
                { value: 'cleanliness', label: 'Cleanliness' },
                { value: 'value', label: 'Value for Money' }
              ]}
              value={newFeedback.category}
              onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value })}
            />
          </div>

          {newFeedback.type === 'review' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= newFeedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Title"
            value={newFeedback.title}
            onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
            placeholder="Brief summary of your feedback"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <div className="relative">
              <textarea
                value={newFeedback.content}
                onChange={(e) => setNewFeedback({ ...newFeedback, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Tell us about your experience..."
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute bottom-2 right-2"
                onClick={startVoiceRecording}
                disabled={isRecording}
                icon={<Mic className={`w-4 h-4 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />}
              >
                {isRecording ? 'Recording...' : 'Voice'}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling?
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'happy', icon: Smile, color: 'text-green-600', label: 'Happy' },
                { value: 'neutral', icon: Meh, color: 'text-yellow-600', label: 'Neutral' },
                { value: 'sad', icon: Frown, color: 'text-red-600', label: 'Sad' }
              ].map(({ value, icon: Icon, color, label }) => (
                <button
                  key={value}
                  onClick={() => setNewFeedback({ ...newFeedback, mood: value as any })}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                    newFeedback.mood === value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${color} mb-1`} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={newFeedback.isAnonymous}
              onChange={(e) => setNewFeedback({ ...newFeedback, isAnonymous: e.target.checked })}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Submit anonymously
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsFeedbackModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitFeedback}
              disabled={!newFeedback.title || !newFeedback.content}
              icon={<Send className="w-4 h-4" />}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CustomerFeedbackCenter;
