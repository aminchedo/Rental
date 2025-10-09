# Python to TypeScript Migration Inventory

**Migration Date:** 2025-10-09  
**Purpose:** Enforce TypeScript-only backend and scripts per Phase P specification

## Python Files Found

### Active Scripts (require migration)

| File Path | Purpose | Lines | TypeScript Equivalent | Status |
|-----------|---------|-------|----------------------|--------|
| `scripts/download_datasets.py` | Download and prepare Persian datasets from Hugging Face | 187 | `scripts/download_datasets.ts` | ⏳ Pending |
| `scripts/check_dataset.py` | Validate JSONL schema, normalization, checksums | 232 | `scripts/check_dataset.ts` | ⏳ Pending |
| `scripts/train_cpu.py` | CPU-based fine-tuning for Persian chat model | 241 | `scripts/train_cpu.ts` | ⏳ Pending |
| `scripts/eval_cpu.py` | Model evaluation on test set | 240 | `scripts/eval_cpu.ts` | ✅ Already exists |
| `scripts/fetch_google_data.ts` | Google data ingestion (already TypeScript) | N/A | N/A | ✅ Already TS |

### Non-project Python Modules (separate from spec)

| File Path | Purpose | Action |
|-----------|---------|--------|
| `s2r_module/__init__.py` | S2R retrieval module | Archive (not part of Persian chat spec) |
| `s2r_module/config.py` | S2R configuration | Archive (not part of Persian chat spec) |
| `s2r_module/example_usage.py` | S2R example usage | Archive (not part of Persian chat spec) |
| `s2r_module/s2r_retrieval_module.py` | S2R main module | Archive (not part of Persian chat spec) |
| `s2r_module/test_module.py` | S2R tests | Archive (not part of Persian chat spec) |

## Migration Plan

### Phase 1: TypeScript Rewrites
- [x] `scripts/eval_cpu.ts` - Already exists
- [ ] `scripts/download_datasets.ts` - Create TypeScript version
- [ ] `scripts/check_dataset.ts` - Create TypeScript version
- [ ] `scripts/train_cpu.ts` - Create TypeScript version

### Phase 2: Archive Python Files
- [ ] Move all Python scripts to `archive/python/scripts/`
- [ ] Move s2r_module to `archive/python/s2r_module/`
- [ ] Update `.gitignore` if needed

### Phase 3: CI Enforcement
- [ ] Add CI check: fail if `*.py` exists outside `archive/python/`
- [ ] Update acceptance.sh to verify TypeScript-only environment
- [ ] Add lint/typecheck to CI

### Phase 4: Traceability Update
- [ ] Update `docs/traceability.md` to reference TypeScript files
- [ ] Ensure all implementation paths point to `.ts` files
- [ ] Verify acceptance criteria

## Notes

- **Backend** is already TypeScript-only (`backend/src/**/*.ts`)
- **Frontend** uses TypeScript/React
- Python dependencies (`requirements.txt`) will be kept for model training/evaluation (PyTorch, Transformers)
- Only **scripts** need TypeScript migration to ensure unified Node.js backend

## Acceptance Criteria

✅ Migration complete when:
1. All scripts have TypeScript equivalents
2. TypeScript scripts produce identical outputs to Python versions
3. All Python files archived to `archive/python/`
4. CI fails if `.py` found outside archive
5. Traceability updated with TypeScript paths
6. Acceptance tests pass with TypeScript scripts
