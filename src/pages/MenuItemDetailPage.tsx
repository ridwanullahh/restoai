import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, ShoppingBag, Star, Clock, Users, AlertCircle } from 'lucide-react';
import { sdk } from '../lib/config';
import { MenuItem, Restaurant } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

interface CartItem extends MenuItem {
  quantity: number;
  customizations?: Array<{
    name: string;
    option: string;
    price: number;
  }>;
  specialInstructions?: string;
}

const MenuItemDetailPage: React.FC = () => {
  const { restaurantSlug, itemId } = useParams<{ restaurantSlug: string; itemId: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (restaurantSlug && itemId) {
      loadData();
    }
  }, [restaurantSlug, itemId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load restaurant
      const restaurants = await sdk.queryBuilder<Restaurant>('restaurants')
        .where(r => r.slug === restaurantSlug && r.active === true)
        .exec();
      
      if (restaurants.length === 0) {
        navigate('/');
        return;
      }
      
      setRestaurant(restaurants[0]);
      
      // Load menu item
      const menuItems = await sdk.queryBuilder<MenuItem>('menuItems')
        .where(item => item.id === itemId && item.restaurantId === restaurants[0].id)
        .exec();
      
      if (menuItems.length === 0) {
        navigate(`/${restaurantSlug}`);
        return;
      }
      
      setMenuItem(menuItems[0]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load menu item');
      navigate(`/${restaurantSlug}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!menuItem) return 0;
    
    let total = menuItem.price * quantity;
    
    // Add customization prices
    if (menuItem.customizations) {
      menuItem.customizations.forEach(customization => {
        const selectedOption = selectedCustomizations[customization.name];
        if (selectedOption) {
          const option = customization.options.find(opt => opt.name === selectedOption);
          if (option) {
            total += option.price * quantity;
          }
        }
      });
    }
    
    return total;
  };

  const handleCustomizationChange = (customizationName: string, optionName: string) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [customizationName]: optionName
    }));
  };

  const addToCart = async () => {
    if (!menuItem || !restaurant) return;
    
    // Validate required customizations
    if (menuItem.customizations) {
      const missingRequired = menuItem.customizations.filter(
        custom => custom.required && !selectedCustomizations[custom.name]
      );
      
      if (missingRequired.length > 0) {
        toast.error(`Please select: ${missingRequired.map(c => c.name).join(', ')}`);
        return;
      }
    }
    
    setAddingToCart(true);
    
    try {
      // Get current cart from localStorage
      const cartKey = `cart_${restaurantSlug}`;
      const existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      // Create cart item
      const cartItem: CartItem = {
        ...menuItem,
        quantity,
        customizations: menuItem.customizations?.map(custom => ({
          name: custom.name,
          option: selectedCustomizations[custom.name] || '',
          price: custom.options.find(opt => opt.name === selectedCustomizations[custom.name])?.price || 0
        })).filter(c => c.option),
        specialInstructions: specialInstructions || undefined
      };
      
      // Check if same item with same customizations exists
      const existingItemIndex = existingCart.findIndex((item: CartItem) => 
        item.id === menuItem.id && 
        JSON.stringify(item.customizations) === JSON.stringify(cartItem.customizations)
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        existingCart.push(cartItem);
      }
      
      // Save updated cart
      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      
      toast.success(`${menuItem.name} added to cart!`);
      
      // Navigate back to menu
      navigate(`/${restaurantSlug}/menu`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!menuItem || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h1>
          <p className="text-gray-600 mb-4">The menu item you're looking for doesn't exist.</p>
          <Link to={`/${restaurantSlug}`}>
            <Button>Back to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/${restaurantSlug}/menu`)}
                icon={<ArrowLeft className="w-5 h-5" />}
              >
                Back to Menu
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
              </div>
            </div>
            <Link to={`/${restaurantSlug}/checkout`}>
              <Button icon={<ShoppingBag className="w-5 h-5" />}>
                View Cart
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Image Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <img
                src={menuItem.image}
                alt={menuItem.name}
                className="w-full h-96 object-cover"
              />
            </Card>
            
            {/* Item Info */}
            <Card>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{menuItem.name}</h1>
                    <p className="text-3xl font-bold text-orange-600">${menuItem.price.toFixed(2)}</p>
                  </div>
                  {menuItem.featured && (
                    <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      <Star className="w-4 h-4 mr-1" />
                      Featured
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">{menuItem.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span className="inline-flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    15-20 min
                  </span>
                  <span className="inline-flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Serves 1-2
                  </span>
                </div>
                
                {/* Allergens */}
                {menuItem.allergens && menuItem.allergens.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Contains:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {menuItem.allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Nutritional Info */}
                {menuItem.nutritionalInfo && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Nutritional Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {menuItem.nutritionalInfo.calories && (
                        <div>
                          <span className="text-gray-500">Calories:</span>
                          <span className="ml-2 font-medium">{menuItem.nutritionalInfo.calories}</span>
                        </div>
                      )}
                      {menuItem.nutritionalInfo.protein && (
                        <div>
                          <span className="text-gray-500">Protein:</span>
                          <span className="ml-2 font-medium">{menuItem.nutritionalInfo.protein}g</span>
                        </div>
                      )}
                      {menuItem.nutritionalInfo.carbs && (
                        <div>
                          <span className="text-gray-500">Carbs:</span>
                          <span className="ml-2 font-medium">{menuItem.nutritionalInfo.carbs}g</span>
                        </div>
                      )}
                      {menuItem.nutritionalInfo.fat && (
                        <div>
                          <span className="text-gray-500">Fat:</span>
                          <span className="ml-2 font-medium">{menuItem.nutritionalInfo.fat}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Section */}
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customize Your Order</h2>
                
                {/* Customizations */}
                {menuItem.customizations && menuItem.customizations.length > 0 && (
                  <div className="space-y-6 mb-6">
                    {menuItem.customizations.map((customization, idx) => (
                      <div key={idx}>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          {customization.name}
                          {customization.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <div className="space-y-2">
                          {customization.options.map((option, optIdx) => (
                            <label key={optIdx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                              <div className="flex items-center">
                                <input
                                  type={customization.type === 'single' ? 'radio' : 'checkbox'}
                                  name={customization.name}
                                  value={option.name}
                                  checked={selectedCustomizations[customization.name] === option.name}
                                  onChange={() => handleCustomizationChange(customization.name, option.name)}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                                />
                                <span className="ml-3 text-sm text-gray-900">{option.name}</span>
                              </div>
                              {option.price > 0 && (
                                <span className="text-sm text-gray-600">+${option.price.toFixed(2)}</span>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Special Instructions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any special requests or modifications..."
                  />
                </div>
                
                {/* Quantity */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-gray-700">Quantity</span>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      icon={<Minus className="w-4 h-4" />}
                    />
                    <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      icon={<Plus className="w-4 h-4" />}
                    />
                  </div>
                </div>
                
                {/* Total Price */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-orange-600">${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <Button
                  onClick={addToCart}
                  disabled={!menuItem.available || addingToCart}
                  className="w-full"
                  size="lg"
                  icon={<ShoppingBag className="w-5 h-5" />}
                >
                  {addingToCart ? 'Adding to Cart...' : 
                   !menuItem.available ? 'Currently Unavailable' : 
                   'Add to Cart'}
                </Button>
                
                {!menuItem.available && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    This item is currently unavailable. Please check back later.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MenuItemDetailPage;
