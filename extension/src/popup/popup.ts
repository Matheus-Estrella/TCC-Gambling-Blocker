// Popup Script V0.2.0 - Corrigido
console.log('🎰 Gambling Blocker Popup carregado!');

interface ExtensionSettings {
    grayscale: boolean;
    blur: boolean;
    darken: boolean;
    muteAudio: boolean;
    exceptions: string[];
}

class GamblingBlockerPopup {
    private settings: ExtensionSettings = {
        grayscale: true,
        blur: false,
        darken: false,
        muteAudio: false,
        exceptions: []
    };

    private currentTab: any = null;
    private currentUrl: string = '';
    private currentDomain: string = '';
    private isGamblingSite: boolean = false;

    constructor() {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadCurrentTab();
        await this.loadSettings();
        await this.analyzeCurrentSite();
        this.updateUI();
        this.setupEventListeners();
    }

    private async loadCurrentTab(): Promise<void> {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
                if (tabs[0]) {
                    this.currentTab = tabs[0];
                    this.currentUrl = tabs[0].url || '';
                    this.currentDomain = this.extractDomain(this.currentUrl);
                }
                resolve();
            });
        });
    }

    private async loadSettings(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(this.settings, (result) => {
                this.settings = { ...this.settings, ...result };
                resolve();
            });
        });
    }

    private async analyzeCurrentSite(): Promise<void> {
        if (!this.currentUrl) return;

        // Verifica se está na lista de exceções
        if (this.settings.exceptions.includes(this.currentDomain)) {
            this.isGamblingSite = false;
            return;
        }

        // Classificação automática
        this.isGamblingSite = this.classifyUrl(this.currentUrl);
    }

    private extractDomain(url: string): string {
        try {
            let domain = url.toLowerCase();
            domain = domain.replace(/^https?:\/\//, '');
            domain = domain.split('/')[0];
            domain = domain.replace(/^www\./, '');
            return domain;
        } catch {
            return url.toLowerCase();
        }
    }

    private classifyUrl(url: string): boolean {
        const gamblingDomains = [
            'bet365.com', 'pokerstars.com', '888poker.com', 'williamhill.com',
            'bwin.com', 'unibet.com', 'betway.com', 'casino.com', 'bet365.bet.br'
        ];
        
        const gamblingKeywords = [
            'bet', 'casino', 'poker', 'gambling', 'aposta', 'cassino'
        ];
        
        const domain = this.extractDomain(url);
        const domainMatch = gamblingDomains.some(d => domain.includes(d));
        const keywordMatch = gamblingKeywords.some(k => url.toLowerCase().includes(k));
        
        return domainMatch || keywordMatch;
    }

    private updateUI(): void {
        // Atualiza toggles
        (document.getElementById('grayscale-toggle') as HTMLInputElement).checked = this.settings.grayscale;
        (document.getElementById('blur-toggle') as HTMLInputElement).checked = this.settings.blur;
        (document.getElementById('darken-toggle') as HTMLInputElement).checked = this.settings.darken;
        (document.getElementById('mute-toggle') as HTMLInputElement).checked = this.settings.muteAudio;

        // Atualiza informações do site
        this.updateSiteInfo();

        // Atualiza estado dos botões de classificação
        this.updateClassificationButtons();
    }

    private updateSiteInfo(): void {
        const siteInfo = document.getElementById('current-site-info');
        if (!siteInfo || !this.currentDomain) return;

        if (this.settings.exceptions.includes(this.currentDomain)) {
            siteInfo.innerHTML = `
                <strong>${this.currentDomain}</strong><br>
                <span style="color: #51cf66;">✅ Site permitido (exceção)</span>
            `;
        } else if (this.isGamblingSite) {
            siteInfo.innerHTML = `
                <strong>${this.currentDomain}</strong><br>
                <span style="color: #ff6b6b;">🚫 Site de aposta detectado</span>
            `;
        } else {
            siteInfo.innerHTML = `
                <strong>${this.currentDomain}</strong><br>
                <span style="color: #51cf66;">✅ Site seguro</span>
            `;
        }
    }

    private updateClassificationButtons(): void {
        const markGamblingBtn = document.getElementById('mark-gambling') as HTMLButtonElement;
        const markSafeBtn = document.getElementById('mark-safe') as HTMLButtonElement;

        if (this.settings.exceptions.includes(this.currentDomain)) {
            markGamblingBtn.disabled = false;
            markSafeBtn.disabled = true;
            markSafeBtn.textContent = '✅ Já permitido';
        } else if (this.isGamblingSite) {
            markGamblingBtn.disabled = true;
            markSafeBtn.disabled = false;
            markGamblingBtn.textContent = '🚫 Já classificado como aposta';
        } else {
            markGamblingBtn.disabled = false;
            markSafeBtn.disabled = true;
            markGamblingBtn.textContent = '🚫 Marcar como Aposta';
        }
    }

    private setupEventListeners(): void {
        // Toggles de configuração
        this.setupToggleListeners();
        
        // Botões de classificação manual
        this.setupClassificationListeners();
    }

    private setupToggleListeners(): void {
        const toggles = [
            { id: 'grayscale-toggle', key: 'grayscale' },
            { id: 'blur-toggle', key: 'blur' },
            { id: 'darken-toggle', key: 'darken' },
            { id: 'mute-toggle', key: 'muteAudio' }
        ];

        toggles.forEach(({ id, key }) => {
            const element = document.getElementById(id) as HTMLInputElement;
            if (element) {
                element.addEventListener('change', (e) => {
                    const target = e.target as HTMLInputElement;
                    if (key === 'grayscale') this.settings.grayscale = target.checked;
                    if (key === 'blur') this.settings.blur = target.checked;
                    if (key === 'darken') this.settings.darken = target.checked;
                    if (key === 'muteAudio') this.settings.muteAudio = target.checked;
                    this.saveSettings();
                });
            }
        });
    }

    private setupClassificationListeners(): void {
        const markGamblingBtn = document.getElementById('mark-gambling');
        const markSafeBtn = document.getElementById('mark-safe');

        if (markGamblingBtn) {
            markGamblingBtn.addEventListener('click', () => {
                this.markCurrentSite(true);
            });
        }

        if (markSafeBtn) {
            markSafeBtn.addEventListener('click', () => {
                this.markCurrentSite(false);
            });
        }
    }

    private async markCurrentSite(isGambling: boolean): Promise<void> {
        if (!this.currentDomain) return;

        let newExceptions = [...this.settings.exceptions];

        if (isGambling) {
            // Remove das exceções (marca como aposta)
            newExceptions = newExceptions.filter(domain => domain !== this.currentDomain);
        } else {
            // Adiciona às exceções (marca como seguro)
            if (!newExceptions.includes(this.currentDomain)) {
                newExceptions.push(this.currentDomain);
            }
        }

        this.settings.exceptions = newExceptions;
        await this.saveSettings();
        
        // Atualiza a UI
        await this.analyzeCurrentSite();
        this.updateUI();

        // Recarrega a aba atual para aplicar mudanças
        if (this.currentTab && this.currentTab.id) {
            chrome.tabs.reload(this.currentTab.id);
        }

        const message = isGambling ? 
            `🚫 ${this.currentDomain} marcado como site de aposta` : 
            `✅ ${this.currentDomain} adicionado à lista de sites permitidos`;
        
        this.showNotification(message);
    }

    private async saveSettings(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set(this.settings, () => {
                console.log('💾 Configurações salvas:', this.settings);
                resolve();
            });
        });
    }

    private showNotification(message: string): void {
        // Usando alert simples por enquanto
        alert(message);
    }
}

// Inicializa o popup quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new GamblingBlockerPopup();
});