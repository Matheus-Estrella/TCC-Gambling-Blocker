// Service Worker Simplificado
console.log('Gambling Blocker Service Worker iniciado!');
// Classificador simples para o service worker
class SimpleClassifier {
    constructor() {
        this.gamblingDomains = [
            "bet365.com", "pokerstars.com", "888poker.com", "williamhill.com",
            "bwin.com", "unibet.com", "betway.com", "casino.com", "paddypower.com",
            "betfair.com", "sportingbet.com", "ladbrokes.com", "coral.co.uk",
            "betsson.com", "nordicbet.com", "bet365.bet.br"
        ];
    }
    classify(url) {
        const domain = this.extractDomain(url);
        return this.gamblingDomains.some(gamblingDomain => domain.includes(gamblingDomain));
    }
    extractDomain(url) {
        try {
            let domain = url.toLowerCase();
            domain = domain.replace(/^https?:\/\//, '');
            domain = domain.split('/')[0];
            domain = domain.replace(/^www\./, '');
            return domain;
        }
        catch {
            return url.toLowerCase();
        }
    }
}
const classifier = new SimpleClassifier();
// Configura os listeners
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        updateTabBadge(tabId, tab.url);
    }
});
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            updateTabBadge(activeInfo.tabId, tab.url);
        }
    });
});
function updateTabBadge(tabId, url) {
    const isGambling = classifier.classify(url);
    if (isGambling) {
        chrome.action.setBadgeText({ tabId, text: '🚫' });
        chrome.action.setBadgeBackgroundColor({ tabId, color: '#FF0000' });
    }
    else {
        chrome.action.setBadgeText({ tabId, text: '' });
    }
}
