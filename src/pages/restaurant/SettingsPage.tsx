import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Upload, Bell, Shield, Palette, Globe, Clock, DollarSign } from 'lucide-react';
import { useRestaurant } from '../../contexts/RestaurantContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { currentRestaurant, updateRestaurant } = useRestaurant();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    coverImage: ''
  });

  const [hoursSettings, setHoursSettings] = useState({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '09:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  });

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#f97316',
    secondaryColor: '#ea580c',
    accentColor: '#fb923c'
  });

  const [featureSettings, setFeatureSettings] = useState({
    onlineOrdering: true,
    reservations: true,
    loyalty: true,
    reviews: true,
    delivery: false,
    takeout: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    orderNotifications: true,
    reviewNotifications: true,
    promotionNotifications: false
  });

  useEffect(() => {
    if (currentRestaurant) {
      setGeneralSettings({
        name: currentRestaurant.name || '',
        description: currentRestaurant.description || '',
        cuisine: currentRestaurant.cuisine || '',
        address: currentRestaurant.address || '',
        phone: currentRestaurant.phone || '',
        email: currentRestaurant.email || '',
        website: currentRestaurant.website || '',
        logo: currentRestaurant.logo || '',
        coverImage: currentRestaurant.coverImage || ''
      });

      if (currentRestaurant.hours) {
        setHoursSettings(currentRestaurant.hours as any);
      }

      if (currentRestaurant.settings?.theme) {
        setThemeSettings({
          primaryColor: currentRestaurant.settings.theme.primaryColor || '#f97316',
          secondaryColor: currentRestaurant.settings.theme.secondaryColor || '#ea580c',
          accentColor: currentRestaurant.settings.theme.accentColor || '#fb923c'
        });
      }

      if (currentRestaurant.settings?.features) {
        setFeatureSettings({
          onlineOrdering: currentRestaurant.settings.features.onlineOrdering ?? true,
          reservations: currentRestaurant.settings.features.reservations ?? true,
          loyalty: currentRestaurant.settings.features.loyalty ?? true,
          reviews: currentRestaurant.settings.features.reviews ?? true,
          delivery: currentRestaurant.settings.features.delivery ?? false,
          takeout: currentRestaurant.settings.features.takeout ?? true
        });
      }

      if (currentRestaurant.settings?.notifications) {
        setNotificationSettings({
          email: currentRestaurant.settings.notifications.email ?? true,
          sms: currentRestaurant.settings.notifications.sms ?? false,
          push: currentRestaurant.settings.notifications.push ?? true,
          orderNotifications: currentRestaurant.settings.notifications.orderNotifications ?? true,
          reviewNotifications: currentRestaurant.settings.notifications.reviewNotifications ?? true,
          promotionNotifications: currentRestaurant.settings.notifications.promotionNotifications ?? false
        });
      }
    }
  }, [currentRestaurant]);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      await updateRestaurant(currentRestaurant.id, generalSettings);
      toast.success('General settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update general settings');
    } finally {
      setLoading(false);
    }
  };

  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      await updateRestaurant(currentRestaurant.id, { hours: hoursSettings });
      toast.success('Operating hours updated successfully!');
    } catch (error) {
      toast.error('Failed to update operating hours');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      const settings = {
        ...currentRestaurant.settings,
        theme: themeSettings
      };
      await updateRestaurant(currentRestaurant.id, { settings });
      toast.success('Theme settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update theme settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      const settings = {
        ...currentRestaurant.settings,
        features: featureSettings
      };
      await updateRestaurant(currentRestaurant.id, { settings });
      toast.success('Feature settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update feature settings');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;

    setLoading(true);
    try {
      const settings = {
        ...currentRestaurant.settings,
        notifications: notificationSettings
      };
      await updateRestaurant(currentRestaurant.id, { settings });
      toast.success('Notification settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-5 h-5" /> },
    { id: 'hours', label: 'Operating Hours', icon: <Clock className="w-5 h-5" /> },
    { id: 'theme', label: 'Theme & Branding', icon: <Palette className="w-5 h-5" /> },
    { id: 'features', label: 'Features', icon: <Globe className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Settings</h1>
          <p className="text-gray-600">Manage your restaurant configuration and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">General Information</h2>
                <form onSubmit={handleGeneralSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restaurant Name *
                      </label>
                      <input
                        type="text"
                        value={generalSettings.name}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cuisine Type
                      </label>
                      <input
                        type="text"
                        value={generalSettings.cuisine}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, cuisine: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={generalSettings.description}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={generalSettings.phone}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={generalSettings.email}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={generalSettings.website}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* Operating Hours */}
          {activeTab === 'hours' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Operating Hours</h2>
                <form onSubmit={handleHoursSubmit} className="space-y-4">
                  {days.map((day) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-24">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!hoursSettings[day as keyof typeof hoursSettings]?.closed}
                          onChange={(e) => setHoursSettings(prev => ({
                            ...prev,
                            [day]: { ...prev[day as keyof typeof prev], closed: !e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </div>

                      {!hoursSettings[day as keyof typeof hoursSettings]?.closed && (
                        <>
                          <input
                            type="time"
                            value={hoursSettings[day as keyof typeof hoursSettings]?.open || '09:00'}
                            onChange={(e) => setHoursSettings(prev => ({
                              ...prev,
                              [day]: { ...prev[day as keyof typeof prev], open: e.target.value }
                            }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={hoursSettings[day as keyof typeof hoursSettings]?.close || '22:00'}
                            onChange={(e) => setHoursSettings(prev => ({
                              ...prev,
                              [day]: { ...prev[day as keyof typeof prev], close: e.target.value }
                            }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-4">
                    <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                      Save Hours
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Theme & Branding</h2>
                <form onSubmit={handleThemeSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={themeSettings.primaryColor}
                          onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-12 h-10 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={themeSettings.primaryColor}
                          onChange={(e) => setThemeSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={themeSettings.secondaryColor}
                          onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="w-12 h-10 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={themeSettings.secondaryColor}
                          onChange={(e) => setThemeSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accent Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={themeSettings.accentColor}
                          onChange={(e) => setThemeSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-12 h-10 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={themeSettings.accentColor}
                          onChange={(e) => setThemeSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                      Save Theme
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* Feature Settings */}
          {activeTab === 'features' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Feature Settings</h2>
                <form onSubmit={handleFeaturesSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(featureSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </label>
                          <p className="text-xs text-gray-500">
                            {key === 'onlineOrdering' && 'Allow customers to place orders online'}
                            {key === 'reservations' && 'Enable table reservation system'}
                            {key === 'loyalty' && 'Activate customer loyalty program'}
                            {key === 'reviews' && 'Allow customer reviews and ratings'}
                            {key === 'delivery' && 'Offer delivery service'}
                            {key === 'takeout' && 'Enable takeout orders'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setFeatureSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                          className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                      Save Features
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Notification Channels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['email', 'sms', 'push'].map((channel) => (
                        <div key={channel} className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {channel} Notifications
                          </label>
                          <input
                            type="checkbox"
                            checked={notificationSettings[channel as keyof typeof notificationSettings] as boolean}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, [channel]: e.target.checked }))}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-md font-medium text-gray-900">Notification Types</h3>
                    <div className="space-y-3">
                      {['orderNotifications', 'reviewNotifications', 'promotionNotifications'].map((type) => (
                        <div key={type} className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700">
                              {type === 'orderNotifications' && 'New Order Notifications'}
                              {type === 'reviewNotifications' && 'New Review Notifications'}
                              {type === 'promotionNotifications' && 'Promotion Reminders'}
                            </label>
                            <p className="text-xs text-gray-500">
                              {type === 'orderNotifications' && 'Get notified when new orders are placed'}
                              {type === 'reviewNotifications' && 'Get notified when customers leave reviews'}
                              {type === 'promotionNotifications' && 'Reminders about active promotions'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings[type as keyof typeof notificationSettings] as boolean}
                            onChange={(e) => setNotificationSettings(prev => ({ ...prev, [type]: e.target.checked }))}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                      Save Notifications
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;