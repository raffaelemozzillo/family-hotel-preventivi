# Family Hotel Manager - JavaScript Aggiornato 2025

class FamilyHotelManager {
  constructor() {
    this.preventivi = [];
    this.editingId = null;
    this.corsProxies = [
      // Proxy CORS aggiornati e funzionanti per il 2025
      {
        name: "AllOrigins (JSON)",
        url: "https://api.allorigins.win/get?url=",
        responseType: "json",
        timeout: 15000
      },
      {
        name: "AllOrigins (Raw)", 
        url: "https://api.allorigins.win/raw?url=",
        responseType: "text",
        timeout: 15000
      },
      {
        name: "CodeTabs",
        url: "https://api.codetabs.com/v1/proxy?quest=",
        responseType: "text", 
        timeout: 10000
      },
      {
        name: "X2U CORS (requires API key)",
        url: "https://go.x2u.in/proxy?email=test@example.com&apiKey=demo&url=",
        responseType: "text",
        timeout: 20000
      },
      {
        name: "CorsProxy.io (Free)",
        url: "https://corsproxy.io/?",
        responseType: "text",
        timeout: 15000
      }
    ];
    
    this.loadPreventivi();
    this.cacheDom();
    this.bindEvents();
    this.renderDashboard();
    console.log('Family Hotel Manager inizializzato con', this.preventivi.length, 'preventivi');
  }

  cacheDom() {
    this.dashboardBody = document.getElementById('dashboard-body');
    this.sections = {
      dashboard: document.getElementById('section-dashboard'),
      add: document.getElementById('section-add'),
      importEmail: document.getElementById('section-import-email'),
      importUrl: document.getElementById('section-import-url'),
    };
    
    this.navButtons = {
      dashboard: document.getElementById('nav-dashboard'),
      add: document.getElementById('nav-add'),
      importEmail: document.getElementById('nav-import-email'),
      importUrl: document.getElementById('nav-import-url'),
    };

    this.form = document.getElementById('quote-form');
    this.hotelInput = document.getElementById('hotel');
    this.prezzoInput = document.getElementById('prezzo');
    this.checkInInput = document.getElementById('checkIn');
    this.checkOutInput = document.getElementById('checkOut');
    this.currentEditIdInput = document.getElementById('currentEditId');
    this.submitBtn = document.getElementById('submitBtn');
    this.cancelEditBtn = document.getElementById('cancelEditBtn');

    this.importUrlInput = document.getElementById('importUrlInput');
    this.importUrlBtn = document.getElementById('importUrlBtn');
    this.urlPreview = document.getElementById('urlPreview');
  }

  bindEvents() {
    // Navigation events
    Object.keys(this.navButtons).forEach(key => {
      if (this.navButtons[key]) {
        this.navButtons[key].addEventListener('click', () => this.showSection(key));
      }
    });

    // Form events
    if (this.form) {
      this.form.addEventListener('submit', e => this.handleFormSubmit(e));
    }
    
    if (this.cancelEditBtn) {
      this.cancelEditBtn.addEventListener('click', () => this.cancelEdit());
    }

    // Dashboard events (edit/delete buttons)
    if (this.dashboardBody) {
      this.dashboardBody.addEventListener('click', e => {
        if (e.target.classList.contains('edit-btn')) {
          const id = e.target.closest('tr').dataset.id;
          this.startEdit(id);
        } else if (e.target.classList.contains('delete-btn')) {
          const id = e.target.closest('tr').dataset.id;
          this.deletePreventivo(id);
        }
      });
    }

    // URL import events
    if (this.importUrlBtn) {
      this.importUrlBtn.addEventListener('click', () => this.handleImportUrl());
    }
  }

  showSection(name) {
    console.log('Switching to section:', name);
    Object.keys(this.sections).forEach(key => {
      if (this.sections[key]) {
        this.sections[key].classList.toggle('active', key === name);
      }
    });
  }

  loadPreventivi() {
    const data = localStorage.getItem('familyHotelPreventivi');
    if (data) {
      try {
        this.preventivi = JSON.parse(data);
      } catch (e) {
        console.error('Errore nel caricare i preventivi:', e);
        this.preventivi = [];
      }
    } else {
      // Dati di esempio per il primo avvio
      this.preventivi = this.getExampleData();
      this.savePreventivi();
    }
  }

  savePreventivi() {
    localStorage.setItem('familyHotelPreventivi', JSON.stringify(this.preventivi));
  }

