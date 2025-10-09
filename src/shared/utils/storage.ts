export const storage = {
  get<T>(key: string): T | null {
    const v = localStorage.getItem(key);
    try { return v ? JSON.parse(v) as T : null; } catch { return null; }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    localStorage.removeItem(key);
  }
};
