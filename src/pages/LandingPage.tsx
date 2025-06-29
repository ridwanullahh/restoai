import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChefHat, Users, BarChart3, Star, ArrowRight, Play, Check, Zap, Shield, Globe } from 'lucide-react';
import { sdk } from '../lib/config';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  coverImage: string;
  description: string;
}

const LandingPage: React.FC = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedRestaurants();
  }, []);

  const loadFeaturedRestaurants = async () => {
    try {
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where(r => r.active === true)
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
      icon: <ChefHat className="w-8 h-8" />,
      title: "Smart Menu Management",
      description: "AI-powered menu optimization with real-time analytics and customer preferences"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer Experience",
      description: "Seamless ordering, loyalty programs, and personalized recommendations"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Deep insights into sales, customer behavior, and business performance"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Automation",
      description: "Automated responses, inventory management, and predictive analytics"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Location Support",
      description: "Manage multiple restaurant locations from a single dashboard"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Restaurants" },
    { number: "1M+", label: "Orders Processed" },
    { number: "99.9%", label: "Uptime" },
    { number: "4.9/5", label: "Customer Rating" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChefHat className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">RestaurantOS</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/restaurant/auth" className="text-gray-600 hover:text-gray-900">
                Restaurant Login
              </Link>
              <Link to="/customer/auth" className="text-gray-600 hover:text-gray-900">
                Customer Login
              </Link>
              <Button as={Link} to="/restaurant/auth">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                The Future of
                <span className="text-orange-500 block">Restaurant Management</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Revolutionary AI-powered SaaS platform that transforms how restaurants connect with customers. 
                Boost efficiency, increase revenue, and deliver unmatched dining experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" as={Link} to="/restaurant/auth" icon={<ArrowRight className="w-5 h-5" />}>
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" icon={<Play className="w-5 h-5" />}>
                  Watch Demo
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Performance</h3>
                    <span className="text-green-500 text-sm font-medium">+12.5%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-orange-600 text-sm font-medium">Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">$2,847</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-600 text-sm font-medium">Orders</p>
                      <p className="text-2xl font-bold text-gray-900">127</p>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-end justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Real-time Analytics</p>
                    </div>
                  </div>
                </div>
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-orange-500 mb-2">{stat.number}</div>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and insights you need to run a successful restaurant business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="h-full p-8 text-center">
                  <div className="text-orange-500 mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
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

      {/* Featured Restaurants */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Restaurants
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing restaurants powered by our platform
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl h-64"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link to={`/${restaurant.slug}`}>
                    <Card hover className="overflow-hidden">
                      <img
                        src={restaurant.coverImage}
                        alt={restaurant.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {restaurant.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">
                              {restaurant.rating} ({restaurant.reviewCount})
                            </span>
                          </div>
                        </div>
                        <p className="text-orange-500 text-sm font-medium mb-2">
                          {restaurant.cuisine}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {restaurant.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Restaurant?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of restaurants already using RestaurantOS to boost their business.
              Start your free trial today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                as={Link} 
                to="/restaurant/auth"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-500"
              >
                Schedule Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChefHat className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold">RestaurantOS</h3>
              </div>
              <p className="text-gray-400">
                The future of restaurant management, powered by AI.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RestaurantOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;