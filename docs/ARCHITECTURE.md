# Project Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AlexDrikkelek System                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Client Devices                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐              ┌────────────────┐            │
│  │  Smartphones   │              │   TV/Big       │            │
│  │  & Tablets     │              │   Screen       │            │
│  │                │              │                │            │
│  │  Player UI     │              │  Board UI      │            │
│  │  (PWA)         │              │  (PWA/Cast)    │            │
│  └────────┬───────┘              └────────┬───────┘            │
│           │                               │                     │
│           └───────────────┬───────────────┘                     │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Internet      │
                   └────────┬────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      Azure Cloud                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Frontend (Static Web App)                  │   │
│  │  Next.js 16 + React 19 + Tailwind CSS + PWA           │   │
│  │  - Responsive UI for all devices                       │   │
│  │  - Service Worker for offline support                  │   │
│  │  - Socket.IO client for real-time updates             │   │
│  └────────────────┬───────────────────────────────────────┘   │
│                   │                                            │
│  ┌────────────────▼───────────────────────────────────────┐   │
│  │         Azure SignalR Service / Socket.IO             │   │
│  │         (Real-time Communication Hub)                  │   │
│  └────────────────┬───────────────────────────────────────┘   │
│                   │                                            │
│  ┌────────────────▼───────────────────────────────────────┐   │
│  │           Backend (App Service)                        │   │
│  │  Fastify + Socket.IO + TypeScript                     │   │
│  │  - REST API endpoints                                  │   │
│  │  - WebSocket connections                               │   │
│  │  - Game logic (server-authoritative)                  │   │
│  │  - Session management                                  │   │
│  └────┬──────┬──────┬──────┬──────────────────────────────┘   │
│       │      │      │      │                                   │
│  ┌────▼──┐ ┌─▼────┐ ┌─────▼──┐ ┌────────▼─────────┐         │
│  │ Azure │ │Redis │ │ Blob   │ │   Azure AD B2C   │         │
│  │  SQL  │ │Cache │ │Storage │ │  Authentication  │         │
│  │  DB   │ │      │ │        │ │                  │         │
│  │       │ │      │ │        │ │                  │         │
│  │-Rooms │ │-Sess │ │-Avatar │ │-OAuth 2.0        │         │
│  │-Users │ │-ions │ │-Assets │ │-Guest Login      │         │
│  │-Games │ │-Cache│ │-Images │ │-User Management  │         │
│  │-Chall.│ │-Pub/ │ │        │ │                  │         │
│  │       │ │ Sub  │ │        │ │                  │         │
│  └───────┘ └──────┘ └────────┘ └──────────────────┘         │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Azure Monitor + Application Insights           │   │
│  │         (Observability & Monitoring)                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
```
Next.js 16 (App Router)
├── React 19
├── TypeScript
├── Tailwind CSS 4
├── Socket.IO Client
├── next-pwa (Progressive Web App)
└── PWA Features
    ├── Service Worker
    ├── Offline Support
    └── Installable
```

### Backend
```
Node.js 20
├── Fastify 5 (REST API)
├── Socket.IO 4 (WebSockets)
├── TypeScript
├── ESM Modules
└── Features
    ├── Real-time Communication
    ├── Session Management
    ├── Game Logic
    └── API Endpoints
```

### Azure Services
```
Azure Cloud Platform
├── App Service (Backend Hosting)
├── Static Web Apps (Frontend Hosting)
├── SignalR Service (Real-time at Scale)
├── SQL Database (Structured Data)
├── Cache for Redis (Session & Pub/Sub)
├── Blob Storage (Assets)
├── AD B2C (Authentication)
├── Container Registry (Docker Images)
├── Monitor + App Insights (Observability)
└── DevOps Pipelines (CI/CD)
```

## Data Flow

