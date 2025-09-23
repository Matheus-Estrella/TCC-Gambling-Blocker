export interface FilterSettings {
  grayscale: boolean;
  blur: boolean;
  darken: boolean;
  muteAudio: boolean;
}

export class FilterApplicator {
  private styleElement: HTMLStyleElement | null = null;

  applyFilters(settings: FilterSettings): void {
    this.removeFilters();
    
    if (!settings.grayscale && !settings.blur && !settings.darken) {
      return;
    }

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'gambling-blocker-filters';
    
    let cssFilters = '';
    
    if (settings.grayscale) cssFilters += 'grayscale(1) ';
    if (settings.blur) cssFilters += 'blur(5px) ';
    if (settings.darken) cssFilters += 'brightness(0.5) ';
    
    this.styleElement.textContent = `
      html, body {
        filter: ${cssFilters.trim()} !important;
        -webkit-filter: ${cssFilters.trim()} !important;
      }
    `;
    
    document.head.appendChild(this.styleElement);
  }

  applyAudioMute(mute: boolean): void {
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach((element: Element) => {
      const media = element as HTMLMediaElement;
      media.muted = mute;
    });
  }

  removeFilters(): void {
    const existingStyle = document.getElementById('gambling-blocker-filters');
    if (existingStyle) {
      existingStyle.remove();
    }
    this.styleElement = null;
  }
}