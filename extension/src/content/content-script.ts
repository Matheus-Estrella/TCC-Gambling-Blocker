// Content Script Simplificado - Sem Módulos
console.log('🎰 Gambling Blocker Content Script carregado!');

// ===== CONFIGURAÇÕES =====
const GAMBLING_DOMAINS = [
    "bet365.com", "pokerstars.com", "888poker.com", "williamhill.com",
    "bwin.com", "unibet.com", "betway.com", "casino.com", "paddypower.com",
    "betfair.com", "sportingbet.com", "ladbrokes.com", "coral.co.uk",
    "betsson.com", "nordicbet.com", "bet365.bet.br"
];

const GAMBLING_KEYWORDS = [
    "bet", "casino", "poker", "gambling", "slot", "roulette",
    "blackjack", "bingo", "lottery", "wager", "stake", "odds",
    "aposta", "cassino", "pôquer", "jogo", "azar", "apostar"
];

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

function isGamblingSite(url: string): boolean {
    const domain = extractDomain(url);
    
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
    const existingStyle = document.getElementById('gambling-blocker-style');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'gambling-blocker-style';
    style.textContent = `
        html, body {
            filter: grayscale(100%) !important;
            -webkit-filter: grayscale(100%) !important;
        }
        
        .gambling-blocker-warning {
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
        }
    `;
    document.head.appendChild(style);
}

function addWarningBanner(): void {
    const existingBanner = document.querySelector('.gambling-blocker-warning');
    if (existingBanner) existingBanner.remove();
    
    const banner = document.createElement('div');
    banner.className = 'gambling-blocker-warning';
    banner.innerHTML = '⚠️ Gambling Blocker: Site de apostas detectado. Filtros de segurança aplicados.';
    document.body.appendChild(banner);
}

function mutePageAudio(): void {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach((element: any) => {
        element.muted = true;
    });
}

function observeNewMediaElements(): void {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const element = node as Element;
                    
                    // Muta novos elementos de áudio/vídeo
                    if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
                        (element as any).muted = true;
                    }
                    
                    // Muta elementos dentro do novo nó
                    const mediaElements = element.querySelectorAll('video, audio');
                    mediaElements.forEach(media => {
                        (media as any).muted = true;
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

// ===== FUNÇÃO PRINCIPAL =====
function initializeGamblingBlocker(): void {
    const url = window.location.href;
    const gamblingSite = isGamblingSite(url);
    
    console.log('🔍 Gambling Blocker analisando:', url);
    console.log('🎯 É site de aposta?:', gamblingSite);
    
    if (gamblingSite) {
        // Carrega configurações do usuário
        chrome.storage.sync.get({
            grayscale: true,
            muteAudio: false
        }, (settings) => {
            console.log('⚙️ Configurações carregadas:', settings);
            
            // Aplica filtro visual (grayscale padrão)
            if (settings.grayscale) {
                applyGrayscaleFilter();
                addWarningBanner();
            }
            
            // Aplica mute de áudio se configurado
            if (settings.muteAudio) {
                mutePageAudio();
                observeNewMediaElements();
            }
        });
        
        // Observa mudanças de URL (para SPAs)
        let lastUrl = url;
        const urlObserver = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                console.log('🔄 URL mudou, reanalisando...');
                
                // Recarrega a extensão após mudança de URL
                setTimeout(() => {
                    const newUrl = window.location.href;
                    const stillGambling = isGamblingSite(newUrl);
                    
                    if (!stillGambling) {
                        // Remove filtros se não for mais site de aposta
                        const style = document.getElementById('gambling-blocker-style');
                        if (style) style.remove();
                        
                        const banner = document.querySelector('.gambling-blocker-warning');
                        if (banner) banner.remove();
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
    document.addEventListener('DOMContentLoaded', initializeGamblingBlocker);
} else {
    initializeGamblingBlocker();
}