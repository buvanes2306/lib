LIBRARY MANAGEMENT SYSTEM
=========================

A full-stack web application for managing library books and users.

TECH STACK
----------
Backend: Node.js, Express.js, MongoDB, JWT Authentication
Frontend: React 18, Vite, Tailwind CSS, React Router

QUICK START
-----------

1. Backend Setup:
   cd backend
   npm install
   cp .env.example .env
   npm run dev

2. Frontend Setup:
   cd frontend
   npm install
   npm run dev

3. Access the application:
   Frontend: http://localhost:3000
   Backend API: http://localhost:8000

FEATURES
--------
- User authentication (JWT + Google OAuth)
- Book management (CRUD operations)
- Search and filter books
- Role-based access (Admin/Viewer)
- Barcode scanning support
- Responsive design

ENVIRONMENT SETUP
-----------------
Backend (.env):
- MONGODB_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret
- GOOGLE_CLIENT_ID=your_google_client_id
- GOOGLE_CLIENT_SECRET=your_google_client_secret

Frontend (.env):
- VITE_API_URL=http://localhost:8000

FOLDER STRUCTURE
----------------
backend/     - Node.js API server
frontend/    - React application
python/      - Data processing scripts
scripts/     - Database utilities

For detailed setup instructions, see README.md
