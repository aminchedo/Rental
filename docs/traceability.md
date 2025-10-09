# Traceability Matrix — Spec Compliance

This document maps every requirement from `IMPLEMENTATION_PROMPT.md` to its implementation and verification evidence.

## Step 1: Dataset Preparation

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 1.1 | Download datasets from Hugging Face | `scripts/check_dataset.py` downloads datasets | `/logs/dataset_download.log` | pending |
| 1.2 | Inspect and clean: remove duplicates, offensive/irrelevant entries | `scripts/check_dataset.py` deduplication logic | `/logs/dataset_stats.json` | pending |
| 1.3 | Normalize Persian text (Arabic ↔ Persian chars) | `scripts/check_dataset.py` normalization function | `/datasets/train.jsonl` + `/datasets/test.jsonl` | pending |
| 1.4 | Convert into JSONL with system/user/assistant roles | `scripts/check_dataset.py` JSONL conversion | `/datasets/train.jsonl` + `/datasets/test.jsonl` | pending |
| 1.5 | Save in `/datasets/train.jsonl` and `/datasets/test.jsonl` | `scripts/check_dataset.py` output | `ls -lh datasets/*.jsonl` | pending |
| 1.6 | Provide SHA256 checksums of JSONL files | `scripts/check_dataset.py` checksum generation | `/datasets/checksums.txt` | pending |

## Step 2: Fine-tuning

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 2.1 | Install PyTorch CPU + Transformers | `requirements.txt` + setup instructions | `pip freeze > /logs/pip_freeze.txt` | pending |
| 2.2 | Load base model and tokenizer | `scripts/train_cpu.py` model loading | `/logs/train.log` (model loaded message) | pending |
| 2.3 | Run fine-tuning script with JSONL dataset | `python scripts/train_cpu.py --epochs 3 --batch_size 4` | `/logs/train.log` | pending |
| 2.4 | Save final model to `/models/persian-chat` | `scripts/train_cpu.py` model.save_pretrained() | `ls -lh models/persian-chat/` | pending |
| 2.5 | Provide raw training logs in `/logs/train.log` | Training script with tee logging | `cat /logs/train.log` | pending |

## Step 3: Model Evaluation

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 3.1 | Run evaluation script with `/datasets/test.jsonl` | `python scripts/eval_cpu.py --data datasets/test.jsonl` | `/logs/eval.json` | pending |
| 3.2 | Report eval_loss + perplexity | `scripts/eval_cpu.py` metrics calculation | `/logs/eval.json` (contains eval_loss, perplexity) | pending |
| 3.3 | Save outputs in `/logs/eval.json` | Eval script JSON output | `cat /logs/eval.json` | pending |
| 3.4 | Provide error examples in `/logs/errors.txt` | Eval script error analysis | `cat /logs/errors.txt` | pending |

## Step 4: Backend (Node.js + Express)

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 4.1 | Initialize Node.js + Express server | `backend/package.json` + `backend/server.js` | `npm --prefix backend ls` | pending |
| 4.2 | Create `/api/chat` POST route | `backend/server.js` route handler | `curl -X POST http://localhost:3001/api/chat` | pending |
| 4.3 | Forward requests to fine-tuned model | `backend/server.js` model inference | `/logs/api_requests.log` | pending |
| 4.4 | Stream token-by-token output to client | `backend/server.js` streaming logic | `scripts/validate_api.sh` streaming test | pending |
| 4.5 | Set temperature=0.2–0.4 (accuracy focus) | `backend/server.js` generation params | Code inspection or API response headers | pending |
| 4.6 | Log all API requests and errors | `backend/server.js` logging middleware | `/logs/api_requests.log` + `/logs/api_errors.log` | pending |
| 4.7 | Provide `scripts/validate_api.sh` with curl tests | `scripts/validate_api.sh` | `bash scripts/validate_api.sh` exit code 0 | pending |

