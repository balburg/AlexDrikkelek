# Azure Infrastructure Setup

This document describes the Azure resources needed for the AlexDrikkelek application.

## Resource Groups

Create a resource group for the application:

```bash
az group create --name rg-alexdrikkelek --location westeurope
```

## App Services

### Backend App Service

```bash
az appservice plan create \
  --name asp-alexdrikkelek-backend \
  --resource-group rg-alexdrikkelek \
  --sku B1 \
  --is-linux

az webapp create \
  --name alexdrikkelek-backend \
  --resource-group rg-alexdrikkelek \
  --plan asp-alexdrikkelek-backend \
  --deployment-container-image-name alexdrikkelek.azurecr.io/alexdrikkelek-backend:latest
```

### Frontend App Service / Static Web App

```bash
# Option 1: App Service
az appservice plan create \
  --name asp-alexdrikkelek-frontend \
  --resource-group rg-alexdrikkelek \
  --sku B1 \
  --is-linux

az webapp create \
  --name alexdrikkelek-frontend \
  --resource-group rg-alexdrikkelek \
  --plan asp-alexdrikkelek-frontend \
  --deployment-container-image-name alexdrikkelek.azurecr.io/alexdrikkelek-frontend:latest

# Option 2: Static Web App (recommended for frontend)
az staticwebapp create \
  --name alexdrikkelek-frontend \
  --resource-group rg-alexdrikkelek \
  --location westeurope
```

## Azure SQL Database

```bash
az sql server create \
  --name alexdrikkelek-sql \
  --resource-group rg-alexdrikkelek \
  --location westeurope \
  --admin-user sqladmin \
  --admin-password <strong-password>

az sql db create \
  --resource-group rg-alexdrikkelek \
  --server alexdrikkelek-sql \
  --name alexdrikkelek-db \
  --edition GeneralPurpose \
  --compute-model Serverless \
  --family Gen5 \
  --capacity 2
```

## Azure Cache for Redis

```bash
az redis create \
  --name alexdrikkelek-redis \
  --resource-group rg-alexdrikkelek \
  --location westeurope \
  --sku Basic \
  --vm-size c0
```

## Azure SignalR Service

```bash
az signalr create \
  --name alexdrikkelek-signalr \
  --resource-group rg-alexdrikkelek \
  --location westeurope \
  --sku Free_F1 \
  --service-mode Default
```

## Azure Blob Storage

```bash
az storage account create \
  --name alexdrikkelekstorage \
  --resource-group rg-alexdrikkelek \
  --location westeurope \
  --sku Standard_LRS \
  --kind StorageV2

az storage container create \
  --name assets \
  --account-name alexdrikkelekstorage \
  --public-access blob
```

## Azure Container Registry

```bash
az acr create \
  --name alexdrikkelek \
  --resource-group rg-alexdrikkelek \
  --sku Basic \
  --admin-enabled true
```

## Azure AD B2C

1. Create an Azure AD B2C tenant through the portal
2. Register the application
3. Create user flows for sign-up/sign-in
4. Configure OAuth2 settings

## Azure Monitor & Application Insights

```bash
az monitor app-insights component create \
  --app alexdrikkelek-insights \
  --location westeurope \
  --resource-group rg-alexdrikkelek \
  --application-type web
```

## Environment Variables

After creating resources, update the backend `.env` file with connection strings and keys:

- Database connection string from Azure SQL
- Redis connection string from Azure Cache
- Storage connection string from Blob Storage
- SignalR connection string
- Application Insights instrumentation key
- Azure AD B2C configuration

## Cost Optimization

- Use serverless/consumption-based tiers for development
- Scale up for production based on usage
- Use Azure Cost Management to monitor expenses
- Consider reserved instances for predictable workloads
