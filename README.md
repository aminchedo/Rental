# Persian Chat Application — CPU Fine-tuned LLM with TypeScript Backend

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](https://github.com/your-repo/actions) [![License](https://img.shields.io/badge/License-MIT-blue)](#license) [![Node](https://img.shields.io/badge/Node-20.x-green)](https://nodejs.org/)

A production-grade Persian conversational AI pipeline featuring CPU-based model fine-tuning, TypeScript-only backend, and modern React frontend with RTL support.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [System Requirements](#system-requirements)
- [Datasets](#datasets)
- [Google Data Integration](#google-data-integration)
- [Quickstart](#quickstart)
- [Environment Variables](#environment-variables)
- [Commands & Scripts](#commands--scripts)
- [Backend API](#backend-api)
- [Frontend](#frontend)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Traceability & Reports](#traceability--reports)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contributing](#contributing)

---

## Overview

This project implements a complete Persian GPT-style chat application with:

- **Real Persian Datasets**: Hugging Face datasets (ParsBERT, PersianMind) + optional Google data
- **CPU-Based Training**: Fine-tuning Persian language models on CPU-only infrastructure
- **TypeScript Backend**: Express.js API with streaming support, Zod validation, strict typing
- **React Frontend**: RTL-enabled chat UI with dark mode, accessibility, and UX enhancements
- **Strict CI Enforcement**: Hard gates for code quality, no Python outside archive, TypeScript-only backend
- **Production Deployment**: Nginx reverse proxy, PM2 process management, Let's Encrypt HTTPS

### Phase P Migration Complete ✅

All Python scripts have been migrated to TypeScript equivalents. Backend is **100% TypeScript** with Python isolated to ML training only (called via child processes).

---

## Architecture

### 8-Step Pipeline + Phase P Migration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PERSIAN CHAT PIPELINE                            │
└─────────────────────────────────────────────────────────────────────────┘

Step 1: Dataset Preparation (TypeScript)
  ├─ fetch_hf_datasets.ts → Download from Hugging Face
  ├─ fetch_google_data.ts → Optional Google data ingestion
  ├─ prepare_conversational_merge.ts → Merge & normalize
  └─ Outputs: datasets/train.jsonl, test.jsonl, combined.jsonl

Step 2: Model Fine-tuning (CPU)
  ├─ train_cpu.ts → TypeScript wrapper for PyTorch training
  ├─ Base: GPT-2 or gpt2-fa (Persian-specific)
  └─ Outputs: models/persian-chat/

Step 3: Evaluation (CPU)
  ├─ eval_cpu.ts → TypeScript evaluation script
  └─ Outputs: logs/eval_full.json, eval_samples.jsonl

Step 4: Backend API (TypeScript-only)
  ├─ Express.js + Zod validation
  ├─ /api/chat endpoint with streaming
  └─ Port 3001 (proxied via Nginx)

Steps 5-7: Frontend (React + Vite)
  ├─ RTL chat UI, dark/light mode
  ├─ Typing indicators, auto-scroll
  ├─ Settings panel, localStorage persistence
  └─ Port 3000 (served via Nginx)

Step 8: Deployment (VPS)
  ├─ Nginx reverse proxy (HTTPS)
  ├─ PM2 process manager
  └─ Let's Encrypt SSL

Phase P: Python → TypeScript Migration
  ├─ All scripts migrated to .ts
  ├─ Python archived to archive/python/
  └─ CI enforces TypeScript-only backend
```

### Component Architecture

- **Datasets**: Real Persian conversational data from Hugging Face + Google APIs
- **Training**: CPU-based fine-tuning with PyTorch (called from TypeScript wrappers)
- **Backend**: TypeScript Express API with strict typing, Zod validation, streaming responses
- **Frontend**: React + Vite with RTL, accessibility, dark mode, keyboard shortcuts
- **Settings**: Dynamic API configuration, localStorage persistence
- **Deployment**: Nginx + PM2 + Let's Encrypt on CPU-only VPS

---

## System Requirements

### Minimum VPS Specifications

- **OS**: Ubuntu 20.04+ (or similar Linux distribution)
- **CPU**: ≥ 4 vCPUs (CPU-only training and inference)
- **RAM**: ≥ 8 GB
- **Storage**: ≥ 20 GB free space
- **Network**: Public IP + domain name (for HTTPS)

### Required Software

- **Node.js**: 20.x (LTS)
- **npm**: Latest
- **Python**: 3.10+ (for PyTorch training only)
- **Optional for Production**:
  - Nginx 1.18+
  - PM2 (process manager)
  - Certbot (Let's Encrypt SSL)

### Development Requirements

- TypeScript 5.x
- ts-node for script execution
- Git for version control

---

## Datasets

All datasets are **real**, publicly available from Hugging Face, with direct URLs and checksums for verification.

### Primary Sources (Hugging Face)

#### 1. ParsBERT-Fa-Sentiment-Twitter
- **URL**: https://huggingface.co/datasets/ParsBERT-Fa-Sentiment-Twitter
- **Type**: Persian sentiment analysis dataset from Twitter
- **Usage**: Training sentiment-aware conversational responses
- **Format**: Converted to JSONL with `messages[{role, content}]` schema

#### 2. PersianMind-v1.0
- **URL**: https://huggingface.co/datasets/PersianMind-v1.0
- **Type**: General Persian text dataset
- **Usage**: Training general conversational capabilities
- **Format**: Converted to JSONL with `messages[{role, content}]` schema

#### 3. Hamshahri (Optional)
- **URL**: https://huggingface.co/datasets/hooshvarelab/hamshahri
- **Type**: Persian news articles dataset
- **Usage**: Domain-specific Persian text understanding
- **Enable**: Set `HAMSHAHRI_ENABLED=true` in environment
- **Note**: Larger dataset, longer download times

### Dataset Schema

All datasets are converted to conversational JSONL format:

```jsonl
{
  "messages": [
    {"role": "system", "content": "شما یک دستیار هوشمند فارسی‌زبان هستید."},
    {"role": "user", "content": "سلام"},
    {"role": "assistant", "content": "سلام! چطور می‌توانم کمکتان کنم؟"}
  ]
}
```

### Preprocessing Steps

1. **Download**: Real datasets fetched from Hugging Face using `datasets` library
2. **Normalization**: Arabic characters/digits → Persian equivalents
3. **Deduplication**: Content-based hashing to remove duplicates
4. **Conversion**: Transform to conversational JSONL format
5. **Checksums**: SHA256 checksums for each dataset file
6. **Merge**: Combine with Google data (if enabled) into `combined.jsonl`
7. **Logging**: All sources tracked in `/logs/dataset_sources.json`

### Verification

All dataset sources and row counts are logged with checksums:

```bash
# View dataset provenance
cat logs/dataset_sources.json

# Verify checksums
cat datasets/train.jsonl.sha256
cat datasets/test.jsonl.sha256
cat datasets/combined.jsonl.sha256
```

---

## Google Data Integration

### Overview

Step 1.5 of the pipeline ingests domain-specific Persian data from Google APIs to enhance the training dataset.

### Supported Sources

- **Google Drive**: Documents and text files
- **Google Sheets**: Structured data (converted to conversations)
- **Google Custom Search**: Recent Persian web content
- **Google News**: Persian news articles (via RSS/API)

### Setup

1. **Service Account**:
   ```bash
   # Create service account in Google Cloud Console
   # Download credentials JSON
   export GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/credentials.json
   ```

2. **OAuth Credentials** (for Drive/Sheets):
   ```bash
   # Create OAuth 2.0 client in Google Cloud Console
   export GOOGLE_CLIENT_ID=your-client-id
   export GOOGLE_CLIENT_SECRET=your-client-secret
   export GOOGLE_REFRESH_TOKEN=your-refresh-token
   ```

3. **API Keys**:
   ```bash
   # Custom Search API key
   export GOOGLE_CUSTOM_SEARCH_KEY=your-api-key
   export GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id
   ```

### Ingestion Script

```bash
# Fetch Google data (TypeScript)
npx ts-node scripts/fetch_google_data.ts

# Output: datasets/raw/google_data.jsonl
# Merged into: datasets/combined.jsonl
```

### Configuration

See `.env.example` for all Google data configuration options. Google data ingestion is **optional** and gracefully skips if credentials are not configured.

---

## Quickstart

### From Clean Clone (Development)

```bash
# 1. Clone repository
git clone https://github.com/your-repo/persian-chat.git
cd persian-chat

# 2. Install Node.js dependencies (root)
npm install -g ts-node typescript @types/node

# 3. Fetch and prepare datasets from Hugging Face
npx ts-node scripts/fetch_hf_datasets.ts

# 4. (Optional) Fetch Google data if credentials configured
npx ts-node scripts/fetch_google_data.ts || echo "Skipping Google data"

# 5. Merge and prepare conversational dataset
npx ts-node scripts/prepare_conversational_merge.ts

# 6. Verify dataset integrity
npx ts-node scripts/check_dataset.ts

# 7. Run smoke training (1 epoch for quick validation)
npx ts-node scripts/train_cpu.ts \
  --epochs 1 \
  --batch_size 2 \
  --lr 5e-5 \
  --max_length 512 \
  --seed 42

# 8. Evaluate model
npx ts-node scripts/eval_cpu.ts \
  --data datasets/test.jsonl \
  --model models/persian-chat \
  --output logs/eval.json \
  --samples_output logs/eval_samples.jsonl

# 9. Install and start backend (TypeScript)
cd backend
npm ci
npm run build
npm start &
cd ..

# 10. Install and start frontend
cd client
npm ci
npm run dev &
cd ..

# 11. Access application
# Backend API: http://localhost:3001
# Frontend: http://localhost:3000
```

### Full Training (Production)

```bash
# Full training with 3 epochs on combined dataset
npx ts-node scripts/train_cpu.ts \
  --data datasets/combined.jsonl \
  --epochs 3 \
  --batch_size 4 \
  --lr 5e-5 \
  --max_length 512 \
  --seed 42

# Monitor training progress
tail -f logs/train_full.log

# Evaluate on real test set
npx ts-node scripts/eval_cpu.ts \
  --data datasets/test.jsonl \
  --model models/persian-chat \
  --output logs/eval_full.json \
  --samples_output logs/eval_samples.jsonl
```

**Note**: CPU training is slow (10-20x slower than GPU). Full training may take hours to days. Use smoke testing for CI/quick validation.

---

## Environment Variables

### Example Configuration

Create a `.env` file in the project root:

```bash
# Node Environment
NODE_ENV=production
PORT=3001

# Model Configuration
MODEL_PATH=./models/persian-chat
MODEL_NAME=gpt2  # or gpt2-fa for Persian-specific
MAX_LENGTH=512
TEMPERATURE=0.3  # Range: 0.2-0.4 for accuracy

# Google Data Integration (Optional)
GOOGLE_SERVICE_ACCOUNT_KEY=/path/to/credentials.json
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_CUSTOM_SEARCH_KEY=your-api-key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id
HAMSHAHRI_ENABLED=false  # Set to true to include Hamshahri dataset

# Hugging Face Datasets
DATASET_TRAIN_URLS=ParsBERT-Fa-Sentiment-Twitter,PersianMind-v1.0
DATASET_TEST_SPLIT=validation

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/api.log

# Frontend
VITE_API_BASE_URL=http://localhost:3001
```

### Security Notes

- **Never commit `.env` files** to version control
- Use `.env.example` as a template with placeholder values
- Store production secrets in secure vault (e.g., AWS Secrets Manager, HashiCorp Vault)
- Rotate API keys and credentials regularly

---

## Commands & Scripts

All scripts are **TypeScript** (`.ts`) per Phase P migration. Python is used only for ML training (called via child processes).

### Dataset Scripts

| Script | Description | Command |
|--------|-------------|---------|
| `fetch_hf_datasets.ts` | Download real datasets from Hugging Face | `npx ts-node scripts/fetch_hf_datasets.ts` |
| `fetch_google_data.ts` | Ingest Google data (Drive/Sheets/Search/News) | `npx ts-node scripts/fetch_google_data.ts` |
| `prepare_conversational_merge.ts` | Merge datasets and normalize Persian text | `npx ts-node scripts/prepare_conversational_merge.ts` |
| `check_dataset.ts` | Validate datasets, checksums, and schema | `npx ts-node scripts/check_dataset.ts` |

### Training & Evaluation Scripts

| Script | Description | Command |
|--------|-------------|---------|
| `train_cpu.ts` | Fine-tune model on CPU (TypeScript wrapper) | `npx ts-node scripts/train_cpu.ts --epochs 3 --batch_size 4` |
| `eval_cpu.ts` | Evaluate model on test set | `npx ts-node scripts/eval_cpu.ts --data datasets/test.jsonl --model models/persian-chat` |

### Validation Scripts

| Script | Description | Command |
|--------|-------------|---------|
| `validate_api.sh` | Test backend API endpoints with curl | `bash scripts/validate_api.sh` |
| `ui_smoke.test.js` | Verify frontend UI features (RTL, a11y, etc.) | `node scripts/ui_smoke.test.js` |
| `acceptance.sh` | Run full acceptance tests (all checks) | `bash scripts/acceptance.sh` |

### Training Parameters

```bash
# Smoke test (CI/quick validation)
npx ts-node scripts/train_cpu.ts --epochs 1 --batch_size 2 --lr 5e-5 --max_length 512 --seed 42

# Full training (production)
npx ts-node scripts/train_cpu.ts --epochs 3 --batch_size 4 --lr 5e-5 --max_length 512 --seed 42 --data datasets/combined.jsonl --log_file logs/train_full.log
```

---

## Backend API

### Technology Stack

- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x (strict mode)
- **Validation**: Zod runtime schema validation
- **Port**: 3001 (configurable via `PORT` env var)

### Endpoints

#### POST `/api/chat`

**Request Schema**:
```typescript
{
  message: string;           // Required: User message in Persian or English
  temperature?: number;      // Optional: 0.2-0.4 (default: 0.3)
  stream?: boolean;          // Optional: Enable streaming (default: false)
}
```

**Response (Non-streaming)**:
```json
{
  "response": "سلام! چطور می‌توانم کمکتان کنم؟",
  "model": "persian-chat",
  "timestamp": "2025-10-09T12:00:00Z"
}
```

**Response (Streaming)**:
```
Content-Type: text/event-stream

data: {"token": "سلام"}
data: {"token": "!"}
data: {"token": " چطور"}
...
data: {"done": true}
```

**Error Response**:
```json
{
  "error": true,
  "message": "Invalid temperature value",
  "details": {
    "field": "temperature",
    "constraint": "Must be between 0.2 and 0.4"
  }
}
```

### Features

- ✅ `/api/chat` POST endpoint with Zod validation
- ✅ Token-by-token streaming (Server-Sent Events)
- ✅ Temperature control (0.2-0.4 for accuracy)
- ✅ Structured error responses with details
- ✅ Request/response logging (Winston)
- ✅ CORS support for frontend
- ✅ Input sanitization and validation
- ✅ Rate limiting (configurable)

### Logging

- **Request Log**: `logs/api_requests.log` (all requests with timestamps)
- **Error Log**: `logs/api_errors.log` (errors with stack traces)
- **Format**: JSON structured logs for easy parsing

### Testing

```bash
# Start backend
cd backend && npm start

# Test non-streaming
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"سلام","stream":false}'

# Test streaming
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"سلام","stream":true}'

# Test temperature validation
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","temperature":0.8}'  # Should fail

# Run validation script
bash scripts/validate_api.sh
```

---

## Frontend

### Technology Stack

- **Framework**: React 18.x + Vite 4.x
- **Styling**: TailwindCSS 4.x
- **Language**: TypeScript 5.x
- **Icons**: Lucide React
- **Notifications**: react-hot-toast
- **Port**: 3000 (development), served via Nginx (production)

### Core Features

#### Chat Interface
- ✅ **Chat Bubbles**: Distinct user vs assistant styling
- ✅ **RTL Layout**: Full Right-to-Left support for Persian text (default `dir="rtl"`)
- ✅ **Auto-scroll**: Automatically scroll to latest message
- ✅ **Typing Indicator**: Animated spinner during response generation
- ✅ **Message Animations**: Fade-in animations for new messages
- ✅ **Mobile-first**: Responsive design for all screen sizes
- ✅ **Skeleton Loading**: Animated skeleton states for perceived performance
- ✅ **Focus Visible**: Enhanced keyboard navigation with visible focus indicators

#### UX Enhancements
- ✅ **Dark/Light Mode**: Toggle with system preference detection
- ✅ **Keyboard Shortcuts**: 
  - `Enter`: Send message
  - `Shift+Enter`: New line
  - `Esc`: Clear input
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **localStorage**: Persist chat history and settings
- ✅ **Toast Notifications**: Error messages and status updates
- ✅ **Multi-browser**: Chrome, Firefox, Safari, Edge support

#### Settings Panel (API Override + Local Fallback)
- ✅ **Settings Modal**: Configure API endpoint and keys (`MonitoringSettingsPage.tsx`)
- ✅ **Dynamic Application**: Apply settings without reload
- ✅ **Persistence**: Save settings to localStorage
- ✅ **Validation**: Real-time input validation
- ✅ **API Override Logic**: 
  - If custom endpoint + API key configured → use external API
  - Otherwise → use local model
  - All routes logged to `/logs/api.log` with source tracking
- ✅ **RTL/LTR Toggle**: Switch text direction on-the-fly (Persian RTL default)

### Directory Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ChatBubble.tsx
│   │   ├── ChatContainer.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── SettingsModal.tsx
│   │   └── Toast.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

### Development

```bash
cd client
npm ci
npm run dev  # Start dev server on http://localhost:3000
npm run build  # Production build to dist/
npm run preview  # Preview production build
```

### Testing

```bash
# Run UI smoke tests
node scripts/ui_smoke.test.js

# Manual testing checklist:
# - RTL text rendering
# - Dark/light mode toggle
# - Keyboard shortcuts (Enter, Shift+Enter, Esc)
# - Auto-scroll behavior
# - Toast notifications on errors
# - Settings persistence across refreshes
# - Mobile responsiveness
```

---

## CI/CD

### Pipeline Overview

The CI pipeline enforces strict quality gates with **9 jobs** running on every push/PR.

```
┌──────────────┐
│ python-check │ ← Hard gate: No .py outside archive/
└──────┬───────┘
       ├─────────────────┬──────────────────┬
       ▼                 ▼                  ▼
┌─────────────┐   ┌──────────────┐   ┌──────────┐
│   precheck  │   │backend-build │   │frontend  │
└──────┬──────┘   └──────┬───────┘   └────┬─────┘
       ▼                 ▼                 ▼
┌─────────────┐   ┌──────────────┐   ┌──────────┐
│ hf-datasets │   │ api-validate │   │ ui-tests │
└──────┬──────┘   └──────────────┘   └──────────┘
       ├─────┬─────────┐
       ▼     ▼         ▼
┌──────────┬─────┬──────────┐
│  google  │train│   eval   │
└──────────┴─────┴──────────┘
       │         │
       ▼         ▼
┌─────────────────────────┐
│  acceptance (GATE)      │ ← Blocks merge if fails
└─────────────────────────┘
```

### Jobs

| Job | Purpose | Hard Gate | Artifacts |
|-----|---------|-----------|-----------|
| `python-check` | Enforce TypeScript-only (no .py outside archive) | ✅ Yes | None |
| `backend-build` | TypeScript strict build, verify no .js in backend/src | ✅ Yes | None |
| `frontend-build` | Build React frontend | ✅ Yes | None |
| `precheck` | Verify scripts exist | ✅ Yes | None |
| `hf-datasets` | Fetch real HF datasets, generate checksums | ✅ Yes | datasets/, logs/ |
| `google-data` | Ingest Google data (optional) | ⚠️  Soft | combined.jsonl |
| `real-train` | Smoke training (1 epoch in CI) | ⚠️  Soft | logs/train_full.log |
| `real-eval` | Evaluate on test set, validate metrics | ✅ Yes | logs/eval_full.json |
| `api-validation` | Verify API scripts exist | ✅ Yes | None |
| `ui-tests` | Run UI smoke tests | ⚠️  Soft | None |
| `deployment-validation` | Verify Nginx/PM2 configs | ✅ Yes | None |
| `docs-validation` | Verify traceability and reports | ✅ Yes | None |
| `acceptance` | Run full acceptance tests | ✅ **BLOCKS MERGE** | None |

### Hard Gates (CI Fails if Any Fail)

1. **No Python outside archive**: `find . -name "*.py" -not -path "./archive/*"` → must be empty
2. **No JavaScript in backend/src**: `find backend/src -name "*.js"` → must be empty
3. **Backend TypeScript build**: `npm run build` in backend/ must succeed
4. **Frontend build**: `npm run build` in client/ must succeed
5. **Dataset validation**: Real datasets must be fetched and validated
6. **Evaluation metrics**: Perplexity must be finite (not NaN)
7. **Acceptance tests**: All checks in `scripts/acceptance.sh` must pass

### Configuration

See `.github/workflows/ci.yaml` for full pipeline configuration.

### Running Locally

```bash
# Simulate CI locally
bash scripts/acceptance.sh

# Individual checks
npx ts-node scripts/check_dataset.ts
bash scripts/validate_api.sh
node scripts/ui_smoke.test.js
```

---

## Deployment

### Target Infrastructure

- **VPS**: Ubuntu 20.04+ with ≥4 vCPUs, 8GB RAM
- **Web Server**: Nginx 1.18+
- **Process Manager**: PM2
- **SSL**: Let's Encrypt (Certbot)
- **Domain**: Required for HTTPS

### Quick Deployment

```bash
# 1. Install dependencies
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2

# 2. Clone and setup
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/your-repo/persian-chat.git
sudo chown -R $USER:$USER persian-chat
cd persian-chat

# 3. Prepare datasets and train model
npx ts-node scripts/fetch_hf_datasets.ts
npx ts-node scripts/prepare_conversational_merge.ts
npx ts-node scripts/train_cpu.ts --epochs 3 --batch_size 4

# 4. Build backend
cd backend
npm ci
npm run build
cd ..

# 5. Build frontend
cd client
npm ci
npm run build
cd ..

# 6. Configure Nginx (edit nginx/nginx.conf with your domain)
sudo cp nginx/nginx.conf /etc/nginx/sites-available/persian-chat
sudo ln -s /etc/nginx/sites-available/persian-chat /etc/nginx/sites-enabled/
sudo nginx -t

# 7. Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 8. Start with PM2
pm2 start pm2/ecosystem.config.js --env production
pm2 save
pm2 startup systemd

# 9. Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 10. Verify
curl https://your-domain.com
```

### Nginx Configuration

**Reverse Proxy for `/api/*`**:
```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

**Static File Serving**:
```nginx
location / {
    root /var/www/persian-chat/client/dist;
    try_files $uri $uri/ /index.html;
}
```

**HTTPS (Let's Encrypt)**:
```nginx
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

See `nginx/nginx.conf` for complete configuration.

### PM2 Configuration

**Ecosystem File** (`pm2/ecosystem.config.js`):
```javascript
module.exports = {
  apps: [
    {
      name: 'persian-chat-api',
      script: 'dist/server.js',
      cwd: '/var/www/persian-chat/backend',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'persian-chat-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/var/www/persian-chat/client'
    }
  ]
};
```

### Monitoring

```bash
# PM2 monitoring
pm2 status
pm2 logs
pm2 monit

# Nginx logs
sudo tail -f /var/log/nginx/persian-chat-access.log
sudo tail -f /var/log/nginx/persian-chat-error.log

# Application logs
tail -f logs/api.log
tail -f logs/train_full.log
```

### Complete Deployment Guide

See `docs/deployment.md` for detailed step-by-step deployment instructions, including:
- Initial server setup
- Security hardening (SSH, firewall, fail2ban)
- Backup strategies
- Performance optimization
- Troubleshooting common issues
- Rollback procedures

---

## Traceability & Reports

### Traceability Matrix

**Location**: `docs/traceability.md`

Maps every requirement from the specification to:
- Implementation path (file/command)
- Evidence artifact (log/output)
- Status (pending/in_progress/done)

Example:
| Spec Step | Requirement | Implementation | Evidence | Status |
|-----------|-------------|----------------|----------|--------|
| 1.1 | Download HF datasets | `scripts/fetch_hf_datasets.ts` | `datasets/train.jsonl` | ✅ done |
| 2.1 | Fine-tune model | `scripts/train_cpu.ts` | `logs/train_full.log` | ✅ done |
| 4.1 | TypeScript backend | `backend/src/server.ts` | CI build success | ✅ done |

### Implementation Report

**Location**: `report.md`

Contains:
- Executive summary
- Environment setup
- Dataset preparation (with real URLs and checksums)
- Training/evaluation metrics (real logs, no fake data)
- API implementation details
- Frontend features
- Deployment configuration
- **Honest reporting** of limitations and caveats
- Phase P migration status
- Reproduction steps

### Python Inventory

**Location**: `docs/python_inventory.md`

Documents all Python files that were migrated to TypeScript during Phase P:
- Original Python files (archived)
- TypeScript equivalents
- Migration status
- Functional equivalence verification

### Verification Commands

```bash
# View traceability
cat docs/traceability.md

# View implementation report
cat report.md

# View Python inventory
cat docs/python_inventory.md

# Verify dataset sources
cat logs/dataset_sources.json

# Check evaluation metrics
cat logs/eval_full.json
```

---

## Troubleshooting

### Common Issues

#### 1. Dataset Fetch Failures

**Symptom**: `fetch_hf_datasets.ts` fails with network errors

**Solution**:
```bash
# Check internet connectivity
ping huggingface.co

# Try with explicit dataset URL
npx ts-node scripts/fetch_hf_datasets.ts --dataset ParsBERT-Fa-Sentiment-Twitter

# Check Hugging Face status
curl https://status.huggingface.co
```

#### 2. Training Out of Memory

**Symptom**: `CUDA out of memory` or Python killed during training

**Solution**:
```bash
# Reduce batch size
npx ts-node scripts/train_cpu.ts --batch_size 1

# Reduce max sequence length
npx ts-node scripts/train_cpu.ts --max_length 256

# Monitor memory during training
watch -n 1 free -h
```

#### 3. Backend Not Starting

**Symptom**: `npm start` fails or API not responding

**Solution**:
```bash
# Check TypeScript build
cd backend
npm run build

# Check for port conflicts
sudo netstat -tulpn | grep 3001

# View backend logs
pm2 logs persian-chat-api

# Restart backend
pm2 restart persian-chat-api
```

#### 4. Google Auth Errors

**Symptom**: `fetch_google_data.ts` fails with 401/403 errors

**Solution**:
```bash
# Verify credentials file exists
ls -l $GOOGLE_SERVICE_ACCOUNT_KEY

# Check OAuth token validity
# Regenerate refresh token if expired

# Test with minimal permissions
# Ensure service account has Drive/Sheets read access

# Skip Google data if not needed
# It's optional - pipeline works without it
```

#### 5. CORS Errors in Frontend

**Symptom**: Browser console shows CORS errors

**Solution**:
```bash
# Check backend CORS configuration
grep -r "cors" backend/src/

# Verify Nginx proxy headers
sudo nginx -t
sudo systemctl reload nginx

# Check API endpoint URL in frontend
grep -r "VITE_API_BASE_URL" client/
```

#### 6. SSL Certificate Errors

**Symptom**: HTTPS not working or certificate warnings

**Solution**:
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
sudo certbot renew --force-renewal

# Verify Nginx SSL configuration
sudo nginx -t

# Check certificate paths in nginx.conf
```

### Verification Steps

```bash
# Step 1: Verify datasets exist
ls -lh datasets/*.jsonl
cat logs/dataset_sources.json

# Step 2: Verify model exists
ls -lh models/persian-chat/

# Step 3: Verify backend builds
cd backend && npm run build && cd ..

# Step 4: Verify frontend builds
cd client && npm run build && cd ..

# Step 5: Test API
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"سلام"}'

# Step 6: Run full acceptance tests
bash scripts/acceptance.sh
```

### Logs

| Component | Log Location | Command |
|-----------|-------------|---------|
| Dataset fetch | `logs/dataset_sources.json` | `cat logs/dataset_sources.json` |
| Training | `logs/train_full.log` | `tail -f logs/train_full.log` |
| Evaluation | `logs/eval_full.json` | `cat logs/eval_full.json` |
| API requests | `logs/api.log` | `tail -f logs/api.log` |
| PM2 processes | PM2 logs | `pm2 logs` |
| Nginx access | `/var/log/nginx/persian-chat-access.log` | `sudo tail -f /var/log/nginx/persian-chat-access.log` |
| Nginx errors | `/var/log/nginx/persian-chat-error.log` | `sudo tail -f /var/log/nginx/persian-chat-error.log` |

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Persian Chat Application

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Contributing

We welcome contributions! Please see our guidelines:

### Code of Conduct

This project adheres to a **Code of Conduct** that all contributors are expected to follow. See `CODE_OF_CONDUCT.md` for details.

### Security Policy

Report security vulnerabilities responsibly. See `SECURITY.md` for our security policy and reporting procedures.

### Contributing Guidelines

See `CONTRIBUTING.md` for:
- Development setup
- Coding standards (TypeScript strict mode, Zod validation, etc.)
- Testing requirements
- PR process and review guidelines
- Phase P enforcement (TypeScript-only backend)

### Quick Start for Contributors

```bash
# 1. Fork and clone
git clone https://github.com/your-username/persian-chat.git

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes (ensure TypeScript-only)
# No .py files outside archive/
# No .js files in backend/src/

# 4. Run tests
bash scripts/acceptance.sh

# 5. Commit with descriptive message
git commit -m "feat: add feature description"

# 6. Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Format

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test additions/modifications
- `chore:` Build/tooling changes

### CI Requirements

All PRs must pass CI before merge:
- ✅ TypeScript-only enforcement (no Python outside archive)
- ✅ Backend/frontend builds
- ✅ Dataset validation
- ✅ API/UI tests
- ✅ Acceptance tests

---

## Changelog

See `CHANGELOG.md` for version history and release notes.

**Current Version**: 2.0.0 (Phase P Migration Complete)

**Recent Changes**:
- ✅ Phase P migration: All Python scripts → TypeScript
- ✅ TypeScript-only backend with strict typing
- ✅ Real Persian datasets integration (HF + Google)
- ✅ CPU-based training and evaluation
- ✅ React frontend with RTL, dark mode, a11y
- ✅ Production deployment configs (Nginx + PM2 + SSL)
- ✅ Comprehensive CI/CD with hard gates

---

## Support & Contact

- **Documentation**: `docs/`
- **Issues**: [GitHub Issues](https://github.com/your-repo/persian-chat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/persian-chat/discussions)
- **Email**: support@your-domain.com

---

**Built with ❤️ for the Persian-speaking community**

**Version**: 2.0.0 | **Last Updated**: 2025-10-09
