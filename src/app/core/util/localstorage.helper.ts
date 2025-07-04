// utils/storage-helper.ts
export function setWithExpiry(key: string, value: any, ttlMs: number) {
    const now = new Date();
    const item = {
        value,
        expiry: now.getTime() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry<T>(key: string): T | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value as T;
    } catch {
        return null;
    }
}
