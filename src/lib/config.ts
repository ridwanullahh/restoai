import UniversalSDK from './sdk';
import { createChutesAI } from './ai';

// Validate required environment variables
const validateEnvVars = () => {
  const required = ['VITE_GITHUB_TOKEN', 'VITE_GITHUB_OWNER', 'VITE_GITHUB_REPO'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('Please check your .env file and ensure all required variables are set.');
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment variables on startup
validateEnvVars();

// SDK Configuration with proper GitHub credentials
export const sdk = new UniversalSDK({
  owner: import.meta.env.VITE_GITHUB_OWNER,
  repo: import.meta.env.VITE_GITHUB_REPO,
  token: import.meta.env.VITE_GITHUB_TOKEN,
  branch: 'main',
  basePath: 'db',
  mediaPath: 'media',
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  },
  smtp: {
    endpoint: import.meta.env.VITE_SMTP_ENDPOINT,
    from: import.meta.env.VITE_SMTP_FROM || 'noreply@restaurantos.com',
    test: async () => {
      try {
        if (!import.meta.env.VITE_SMTP_ENDPOINT) return false;
        const response = await fetch(import.meta.env.VITE_SMTP_ENDPOINT + '/test');
        return response.ok;
      } catch {
        return false;
      }
    }
  },
  templates: {
    otp: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">RestaurantOS Verification</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
          {{otp}}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    welcome: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Welcome to RestaurantOS!</h2>
        <p>Thank you for joining our platform. We're excited to help you grow your restaurant business.</p>
        <p>Get started by setting up your restaurant profile and menu.</p>
        <a href="${import.meta.env.VITE_APP_URL}/restaurant/dashboard" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
          Go to Dashboard
        </a>
      </div>
    `
  },
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
        preferences: 'object',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        verified: false,
        roles: ['restaurant_owner'],
        permissions: [],
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        reviewCount: 'number',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        active: true,
        settings: {
          theme: { 
            primaryColor: '#f97316', 
            secondaryColor: '#ea580c',
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
        },
        hours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '23:00', closed: false },
          saturday: { open: '09:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '21:00', closed: false }
        },
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        customizations: 'array',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        available: true,
        featured: false,
        allergens: [],
        customizations: [],
        nutritionalInfo: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        paymentStatus: 'string',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        status: 'pending',
        orderType: 'dine-in',
        orderDate: new Date().toISOString(),
        paymentStatus: 'pending',
        tax: 0,
        tip: 0,
        deliveryFee: 0,
        subtotal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        helpful: 'number',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        reviewDate: new Date().toISOString(),
        sentiment: 'neutral',
        sentimentScore: 0.5,
        verified: false,
        helpful: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        lastOrderDate: 'date',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        preferences: {},
        loyaltyPoints: 0,
        totalOrders: 0,
        favoriteRestaurants: [],
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        peakHours: 'array',
        createdAt: 'date',
        updatedAt: 'date'
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
        peakHours: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        expiryDate: 'date',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        currentStock: 0,
        minStock: 0,
        maxStock: 100,
        unit: 'units',
        costPerUnit: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        applicableItems: 'array',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        active: true,
        usedCount: 0,
        applicableItems: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        metadata: 'object',
        createdAt: 'date'
      },
      defaults: {
        type: 'customer',
        timestamp: new Date().toISOString(),
        metadata: {},
        createdAt: new Date().toISOString()
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
    },
    menuCategories: {
      required: ['restaurantId', 'name'],
      types: {
        restaurantId: 'string',
        name: 'string',
        description: 'string',
        displayOrder: 'number',
        active: 'boolean',
        image: 'string',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        active: true,
        displayOrder: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    themes: {
      required: ['name', 'config'],
      types: {
        name: 'string',
        displayName: 'string',
        description: 'string',
        config: 'object',
        preview: 'string',
        active: 'boolean',
        createdAt: 'date'
      },
      defaults: {
        active: true,
        createdAt: new Date().toISOString()
      }
    },
    blogPosts: {
      required: ['restaurantId', 'title', 'content'],
      types: {
        restaurantId: 'string',
        title: 'string',
        slug: 'string',
        content: 'string',
        excerpt: 'string',
        featuredImage: 'string',
        author: 'string',
        status: 'string',
        publishedAt: 'date',
        tags: 'array',
        categories: 'array',
        seoTitle: 'string',
        seoDescription: 'string',
        viewCount: 'number',
        commentsEnabled: 'boolean',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        status: 'draft',
        tags: [],
        categories: [],
        viewCount: 0,
        commentsEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    blogComments: {
      required: ['postId', 'author', 'content'],
      types: {
        postId: 'string',
        author: 'string',
        email: 'string',
        content: 'string',
        status: 'string',
        parentId: 'string',
        createdAt: 'date'
      },
      defaults: {
        status: 'approved',
        createdAt: new Date().toISOString()
      }
    },
    reservations: {
      required: ['restaurantId', 'customerInfo', 'date', 'time', 'partySize'],
      types: {
        restaurantId: 'string',
        customerId: 'string',
        customerInfo: 'object',
        date: 'string',
        time: 'string',
        partySize: 'number',
        status: 'string',
        tableNumber: 'string',
        specialRequests: 'string',
        confirmationCode: 'string',
        reminderSent: 'boolean',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        status: 'pending',
        reminderSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    waitlist: {
      required: ['restaurantId', 'customerInfo', 'date', 'partySize'],
      types: {
        restaurantId: 'string',
        customerId: 'string',
        customerInfo: 'object',
        date: 'string',
        partySize: 'number',
        estimatedWait: 'number',
        status: 'string',
        position: 'number',
        notificationSent: 'boolean',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        status: 'waiting',
        position: 0,
        notificationSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    discounts: {
      required: ['restaurantId', 'name', 'type', 'value'],
      types: {
        restaurantId: 'string',
        name: 'string',
        code: 'string',
        type: 'string',
        value: 'number',
        minOrderAmount: 'number',
        maxDiscount: 'number',
        usageLimit: 'number',
        usageCount: 'number',
        validFrom: 'date',
        validUntil: 'date',
        active: 'boolean',
        applicableItems: 'array',
        customerSegments: 'array',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        usageCount: 0,
        active: true,
        applicableItems: [],
        customerSegments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    loyaltyPrograms: {
      required: ['restaurantId', 'name', 'pointsPerDollar'],
      types: {
        restaurantId: 'string',
        name: 'string',
        description: 'string',
        pointsPerDollar: 'number',
        rewardTiers: 'array',
        active: 'boolean',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        active: true,
        rewardTiers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    customerSegments: {
      required: ['restaurantId', 'name', 'criteria'],
      types: {
        restaurantId: 'string',
        name: 'string',
        description: 'string',
        criteria: 'object',
        customerCount: 'number',
        active: 'boolean',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        customerCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    referrals: {
      required: ['restaurantId', 'referrerId', 'refereeEmail'],
      types: {
        restaurantId: 'string',
        referrerId: 'string',
        refereeId: 'string',
        refereeEmail: 'string',
        referralCode: 'string',
        status: 'string',
        rewardAmount: 'number',
        rewardClaimed: 'boolean',
        completedAt: 'date',
        createdAt: 'date'
      },
      defaults: {
        status: 'pending',
        rewardClaimed: false,
        createdAt: new Date().toISOString()
      }
    },
    emailCampaigns: {
      required: ['restaurantId', 'name', 'subject', 'content'],
      types: {
        restaurantId: 'string',
        name: 'string',
        subject: 'string',
        content: 'string',
        type: 'string',
        status: 'string',
        targetSegments: 'array',
        scheduledAt: 'date',
        sentAt: 'date',
        recipientCount: 'number',
        openRate: 'number',
        clickRate: 'number',
        createdAt: 'date',
        updatedAt: 'date'
      },
      defaults: {
        type: 'promotional',
        status: 'draft',
        targetSegments: [],
        recipientCount: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    reputationMetrics: {
      required: ['restaurantId', 'platform', 'rating'],
      types: {
        restaurantId: 'string',
        platform: 'string',
        rating: 'number',
        reviewCount: 'number',
        lastUpdated: 'date',
        trends: 'object',
        createdAt: 'date'
      },
      defaults: {
        reviewCount: 0,
        trends: {},
        createdAt: new Date().toISOString()
      }
    }
  },
  auth: {
    requireEmailVerification: false, // Disabled for demo
    otpTriggers: [] // Disabled for demo
  }
});

// AI Configuration with error handling
export const ai = import.meta.env.VITE_CHUTES_AI_TOKEN 
  ? createChutesAI(import.meta.env.VITE_CHUTES_AI_TOKEN)
  : null;

// Initialize SDK with comprehensive error handling
export const initializeApp = async (): Promise<boolean> => {
  try {
    console.log('🚀 Initializing RestaurantOS...');
    
    // Test GitHub connection
    await sdk.init();
    console.log('✅ GitHub SDK connected successfully');
    
    // Test AI connection if configured
    if (ai) {
      try {
        await ai.chat([{ role: 'user', content: 'test' }], { max_tokens: 1 });
        console.log('✅ Chutes AI connected successfully');
      } catch (error) {
        console.warn('⚠️ Chutes AI connection failed, AI features will be limited');
      }
    } else {
      console.warn('⚠️ Chutes AI not configured, AI features will be limited');
    }
    
    // Initialize demo data if collections are empty
    await initializeDemoData();
    
    console.log('🎉 RestaurantOS initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ RestaurantOS initialization failed:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Missing environment variables')) {
        console.error('💡 Solution: Copy .env.example to .env and fill in your credentials');
      } else if (error.message.includes('GitHub')) {
        console.error('💡 Solution: Check your GitHub token and repository settings');
      }
    }
    
    return false;
  }
};

// Initialize comprehensive demo data
const initializeDemoData = async () => {
  try {
    console.log('📊 Checking for existing data...');
    
    const restaurants = await sdk.get('restaurants');
    if (restaurants.length === 0) {
      console.log('🏗️ Creating demo data...');
      
      // Create demo restaurant
      const demoRestaurant = await sdk.insert('restaurants', {
        name: 'Bella Vista Restaurant',
        slug: 'bella-vista',
        ownerId: 'demo-owner',
        description: 'Authentic Italian cuisine with a modern twist, featuring fresh ingredients and traditional recipes passed down through generations.',
        cuisine: 'Italian',
        address: '123 Main Street, Downtown District, City Center',
        phone: '+1 (555) 123-4567',
        email: 'info@bellavista.com',
        website: 'https://bellavista.com',
        logo: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=200',
        coverImage: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
        rating: 4.8,
        reviewCount: 127
      });

      // Create comprehensive menu items
      const menuItems = [
        {
          restaurantId: demoRestaurant.id,
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, San Marzano tomatoes, fresh basil, and extra virgin olive oil on our signature wood-fired crust',
          price: 18.99,
          category: 'Pizza',
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
          featured: true,
          allergens: ['gluten', 'dairy'],
          nutritionalInfo: { calories: 280, protein: 12, carbs: 35, fat: 10 }
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Truffle Risotto',
          description: 'Creamy arborio rice with black truffle, aged parmesan, wild mushrooms, and white wine',
          price: 28.99,
          category: 'Pasta & Risotto',
          image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
          featured: true,
          allergens: ['dairy'],
          nutritionalInfo: { calories: 420, protein: 15, carbs: 45, fat: 18 }
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Grilled Branzino',
          description: 'Mediterranean sea bass grilled to perfection with lemon, fresh herbs, and seasonal roasted vegetables',
          price: 32.99,
          category: 'Seafood',
          image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400',
          allergens: ['fish'],
          nutritionalInfo: { calories: 350, protein: 35, carbs: 8, fat: 20 }
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Classic Tiramisu',
          description: 'Traditional Italian dessert with espresso-soaked ladyfingers, mascarpone cream, and cocoa powder',
          price: 9.99,
          category: 'Desserts',
          image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg?auto=compress&cs=tinysrgb&w=400',
          allergens: ['dairy', 'eggs', 'gluten'],
          nutritionalInfo: { calories: 320, protein: 6, carbs: 28, fat: 22 }
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Caesar Salad',
          description: 'Crisp romaine lettuce, aged parmesan cheese, house-made croutons, and our signature Caesar dressing',
          price: 14.99,
          category: 'Salads',
          image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
          allergens: ['dairy', 'eggs'],
          nutritionalInfo: { calories: 180, protein: 8, carbs: 12, fat: 14 }
        },
        {
          restaurantId: demoRestaurant.id,
          name: 'Craft Beer Selection',
          description: 'Rotating selection of local craft beers on tap, featuring seasonal and limited edition brews',
          price: 7.99,
          category: 'Beverages',
          image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=400',
          available: true,
          nutritionalInfo: { calories: 150, protein: 1, carbs: 12, fat: 0 }
        }
      ];

      await sdk.bulkInsert('menuItems', menuItems);

      // Create demo orders with realistic data
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
          estimatedTime: 25,
          paymentStatus: 'paid'
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
          estimatedTime: 15,
          paymentStatus: 'paid'
        }
      ];

      await sdk.bulkInsert('orders', demoOrders);

      // Create demo reviews
      const demoReviews = [
        {
          restaurantId: demoRestaurant.id,
          customerId: 'customer-1',
          customerName: 'John Doe',
          rating: 5,
          comment: 'Absolutely amazing! The Margherita pizza was perfect and the service was outstanding. Will definitely be back!',
          sentiment: 'positive',
          sentimentScore: 0.9,
          verified: true,
          helpful: 3
        },
        {
          restaurantId: demoRestaurant.id,
          customerId: 'customer-2',
          customerName: 'Jane Smith',
          rating: 4,
          comment: 'Great food and atmosphere. The truffle risotto was delicious, though a bit pricey. Overall a good experience.',
          sentiment: 'positive',
          sentimentScore: 0.7,
          verified: true,
          helpful: 2
        }
      ];

      await sdk.bulkInsert('reviews', demoReviews);

      // Create demo customers
      const demoCustomers = [
        {
          email: 'john@example.com',
          name: 'John Doe',
          phone: '+1 (555) 987-6543',
          loyaltyPoints: 150,
          totalOrders: 3,
          favoriteRestaurants: [demoRestaurant.id],
          preferences: {
            dietary: ['vegetarian'],
            cuisine: ['Italian', 'Mediterranean']
          },
          addresses: [
            {
              street: '456 Oak Avenue',
              city: 'Downtown',
              state: 'CA',
              zipCode: '90210',
              instructions: 'Ring doorbell'
            }
          ]
        },
        {
          email: 'jane@example.com',
          name: 'Jane Smith',
          phone: '+1 (555) 456-7890',
          loyaltyPoints: 89,
          totalOrders: 2,
          favoriteRestaurants: [demoRestaurant.id],
          preferences: {
            dietary: ['gluten-free'],
            cuisine: ['Italian']
          },
          addresses: [
            {
              street: '789 Pine Street',
              city: 'Uptown',
              state: 'CA',
              zipCode: '90211'
            }
          ]
        }
      ];

      await sdk.bulkInsert('customers', demoCustomers);

      console.log('✅ Demo data created successfully');
    } else {
      console.log('✅ Existing data found, skipping demo data creation');
    }
  } catch (error) {
    console.error('❌ Failed to initialize demo data:', error);
  }
};

// Export configuration for debugging
export const config = {
  github: {
    owner: import.meta.env.VITE_GITHUB_OWNER,
    repo: import.meta.env.VITE_GITHUB_REPO,
    hasToken: !!import.meta.env.VITE_GITHUB_TOKEN
  },
  ai: {
    hasToken: !!import.meta.env.VITE_CHUTES_AI_TOKEN,
    enabled: !!ai
  },
  cloudinary: {
    configured: !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
  },
  smtp: {
    configured: !!import.meta.env.VITE_SMTP_ENDPOINT
  }
};