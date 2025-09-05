# Setup Guide

## Prerequisites
- Node.js 18+
- Firebase account
- OpenAI API key

## Quick Setup

### 1. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Firebase config
npm run dev
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### 3. Firebase Setup
1. Create Firebase project
2. Enable Authentication (Google, Email)
3. Create Firestore database
4. Add your domain to authorized domains

### 4. OpenAI Setup
1. Get API key from OpenAI
2. Add to backend .env file
3. Test with sample transaction

## Development URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Next Steps
1. Test landing page
2. Set up authentication
3. Implement PDF upload
4. Add AI categorization