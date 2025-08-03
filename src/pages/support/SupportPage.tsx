import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  Search,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Users,
  BookOpen,
  Video,
  FileText,
  ArrowRight,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { sdk } from '../../lib/config';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  message: string;
  author: string;
  isStaff: boolean;
  createdAt: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  popular: boolean;
}

const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('help');
  const [searchTerm, setSearchTerm] = useState('');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      setLoading(true);
      
      // Load FAQs
      const faqsData: FAQ[] = [
        {
          id: '1',
          question: 'How do I get started with RestoAI?',
          answer: 'Getting started is easy! Sign up for a free trial, complete the onboarding process, and you\'ll be up and running in under 30 minutes. Our quick start guide will walk you through the essential setup steps.',
          category: 'Getting Started',
          helpful: 45,
          notHelpful: 2,
          popular: true
        },
        {
          id: '2',
          question: 'Can I import my existing menu?',
          answer: 'Yes! RestoAI supports importing menus from various formats including CSV, Excel, and direct integration with popular POS systems. You can also manually add items or use our menu builder tool.',
          category: 'Menu Management',
          helpful: 38,
          notHelpful: 1,
          popular: true
        },
        {
          id: '3',
          question: 'How does the AI analytics work?',
          answer: 'Our AI analyzes your restaurant data to provide insights on customer behavior, sales patterns, inventory optimization, and revenue opportunities. The system learns from your data to provide increasingly accurate predictions and recommendations.',
          category: 'Analytics',
          helpful: 52,
          notHelpful: 3,
          popular: true
        },
        {
          id: '4',
          question: 'What payment methods are supported?',
          answer: 'RestoAI supports all major credit cards, PayPal, Apple Pay, Google Pay, and various local payment methods. We use Stripe for secure payment processing with PCI DSS compliance.',
          category: 'Payments',
          helpful: 29,
          notHelpful: 0,
          popular: false
        },
        {
          id: '5',
          question: 'Can I use RestoAI for multiple locations?',
          answer: 'Absolutely! Our Professional and Enterprise plans support multiple locations with centralized management, location-specific analytics, and unified reporting across all your restaurants.',
          category: 'Multi-location',
          helpful: 33,
          notHelpful: 1,
          popular: true
        },
        {
          id: '6',
          question: 'How secure is my data?',
          answer: 'We take security seriously. All data is encrypted in transit and at rest, we\'re SOC 2 compliant, and we follow industry best practices for data protection. Your restaurant data is never shared with third parties.',
          category: 'Security',
          helpful: 41,
          notHelpful: 0,
          popular: false
        },
        {
          id: '7',
          question: 'What integrations are available?',
          answer: 'RestoAI integrates with 100+ popular restaurant tools including POS systems (Square, Toast, Clover), delivery platforms (Uber Eats, DoorDash), accounting software (QuickBooks, Xero), and marketing tools.',
          category: 'Integrations',
          helpful: 36,
          notHelpful: 2,
          popular: true
        },
        {
          id: '8',
          question: 'Do you offer training and support?',
          answer: 'Yes! We provide comprehensive onboarding, video tutorials, live training sessions, and 24/7 support. Enterprise customers get dedicated account managers and custom training programs.',
          category: 'Support',
          helpful: 44,
          notHelpful: 1,
          popular: false
        }
      ];

      setFaqs(faqsData);

      // Load support tickets (mock data)
      const ticketsData: SupportTicket[] = [
        {
          id: '1',
          subject: 'Menu items not syncing properly',
          description: 'Some of my menu items are not appearing in the customer app after I updated them.',
          status: 'in-progress',
          priority: 'high',
          category: 'Menu Management',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          responses: [
            {
              id: '1',
              message: 'Thank you for reporting this issue. We\'re looking into the menu sync problem and will have an update for you shortly.',
              author: 'Support Team',
              isStaff: true,
              createdAt: '2024-01-15T11:15:00Z'
            }
          ]
        }
      ];

      setTickets(ticketsData);

    } catch (error) {
      console.error('Failed to load support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ticketData = {
        ...newTicket,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      };

      // In a real app, this would submit to the API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Support ticket created successfully! We\'ll get back to you within 24 hours.');
      setNewTicket({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });
      setActiveTab('help');
      
    } catch (error) {
      toast.error('Failed to create support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFAQFeedback = async (faqId: string, helpful: boolean) => {
    try {
      const faq = faqs.find(f => f.id === faqId);
      if (faq) {
        const updatedFAQ = {
          ...faq,
          helpful: helpful ? faq.helpful + 1 : faq.helpful,
          notHelpful: helpful ? faq.notHelpful : faq.notHelpful + 1
        };
        
        setFaqs(faqs.map(f => f.id === faqId ? updatedFAQ : f));
        toast.success('Thank you for your feedback!');
      }
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'default';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    searchTerm === '' ||
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const popularFAQs = faqs.filter(faq => faq.popular);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                RestoAI
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-orange-500 transition-colors">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-orange-500 transition-colors">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-orange-500 transition-colors">Pricing</Link>
              <Link to="/support" className="text-orange-500 font-medium">Support</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link to="/restaurant/auth" className="text-gray-600 hover:text-orange-500 transition-colors">
                Sign In
              </Link>
              <Button as={Link} to="/restaurant/auth" className="bg-gradient-to-r from-orange-500 to-red-500">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              How Can We
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block">
                Help You?
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get the support you need to succeed with RestoAI. Search our knowledge base, 
              contact our team, or create a support ticket.
            </p>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <MessageCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
                <Button className="w-full">Start Chat</Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <Phone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">Speak directly with our experts</p>
                <Button variant="outline" className="w-full">Call Now</Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <Mail className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get help via email within 4 hours</p>
                <Button variant="outline" className="w-full">Send Email</Button>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Tabs */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'help', label: 'Help Center', icon: <HelpCircle className="w-5 h-5" /> },
                { id: 'tickets', label: 'Support Tickets', icon: <MessageCircle className="w-5 h-5" /> },
                { id: 'contact', label: 'Contact Us', icon: <Mail className="w-5 h-5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-orange-500 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Help Center Tab */}
          {activeTab === 'help' && (
            <div className="space-y-12">
              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <Input
                  placeholder="Search for help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                  className="text-lg py-4"
                />
              </div>

              {/* Popular FAQs */}
              {searchTerm === '' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                    Popular Questions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {popularFAQs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <Card className="p-6 h-full">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant="info" size="sm">{faq.category}</Badge>
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            {faq.question}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {faq.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleFAQFeedback(faq.id, true)}
                                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{faq.helpful}</span>
                              </button>
                              <button
                                onClick={() => handleFAQFeedback(faq.id, false)}
                                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                              >
                                <ThumbsDown className="w-4 h-4" />
                                <span>{faq.notHelpful}</span>
                              </button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* All FAQs */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  {searchTerm ? `Search Results (${filteredFAQs.length})` : 'All Questions'}
                </h2>
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <Card className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="info" size="sm">{faq.category}</Badge>
                          {faq.popular && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {faq.answer}
                        </p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleFAQFeedback(faq.id, true)}
                            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{faq.helpful}</span>
                          </button>
                          <button
                            onClick={() => handleFAQFeedback(faq.id, false)}
                            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span>{faq.notHelpful}</span>
                          </button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && searchTerm && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600 mb-4">Try different search terms or browse all questions</p>
                    <Button onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Create Support Ticket
                </h2>
                <p className="text-gray-600">
                  Can't find what you're looking for? Create a support ticket and we'll help you out.
                </p>
              </div>

              <Card className="p-8">
                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Category"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      options={[
                        { value: 'general', label: 'General Question' },
                        { value: 'technical', label: 'Technical Issue' },
                        { value: 'billing', label: 'Billing & Payments' },
                        { value: 'feature', label: 'Feature Request' },
                        { value: 'integration', label: 'Integration Help' },
                        { value: 'training', label: 'Training & Onboarding' }
                      ]}
                    />
                    <Select
                      label="Priority"
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' }
                      ]}
                    />
                  </div>

                  <Input
                    label="Subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    required
                    placeholder="Brief description of your issue"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      rows={6}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Please provide as much detail as possible about your issue..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        Create Support Ticket
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {/* Existing Tickets */}
              {tickets.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Your Recent Tickets</h3>
                  <div className="space-y-4">
                    {tickets.map((ticket) => (
                      <Card key={ticket.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {ticket.subject}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Created {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                            <Badge variant={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{ticket.description}</p>
                        {ticket.responses.length > 0 && (
                          <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-900 mb-2">Latest Response:</p>
                            <p className="text-sm text-gray-600">
                              {ticket.responses[ticket.responses.length - 1].message}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Get in Touch
                </h2>
                <p className="text-gray-600">
                  Choose the best way to reach our support team
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-gray-600 mb-4">Available 24/7 for all users</p>
                  <Button className="w-full">Start Chat</Button>
                </Card>

                <Card className="p-6 text-center">
                  <Phone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-gray-600 mb-2">+1 (555) 123-4567</p>
                  <p className="text-sm text-gray-500 mb-4">Mon-Fri, 9AM-6PM EST</p>
                  <Button variant="outline" className="w-full">Call Now</Button>
                </Card>

                <Card className="p-6 text-center">
                  <Mail className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-gray-600 mb-2">support@restoai.com</p>
                  <p className="text-sm text-gray-500 mb-4">Response within 4 hours</p>
                  <Button variant="outline" className="w-full">Send Email</Button>
                </Card>
              </div>

              {/* Additional Resources */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Additional Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <BookOpen className="w-8 h-8 text-orange-500 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Documentation</h4>
                    <p className="text-gray-600 mb-4">
                      Comprehensive guides and tutorials to help you get the most out of RestoAI
                    </p>
                    <Button as={Link} to="/docs" variant="outline">
                      Browse Docs
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <Video className="w-8 h-8 text-orange-500 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorials</h4>
                    <p className="text-gray-600 mb-4">
                      Step-by-step video guides for common tasks and advanced features
                    </p>
                    <Button variant="outline">
                      Watch Videos
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">RestoAI</h3>
              </div>
              <p className="text-gray-400">
                The ultimate AI-powered restaurant management platform.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RestoAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SupportPage;
