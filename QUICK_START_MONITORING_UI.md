# Quick Start — Monitoring UI

**Version**: 2.0.0  
**Last Updated**: 2025-10-09

This guide will help you activate and use the new Monitoring UI in under 5 minutes.

---

## ⚡ Quick Setup

### 1. Install Dependencies

```bash
# Navigate to project root
cd /workspace

# Install Playwright (for testing)
npm install

# Install client dependencies
cd client
npm install
```

### 2. Activate the Monitoring UI

Edit `/workspace/client/src/main.tsx`:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx'           // OLD: Legacy app
import MonitoringApp from './MonitoringApp.tsx'  // NEW: Monitoring UI
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MonitoringApp />
  </React.StrictMode>,
)
```

### 3. Start Development Server

```bash
# From /workspace/client
npm run dev
```

**Open**: `http://localhost:3000`

---

## 🎨 What You'll See

### Pages Available

1. **Home** (`/`) — Dashboard with KPIs and quick actions
2. **Experiments** (`/experiments`) — Training runs table with detail drawer
3. **Live Monitor** (`/monitor`) — Real-time metrics and streaming logs
4. **Playground** (`/playground`) — Interactive chat with token visualization
5. **Settings** (`/settings`) — Theme, language, API config

### Navigation

- **Sidebar**: Right-side navigation (RTL layout)
- **Theme Toggle**: Dark/Light mode at bottom of sidebar
- **Mobile**: Hamburger menu on small screens

---

## 🧪 Run Tests

```bash
# From project root
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run in UI mode (interactive)
npm run test:e2e:report   # View HTML report
```

---

## 🎯 Key Features to Try

### 1. Experiments Page

- Sort table by clicking column headers
- Search for experiments
- Click on a row to open detail drawer
- View metrics, charts, and timeline

### 2. Live Monitor

- Watch metrics update in real-time
- See logs streaming in terminal view
- Filter logs by level (info, warn, error, debug)
- Export logs to JSON

### 3. Playground

- Type a message and send
- Click on messages to inspect tokens
- Adjust settings (temperature, max tokens, etc.)
- Toggle retrieval on/off

### 4. Settings

- Switch theme (light/dark)
- Change language (Persian/English)
- Configure API endpoint
- Set alert thresholds
- Export/import settings

---

## 🌍 Language & Direction

The UI defaults to **Persian (RTL)** but automatically switches to **LTR** for English.

**To change language:**

1. Go to Settings (`/settings`)
2. Select "Appearance" tab
3. Change "Language" dropdown
4. Save settings

---

## 🎨 Customization

### Design Tokens

All design values are in `/workspace/client/src/config/tokens.ts`

```typescript
import { tokens } from '@/config/tokens';

// Colors
tokens.colors.primary[500]  // '#0ea5e9'

// Typography
tokens.typography.fontSize.base  // ['16px', { lineHeight: '1.6' }]

// Spacing
tokens.spacing[4]  // '16px'
```

### Components

Import from the component library:

```tsx
import { Button, Card, Table, Badge } from '@/components/ui';
import { MetricCard, LiveLogs } from '@/components/monitoring';
```

---

## 📚 Documentation

- **UI Guide**: `/workspace/docs/UI_GUIDE.md` (comprehensive reference)
- **Monitoring README**: `/workspace/MONITORING_UI_README.md` (feature overview)
- **Summary**: `/workspace/UI_ENHANCEMENT_SUMMARY.md` (implementation details)

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Missing Fonts

The UI uses **Vazirmatn** for Persian text. If it's not loading:

1. Check internet connection (loaded from CDN)
2. Or add to `client/index.html`:

```html
<link href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.0/Vazirmatn-font-face.css" rel="stylesheet">
```

### Dark Mode Not Working

Ensure TailwindCSS dark mode is configured in `tailwind.config.js`:

```js
module.exports = {
  darkMode: 'class',  // Must be 'class' strategy
  // ...
}
```

### Tests Failing

```bash
# Make sure dev server is running
cd client && npm run dev

# In another terminal, run tests
cd /workspace
npx playwright test
```

---

## 🚀 Next Steps

1. **Integrate with Backend**: Replace mock data with real API calls
2. **Customize Theme**: Edit design tokens to match your brand
3. **Add More Pages**: Use the component library to build custom views
4. **Deploy**: Run `npm run build:client` and serve the `dist/` folder

---

## 📞 Need Help?

- **Read the Docs**: `/workspace/docs/UI_GUIDE.md`
- **Check Examples**: Look at existing pages in `/workspace/client/src/pages/`
- **Run Tests**: See `/workspace/tests/e2e/monitoring.spec.ts` for usage patterns

---

## ✅ Quick Checklist

- [ ] Installed dependencies (`npm install`)
- [ ] Activated MonitoringApp in `main.tsx`
- [ ] Started dev server (`npm run dev`)
- [ ] Opened `http://localhost:3000`
- [ ] Explored all 5 pages
- [ ] Tried dark/light mode toggle
- [ ] Changed language to English and back to Persian
- [ ] Ran E2E tests (`npm run test:e2e`)
- [ ] Read UI_GUIDE.md

---

**You're all set! 🎉**

The Monitoring UI is now active and ready to use. Start exploring the dashboard and customize it to fit your needs.

**Happy Monitoring!** 📊
