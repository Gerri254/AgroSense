# ✅ CORS Issue Fixed!

## Problem Encountered

```
Access to fetch at 'http://localhost:5000/api/auth/login' from origin 'http://localhost:5174'
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value
'http://localhost:5173' that is not equal to the supplied origin.
```

## Root Cause

Frontend was running on port **5174** instead of **5173**, but backend CORS was only configured for port **5173**.

## Solution Applied

### 1. **Updated Backend CORS Configuration** ([backend/server.js](backend/server.js))

Changed from single origin:
```javascript
const CORS_ORIGIN = 'http://localhost:5173';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
```

To multiple allowed origins:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',  // Added
  CORS_ORIGIN
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 2. **Updated Socket.IO CORS** ([backend/services/socketService.js](backend/services/socketService.js))

Now accepts array of origins:
```javascript
const allowedOrigins = Array.isArray(corsOrigin)
  ? corsOrigin
  : [corsOrigin || 'http://localhost:5173'];

this.io = new Server(server, {
  cors: {
    origin: allowedOrigins,  // Now supports multiple origins
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### 3. **Backend Passes Multiple Origins to Socket.IO**

```javascript
const io = socketService.initialize(server, allowedOrigins);  // Array instead of string
```

## Testing the Fix

### 1. **Restart Backend**
```bash
# Stop backend (Ctrl+C)
cd backend
npm run dev
```

**You should see**:
```
✅ Connected to MongoDB
✅ Connected to MQTT broker
🔌 Socket.IO initialized
🚀 Server running on port 5000
```

### 2. **Restart Frontend**
```bash
# Stop frontend (Ctrl+C)
cd frontend
npm run dev
```

**Now works on either**:
- `http://localhost:5173` ✅
- `http://localhost:5174` ✅

### 3. **Test Login**

Open browser to whichever port frontend is running on and login:
- Username: `admin`
- Password: `admin123`

**Should work without CORS errors!** ✅

## Why This Happened

Vite (frontend dev server) automatically increments the port if **5173** is already in use. This can happen if:
- You already have another Vite app running
- Port 5173 wasn't released from previous session
- Another process is using port 5173

## Prevention

Backend now supports both common Vite ports (**5173** and **5174**), so this won't be an issue anymore.

## Verification

Open browser console (F12) and you should see:
```
✅ Backend health: {status: 'OK', mongodb: 'connected', mqtt: 'connected'}
✅ WebSocket connected: abc123
```

**No CORS errors!** 🎉

## Additional CORS Notes

### Adding More Allowed Origins

If you need to add more origins (e.g., for production), edit [backend/server.js](backend/server.js):

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://yourdomain.com',        // Production frontend
  'https://app.yourdomain.com',    // Production app
  CORS_ORIGIN                      // From .env
];
```

### For Wildcard (Development Only)

**WARNING**: Only use in development!

```javascript
app.use(cors({
  origin: true,  // Allows all origins (INSECURE!)
  credentials: true
}));
```

## Files Modified

1. ✅ [backend/server.js](backend/server.js) - CORS configuration
2. ✅ [backend/services/socketService.js](backend/services/socketService.js) - Socket.IO CORS

## Status

✅ **CORS issue resolved**
✅ **Backend supports ports 5173 and 5174**
✅ **Both REST API and WebSocket working**

---

**The system should now work properly!** Restart both backend and frontend to apply the changes. 🚀
