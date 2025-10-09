import React, { useEffect, useState } from 'react';
import { Card } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { storage } from '../shared/utils/storage';

type Settings = {
  language: 'fa' | 'en' | 'ar';
  notifications: { desktop: boolean };
  ai: { model: string; temperature: number; maxTokens: number; enableRetrieval: boolean; };
  appearance: { fontSize: 'small'|'medium'|'large'; accentColor: 'blue'|'purple'|'green'|'red'|'orange'|'pink'; };
};

const DEFAULTS: Settings = {
  language: 'fa',
  notifications: { desktop: true },
  ai: { model: 'claude-sonnet-4-20250514', temperature: 0.7, maxTokens: 4000, enableRetrieval: false },
  appearance: { fontSize: 'medium', accentColor: 'blue' }
};

const SettingsPage: React.FC = () => {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { const saved = storage.get<Settings>('ui_settings'); if (saved) setS(saved); }, []);
  useEffect(() => { setDirty(true); }, [s]);

  const save = () => { storage.set('ui_settings', s); setDirty(false); };
  const reset = () => { setS(DEFAULTS); setDirty(true); };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">تنظیمات</h2>

      <Card>
        <h3 className="font-semibold mb-4">عمومی</h3>
        <label className="block mb-2 text-sm">زبان</label>
        <select value={s.language} onChange={(e) => setS(p => ({ ...p, language: e.target.value as any }))}
                className="w-full h-10 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 focus-ring max-w-xs">
          <option value="fa">فارسی</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>

        <div className="mt-4 flex items-center justify-between max-w-md">
          <span className="text-sm">اعلان‌های دسکتاپ</span>
          <input type="checkbox" checked={s.notifications.desktop}
            onChange={(e) => setS(p => ({ ...p, notifications: { desktop: e.target.checked } }))}/>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">مدل هوشمند</h3>
        <div className="grid gap-4 max-w-xl">
          <div>
            <label className="block mb-1 text-sm">مدل پیش‌فرض</label>
            <select value={s.ai.model} onChange={(e) => setS(p => ({ ...p, ai: { ...p.ai, model: e.target.value } }))}
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 focus-ring">
              <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
              <option value="claude-opus-4-20250514">Claude Opus 4</option>
              <option value="claude-haiku-4-20250514">Claude Haiku 4</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm">Temperature: {s.ai.temperature}</label>
            <input type="range" min={0} max={1} step={0.1} value={s.ai.temperature}
                   onChange={(e) => setS(p => ({ ...p, ai: { ...p.ai, temperature: parseFloat(e.target.value) } }))} />
          </div>
          <div>
            <label className="block mb-1 text-sm">حداکثر طول پاسخ</label>
            <input type="number" min={100} max={8000} step={100} value={s.ai.maxTokens}
                   onChange={(e) => setS(p => ({ ...p, ai: { ...p.ai, maxTokens: parseInt(e.target.value) } }))}
                   className="w-full h-10 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 focus-ring"/>
          </div>
          <label className="flex items-center justify-between">
            <span className="text-sm">جستجوی هوشمند</span>
            <input type="checkbox" checked={s.ai.enableRetrieval}
              onChange={(e) => setS(p => ({ ...p, ai: { ...p.ai, enableRetrieval: e.target.checked } }))}/>
          </label>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">ظاهر</h3>
        <div className="grid gap-4 max-w-xl">
          <div>
            <label className="block mb-1 text-sm">اندازه فونت</label>
            <select value={s.appearance.fontSize} onChange={(e) => setS(p => ({ ...p, appearance: { ...p.appearance, fontSize: e.target.value as any } }))}
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 focus-ring">
              <option value="small">کوچک</option>
              <option value="medium">متوسط</option>
              <option value="large">بزرگ</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">رنگ اصلی</label>
            <div className="flex gap-2">
              {(['blue','purple','green','red','orange','pink'] as const).map(c => (
                <button key={c} aria-label={c}
                        onClick={() => setS(p => ({ ...p, appearance: { ...p.appearance, accentColor: c } }))}
                        className={`w-8 h-8 rounded-lg ring-2 ${s.appearance.accentColor===c ? 'ring-gray-400 scale-110' : 'ring-transparent hover:scale-105'}`}
                        style={{ backgroundColor: {blue:'#3B82F6',purple:'#8B5CF6',green:'#10B981',red:'#EF4444',orange:'#F59E0B',pink:'#EC4899'}[c] }} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={reset}>بازنشانی</Button>
        <Button onClick={save} disabled={!dirty}>ذخیره</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
