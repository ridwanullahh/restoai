import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Users, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Smartphone,
  Brain,
  Clock,
  DollarSign,
  Award,
  Play,
  Menu,
  X
} from 'lucide-react';
import { sdk } from '../../lib/config';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  rating: number;
  reviewCount: number;
  cuisine: string;
}

const MarketingHomePage: React.FC = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadFeaturedRestaurants();
  }, []);

  const loadFeaturedRestaurants = async () => {
    try {
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where((r: any) => r.active === true)
        .sort('rating', 'desc')
        .exec();
      setFeaturedRestaurants(restaurants.slice(0, 6));
    } catch (error) {
      console.error('Failed to load restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-12 h-12" />,
      title: "AI-Powered Intelligence",
      description: "Advanced machine learning algorithms provide predictive analytics, customer insights, and automated business recommendations.",
      benefits: ["Predictive Analytics", "Customer Segmentation", "Menu Optimization", "Revenue Forecasting"]
    },
    {
      icon: <Smartphone className="w-12 h-12" />,
      title: "Complete Digital Experience",
      description: "Comprehensive platform covering every aspect of restaurant operations from ordering to analytics.",
      benefits: ["Online Ordering", "Table Reservations", "Customer Portal", "Mobile Apps"]
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Advanced Analytics",
      description: "Real-time insights into sales performance, customer behavior, and operational efficiency.",
      benefits: ["Real-time Dashboards", "Custom Reports", "Performance Metrics", "Trend Analysis"]
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Customer Engagement",
      description: "Build lasting relationships with gamification, loyalty programs, and personalized experiences.",
      benefits: ["Loyalty Programs", "Gamification", "Review Management", "Social Integration"]
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Automation & Efficiency",
      description: "Streamline operations with intelligent automation and workflow optimization.",
      benefits: ["Order Management", "Inventory Tracking", "Staff Scheduling", "Kitchen Display"]
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Enterprise Security",
      description: "Bank-level security with compliance standards and data protection.",
      benefits: ["Data Encryption", "PCI Compliance", "GDPR Ready", "Secure Payments"]
    }
  ];

  const stats = [
    { number: "50,000+", label: "Restaurants Served", icon: <ChefHat className="w-6 h-6" /> },
    { number: "10M+", label: "Orders Processed", icon: <BarChart3 className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime Guarantee", icon: <Shield className="w-6 h-6" /> },
    { number: "4.9/5", label: "Customer Rating", icon: <Star className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Restaurant Owner",
      restaurant: "Bella Vista",
      content: "RestoAI transformed our operations completely. Revenue increased by 40% in just 3 months!",
      rating: 5,
      avatar: "/testimonial-1.jpg"
    },
    {
      name: "Michael Chen",
      role: "Chain Manager",
      restaurant: "Urban Eats (5 locations)",
      content: "Managing multiple locations has never been easier. The analytics are incredibly detailed.",
      rating: 5,
      avatar: "/testimonial-2.jpg"
    },
    {
      name: "Emma Rodriguez",
      role: "Head Chef",
      restaurant: "Fusion Kitchen",
      content: "The kitchen management system streamlined our entire workflow. Orders are processed 60% faster.",
      rating: 5,
      avatar: "/testimonial-3.jpg"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small restaurants and cafes",
      features: [
        "Up to 100 orders/month",
        "Basic menu management",
        "Customer reviews",
        "Basic analytics",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$149",
      period: "/month",
      description: "Ideal for growing restaurants",
      features: [
        "Unlimited orders",
        "Advanced menu management",
        "AI-powered analytics",
        "Customer loyalty program",
        "Social media integration",
        "Priority support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$399",
      period: "/month",
      description: "For restaurant chains and franchises",
      features: [
        "Multi-location management",
        "Advanced AI features",
        "Custom integrations",
        "White-label options",
        "Dedicated account manager",
        "24/7 phone support"
      ],
      popular: false
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-gray-600 hover:text-orange-500 transition-colors">Features</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-orange-500 transition-colors">Pricing</Link>
              <Link to="/blog" className="text-gray-600 hover:text-orange-500 transition-colors">Blog</Link>
              <Link to="/docs" className="text-gray-600 hover:text-orange-500 transition-colors">Documentation</Link>
              <Link to="/support" className="text-gray-600 hover:text-orange-500 transition-colors">Support</Link>
              <Link to="/about" className="text-gray-600 hover:text-orange-500 transition-colors">About</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/restaurant/auth" className="text-gray-600 hover:text-orange-500 transition-colors">
                Sign In
              </Link>
              <Button as={Link} to="/restaurant/auth" className="bg-gradient-to-r from-orange-500 to-red-500">
                Start Free Trial
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <Link to="/features" className="text-gray-600 hover:text-orange-500 transition-colors">Features</Link>
                <Link to="/pricing" className="text-gray-600 hover:text-orange-500 transition-colors">Pricing</Link>
                <Link to="/blog" className="text-gray-600 hover:text-orange-500 transition-colors">Blog</Link>
                <Link to="/docs" className="text-gray-600 hover:text-orange-500 transition-colors">Documentation</Link>
                <Link to="/support" className="text-gray-600 hover:text-orange-500 transition-colors">Support</Link>
                <Link to="/about" className="text-gray-600 hover:text-orange-500 transition-colors">About</Link>
                <div className="pt-4 border-t border-gray-100">
                  <Link to="/restaurant/auth" className="block text-gray-600 hover:text-orange-500 transition-colors mb-2">
                    Sign In
                  </Link>
                  <Button as={Link} to="/restaurant/auth" className="w-full bg-gradient-to-r from-orange-500 to-red-500">
                    Start Free Trial
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  <Zap className="w-4 h-4 mr-1" />
                  AI-Powered Restaurant Platform
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                The Future of
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block">
                  Restaurant Success
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Revolutionary AI-powered SaaS platform that transforms how restaurants operate. 
                Boost efficiency by 300%, increase revenue by 200%, and deliver unmatched dining experiences.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 text-lg"
                  as={Link}
                  to="/restaurant/auth"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-4 text-lg border-2 border-gray-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="/dashboard-preview.png"
                  alt="RestoAI Dashboard"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Live Analytics</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-8 -left-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-4 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need to
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block">
                  Dominate Your Market
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our comprehensive platform includes every feature you need to run a successful restaurant business in the digital age.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                  <div className="text-orange-500 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the perfect plan for your restaurant. All plans include a 14-day free trial.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`p-8 h-full relative ${
                  plan.popular 
                    ? 'border-2 border-orange-500 shadow-xl scale-105' 
                    : 'border border-gray-200'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                        : 'border-2 border-gray-300 text-gray-700 hover:border-orange-500'
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                    as={Link}
                    to="/restaurant/auth"
                  >
                    Start Free Trial
                  </Button>
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
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Join thousands of successful restaurants using RestoAI to boost their revenue and streamline operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                as={Link}
                to="/restaurant/auth"
              >
                Start Your Free Trial
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
              <p className="text-gray-400 mb-6">
                The ultimate AI-powered restaurant management platform for the modern food industry.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><Link to="/api" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-white transition-colors">Support</Link></li>
                <li><Link to="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
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

export default MarketingHomePage;
