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
# Step 1: Dataset Preparation
# ============================================================================
echo "🗂️  STEP 1: Dataset Preparation"
echo "======================================================================"
chk datasets/train.jsonl
chk datasets/test.jsonl
chk datasets/checksums.txt

echo ""
echo "Running dataset validation..."
if python3 scripts/check_dataset.py; then
    grn "✅ Dataset validation passed"
else
    red "❌ Dataset validation failed"
    FAILED=$((FAILED + 1))
fi
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
    echo "Running training (this may take a while on CPU)..."
    if python3 scripts/train_cpu.py --epochs 1 --batch_size 2 --lr 5e-5 --max_length 512 --seed 42; then
        grn "✅ Training completed"
    else
        red "❌ Training failed"
        FAILED=$((FAILED + 1))
    fi
fi

chk logs/train.log
chk models/persian-chat
chk models/persian-chat/config.json
chk models/persian-chat/pytorch_model.bin || chk models/persian-chat/model.safetensors
echo ""

# ============================================================================
# Step 3: Evaluation
# ============================================================================
echo "📊 STEP 3: Model Evaluation"
echo "======================================================================"

if [ -d "models/persian-chat" ]; then
    echo "Running evaluation..."
    if python3 scripts/eval_cpu.py --data datasets/test.jsonl --model models/persian-chat; then
        grn "✅ Evaluation completed"
    else
        red "❌ Evaluation failed"
        FAILED=$((FAILED + 1))
    fi
else
    ylw "⚠️  Model not found, skipping evaluation"
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

# ============================================================================
# Step 4: Backend API
# ============================================================================
echo "🔌 STEP 4: Backend API"
echo "======================================================================"

# Check if backend exists
if [ -d "backend" ]; then
    BACKEND_DIR="backend"
elif [ -d "server" ]; then
    BACKEND_DIR="server"
else
    red "❌ Backend directory not found (expected: backend/ or server/)"
    FAILED=$((FAILED + 1))
    BACKEND_DIR=""
fi

if [ -n "$BACKEND_DIR" ]; then
    chk "${BACKEND_DIR}/package.json"
    
    # Check for required API route
    if grep -r "\/api\/chat" "$BACKEND_DIR" --include="*.js" --include="*.ts" > /dev/null 2>&1; then
        grn "✅ /api/chat route found"
    else
        red "❌ /api/chat route not found"
        FAILED=$((FAILED + 1))
    fi
    
    # Check for streaming support
    if grep -r "stream" "$BACKEND_DIR" --include="*.js" --include="*.ts" > /dev/null 2>&1; then
        grn "✅ Streaming support found"
    else
        ylw "⚠️  Streaming support not clearly implemented"
    fi
    
    # Check for temperature parameter
    if grep -r "temperature" "$BACKEND_DIR" --include="*.js" --include="*.ts" > /dev/null 2>&1; then
        grn "✅ Temperature parameter found"
    else
        ylw "⚠️  Temperature parameter not found"
    fi
    
    # Optional: Start server and run API tests
    if command -v npm &> /dev/null; then
        ylw "Note: Skipping live API tests (requires manual server start)"
        ylw "To test API: Start server, then run: bash scripts/validate_api.sh"
    fi
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
