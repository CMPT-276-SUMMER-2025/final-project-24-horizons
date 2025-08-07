# StudySync

A full-stack web application for student productivity and note-taking, built with Vite, and Node.js.

[StudySync Website](https://studysync-ai.netlify.app)

[Milestone 2 Report](./docs/final/Milestone_2_Final_Report.pdf)

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CMPT-276-SUMMER-2025/final-project-24-horizons.git
   cd final-project-24-horizons
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```
  - Note: if running on mac you will first have to remove the package-lock.json file before running the ```npm install```command 


3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```
   - Note: if running on mac you will first have to remove the package-lock.json file before running the ```npm install```command 

4. **Environment Setup**

   **Frontend Environment (`.env` in root directory):**
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3009
   
   # Google OAuth Configuration
   VITE_GOOGLE_CLIENT_ID=
   
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   
   # Gemini AI Configuration
   VITE_GEMINI_API_KEY=
   ```

   **Backend Environment (`backend/.env`):**
   ```env
   # Server Configuration
   PORT=3009
   NODE_ENV=development
   
   # Database Configuration
   DATABASE_PATH=./database/studysync.db
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   
   # JWT Configuration
   JWT_SECRET=<your-super-secret-jwt-key-here-make-it-long-and-random>

   # CORS Configuration - This is http://localhost:<the-port-in-frontend-env>
   CLIENT_URL=http://localhost:5173
   
   # Cookie Configuration (used only when NODE_ENV=production)
   COOKIE_DOMAIN=.localhost
   ```

   **Notes:**
   - The SQLite database will be created automatically on first run
   - Google OAuth credentials are required for authentication - get them from [Google Cloud Console](https://console.cloud.google.com/)
   - JWT_SECRET should be a long, random string for security
   - COOKIE_DOMAIN is used only for when production is used in NODE_ENV. This value for COOKIE_DOMAIN is the domain where the backend can be accessed.

5. **Start the development servers**

   **Option 1: Run both servers separately**
   ```bash
   # Terminal 1 - Frontend (runs on http://localhost:5173)
   npm run dev
   
   # Terminal 2 - Backend (runs on http://localhost:3009)
   cd backend
   npm start
   ```

   **Option 2: Using Docker (if available) for the backend and terminal for the frontend**
   
   Backend:

   ```bash
   cd backend
   docker-compose up -d
   ```
   - docker compose is ran in detached mode, but can be ran normally by removing ```-d```

   Front End:

   Go to root directory of folder and run
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3009
   - Health check: http://localhost:3009/api/health

## 🏗️ Project Structure

```
├── src/                    # Frontend React application
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   ├── LandingPage.tsx    # Landing page component
│   └── assets/            # Static assets
├── backend/               # Node.js backend server
│   ├── server.js          # Express server
│   ├── database/          # Database management
│   └── docker-compose.yml # Docker configuration
├── public/                # Public assets
├── docs/                  # Project documentation
└── package.json           # Frontend dependencies and scripts
```

## 🛠️ Development

### Frontend Development

The frontend is built with:
- **React** with TypeScript
- **Vite** for fast development and building
- **ESLint** for code linting

Key files:
- [`vite.config.ts`](vite.config.ts) - Vite configuration with React and Tailwind plugins
- [`index.html`](index.html) - Main HTML template
- [`src/main.tsx`](src/main.tsx) - Application entry point

### Backend Development

The backend provides:
- **Express.js** REST API
- **SQLite** database with [`DatabaseManager`](backend/database/database.js) class
- **JWT Authentication** 
- **Notes CRUD operations**
- **User goals management**
- **Flashcards functionality**

Key endpoints:
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create new note
- `GET /api/flashcards` - Get user flashcards
- `GET /api/user/goals` - Get user goals
- `GET /api/health` - Health check

### Database

The application uses SQLite with the [`DatabaseManager`](backend/database/database.js) class that provides:
- Automatic database initialization
- User and notes management
- Flashcards and goals storage
- Foreign key constraints
- Performance optimizations (WAL mode, caching)

## 📝 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
npm start            # Start backend server
npm run dev          # Start with nodemon (if configured)
```

## 🐳 Docker Support

The project includes Docker support via docker-compose for the backend server
- [`backend/Dockerfile`](backend/Dockerfile) - Backend container
- [`backend/docker-compose.yml`](backend/docker-compose.yml) - Multi-service setup


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

- [Project Proposal](docs/proposal/README.md)
- [Design Documentation](docs/design/README.md)
- [Communication Log](docs/communication/README.md)
- [AI Disclosures](docs/ai-disclosures/M0/README.md)

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3009 (backend) and 5173 (frontend) are available
2. **Database issues**: The SQLite database is created automatically in the backend directory
3. **CORS errors**: The backend is configured to handle CORS for local development, if deploying on another domain chance the COOKE_DOMAIN variable in backend/.env
4. **Authentication**: Uses HTTP-only cookies for session management
5. **Missing environment variables**: Check that all required `.env` variables are set

### Development Tips

- Hot reload is enabled for both frontend and backend
- The frontend uses polling for file watching (configured in [`vite.config.ts`](vite.config.ts))
- Database operations include automatic user creation via [`ensureUserExists`](backend/database/database.js)
- Google OAuth setup is required for authentication to work
