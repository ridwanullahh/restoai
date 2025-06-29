import UniversalSDK from './sdk';
import { createChutesAI } from './ai';

// SDK Configuration
export const sdk = new UniversalSDK({
  owner: 'restaurant-saas', // Replace with actual GitHub username
  repo: 'restaurant-data', // Replace with actual repository name
  token: import.meta.env.VITE_GITHUB_TOKEN || 'demo-token', // Replace with actual GitHub token
  schemas: {
    users: {
      required: ['email'],
      types: {
        email: 'string',
        password: 'string',
        name: 'string',
        phone: 'string',
        roles: 'array',
        permissions: 'array',
        verified: 'boolean',
        avatar: 'string',
        preferences: 'object'
      },
      defaults: {
        verified: false,
        roles: ['restaurant_owner'],
        permissions: [],
        preferences: {}
      }
    },
    restaurants: {
      required: ['name', 'slug', 'ownerId'],
      types: {
        name: 'string',
        slug: 'string',
        ownerId: 'string',
        description: 'string',
        cuisine: 'string',
        address: 'string',
        phone: 'string',
        email: 'string',
        website: 'string',
        logo: 'string',
        coverImage: 'string',
        hours: 'object',
        settings: 'object',
        active: 'boolean',
        rating: 'number',
        reviewCount: 'number'
      },
      defaults: {
        active: true,
        settings: {
          theme: { primaryColor: '#f97316', secondaryColor: '#ea580c' },
          features: { onlineOrdering: true, reservations: true, loyalty: true, reviews: true },
          notifications: { email: true, sms: false, push: true }
        },
        hours: {},
        rating: 0,
        reviewCount: 0
      }
    },
    menus: {
      required: ['restaurantId', 'name'],
      types: {
        restaurantId: 'string',
        name: 'string',
        description: 'string',
        items: 'array',
        active: 'boolean',
        featured: 'boolean',
        category: 'string'
      },
      defaults: {
        active: true,
        featured: false,
        items: []
      }
    },
    menuItems: {
      required: ['restaurantId', 'name', 'price'],
      types: {
        restaurantId: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        category: 'string',
        image: 'string',
        available: 'boolean',
        featured: 'boolean',
        allergens: 'array',
        nutritionalInfo: 'object',
        customizations: 'array'
      },
      defaults: {
        available: true,
        featured: false,
        allergens: [],
        customizations: []
      }
    },
    orders: {
      required: ['restaurantId', 'customerId', 'items', 'total'],
      types: {
        restaurantId: 'string',
        customerId: 'string',
        customerInfo: 'object',
        items: 'array',
        subtotal: 'number',
        tax: 'number',
        tip: 'number',
        deliveryFee: 'number',
        total: 'number',
        status: 'string',
        orderType: 'string',
        orderDate: 'date',
        estimatedTime: 'number',
        deliveryAddress: 'object',
        notes: 'string',
        paymentMethod: 'object',
        paymentStatus: 'string'
      },
      defaults: {
        status: 'pending',
        orderType: 'dine-in',
        orderDate: new Date().toISOString(),
        paymentStatus: 'pending',
        tax: 0,
        tip: 0,
        deliveryFee: 0
      }
    },
    reviews: {
      required: ['restaurantId', 'customerId', 'rating'],
      types: {
        restaurantId: 'string',
        customerId: 'string',
        customerName: 'string',
        rating: 'number',
        comment: 'string',
        reviewDate: 'date',
        sentiment: 'string',
        sentimentScore: 'number',
        response: 'object',
        verified: 'boolean',
        helpful: 'number'
      },
      defaults: {
        reviewDate: new Date().toISOString(),
        sentiment: 'neutral',
        sentimentScore: 0.5,
        verified: false,
        helpful: 0
      }
    },
    customers: {
      required: ['email'],
      types: {
        email: 'string',
        name: 'string',
        phone: 'string',
        avatar: 'string',
        preferences: 'object',
        loyaltyPoints: 'number',
        totalOrders: 'number',
        favoriteRestaurants: 'array',
        addresses: 'array',
        lastOrderDate: 'date'
      },
      defaults: {
        preferences: {},
        loyaltyPoints: 0,
        totalOrders: 0,
        favoriteRestaurants: [],
        addresses: []
      }
    },
    analytics: {
      required: ['restaurantId', 'date'],
      types: {
        restaurantId: 'string',
        date: 'date',
        metrics: 'object',
        revenue: 'number',
        orderCount: 'number',
        averageOrderValue: 'number',
        customerCount: 'number',
        repeatCustomerRate: 'number',
        popularItems: 'array',
        peakHours: 'array'
      },
      defaults: {
        date: new Date().toISOString(),
        metrics: {},
        revenue: 0,
        orderCount: 0,
        averageOrderValue: 0,
        customerCount: 0,
        repeatCustomerRate: 0,
        popularItems: [],
        peakHours: []
      }
    },
    inventory: {
      required: ['restaurantId', 'name'],
      types: {
        restaurantId: 'string',
        name: 'string',
        category: 'string',
        currentStock: 'number',
        minStock: 'number',
        maxStock: 'number',
        unit: 'string',
        costPerUnit: 'number',
        supplier: 'string',
        lastRestocked: 'date',
        expiryDate: 'date'
      },
      defaults: {
        currentStock: 0,
        minStock: 0,
        maxStock: 100,
        unit: 'units',
        costPerUnit: 0
      }
    },
    promotions: {
      required: ['restaurantId', 'name', 'type', 'value'],
      types: {
        restaurantId: 'string',
        name: 'string',
        description: 'string',
        type: 'string',
        value: 'number',
        minimumOrder: 'number',
        validFrom: 'date',
        validUntil: 'date',
        active: 'boolean',
        usageLimit: 'number',
        usedCount: 'number',
        applicableItems: 'array'
      },
      defaults: {
        active: true,
        usedCount: 0,
        applicableItems: []
      }
    },
    chatMessages: {
      required: ['restaurantId', 'message'],
      types: {
        restaurantId: 'string',
        customerId: 'string',
        type: 'string',
        message: 'string',
        timestamp: 'date',
        metadata: 'object'
      },
      defaults: {
        type: 'customer',
        timestamp: new Date().toISOString(),
        metadata: {}
      }
    },
    notifications: {
      required: ['userId', 'type', 'title', 'message'],
      types: {
        userId: 'string',
        type: 'string',
        title: 'string',
        message: 'string',
        data: 'object',
        read: 'boolean',
        createdAt: 'date'
      },
      defaults: {
        read: false,
        createdAt: new Date().toISOString(),
        data: {}
      }
    }
  }
});

