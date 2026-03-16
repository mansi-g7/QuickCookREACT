# QuickCook Development Setup Guide

## Problem Analysis

**What was happening:**
Every time you reopened VS Code, you got network errors because:

1. The backend server wasn't starting automatically
2. The frontend needed to connect to a backend at `http://localhost:5000/api`
3. You had to manually start the backend in a separate terminal
4. If you forgot or didn't know about it, the login would fail with "Network Error"

## Solution Implemented

### 1. **Concurrent Development Server**

- Installed `concurrently` package to run backend and frontend simultaneously
- Added new npm scripts:
  - `npm run dev` - Starts both backend (port 5000) and frontend (port 5173)
  - `npm run server` - Starts only the backend
  - `npm run client` - Starts only the frontend

### 2. **Environment Configuration**

- Created `.env` file for configuration (your local secrets)
- Created `.env.example` file to document available options
- Added `.env` to `.gitignore` to prevent committing secrets
- Backend now reads from environment variables instead of hardcoded URLs

### 3. **Better Error Messages**

- Added checkmarks (✓) to show successful startup
- Backend logs the MongoDB URI on startup
- Clearer error messages for troubleshooting

## How to Use Going Forward

### **Option 1: One Command (Recommended)**

```bash
npm run dev
```

This starts BOTH backend and frontend automatically:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173` or `http://localhost:5174` (if 5173 is busy)

### **Option 2: Separate Terminals**

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

### **Option 3: Seed Admin User (If Needed)**

```bash
npm run seed
```

## Prerequisites

Make sure MongoDB is running on `localhost:27017`:

```bash
# On Windows
mongod

# Or use MongoDB Desktop App to start the service
```

## Credentials

- **Username:** Admin
- **Password:** admin123

## What Changed in Your Project

### Files Modified:

- `package.json` - Added new npm scripts
- `backend/server.js` - Now uses environment variables

### Files Created:

- `.env` - Your local configuration (gitignored)
- `.env.example` - Example configuration template
- `.gitignore` - Updated to ignore .env files

## Future-Proofing

If you encounter issues:

1. Check MongoDB is running
2. Run `npm run dev` (this starts both servers)
3. Check that you're using the correct credentials (Admin / admin123)
4. Clear browser cache and localStorage if needed
5. Check the terminal output for specific error messages

## Security Note

The `.env` file is ignored by git, so your local configuration won't be committed. Always use `.env.example` as a template for other team members.
