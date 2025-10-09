# Spec Enforcement System - Implementation Verification Framework

This document describes the comprehensive enforcement system that ensures **every requirement** from the implementation specification is properly implemented, verified, and gated in CI.

---

## 🎯 Overview

This enforcement framework provides:
1. **Traceability Matrix** - Maps every spec requirement to implementation and evidence
2. **Verification Scripts** - Automated checks for all components
3. **Acceptance Tests** - Master script that validates full compliance
4. **CI Gates** - GitHub Actions workflow that blocks merge on failures
5. **Deployment Artifacts** - Production-ready configurations
6. **Comprehensive Report** - Documentation of entire implementation

---

## 📁 System Components

### 1. Traceability Matrix
**File:** `docs/traceability.md`

A comprehensive table mapping:
- Spec Step → Requirement → Implementation → Evidence → Status

Covers all 8 implementation steps plus final acceptance criteria.

**Update Process:**
1. Mark task as `in_progress` when starting
2. Implement the feature
3. Verify evidence exists
4. Mark as `done`

### 2. Verification Scripts

#### `scripts/check_dataset.py`
- Validates JSONL schema
- Performs Persian normalization
- Removes duplicates
- Generates SHA256 checksums
- Output: `datasets/checksums.txt`, validation report

#### `scripts/train_cpu.py`
- CPU-based fine-tuning
- Configurable hyperparameters
- Saves model to `models/persian-chat/`
- Logs to `logs/train.log`

#### `scripts/eval_cpu.py`
- Evaluates on test set
- Calculates eval_loss and perplexity
- Outputs `logs/eval.json` and `logs/errors.txt`
- Error analysis included

#### `scripts/validate_api.sh`
- Tests `/api/chat` endpoint
- Validates streaming responses
- Checks temperature parameter (0.2-0.4)
- Tests error handling
- Verifies Persian text support
- Exit code 0 = success, 1 = failure

#### `scripts/ui_smoke.test.js`
- Searches frontend codebase for required patterns
- Validates:
  - Chat bubbles
  - RTL support
  - Typing indicator
  - Auto-scroll
  - Dark/light toggle
  - Keyboard shortcuts
  - ARIA attributes
  - localStorage persistence
  - Toast notifications
  - Animations
  - Settings panel
- Exit code 0 = success, 1 = failure

#### `scripts/acceptance.sh` (Master Checker)
- Runs ALL verification scripts
- Checks ALL file artifacts
- Validates deployment configs
- Verifies documentation
- **Blocks if ANY requirement is missing**
- Exit code 0 = full compliance, 1 = failure

---

## 3. CI Pipeline

**File:** `.github/workflows/ci.yaml`

### Jobs:

1. **dataset**
   - Validates JSONL files
   - Checks schema and checksums
   - Uploads dataset artifacts

2. **train** (smoke test)
   - Runs 1 epoch training on CPU
   - Verifies model outputs
   - Uploads training logs

3. **eval**
   - Evaluates model on test set
   - Checks for eval_loss and perplexity
   - Fails if metrics are missing/invalid

4. **backend**
   - Verifies API implementation
   - Checks for required endpoints
   - Tests streaming support (optional)

5. **frontend**
   - Builds frontend
   - Runs UI smoke tests
   - Validates all UI requirements

6. **acceptance** ⭐ (Final Gate)
   - Runs full acceptance.sh
   - Validates traceability matrix
   - Checks deployment artifacts
   - Verifies report.md
   - **BLOCKS merge if any failures**

7. **compliance-report**
   - Generates summary report
   - Uploads as CI artifact

### CI Enforcement Rules:
- ❌ No force-push
- ❌ No history rewrite
- ✅ Real code only (no placeholders)
- ✅ CPU-only compatibility
- ✅ Reproducible from clean clone
- ✅ All jobs must be green to merge

---

## 4. Deployment Artifacts

