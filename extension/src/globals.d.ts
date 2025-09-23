// globals.d.ts - Tipos globais para a extensão Chrome

// Interface completa para a API do Chrome
interface ChromeStorage {
  sync: {
    get(keys: any, callback: (result: any) => void): void;
    set(items: any, callback?: () => void): void;
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

// Declaração global do Chrome
declare const chrome: ChromeAPI;

// Interface para a Tab do Chrome (usada no popup)
interface ChromeTab {
  id?: number;
  url?: string;
  title?: string;
  active?: boolean;
}

// Tipos para as funções de callback
type ChromeTabsQueryCallback = (tabs: ChromeTab[]) => void;
type ChromeTabGetCallback = (tab: ChromeTab) => void;