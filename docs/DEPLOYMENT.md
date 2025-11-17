# Deployment Guide

## Prerequisites

Before deploying AlexDrikkelek, ensure you have:

1. Azure account with active subscription
2. Azure CLI installed and configured
3. Node.js 18+ and npm installed
4. Docker (for containerized deployment)

## Azure Resources Setup

### 1. Resource Group

```bash
az group create \
  --name alexdrikkelek-rg \
  --location westeurope
```

### 2. Azure SQL Database

```bash
# Create SQL Server
az sql server create \
  --name alexdrikkelek-sql \
  --resource-group alexdrikkelek-rg \
  --location westeurope \
  --admin-user sqladmin \
  --admin-password <YourPassword>

# Create Database
az sql db create \
  --resource-group alexdrikkelek-rg \
  --server alexdrikkelek-sql \
  --name alexdrikkelek \
  --service-objective S0

# Configure firewall
az sql server firewall-rule create \
  --resource-group alexdrikkelek-rg \
  --server alexdrikkelek-sql \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 3. Azure Blob Storage

```bash
# Create storage account
az storage account create \
  --name alexdrikkeleksa \
  --resource-group alexdrikkelek-rg \
  --location westeurope \
  --sku Standard_LRS

# Create container for avatars
az storage container create \
  --name avatars \
  --account-name alexdrikkeleksa \
  --public-access blob
```

### 4. Azure App Service (Backend)

```bash
# Create App Service Plan
az appservice plan create \
  --name alexdrikkelek-plan \
  --resource-group alexdrikkelek-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --plan alexdrikkelek-plan \
  --runtime "NODE|18-lts"

# CRITICAL: Enable ARR Affinity (Sticky Sessions) for single-instance in-memory state
az webapp update \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --client-affinity-enabled true

# Set instance count to 1 (required for in-memory state)
az appservice plan update \
  --name alexdrikkelek-plan \
  --resource-group alexdrikkelek-rg \
  --number-of-workers 1

# Configure app settings
az webapp config appsettings set \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_SERVER=alexdrikkelek-sql.database.windows.net \
    DB_DATABASE=alexdrikkelek
```

**Important Notes:**
- ARR affinity is **required** because the backend stores game state in-memory
- Running multiple instances will cause issues - keep at 1 instance
- For more details, see the "Single-Instance Architecture" section below

### 5. Azure Static Web Apps (Frontend)

```bash
az staticwebapp create \
  --name alexdrikkelek-frontend \
  --resource-group alexdrikkelek-rg \
  --source https://github.com/balburg/AlexDrikkelek \
  --location westeurope \
  --branch main \
  --app-location "packages/frontend" \
  --output-location ".next"
```

### 6. Application Insights

**Note:** Authentication is intentionally disabled. The game operates anonymously - players join with just a name and avatar.

```bash
az monitor app-insights component create \
  --app alexdrikkelek-insights \
  --location westeurope \
  --resource-group alexdrikkelek-rg \
  --application-type web
```

## Database Initialization

```bash
# Connect to Azure SQL Database
sqlcmd -S alexdrikkelek-sql.database.windows.net \
  -d alexdrikkelek \
  -U sqladmin \
  -P <YourPassword>

# Run schema script
:r database/schema.sql
GO
```

## CI/CD Setup with Azure DevOps

### 1. Create Azure DevOps Project

1. Go to https://dev.azure.com
2. Create new project: "AlexDrikkelek"
3. Connect to GitHub repository

### 2. Create Service Connection

1. Project Settings → Service connections
2. New service connection → Azure Resource Manager
3. Authenticate and select subscription
4. Name: "Azure Service Connection"

### 3. Configure Pipeline

The `azure-pipelines.yml` file is already configured. Just:

1. Pipelines → New pipeline
2. Select GitHub repository
3. Select existing `azure-pipelines.yml`
4. Run pipeline

### 4. Add Pipeline Variables

In Azure DevOps pipeline:

```
AZURE_STATIC_WEB_APPS_API_TOKEN: <from Static Web Apps>
DB_PASSWORD: <your-db-password>
```

## Environment Variables

### Backend (.env)

```bash
NODE_ENV=production
PORT=8080
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://alexdrikkelek-frontend.azurestaticapps.net

# Database
DB_SERVER=alexdrikkelek-sql.database.windows.net
DB_DATABASE=alexdrikkelek
DB_USER=sqladmin
DB_PASSWORD=<password>
DB_ENCRYPT=true

# Storage
AZURE_STORAGE_CONNECTION_STRING=<connection-string>
AZURE_STORAGE_CONTAINER=avatars

# Note: Redis variables removed - backend now uses in-memory state
# Ensure ARR affinity is enabled on App Service for sticky sessions
```

### Frontend (.env.production)

```bash
NEXT_PUBLIC_API_URL=https://alexdrikkelek-backend.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://alexdrikkelek-backend.azurewebsites.net

NEXT_PUBLIC_ENABLE_CHROMECAST=true
NEXT_PUBLIC_MAX_PLAYERS=10
NEXT_PUBLIC_MIN_PLAYERS=2
```

## Manual Deployment

### Backend

```bash
cd packages/backend

# Build
npm run build

# Deploy to Azure App Service
az webapp deployment source config-zip \
  --resource-group alexdrikkelek-rg \
  --name alexdrikkelek-backend \
  --src dist.zip
```

### Frontend

```bash
cd packages/frontend

# Build
npm run build

