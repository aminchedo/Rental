# Quick Start Guide - Enforcement System

**Get started with the spec enforcement system in 5 minutes.**

---

## What Is This?

A comprehensive enforcement system that **guarantees** every requirement from `IMPLEMENTATION_PROMPT.md` is implemented, verified, and gated in CI.

**Key Principle:** If ANY requirement is missing → CI fails → Merge blocked.

---

## 📁 What Was Created?

**18 files total:**

- ✅ **Traceability Matrix** (`docs/traceability.md`) - Requirement mapping
- ✅ **6 Verification Scripts** (`scripts/`) - Automated validation
- ✅ **CI Pipeline** (`.github/workflows/ci.yaml`) - 7 blocking jobs
- ✅ **Deployment Configs** (`nginx/`, `pm2/`) - Production-ready
- ✅ **6 Documentation Files** - Complete guides

---

## 🚀 Quick Commands

### 1. Verify System Integrity
```bash
# Check all files exist
ls -lh scripts/ docs/ nginx/ pm2/

# Verify scripts are executable
ls -lh scripts/*.{py,sh,js}
```

### 2. Run Acceptance Test (Will Fail Until Features Implemented)
```bash
bash scripts/acceptance.sh
```

**Expected Result:** Will fail because datasets/models don't exist yet. That's OK! The scripts are ready for when you implement features.

### 3. Review Traceability Matrix
```bash
cat docs/traceability.md
```

See the 1:1 mapping from spec requirements to implementation.

### 4. Check CI Configuration
```bash
cat .github/workflows/ci.yaml
```

7 jobs: dataset → train → eval → backend → frontend → **acceptance (gate)** → report

### 5. Review Documentation
```bash
# System overview
cat ENFORCEMENT_README.md

# Quick summary
cat ENFORCEMENT_SUMMARY.md

# File index
cat ENFORCEMENT_INDEX.md

# Deployment guide
cat docs/deployment.md
```

---

## 🔧 How to Use

### Developer Workflow:

1. **Implement a feature** (e.g., dataset preparation)
   ```bash
   # Create your implementation
   vim scripts/prepare_dataset.py
   ```

2. **Run verification script**
   ```bash
   python3 scripts/check_dataset.py
   # Should pass if datasets are valid
   ```

3. **Update traceability matrix**
   ```bash
   # Edit docs/traceability.md
   # Change status from "pending" to "done"
   # Add evidence paths
   ```

4. **Run acceptance test**
   ```bash
   bash scripts/acceptance.sh
   # Should pass when all requirements met
   ```

5. **Push and verify CI**
   ```bash
   git add .
   git commit -m "feat: implement dataset preparation"
   git push
   # Check GitHub Actions - should be green
   ```

### CI Workflow:

When you push code:
1. **GitHub Actions triggers** (`.github/workflows/ci.yaml`)
2. **7 jobs run** (dataset, train, eval, backend, frontend, acceptance, report)
3. **Acceptance job is the gate** - blocks merge if fails
4. **All green = ready to merge** ✅

---

## 📊 Verification Scripts

### Individual Script Usage:

```bash
# 1. Validate datasets
python3 scripts/check_dataset.py
# Expects: datasets/train.jsonl, datasets/test.jsonl
# Outputs: datasets/checksums.txt

# 2. Train model (smoke test)
python3 scripts/train_cpu.py --epochs 1 --batch_size 2
# Outputs: models/persian-chat/, logs/train.log

# 3. Evaluate model
python3 scripts/eval_cpu.py
# Expects: models/persian-chat/, datasets/test.jsonl
# Outputs: logs/eval.json, logs/errors.txt

# 4. Validate API
bash scripts/validate_api.sh
# Expects: Backend running on port 3001
# Tests: /api/chat endpoint, streaming, temperature

# 5. Validate UI
node scripts/ui_smoke.test.js
# Searches frontend code for required patterns
# Checks: RTL, a11y, dark mode, etc.

# 6. Run ALL (master checker)
bash scripts/acceptance.sh
# Runs everything above + checks artifacts
```

---

## 🔒 Enforcement Rules

