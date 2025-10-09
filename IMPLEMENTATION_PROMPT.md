# IMPLEMENTATION_PROMPT.md

## GOAL (MANDATORY)
Fine-tune a Persian GPT-style model on a CPU-only VPS using Hugging Face datasets,  
then build a production-grade chat application in Next.js (frontend) with Node.js/Express (backend).  
All outputs must be **REAL, fully runnable, and production-functional** — no pseudocode, no mockups, no placeholders, no exaggeration.  
Every command and instruction must be executable and tested end-to-end.

---

## Step 1: Dataset Preparation
Datasets to use (must download and preprocess):
- [ParsBERT-Fa-Sentiment-Twitter](https://huggingface.co/datasets/ParsBERT-Fa-Sentiment-Twitter)
- [PersianMind-v1.0](https://huggingface.co/datasets/PersianMind-v1.0)

Requirements:
- Clean datasets, remove noise, normalize Persian characters.
- Convert to JSONL with format:
  ```json
  {"messages":[
    {"role":"system","content":"..."},
    {"role":"user","content":"..."},
    {"role":"assistant","content":"..."}
  ]}
  ```

### Checklist (Dataset)
- [ ] Download datasets from Hugging Face.
- [ ] Inspect and clean: remove duplicates, offensive/irrelevant entries.
- [ ] Normalize Persian text (Arabic ↔ Persian chars).
- [ ] Convert into JSONL with system/user/assistant roles.
- [ ] Save in `/datasets/train.jsonl` and `/datasets/test.jsonl`.
- [ ] Provide SHA256 checksums of JSONL files.

---

## Step 2: Fine-tuning
- Use Hugging Face Transformers on CPU (`device=cpu`).
- Base model: GPT-2 small (or Persian pretrained checkpoint).
- Hyperparameters: epochs, batch size, lr, max_length, seed must be explicitly set.

### Checklist (Fine-tuning)
- [ ] Install PyTorch CPU + Transformers.
- [ ] Load base model and tokenizer.
- [ ] Run fine-tuning script with JSONL dataset.
- [ ] Save final model to `/models/persian-chat`.
- [ ] Provide raw training logs in `/logs/train.log`.

---

## Step 3: Model Evaluation
- Evaluate model on held-out set.
- Report metrics: eval_loss, perplexity.
- Generate confusion matrix / error analysis if applicable.

### Checklist (Evaluation)
- [ ] Run evaluation script with `/datasets/test.jsonl`.
- [ ] Report eval_loss + perplexity.
- [ ] Save outputs in `/logs/eval.json`.
- [ ] Provide error examples in `/logs/errors.txt`.

---

## Step 4: Backend (Node.js + Express)
- Expose `/api/chat` endpoint.
- Inject system prompt.
- Call fine-tuned model.
- Support **streaming responses**.
- Handle errors with descriptive messages.

### Checklist (Backend)
- [ ] Initialize Node.js + Express server.
- [ ] Create `/api/chat` POST route.
- [ ] Forward requests to fine-tuned model.
- [ ] Stream token-by-token output to client.
- [ ] Set temperature=0.2–0.4 (accuracy focus).
- [ ] Log all API requests and errors.
- [ ] Provide `scripts/validate_api.sh` with curl tests.

---

## Step 5: Frontend (Next.js + TailwindCSS)
- Build a **real, functional, user-friendly UI**.
- Core features:
  - Chat bubbles (user vs assistant).
  - Auto-scroll to latest message.
  - Typing indicator/spinner.
  - RTL support for Persian text.
  - Mobile-first responsive.
  - Dark/Light mode toggle.
  - Keyboard shortcuts (Enter=send, Shift+Enter=new line).
  - Accessibility: ARIA roles, screen reader labels.

### Checklist (Frontend)
- [ ] Setup Next.js with TailwindCSS.
- [ ] Build Chat UI with bubbles, RTL layout.
- [ ] Add spinner/typing indicator.
- [ ] Implement auto-scroll.
- [ ] Add dark/light toggle.
- [ ] Add keyboard shortcuts.
- [ ] Add accessibility attributes.

---

## Step 6: UI Enhancements
Beyond the base frontend, ensure **modern and user-friendly UX**:
- Animated message fade-in.
- Smooth scroll behavior.
- Persist chat history in localStorage.
- Toast notifications for errors (API down, invalid key).
- Multi-device testing (desktop + mobile).

### Checklist (UI Enhancements)
- [ ] Add animations for bubbles.
- [ ] Implement localStorage persistence.
- [ ] Add toast notifications.
- [ ] Test on multiple browsers.
- [ ] Verify full RTL rendering.

---

## Step 7: Settings Panel
- Must allow runtime configuration:
  - API Key
  - Model Endpoint
- Apply settings dynamically without reload.

### Checklist (Settings Panel)
- [ ] Add settings modal/page.
- [ ] Fields for API Key + endpoint.
- [ ] Store settings (state or cookie).
- [ ] Apply dynamically to API calls.

---

## Step 8: Deployment on VPS
- Deploy both model server (Node.js) and Next.js frontend.
- Use Nginx reverse proxy.
- Enable HTTPS.
- Optimize for CPU-only VPS.

### Checklist (Deployment)
- [ ] Install Node.js, Nginx, PM2.
- [ ] Deploy Express backend.
- [ ] Deploy Next.js frontend.
- [ ] Configure reverse proxy `/api/*`.
- [ ] Enable HTTPS (Let's Encrypt).
- [ ] Run `npm run build && npm start` successfully.
- [ ] Validate on desktop + mobile with real Persian input.

---

## STRICT ENFORCEMENT RULES
- **No pseudocode**: every snippet = real, runnable code.
- **No exaggeration**: reports must be factual, based on logs.
- **All checklists must pass** before marking complete.
- **Every command must run successfully** on CPU-only VPS (min spec: 4 vCPU, 8 GB RAM).
- **CI test pipeline** required: must run validation scripts for dataset, training, backend, and UI.
- **Final report (`report.md`) must include:**
  - Environment setup
  - Training/evaluation logs
  - Test results
  - Limitations & caveats
  - Reproduction steps

---

## FINAL ACCEPTANCE
A task is complete only when:
- [ ] All 8 step checklists are satisfied.
- [ ] Acceptance tests pass.
- [ ] CI pipeline is green.
- [ ] Logs and artifacts are delivered.
- [ ] Report with real metrics and outputs is included.
