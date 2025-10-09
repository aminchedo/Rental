# Enforcement System - File Index

Quick reference guide to all enforcement system files and their purposes.

---

## 📋 Core Enforcement Files

### Traceability
| File | Size | Purpose |
|------|------|---------|
| `docs/traceability.md` | 8.7K | Complete requirement → implementation → evidence mapping |

### Master Checker
| File | Size | Purpose |
|------|------|---------|
| `scripts/acceptance.sh` | 11K | **Master validation script - runs ALL checks** |

---

## 🔧 Verification Scripts

| Script | Size | Purpose | Output |
|--------|------|---------|--------|
| `scripts/check_dataset.py` | 7.8K | Validate JSONL, normalize Persian, checksums | `datasets/checksums.txt` |
| `scripts/train_cpu.py` | 8.3K | CPU fine-tuning with hyperparams | `models/persian-chat/`, `logs/train.log` |
| `scripts/eval_cpu.py` | 8.2K | Evaluate on test set, calculate metrics | `logs/eval.json`, `logs/errors.txt` |
| `scripts/validate_api.sh` | 6.9K | Test API endpoints, streaming, temperature | Exit code 0/1 |
| `scripts/ui_smoke.test.js` | 7.8K | Validate frontend features (RTL, a11y, etc.) | Exit code 0/1 |

**All scripts are executable** (`chmod +x`)

---

## 🚀 CI/CD Pipeline

| File | Size | Purpose |
|------|------|---------|
| `.github/workflows/ci.yaml` | 13K | 7-job CI pipeline with final acceptance gate |

### Jobs:
1. `dataset` - Dataset validation
2. `train` - Training smoke test (1 epoch)
3. `eval` - Evaluation with metrics validation
4. `backend` - API verification
5. `frontend` - UI build & smoke tests
6. `acceptance` ⭐ - **Final gate (blocks merge on failure)**
7. `compliance-report` - Generate summary

---

## 📦 Deployment Artifacts

| File | Size | Purpose |
|------|------|---------|
| `nginx/nginx.conf` | 4.8K | Web server config (reverse proxy, SSL, static serving) |
| `pm2/ecosystem.config.js` | 2.8K | Process manager config (clustering, auto-restart) |

---

## 📚 Documentation

| File | Size | Purpose |
|------|------|---------|
| `docs/deployment.md` | 12K | Complete VPS deployment guide (step-by-step) |
| `report.md` | 12K | Comprehensive implementation report |
| `ENFORCEMENT_README.md` | 11K | System documentation (how it works) |
| `ENFORCEMENT_SUMMARY.md` | 9.7K | Quick reference summary |
| `ENFORCEMENT_INDEX.md` | This file | File index and quick reference |
| `PR_ENFORCEMENT_DESCRIPTION.md` | 11K | PR description template |
| `requirements.txt` | 484B | Python dependencies |

---

## 🎯 Quick Reference

### Run Full Acceptance Test
```bash
bash scripts/acceptance.sh
```

### Run Individual Checks
```bash
# Dataset
python3 scripts/check_dataset.py

# Training (smoke)
python3 scripts/train_cpu.py --epochs 1 --batch_size 2

# Evaluation
python3 scripts/eval_cpu.py

# API
bash scripts/validate_api.sh

# UI
node scripts/ui_smoke.test.js
```

### Check CI Configuration
```bash
cat .github/workflows/ci.yaml
```

### Review Traceability
```bash
cat docs/traceability.md
```

### Deploy to VPS
```bash
# Follow step-by-step guide
cat docs/deployment.md
```

---

