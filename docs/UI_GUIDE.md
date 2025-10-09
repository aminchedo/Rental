# UI Guide — LLM Monitoring Application

**Version**: 2.0.0  
**Last Updated**: 2025-10-09

---

## Table of Contents

1. [Overview](#overview)
2. [Design System](#design-system)
3. [Component Library](#component-library)
4. [Pages & Layouts](#pages--layouts)
5. [Accessibility](#accessibility)
6. [Internationalization](#internationalization)
7. [Performance](#performance)
8. [Testing](#testing)
9. [Usage Examples](#usage-examples)

---

## Overview

This UI is built with **monitoring-first**, **user-friendly**, and **highly flexible** principles. It enables users to track LLM training/evaluation, compare experiments, tune parameters, and inspect model behavior in real-time.

### Technology Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4 (with custom tokens)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Notifications**: react-hot-toast

### Key Features

✅ **Real-time Monitoring**: Streaming logs, live metrics, alerts  
✅ **Experiments Tracking**: Sortable table with detail drawers  
✅ **Interactive Playground**: Token visualization, context inspector  
✅ **RTL Support**: Persian (fa-IR) as default language  
✅ **Dark/Light Modes**: System preference detection  
✅ **Accessibility**: WCAG 2.1 AA compliance targets  
✅ **Responsive Design**: Mobile-first approach  
✅ **Smooth Loading**: Skeleton screens, optimistic UI  

---

## Design System

### Design Tokens

All design values are centralized in `/client/src/config/tokens.ts`.

#### Color Palette

```typescript
// Primary brand
colors.primary[500] = '#0ea5e9'

// Semantic colors
colors.success.DEFAULT = '#059669'
colors.warning.DEFAULT = '#f59e0b'
colors.danger.DEFAULT = '#dc2626'
colors.info.DEFAULT = '#2563eb'

// Dark mode
colors.dark.bg.primary = '#0f172a'
colors.dark.text.primary = '#f1f5f9'

// Light mode
colors.light.bg.primary = '#ffffff'
colors.light.text.primary = '#0f172a'
```

#### Typography

- **Font Family**: Vazirmatn (Persian), system fallback
- **Base Size**: 16px minimum (accessibility requirement)
- **Line Height**: 1.5–1.7 for body text
- **Letter Spacing**: ≤0.2px for headings

```typescript
typography.fontSize.base = ['16px', { lineHeight: '1.6' }]
typography.fontFamily.sans = 'Vazirmatn, -apple-system, ...'
```

#### Spacing Scale

Based on 4/8px grid:

```typescript
spacing[1] = '4px'
spacing[2] = '8px'
spacing[4] = '16px'
spacing[6] = '24px'
spacing[8] = '32px'
```

#### Transitions

```typescript
transitions.duration.fast = '120ms'
transitions.duration.base = '200ms'
transitions.easing.ease = 'cubic-bezier(0.4, 0, 0.2, 1)'
```

---

## Component Library

All components are in `/client/src/components/ui/`.

### Core Components

#### Button

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="base" icon={<Icon />} loading={false}>
  Submit
</Button>
```

**Props**:
- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost'`
- `size`: `'sm' | 'base' | 'lg'` (min 44px height)
- `loading`: Shows spinner, disables interaction
- `fullWidth`: Expands to container width
- `icon`: React node (auto-positioned)

#### Input

```tsx
import { Input } from '@/components/ui';

<Input
  label="Username"
  error="Required field"
  helperText="Enter your username"
  icon={<SearchIcon />}
  fullWidth
/>
```

**Accessibility**: Auto-generated IDs, aria-describedby, aria-invalid.

#### Card

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card variant="elevated" padding="base" hover>
  <CardHeader title="Title" subtitle="Subtitle" action={<Button />} />
  <CardContent>Content here</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

#### Modal

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm"
  size="md"
  footer={<Button>OK</Button>}
>
  Modal content
</Modal>
```

**Features**: ESC to close, focus trap, backdrop click handling, body scroll lock.

#### Table

```tsx
import { Table, TableColumn } from '@/components/ui';

const columns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', render: (val) => <strong>{val}</strong> },
];

<Table
  columns={columns}
  data={data}
  sortBy="id"
  sortDirection="asc"
  onSort={handleSort}
  selectable
  selectedRows={selectedRows}
  onSelectionChange={setSelectedRows}
/>
```

#### Skeleton

```tsx
import { Skeleton, SkeletonTable } from '@/components/ui';

// Text skeleton
<Skeleton width="80%" />

// Table skeleton
<SkeletonTable rows={5} cols={4} />
```

### Monitoring Widgets

#### MetricCard

```tsx
import { MetricCard } from '@/components/monitoring/MetricCard';

<MetricCard
  title="Throughput"
  value={145}
  unit="req/s"
  trend="up"
  trendValue="+12%"
  status="success"
  icon={<ZapIcon />}
/>
```

#### LiveLogs

```tsx
import { LiveLogs } from '@/components/monitoring/LiveLogs';

<LiveLogs
  logs={logs}
  maxLogs={1000}
  autoScroll={true}
  onClear={() => setLogs([])}
  onExport={handleExport}
/>
```

#### AlertPanel

```tsx
import { AlertPanel } from '@/components/monitoring/AlertPanel';

<AlertPanel
  alerts={alerts}
  rules={alertRules}
  onAcknowledge={handleAck}
  onDismiss={handleDismiss}
/>
```

#### RunTimeline

```tsx
import { RunTimeline } from '@/components/monitoring/RunTimeline';

<RunTimeline
  runId="run-001"
  phases={[
    { id: '1', name: 'Training', status: 'completed', duration: 1200000 },
  ]}
/>
```

---

## Pages & Layouts

### MonitoringLayout

Main layout with sidebar navigation, theme toggle, and responsive design.

**Location**: `/client/src/components/MonitoringLayout.tsx`

```tsx
import MonitoringLayout from '@/components/MonitoringLayout';

<MonitoringLayout>
  {children}
</MonitoringLayout>
```

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Dashboard with KPIs, recent runs, quick actions |
| Experiments | `/experiments` | Table view with detail drawer for runs |
| Live Monitor | `/monitor` | Real-time metrics, streaming logs, alerts |
| Playground | `/playground` | Chat interface with token visualization |
| Settings | `/settings` | Theme, language, API config, alert thresholds |

---

## Accessibility

### WCAG 2.1 AA Compliance

✅ **Color Contrast**: ≥4.5:1 for text on backgrounds  
✅ **Interactive Targets**: Minimum 44×44px  
✅ **Keyboard Navigation**: Full support (Tab, Arrow keys, Enter, ESC)  
✅ **Focus Indicators**: Visible outlines on all focusable elements  
✅ **ARIA Attributes**: Labels, roles, states on interactive elements  
✅ **Screen Reader**: Proper semantic HTML and ARIA announcements  

### Keyboard Shortcuts

- **Table Navigation**: Arrow keys, Home, End
- **Tabs**: Arrow keys to switch
- **Modal/Drawer**: ESC to close
- **Input**: Enter to submit forms

---

## Internationalization

### Supported Languages

- **Persian (fa-IR)**: Default
- **English (en-US)**: Fallback

### i18n Hook

```tsx
import { useTranslation } from '@/i18n';

const { t, locale } = useTranslation('fa');

<h1>{t.nav.home}</h1>
```

### RTL Support

Automatic direction switching based on locale:

```tsx
<div dir={locale === 'fa' ? 'rtl' : 'ltr'}>
  Content
</div>
```

---

## Performance

### Optimization Strategies

1. **Code Splitting**: Dynamic imports for routes
2. **Skeleton Screens**: Visible within 200ms
3. **Optimistic UI**: Immediate feedback on safe actions
4. **Memoization**: React.memo for expensive components
5. **Virtual Scrolling**: For large lists (planned)

### Perceived Performance

- **Interactive Readiness**: <1s on typical hardware
- **Skeleton Loading**: Appears before data fetch
- **No Layout Shifts**: CLS target <0.1

---

## Testing

### Playwright E2E Tests

**Location**: `/tests/e2e/`

```typescript
test('experiments page loads and displays table', async ({ page }) => {
  await page.goto('/experiments');
  await expect(page.locator('table')).toBeVisible();
});

test('keyboard navigation works in table', async ({ page }) => {
  await page.goto('/experiments');
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  // Assert focus moved
});
```

### Accessibility Tests

```typescript
test('has no WCAG violations', async ({ page }) => {
  await page.goto('/');
  const results = await axe(page);
  expect(results.violations).toEqual([]);
});
```

---

## Usage Examples

### Building a Custom Dashboard

```tsx
import { Card, Chart, MetricCard } from '@/components/ui';
import { MetricCard } from '@/components/monitoring/MetricCard';

const CustomDashboard = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard title="Accuracy" value={94.2} unit="%" />
      
      <Card className="col-span-2">
        <Chart
          type="line"
          data={data}
          dataKeys={[{ key: 'accuracy', color: '#3b82f6' }]}
          xAxisKey="epoch"
        />
      </Card>
    </div>
  );
};
```

### Creating an Alert

```tsx
const alertRules: AlertRule[] = [
  {
    id: '1',
    metric: 'Loss',
    threshold: 3.0,
    condition: '>',
    severity: 'warning',
    message: 'Training loss is high',
  },
];

<AlertPanel alerts={activeAlerts} rules={alertRules} />
```

### Customizing Theme

```tsx
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
};
```

---

## Best Practices

1. **Always use design tokens** instead of hard-coded values
2. **Prefer semantic HTML** over divs with ARIA
3. **Test with keyboard navigation** before pushing
4. **Use Skeleton components** for loading states
5. **Apply RTL-aware styles** (use logical properties)
6. **Keep components small** and single-responsibility
7. **Document complex interactions** with comments
8. **Run accessibility checks** in CI

---

## Common Patterns

### Loading State

```tsx
{isLoading ? <Skeleton height={200} /> : <ActualContent />}
```

### Error Handling

```tsx
{error && <Alert variant="danger" dismissible>{error.message}</Alert>}
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

---

## Resources

- **Tokens**: `/client/src/config/tokens.ts`
- **i18n**: `/client/src/i18n/index.ts`
- **Components**: `/client/src/components/ui/`
- **Pages**: `/client/src/pages/`
- **Tests**: `/tests/e2e/`

---

## Support

For questions or issues:
- Check this guide first
- Review component source code
- Open an issue on GitHub

**Built with ❤️ for the Persian-speaking ML community**
