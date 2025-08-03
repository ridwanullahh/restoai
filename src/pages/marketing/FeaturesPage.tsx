import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Brain, 
  BarChart3, 
  Users, 
  Smartphone, 
  Shield,
  Zap,
  Globe,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Camera,
  MessageCircle,
  Calendar,
  CreditCard,
  Truck,
  Award,
  Target,
  Settings,
  Database,
  Lock,
  Wifi
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const FeaturesPage: React.FC = () => {
  const featureCategories = [
    {
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning capabilities that transform your restaurant operations",
      icon: <Brain className="w-8 h-8" />,
      color: "from-purple-500 to-indigo-500",
      features: [
        {
          name: "Predictive Analytics",
          description: "Forecast demand, optimize inventory, and predict customer behavior with 95% accuracy",
          icon: <TrendingUp className="w-6 h-6" />
        },
        {
          name: "Customer Segmentation",
          description: "AI-powered customer analysis with behavioral insights and personalized recommendations",
          icon: <Users className="w-6 h-6" />
        },
        {
          name: "Menu Optimization",
          description: "Data-driven menu recommendations with pricing optimization and profit maximization",
          icon: <Target className="w-6 h-6" />
        },
        {
          name: "Business Intelligence",
          description: "Automated insights and recommendations with confidence scoring and impact analysis",
          icon: <Brain className="w-6 h-6" />
        }
      ]
    },
    {
      title: "Complete Restaurant Management",
      description: "Everything you need to run your restaurant efficiently",
      icon: <ChefHat className="w-8 h-8" />,
      color: "from-orange-500 to-red-500",
      features: [
        {
          name: "Advanced POS System",
          description: "Lightning-fast order processing with offline capabilities and real-time synchronization",
          icon: <CreditCard className="w-6 h-6" />
        },
        {
          name: "Kitchen Display System",
          description: "Real-time order management with timer tracking and priority handling",
          icon: <Clock className="w-6 h-6" />
        },
        {
          name: "Table Management",
          description: "Interactive floor plans with occupancy tracking and cleaning workflows",
          icon: <Calendar className="w-6 h-6" />
        },
        {
          name: "Staff Management",
          description: "Complete employee management with scheduling, performance tracking, and payroll",
          icon: <Users className="w-6 h-6" />
        }
      ]
    },
    {
      title: "Customer Experience",
      description: "Build lasting relationships with advanced customer engagement tools",
      icon: <Star className="w-8 h-8" />,
      color: "from-green-500 to-teal-500",
      features: [
        {
          name: "Gamification System",
          description: "25+ achievements, challenges, leaderboards, and tier progression for customer engagement",
          icon: <Award className="w-6 h-6" />
        },
        {
          name: "Loyalty Programs",
          description: "Advanced loyalty system with points, rewards, and personalized offers",
          icon: <Star className="w-6 h-6" />
        },
        {
          name: "Review Management",
          description: "Multi-platform review monitoring with automated responses and sentiment analysis",
          icon: <MessageCircle className="w-6 h-6" />
        },
        {
          name: "Customer Portal",
          description: "Dedicated customer dashboard with order history, favorites, and account management",
          icon: <Smartphone className="w-6 h-6" />
        }
      ]
    },
    {
      title: "Advanced Analytics",
      description: "Deep insights into every aspect of your restaurant business",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      features: [
        {
          name: "Real-time Dashboards",
          description: "Live performance metrics with customizable widgets and alerts",
          icon: <BarChart3 className="w-6 h-6" />
        },
        {
          name: "Financial Reports",
          description: "Comprehensive financial analysis with profit/loss, cash flow, and expense tracking",
          icon: <DollarSign className="w-6 h-6" />
        },
        {
          name: "Customer Analytics",
          description: "Detailed customer behavior analysis with lifetime value and retention metrics",
          icon: <Users className="w-6 h-6" />
        },
        {
          name: "Performance Metrics",
          description: "KPI tracking with benchmarking, goal setting, and performance optimization",
          icon: <TrendingUp className="w-6 h-6" />
        }
      ]
    },
    {
      title: "Marketing Automation",
      description: "Powerful marketing tools to grow your customer base",
      icon: <Zap className="w-8 h-8" />,
      color: "from-pink-500 to-rose-500",
      features: [
        {
          name: "Social Media Management",
          description: "Multi-platform posting with content templates and engagement analytics",
          icon: <Globe className="w-6 h-6" />
        },
        {
          name: "Email Campaigns",
          description: "Automated email marketing with segmentation and personalization",
          icon: <MessageCircle className="w-6 h-6" />
        },
        {
          name: "Promotion Management",
          description: "Create and manage discounts, coupons, and special offers",
          icon: <Target className="w-6 h-6" />
        },
        {
          name: "Referral System",
          description: "Customer referral programs with tracking and reward management",
          icon: <Users className="w-6 h-6" />
        }
      ]
    },
    {
      title: "Delivery & Operations",
      description: "Streamline delivery operations with advanced logistics",
      icon: <Truck className="w-8 h-8" />,
      color: "from-yellow-500 to-orange-500",
      features: [
        {
          name: "Delivery Management",
          description: "Real-time driver tracking with route optimization and delivery zones",
          icon: <Truck className="w-6 h-6" />
        },
        {
          name: "Inventory Tracking",
          description: "Real-time inventory management with low stock alerts and automated ordering",
          icon: <Database className="w-6 h-6" />
        },
        {
          name: "Multi-location Support",
          description: "Centralized management for restaurant chains with location-specific analytics",
          icon: <Globe className="w-6 h-6" />
        },
        {
          name: "Integration Hub",
          description: "Connect with 100+ third-party services including delivery platforms and POS systems",
          icon: <Settings className="w-6 h-6" />
        }
      ]
    }
  ];

  const technicalFeatures = [
    {
      name: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption and compliance standards",
      icon: <Shield className="w-8 h-8 text-green-500" />
    },
    {
      name: "99.9% Uptime",
      description: "Reliable infrastructure with automatic failover and disaster recovery",
      icon: <Wifi className="w-8 h-8 text-blue-500" />
    },
    {
      name: "Real-time Sync",
      description: "Instant data synchronization across all devices and locations",
      icon: <Zap className="w-8 h-8 text-yellow-500" />
    },
    {
      name: "Mobile Optimized",
      description: "Perfect mobile experience with offline capabilities and PWA support",
      icon: <Smartphone className="w-8 h-8 text-purple-500" />
    }
  ];

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
              <Link to="/features" className="text-orange-500 font-medium">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-orange-500 transition-colors">Pricing</Link>
              <Link to="/docs" className="text-gray-600 hover:text-orange-500 transition-colors">Documentation</Link>
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
              Every Feature You Need to
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block">
                Dominate Your Market
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              RestoAI provides the most comprehensive set of restaurant management features available. 
              From AI-powered analytics to advanced customer engagement tools.
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 text-lg"
              as={Link}
              to="/restaurant/auth"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {featureCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="mb-20"
            >
              <div className="text-center mb-12">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${category.color} text-white mb-6`}>
                  {category.icon}
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {category.title}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.features.map((feature, featureIndex) => (
                  <motion.div
                    key={featureIndex}
                    initial={{ opacity: 0, x: featureIndex % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: featureIndex * 0.1 }}
                  >
                    <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white flex-shrink-0`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {feature.name}
                          </h3>
                          <p className="text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technical Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Built for Enterprise Performance
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform is built with enterprise-grade infrastructure to ensure reliability, security, and performance.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technicalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center h-full">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Experience All These Features?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Start your 14-day free trial today and see how RestoAI can transform your restaurant operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                as={Link}
                to="/restaurant/auth"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-orange-500 px-8 py-4 text-lg font-semibold"
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

export default FeaturesPage;