# Deploy (handled by Static Web Apps GitHub Action)
```

## Docker Deployment

### Build Images

```bash
# Backend
docker build -f packages/backend/Dockerfile -t alexdrikkelek-backend:latest .

# Frontend
docker build -f packages/frontend/Dockerfile -t alexdrikkelek-frontend:latest .
```

### Push to Azure Container Registry

```bash
# Create ACR
az acr create \
  --resource-group alexdrikkelek-rg \
  --name alexdrikkelekacr \
  --sku Basic

# Login
az acr login --name alexdrikkelekacr

# Tag and push
docker tag alexdrikkelek-backend:latest alexdrikkelekacr.azurecr.io/backend:latest
docker push alexdrikkelekacr.azurecr.io/backend:latest

docker tag alexdrikkelek-frontend:latest alexdrikkelekacr.azurecr.io/frontend:latest
docker push alexdrikkelekacr.azurecr.io/frontend:latest
```

## Post-Deployment

### 1. Verify Health

```bash
# Backend health
curl https://alexdrikkelek-backend.azurewebsites.net/health

# Frontend
curl https://alexdrikkelek-frontend.azurestaticapps.net
```

### 2. Monitor Logs

```bash
# Backend logs
az webapp log tail \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg

# View Application Insights
az portal show --query url --output tsv
```

### 3. Configure Custom Domain (Optional)

```bash
# Map custom domain
az webapp config hostname add \
  --webapp-name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --hostname api.yourdomain.com
```

## Troubleshooting

### Backend won't start
- Check environment variables are set
- Verify database connection string
- Check Application Insights logs

### Frontend can't connect to backend
- Verify CORS settings
- Check API URL in frontend env
- Verify network security groups

### Database connection errors
- Check firewall rules
- Verify credentials
- Check connection string format

## Single-Instance Architecture

### Overview

The backend uses **in-memory state management** instead of Redis, simplifying the infrastructure. This works well for:
- Development and staging environments
- Events and parties with 2-10 players per room
- Modest traffic levels (up to ~500 concurrent players on appropriate hardware)

### Critical Configuration

**ARR Affinity (Sticky Sessions) is REQUIRED:**

```bash
# Enable via CLI
az webapp update \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --client-affinity-enabled true

# Or via Portal: Configuration → General settings → ARR affinity → On
```

**Why?** Game rooms are stored in server memory. Without sticky sessions, WebSocket connections may route to different instances that don't have the room data, causing "Room not found" errors.

### Instance Count

**Must run exactly 1 instance:**

```bash
az appservice plan update \
  --name alexdrikkelek-plan \
  --resource-group alexdrikkelek-rg \
  --number-of-workers 1
```

Running multiple instances without state synchronization will cause data inconsistency.

### Monitoring Active Rooms

Use the `/health` endpoint to monitor server state:

```bash
curl https://alexdrikkelek-backend.azurewebsites.net/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T09:41:48.141Z",
  "stats": {
    "totalRooms": 5,
    "activeRooms": 3,
    "totalPlayers": 12,
    "connectedPlayers": 10
  }
}
```

Set up Application Insights alerts for:
- `totalRooms > 100` (may indicate memory pressure)
- `connectedPlayers < 0.5 * totalPlayers` (connection issues)

### Deployment Considerations

**During deployments:**
1. All active game rooms will be lost (they're in memory)
2. Deploy during low-traffic periods
3. Communicate scheduled maintenance to users
4. Consider implementing a "maintenance mode" message

**Session expiry:**
- Rooms automatically expire after 4 hours of inactivity
- Players can reconnect within 60 seconds of disconnect

### Future Scaling Options

If you need to scale beyond a single instance:

1. **Re-add Redis or Azure SignalR** for distributed state
2. **Room-based sharding** - route specific room codes to specific instances
3. **Persist to SQL more frequently** - reconstruct state from database

For current use case (parties/events), single instance is sufficient and simplifies operations.

## Scaling

**Note:** With in-memory state, auto-scaling is NOT recommended. Keep at 1 instance.

### Vertical Scaling (Recommended)

Increase the App Service Plan SKU for better performance:

```bash
# Upgrade to Standard S1 for more resources
az appservice plan update \
  --name alexdrikkelek-plan \
  --resource-group alexdrikkelek-rg \
  --sku S1
```

Recommended SKUs:
- **B1**: Up to ~50 concurrent players (development)
- **S1**: Up to ~200 concurrent players (small events)
- **P1v2**: Up to ~500 concurrent players (large events)

### Horizontal Scaling (Not Recommended)

Do NOT use auto-scaling unless you implement distributed state management:

```bash
# DON'T DO THIS without implementing Redis/SignalR first!
# az monitor autoscale create ...
```

## Monitoring

- Azure Monitor: Resource metrics
- Application Insights: Request tracking
- Log Analytics: Centralized logging
- Alerts: Set up for critical metrics

## Backup

### Database Backup

```bash
az sql db export \
  --resource-group alexdrikkelek-rg \
  --server alexdrikkelek-sql \
  --name alexdrikkelek \
  --admin-user sqladmin \
  --admin-password <password> \
  --storage-key-type StorageAccessKey \
  --storage-key <storage-key> \
  --storage-uri https://alexdrikkeleksa.blob.core.windows.net/backups/db.bacpac
```

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Configure firewall rules
- [ ] Verify anonymous access is working (no authentication required)
- [ ] Set up CORS properly
- [ ] Enable Application Insights
- [ ] Configure backup policies
- [ ] Review access keys regularly
- [ ] Enable threat detection
- [ ] Set up alerts for anomalies
