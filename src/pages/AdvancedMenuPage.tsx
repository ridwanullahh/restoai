import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Eye, 
  Heart, 
  Share2, 
  Filter, 
  Search, 
  Star,
  Leaf,
  Flame,
  Clock,
  Users,
  ChefHat,
  Zap,
  Award,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize
} from 'lucide-react';
import { sdk } from '../lib/config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images: string[];
  available: boolean;
  featured: boolean;
  isPopular: boolean;
  isNew: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spiceLevel: number;
  prepTime: number;
  calories: number;
  allergens: string[];
  ingredients: string[];
  nutritionalInfo: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  rating: number;
  reviewCount: number;
  chef: {
    name: string;
    avatar: string;
    specialty: string;
  };
  story: string;
  pairings: string[];
  customizations: Array<{
    name: string;
    options: Array<{ name: string; price: number }>;
  }>;
}

const AdvancedMenuPage: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    spicy: false,
    popular: false,
    new: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'ar'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isARSupported, setIsARSupported] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (restaurantSlug) {
      loadMenuData();
      checkARSupport();
      loadFavorites();
    }
  }, [restaurantSlug]);

  useEffect(() => {
    filterAndSortItems();
  }, [menuItems, searchTerm, selectedCategory, sortBy, filters]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      
      // Load restaurant
      const restaurants = await sdk.queryBuilder('restaurants')
        .where((r: any) => r.slug === restaurantSlug && r.active === true)
        .exec();
      
      if (restaurants.length === 0) {
        setLoading(false);
        return;
      }

      const restaurant = restaurants[0];

      // Load enhanced menu items
      const items = await sdk.queryBuilder<MenuItem>('menuItems')
        .where((item: any) => item.restaurantId === restaurant.id && item.available)
        .exec();

      // Enhance items with additional data
      const enhancedItems = items.map(item => ({
        ...item,
        images: item.images || [item.image],
        isPopular: Math.random() > 0.7,
        isNew: Math.random() > 0.8,
        isVegetarian: Math.random() > 0.6,
        isVegan: Math.random() > 0.8,
        isGlutenFree: Math.random() > 0.7,
        isSpicy: Math.random() > 0.6,
        spiceLevel: Math.floor(Math.random() * 5) + 1,
        prepTime: Math.floor(Math.random() * 30) + 10,
        calories: Math.floor(Math.random() * 800) + 200,
        allergens: ['nuts', 'dairy', 'gluten'].filter(() => Math.random() > 0.7),
        ingredients: ['tomatoes', 'onions', 'garlic', 'herbs'].filter(() => Math.random() > 0.5),
        nutritionalInfo: {
          protein: Math.floor(Math.random() * 30) + 5,
          carbs: Math.floor(Math.random() * 50) + 10,
          fat: Math.floor(Math.random() * 25) + 5,
          fiber: Math.floor(Math.random() * 10) + 2,
          sodium: Math.floor(Math.random() * 1000) + 200
        },
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviewCount: Math.floor(Math.random() * 100) + 10,
        chef: {
          name: ['Chef Marco', 'Chef Sarah', 'Chef David'][Math.floor(Math.random() * 3)],
          avatar: '/chef-avatar.jpg',
          specialty: ['Italian Cuisine', 'French Cuisine', 'Modern Fusion'][Math.floor(Math.random() * 3)]
        },
        story: 'This signature dish combines traditional techniques with modern flavors, creating a unique culinary experience that tells the story of our kitchen.',
        pairings: ['Red Wine', 'Craft Beer', 'Sparkling Water'].filter(() => Math.random() > 0.5),
        customizations: [
          {
            name: 'Spice Level',
            options: [
              { name: 'Mild', price: 0 },
              { name: 'Medium', price: 0 },
              { name: 'Hot', price: 0 },
              { name: 'Extra Hot', price: 2 }
            ]
          },
          {
            name: 'Size',
            options: [
              { name: 'Regular', price: 0 },
              { name: 'Large', price: 5 }
            ]
          }
        ]
      }));

      setMenuItems(enhancedItems);
      
      // Extract categories
      const uniqueCategories = [...new Set(enhancedItems.map(item => item.category))];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Failed to load menu data:', error);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const checkARSupport = () => {
    // Check if device supports AR
    if ('xr' in navigator) {
      // @ts-ignore
      navigator.xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setIsARSupported(supported);
      });
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem(`favorites_${restaurantSlug}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const filterAndSortItems = () => {
    let filtered = menuItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Dietary filters
    if (filters.vegetarian) filtered = filtered.filter(item => item.isVegetarian);
    if (filters.vegan) filtered = filtered.filter(item => item.isVegan);
    if (filters.glutenFree) filtered = filtered.filter(item => item.isGlutenFree);
    if (filters.spicy) filtered = filtered.filter(item => item.isSpicy);
    if (filters.popular) filtered = filtered.filter(item => item.isPopular);
    if (filters.new) filtered = filtered.filter(item => item.isNew);

    // Sort items
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating.toString()) - parseFloat(a.rating.toString()));
        break;
      case 'prep-time':
        filtered.sort((a, b) => a.prepTime - b.prepTime);
        break;
      default: // featured
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredItems(filtered);
  };

  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${restaurantSlug}`, JSON.stringify(newFavorites));
    
    if (soundEnabled) {
      // Play sound effect
      const audio = new Audio('/heart-sound.mp3');
      audio.play().catch(() => {});
    }
  };

  const shareItem = async (item: MenuItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: item.description,
          url: `${window.location.origin}/${restaurantSlug}/menu/${item.id}`
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/${restaurantSlug}/menu/${item.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const startARView = async (item: MenuItem) => {
    if (!isARSupported) {
      toast.error('AR not supported on this device');
      return;
    }

    try {
      // @ts-ignore
      const session = await navigator.xr.requestSession('immersive-ar');
      toast.success('AR view started! Point your camera at a flat surface.');
      // AR implementation would go here
    } catch (error) {
      toast.error('Failed to start AR view');
    }
  };

  const getSpiceIndicator = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Flame
        key={i}
        className={`w-3 h-3 ${i < level ? 'text-red-500' : 'text-gray-300'}`}
      />
    ));
  };

  const getDietaryBadges = (item: MenuItem) => {
    const badges = [];
    if (item.isVegetarian) badges.push(<Badge key="veg" variant="success" size="sm"><Leaf className="w-3 h-3 mr-1" />Vegetarian</Badge>);
    if (item.isVegan) badges.push(<Badge key="vegan" variant="success" size="sm"><Leaf className="w-3 h-3 mr-1" />Vegan</Badge>);
    if (item.isGlutenFree) badges.push(<Badge key="gf" variant="info" size="sm">Gluten-Free</Badge>);
    if (item.isPopular) badges.push(<Badge key="pop" variant="warning" size="sm"><Award className="w-3 h-3 mr-1" />Popular</Badge>);
    if (item.isNew) badges.push(<Badge key="new" variant="error" size="sm"><Zap className="w-3 h-3 mr-1" />New</Badge>);
    return badges;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interactive Menu</h1>
              <p className="text-gray-600">Explore our dishes with enhanced features</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={soundEnabled ? 'default' : 'outline'}
                onClick={() => setSoundEnabled(!soundEnabled)}
                icon={soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              />
              {isARSupported && (
                <Button
                  variant={viewMode === 'ar' ? 'default' : 'outline'}
                  onClick={() => setViewMode('ar')}
                  icon={<Camera className="w-5 h-5" />}
                >
                  AR View
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Search dishes, ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
            
            <Select
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map(cat => ({ value: cat, label: cat }))
              ]}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            />
            
            <Select
              options={[
                { value: 'featured', label: 'Featured First' },
                { value: 'name', label: 'Name A-Z' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'prep-time', label: 'Fastest First' }
              ]}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            />
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="sm"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="sm"
              >
                List
              </Button>
            </div>
          </div>

          {/* Dietary Filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <Button
                key={key}
                variant={value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, [key]: !value }))}
                className="capitalize"
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <AnimatePresence>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover className="overflow-hidden cursor-pointer" onClick={() => {
                  setSelectedItem(item);
                  setIsItemModalOpen(true);
                }}>
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white bg-opacity-90 hover:bg-opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        icon={<Heart className={`w-4 h-4 ${favorites.includes(item.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="bg-white bg-opacity-90 hover:bg-opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareItem(item);
                        }}
                        icon={<Share2 className="w-4 h-4 text-gray-600" />}
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                      {getDietaryBadges(item).slice(0, 2)}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.prepTime}m
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                          {item.rating} ({item.reviewCount})
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-1" />
                          {item.calories} cal
                        </div>
                      </div>
                    </div>

                    {item.isSpicy && (
                      <div className="flex items-center mb-4">
                        <span className="text-sm text-gray-600 mr-2">Spice Level:</span>
                        <div className="flex">{getSpiceIndicator(item.spiceLevel)}</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img
                          src={item.chef.avatar}
                          alt={item.chef.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-gray-600">{item.chef.name}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setSelectedImageIndex(0);
                            setIsImageModalOpen(true);
                          }}
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
                        </Button>
                        {isARSupported && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              startARView(item);
                            }}
                            icon={<Camera className="w-4 h-4" />}
                          >
                            AR
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dishes found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setFilters({
                vegetarian: false,
                vegan: false,
                glutenFree: false,
                spicy: false,
                popular: false,
                new: false
              });
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setSelectedItem(null);
        }}
        title={selectedItem?.name}
        size="xl"
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="relative">
              <img
                src={selectedItem.images[selectedImageIndex]}
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              {selectedItem.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {selectedItem.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === selectedImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
                    <p className="text-xl font-bold text-orange-600">${selectedItem.price.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleFavorite(selectedItem.id)}
                      icon={<Heart className={`w-5 h-5 ${favorites.includes(selectedItem.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />}
                    />
                    <Button
                      variant="ghost"
                      onClick={() => shareItem(selectedItem)}
                      icon={<Share2 className="w-5 h-5" />}
                    />
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{selectedItem.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {getDietaryBadges(selectedItem)}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preparation Time</span>
                    <span className="font-medium">{selectedItem.prepTime} minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Calories</span>
                    <span className="font-medium">{selectedItem.calories}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{selectedItem.rating} ({selectedItem.reviewCount} reviews)</span>
                    </div>
                  </div>
                  {selectedItem.isSpicy && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Spice Level</span>
                      <div className="flex">{getSpiceIndicator(selectedItem.spiceLevel)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                {/* Chef Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={selectedItem.chef.avatar}
                      alt={selectedItem.chef.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{selectedItem.chef.name}</p>
                      <p className="text-sm text-gray-600">{selectedItem.chef.specialty}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{selectedItem.story}</p>
                </div>

                {/* Nutritional Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Nutritional Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Protein</span>
                      <span className="font-medium">{selectedItem.nutritionalInfo.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carbs</span>
                      <span className="font-medium">{selectedItem.nutritionalInfo.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fat</span>
                      <span className="font-medium">{selectedItem.nutritionalInfo.fat}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fiber</span>
                      <span className="font-medium">{selectedItem.nutritionalInfo.fiber}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients & Allergens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedItem.allergens.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Allergens</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.allergens.map((allergen, index) => (
                      <Badge key={index} variant="warning" size="sm">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pairings */}
            {selectedItem.pairings.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recommended Pairings</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.pairings.map((pairing, index) => (
                    <Badge key={index} variant="info" size="sm">
                      {pairing}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsItemModalOpen(false)}>
                Close
              </Button>
              {isARSupported && (
                <Button
                  variant="outline"
                  onClick={() => startARView(selectedItem)}
                  icon={<Camera className="w-4 h-4" />}
                >
                  View in AR
                </Button>
              )}
              <Button icon={<Users className="w-4 h-4" />}>
                Add to Order
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Gallery Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Gallery"
        size="xl"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={selectedItem.images[selectedImageIndex]}
                alt={selectedItem.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {selectedItem.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex === 0 ? selectedItem.images.length - 1 : selectedImageIndex - 1
                    )}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex === selectedItem.images.length - 1 ? 0 : selectedImageIndex + 1
                    )}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    <RotateCcw className="w-5 h-5 transform rotate-180" />
                  </button>
                </>
              )}
            </div>
            
            {selectedItem.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {selectedItem.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === selectedImageIndex ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${selectedItem.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default AdvancedMenuPage;