## 📊 File Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yaml                    # CI/CD pipeline (7 jobs)
├── docs/
│   ├── deployment.md                  # VPS deployment guide
│   └── traceability.md                # Requirement mapping
├── nginx/
│   └── nginx.conf                     # Web server config
├── pm2/
│   └── ecosystem.config.js            # Process manager config
├── scripts/
│   ├── acceptance.sh                  # ⭐ Master checker
│   ├── check_dataset.py               # Dataset validator
│   ├── train_cpu.py                   # Training script
│   ├── eval_cpu.py                    # Evaluation script
│   ├── validate_api.sh                # API validator
│   └── ui_smoke.test.js               # UI tester
├── ENFORCEMENT_README.md              # System documentation
├── ENFORCEMENT_SUMMARY.md             # Quick summary
├── ENFORCEMENT_INDEX.md               # This file
├── PR_ENFORCEMENT_DESCRIPTION.md      # PR template
├── report.md                          # Implementation report
└── requirements.txt                   # Python deps
```

---

## 🔍 What Each File Does

### Core System

**`docs/traceability.md`**
- Maps every spec requirement to implementation
- Provides evidence paths (file/log/command)
- Tracks status (pending/in_progress/done)
- Used by acceptance.sh for validation

**`scripts/acceptance.sh`**
- Master validation script
- Runs ALL verification checks
- Validates ALL artifacts exist
- **Blocks if ANY requirement missing**
- Exit 0 = full compliance, 1 = failure

### Verification Scripts

**`scripts/check_dataset.py`**
- Validates JSONL schema (messages array with roles)
- Normalizes Persian text (Arabic → Persian chars)
- Removes duplicates (content hashing)
- Generates SHA256 checksums
- Outputs: `datasets/checksums.txt`

**`scripts/train_cpu.py`**
- CPU-based fine-tuning (PyTorch CPU)
- Configurable hyperparameters (epochs, batch, lr, etc.)
- Saves model to `models/persian-chat/`
- Logs everything to `logs/train.log`
- Includes training metadata JSON

**`scripts/eval_cpu.py`**
- Evaluates on test set (`datasets/test.jsonl`)
- Calculates eval_loss and perplexity
- Identifies high-loss examples as errors
- Outputs: `logs/eval.json`, `logs/errors.txt`

**`scripts/validate_api.sh`**
- Tests `/api/chat` POST endpoint
- Validates streaming responses
- Checks temperature parameter (0.2-0.4)
- Tests error handling (invalid JSON)
- Verifies Persian text support (UTF-8)
- Checks logging (request/error logs)

**`scripts/ui_smoke.test.js`**
- Searches frontend codebase for patterns
- Validates: chat bubbles, RTL, typing indicator, auto-scroll
- Checks: dark/light toggle, keyboard shortcuts, ARIA
- Verifies: localStorage, toast notifications, animations
- Confirms: settings panel, API integration

### CI/CD

**`.github/workflows/ci.yaml`**
- 7 blocking jobs (dataset, train, eval, backend, frontend, acceptance, report)
- Parallel execution where possible
- Artifact upload (datasets, models, logs)
- Final acceptance gate (blocks merge on failure)
- Compliance report generation

### Deployment

**`nginx/nginx.conf`**
- Reverse proxy: `/api/*` → backend:3001
- Static serving: frontend build files
- SSL/HTTPS: Let's Encrypt configuration
- Security: headers, rate limiting, gzip
- WebSocket: streaming support

**`pm2/ecosystem.config.js`**
- Backend: cluster mode, 2 instances, auto-restart
- Frontend: single instance, auto-restart
- Logging: separate files, rotation
- Environment: production/development configs
- Deployment: hooks for CI/CD

### Documentation

**`docs/deployment.md`**
- Complete VPS deployment guide
- System requirements and setup
- Step-by-step installation
- SSL/HTTPS configuration
- Monitoring and maintenance
- Troubleshooting guide

**`report.md`**
- Implementation summary
- Dataset statistics
- Training/evaluation metrics
- API documentation
- UI features list
- Deployment verification
- Reproduction steps

**`ENFORCEMENT_README.md`**
- System architecture
- How enforcement works
- Usage instructions
- Debugging guide
- Acceptance criteria

**`ENFORCEMENT_SUMMARY.md`**
- Quick overview
- Key achievements
- File listing
- Success indicators

---

## ✅ Verification Checklist

Use this checklist to verify the enforcement system is complete:

- [ ] All 6 verification scripts exist and are executable
- [ ] `scripts/acceptance.sh` runs and validates everything
- [ ] CI workflow has 7 jobs configured
- [ ] Traceability matrix covers all 8 spec steps
- [ ] Nginx config includes reverse proxy and SSL
- [ ] PM2 config includes backend and frontend
- [ ] Deployment guide is complete
- [ ] Report template is comprehensive
- [ ] All documentation files exist

**Quick check:**
```bash
ls -lh scripts/ | grep -E "(acceptance|check_dataset|train_cpu|eval_cpu|validate_api|ui_smoke)"
ls -lh .github/workflows/ci.yaml
ls -lh docs/traceability.md docs/deployment.md
ls -lh nginx/nginx.conf pm2/ecosystem.config.js
ls -lh report.md ENFORCEMENT_*.md requirements.txt
```

---

## 🎯 Success Indicators

### When everything is working:

1. **All files exist:**
   ```bash
   $ ls -lh scripts/ docs/ nginx/ pm2/
   # All files present ✅
   ```

2. **Acceptance test passes:**
   ```bash
   $ bash scripts/acceptance.sh
   # 🎉 ALL CHECKS PASSED — Full implementation confirmed!
   ```

3. **CI is green:**
   - All 7 jobs pass ✅
   - Compliance report generated
   - Artifacts uploaded

4. **Traceability complete:**
   - Every requirement has evidence
   - All paths are valid

---

## 📞 Quick Help

### Where to find...

| Need | File |
|------|------|
| Full system docs | `ENFORCEMENT_README.md` |
| Quick summary | `ENFORCEMENT_SUMMARY.md` |
| File index | `ENFORCEMENT_INDEX.md` (this file) |
| Deployment steps | `docs/deployment.md` |
| Requirement mapping | `docs/traceability.md` |
| Implementation report | `report.md` |
| PR description | `PR_ENFORCEMENT_DESCRIPTION.md` |

### How to...

| Task | Command |
|------|---------|
| Run full validation | `bash scripts/acceptance.sh` |
| Check datasets | `python3 scripts/check_dataset.py` |
| Test API | `bash scripts/validate_api.sh` |
| Test UI | `node scripts/ui_smoke.test.js` |
| View CI config | `cat .github/workflows/ci.yaml` |
| Deploy to VPS | Follow `docs/deployment.md` |

---

**Last Updated:** 2025-10-09  
**Version:** 1.0  
**Status:** ✅ Complete
