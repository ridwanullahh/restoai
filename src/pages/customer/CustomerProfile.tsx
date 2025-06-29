import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Save, Edit, Plus, Trash2 } from 'lucide-react';
import { useCustomer } from '../../contexts/CustomerContext';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const CustomerProfile: React.FC = () => {
  const { customer, updateCustomer } = useCustomer();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const [profileData, setProfileData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    preferences: customer?.preferences || {}
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    instructions: ''
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCustomer(profileData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const addresses = customer.addresses || [];
    
    if (editingAddress !== null) {
      addresses[editingAddress] = addressData;
    } else {
      addresses.push(addressData);
    }

    try {
      await updateCustomer({ addresses });
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setAddressData({ street: '', city: '', state: '', zipCode: '', instructions: '' });
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  const deleteAddress = async (index: number) => {
    if (!customer) return;
    
    const addresses = customer.addresses?.filter((_, i) => i !== index) || [];
    await updateCustomer({ addresses });
  };

  const editAddress = (index: number) => {
    const address = customer?.addresses?.[index];
    if (address) {
      setAddressData(address);
      setEditingAddress(index);
      setIsAddressModalOpen(true);
    }
  };

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Halal', 'Kosher'];
  const cuisineOptions = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai', 'Mediterranean', 'American'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        <Button
          onClick={() => setIsEditModalOpen(true)}
          icon={<Edit className="w-5 h-5" />}
        >
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{customer?.name || 'Customer'}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{customer?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Addresses */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddressModalOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Address
                </Button>
              </div>

              <div className="space-y-4">
                {customer?.addresses?.length === 0 || !customer?.addresses ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No saved addresses</p>
                  </div>
                ) : (
                  customer.addresses.map((address, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">{address.street}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            {address.instructions && (
                              <p className="text-sm text-gray-500 mt-1">
                                Instructions: {address.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editAddress(index)}
                            icon={<Edit className="w-4 h-4" />}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAddress(index)}
                            icon={<Trash2 className="w-4 h-4" />}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Dietary Preferences</h2>
              <div className="space-y-3">
                {customer?.preferences?.dietary?.length === 0 || !customer?.preferences?.dietary ? (
                  <p className="text-gray-500 text-sm">No dietary preferences set</p>
                ) : (
                  customer.preferences.dietary.map((diet: string, index: number) => (
                    <span key={index} className="inline-flex px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full mr-2 mb-2">
                      {diet}
                    </span>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Favorite Cuisines</h2>
              <div className="space-y-3">
                {customer?.preferences?.cuisine?.length === 0 || !customer?.preferences?.cuisine ? (
                  <p className="text-gray-500 text-sm">No cuisine preferences set</p>
                ) : (
                  customer.preferences.cuisine.map((cuisine: string, index: number) => (
                    <span key={index} className="inline-flex px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full mr-2 mb-2">
                      {cuisine}
                    </span>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Stats</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium text-gray-900">
                    {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="font-medium text-gray-900">{customer?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loyalty Points</span>
                  <span className="font-medium text-purple-600">{customer?.loyaltyPoints || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="lg"
      >
        <div className="p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Preferences
              </label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.dietary?.includes(option) || false}
                      onChange={(e) => {
                        const dietary = profileData.preferences.dietary || [];
                        if (e.target.checked) {
                          setProfileData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              dietary: [...dietary, option]
                            }
                          }));
                        } else {
                          setProfileData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              dietary: dietary.filter(d => d !== option)
                            }
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favorite Cuisines
              </label>
              <div className="grid grid-cols-2 gap-2">
                {cuisineOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.cuisine?.includes(option) || false}
                      onChange={(e) => {
                        const cuisine = profileData.preferences.cuisine || [];
                        if (e.target.checked) {
                          setProfileData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              cuisine: [...cuisine, option]
                            }
                          }));
                        } else {
                          setProfileData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              cuisine: cuisine.filter(c => c !== option)
                            }
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Add/Edit Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
          setAddressData({ street: '', city: '', state: '', zipCode: '', instructions: '' });
        }}
        title={editingAddress !== null ? 'Edit Address' : 'Add New Address'}
      >
        <div className="p-6">
          <form onSubmit={handleAddressSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={addressData.street}
                onChange={(e) => setAddressData(prev => ({ ...prev, street: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={addressData.city}
                  onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={addressData.state}
                  onChange={(e) => setAddressData(prev => ({ ...prev, state: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={addressData.zipCode}
                  onChange={(e) => setAddressData(prev => ({ ...prev, zipCode: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Instructions (Optional)
              </label>
              <textarea
                value={addressData.instructions}
                onChange={(e) => setAddressData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Ring doorbell, Leave at door, etc."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setEditingAddress(null);
                  setAddressData({ street: '', city: '', state: '', zipCode: '', instructions: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" icon={<Save className="w-4 h-4" />}>
                {editingAddress !== null ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CustomerProfile;