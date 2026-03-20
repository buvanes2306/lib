# Library Management System

A production-ready Library Management Web Application built with modern web technologies.

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google OAuth** with Passport.js
- **bcrypt** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **Rate Limiting** for API protection

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 👥 User Roles & Permissions

### Viewer
- Login via Email/Password or Google
- View books
- Search books
- View book details
- Cannot modify data

### Admin
- All Viewer permissions
- Add new books
- Edit books
- Delete books
- View all users
- Search books
- Manage user roles

## 📁 Project Structure

```
library-management/
├── backend/
│   ├── config/
│   │   └── passport.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   └── Book.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── users.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Books.jsx
│   │   │   ├── BookDetail.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── Users.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Cloud Console account (for OAuth)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://buvanese23:mokeshprabu@cluster0.iqo4vu3.mongodb.net/librarydb
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## 🔐 Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
   - Copy Client ID and Client Secret

4. **Update backend .env**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Books
- `GET /api/books` - Get all books (with pagination, search, filters)
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)
- `PATCH /api/books/:id/status` - Update book status (Admin only)
- `GET /api/books/stats` - Get book statistics (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/stats` - Get user statistics (Admin only)
- `PUT /api/users/profile/update` - Update own profile

## 🗄️ MongoDB Schemas

### User Schema
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (required if not Google login),
  role: enum ['admin', 'viewer'] (default: 'viewer'),
  googleId: String (optional),
  avatar: String,
  createdAt: Date (default: now)
}
```

### Book Schema
```javascript
{
  accNo: String (unique, required),
  title: String (required),
  author: String (required),
  publisher: String,
  publishedYear: Number,
  department: String (required),
  status: enum ['Available', 'Issued'] (default: 'Available'),
  locationRack: String (required),
  shelf: String (required),
  callNumber: String (required),
  edition: String,
  numberOfCopies: Number (required),
  isbn: String,
  description: String,
  addedBy: ObjectId (ref: 'User'),
  createdAt: Date (default: now)
}
```

## 🔧 Features

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Role-based access control (RBAC)
- Google OAuth integration
- Password hashing with bcrypt
- Protected routes and API endpoints

### Book Management
- Full CRUD operations
- Advanced search functionality
- Pagination and filtering
- Status management (Available/Issued)
- Department categorization

### User Management (Admin)
- View all users
- Search and filter users
- Role management
- User deletion

### UI/UX Features
- Responsive design
- Loading states
- Error handling with toast notifications
- Modern, clean interface
- Mobile-friendly navigation

## 🛡️ Security Features

- JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet
- SQL injection prevention (MongoDB)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920x1080 and above)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use a reverse proxy (nginx)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to static hosting service
3. Configure environment variables
4. Set up proper routing


## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB URI in .env
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Google OAuth Not Working**
   - Verify Client ID and Secret
   - Check redirect URI configuration
   - Ensure OAuth consent screen is configured

3. **CORS Issues**
   - Check FRONTEND_URL in backend .env
   - Verify API proxy configuration in Vite

4. **JWT Token Issues**
   - Check JWT_SECRET in .env
   - Verify cookie settings
   - Check token expiration

