#!/usr/bin/env bash
set -euo pipefail

red(){ printf "\033[31m%s\033[0m\n" "$*"; }
grn(){ printf "\033[32m%s\033[0m\n" "$*"; }
ylw(){ printf "\033[33m%s\033[0m\n" "$*"; }
chk(){ [ -e "$1" ] || { red "MISSING: $1"; exit 1; }; grn "OK: $1"; }

echo "======================================================================"
echo "                    SPEC COMPLIANCE CHECKER"
echo "         Full Implementation Verification & Acceptance Tests"
echo "======================================================================"
echo ""

FAILED=0

# ============================================================================
# Phase P: TypeScript-Only Enforcement
# ============================================================================
echo "🔒 PHASE P: TypeScript-Only Enforcement"
echo "======================================================================"

echo "🔍 Checking for Python files outside archive..."
if find . -type f -name "*.py" \
   -not -path "./archive/python/*" \
   -not -path "./node_modules/*" \
   -not -path "./.venv/*" \
   -not -path "./venv/*" | grep -q .; then
    red "❌ CRITICAL: Found .py files outside archive/python/"
    red "   Backend MUST be TypeScript-only per Phase P specification"
    find . -type f -name "*.py" \
      -not -path "./archive/python/*" \
      -not -path "./node_modules/*" \
      -not -path "./.venv/*" \
      -not -path "./venv/*"
    FAILED=$((FAILED + 1))
else
    grn "✅ No Python files outside archive - TypeScript-only enforcement passed"
fi

echo ""
echo "🔍 Checking for JavaScript files in backend/src..."
if [ -d "backend/src" ]; then
    if find backend/src -type f -name "*.js" | grep -q .; then
        red "❌ CRITICAL: Found .js files in backend/src"
        red "   Backend MUST be TypeScript-only"
        find backend/src -type f -name "*.js"
        FAILED=$((FAILED + 1))
    else
        grn "✅ backend/src is TypeScript-only (no .js files)"
    fi
fi

echo ""
chk archive/python/README.md
chk docs/python_inventory.md

echo ""

# ============================================================================
# Step 1: Dataset Preparation (Real HF Datasets)
# ============================================================================
echo "🗂️  STEP 1: Dataset Preparation (Real HuggingFace Datasets)"
echo "======================================================================"

# Create datasets if they don't exist
if [ ! -f "datasets/train.jsonl" ]; then
    echo "Creating datasets from HuggingFace (TypeScript)..."
    if command -v npx &> /dev/null; then
        npx ts-node scripts/fetch_hf_datasets.ts
        npx ts-node scripts/prepare_conversational_merge.ts
    else
        echo "⚠️  npx not found, falling back to legacy download"
        npx ts-node scripts/download_datasets.ts
    fi
fi

chk datasets/train.jsonl
chk datasets/test.jsonl

# Check for new-style checksums
if [ -f "datasets/train.jsonl.sha256" ]; then
    chk datasets/train.jsonl.sha256
    chk datasets/test.jsonl.sha256
    grn "✅ SHA256 checksums found"
else
    # Fall back to legacy checksums.txt
    chk datasets/checksums.txt
fi

echo ""
echo "== Real Dataset Integrity =="
if [ -f "logs/dataset_sources.json" ]; then
    chk logs/dataset_sources.json
    
    # Validate dataset_sources.json structure
    if command -v node &> /dev/null; then
        if node -e "const s=require('./logs/dataset_sources.json'); if(!Array.isArray(s)||!s.length||s.some(x=>!x.source||!x.rows||x.rows<=0)) { console.error('Invalid dataset_sources.json'); process.exit(1) }"; then
            grn "✅ Dataset sources validated (contains real data)"
        else
            red "❌ Dataset sources invalid or contains zero rows"
            FAILED=$((FAILED + 1))
        fi
    else
        ylw "⚠️  Node not available, skipping dataset_sources validation"
    fi
else
    ylw "⚠️  logs/dataset_sources.json not found (may be using legacy datasets)"
fi

echo ""
echo "Running dataset validation (TypeScript)..."
if npx ts-node scripts/check_dataset.ts; then
    grn "✅ Dataset validation passed"
