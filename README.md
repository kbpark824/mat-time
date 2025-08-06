# 🥋 Mat Time

**A comprehensive jiujitsu training tracker for serious practitioners**

Mat Time is a modern, full-stack mobile application designed specifically for Brazilian Jiu-Jitsu practitioners who want to systematically track their training journey. Built with React Native and Node.js, it combines intuitive session logging with powerful analytics to help you understand and improve your training patterns.

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/kbpark824/mat-time)
[![Security Verified](https://img.shields.io/badge/Security-Enterprise%20Grade-blue)](https://github.com/kbpark824/mat-time)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📝 What is Mat Time?

Mat Time transforms how jiujitsu practitioners track their progress by providing:

- **Smart Session Logging**: Log training sessions, seminars, and competitions with detailed notes
- **Advanced Tagging System**: Categorize techniques with a searchable, scalable tag interface
- **Training Analytics**: Visualize your progress with charts, streaks, and personalized insights
- **Unified Search**: Find any training session across your entire history instantly
- **Pro Features**: Advanced analytics, seminar tracking, and competition logging for serious practitioners

**Perfect for**: BJJ practitioners, BJJ competitors, and anyone serious about tracking their training progression.

---

## ⚙️ Tech Stack

### Frontend
- **React Native 0.79.5** with **Expo SDK 53** - Cross-platform mobile development
- **Expo Router** - File-based navigation with 5-tab architecture
- **React Native Chart Kit** - Data visualization and analytics
- **Expo Secure Store** - Secure token storage
- **RevenueCat** - Subscription management and pro features

### Backend
- **Node.js** with **Express 5.1.0** - RESTful API server
- **MongoDB** with **Mongoose 8.16.1** - Document database with ODM
- **JWT Authentication** - Secure user sessions with bcrypt password hashing
- **Winston** - Structured logging
- **Joi** - Comprehensive input validation

### Security & Infrastructure
- **Helmet.js** - Security headers and CORS configuration
- **Express Rate Limiting** - Tiered API protection
- **Railway** - Production hosting and deployment
- **Environment-based Configuration** - Separate dev/production settings

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **MongoDB** instance (local or cloud)
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli` (for production builds)
- **iOS Simulator** or **Android Emulator** (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kbpark824/mat-time.git
   cd mat-time
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # In server/ directory
   cp .env.example .env
   # Edit .env with your configuration (see Environment Variables section)
   ```

### Development

1. **Start the backend server**
   ```bash
   cd server
   npm run server  # Uses nodemon for hot reload
   ```

2. **Start the Expo development server**
   ```bash
   cd client
   npm start
   ```

3. **Run on your preferred platform**
   ```bash
   npm run ios        # iOS Simulator
   npm run android    # Android Emulator  
   npm run web        # Web browser
   ```

### Production Build

1. **Build the server**
   ```bash
   cd server
   npm start  # Production server
   ```

2. **Build the client**
   ```bash
   cd client
   eas build --platform ios --profile production    # iOS production
   eas build --platform android --profile preview   # Android testing
   ```

---

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd server
npm test

# Frontend linting
cd client
npm run lint
```

> **Note**: Comprehensive testing suite is planned for future implementation. Currently relies on manual testing and production monitoring.

---

## 📁 Project Structure

```
mat-time/
├── client/                 # React Native Expo app
│   ├── app/               # Expo Router pages and navigation
│   │   ├── (tabs)/        # Tab-based navigation screens
│   │   ├── _layout.js     # Root layout with navigation config
│   │   ├── login.js       # Authentication screens
│   │   └── log*.js        # Activity logging screens
│   ├── components/        # Reusable UI components
│   │   ├── Dashboard.js   # Analytics dashboard
│   │   ├── LogFormLayout.js  # Shared form component
│   │   └── SearchableTagDropdown.js  # Advanced tag interface
│   ├── api/              # HTTP client configuration
│   ├── auth/             # Authentication context and storage
│   ├── config/           # App configuration and API endpoints
│   └── constants/        # Color themes and app constants
├── server/                # Node.js Express API
│   ├── config/           # Database and logging configuration
│   ├── middleware/       # Authentication, validation, error handling
│   ├── models/           # MongoDB schemas (User, Session, etc.)
│   ├── routes/           # API endpoint definitions
│   └── server.js         # Express app entry point
└── docs/                 # Documentation and context files
```

---

## 🔐 Environment Variables

### Server Configuration (`.env`)

```bash
# Database
MONGO_URI=mongodb://localhost:27017/mattime  # MongoDB connection string

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key  # JWT signing secret

# RevenueCat Integration
REVENUECAT_WEBHOOK_SECRET=your-webhook-secret  # Subscription webhook verification

# Server Configuration
PORT=5001                    # Server port (optional, defaults to 5001)
NODE_ENV=development         # Environment mode: development|production
```

### Client Configuration (`app.json`)

```json
{
  "expo": {
    "extra": {
      "apiEnvironment": "production",           // API endpoint selection
      "revenueCatAppleKey": "appl_xxxxx",      // RevenueCat Apple API key
      "revenueCatGoogleKey": "goog_xxxxx"      // RevenueCat Google API key
    }
  }
}
```

> **Security Note**: RevenueCat public API keys are safe for client-side use. Never expose secret keys or JWT secrets.

---

## 📦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email/password
- `POST /api/auth/login` - User authentication
- `DELETE /api/auth/account` - Account deletion with data cleanup

### Activity Management
- `GET /api/sessions` - Retrieve user sessions with search/filter
- `POST /api/sessions` - Create new training session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `GET /api/seminars` - Seminar management (Pro feature)
- `GET /api/competitions` - Competition tracking (Pro feature)

### Analytics & Data
- `GET /api/stats/summary` - Basic dashboard statistics
- `GET /api/stats/advanced` - Advanced analytics (Pro feature)
- `GET /api/tags` - User tag management
- `POST /api/tags` - Create new tags

### Business Integration
- `POST /api/revenuecat/webhook` - Subscription status updates
- `GET /api/health` - System health monitoring

### Key Features

#### Free Tier
- ✅ Unlimited session logging
- ✅ Advanced tagging system
- ✅ Search and filtering
- ✅ Basic analytics and training streaks
- ✅ Dashboard with progress charts

#### Pro Tier ($4.99/month)
- 🌟 Seminar logging with instructor tracking
- 🌟 Competition logging with match details
- 🌟 Advanced analytics dashboard
- 🌟 Training consistency metrics
- 🌟 Personalized insights

---

## 🛠️ Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Follow the existing code style**
   - Use ESLint configuration provided
   - Follow React Native and Express.js best practices
   - Add comprehensive input validation

3. **Test your changes**
   - Ensure no security vulnerabilities
   - Test on both iOS and Android
   - Verify API changes don't break existing functionality

4. **Commit with clear messages**
   ```bash
   git commit -m "Add amazing feature for better user experience"
   ```

5. **Submit a Pull Request**
   - Describe the changes and their purpose
   - Reference any related issues
   - Ensure CI passes

### Code Standards
- **Security First**: All user inputs must be validated
- **Performance**: Consider database query efficiency
- **User Experience**: Maintain consistent UI/UX patterns
- **Documentation**: Update README and inline comments

---

## 🧹 Known Issues / Technical Debt

### Medium Priority
- **React Performance**: Missing `useCallback`/`useMemo` optimizations in some components (~60 min fix)
- **Component Size**: `AdvancedAnalytics.js` should be broken into smaller sub-components (~45 min fix)

### Low Priority
- **Testing Suite**: Comprehensive unit and integration tests needed
- **TypeScript**: Consider migration for better type safety
- **Advanced Search**: Enhanced filtering and search operators

---

## 🙌 Acknowledgements

- **React Native & Expo Team** - Exceptional cross-platform development framework
- **MongoDB** - Flexible document database perfect for training data
- **RevenueCat** - Seamless subscription management and analytics
- **Brazilian Jiu-Jitsu Community** - Inspiration and feedback for feature development
- **Open Source Contributors** - The amazing packages that make this possible

### Special Thanks
- **Chart.js & react-native-chart-kit** - Beautiful data visualization
- **Helmet.js** - Security-first middleware
- **Winston** - Professional logging infrastructure

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/kbpark824/mat-time/issues)
- **Email**: support@mat-time.io

### Development Status

**Current Version**: 1.0.1 (submitted to app stores)  
**Status**: Production Ready ✅  
**Security**: Enterprise Grade (11/11 vulnerabilities resolved)  
**Last Updated**: January 2025

**Recent Updates (v1.0.1)**:
- Added instructor field to session logging
- Fixed Android navigation bar covering delete buttons
- Improved competition/seminar activity card display
- Enhanced keyboard scrolling on Android
- Fixed password reset functionality

---

*Built with ❤️ for the jiujitsu community*