1. ✅ **No placeholders** - All code must be real
2. ✅ **CPU-only** - Works on CPU-only VPS
3. ✅ **Evidence required** - Every requirement needs proof
4. ✅ **CI must pass** - Green CI = compliant
5. ❌ **Merge blocked** - If any check fails

---

## 📈 Progress Tracking

Track progress in `docs/traceability.md`:

```markdown
| Spec Step | Requirement | Implementation | Evidence | Status |
|-----------|-------------|----------------|----------|--------|
| 1.1 | Download datasets | script.py | logs/... | pending |
| 1.2 | Clean data | script.py | logs/... | in_progress |
| 1.3 | Normalize Persian | script.py | logs/... | done |
```

**Status values:** `pending` → `in_progress` → `done`

---

## 🎯 Success Criteria

System is complete when:

- [x] All files created (18 total) ✅
- [ ] All datasets prepared
- [ ] Model trained & evaluated
- [ ] Backend API implemented
- [ ] Frontend UI built
- [ ] All tests pass (`bash scripts/acceptance.sh` exits 0)
- [ ] CI pipeline green
- [ ] All traceability rows marked "done"
- [ ] Deployed to VPS

**Current status:** Enforcement system ready ✅, features pending ⏭️

---

## 🚀 Next Steps

### 1. Understand the System (5 min)
```bash
cat ENFORCEMENT_README.md | less
```

### 2. Review Spec Requirements (10 min)
```bash
cat IMPLEMENTATION_PROMPT.md | less
```

### 3. Check Traceability (5 min)
```bash
cat docs/traceability.md | less
```

### 4. Implement Features (main work)
- Follow `IMPLEMENTATION_PROMPT.md` steps 1-8
- Update `docs/traceability.md` as you go
- Run verification scripts after each step

### 5. Verify Compliance (ongoing)
```bash
bash scripts/acceptance.sh
```

### 6. Deploy (final step)
```bash
# Follow deployment guide
cat docs/deployment.md | less
```

---

## 📚 Key Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `ENFORCEMENT_README.md` | Full system docs | Understanding how it works |
| `ENFORCEMENT_SUMMARY.md` | Quick overview | Quick reference |
| `ENFORCEMENT_INDEX.md` | File index | Finding specific files |
| `QUICK_START.md` | This file | Getting started |
| `docs/traceability.md` | Requirement mapping | Tracking progress |
| `docs/deployment.md` | VPS deployment | Final deployment |
| `scripts/acceptance.sh` | Master checker | Validating everything |

---

## ❓ FAQ

**Q: Can I run acceptance.sh now?**  
A: Yes, but it will fail because datasets/models don't exist yet. Implement features first.

**Q: How do I know what to implement?**  
A: Follow `IMPLEMENTATION_PROMPT.md` steps 1-8. Use `docs/traceability.md` for detailed checklist.

**Q: What if a verification script fails?**  
A: Fix the issue, then re-run. Scripts provide detailed error messages.

**Q: How does CI work?**  
A: Push code → GitHub Actions runs 7 jobs → Acceptance job validates → Green = ready to merge.

**Q: Can I skip a requirement?**  
A: No. If ANY requirement is missing, CI fails and blocks merge. Zero tolerance.

**Q: Where are deployment configs?**  
A: `nginx/nginx.conf` and `pm2/ecosystem.config.js`. Full guide in `docs/deployment.md`.

---

## 🎉 You're Ready!

The enforcement system is **fully operational** and ready to guarantee compliance.

**Start here:**
1. Read `IMPLEMENTATION_PROMPT.md` (the spec)
2. Review `docs/traceability.md` (the checklist)
3. Implement features step-by-step
4. Run `scripts/acceptance.sh` to verify
5. Deploy with `docs/deployment.md`

**Remember:** The system makes it **impossible** to skip requirements. ✨

---

**Questions?** Check the documentation:
- System: `ENFORCEMENT_README.md`
- Summary: `ENFORCEMENT_SUMMARY.md`
- Index: `ENFORCEMENT_INDEX.md`
- Deployment: `docs/deployment.md`
