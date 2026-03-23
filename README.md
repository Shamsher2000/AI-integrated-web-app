# MERN AI Assistant

A high-performance, full-stack AI chat application built with the **MERN** (MongoDB, Express, React, Node.js) stack. It supports multiple AI providers, real-time streaming responses, and seamless authentication.

## 🚀 Features

- **Real-time Streaming Chat**: SSE-based token streaming for ultra-low latency responses
- **Multiple AI Providers**: Switch between Groq, OpenAI, and Hugging Face using environment variables
- **User Authentication**: JWT-based secure authentication with bcrypt password hashing
- **User Avatars**: Choose from 8 preset avatars during registration and profile management
- **Chat Management**: Create, retrieve, search, and organize conversations
- **Persistent Storage**: MongoDB for chat history and user data
- **Responsive UI**: React + Vite + Tailwind CSS modern interface
- **Theme Support**: Light, Dark, and System theme preferences
- **Error Handling**: Comprehensive error handling and validation
- **Rate Limiting**: Built-in API rate limiting for production safety
- **Security**: Helmet.js, CORS, password encryption

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** (v8.0.0 or higher)
- **MongoDB** (v6.0 or higher) - running locally or connection string for cloud
- **At least one AI provider API key**
  - Groq: [console.groq.com](https://console.groq.com)
  - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - Hugging Face: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

## Supported AI Providers

The backend currently supports these providers through `server/src/services/ai/providerFactory.js`:

- `groq`
- `openai`
- `huggingface`

Set `AI_PROVIDER` in `server/.env` to switch providers.

## ⚙️ Installation & Setup

### 1. Clone or Download the Project

```bash
cd AI-integrated-web-app
```

### 2. Install Dependencies

Install both server and client dependencies:

```bash
npm install
```

This command will install dependencies for both server and client (configured in root package.json).

Or install separately:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Create `server/.env` file from `server/.env.example` or manually, then update with your values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:4173
CLIENT_URLS=http://localhost:5173,http://localhost:4173

# MongoDB - IMPORTANT: Must be configured
# For local MongoDB (must be running):
MONGO_URI=mongodb://127.0.0.1:27017/mern-ai-assistant

# For MongoDB Atlas (cloud):
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=replace_me_with_a_long_random_secret_key_at_least_32_characters
JWT_EXPIRES_IN=12h

# AI Provider (groq, openai, or huggingface)
AI_PROVIDER=groq

# Groq Configuration (free tier available)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_MAX_TOKENS=2000
```

For **client/.env**:
```env
VITE_API_URL=http://localhost:5000/api
```

# OpenAI Configuration (paid)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000

# Hugging Face Configuration
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct
HUGGINGFACE_MAX_TOKENS=2000

# Chat Configuration
MAX_CHAT_HISTORY=12
MAX_CONTENT_LENGTH=6000
```

#### Key Environment Variables:

| Variable | Description | default |
|----------|-------------|---------|
| `MONGO_URI` | **REQUIRED** - MongoDB connection string; see troubleshooting if you get `ECONNREFUSED 127.0.0.1:27017` | (none) |
| `PORT` | Backend server port | `5000` |
| `CLIENT_URL` | Primary frontend URL for CORS | `http://localhost:5173` |
| `CLIENT_URLS` | Comma-separated frontend URLs allowed by CORS | `http://localhost:5173,http://localhost:4173` |
| `JWT_SECRET` | **REQUIRED** - Secret key for signing JWT tokens (use long random string in production!) | (none) |
| `JWT_EXPIRES_IN` | JWT token expiration time | `12h` |
| `AI_PROVIDER` | Which AI provider to use: `groq`, `openai`, or `huggingface` | `groq` |
| `GROQ_API_KEY` | Required when `AI_PROVIDER=groq` | - |
| `OPENAI_API_KEY` | Required when `AI_PROVIDER=openai` | - |
| `HUGGINGFACE_API_KEY` | Required when `AI_PROVIDER=huggingface` | - |
| `MAX_CHAT_HISTORY` | Number of previous messages to include in context | `12` |
| `MAX_CONTENT_LENGTH` | Maximum message length in characters | `6000` |

### Troubleshooting MongoDB Connection

If you see: `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Ensure `MONGO_URI` is set in `server/.env` file
2. If using local MongoDB:
   - Start MongoDB service: `net start MongoDB` (Windows) or `mongod` (macOS/Linux)
   - Verify it's running on port 27017
3. If using MongoDB Atlas (cloud):
   - Update `MONGO_URI` with your connection string
   - Ensure IP whitelist allows your connection
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
4. Check logs for exact error message

### 4. Start MongoDB

For development, ensure MongoDB is running on your system:

```bash
# On Windows (if installed as service)
net start MongoDB

# On MacOS/Linux
mongod

# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Using MongoDB Atlas (cloud) - no local service needed
# Just update MONGO_URI in .env with your connection string
```

### 5. Run the Application

#### Development Mode (Both Apps Together)

```bash
npm run dev
```

This starts:
- **Backend**: `http://localhost:5000` (with hot-reload via nodemon)
- **Frontend**: `http://localhost:4173` (with Vite dev server)

#### Run Separately

```bash
# Terminal 1: Start backend only
npm run dev:server

# Terminal 2: Start frontend only
npm run dev:client
```

#### Production Build

```bash
# Build the frontend
npm run build:client

# Start the backend (on the configured PORT)
npm run start:server
```

## 🏗️ Project Structure

```
mern-ai-assistant/
├── server/                          # Express backend
│   ├── src/
│   │   ├── app.js                   # Express app configuration
│   │   ├── server.js                # Server entry point
│   │   ├── config/                  # Configuration files
│   │   │   ├── db.js                # MongoDB connection
│   │   │   └── env.js               # Environment validation
│   │   ├── constants/               # Constants
│   │   │   └── assistantPrompt.js   # AI assistant system prompt
│   │   ├── controllers/             # Request handlers
│   │   │   ├── auth.controller.js   # Auth endpoints
│   │   │   ├── chat.controller.js   # Chat endpoints
│   │   │   ├── profile.controller.js# Profile endpoints
│   │   │   └── health.controller.js # Health check
│   │   ├── services/                # Business logic
│   │   │   ├── auth.service.js      # Authentication logic
│   │   │   ├── chat.service.js      # Chat operations
│   │   │   └── ai/                  # AI provider implementations
│   │   │       ├── groq.provider.js # Groq API
│   │   │       ├── openai.provider.js# OpenAI API
│   │   │       ├── huggingface.provider.js# Hugging Face API
│   │   │       ├── openaiCompatible.provider.js# Compatible with OpenAI API
│   │   │       └── providerFactory.js# Provider factory pattern
│   │   ├── models/                  # Database schemas
│   │   │   ├── User.js              # User schema
│   │   │   ├── Chat.js              # Chat schema
│   │   │   └── Message.js           # Message schema
│   │   ├── routes/                  # API routes
│   │   │   ├── index.js             # Route aggregator
│   │   │   ├── auth.routes.js       # Authentication routes
│   │   │   ├── chat.routes.js       # Chat management routes
│   │   │   ├── profile.routes.js    # User profile routes
│   │   │   └── health.routes.js     # Health check route
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   └── validate.js          # Input validation
│   │   ├── utils/                   # Utility functions
│   │   │   ├── asyncHandler.js      # Async error wrapper
│   │   │   ├── ApiError.js          # Custom error class
│   │   │   ├── sse.js               # Server-Sent Events
│   │   │   ├── token.js             # JWT token utilities
│   │   │   └── chat.js              # Chat utilities
│   │   ├── validations/             # Input validation schemas
│   │   │   ├── auth.validation.js   # Auth validation rules
│   │   │   ├── chat.validation.js   # Chat validation rules
│   │   │   └── profile.validation.js# Profile validation rules
│   ├── uploads/                     # User uploaded files (e.g., avatars)
│   ├── package.json
│   ├── .env                         # Environment variables
│   └── .env.example                 # Environment template
└── client/                          # React frontend
    ├── src/
    │   ├── main.jsx                 # React entry point
    │   ├── App.jsx                  # Main app component
    │   ├── index.css                # Global styles
    │   ├── components/              # React components
    │   │   ├── chat/                # Chat-related components
    │   │   │   ├── ChatComposer.jsx # Message input component
    │   │   │   ├── ChatMessageList.jsx# Message display list
    │   │   │   ├── ChatSidebar.jsx  # Chat sidebar/history
    │   │   │   ├── MessageBubble.jsx# Individual message bubble
    │   │   │   ├── MarkdownMessageContent.jsx# Markdown rendering
    │   │   │   └── TypingSkeleton.jsx# Loading indicator
    │   │   ├── common/              # Shared/reusable components
    │   │   │   ├── AvatarDisplay.jsx # Avatar display component
    │   │   │   ├── AvatarSelector.jsx# Avatar selection grid
    │   │   │   ├── LazyImage.jsx    # Optimized image loading
    │   │   │   ├── ThemeToggle.jsx  # Theme switcher
    │   │   │   ├── OfflineBanner.jsx# Offline status banner
    │   │   │   ├── ChatErrorMessage.jsx# Error display
    │   │   │   ├── ErrorBoundary.jsx # Error handling
    │   │   │   └── ProtectedRoute.jsx# Route protection
    │   │   └── layout/              # Layout wrapper components
    │   │       └── AppShell.jsx     # App layout shell
    │   ├── pages/                   # Page-level components
    │   │   ├── ChatPage.jsx         # Main chat interface
    │   │   ├── LoginPage.jsx        # Login page
    │   │   ├── RegisterPage.jsx     # User registration with avatar selection
    │   │   └── ProfilePage.jsx      # User profile settings with avatar management
    │   ├── hooks/                   # Custom React hooks
    │   │   ├── useChatQueries.js    # Chat data fetching
    │   │   ├── useChatStream.js     # Message streaming
    │   │   ├── useDebounce.js       # Debounce utility
    │   │   ├── useImagePreload.js   # Image preloading
    │   │   ├── useKeyboardSubmit.js # Keyboard shortcuts
    │   │   ├── useMessageHandler.js # Message processing
    │   │   └── useOfflineStatus.js  # Offline detection
    │   ├── context/                 # React context providers
    │   │   └── AppContext.jsx       # App-wide context
    │   ├── store/                   # Redux state management
    │   │   ├── store.js             # Redux store configuration
    │   │   ├── appSlice.js          # App state slice
    │   │   └── hooks.js             # Redux hooks
    │   └── lib/                     # Utilities and API
    │       ├── api.js               # API client
    │       ├── avatars.js           # Avatar utilities
    │       └── queryClient.js       # React Query client
    ├── public/
    │   └── avatars/                 # Avatar image assets
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── nodemon.json                 # Nodemon configuration
```

## 📝 Recent Updates

### Avatar System Implementation (March 2026)
- ✅ Added user avatar selection during registration
- ✅ Integrated avatar management in profile settings  
- ✅ Removed avatar names from UI for cleaner display
- ✅ Optimized avatar display with lazy loading
- ✅ Centered avatar images within containers
- ✅ Created reusable `AvatarDisplay` and `AvatarSelector` components
- ✅ Avatar data persisted to MongoDB user profiles

### Code Cleanup
- ✅ Removed unnecessary image assets
- ✅ Removed duplicate nodemon configuration
- ✅ Streamlined component code
- ✅ Optimized CSS class usage
- ✅ Updated folder structure documentation

### Files Modified
- `README.md` - Updated features list and folder structure
- `client/src/pages/RegisterPage.jsx` - Avatar selection on registration
- `client/src/pages/ProfilePage.jsx` - Avatar management in profile
- `client/src/components/common/AvatarDisplay.jsx` - NEW: Avatar display component
- `client/src/components/common/AvatarSelector.jsx` - NEW: Avatar selection grid
- `client/src/components/common/LazyImage.jsx` - NEW: Optimized image loading
- `client/src/lib/avatars.js` - NEW: Avatar utilities and data
- `server/src/services/auth.service.js` - Avatar persistence
- `server/src/controllers/profile.controller.js` - Avatar update endpoints
- `server/src/validations/auth.validation.js` - Avatar validation
- `server/src/validations/profile.validation.js` - Profile validation updates

## 🎨 Avatar System

Users can select and customize their avatar during registration and from their profile settings:

### Avatar Selection
- **8 Avatar Options**: Choose from a variety of preset avatars
- **During Registration**: Select your avatar when creating a new account
- **Profile Settings**: Change your avatar anytime from the Profile page
- **Display**: Avatars are shown in the UI with visual feedback when selected

### How to Use
1. **On Registration Page**: Click on any avatar image to select it
2. **On Profile Page**: Select your preferred avatar from the grid
3. Changes are saved automatically to your profile

## 🔐 Authentication & Profile Management

### First Login

There is no default seeded account.

For first-time use:

1. Open the Register page
2. Create your account with a username (3-30 characters)
3. Sign in with your credentials

### User Profile

After logging in, users can update their profile from the Profile Settings page:

- **Avatar**: Select from a collection of preset avatars
- **Username**: Change your username (3-30 characters, alphanumeric with dots, underscores, dashes)
- **Bio**: Add a short bio up to 240 characters
- **Theme**: Choose between Light, Dark, or System theme preference

All profile changes are persisted to MongoDB and updated across the application in real-time.

### JWT Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login user |
| `GET` | `/api/v1/auth/me` | Get current user |

### Chat Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/chats` | List user's chats (with pagination) |
| `GET` | `/api/v1/chats/:chatId` | Get specific chat with messages |
| `POST` | `/api/v1/chats/message` | Send message (non-streaming) |
| `POST` | `/api/v1/chats/message/stream` | Send message (SSE streaming) |
| `POST` | `/api/v1/chats/:chatId/clear` | Clear all messages in chat |
| `DELETE` | `/api/v1/chats/:chatId` | Delete chat permanently |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/profile` | Get user profile |
| `PATCH` | `/api/v1/profile` | Update user profile |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check endpoint |

## Provider Notes

### Groq

Some commonly used Groq models include:

- `openai/gpt-oss-120b` (Default - Fast and accurate)
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant` (Fastest)
- `llama-3.3-70b-versatile`
- `qwq-32b-preview`
- `gemma2-9b-it`

Update `GROQ_MODEL` in `.env` to use a different Groq model.

### OpenAI

Set `AI_PROVIDER=openai`, then configure `OPENAI_API_KEY`, `OPENAI_MODEL`, and `OPENAI_MAX_TOKENS`.

### Hugging Face

Set `AI_PROVIDER=huggingface`, then configure `HUGGINGFACE_API_KEY`, `HUGGINGFACE_MODEL`, and `HUGGINGFACE_MAX_TOKENS`.

## ⚡ Performance Optimization

### Database Optimization

The application uses MongoDB with optimized queries:

1. **Lean Queries**: Uses `.lean()` for read-only operations (5-10x faster)
2. **Field Selection**: Selects only required fields to reduce payload
3. **Pagination**: Implements pagination for chat lists
4. **Indexes**: Recommends creating indexes for faster queries

Create indexes in MongoDB for better performance:

```javascript
// User unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Chat indexes
db.chats.createIndex({ owner: 1, lastMessageAt: -1 })
db.chats.createIndex({ searchText: "text" })

// Message indexes
db.messages.createIndex({ chat: 1, createdAt: 1 })
```

### API Response Optimization

1. **Server-Sent Events (SSE)**: Streams responses token-by-token for minimal latency
2. **Compression**: Gzip compression enabled for responses
3. **Rate Limiting**: Prevents abuse and ensures fair resource usage
4. **Connection Pooling**: MongoDB connection reuse
5. **Message Batching**: Optimized message history retrieval

### Frontend Optimization

1. **React Query**: Caching and background refetching of data
2. **Redux Persist**: Persistent application state
3. **Code Splitting**: Lazy loading of components
4. **Vite**: Lightning-fast dev server and optimized builds

## 🔒 Security Best Practices

1. **Change JWT Secret**: Update `JWT_SECRET` in production to a strong random string
2. **Use Strong Passwords**: Create strong unique passwords for all accounts
3. **Environment Variables**: Never commit `.env` to version control
4. **HTTPS**: Use HTTPS in production (not just HTTP)
5. **CORS**: Update `CLIENT_URL` to your production domain
6. **Rate Limiting**: Already configured for API endpoints
7. **Helmet**: Security headers enabled
8. **Input Validation**: Using Zod for schema validation

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Make sure MongoDB is running:

```bash
# Check if MongoDB is installed
mongod --version

# Start MongoDB
mongod
```

### Groq API Authentication Error

```
Error: 401 - Authentication failed. Please check your API key.
```

**Solution**: 
1. Make sure `GROQ_API_KEY` in `.env` is correct
2. Regenerate the key from [console.groq.com](https://console.groq.com)
3. Restart the backend after updating the key

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution**: Either:
1. Change the `PORT` in `.env` to an available port (e.g., 5001)
2. Kill the process using port 5000

On Windows:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Not Connecting to Backend

```
Error: Failed to fetch from http://localhost:5000
```

**Solution**: 
1. Make sure backend is running on the configured port
2. Check `CLIENT_URL` in `.env` matches your frontend URL
3. Verify CORS settings in `server/src/app.js`

## 📊 Monitoring & Debugging

### Backend Logs

The backend logs all API requests using Morgan. Check console output for:
- Request method, URL, and response status
- Response time
- Errors and stack traces

### Client-Side Debugging

React DevTools browser extension recommended for debugging component state and props.

## 🚀 Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)

1. Set environment variables on your hosting platform
2. Ensure MongoDB connection string points to your cloud database
3. Update `CLIENT_URL` to your production domain
4. Deploy using:
   ```bash
   npm run start:server
   ```

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting platform
3. Update the API endpoint in `client/src/lib/api.js` to your production backend

## 📝 Code Architecture

### Clean Code Principles

- **Single Responsibility**: Each function/module has one job
- **Modularity**: Separated concerns (controllers, services, models)
- **Error Handling**: Centralized error handling with custom `ApiError`
- **Type Safety**: Using Zod for runtime validation
- **Documentation**: Clear comments explaining complex logic
- **Performance**: Optimized database queries and API responses

### Design Patterns Used

1. **Factory Pattern**: AI provider creation (`providerFactory.js`)
2. **Middleware Pattern**: Express middleware for auth and validation
3. **Service Layer**: Business logic separated from controllers
4. **Repository Pattern**: Models handle database operations

## 🔄 Real-Time Features

### Server-Sent Events (SSE)

The `/api/chats/message/stream` endpoint uses SSE for real-time token streaming:

1. Client sends message
2. Server streams response tokens one at a time
3. Frontend displays tokens as they arrive
4. Low latency due to Groq's fast API

### Connection Management

- Graceful connection closure
- Automatic cleanup on client disconnect
- Proper error propagation

## 📚 Technology Stack

**Backend:**
- Express.js - Web framework
- MongoDB - Database
- Mongoose - ODM
- Groq SDK - Groq provider
- OpenAI SDK - OpenAI provider
- Hugging Face Inference SDK - Hugging Face provider
- JWT - Authentication
- Zod - Validation
- Helmet - Security
- Compression - Response compression
- Morgan - HTTP logging

**Frontend:**
- React 19 - UI library
- Vite - Build tool
- React Router - Routing
- React Query - Data fetching
- Redux Toolkit - State management
- Tailwind CSS - Styling
- React Markdown - Markdown rendering

## 📄 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💬 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the API documentation
3. Check your environment variables
4. Ensure MongoDB is running
5. Verify Groq API key is valid

## 🎯 Future Enhancements

- [ ] Conversation export/import
- [ ] File upload support
- [ ] Custom AI model selection UI
- [ ] Message formatting options
- [ ] Dark mode toggle
- [ ] User preferences/settings
- [ ] Rate limiting dashboard
- [ ] Admin panel
- [ ] Analytics

## 📝 Removed Features

The following features have been removed from the codebase:

- **File Upload/Avatar Upload**: User profile avatars are preset-only now
- **Seed/Admin Scripts**: `seedAdmin.js` and related seeding functionality have been removed
- **Multer Upload Middleware**: File upload processing has been disabled

These simplifications reduce dependencies and maintenance overhead while keeping core functionality intact.

---

**Happy Coding!** 🚀

