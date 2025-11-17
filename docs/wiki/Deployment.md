# Deployment Guide

Complete guide for deploying AlexDrikkelek to Azure cloud services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Azure Resources Setup](#azure-resources-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Environment Configuration](#environment-configuration)
8. [Post-Deployment](#post-deployment)
9. [Monitoring](#monitoring)

## Prerequisites

Before deploying, ensure you have:

- **Azure Account** with active subscription
- **Azure CLI** installed and configured
- **Node.js** 18+ and npm installed
- **Docker** (for containerized deployment)
- **Git** repository access
- **Azure DevOps** account (for CI/CD)

### Install Azure CLI

```bash
# Windows (via Chocolatey)
choco install azure-cli

# Mac
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Login to Azure

```bash
az login
az account set --subscription "Your Subscription Name"
```

## Azure Resources Setup

### 1. Create Resource Group

```bash
az group create \
  --name alexdrikkelek-rg \
  --location westeurope
```

**Resource Group Naming:**
- Development: `alexdrikkelek-dev-rg`
- Staging: `alexdrikkelek-staging-rg`
- Production: `alexdrikkelek-prod-rg`

---

### 2. Azure SQL Database

**Create SQL Server:**
```bash
az sql server create \
  --name alexdrikkelek-sql \
  --resource-group alexdrikkelek-rg \
  --location westeurope \
  --admin-user sqladmin \
  --admin-password <StrongPassword123!>
```

**Create Database:**
```bash
az sql db create \
  --resource-group alexdrikkelek-rg \
  --server alexdrikkelek-sql \
  --name alexdrikkelek \
  --service-objective S0 \
  --backup-storage-redundancy Local
```

**Configure Firewall:**
```bash
# Allow Azure services
az sql server firewall-rule create \
  --resource-group alexdrikkelek-rg \
  --server alexdrikkelek-sql \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (for management)
az sql server firewall-rule create \
  --resource-group alexdrikkelek-rg \
  --server alexdrikkelek-sql \
  --name AllowMyIP \
  --start-ip-address <Your-IP> \
  --end-ip-address <Your-IP>
```

**Connection String:**
```
Server=tcp:alexdrikkelek-sql.database.windows.net,1433;
Initial Catalog=alexdrikkelek;
Persist Security Info=False;
User ID=sqladmin;
Password=<password>;
MultipleActiveResultSets=False;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

---

### 3. Azure Blob Storage

**Create Storage Account:**
```bash
az storage account create \
  --name alexdrikkeleksa \
  --resource-group alexdrikkelek-rg \
  --location westeurope \
  --sku Standard_LRS \
  --kind StorageV2
```

**Create Containers:**
```bash
# Get connection string
CONNECTION_STRING=$(az storage account show-connection-string \
  --name alexdrikkeleksa \
  --resource-group alexdrikkelek-rg \
  --output tsv)

# Create containers
az storage container create \
  --name avatars \
  --account-name alexdrikkeleksa \
  --public-access blob

az storage container create \
  --name game-assets \
  --account-name alexdrikkeleksa \
  --public-access blob
```

---

### 4. Azure App Service (Backend)

**Create App Service Plan:**
```bash
az appservice plan create \
  --name alexdrikkelek-plan \
  --resource-group alexdrikkelek-rg \
  --sku B1 \
  --is-linux
```

**Create Web App:**
```bash
az webapp create \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --plan alexdrikkelek-plan \
  --runtime "NODE:18-lts"
```

**Enable WebSockets and ARR Affinity:**
```bash
az webapp config set \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --web-sockets-enabled true

# Enable ARR affinity (sticky sessions) - REQUIRED for in-memory storage
az webapp config set \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --generic-configurations '{"ARRAffinity":"true"}'
```

**Important:** ARR affinity (sticky sessions) must be enabled to ensure all WebSocket connections for a room stay on the same backend instance when using in-memory storage.

---

### 5. Azure Static Web Apps (Frontend)

**Create Static Web App:**
```bash
az staticwebapp create \
  --name alexdrikkelek-frontend \
  --resource-group alexdrikkelek-rg \
  --source https://github.com/balburg/AlexDrikkelek \
  --location westeurope \
  --branch main \
  --app-location "packages/frontend" \
  --output-location ".next" \
  --login-with-github
```

**Get Deployment Token:**
```bash
az staticwebapp secrets list \
  --name alexdrikkelek-frontend \
  --resource-group alexdrikkelek-rg
```

---

### 6. Anonymous Access

**The game operates with anonymous access - no authentication required.**

Players join with just a name and avatar. This simplifies the user experience and reduces infrastructure complexity.

**Session Management:**
- Sessions are stored in in-memory storage with automatic expiry
- Session IDs are saved in browser localStorage
- Reconnection is automatic using the stored session ID

**Production Considerations:**
- For admin panel access, implement IP whitelisting or VPN at the infrastructure level
- Consider rate limiting to prevent abuse
- Monitor for unusual activity patterns

---

### 7. Application Insights

```bash
az monitor app-insights component create \
  --app alexdrikkelek-insights \
  --location westeurope \
  --resource-group alexdrikkelek-rg \
  --application-type web
```

**Get Instrumentation Key:**
```bash
az monitor app-insights component show \
  --app alexdrikkelek-insights \
  --resource-group alexdrikkelek-rg \
  --query instrumentationKey
```

---

## Database Setup

### Initialize Schema

1. **Connect to Azure SQL:**
   ```bash
   sqlcmd -S alexdrikkelek-sql.database.windows.net \
     -d alexdrikkelek \
     -U sqladmin \
     -P <password>
   ```

2. **Run Schema Script:**
   ```sql
   -- Upload database/schema.sql to Azure
   -- Execute via Azure Portal or sqlcmd
   :r schema.sql
   GO
   ```

3. **Verify Tables:**
   ```sql
   SELECT TABLE_NAME 
   FROM INFORMATION_SCHEMA.TABLES 
   WHERE TABLE_TYPE = 'BASE TABLE';
   ```

### Seed Initial Data (Optional)

```sql
-- Insert sample challenges
INSERT INTO Challenges (type, category, question, age_rating, difficulty)
VALUES 
  ('trivia', 'General', 'What is 2+2?', 'kids', 1),
  ('action', 'Physical', 'Do 5 jumping jacks', 'kids', 2);
```

---

## Backend Deployment

### Option 1: Deploy via Azure CLI

```bash
cd packages/backend

# Build
npm run build

# Create deployment package
zip -r deploy.zip dist package.json package-lock.json

# Deploy
az webapp deployment source config-zip \
  --resource-group alexdrikkelek-rg \
  --name alexdrikkelek-backend \
  --src deploy.zip
```

### Option 2: Deploy via Docker

**Build Docker Image:**
```bash
docker build -f packages/backend/Dockerfile -t alexdrikkelek-backend:latest .
```

**Push to Azure Container Registry:**
```bash
# Create ACR
az acr create \
  --resource-group alexdrikkelek-rg \
  --name alexdrikkelekacr \
  --sku Basic

# Login
az acr login --name alexdrikkelekacr

# Tag and push
docker tag alexdrikkelek-backend:latest \
  alexdrikkelekacr.azurecr.io/backend:latest
docker push alexdrikkelekacr.azurecr.io/backend:latest
```

**Deploy to App Service:**
```bash
az webapp config container set \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --docker-custom-image-name alexdrikkelekacr.azurecr.io/backend:latest \
  --docker-registry-server-url https://alexdrikkelekacr.azurecr.io
```

---

## Frontend Deployment

### Automatic Deployment (GitHub Actions)

Azure Static Web Apps automatically deploys when you push to the configured branch.

**Verify GitHub Action:**
1. Go to repository → Actions tab
2. Look for "Azure Static Web Apps CI/CD"
3. Check latest run status

### Manual Deployment

```bash
cd packages/frontend

# Build
npm run build

# Deploy using Static Web Apps CLI
npx @azure/static-web-apps-cli deploy \
  --app-location . \
  --output-location .next \
  --deployment-token <your-token>
```

---

## CI/CD Pipeline

### Azure DevOps Pipeline

The project includes `azure-pipelines.yml` for automated deployments.

**Setup Steps:**

1. **Create Azure DevOps Project:**
   - Go to https://dev.azure.com
   - Create new project: "AlexDrikkelek"

2. **Connect to GitHub:**
   - Project Settings → Service connections
   - New service connection → GitHub
   - Authorize Azure DevOps

3. **Create Service Connection to Azure:**
   - Service connections → New → Azure Resource Manager
   - Select subscription and resource group

4. **Create Pipeline:**
   - Pipelines → New pipeline
   - Select GitHub repository
   - Select existing `azure-pipelines.yml`
   - Run pipeline

5. **Add Pipeline Variables:**
   ```
   AZURE_STATIC_WEB_APPS_API_TOKEN: <from Static Web Apps>
   DB_PASSWORD: <database password>
   REDIS_PASSWORD: <redis access key>
   ```

### GitHub Actions (Alternative)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:backend
      - uses: azure/webapps-deploy@v2
        with:
          app-name: alexdrikkelek-backend
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: packages/backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:frontend
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "packages/frontend"
          output_location: ".next"
```

---

## Environment Configuration

### Backend Environment Variables

Set via Azure Portal or CLI:

```bash
az webapp config appsettings set \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    LOG_LEVEL=info \
    CORS_ORIGIN=https://yourfrontend.azurestaticapps.net \
    DB_SERVER=alexdrikkelek-sql.database.windows.net \
    DB_DATABASE=alexdrikkelek \
    DB_USER=sqladmin \
    DB_PASSWORD=<password> \
    DB_ENCRYPT=true \
    AZURE_STORAGE_CONNECTION_STRING=<connection-string> \
    APPINSIGHTS_INSTRUMENTATIONKEY=<insights-key>
```

**Note:** Redis environment variables are not needed as the backend uses in-memory storage.

### Frontend Environment Variables

Set via Azure Portal → Static Web App → Configuration:

```
NEXT_PUBLIC_API_URL=https://alexdrikkelek-backend.azurewebsites.net
NEXT_PUBLIC_SOCKET_URL=https://alexdrikkelek-backend.azurewebsites.net
NEXT_PUBLIC_ENABLE_CHROMECAST=true
NEXT_PUBLIC_MAX_PLAYERS=10
```

**Note:** Azure AD B2C environment variables are not needed as the application uses anonymous access.

---

## Post-Deployment

### 1. Verify Health Endpoints

```bash
# Backend
curl https://alexdrikkelek-backend.azurewebsites.net/health

# Frontend
curl https://alexdrikkelek-frontend.azurestaticapps.net
```

### 2. Test Functionality

1. Open frontend URL in browser
2. Create a game room
3. Join from another device
4. Test dice rolling and challenges

### 3. Configure Custom Domain (Optional)

**Backend:**
```bash
az webapp config hostname add \
  --webapp-name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --hostname api.yourdomain.com
```

**Frontend:**
```bash
az staticwebapp hostname set \
  --name alexdrikkelek-frontend \
  --resource-group alexdrikkelek-rg \
  --hostname www.yourdomain.com
```

### 4. Enable SSL/TLS

- Azure automatically provides SSL certificates
- For custom domains, add SSL binding

### 5. Configure CDN (Optional)

```bash
az cdn profile create \
  --name alexdrikkelek-cdn \
  --resource-group alexdrikkelek-rg \
  --sku Standard_Microsoft
```

---

## Monitoring

### Application Insights

**View Metrics:**
- Azure Portal → Application Insights
- Check: Requests, Response Time, Failures

**Set Up Alerts:**
```bash
az monitor metrics alert create \
  --name high-response-time \
  --resource-group alexdrikkelek-rg \
  --scopes /subscriptions/<sub-id>/resourceGroups/alexdrikkelek-rg/providers/Microsoft.Insights/components/alexdrikkelek-insights \
  --condition "avg requests/duration > 1000" \
  --description "Alert when average response time exceeds 1 second"
```

### View Logs

**Backend Logs:**
```bash
az webapp log tail \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg
```

**Download Logs:**
```bash
az webapp log download \
  --name alexdrikkelek-backend \
  --resource-group alexdrikkelek-rg \
  --log-file logs.zip
```

### Monitor Costs

```bash
az consumption usage list \
  --start-date 2024-01-01 \
  --end-date 2024-01-31
```

---

## Scaling

### Auto-Scale Backend

```bash
az monitor autoscale create \
  --resource-group alexdrikkelek-rg \
  --resource alexdrikkelek-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-plan \
  --min-count 1 \
  --max-count 5 \
  --count 1

# Add CPU-based rule
az monitor autoscale rule create \
  --resource-group alexdrikkelek-rg \
  --autoscale-name autoscale-plan \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1
```

---

## Backup and Disaster Recovery

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

### Automated Backups

Azure SQL automatically backs up databases. Configure retention:

```bash
az sql db ltr-policy set \
  --resource-group alexdrikkelek-rg \
  --server alexdrikkelek-sql \
  --name alexdrikkelek \
  --weekly-retention P4W \
  --monthly-retention P12M
```

---

## Security Checklist

- [ ] Enable HTTPS only on all services
- [ ] Configure firewall rules (minimal access)
- [ ] Rotate access keys regularly
- [ ] Verify anonymous access is working properly
- [ ] Set up IP whitelisting for admin panel (recommended)
- [ ] Set up private endpoints (for production)
- [ ] Enable threat detection
- [ ] Configure CORS properly
- [ ] Enable Application Insights
- [ ] Set up alerts for anomalies
- [ ] Review and audit access logs

---

## Related Documentation

- [Build and Run](./Build-and-Run.md) - Local development
- [Troubleshooting](./Troubleshooting.md) - Common issues
- [Architecture](./Architecture.md) - System design

---

**Last updated:** 17-11-2025
