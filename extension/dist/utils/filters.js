"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterApplicator = void 0;
class FilterApplicator {
    constructor() {
        this.styleElement = null;
    }
    applyFilters(settings) {
        this.removeFilters();
        if (!settings.grayscale && !settings.blur && !settings.darken) {
            return;
        }
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'gambling-blocker-filters';
        let cssFilters = '';
        if (settings.grayscale)
            cssFilters += 'grayscale(1) ';
        if (settings.blur)
            cssFilters += 'blur(5px) ';
        if (settings.darken)
            cssFilters += 'brightness(0.5) ';
        this.styleElement.textContent = `
      html, body {
        filter: ${cssFilters.trim()} !important;
        -webkit-filter: ${cssFilters.trim()} !important;
      }
    `;
        document.head.appendChild(this.styleElement);
    }
    applyAudioMute(mute) {
        const mediaElements = document.querySelectorAll('video, audio');
        mediaElements.forEach((element) => {
            const media = element;
            media.muted = mute;
        });
    }
    removeFilters() {
        const existingStyle = document.getElementById('gambling-blocker-filters');
        if (existingStyle) {
            existingStyle.remove();
        }
        this.styleElement = null;
    }
}
exports.FilterApplicator = FilterApplicator;
