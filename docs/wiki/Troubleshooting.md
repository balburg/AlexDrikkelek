# Troubleshooting Guide

Common issues and solutions for AlexDrikkelek.

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Installation Problems](#installation-problems)
3. [Build Errors](#build-errors)
4. [Runtime Errors](#runtime-errors)
5. [Game Functionality Issues](#game-functionality-issues)
6. [Performance Problems](#performance-problems)
7. [Database Issues](#database-issues)
8. [Deployment Issues](#deployment-issues)

## Connection Issues

### Cannot Connect to Backend

**Symptoms:**
- Frontend shows "Connecting..." forever
- WebSocket connection errors in console
- API requests fail with network errors

**Solutions:**

1. **Verify Backend is Running**
   ```bash
   curl http://localhost:3001/health
   ```
   Expected: `{"status":"ok",...}`

2. **Check Environment Variables**
   ```bash
   # In packages/frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

3. **Check Firewall Settings**
   - Windows: Allow Node.js through Windows Firewall
   - Mac: System Preferences → Security → Firewall → Allow Node
   - Linux: `sudo ufw allow 3001`

4. **Verify CORS Configuration**
   ```typescript
   // Backend should allow frontend origin
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Check Browser Console**
   - Press F12 → Console tab
   - Look for CORS or connection errors

---

### WebSocket Keeps Disconnecting

**Symptoms:**
- Socket disconnects and reconnects repeatedly
- "Socket disconnected" messages in console

**Solutions:**

1. **Check Network Stability**
   - Switch to more stable WiFi/Ethernet
   - Test connection: `ping localhost`

2. **Increase Timeout Settings**
   ```typescript
   // Frontend Socket.IO config
   const socket = io(url, {
     timeout: 20000,        // Increase from default
     reconnectionAttempts: 10
   });
   ```

3. **Check Backend Logs**
   ```bash
   # Look for disconnect reasons
   cd packages/backend
   npm run dev
   ```

4. **Disable VPN/Proxy**
   - VPNs can interfere with WebSocket connections
   - Try disabling temporarily

---

### "Room Not Found" Error

**Symptoms:**
- Cannot join room with valid PIN
- Error message: "Room with code ABC123 not found"

**Solutions:**

1. **Verify PIN is Correct**
   - PINs are case-sensitive
   - Check for typos (O vs 0, I vs 1)

2. **Check Room Hasn't Expired**
   - Rooms may expire after inactivity
   - Host should create a new room

3. **Clear Browser Cache**
   ```bash
   # Chrome: Ctrl+Shift+Delete
   # Clear "Cached images and files"
   ```

4. **Check Backend Storage**
   ```bash
   # Verify room exists in storage
   # Check backend logs for errors
   ```

---

## Installation Problems

### `npm install` Fails

**Symptoms:**
- Errors during dependency installation
- "ENOENT" or "EACCES" errors

**Solutions:**

1. **Clear npm Cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js Version**
   ```bash
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 9.0.0 or higher
   ```

3. **Fix Permission Issues (Linux/Mac)**
   ```bash
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

4. **Use Different Registry (if slow/blocked)**
   ```bash
   npm config set registry https://registry.npmjs.org/
   # or
   npm install --registry=https://registry.npmjs.org/
   ```

5. **Install Dependencies Separately**
   ```bash
   cd packages/frontend
   npm install
   
   cd ../backend
   npm install
   ```

---

### Module Not Found Errors

**Symptoms:**
- "Cannot find module '@/components/...'"
- Import errors during build

**Solutions:**

1. **Reinstall Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check tsconfig.json Paths**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

3. **Restart TypeScript Server (VS Code)**
   - Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## Build Errors

### Next.js Build Fails

**Symptoms:**
- `npm run build:frontend` fails
- Type errors during build

**Solutions:**

1. **Fix TypeScript Errors**
   ```bash
   cd packages/frontend
   npx tsc --noEmit
   # Fix all reported errors
   ```

2. **Clear Next.js Cache**
   ```bash
   cd packages/frontend
   rm -rf .next
   npm run build
   ```

3. **Check for Missing Dependencies**
   ```bash
   npm install
   ```

4. **Increase Node Memory (if out of memory)**
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   ```

---

### Backend Build Fails

**Symptoms:**
- TypeScript compilation errors
- `npm run build:backend` fails

**Solutions:**

1. **Fix TypeScript Errors**
   ```bash
   cd packages/backend
   npx tsc --noEmit
   ```

2. **Check for Missing Type Definitions**
   ```bash
   npm install --save-dev @types/node @types/jest
   ```

3. **Clear Build Output**
   ```bash
   rm -rf dist
   npm run build
   ```

---

## Runtime Errors

### "Port 3000 Already in Use"

**Solutions:**

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### Environment Variables Not Loading

**Symptoms:**
- `process.env.NEXT_PUBLIC_API_URL` is undefined
- Environment variables show as undefined

**Solutions:**

1. **Check File Names**
   - Frontend: `.env.local` (NOT `.env`)
   - Backend: `.env`

2. **Restart Development Server**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

3. **Verify Variable Names**
   - Frontend vars must start with `NEXT_PUBLIC_`
   - Backend vars have no prefix

4. **Check `.gitignore`**
   - Ensure `.env.local` is listed
   - Don't commit secrets to git

---

### "Cannot read property of undefined"

**Solutions:**

1. **Add Null Checks**
   ```typescript
   // Instead of:
   const name = player.name;
   
   // Use:
   const name = player?.name ?? 'Unknown';
   ```

2. **Check Data Loading**
   - Ensure data is loaded before rendering
   - Add loading states

3. **Check API Response**
   - Verify backend is returning expected data
   - Check browser Network tab

---

## Game Functionality Issues

### Dice Won't Roll

**Symptoms:**
- Roll button doesn't work
- No dice animation

**Solutions:**

1. **Verify It's Your Turn**
   - Only current player can roll
   - Check turn indicator

2. **Check WebSocket Connection**
   - Look for "Connected" status
   - Refresh page to reconnect

3. **Check Browser Console**
   - Look for JavaScript errors
   - Check for blocked events

4. **Clear Browser State**
   ```bash
   # Clear all site data
   Chrome: F12 → Application → Clear storage
   ```

---

### Challenges Not Appearing

**Symptoms:**
- Land on challenge tile but no modal appears
- Challenge modal stuck/frozen

**Solutions:**

1. **Wait for Synchronization**
   - May take 1-2 seconds
   - Check for slow network

2. **Refresh Browser**
   ```bash
   Ctrl+F5  # Hard refresh
   ```

3. **Check Backend Logs**
   - Look for challenge service errors
   - Verify challenges exist in database

4. **Clear Modal State**
   - Close and reopen player view
   - Rejoin the game

---

### Players Not Syncing

**Symptoms:**
- Different positions on different devices
- Missing players on board

**Solutions:**

1. **Ensure All Devices Connected**
   - Check each device shows "Connected"
   - Verify same room PIN

2. **Refresh Board Display**
   - Disconnect and reconnect board
   - Re-enter room PIN

3. **Check Network**
   - Ensure all devices on same network (ideally)
   - Check for network congestion

4. **Restart Game**
   - Have all players leave
   - Create new room

---

## Performance Problems

### Slow Page Load

**Solutions:**

1. **Check Network Speed**
   ```bash
   # Test connection
   curl -o /dev/null -w "Time: %{time_total}s\n" http://localhost:3001/health
   ```

2. **Clear Browser Cache**
   - Chrome: Ctrl+Shift+Delete

3. **Optimize Images**
   - Use WebP format
   - Compress large images

4. **Check Backend Performance**
   ```bash
   # Monitor backend logs for slow queries
   ```

---

### High Memory Usage

**Solutions:**

1. **Close Unused Tabs**
   - Browser consumes memory per tab

2. **Increase Node Memory (Development)**
   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm run dev
   ```

3. **Check for Memory Leaks**
   - Use Chrome DevTools → Memory tab
   - Take heap snapshots

---

### Laggy Animations

**Solutions:**

1. **Reduce Animation Complexity**
   - Disable non-essential animations
   - Use CSS instead of JavaScript

2. **Check GPU Acceleration**
   - Chrome: `chrome://gpu`
   - Ensure hardware acceleration enabled

3. **Update Browser**
   - Use latest version of Chrome/Firefox/Edge

---

## Database Issues

### Cannot Connect to Database

**Symptoms:**
- Backend errors mentioning database
- "ECONNREFUSED" errors

**Solutions:**

1. **Check Database is Running**
   ```bash
   # For local SQL Server
   docker ps | grep sqlserver
   ```

2. **Verify Connection String**
   ```bash
   # In packages/backend/.env
   DB_SERVER=localhost
   DB_DATABASE=alexdrikkelek
   DB_USER=sa
   DB_PASSWORD=YourPassword123
   ```

3. **Test Connection**
   ```bash
   # Using sqlcmd (if installed)
   sqlcmd -S localhost -U sa -P YourPassword123
   ```

4. **Check Firewall**
   - Ensure port 1433 is open
   - Check Azure SQL firewall rules (for cloud)

---

## Deployment Issues

### Azure Deployment Fails

**Solutions:**

1. **Check Build Logs**
   - Azure Portal → App Service → Deployment Center
   - Look for build errors

2. **Verify Environment Variables**
   - Azure Portal → Configuration → Application settings
   - Ensure all required vars are set

3. **Check Runtime Version**
   - Node.js version must match package.json engines

4. **Review Deployment Logs**
   ```bash
   az webapp log tail --name your-app-name --resource-group your-rg
   ```

---

### Static Web App Build Fails

**Solutions:**

1. **Check GitHub Actions**
   - Go to repository → Actions tab
   - Review failed workflow

2. **Verify Build Configuration**
   ```yaml
   # staticwebapp.config.json or workflow file
   app_location: "packages/frontend"
   output_location: ".next"
   ```

3. **Check Dependencies**
   - Ensure package-lock.json is committed
   - No missing dependencies

---

## Getting More Help

If you can't resolve your issue:

1. **Check Existing Issues**
   - [GitHub Issues](https://github.com/balburg/AlexDrikkelek/issues)
   - Search for similar problems

2. **Open a New Issue**
   - Provide detailed description
   - Include error messages
   - List steps to reproduce
   - Mention your environment (OS, Node version, etc.)

3. **Enable Debug Logging**
   ```bash
   # Backend
   LOG_LEVEL=debug npm run dev:backend
   
   # Check browser console for frontend
   ```

4. **Collect Diagnostic Info**
   ```bash
   node --version
   npm --version
   git --version
   
   # Include in issue report
   ```

---

## Related Documentation

- [Getting Started](./Getting-Started.md) - Setup instructions
- [Build and Run](./Build-and-Run.md) - Development guide
- [API Reference](./API-Reference.md) - API documentation
- [Deployment](./Deployment.md) - Deployment guide

---

**Last updated:** 17-11-2025