  getExampleData() {
    return [
      {
        id: 'example1',
        hotel: 'Family Resort Marina',
        prezzo: 1250,
        checkIn: '2025-08-01',
        checkOut: '2025-08-08',
        stelle: 4,
        servizi: ['piscina', 'miniClub', 'animazione', 'spiaggiaPrivata'],
        source: 'manuale'
      },
      {
        id: 'example2', 
        hotel: 'Hotel Bambini Felici',
        prezzo: 890,
        checkIn: '2025-07-15',
        checkOut: '2025-07-22',
        stelle: 3,
        servizi: ['piscina', 'miniClub', 'parcheggio'],
        source: 'manuale'
      },
      {
        id: 'example3',
        hotel: 'Residence Luna Mare',
        prezzo: 1400,
        checkIn: '2025-08-10',
        checkOut: '2025-08-17',
        stelle: 5,
        servizi: ['piscina', 'miniClub', 'animazione', 'spiaggiaPrivata', 'spa'],
        source: 'manuale'
      }
    ];
  }

  renderDashboard() {
    if (!this.dashboardBody) return;
    
    this.dashboardBody.innerHTML = '';
    
    if (this.preventivi.length === 0) {
      this.dashboardBody.innerHTML = '<tr><td colspan="5">Nessun preventivo trovato. Aggiungi il primo!</td></tr>';
      return;
    }

    this.preventivi.forEach(preventivo => {
      const tr = document.createElement('tr');
      tr.dataset.id = preventivo.id;
      
      if (this.editingId === preventivo.id) {
        tr.classList.add('editing');
      }
      
      const stelle = '★'.repeat(preventivo.stelle || 0);
      const servizi = (preventivo.servizi || []).slice(0, 2).join(', ');
      
      tr.innerHTML = `
        <td>${preventivo.hotel}</td>
        <td>€${preventivo.prezzo.toFixed(2)}</td>
        <td>${preventivo.checkIn} - ${preventivo.checkOut}</td>
        <td>${stelle}</td>
        <td class="actions-cell">
          <button class="edit-btn">Modifica</button>
          <button class="delete-btn">Elimina</button>
        </td>
      `;
      
      this.dashboardBody.appendChild(tr);
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    const hotel = this.hotelInput?.value?.trim() || '';
    const prezzo = parseFloat(this.prezzoInput?.value || '0');
    const checkIn = this.checkInInput?.value || '';
    const checkOut = this.checkOutInput?.value || '';

    if (!hotel || isNaN(prezzo) || prezzo <= 0 || !checkIn || !checkOut) {
      this.showToast('Compila tutti i campi correttamente', 'error');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      this.showToast('La data di check-out deve essere successiva al check-in', 'error');
      return;
    }

    if (this.editingId) {
      // Modifica preventivo esistente
      const index = this.preventivi.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        this.preventivi[index] = {
          ...this.preventivi[index],
          hotel,
          prezzo,
          checkIn,
          checkOut
        };
        this.showToast('Preventivo aggiornato con successo', 'success');
      }
      this.cancelEdit();
    } else {
      // Nuovo preventivo
      const newPreventivo = {
        id: this.generateId(),
        hotel,
        prezzo,
        checkIn,
        checkOut,
        stelle: this.calculateStelle(prezzo),
        servizi: [],
        source: 'manuale'
      };
      
      this.preventivi.push(newPreventivo);
      this.showToast('Preventivo aggiunto con successo', 'success');
    }

    this.savePreventivi();
    this.form?.reset();
    this.renderDashboard();
    this.showSection('dashboard');
  }

  startEdit(id) {
    const preventivo = this.preventivi.find(p => p.id === id);
    if (!preventivo) return;

    this.editingId = id;
    
    if (this.currentEditIdInput) this.currentEditIdInput.value = id;
    if (this.hotelInput) this.hotelInput.value = preventivo.hotel;
    if (this.prezzoInput) this.prezzoInput.value = preventivo.prezzo;
    if (this.checkInInput) this.checkInInput.value = preventivo.checkIn;
    if (this.checkOutInput) this.checkOutInput.value = preventivo.checkOut;
    
    if (this.submitBtn) this.submitBtn.textContent = 'Aggiorna preventivo';
    if (this.cancelEditBtn) this.cancelEditBtn.style.display = 'inline-block';
    
    this.renderDashboard();
    this.showSection('add');
    this.showToast('Modalità modifica attivata', 'info');
  }

  cancelEdit() {
    this.editingId = null;
    
    if (this.currentEditIdInput) this.currentEditIdInput.value = '';
    if (this.form) this.form.reset();
    if (this.submitBtn) this.submitBtn.textContent = 'Aggiungi preventivo';
    if (this.cancelEditBtn) this.cancelEditBtn.style.display = 'none';
    
    this.renderDashboard();
    this.showSection('dashboard');
  }

  deletePreventivo(id) {
    const preventivo = this.preventivi.find(p => p.id === id);
    if (!preventivo) return;

    if (confirm(`Sei sicuro di voler eliminare il preventivo per "${preventivo.hotel}"?`)) {
      this.preventivi = this.preventivi.filter(p => p.id !== id);
      this.savePreventivi();
      this.showToast(`Preventivo "${preventivo.hotel}" eliminato`, 'info');
      
      if (this.editingId === id) {
        this.cancelEdit();
      }
      
      this.renderDashboard();
    }
  }

  generateId() {
    return 'prev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  calculateStelle(prezzo) {
    if (prezzo < 500) return 2;
    if (prezzo < 800) return 3;
    if (prezzo < 1200) return 4;
    return 5;
  }

  async handleImportUrl() {
    const url = this.importUrlInput?.value?.trim();
    if (!url) {
      this.showToast('Inserisci un URL valido', 'error');
      return;
    }

    if (!this.isValidUrl(url)) {
      this.showToast('URL non valido. Deve iniziare con http:// o https://', 'error');
      return;
    }

    this.showToast('Estrazione dati in corso...', 'info');
    this.importUrlBtn.disabled = true;
    this.importUrlBtn.textContent = 'Elaborazione...';

    try {
      const extractedData = await this.extractUrlData(url);
      if (extractedData) {
        this.populateFormWithExtractedData(extractedData);
        this.showUrlPreview(extractedData);
        this.showToast('Dati estratti con successo! Controlla e modifica se necessario.', 'success');
      } else {
        this.showToast('Nessun dato valido trovato nell\'URL', 'warning');
      }
    } catch (error) {
      console.error('Errore estrazione URL:', error);
      this.showToast('Impossibile estrarre dati da questo URL. Verifica che sia accessibile pubblicamente.', 'error');
    } finally {
      this.importUrlBtn.disabled = false;
      this.importUrlBtn.textContent = 'Estrai dati';
    }
  }

  async extractUrlData(url) {
    let lastError = null;
    
    for (let i = 0; i < this.corsProxies.length; i++) {
      const proxy = this.corsProxies[i];
      this.showToast(`Tentativo ${i + 1}/${this.corsProxies.length}: ${proxy.name}...`, 'info');
      
      try {
        const proxyUrl = proxy.url + encodeURIComponent(url);
        console.log(`Tentando proxy ${proxy.name}:`, proxyUrl);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), proxy.timeout);
        
        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'FamilyHotelManager/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let html;
        if (proxy.responseType === 'json') {
          const jsonData = await response.json();
          if (jsonData.contents) {
            html = jsonData.contents;
          } else if (typeof jsonData === 'string') {
            html = jsonData;
          } else {
            throw new Error('Formato JSON non valido');
          }
        } else {
          html = await response.text();
        }
        
        if (html && html.length > 100) {
          this.showToast(`Dati estratti con successo! Proxy usato: ${proxy.name}`, 'success');
          return this.parseHtmlForHotelData(html);
        } else {
          throw new Error('Contenuto troppo breve o vuoto');
        }
        
      } catch (error) {
        lastError = error;
        console.log(`Proxy ${proxy.name} fallito:`, error.message);
        this.showToast(`${proxy.name} non disponibile, provo il successivo...`, 'warning');
        continue;
      }
    }
    
