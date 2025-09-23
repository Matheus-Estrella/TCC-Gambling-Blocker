// Popup Script - Versão Corrigida
console.log('Gambling Blocker Popup carregado!');

interface ExtensionSettings {
    grayscale: boolean;
    blur: boolean;
    darken: boolean;
    muteAudio: boolean;
}

class GamblingBlockerPopup {
    private settings: ExtensionSettings = {
        grayscale: true,
        blur: false,
        darken: false,
        muteAudio: false
    };

    constructor() {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadSettings();
        this.updateUI();
        this.setupEventListeners();
        await this.updateCurrentSiteInfo();
    }

    private loadSettings(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(this.settings, (result) => {
                this.settings = { ...this.settings, ...result };
                resolve();
            });
        });
    }

    private updateUI(): void {
        (document.getElementById('grayscale-toggle') as HTMLInputElement).checked = this.settings.grayscale;
        (document.getElementById('blur-toggle') as HTMLInputElement).checked = this.settings.blur;
        (document.getElementById('darken-toggle') as HTMLInputElement).checked = this.settings.darken;
        (document.getElementById('mute-toggle') as HTMLInputElement).checked = this.settings.muteAudio;
    }

    private setupEventListeners(): void {
        // Toggles
        document.getElementById('grayscale-toggle')?.addEventListener('change', (e) => {
            this.settings.grayscale = (e.target as HTMLInputElement).checked;
            this.saveSettings();
        });

        document.getElementById('blur-toggle')?.addEventListener('change', (e) => {
            this.settings.blur = (e.target as HTMLInputElement).checked;
            this.saveSettings();
        });

        document.getElementById('darken-toggle')?.addEventListener('change', (e) => {
            this.settings.darken = (e.target as HTMLInputElement).checked;
            this.saveSettings();
        });

        document.getElementById('mute-toggle')?.addEventListener('change', (e) => {
            this.settings.muteAudio = (e.target as HTMLInputElement).checked;
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

    private saveSettings(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set(this.settings, () => {
                console.log('Configurações salvas:', this.settings);
                resolve();
            });
        });
    }

    private updateCurrentSiteInfo(): Promise<void> {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
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
                        } catch (error) {
                            siteInfo.innerHTML = `<strong>${tabs[0].url}</strong>`;
                        }
                    }
                }
                resolve();
            });
        });
    }

    private classifyUrl(url: string): boolean {
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

    private markCurrentSite(isGambling: boolean): void {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
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