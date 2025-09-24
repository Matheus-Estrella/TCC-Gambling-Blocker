// Popup Script V0.3.0 - Com Melhor UX
console.log('🎰 Gambling Blocker Popup v0.3.0 carregado!');

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
    private isLoading: boolean = true;

    constructor() {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.showLoadingState(true);
            await this.loadCurrentTab();
            await this.loadSettings();
            await this.analyzeCurrentSite();
            this.updateUI();
            this.setupEventListeners();
            await this.showLoadingState(false);
        } catch (error) {
            console.error('Erro ao inicializar popup:', error);
            this.showNotification('Erro ao carregar a extensão', 'error');
            await this.showLoadingState(false);
        }
    }

    private async showLoadingState(loading: boolean): Promise<void> {
        this.isLoading = loading;
        const container = document.querySelector('.popup-container') as HTMLElement;
        if (container) {
            if (loading) {
                container.classList.add('loading');
            } else {
                container.classList.remove('loading');
            }
        }
    }

    private async loadCurrentTab(): Promise<void> {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
                if (tabs[0]) {
                    this.currentTab = tabs[0];
                    this.currentUrl = tabs[0].url || '';
                    this.currentDomain = this.extractDomain(this.currentUrl);
                    resolve();
                } else {
                    reject(new Error('Nenhuma aba encontrada'));
                }
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
        if (!this.currentUrl) {
            this.isGamblingSite = false;
            return;
        }

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
        if (!siteInfo || !this.currentDomain) {
            siteInfo!.innerHTML = '<strong>Nenhum site detectado</strong>';
            return;
        }

        siteInfo.className = '';
        
        if (this.settings.exceptions.includes(this.currentDomain)) {
            siteInfo.innerHTML = `
                <strong>${this.currentDomain}</strong><br>
                <span style="color: #51cf66;">✅ Site permitido (exceção)</span>
            `;
            siteInfo.classList.add('site-exception');
        } else if (this.isGamblingSite) {
            siteInfo.innerHTML = `
                <strong>${this.currentDomain}</strong><br>
                <span style="color: #ff6b6b;">🚫 Site de aposta detectado</span>
            `;
            siteInfo.classList.add('site-gambling');
        } else {
            siteInfo.innerHTML = `
                <strong>${this.currentDomain}</strong><br>
                <span style="color: #51cf66;">✅ Site seguro</span>
            `;
            siteInfo.classList.add('site-safe');
        }
    }

    private updateClassificationButtons(): void {
        const markGamblingBtn = document.getElementById('mark-gambling') as HTMLButtonElement;
        const markSafeBtn = document.getElementById('mark-safe') as HTMLButtonElement;

        if (!markGamblingBtn || !markSafeBtn) return;

        if (this.settings.exceptions.includes(this.currentDomain)) {
            markGamblingBtn.disabled = false;
            markSafeBtn.disabled = true;
            markSafeBtn.textContent = '✅ Já permitido';
            markGamblingBtn.textContent = '🚫 Marcar como Aposta';
        } else if (this.isGamblingSite) {
            markGamblingBtn.disabled = true;
            markSafeBtn.disabled = false;
            markGamblingBtn.textContent = '🚫 Já classificado como aposta';
            markSafeBtn.textContent = '✅ Marcar como Seguro';
        } else {
            markGamblingBtn.disabled = false;
            markSafeBtn.disabled = true;
            markGamblingBtn.textContent = '🚫 Marcar como Aposta';
            markSafeBtn.textContent = '✅ Marcar como Seguro';
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
                element.addEventListener('change', async (e) => {
                    const target = e.target as HTMLInputElement;
                    if (key === 'grayscale') this.settings.grayscale = target.checked;
                    if (key === 'blur') this.settings.blur = target.checked;
                    if (key === 'darken') this.settings.darken = target.checked;
                    if (key === 'muteAudio') this.settings.muteAudio = target.checked;
                    
                    await this.saveSettings();
                    this.showNotification('Configurações salvas!', 'success');
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
        if (!this.currentDomain) {
            this.showNotification('Nenhum site detectado', 'error');
            return;
        }

        try {
            await this.showLoadingState(true);
            
            let newExceptions = [...this.settings.exceptions];

            if (isGambling) {
                // Remove das exceções (marca como aposta)
                newExceptions = newExceptions.filter(domain => domain !== this.currentDomain);
                this.showNotification(`🚫 ${this.currentDomain} marcado como aposta`, 'success');
            } else {
                // Adiciona às exceções (marca como seguro)
                if (!newExceptions.includes(this.currentDomain)) {
                    newExceptions.push(this.currentDomain);
                }
                this.showNotification(`✅ ${this.currentDomain} permitido`, 'success');
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

        } catch (error) {
            console.error('Erro ao marcar site:', error);
            this.showNotification('Erro ao salvar configuração', 'error');
        } finally {
            await this.showLoadingState(false);
        }
    }

    private async saveSettings(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set(this.settings, () => {
                console.log('💾 Configurações salvas:', this.settings);
                resolve();
            });
        });
    }

    private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
        // Remove notificação existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Cria nova notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Animação de entrada
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializa o popup quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new GamblingBlockerPopup();
});