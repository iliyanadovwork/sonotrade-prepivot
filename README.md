![sonotrade-header](https://github.com/user-attachments/assets/0ef7248e-be39-4500-9b9e-b7004fa4382e)
# Sonotrade
## Repository Structure

```
sonotrade-v2/
├── frontend/    # Main frontend application (Next.js) - Port 3000
├── admin-panel/     # Admin panel (Next.js with StyleX) - Port 3001
└── backend/         # Backend API (Express.js) - Port 5000
```

## Tech Stack

### Frontend (Main App)
- Next.js 16
- React 19
- StyleX
- shadcn/ui
- Tailwind CSS

### Admin Panel
- Next.js 16
- React 19
- StyleX ⭐
- shadcn/ui
- Tailwind CSS

### Backend
- Express.js
- TypeScript
- Node.js
- CORS enabled for frontend and admin panel

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Running All Services

You'll need to run each service in a separate terminal:

#### 1. Backend Server (Terminal 1)
```bash
cd backend
npm install
npm run dev
```
Backend will run on: http://localhost:5000

#### 2. Main Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:3000

#### 3. Admin Panel (Terminal 3)
```bash
cd admin-panel
npm install
npm run dev
```
Admin Panel will run on: http://localhost:3001

## API Connection

Both the frontend and admin panel are configured to connect to the backend API at `http://localhost:5000/api`.

You can set a custom API URL using environment variables:
- Create `.env.local` in `sonotrade-v2/` or `admin-panel/`
- Add: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

## API Endpoints

The backend provides the following endpoints:

- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint with timestamp
- `GET /api/users` - Get users list (example)

## Development

### Backend
- Uses `tsx` for hot reloading in development
- TypeScript compilation for production builds
- CORS configured for local development

### Frontend & Admin Panel
- Next.js hot reloading
- StyleX for styling (compiled at build time)
- API client utilities in `lib/api/client.ts`

## Notes

- Admin Panel uses **StyleX** for all styling
- All three services can run simultaneously on different ports
- Backend CORS is configured to allow requests from both frontend and admin panel

## About this copy

Sonotrade's pre-pivot product: an event-outcome prediction market with server-held
Solana wallets, gasless withdrawals via a sponsor fee-payer, and a DFlow venue
integration. Active January to May 2026, before the company pivoted to artist indexes.

Built by a team.