### `nginx/nginx.conf`
- Reverse proxy for `/api/*`
- Static file serving for frontend
- SSL/HTTPS configuration (Let's Encrypt)
- Gzip compression
- Security headers
- Rate limiting
- WebSocket support for streaming

### `pm2/ecosystem.config.js`
- Backend API process (cluster mode)
- Frontend server process
- Auto-restart configuration
- Log rotation
- Memory limits
- Environment variables
- Deployment hooks

---

## 5. Documentation

### `docs/traceability.md`
Complete requirement-to-implementation mapping with evidence links.

### `docs/deployment.md`
Step-by-step VPS deployment guide:
- System setup
- Dependencies installation
- Application configuration
- SSL setup
- PM2 process management
- Nginx configuration
- Monitoring & maintenance
- Troubleshooting

### `report.md`
Comprehensive implementation report:
- Environment setup
- Dataset statistics
- Training/evaluation metrics
- API documentation
- UI features
- Deployment configuration
- Verification results
- Reproduction steps

### `IMPLEMENTATION_PROMPT.md`
Original specification (source of truth).

---

## 🚀 Usage

### Running Verification Locally

#### 1. Verify Datasets
```bash
python3 scripts/check_dataset.py
```

#### 2. Train Model (smoke test)
```bash
python3 scripts/train_cpu.py --epochs 1 --batch_size 2
```

#### 3. Evaluate Model
```bash
python3 scripts/eval_cpu.py --data datasets/test.jsonl --model models/persian-chat
```

#### 4. Validate API
```bash
# Start backend first
npm --prefix backend start &

# Run validation
bash scripts/validate_api.sh
```

#### 5. Validate UI
```bash
node scripts/ui_smoke.test.js
```

#### 6. Run Full Acceptance Test
```bash
bash scripts/acceptance.sh
```

### CI Integration

The CI workflow runs automatically on:
- Push to `main`, `develop`, or `cursor/**` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**To trigger manually:**
```bash
# Via GitHub Actions UI
# Go to Actions → Spec Compliance CI → Run workflow
```

---

## ✅ Acceptance Criteria

The implementation is considered **complete** when:

1. ✅ All dataset files exist and pass validation
2. ✅ Model is trained and saved to `models/persian-chat/`
3. ✅ Evaluation metrics exist in `logs/eval.json`
4. ✅ Backend API implements `/api/chat` with streaming
5. ✅ Frontend has all required UI features
6. ✅ Settings panel allows API key/endpoint configuration
7. ✅ Deployment artifacts (Nginx, PM2) are present
8. ✅ Documentation is complete (`docs/traceability.md`, `report.md`)
9. ✅ All verification scripts pass
10. ✅ `scripts/acceptance.sh` exits with code 0
11. ✅ CI pipeline is fully green
12. ✅ Every row in traceability matrix is marked `done`

**Enforcement:** If ANY criterion fails, CI blocks the merge.

---

## 📊 Traceability Updates

### To update the traceability matrix:

1. Open `docs/traceability.md`
2. Find the requirement row
3. Update the **Status** column:
   - `pending` → `in_progress` → `done`
4. Verify **Evidence** exists (file/log/command)
5. Commit changes

Example:
```markdown
| 1.5 | Save in /datasets/train.jsonl | scripts/check_dataset.py | ls -lh datasets/*.jsonl | done |
```

---

## 🔍 Debugging Failures

### If `scripts/acceptance.sh` fails:

1. **Check the error message** - it will tell you which file/check failed
2. **Run individual scripts** to isolate the issue:
   ```bash
   python3 scripts/check_dataset.py
   bash scripts/validate_api.sh
   node scripts/ui_smoke.test.js
   ```
3. **Verify artifacts exist:**
   ```bash
   ls -lh datasets/
   ls -lh models/persian-chat/
   ls -lh logs/
   ```
4. **Check traceability matrix** - ensure all evidence paths are correct
5. **Review CI logs** - GitHub Actions provides detailed output

### Common Issues:

| Issue | Solution |
|-------|----------|
| Dataset files missing | Run dataset preparation script or create dummy files |
| Model not found | Run `scripts/train_cpu.py` |
| API validation fails | Ensure backend is running on port 3001 |
| UI smoke test fails | Check if frontend directory exists (`frontend/` or `client/`) |
| Nginx config missing | Copy from template: `nginx/nginx.conf` |

---

## 🔄 Workflow

### Developer Workflow:
1. Implement feature according to spec
2. Run relevant verification script
3. Update `docs/traceability.md` (mark as `done`)
4. Commit changes
5. Push to branch
6. CI automatically validates
7. If green, PR is ready for merge
8. If red, fix issues and push again

### CI Workflow:
1. Code pushed to branch
2. CI workflow triggered
3. All jobs run in parallel (where possible)
4. `acceptance` job runs last (depends on others)
5. If all green → PR can be merged
6. If any red → PR blocked, developer must fix

---

## 📦 Deliverables Checklist

Before marking the project as complete, ensure:

- [ ] `docs/traceability.md` - All rows marked `done`
- [ ] `scripts/check_dataset.py` - Executable, passes
- [ ] `scripts/train_cpu.py` - Executable, trains model
- [ ] `scripts/eval_cpu.py` - Executable, generates metrics
- [ ] `scripts/validate_api.sh` - Executable, passes
- [ ] `scripts/ui_smoke.test.js` - Executable, passes
- [ ] `scripts/acceptance.sh` - Executable, passes
- [ ] `.github/workflows/ci.yaml` - All jobs green
- [ ] `nginx/nginx.conf` - Present and valid
- [ ] `pm2/ecosystem.config.js` - Present and valid
- [ ] `docs/deployment.md` - Complete deployment guide
- [ ] `report.md` - Comprehensive implementation report
- [ ] `requirements.txt` - Python dependencies listed
- [ ] All logs/artifacts exist in expected locations
- [ ] CI pipeline passes end-to-end

---

## 🚫 Hard Rules (Enforced by CI)

1. **No Placeholders** - All code must be real and runnable
2. **No Mockups** - Everything must be production-functional
3. **CPU Compatibility** - Must work on CPU-only VPS
4. **Reproducibility** - Clean clone → working app
5. **Evidence Required** - Every requirement must have verifiable evidence
6. **CI Must Pass** - Green CI is mandatory for merge

---

## 📞 Support

- **Traceability Issues:** Check `docs/traceability.md`
- **Script Failures:** Run with `-x` flag for debug output
- **CI Failures:** Check GitHub Actions logs
- **Deployment Issues:** See `docs/deployment.md`

---

## 🎉 Success Criteria

When you see this output from `scripts/acceptance.sh`:

```
======================================================================
                         FINAL SUMMARY
======================================================================

🎉 ALL CHECKS PASSED — Full implementation confirmed!

✅ All datasets validated
✅ Model trained and evaluated
✅ Backend API implemented
✅ Frontend UI complete
✅ Deployment artifacts ready
✅ Documentation complete

The implementation is compliant with the specification.
Ready for deployment! 🚀
```

**Congratulations!** The implementation is complete and verified. ✨

---

**Version:** 1.0  
**Created:** 2025-10-09  
**Maintained by:** Development Team