### Game Session Flow
```
1. Player Authentication
   User → Azure AD B2C → Token → Backend

2. Room Creation/Join
   Player → Backend API → SQL Database
   Backend → Socket.IO → All Players (Room Update)

3. Game Start
   Backend → Generate Board (Procedural)
   Backend → Load Challenges (SQL)
   Backend → Distribute State (Socket.IO)

4. Turn Logic
   Player Action → Backend Validation
   Backend → Update Game State (Redis Cache)
   Backend → Broadcast Update (Socket.IO)
   All Players → Receive State Update

5. Challenge Execution
   Backend → Fetch Challenge (SQL)
   Backend → Send to Player (Socket.IO)
   Player → Submit Answer
   Backend → Validate & Update Score
   Backend → Broadcast Result

6. Game End
   Backend → Calculate Winners
   Backend → Save Stats (SQL)
   Backend → Broadcast Results
```

## Deployment Pipeline

```
Developer
    │
    ├─► Git Push to Main Branch
    │
    ▼
Azure DevOps Pipeline
    │
    ├─► Build Frontend (Next.js)
    ├─► Build Backend (TypeScript)
    ├─► Build Docker Images
    │
    ▼
Azure Container Registry
    │
    ├─► Store Frontend Image
    ├─► Store Backend Image
    │
    ▼
Azure Deployment
    │
    ├─► Deploy Frontend → Static Web App / App Service
    ├─► Deploy Backend → App Service
    │
    ▼
Production Environment
    │
    ├─► Frontend: HTTPS endpoint
    ├─► Backend: HTTPS API endpoint
    ├─► Database: Azure SQL
    ├─► Cache: Redis
    ├─► Storage: Blob Storage
    └─► Monitoring: Application Insights
```

## Security Architecture

```
Security Layers
│
├─► Authentication (Azure AD B2C)
│   ├─► OAuth 2.0
│   ├─► Guest Login
│   └─► Token Validation
│
├─► Authorization
│   ├─► JWT Tokens
│   ├─► Role-Based Access
│   └─► Session Validation
│
├─► Data Protection
│   ├─► HTTPS/TLS Encryption
│   ├─► Environment Variables
│   └─► Secrets in Azure Key Vault
│
├─► Server-Authoritative Logic
│   ├─► All Game Actions Validated
│   ├─► Anti-Cheat Mechanisms
│   └─► State Validation
│
└─► Compliance
    ├─► GDPR Compliant
    ├─► Data Encryption
    └─► Audit Logging
```

## Development Workflow

```
Local Development
│
├─► Option 1: npm run dev
│   ├─► Backend on localhost:3001
│   └─► Frontend on localhost:3000
│
├─► Option 2: docker-compose up
│   ├─► Containerized Backend
│   └─► Containerized Frontend
│
└─► Hot Reload Enabled for Both
```

## Scalability Strategy

```
Scalability Tiers
│
├─► Basic Tier (Development/Testing)
│   ├─► Single App Service Instance
│   ├─► Basic SQL Tier
│   └─► Basic Redis Cache
│
├─► Standard Tier (Production)
│   ├─► Multiple App Service Instances
│   ├─► Auto-scaling Enabled
│   ├─► Standard SQL Tier
│   └─► Standard Redis Cache
│
└─► Premium Tier (High Traffic)
    ├─► Azure Kubernetes Service (AKS)
    ├─► Premium SQL with Replicas
    ├─► Premium Redis with Clustering
    └─► Azure SignalR Service (Serverless)
```

## Monitoring & Observability

```
Application Insights
│
├─► Performance Metrics
│   ├─► Response Times
│   ├─► Request Rates
│   └─► Error Rates
│
├─► User Analytics
│   ├─► Active Sessions
│   ├─► User Flows
│   └─► Feature Usage
│
├─► Custom Events
│   ├─► Game Started
│   ├─► Turn Completed
│   ├─► Challenge Answered
│   └─► Game Completed
│
└─► Alerts
    ├─► Performance Degradation
    ├─► Error Spikes
    └─► Service Availability
```

## PWA Features

```
Progressive Web App
│
├─► Installable
│   ├─► Add to Home Screen
│   ├─► Standalone Mode
│   └─► App-like Experience
│
├─► Offline Support
│   ├─► Service Worker
│   ├─► Cache Strategy
│   └─► Offline Fallback
│
├─► Responsive
│   ├─► Mobile First
│   ├─► Tablet Optimized
│   └─► Desktop Compatible
│
└─► Performance
    ├─► Fast Loading
    ├─► Optimized Assets
    └─── Lazy Loading
```