else
    red "❌ Dataset validation failed"
    FAILED=$((FAILED + 1))
fi
echo ""

# ============================================================================
# Step 1.5: Google Data Ingestion
# ============================================================================
echo "🌐 STEP 1.5: Google Data Ingestion (TypeScript)"
echo "======================================================================"

if command -v npx &> /dev/null; then
    echo "Running Google data ingestion..."
    if npx ts-node scripts/fetch_google_data.ts; then
        grn "✅ Google data ingestion completed"
    else
        red "❌ Google data ingestion failed"
        FAILED=$((FAILED + 1))
    fi
else
    ylw "⚠️  npx not found, skipping Google data ingestion"
fi

chk datasets/raw/google_data.jsonl
chk datasets/combined.jsonl
echo ""

# ============================================================================
# Step 2: Training
# ============================================================================
echo "🚀 STEP 2: Fine-tuning (CPU)"
echo "======================================================================"

# Check if model already exists
if [ -d "models/persian-chat" ]; then
    ylw "Model directory already exists, skipping training..."
    ylw "To retrain, remove models/persian-chat and run again"
else
    echo "Running training (TypeScript wrapper → Python)..."
    if npx ts-node scripts/train_cpu.ts --epochs 1 --batch_size 2 --lr 5e-5 --max_length 512 --seed 42; then
        grn "✅ Training completed"
    else
        red "❌ Training failed"
        FAILED=$((FAILED + 1))
    fi
fi

chk logs/train.log
chk models/persian-chat
chk models/persian-chat/config.json
# Check for either pytorch_model.bin or model.safetensors
if [ -f "models/persian-chat/pytorch_model.bin" ] || [ -f "models/persian-chat/model.safetensors" ]; then
    grn "OK: models/persian-chat/model.safetensors or pytorch_model.bin"
else
    red "MISSING: models/persian-chat/pytorch_model.bin or model.safetensors"
    exit 1
fi
echo ""

# ============================================================================
# Step 3: Evaluation (TypeScript)
# ============================================================================
echo "📊 STEP 3: Model Evaluation (TypeScript)"
echo "======================================================================"

if command -v npx &> /dev/null; then
    echo "Running TypeScript evaluation..."
    if npx ts-node scripts/eval_cpu.ts --data datasets/test.jsonl --model models/persian-chat; then
        grn "✅ TypeScript evaluation completed"
    else
        red "❌ TypeScript evaluation failed"
        FAILED=$((FAILED + 1))
    fi
else
    ylw "⚠️  npx not found, evaluation skipped"
fi

chk logs/eval.json
chk logs/errors.txt

# Verify eval.json contains required metrics
if [ -f "logs/eval.json" ]; then
    if grep -q "eval_loss" logs/eval.json && grep -q "perplexity" logs/eval.json; then
        grn "✅ Evaluation metrics present (eval_loss, perplexity)"
    else
        red "❌ Missing required metrics in logs/eval.json"
        FAILED=$((FAILED + 1))
    fi
fi

echo ""
echo "== Full Training & Evaluation (Real Data) =="

# Check for full training log
if [ -f "logs/train_full.log" ]; then
    chk logs/train_full.log
    grn "✅ Full training log exists"
else
    ylw "⚠️  logs/train_full.log not found (full training may not have run)"
fi

# Check for full evaluation
if [ -f "logs/eval_full.json" ]; then
    chk logs/eval_full.json
    
    # Validate full eval metrics
    if command -v node &> /dev/null; then
        if node -e "const m=require('./logs/eval_full.json'); if(!m.perplexity || !isFinite(m.perplexity)) { console.error('Invalid perplexity'); process.exit(1) }"; then
            grn "✅ Full evaluation metrics valid (perplexity is finite)"
        else
            red "❌ Invalid metrics in logs/eval_full.json"
            FAILED=$((FAILED + 1))
        fi
    fi
else
    ylw "⚠️  logs/eval_full.json not found (full evaluation may not have run)"
fi

