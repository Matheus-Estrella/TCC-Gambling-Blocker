// Popup Script - Versão Corrigida
console.log('Gambling Blocker Popup carregado!');
class GamblingBlockerPopup {
    constructor() {
        this.settings = {
            grayscale: true,
            blur: false,
            darken: false,
            muteAudio: false
        };
        this.initialize();
    }
    async initialize() {
        await this.loadSettings();
        this.updateUI();
        this.setupEventListeners();
        await this.updateCurrentSiteInfo();
    }
    loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(this.settings, (result) => {
                this.settings = { ...this.settings, ...result };
                resolve();
            });
        });
    }
    updateUI() {
        document.getElementById('grayscale-toggle').checked = this.settings.grayscale;
        document.getElementById('blur-toggle').checked = this.settings.blur;
        document.getElementById('darken-toggle').checked = this.settings.darken;
        document.getElementById('mute-toggle').checked = this.settings.muteAudio;
    }
    setupEventListeners() {
        // Toggles
        document.getElementById('grayscale-toggle')?.addEventListener('change', (e) => {
            this.settings.grayscale = e.target.checked;
            this.saveSettings();
        });
        document.getElementById('blur-toggle')?.addEventListener('change', (e) => {
            this.settings.blur = e.target.checked;
            this.saveSettings();
        });
        document.getElementById('darken-toggle')?.addEventListener('change', (e) => {
            this.settings.darken = e.target.checked;
            this.saveSettings();
        });
        document.getElementById('mute-toggle')?.addEventListener('change', (e) => {
            this.settings.muteAudio = e.target.checked;
            this.saveSettings();
        });
        // Botões de classificação
        document.getElementById('mark-gambling')?.addEventListener('click', () => {
            this.markCurrentSite(true);
        });
        document.getElementById('mark-safe')?.addEventListener('click', () => {
            this.markCurrentSite(false);
        });
    }
    saveSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.set(this.settings, () => {
                console.log('Configurações salvas:', this.settings);
                resolve();
            });
        });
    }
    updateCurrentSiteInfo() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.url) {
                    const siteInfo = document.getElementById('current-site-info');
                    if (siteInfo) {
                        try {
                            const url = new URL(tabs[0].url);
                            const isGambling = this.classifyUrl(tabs[0].url);
                            siteInfo.innerHTML = `
                                <strong>${url.hostname}</strong><br>
                                <span style="color: ${isGambling ? '#ff6b6b' : '#51cf66'}">
                                    ${isGambling ? '🚫 Site de aposta' : '✅ Site seguro'}
                                </span>
                            `;
                        }
                        catch (error) {
                            siteInfo.innerHTML = `<strong>${tabs[0].url}</strong>`;
                        }
                    }
                }
                resolve();
            });
        });
    }
    classifyUrl(url) {
        const gamblingDomains = [
            'bet365.com', 'pokerstars.com', '888poker.com', 'williamhill.com',
            'bwin.com', 'unibet.com', 'betway.com', 'casino.com', 'bet365.bet.br'
        ];
        const gamblingKeywords = [
            'bet', 'casino', 'poker', 'gambling', 'aposta', 'cassino'
        ];
        const domain = url.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
        const domainMatch = gamblingDomains.some(d => domain.includes(d));
        const keywordMatch = gamblingKeywords.some(k => url.toLowerCase().includes(k));
        return domainMatch || keywordMatch;
    }
    markCurrentSite(isGambling) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
                const message = isGambling ?
                    '🚫 Site marcado como APOSTA!' :
                    '✅ Site marcado como SEGURO!';
                alert(`${message}\n\nURL: ${tabs[0].url}\n\n(Funcionalidade completa na próxima versão)`);
            }
        });
    }
}
// Inicializa o popup quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new GamblingBlockerPopup();
});
