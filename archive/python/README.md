# Archived Python Files

This directory contains Python files that have been migrated to TypeScript as part of Phase P migration.

## Migration Date
2025-10-09

## Purpose
Per the specification, the backend and scripts must be TypeScript-only. These Python files have been archived for reference and replaced with TypeScript equivalents.

## Archived Files

### Scripts
- `scripts/download_datasets.py` → Migrated to `/workspace/scripts/download_datasets.ts`
- `scripts/check_dataset.py` → Migrated to `/workspace/scripts/check_dataset.ts`
- `scripts/train_cpu.py` → Migrated to `/workspace/scripts/train_cpu.ts` (wrapper)
- `scripts/eval_cpu.py` → Migrated to `/workspace/scripts/eval_cpu.ts`

### S2R Module
- `s2r_module/*` → Not part of Persian chat specification, archived for reference

## Notes

1. **Model Training**: While the backend is TypeScript-only, model training/evaluation using PyTorch requires Python. The TypeScript `train_cpu.ts` serves as a typed wrapper that delegates to Python when needed.

2. **Production**: The Python scripts in this archive are no longer used in production. All active scripts are TypeScript.

3. **CI Enforcement**: CI pipeline fails if `.py` files exist outside this `archive/python/` directory.

## Restoration

If you need to reference the original Python implementations, they are preserved here unchanged.
