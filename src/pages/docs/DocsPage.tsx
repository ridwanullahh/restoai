import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Search, 
  BookOpen, 
  FileText, 
  Code, 
  Settings,
  Users,
  CreditCard,
  Truck,
  BarChart3,
  MessageCircle,
  Shield,
  Zap,
  ArrowRight,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import { sdk } from '../../lib/config';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  articles: DocArticle[];
  color: string;
}

interface DocArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popular: boolean;
  updatedAt: string;
}

const DocsPage: React.FC = () => {
  const [sections, setSections] = useState<DocSection[]>([]);
  const [popularArticles, setPopularArticles] = useState<DocArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocsData();
  }, []);

  const loadDocsData = async () => {
    try {
      setLoading(true);
      
      // Load documentation sections and articles
      const sectionsData: DocSection[] = [
        {
          id: 'getting-started',
          title: 'Getting Started',
          description: 'Everything you need to know to get up and running with RestoAI',
          icon: <Zap className="w-8 h-8" />,
          color: 'from-green-500 to-emerald-500',
          articles: [
            {
              id: '1',
              title: 'Quick Start Guide',
              slug: 'quick-start-guide',
              description: 'Get your restaurant set up on RestoAI in under 30 minutes',
              readTime: 5,
              difficulty: 'beginner',
              popular: true,
              updatedAt: '2024-01-15T10:00:00Z'
            },
            {
              id: '2',
              title: 'Account Setup',
              slug: 'account-setup',
              description: 'Complete guide to setting up your restaurant account',
              readTime: 8,
              difficulty: 'beginner',
              popular: true,
              updatedAt: '2024-01-14T14:30:00Z'
            },
            {
              id: '3',
              title: 'First Steps Checklist',
              slug: 'first-steps-checklist',
              description: 'Essential tasks to complete when starting with RestoAI',
              readTime: 3,
              difficulty: 'beginner',
              popular: false,
              updatedAt: '2024-01-13T09:15:00Z'
            }
          ]
        },
        {
          id: 'menu-management',
          title: 'Menu Management',
          description: 'Learn how to create, organize, and optimize your digital menu',
          icon: <FileText className="w-8 h-8" />,
          color: 'from-blue-500 to-cyan-500',
          articles: [
            {
              id: '4',
              title: 'Creating Your Menu',
              slug: 'creating-your-menu',
              description: 'Step-by-step guide to building your digital menu',
              readTime: 10,
              difficulty: 'beginner',
              popular: true,
              updatedAt: '2024-01-12T16:45:00Z'
            },
            {
              id: '5',
              title: 'Menu Categories & Items',
              slug: 'menu-categories-items',
              description: 'Organize your menu with categories and manage individual items',
              readTime: 7,
              difficulty: 'beginner',
              popular: false,
              updatedAt: '2024-01-11T11:20:00Z'
            },
            {
              id: '6',
              title: 'Pricing Strategies',
              slug: 'pricing-strategies',
              description: 'Best practices for menu pricing and profit optimization',
              readTime: 12,
              difficulty: 'intermediate',
              popular: true,
              updatedAt: '2024-01-10T13:10:00Z'
            }
          ]
        },
        {
          id: 'order-management',
          title: 'Order Management',
          description: 'Handle orders efficiently from placement to fulfillment',
          icon: <CreditCard className="w-8 h-8" />,
          color: 'from-purple-500 to-violet-500',
          articles: [
            {
              id: '7',
              title: 'Processing Orders',
              slug: 'processing-orders',
              description: 'Complete workflow for handling customer orders',
              readTime: 8,
              difficulty: 'beginner',
              popular: true,
              updatedAt: '2024-01-09T15:25:00Z'
            },
            {
              id: '8',
              title: 'Kitchen Display System',
              slug: 'kitchen-display-system',
              description: 'Set up and use the digital kitchen display',
              readTime: 6,
              difficulty: 'intermediate',
              popular: false,
              updatedAt: '2024-01-08T10:40:00Z'
            }
          ]
        },
        {
          id: 'customer-management',
          title: 'Customer Management',
          description: 'Build relationships and manage your customer base',
          icon: <Users className="w-8 h-8" />,
          color: 'from-orange-500 to-red-500',
          articles: [
            {
              id: '9',
              title: 'Customer Profiles',
              slug: 'customer-profiles',
              description: 'Manage customer information and preferences',
              readTime: 5,
              difficulty: 'beginner',
              popular: false,
              updatedAt: '2024-01-07T12:15:00Z'
            },
            {
              id: '10',
              title: 'Loyalty Programs',
              slug: 'loyalty-programs',
              description: 'Set up and manage customer loyalty rewards',
              readTime: 9,
              difficulty: 'intermediate',
              popular: true,
              updatedAt: '2024-01-06T14:50:00Z'
            }
          ]
        },
        {
          id: 'analytics',
          title: 'Analytics & Reports',
          description: 'Understand your business with comprehensive analytics',
          icon: <BarChart3 className="w-8 h-8" />,
          color: 'from-pink-500 to-rose-500',
          articles: [
            {
              id: '11',
              title: 'Dashboard Overview',
              slug: 'dashboard-overview',
              description: 'Navigate and understand your analytics dashboard',
              readTime: 7,
              difficulty: 'beginner',
              popular: true,
              updatedAt: '2024-01-05T09:30:00Z'
            },
            {
              id: '12',
              title: 'Custom Reports',
              slug: 'custom-reports',
              description: 'Create and schedule custom business reports',
              readTime: 11,
              difficulty: 'advanced',
              popular: false,
              updatedAt: '2024-01-04T16:20:00Z'
            }
          ]
        },
        {
          id: 'integrations',
          title: 'Integrations & API',
          description: 'Connect RestoAI with your existing tools and systems',
          icon: <Code className="w-8 h-8" />,
          color: 'from-indigo-500 to-purple-500',
          articles: [
            {
              id: '13',
              title: 'API Documentation',
              slug: 'api-documentation',
              description: 'Complete reference for the RestoAI API',
              readTime: 15,
              difficulty: 'advanced',
              popular: true,
              updatedAt: '2024-01-03T11:45:00Z'
            },
            {
              id: '14',
              title: 'Third-party Integrations',
              slug: 'third-party-integrations',
              description: 'Connect with popular restaurant tools and services',
              readTime: 8,
              difficulty: 'intermediate',
              popular: false,
              updatedAt: '2024-01-02T13:25:00Z'
            }
          ]
        }
      ];

      setSections(sectionsData);

      // Get popular articles
      const allArticles = sectionsData.flatMap(section => section.articles);
      const popular = allArticles.filter(article => article.popular);
      setPopularArticles(popular);

    } catch (error) {
      console.error('Failed to load docs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredSections = sections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      searchTerm === '' ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.articles.length > 0);

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
              <Link to="/docs" className="text-orange-500 font-medium">Documentation</Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                RestoAI
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block">
                  Documentation
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Everything you need to know to get the most out of RestoAI. 
                From quick start guides to advanced integrations.
              </p>

              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                  className="text-lg py-4"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      {searchTerm === '' && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular Articles
              </h2>
              <p className="text-gray-600">
                Most viewed guides to help you get started quickly
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={getDifficultyColor(article.difficulty)} size="sm">
                        {article.difficulty}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime} min
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 flex-grow">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Updated {formatDate(article.updatedAt)}
                      </span>
                      <Button
                        as={Link}
                        to={`/docs/${article.slug}`}
                        size="sm"
                        variant="outline"
                      >
                        Read More
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Documentation Sections */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchTerm && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Search Results for "{searchTerm}"
              </h2>
              <p className="text-gray-600">
                {filteredSections.reduce((total, section) => total + section.articles.length, 0)} articles found
              </p>
            </div>
          )}

          <div className="space-y-16">
            {filteredSections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              >
                <div className="text-center mb-12">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${section.color} text-white mb-6`}>
                    {section.icon}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    {section.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.articles.map((article, articleIndex) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: articleIndex * 0.1 }}
                    >
                      <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={getDifficultyColor(article.difficulty)} size="sm">
                            {article.difficulty}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            {article.popular && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {article.readTime} min
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 flex-grow">
                          {article.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Updated {formatDate(article.updatedAt)}
                          </span>
                          <Button
                            as={Link}
                            to={`/docs/${article.slug}`}
                            size="sm"
                            variant="outline"
                          >
                            Read Guide
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredSections.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms</p>
              <Button onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Need More Help?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                as={Link}
                to="/support"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </Button>
              <Button 
                as={Link}
                to="/contact"
                size="lg"
                variant="outline"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
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

export default DocsPage;
