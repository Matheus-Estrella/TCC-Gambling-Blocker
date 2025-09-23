// Content Script V0.2.0 - TypeScript Corrigido (Ordem Correta)
console.log('🎰 Gambling Blocker Content Script carregado!');

// ===== CONFIGURAÇÕES =====
const GAMBLING_DOMAINS: string[] = [
    "bet365.com", "pokerstars.com", "888poker.com", "williamhill.com",
    "bwin.com", "unibet.com", "betway.com", "casino.com", "paddypower.com",
    "betfair.com", "sportingbet.com", "ladbrokes.com", "coral.co.uk",
    "betsson.com", "nordicbet.com", "bet365.bet.br"
];

const GAMBLING_KEYWORDS: string[] = [
    "bet", "casino", "poker", "gambling", "slot", "roulette",
    "blackjack", "bingo", "lottery", "wager", "stake", "odds",
    "aposta", "cassino", "pôquer", "jogo", "azar", "apostar"
];

// ===== SISTEMA DE EXCEÇÕES =====
let userExceptions: string[] = [];

async function loadUserExceptions(): Promise<string[]> {
    return new Promise((resolve) => {
        chrome.storage.sync.get({ exceptions: [] }, (result: any) => {
            resolve(result.exceptions || []);
        });
    });
}

async function saveUserExceptions(exceptions: string[]): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ exceptions }, () => resolve());
    });
}

// ===== FUNÇÕES UTILITÁRIAS =====
function extractDomain(url: string): string {
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

async function isGamblingSite(url: string): Promise<boolean> {
    const domain = extractDomain(url);
    
    // Verifica se está na lista de exceções do usuário
    const exceptions = await loadUserExceptions();
    if (exceptions.includes(domain)) {
        console.log('✅ Site está na lista de exceções - tratando como seguro');
        return false;
    }
    
    // Verifica domínios conhecidos
    const domainMatch = GAMBLING_DOMAINS.some(gamblingDomain => 
        domain.includes(gamblingDomain)
    );
    
    // Verifica palavras-chave
    const keywordMatch = GAMBLING_KEYWORDS.some(keyword => 
        url.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return domainMatch || keywordMatch;
}

function applyGrayscaleFilter(): void {
    removeFilters();
    
    const style = document.createElement('style');
    style.id = 'gambling-blocker-style';
    style.textContent = `
        html, body {
            filter: grayscale(100%) !important;
            -webkit-filter: grayscale(100%) !important;
        }
    `;
    document.head.appendChild(style);
}

function applyBlurFilter(): void {
    removeFilters();
    
    const style = document.createElement('style');
    style.id = 'gambling-blocker-style';
    style.textContent = `
        html, body {
            filter: blur(5px) !important;
            -webkit-filter: blur(5px) !important;
        }
    `;
    document.head.appendChild(style);
}

function applyDarkenFilter(): void {
    removeFilters();
    
    const style = document.createElement('style');
    style.id = 'gambling-blocker-style';
    style.textContent = `
        html, body {
            filter: brightness(0.5) !important;
            -webkit-filter: brightness(0.5) !important;
        }
    `;
    document.head.appendChild(style);
}

function removeFilters(): void {
    const existingStyle = document.getElementById('gambling-blocker-style');
    if (existingStyle) existingStyle.remove();
}

function addWarningBanner(): void {
    const existingBanner = document.querySelector('.gambling-blocker-warning');
    if (existingBanner) existingBanner.remove();
    
    const banner = document.createElement('div');
    banner.className = 'gambling-blocker-warning';
    banner.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #ff6b6b;
            color: white;
            padding: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
            ⚠️ Gambling Blocker: Site de apostas detectado. 
            <button id="gambling-blocker-allow" style="
                margin-left: 10px;
                background: white;
                color: #ff6b6b;
                border: none;
                padding: 2px 8px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            ">Permitir este site</button>
        </div>
    `;
    document.body.appendChild(banner);
    
    // Adiciona evento ao botão de permitir
    const allowButton = document.getElementById('gambling-blocker-allow');
    if (allowButton) {
        allowButton.addEventListener('click', async () => {
            const domain = extractDomain(window.location.href);
            const exceptions = await loadUserExceptions();
            
            if (!exceptions.includes(domain)) {
                exceptions.push(domain);
                await saveUserExceptions(exceptions);
                alert(`✅ ${domain} adicionado à lista de sites permitidos!`);
                location.reload();
            }
        });
    }
}

function mutePageAudio(): void {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach((element: Element) => {
        (element as HTMLMediaElement).muted = true;
    });
}

function observeNewMediaElements(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // ELEMENT_NODE
                    const element = node as Element;
                    
                    if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
                        (element as HTMLMediaElement).muted = true;
                    }
                    
                    const mediaElements = element.querySelectorAll('video, audio');
                    mediaElements.forEach(media => {
                        (media as HTMLMediaElement).muted = true;
                    });
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ===== APLICAÇÃO DE EFEITOS =====
async function applyEffects(): Promise<void> {
    const settings = await new Promise<any>((resolve) => {
        chrome.storage.sync.get({
            grayscale: true,
            blur: false,
            darken: false,
            muteAudio: false
        }, resolve);
    });
    
    console.log('⚙️ Configurações carregadas:', settings);
    
    // Aplica filtro visual baseado nas configurações
    if (settings.grayscale) {
        applyGrayscaleFilter();
    } else if (settings.blur) {
        applyBlurFilter();
    } else if (settings.darken) {
        applyDarkenFilter();
    }
    
    addWarningBanner();
    
    // Aplica mute de áudio se configurado
    if (settings.muteAudio) {
        mutePageAudio();
        observeNewMediaElements();
    }
}

// ===== OUVINTE DE MUDANÇAS DE CONFIGURAÇÃO =====
function setupConfigListener(): void {
    chrome.storage.onChanged.addListener((changes: { [key: string]: any }, namespace: string) => {
        if (namespace === 'sync') {
            console.log('🔄 Configurações alteradas, reaplicando efeitos...');
            
            // Verifica se as configurações relevantes foram alteradas
            const relevantChanges = ['grayscale', 'blur', 'darken', 'muteAudio'];
            const hasRelevantChange = Object.keys(changes).some(key => relevantChanges.includes(key));
            
            if (hasRelevantChange) {
                applyEffects();
            }
        }
    });
}

// ===== FUNÇÃO PRINCIPAL =====
async function initializeGamblingBlocker(): Promise<void> {
    const url = window.location.href;
    const gamblingSite = await isGamblingSite(url);
    
    console.log('🔍 Gambling Blocker analisando:', url);
    console.log('🎯 É site de aposta?:', gamblingSite);
    
    if (gamblingSite) {
        await applyEffects();
        setupConfigListener();
        
        // Observa mudanças de URL (para SPAs)
        let lastUrl = url;
        const urlObserver = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                console.log('🔄 URL mudou, reanalisando...');
                
                setTimeout(async () => {
                    const newUrl = window.location.href;
                    const stillGambling = await isGamblingSite(newUrl);
                    
                    if (!stillGambling) {
                        removeFilters();
                        const banner = document.querySelector('.gambling-blocker-warning');
                        if (banner) banner.remove();
                    } else {
                        await applyEffects();
                    }
                }, 100);
            }
        });
        
        urlObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// ===== INICIALIZAÇÃO =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeGamblingBlocker();
    });
} else {
    initializeGamblingBlocker();
}