// AI Configuration
export const ai = createChutesAI(import.meta.env.VITE_CHUTES_AI_TOKEN || 'demo-token');

// Initialize SDK
export const initializeApp = async () => {
  try {
    await sdk.init();
    console.log('✅ SDK initialized successfully');
    
    // Initialize demo data if collections are empty
    await initializeDemoData();
    
    return true;
  } catch (error) {
    console.error('❌ SDK initialization failed:', error);
    return false;
  }
};

// Initialize demo data for development
const initializeDemoData = async () => {
  try {
    const restaurants = await sdk.get('restaurants');
    if (restaurants.length === 0) {
      // Create demo restaurant
      const demoRestaurant = await sdk.insert('restaurants', {
        name: 'Bella Vista Restaurant',
        slug: 'bella-vista',
        ownerId: 'demo-owner',
        description: 'Authentic Italian cuisine with a modern twist',
        cuisine: 'Italian',
        address: '123 Main Street, Downtown',
        phone: '+1 (555) 123-4567',
        email: 'info@bellavista.com',
        website: 'https://bellavista.com',
        logo: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=200',
        coverImage: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
        hours: {
          monday: { open: '11:00', close: '22:00' },
          tuesday: { open: '11:00', close: '22:00' },
          wednesday: { open: '11:00', close: '22:00' },
          thursday: { open: '11:00', close: '22:00' },
          friday: { open: '11:00', close: '23:00' },
          saturday: { open: '11:00', close: '23:00' },
          sunday: { open: '12:00', close: '21:00' }
        },
        rating: 4.8,
        reviewCount: 127
      });

      // Create demo menu items
      const menuItems = [
        {
          restaurantId: demoRestaurant.id,
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, tomatoes, basil, and olive oil on our signature wood-fired crust',
          price: 18.99,
          category: 'Pizza',
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
          featured: true,
          allergens: ['gluten', 'dairy']
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Truffle Risotto',
          description: 'Creamy arborio rice with black truffle, parmesan, and wild mushrooms',
          price: 28.99,
          category: 'Pasta & Risotto',
          image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
          featured: true,
          allergens: ['dairy']
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Grilled Branzino',
          description: 'Mediterranean sea bass with lemon, herbs, and roasted vegetables',
          price: 32.99,
          category: 'Seafood',
          image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400',
          allergens: ['fish']
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Tiramisu',
          description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
          price: 9.99,
          category: 'Desserts',
          image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=400',
          allergens: ['dairy', 'eggs', 'gluten']
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Caesar Salad',
          description: 'Crisp romaine lettuce, parmesan cheese, croutons, and our house Caesar dressing',
          price: 14.99,
          category: 'Salads',
          image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
          allergens: ['dairy', 'eggs']
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Craft Beer Selection',
          description: 'Rotating selection of local craft beers on tap',
          price: 7.99,
          category: 'Beverages',
          image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400',
          available: true
        }
      ];

      await sdk.bulkInsert('menuItems', menuItems);

      // Create demo orders
      const demoOrders = [
        {
          restaurantId: demoRestaurant.id,
          customerId: 'customer-1',
          customerInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 (555) 987-6543'
          },
          items: [
            { menuItemId: '1', name: 'Margherita Pizza', price: 18.99, quantity: 1 },
            { menuItemId: '5', name: 'Caesar Salad', price: 14.99, quantity: 1 }
          ],
          subtotal: 33.98,
          tax: 2.72,
          total: 36.70,
          status: 'preparing',
          orderType: 'dine-in',
          estimatedTime: 25
        },
        {
          restaurantId: demoRestaurant.id,
          customerId: 'customer-2',
          customerInfo: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1 (555) 456-7890'
          },
          items: [
            { menuItemId: '2', name: 'Truffle Risotto', price: 28.99, quantity: 1 }
          ],
          subtotal: 28.99,
          tax: 2.32,
          tip: 5.00,
          total: 36.31,
          status: 'ready',
          orderType: 'takeout',
          estimatedTime: 15
        }
      ];

      await sdk.bulkInsert('orders', demoOrders);

      console.log('✅ Demo data initialized');
    }
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
  }
};