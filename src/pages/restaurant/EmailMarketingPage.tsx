import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Send, Eye, Calendar, Users, Mail, BarChart3, Search, Filter } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { sdk } from '../../lib/config';
import { EmailCampaign, CustomerSegment } from '../../types';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';

const EmailMarketingPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'promotional' as 'promotional' | 'newsletter' | 'transactional' | 'automated',
    targetSegments: [] as string[],
    scheduledAt: ''
  });

  useEffect(() => {
    if (currentRestaurant) {
      loadData();
    }
  }, [currentRestaurant]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load email campaigns
      const campaignsData = await sdk.queryBuilder<EmailCampaign>('emailCampaigns')
        .where(campaign => campaign.restaurantId === currentRestaurant?.id)
        .sort('createdAt', 'desc')
        .exec();
      setCampaigns(campaignsData);
      
      // Load customer segments
      const segmentsData = await sdk.queryBuilder<CustomerSegment>('customerSegments')
        .where(seg => seg.restaurantId === currentRestaurant?.id)
        .sort('name')
        .exec();
      setSegments(segmentsData);
    } catch (error) {
      console.error('Failed to load email marketing data:', error);
      toast.error('Failed to load email marketing data');
    } finally {
      setLoading(false);
    }
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      subject: '',
      content: '',
      type: 'promotional',
      targetSegments: [],
      scheduledAt: ''
    });
    setEditingCampaign(null);
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    try {
      const campaignData = {
        ...campaignForm,
        restaurantId: currentRestaurant.id,
        status: campaignForm.scheduledAt ? 'scheduled' : 'draft'
      };

      if (editingCampaign) {
        await sdk.update('emailCampaigns', editingCampaign.id, {
          ...campaignData,
          updatedAt: new Date().toISOString()
        });
        toast.success('Campaign updated successfully!');
      } else {
        await sdk.insert<EmailCampaign>('emailCampaigns', campaignData);
        toast.success('Campaign created successfully!');
      }
      
      setIsCampaignModalOpen(false);
      resetCampaignForm();
      await loadData();
    } catch (error) {
      console.error('Failed to save campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      type: campaign.type,
      targetSegments: campaign.targetSegments,
      scheduledAt: campaign.scheduledAt || ''
    });
    setIsCampaignModalOpen(true);
  };

  const handleDeleteCampaign = async (campaign: EmailCampaign) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;

    try {
      await sdk.delete('emailCampaigns', campaign.id);
      toast.success('Campaign deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleSendCampaign = async (campaign: EmailCampaign) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return;

    try {
      // In a real app, this would trigger the email sending service
      await sdk.update('emailCampaigns', campaign.id, {
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipientCount: Math.floor(Math.random() * 500) + 100, // Mock recipient count
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Campaign sent successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to send campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotional': return '🎯';
      case 'newsletter': return '📰';
      case 'transactional': return '📧';
      case 'automated': return '🤖';
      default: return '📧';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Marketing</h1>
          <p className="text-gray-600">Create and manage email campaigns to engage with your customers.</p>
        </div>
        <Button
          onClick={() => {
            resetCampaignForm();
            setIsCampaignModalOpen(true);
          }}
          icon={<Plus className="w-5 h-5" />}
        >
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sent Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'sent').length}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.length > 0 ? 
                    (campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length).toFixed(1) : '0'
                  }%
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.recipientCount, 0)}
                </p>
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
              placeholder="Search campaigns..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="promotional">Promotional</option>
            <option value="newsletter">Newsletter</option>
            <option value="transactional">Transactional</option>
            <option value="automated">Automated</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Mail className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-4">
            {campaigns.length === 0 
              ? 'Create your first email campaign to start engaging with customers.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {campaigns.length === 0 && (
            <Button
              onClick={() => {
                resetCampaignForm();
                setIsCampaignModalOpen(true);
              }}
              icon={<Plus className="w-5 h-5" />}
            >
              Create First Campaign
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.subject}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="font-medium text-gray-900 capitalize">{campaign.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Recipients</p>
                          <p className="font-medium text-gray-900">{campaign.recipientCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Open Rate</p>
                          <p className="font-medium text-gray-900">{campaign.openRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Click Rate</p>
                          <p className="font-medium text-gray-900">{campaign.clickRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {campaign.status === 'sent' ? 'Sent' : 
                             campaign.status === 'scheduled' ? 'Scheduled' : 'Created'}
                          </p>
                          <p className="font-medium text-gray-900">
                            {campaign.sentAt ? formatDate(campaign.sentAt) :
                             campaign.scheduledAt ? formatDate(campaign.scheduledAt) :
                             formatDate(campaign.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {campaign.targetSegments.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Target Segments:</p>
                          <div className="flex flex-wrap gap-2">
                            {campaign.targetSegments.map((segmentId, idx) => {
                              const segment = segments.find(s => s.id === segmentId);
                              return segment ? (
                                <span key={idx} className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  {segment.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Last updated: {formatDate(campaign.updatedAt || campaign.createdAt)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendCampaign(campaign)}
                          icon={<Send className="w-4 h-4" />}
                        >
                          Send Now
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                      >
                        Preview
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCampaign(campaign)}
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign)}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Campaign Modal */}
      <Modal
        isOpen={isCampaignModalOpen}
        onClose={() => {
          setIsCampaignModalOpen(false);
          resetCampaignForm();
        }}
        title={editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        size="xl"
      >
        <form onSubmit={handleCampaignSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Campaign Name"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              required
              placeholder="e.g., Summer Special Promotion"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Type
              </label>
              <select
                value={campaignForm.type}
                onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="promotional">Promotional</option>
                <option value="newsletter">Newsletter</option>
                <option value="transactional">Transactional</option>
                <option value="automated">Automated</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Email Subject"
            value={campaignForm.subject}
            onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
            required
            placeholder="Enter email subject line..."
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Content
            </label>
            <textarea
              value={campaignForm.content}
              onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={10}
              required
              placeholder="Write your email content here..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Segments (Optional)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {segments.map(segment => (
                <label key={segment.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={campaignForm.targetSegments.includes(segment.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCampaignForm({
                          ...campaignForm,
                          targetSegments: [...campaignForm.targetSegments, segment.id]
                        });
                      } else {
                        setCampaignForm({
                          ...campaignForm,
                          targetSegments: campaignForm.targetSegments.filter(id => id !== segment.id)
                        });
                      }
                    }}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {segment.name} ({segment.customerCount} customers)
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to send to all customers
            </p>
          </div>
          
          <Input
            label="Schedule Send Time (Optional)"
            type="datetime-local"
            value={campaignForm.scheduledAt}
            onChange={(e) => setCampaignForm({ ...campaignForm, scheduledAt: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCampaignModalOpen(false);
                resetCampaignForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};

export default EmailMarketingPage;