    throw new Error(`Tutti i proxy hanno fallito. Ultimo errore: ${lastError?.message || 'Sconosciuto'}`);
  }

  parseHtmlForHotelData(html) {
    console.log('Parsing HTML per dati hotel...');
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Estrazione nome hotel
    let hotel = '';
    
    // Prova meta tag Open Graph
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      hotel = ogTitle.getAttribute('content');
    }
    
    // Prova title tag
    if (!hotel) {
      const titleTag = doc.querySelector('title');
      if (titleTag) {
        hotel = titleTag.textContent;
      }
    }
    
    // Prova header H1
    if (!hotel) {
      const h1 = doc.querySelector('h1');
      if (h1) {
        hotel = h1.textContent;
      }
    }
    
    // Pulizia nome hotel
    if (hotel) {
      hotel = hotel.replace(/\s*\|\s*.*$/, '') // Rimuove tutto dopo il primo |
                   .replace(/\s*-\s*.*$/, '')  // Rimuove tutto dopo il primo -
                   .trim()
                   .substring(0, 100); // Limita lunghezza
    }
    
    // Estrazione prezzo
    let prezzo = null;
    const priceRegexes = [
      /€\s*(\d{1,4}(?:[.,]\d{2})?)/g,
      /(\d{1,4}(?:[.,]\d{2})?)\s*€/g,
      /EUR\s*(\d{1,4}(?:[.,]\d{2})?)/g,
      /(\d{1,4}(?:[.,]\d{2})?)\s*EUR/g
    ];
    
    const text = doc.body.textContent || '';
    for (const regex of priceRegexes) {
      const matches = Array.from(text.matchAll(regex));
      for (const match of matches) {
        const price = parseFloat(match[1].replace(',', '.'));
        if (price >= 200 && price <= 5000) {
          prezzo = price;
          break;
        }
      }
      if (prezzo) break;
    }
    
    // Estrazione servizi
    const servizi = [];
    const serviceKeywords = {
      'piscina': /piscin[ae]|pool|swimming/i,
      'miniClub': /mini\s*club|kids\s*club|bambini/i,
      'animazione': /animazion[ei]|entertainment|attivit[àa]/i,
      'spiaggiaPrivata': /spiaggia\s*privata|private\s*beach/i,
      'parcheggio': /parcheggio|parking/i,
      'spa': /spa|wellness|benessere/i
    };
    
    Object.keys(serviceKeywords).forEach(service => {
      if (serviceKeywords[service].test(text)) {
        servizi.push(service);
      }
    });
    
    // Estrazione date (tentativo base)
    let checkIn = '';
    let checkOut = '';
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g;
    const dateMatches = Array.from(text.matchAll(dateRegex));
    if (dateMatches.length >= 2) {
      checkIn = this.formatDate(dateMatches[0][0]);
      checkOut = this.formatDate(dateMatches[1][0]);
    }
    
    return {
      hotel: hotel || 'Hotel estratto',
      prezzo: prezzo || 1000,
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      servizi: servizi,
      source: 'url'
    };
  }

  formatDate(dateStr) {
    try {
      // Prova a convertire date in formato DD/MM/YYYY o DD-MM-YYYY
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.log('Errore nel parsing data:', e);
    }
    return '';
  }

  populateFormWithExtractedData(data) {
    if (this.hotelInput && data.hotel) {
      this.hotelInput.value = data.hotel;
    }
    
    if (this.prezzoInput && data.prezzo) {
      this.prezzoInput.value = data.prezzo;
    }
    
    if (this.checkInInput && data.checkIn) {
      this.checkInInput.value = data.checkIn;
    }
    
    if (this.checkOutInput && data.checkOut) {
      this.checkOutInput.value = data.checkOut;
    }
    
    this.showSection('add');
  }

  showUrlPreview(data) {
    if (!this.urlPreview) return;
    
    const serviziText = data.servizi.length > 0 ? data.servizi.join(', ') : 'Nessun servizio identificato';
    
    this.urlPreview.innerHTML = `
      <div class="preview-card">
        <h4>Anteprima dati estratti:</h4>
        <div class="preview-content">
          <p><strong>Hotel:</strong> ${data.hotel}</p>
          <p><strong>Prezzo:</strong> €${data.prezzo}</p>
          <p><strong>Check-in:</strong> ${data.checkIn || 'Non specificato'}</p>
          <p><strong>Check-out:</strong> ${data.checkOut || 'Non specificato'}</p>
          <p><strong>Servizi:</strong> ${serviziText}</p>
        </div>
        <p class="preview-note">I dati sono stati precompilati nel form. Modifica se necessario e salva.</p>
      </div>
    `;
    
    this.urlPreview.style.display = 'block';
  }

  isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  showToast(message, type = 'info') {
    console.log(`Toast: ${type} ${message}`);
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    // Animazione di entrata
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Rimozione automatica dopo 4 secondi
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }
}

// Inizializzazione quando DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app');
  window.familyHotelManager = new FamilyHotelManager();
});
