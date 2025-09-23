"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamblingClassifier = void 0;
// Importação dos dados JSON
const domainsData = {
    "known_gambling_domains": [
        "bet365.com", "pokerstars.com", "888poker.com", "williamhill.com",
        "bwin.com", "unibet.com", "betway.com", "casino.com", "paddypower.com",
        "betfair.com", "sportingbet.com", "ladbrokes.com", "coral.co.uk",
        "betsson.com", "nordicbet.com"
    ]
};
const keywordsData = {
    "gambling_keywords": [
        "bet", "casino", "poker", "gambling", "slot", "roulette",
        "blackjack", "bingo", "lottery", "wager", "stake", "odds",
        "aposta", "cassino", "pôquer", "jogo", "azar", "apostar",
        "bet365", "betway", "sportingbet", "blaze", "aviator",
        "crazy time", "bonanza", "fortune", "jackpot", "spin"
    ]
};
class GamblingClassifier {
    constructor() {
        this.knownDomains = new Set(domainsData.known_gambling_domains);
        this.gamblingKeywords = new Set(keywordsData.gambling_keywords);
    }
    extractDomain(url) {
        try {
            // Remove protocolo e caminho
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
    checkDomainMatch(domain) {
        for (const gamblingDomain of this.knownDomains) {
            if (domain.includes(gamblingDomain)) {
                return true;
            }
        }
        return false;
    }
    checkKeywordMatch(url) {
        const urlLower = url.toLowerCase();
        for (const keyword of this.gamblingKeywords) {
            if (urlLower.includes(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
    classify(url) {
        const domain = this.extractDomain(url);
        const domainMatch = this.checkDomainMatch(domain);
        const keywordMatch = this.checkKeywordMatch(url);
        const isGambling = domainMatch || keywordMatch;
        let confidence = 0.1;
        if (domainMatch)
            confidence = 0.9;
        else if (keywordMatch)
            confidence = 0.7;
        return {
            isGambling,
            confidence,
            reason: {
                domainMatch,
                keywordMatch,
                domain
            }
        };
    }
}
exports.GamblingClassifier = GamblingClassifier;
