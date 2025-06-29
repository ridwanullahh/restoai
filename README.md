# RestaurantOS - AI-Powered Restaurant Management Platform

A revolutionary SaaS platform that transforms how restaurants connect with customers through AI-powered features and innovative experiences.

## 🚀 Features

### Restaurant Dashboard
- **Menu Management** - Complete CRUD operations with categories, allergens, and nutrition info
- **Order Management** - Real-time order tracking and status updates
- **Customer Analytics** - Comprehensive customer insights and relationship management
- **AI Assistant** - Intelligent chatbot with business recommendations
- **Review Management** - AI-powered sentiment analysis and automated responses
- **Inventory Tracking** - Stock management with low-stock alerts
- **Promotions** - Create and manage promotional campaigns
- **Analytics Dashboard** - Real-time business intelligence and reporting
- **Settings** - Complete restaurant configuration and customization

### Customer Dashboard
- **Personal Overview** - Dashboard with stats and quick actions
- **Order History** - Complete order tracking and management
- **Review System** - Write and manage restaurant reviews
- **Favorites** - Save and manage favorite restaurants
- **Loyalty Program** - Points tracking, tiers, and rewards
- **Profile Management** - Personal info, addresses, and preferences

### Dynamic Restaurant Pages
- **Public Pages** - Each restaurant gets its own URL (`/restaurant-slug`)
- **Menu Display** - Beautiful menu presentation with categories
- **Restaurant Info** - Hours, contact, reviews, and ordering

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Database**: GitHub-based SDK
- **AI**: Chutes AI integration
- **State Management**: React Context + Hooks
- **Routing**: React Router v6

## 📋 Prerequisites

Before running this application, you need:

1. **GitHub Personal Access Token** with repository permissions
2. **GitHub Repository** for data storage
3. **Chutes AI API Token** (optional, for AI features)
4. **Cloudinary Account** (optional, for image uploads)
5. **SMTP Service** (optional, for email notifications)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd restaurant-saas-platform
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` with your credentials:

```env
# Required - GitHub SDK Configuration
VITE_GITHUB_TOKEN=ghp_your_github_personal_access_token_here
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=restaurant-data

# Required for AI features - Chutes AI Configuration
VITE_CHUTES_AI_TOKEN=your_chutes_ai_api_token_here

# Optional - Additional Services
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_SMTP_ENDPOINT=https://your-smtp-service.com/send
VITE_SMTP_FROM=noreply@yourrestaurant.com
```

### 4. GitHub Repository Setup

Create a new GitHub repository for data storage:

1. Go to GitHub and create a new repository (e.g., `restaurant-data`)
2. Make it public or private (your choice)
3. Don't initialize with README, .gitignore, or license
4. Copy the repository name to your `.env` file

### 5. GitHub Token Setup

Create a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (Full control of private repositories)
4. Copy the token to your `.env` file

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration Details

### GitHub SDK Configuration

The platform uses a GitHub-based database system. Your data is stored as JSON files in your GitHub repository:

- `db/restaurants.json` - Restaurant data
- `db/menuItems.json` - Menu items
- `db/orders.json` - Order data
- `db/reviews.json` - Customer reviews
- `db/customers.json` - Customer profiles
- `db/users.json` - User authentication data

### Chutes AI Integration

For AI-powered features like:
- Menu recommendations
- Review sentiment analysis
- Automated customer responses
- Business insights

Get your API token from [Chutes AI](https://chutes.ai) and add it to your `.env` file.

### Optional Services

#### Cloudinary (Image Management)
For uploading and managing restaurant images:
1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your cloud name and upload preset
3. Add to `.env` file

#### SMTP (Email Notifications)
For sending email notifications:
1. Use any SMTP service (SendGrid, Mailgun, etc.)
2. Add endpoint and sender email to `.env` file

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   ├── customer/       # Customer-specific components
│   ├── dashboard/      # Dashboard components
│   └── layout/         # Layout components
├── contexts/           # React Context providers
├── lib/               # Core libraries and utilities
│   ├── ai.ts          # Chutes AI integration
│   ├── config.ts      # App configuration
│   └── sdk.ts         # GitHub SDK
├── pages/             # Page components
│   ├── customer/      # Customer dashboard pages
│   └── restaurant/    # Restaurant dashboard pages
├── types/             # TypeScript type definitions
└── App.tsx           # Main application component
```

## 🎯 Usage

### Restaurant Owners

1. **Sign Up**: Create an account at `/restaurant/auth`
2. **Setup**: Configure your restaurant in Settings
3. **Menu**: Add your menu items with photos and details
4. **Orders**: Monitor and manage incoming orders
5. **Analytics**: Track performance and customer insights
6. **AI Assistant**: Get intelligent business recommendations

### Customers

1. **Browse**: Visit restaurant pages (`/restaurant-slug`)
2. **Account**: Create customer account at `/customer/auth`
3. **Order**: Place orders and track status
4. **Reviews**: Write reviews and rate restaurants
5. **Loyalty**: Earn points and redeem rewards
6. **Favorites**: Save favorite restaurants

## 🔒 Security Features

- **Authentication**: Secure user authentication with password hashing
- **Authorization**: Role-based access control (restaurant owners vs customers)
- **Data Validation**: Comprehensive input validation and sanitization
- **Session Management**: Secure session handling
- **Error Handling**: Graceful error handling and user feedback

## 🚀 Production Deployment

### Environment Variables for Production

```env
VITE_APP_ENV=production
VITE_APP_URL=https://yourapp.com
# ... other production configs
```

### Build for Production

```bash
npm run build
```

### Deploy

The built files in `dist/` can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the GitHub Issues
2. Review the documentation
3. Contact the development team

## 🔄 Updates

The platform is actively maintained with regular updates for:
- New features
- Security patches
- Performance improvements
- Bug fixes

---

**RestaurantOS** - Transforming the restaurant industry with AI-powered innovation! 🍽️✨