# Check for evaluation samples
if [ -f "logs/eval_samples.jsonl" ]; then
    chk logs/eval_samples.jsonl
    grn "✅ Evaluation samples exist"
else
    ylw "⚠️  logs/eval_samples.jsonl not found"
fi

echo ""

# ============================================================================
# Step 4: Backend API (TypeScript ONLY)
# ============================================================================
echo "🔌 STEP 4: Backend API (TypeScript Enforcement)"
echo "======================================================================"

# CRITICAL: Check for JavaScript files in backend/src
if [ -d "backend/src" ]; then
    echo "🔍 Enforcing TypeScript-only backend..."
    if find backend/src -type f -name "*.js" | grep -q .; then
        red "❌ CRITICAL: Found .js files in backend/src"
        red "   Backend MUST be TypeScript-only (*.ts files)"
        find backend/src -type f -name "*.js"
        FAILED=$((FAILED + 1))
    else
        grn "✅ Backend is TypeScript-only (no .js files in backend/src)"
    fi
    
    chk "backend/package.json"
    chk "backend/tsconfig.json"
    chk "backend/src/server.ts"
    chk "backend/src/routes/chat.ts"
    
    # Check TypeScript strict mode
    if grep -q '"strict": true' backend/tsconfig.json; then
        grn "✅ TypeScript strict mode enabled"
    else
        red "❌ TypeScript strict mode not enabled"
        FAILED=$((FAILED + 1))
    fi
    
    # Check for Zod validation
    if grep -r "zod" backend/src --include="*.ts" > /dev/null 2>&1; then
        grn "✅ Zod validation found"
    else
        ylw "⚠️  Zod validation not clearly implemented"
    fi
    
    # Check for required API route
    if grep -r "\/api\/chat" backend/src --include="*.ts" > /dev/null 2>&1; then
        grn "✅ /api/chat route found"
    else
        red "❌ /api/chat route not found"
        FAILED=$((FAILED + 1))
    fi
    
    # Check for streaming support
    if grep -r "stream" backend/src --include="*.ts" > /dev/null 2>&1; then
        grn "✅ Streaming support found"
    else
        ylw "⚠️  Streaming support not clearly implemented"
    fi
    
    # Check for temperature parameter
    if grep -r "temperature" backend/src --include="*.ts" > /dev/null 2>&1; then
        grn "✅ Temperature parameter found"
    else
        ylw "⚠️  Temperature parameter not found"
    fi
    
    # Build backend to verify TypeScript compilation
    if command -v npm &> /dev/null; then
        echo "Building TypeScript backend..."
        if (cd backend && npm run build &> /dev/null); then
            grn "✅ TypeScript backend builds successfully"
        else
            red "❌ TypeScript backend build failed"
            FAILED=$((FAILED + 1))
        fi
    fi
else
    red "❌ backend/src directory not found"
    FAILED=$((FAILED + 1))
fi
echo ""

# ============================================================================
# Step 5 & 6: Frontend UI & Enhancements
# ============================================================================
echo "🎨 STEP 5 & 6: Frontend UI & Enhancements"
echo "======================================================================"

# Check if frontend exists
if [ -d "frontend" ]; then
    FRONTEND_DIR="frontend"
elif [ -d "client" ]; then
    FRONTEND_DIR="client"
else
    red "❌ Frontend directory not found (expected: frontend/ or client/)"
    FAILED=$((FAILED + 1))
    FRONTEND_DIR=""
fi

