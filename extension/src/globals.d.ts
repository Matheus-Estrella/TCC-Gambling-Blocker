// globals.d.ts - Tipos globais para a extensão Chrome

interface StorageChange {
    oldValue?: any;
    newValue?: any;
}

interface ChromeStorage {
    sync: {
        get(keys: any, callback: (result: any) => void): void;
        set(items: any, callback?: () => void): void;
    };
    onChanged: {
        addListener(callback: (changes: { [key: string]: StorageChange }, namespace: string) => void): void;
    };
}

interface ChromeTabs {
    onUpdated: {
        addListener(callback: (tabId: number, changeInfo: any, tab: any) => void): void;
    };
    onActivated: {
        addListener(callback: (activeInfo: any) => void): void;
    };
    query(queryInfo: any, callback: (tabs: any[]) => void): void;
    get(tabId: number, callback: (tab: any) => void): void;
    reload(tabId: number): void;
}

interface ChromeAction {
    setBadgeText(details: { tabId: number; text: string }): void;
    setBadgeBackgroundColor(details: { tabId: number; color: string }): void;
}

interface ChromeAPI {
    storage: ChromeStorage;
    tabs: ChromeTabs;
    action: ChromeAction;
}

declare const chrome: ChromeAPI;