## Step 5: Frontend (Next.js + TailwindCSS)

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 5.1 | Setup Next.js with TailwindCSS | `frontend/package.json` + `frontend/tailwind.config.js` | `npm --prefix frontend run build` | pending |
| 5.2 | Build Chat UI with bubbles, RTL layout | `frontend/components/ChatBubble.tsx` | Visual inspection + `grep -r "dir=" frontend/` | pending |
| 5.3 | Add spinner/typing indicator | `frontend/components/TypingIndicator.tsx` | `grep -r "typing" frontend/` | pending |
| 5.4 | Implement auto-scroll | `frontend/components/ChatContainer.tsx` | `grep -r "scrollIntoView" frontend/` | pending |
| 5.5 | Add dark/light toggle | `frontend/components/ThemeToggle.tsx` | `grep -r "dark:" frontend/` | pending |
| 5.6 | Add keyboard shortcuts | `frontend/hooks/useKeyboardShortcuts.ts` | `grep -r "onKeyDown" frontend/` | pending |
| 5.7 | Add accessibility attributes | ARIA labels in components | `grep -r "aria-" frontend/` | pending |

## Step 6: UI Enhancements

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 6.1 | Add animations for bubbles | CSS/Tailwind animations | `grep -r "animate-" frontend/` or `@keyframes` | pending |
| 6.2 | Implement localStorage persistence | `frontend/utils/storage.ts` | `grep -r "localStorage" frontend/` | pending |
| 6.3 | Add toast notifications | `frontend/components/Toast.tsx` | `grep -r "toast" frontend/` | pending |
| 6.4 | Test on multiple browsers | Manual testing checklist | `/logs/browser_test_results.txt` | pending |
| 6.5 | Verify full RTL rendering | Visual + automated test | `scripts/ui_smoke.test.js` RTL assertion | pending |

## Step 7: Settings Panel

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 7.1 | Add settings modal/page | `frontend/components/SettingsModal.tsx` | `grep -r "Settings" frontend/` | pending |
| 7.2 | Fields for API Key + endpoint | Settings form inputs | Code inspection of SettingsModal | pending |
| 7.3 | Store settings (state or cookie) | `frontend/context/SettingsContext.tsx` | `grep -r "apiKey" frontend/` | pending |
| 7.4 | Apply dynamically to API calls | API client with dynamic config | Code inspection of API client | pending |

## Step 8: Deployment on VPS

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 8.1 | Install Node.js, Nginx, PM2 | Deployment documentation | `docs/deployment.md` installation steps | pending |
| 8.2 | Deploy Express backend | PM2 ecosystem config | `pm2/ecosystem.config.js` | pending |
| 8.3 | Deploy Next.js frontend | PM2 ecosystem config | `pm2/ecosystem.config.js` | pending |
| 8.4 | Configure reverse proxy `/api/*` | Nginx configuration | `nginx/nginx.conf` | pending |
| 8.5 | Enable HTTPS (Let's Encrypt) | Certbot instructions | `docs/deployment.md` HTTPS section | pending |
| 8.6 | Run `npm run build && npm start` successfully | Build scripts in package.json | CI workflow success | pending |
| 8.7 | Validate on desktop + mobile with real Persian input | Manual validation checklist | `/logs/deployment_validation.txt` | pending |

## Final Acceptance Criteria

| Spec Step | Requirement | Implementation (path/command) | Evidence (log/artifact) | Status |
|-----------|-------------|-------------------------------|------------------------|--------|
| 9.1 | All 8 step checklists are satisfied | This traceability matrix | All rows marked "done" | pending |
| 9.2 | Acceptance tests pass | `bash scripts/acceptance.sh` | Exit code 0 + green output | pending |
| 9.3 | CI pipeline is green | `.github/workflows/ci.yaml` | GitHub Actions all green | pending |
| 9.4 | Logs and artifacts are delivered | All `/logs/*` and `/models/*` files | `find logs models -type f` | pending |
| 9.5 | Report with real metrics and outputs is included | `report.md` | `cat report.md` | pending |

---

## How to Update This Matrix

When implementing a feature:
1. Update the **Status** column to `in_progress`
2. Complete the implementation
3. Verify the evidence exists (run command, check file)
4. Update **Status** to `done`
5. Commit changes

**CI Enforcement**: The `scripts/acceptance.sh` script verifies all evidence artifacts exist and fails if any are missing.
