# Sonotrade Backend

Backend API for Sonotrade application built with Express.js and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - Option 1: Use Docker (recommended): `docker-compose up -d`
   - Option 2: Install MongoDB locally (see MONGODB_SETUP.md)
   - Option 3: Use MongoDB Atlas (cloud)

3. Create a `.env` file:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sonotrade
```

4. Run in development mode:
```bash
npm run dev
```

The server will start on `http://localhost:5000` and connect to MongoDB automatically.

5. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/test` - Test endpoint with timestamp
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (body: { name, email })
- `PUT /api/users/:id` - Update user (body: { name, email })
- `DELETE /api/users/:id` - Delete user

## CORS Configuration

The backend is configured to accept requests from:
- Frontend: `http://localhost:3000`
- Admin Panel: `http://localhost:3001`

You can modify the CORS origins in `src/index.ts` if needed.

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Main server file
│   ├── config/
│   │   └── database.ts   # MongoDB connection
│   ├── models/
│   │   └── User.ts       # User model example
│   └── routes/
│       └── api.ts        # API routes
├── dist/                 # Compiled output (generated)
├── docker-compose.yml    # MongoDB Docker setup
└── package.json
```
