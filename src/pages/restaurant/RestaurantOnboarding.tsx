import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, MapPin, Clock, Palette, Check, ArrowRight, Upload } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const RestaurantOnboarding: React.FC = () => {
  const { createRestaurant } = useRestaurant();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    description: '',
    cuisine: '',
    
    // Step 2: Location & Contact
    address: '',
    phone: '',
    email: '',
    website: '',
    
    // Step 3: Hours
    hours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    
    // Step 4: Branding
    logo: '',
    coverImage: '',
    primaryColor: '#f97316',
    secondaryColor: '#ea580c'
  });

  const steps = [
    { id: 1, title: 'Basic Information', icon: <ChefHat className="w-5 h-5" /> },
    { id: 2, title: 'Location & Contact', icon: <MapPin className="w-5 h-5" /> },
    { id: 3, title: 'Operating Hours', icon: <Clock className="w-5 h-5" /> },
    { id: 4, title: 'Branding', icon: <Palette className="w-5 h-5" /> }
  ];

  const cuisineTypes = [
    'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai', 'Mediterranean', 
    'American', 'French', 'Greek', 'Korean', 'Vietnamese', 'Middle Eastern', 'Other'
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.description && formData.cuisine);
      case 2:
        return !!(formData.address && formData.phone && formData.email);
      case 3:
        return true; // Hours are optional
      case 4:
        return true; // Branding is optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const restaurantData = {
        name: formData.name,
        description: formData.description,
        cuisine: formData.cuisine,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logo: formData.logo || 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=200',
        coverImage: formData.coverImage || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
        hours: formData.hours,
        settings: {
          theme: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            accentColor: '#fb923c'
          },
          features: {
            onlineOrdering: true,
            reservations: true,
            loyalty: true,
            reviews: true,
            delivery: false,
            takeout: true
          },
          notifications: {
            email: true,
            sms: false,
            push: true,
            orderNotifications: true,
            reviewNotifications: true,
            promotionNotifications: false
          }
        }
      };

      await createRestaurant(restaurantData);
      toast.success('Restaurant setup completed! Welcome to RestaurantOS!');
    } catch (error) {
      console.error('Failed to create restaurant:', error);
      toast.error('Failed to create restaurant');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your restaurant name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe your restaurant, cuisine style, and what makes it special..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type *
              </label>
              <select
                value={formData.cuisine}
                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select cuisine type</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Full restaurant address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="restaurant@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://yourrestaurant.com"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your Operating Hours</h3>
              <p className="text-gray-600">Configure when your restaurant is open for business</p>
            </div>

            <div className="space-y-4">
              {days.map((day) => (
                <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-24">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!formData.hours[day as keyof typeof formData.hours]?.closed}
                      onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-600">Open</span>
                  </div>

                  {!formData.hours[day as keyof typeof formData.hours]?.closed && (
                    <>
                      <input
                        type="time"
                        value={formData.hours[day as keyof typeof formData.hours]?.open || '09:00'}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={formData.hours[day as keyof typeof formData.hours]?.close || '22:00'}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize Your Brand</h3>
              <p className="text-gray-600">Add your logo, cover image, and brand colors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://example.com/logo.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => handleInputChange('coverImage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Brand Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Brand Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> You can upload custom images later through the dashboard settings. 
                For now, we'll use default placeholder images that you can replace anytime.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="p-3 bg-orange-100 rounded-full">
              <ChefHat className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to RestaurantOS</h1>
          </motion.div>
          <p className="text-gray-600">Let's set up your restaurant in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                currentStep >= step.id 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.icon
                )}
                <span className="font-medium text-sm">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card className="max-w-2xl mx-auto">
          <div className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </div>

              {currentStep < steps.length ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!validateStep(currentStep)}
                  icon={<Check className="w-4 h-4" />}
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RestaurantOnboarding;