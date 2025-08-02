import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Bell, Shield, Save } from 'lucide-react';
import { Customer } from '../../types';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { sdk } from '../../lib/config';
import toast from 'react-hot-toast';

interface CustomerSettingsPageProps {
  customer: Customer | null;
  onUpdate: () => void;
}

const CustomerSettingsPage: React.FC<CustomerSettingsPageProps> = ({ customer, onUpdate }) => {
  const [profile, setProfile] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    dateOfBirth: customer?.dateOfBirth || '',
  });
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    reservationReminders: true,
    newsletter: false,
  });
  
  const [privacy, setPrivacy] = useState({
    shareDataForPersonalization: true,
    allowMarketingEmails: true,
    showProfileToOthers: false,
  });
  
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!customer) return;
    
    try {
      setSaving(true);
      
      await sdk.update('customers', customer.id, {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Profile updated successfully!');
      onUpdate();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      {/* Profile Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Enter your full name"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Enter your email"
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
            
            <Input
              label="Date of Birth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
            />
          </div>
          
          <div className="mt-6">
            <Input
              label="Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Enter your address"
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveProfile}
              disabled={saving}
              icon={<Save className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {key === 'orderUpdates' && 'Get notified about your order status'}
                    {key === 'promotions' && 'Receive special offers and discounts'}
                    {key === 'reservationReminders' && 'Get reminders about upcoming reservations'}
                    {key === 'newsletter' && 'Receive our monthly newsletter'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {key === 'shareDataForPersonalization' && 'Allow us to use your data to personalize your experience'}
                    {key === 'allowMarketingEmails' && 'Receive marketing emails from us'}
                    {key === 'showProfileToOthers' && 'Make your profile visible to other customers'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPrivacy({ ...privacy, [key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Download Data</h3>
                <p className="text-sm text-gray-600">Download a copy of your account data</p>
              </div>
              <Button variant="outline">Download</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h3 className="font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CustomerSettingsPage;