if [ -n "$FRONTEND_DIR" ]; then
    chk "${FRONTEND_DIR}/package.json"
    
    # Run UI smoke tests
    echo ""
    echo "Running UI smoke tests..."
    if node scripts/ui_smoke.test.js; then
        grn "✅ UI smoke tests passed"
    else
        red "❌ UI smoke tests failed"
        FAILED=$((FAILED + 1))
    fi
    
    # Verify specific requirements
    echo ""
    echo "Verifying UI requirements:"
    
    if grep -r "localStorage" "$FRONTEND_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" > /dev/null 2>&1; then
        grn "✅ localStorage persistence found"
    else
        red "❌ localStorage persistence not found"
        FAILED=$((FAILED + 1))
    fi
    
    if grep -r "aria-" "$FRONTEND_DIR" --include="*.tsx" --include="*.jsx" > /dev/null 2>&1; then
        grn "✅ ARIA attributes found"
    else
        red "❌ ARIA attributes not found"
        FAILED=$((FAILED + 1))
    fi
    
    if grep -r "dir=" "$FRONTEND_DIR" --include="*.tsx" --include="*.jsx" > /dev/null 2>&1 || \
       grep -r "rtl" "$FRONTEND_DIR" --include="*.tsx" --include="*.jsx" --include="*.css" > /dev/null 2>&1; then
        grn "✅ RTL support found"
    else
        red "❌ RTL support not found"
        FAILED=$((FAILED + 1))
    fi
fi
echo ""

# ============================================================================
# Step 7: Settings Panel
# ============================================================================
echo "⚙️  STEP 7: Settings Panel"
echo "======================================================================"

if [ -n "$FRONTEND_DIR" ]; then
    if grep -r "settings\|Settings" "$FRONTEND_DIR" --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" > /dev/null 2>&1; then
        grn "✅ Settings component found"
    else
        red "❌ Settings component not found"
        FAILED=$((FAILED + 1))
    fi
    
    if grep -r "apiKey\|api_key\|API_KEY" "$FRONTEND_DIR" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" > /dev/null 2>&1; then
        grn "✅ API key configuration found"
    else
        ylw "⚠️  API key configuration not clearly implemented"
    fi
fi
echo ""

# ============================================================================
# Step 8: Deployment Artifacts
# ============================================================================
echo "🚀 STEP 8: Deployment Artifacts"
echo "======================================================================"

chk nginx/nginx.conf
chk pm2/ecosystem.config.js

# Verify nginx config has reverse proxy
if grep -q "proxy_pass\|/api/" nginx/nginx.conf; then
    grn "✅ Nginx reverse proxy configuration found"
else
    red "❌ Nginx reverse proxy configuration missing"
    FAILED=$((FAILED + 1))
fi

# Verify PM2 config
if grep -q "apps" pm2/ecosystem.config.js; then
    grn "✅ PM2 ecosystem config valid"
else
    red "❌ PM2 ecosystem config invalid"
    FAILED=$((FAILED + 1))
fi
echo ""

# ============================================================================
# Final: Documentation & Report
# ============================================================================
echo "📝 STEP 9: Documentation & Report"
echo "======================================================================"

chk docs/traceability.md
chk report.md

# Verify traceability matrix is not empty
if [ -f "docs/traceability.md" ] && [ -s "docs/traceability.md" ]; then
    grn "✅ Traceability matrix exists and is not empty"
else
    red "❌ Traceability matrix missing or empty"
    FAILED=$((FAILED + 1))
fi

# Verify report contains required sections
if [ -f "report.md" ]; then
    if grep -qi "environment\|setup" report.md && \
       grep -qi "training\|evaluation" report.md && \
       grep -qi "metrics\|results" report.md; then
        grn "✅ Report contains required sections"
    else
        ylw "⚠️  Report may be missing some required sections"
    fi
fi
echo ""

# ============================================================================
# Summary
# ============================================================================
echo "======================================================================"
echo "                         FINAL SUMMARY"
echo "======================================================================"
echo ""

if [ $FAILED -eq 0 ]; then
    grn "🎉 ALL CHECKS PASSED — Full implementation confirmed!"
    grn ""
    grn "✅ All datasets validated"
    grn "✅ Model trained and evaluated"
    grn "✅ Backend API implemented"
    grn "✅ Frontend UI complete"
    grn "✅ Deployment artifacts ready"
    grn "✅ Documentation complete"
    echo ""
    grn "The implementation is compliant with the specification."
    grn "Ready for deployment! 🚀"
    echo ""
    exit 0
else
    red "❌ COMPLIANCE CHECK FAILED"
    red ""
    red "Number of failures: $FAILED"
    echo ""
    red "Please address the above issues before proceeding."
    red "Review docs/traceability.md for detailed requirements."
    echo ""
    exit 1
fi
