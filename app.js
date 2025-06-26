/**
 * Family Hotel Manager - Versione 2025
 * Sistema completo per gestione preventivi hotel per famiglie
 * Con proxy CORS aggiornati e funzionanti per il 2025
 */

class FamilyHotelManager {
  constructor() {
    console.log('Initializing Family Hotel Manager');
    
    // Configurazione servizi hotel con pesi per scoring
    this.servicesHighPriority = [
      { nome: 'piscinaBambini', label: 'Piscina per bambini', peso: 10 },
      { nome: 'miniclub', label: 'Mini club', peso: 10 },
      { nome: 'animazione', label: 'Animazione', peso: 10 },
      { nome: 'spiaggiaPrivata', label: 'Spiaggia privata', peso: 10 },
      { nome: 'ristoranteBambini', label: 'Ristorante bambini', peso: 10 },
      { nome: 'parcoBambini', label: 'Parco giochi', peso: 10 }
    ];

    this.servicesMediumPriority = [
      { nome: 'allInclusive', label: 'All inclusive', peso: 6 },
      { nome: 'beachClub', label: 'Beach club', peso: 6 },
      { nome: 'wifiGratuito', label: 'WiFi gratuito', peso: 6 },
      { nome: 'parcheggioGratuito', label: 'Parcheggio gratuito', peso: 6 },
      { nome: 'palestra', label: 'Palestra', peso: 6 },
      { nome: 'spa', label: 'Spa', peso: 6 }
    ];

    this.servicesLowPriority = [
      { nome: 'ristorante', label: 'Ristorante', peso: 3 },
      { nome: 'bar', label: 'Bar', peso: 3 },
      { nome: 'ariaCondizionata', label: 'Aria condizionata', peso: 3 },
      { nome: 'ascensore', label: 'Ascensore', peso: 3 }
    ];

    this.preventivi = [];
    this.editingId = null;
    
    this.init();
  }

  // Inizializzazione dell'applicazione
  init() {
    this.loadFromLocalStorage();
    this.cacheDomElements();
    this.setupEventListeners();
    this.updateDashboard();
    console.log('Initialization complete, preventivi:', this.preventivi.length);
  }

  // Cache elementi DOM con controlli di sicurezza
  cacheDomElements() {
    // Sezioni principali
    this.sections = {
      dashboard: this.getElementById('section-dashboard'),
      add: this.getElementById('section-add'),
      importUrl: this.getElementById('section-import-url')
    };

    // Navigazione
    this.navDashboard = this.getElementById('navDashboard');
    this.navAdd = this.getElementById('navAdd');
    this.navImportUrl = this.getElementById('navImportUrl');

    // Form elementi
    this.quoteForm = this.getElementById('quoteForm');
    this.hotelInput = this.getElementById('hotel');
    this.prezzoInput = this.getElementById('prezzo');
    this.checkInInput = this.getElementById('checkIn');
    this.checkOutInput = this.getElementById('checkOut');
    this.adultiInput = this.getElementById('adulti');
    this.bambiniInput = this.getElementById('bambini');
    this.editIdInput = this.getElementById('editId');
    this.submitBtn = this.getElementById('submitBtn');
    this.cancelEditBtn = this.getElementById('cancelEditBtn');
    this.formTitle = this.getElementById('formTitle');

    // Dashboard elementi
    this.dashboardBody = this.getElementById('dashboardBody');
    this.totalPreventiviStat = this.getElementById('totalPreventivi');
    this.avgPriceStat = this.getElementById('avgPrice');
    this.bestHotelStat = this.getElementById('bestHotel');

    // Import URL elementi
    this.importUrlInput = this.getElementById('importUrlInput');
    this.importUrlBtn = this.getElementById('importUrlBtn');
    this.extractionPreview = this.getElementById('extractionPreview');
    this.previewContent = this.getElementById('previewContent');

    // Modal elementi
    this.deleteModal = this.getElementById('deleteModal');
    this.confirmDeleteBtn = this.getElementById('confirmDelete');
    this.cancelDeleteBtn = this.getElementById('cancelDelete');
    this.helpModal = this.getElementById('helpModal');

    // Container servizi
    this.serviziContainer = this.getElementById('servizi-container');
  }

  // Helper sicuro per getElementById
  getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Elemento con ID '${id}' non trovato nel DOM`);
    }
    return element;
  }

  // Helper sicuro per impostare valori
  setElementValue(id, value) {
    const element = this.getElementById(id);
    if (element) {
      element.value = value;
    }
  }

  // Helper sicuro per ottenere valori
  getElementValue(id) {
    const element = this.getElementById(id);
    return element ? element.value : '';
  }

  // Setup event listeners con controlli di sicurezza
  setupEventListeners() {
    console.log('Setting up event listeners');

    // Navigazione
    if (this.navDashboard) {
      this.navDashboard.addEventListener('click', () => this.showSection('dashboard'));
    }
    if (this.navAdd) {
      this.navAdd.addEventListener('click', () => {
        this.resetForm();
        this.showSection('add');
      });
    }
    if (this.navImportUrl) {
      this.navImportUrl.addEventListener('click', () => this.showSection('importUrl'));
    }

    // Form submission
    if (this.quoteForm) {
      this.quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Pulsanti form
    if (this.cancelEditBtn) {
      this.cancelEditBtn.addEventListener('click', () => {
        this.resetForm();
        this.showSection('dashboard');
      });
    }

    // Import URL
    if (this.importUrlBtn) {
      this.importUrlBtn.addEventListener('click', () => this.extractUrlData());
    }

    // Dashboard actions (usando event delegation)
    if (this.dashboardBody) {
      this.dashboardBody.addEventListener('click', (e) => {
        const target = e.target;
        const row = target.closest('tr');
        
        if (target.classList.contains('edit-btn') && row) {
          const id = row.dataset.id;
          this.editPreventivo(id);
        } else if (target.classList.contains('delete-btn') && row) {
          const id = row.dataset.id;
          this.showDeleteModal(id);
        }
      });
    }

    // Modal delete confirmation
    if (this.confirmDeleteBtn) {
      this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
    }
    if (this.cancelDeleteBtn) {
      this.cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
    }

    // Close modal on overlay click
    if (this.deleteModal) {
      this.deleteModal.addEventListener('click', (e) => {
        if (e.target === this.deleteModal) {
          this.hideDeleteModal();
        }
      });
    }
  }

  // Gestione sezioni
  showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Rimuovi classe active da tutte le sezioni
    Object.values(this.sections).forEach(section => {
      if (section) section.classList.remove('active');
    });

    // Rimuovi classe active da tutti i pulsanti nav
    [this.navDashboard, this.navAdd, this.navImportUrl].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    // Attiva sezione corrente
    if (this.sections[sectionName]) {
      this.sections[sectionName].classList.add('active');
    }

    // Attiva pulsante nav corrente
    const navButtons = {
      dashboard: this.navDashboard,
      add: this.navAdd,
      importUrl: this.navImportUrl
    };
    
    if (navButtons[sectionName]) {
      navButtons[sectionName].classList.add('active');
    }
  }

  // Gestione localStorage
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('familyHotelPreventivi');
      this.preventivi = data ? JSON.parse(data) : [];
      
      if (this.preventivi.length === 0) {
        this.initializeExampleData();
      }
      
      console.log('Data loaded from localStorage:', this.preventivi.length, 'items');
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.preventivi = [];
      this.initializeExampleData();
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('familyHotelPreventivi', JSON.stringify(this.preventivi));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      this.showToast('Errore nel salvataggio dati', 'error');
    }
  }

  // Dati di esempio
  initializeExampleData() {
    this.preventivi = [
      {
        id: '1',
        hotel: 'Family Resort Marina',
        prezzo: 1500,
        checkIn: '2025-07-15',
        checkOut: '2025-07-22',
        adulti: 2,
        bambini: 2,
        servizi: {
          piscinaBambini: true,
          miniclub: true,
          animazione: true,
          spiaggiaPrivata: true,
          allInclusive: true,
          wifiGratuito: true
        },
        score: 66,
        stelle: 4
      },
      {
        id: '2',
        hotel: 'Hotel Bellavista',
        prezzo: 1050,
        checkIn: '2025-07-10',
        checkOut: '2025-07-17',
        adulti: 2,
        bambini: 2,
        servizi: {
          piscinaBambini: true,
          miniclub: true,
          animazione: false,
          ristorante: true,
          bar: true
        },
        score: 29,
        stelle: 2
      }
    ];
    this.saveToLocalStorage();
  }

  // Gestione form
  handleFormSubmit() {
    const formData = this.collectFormData();
    
    if (!this.validateFormData(formData)) {
      return;
    }

    // Calcola score e stelle
    formData.score = this.calculateScore(formData.servizi);
    formData.stelle = Math.max(1, Math.min(5, Math.round(formData.score / 20)));

    if (this.editingId) {
      // Modifica preventivo esistente
      const index = this.preventivi.findIndex(p => p.id === this.editingId);
      if (index !== -1) {
        formData.id = this.editingId;
        this.preventivi[index] = formData;
        this.showToast('Preventivo aggiornato con successo', 'success');
      }
    } else {
      // Nuovo preventivo
      formData.id = this.generateId();
      this.preventivi.push(formData);
      this.showToast('Preventivo aggiunto con successo', 'success');
    }

    this.saveToLocalStorage();
    this.updateDashboard();
    this.resetForm();
    this.showSection('dashboard');
  }

  collectFormData() {
    const formData = {
      hotel: this.getElementValue('hotel'),
      prezzo: parseFloat(this.getElementValue('prezzo')),
      checkIn: this.getElementValue('checkIn'),
      checkOut: this.getElementValue('checkOut'),
      adulti: parseInt(this.getElementValue('adulti')) || 2,
      bambini: parseInt(this.getElementValue('bambini')) || 2,
      servizi: {}
    };

    // Raccolta servizi
    if (this.serviziContainer) {
      const checkboxes = this.serviziContainer.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        formData.servizi[checkbox.name] = checkbox.checked;
      });
    }

    return formData;
  }

  validateFormData(data) {
    if (!data.hotel || !data.hotel.trim()) {
      this.showToast('Il nome dell\'hotel è obbligatorio', 'error');
      return false;
    }

    if (isNaN(data.prezzo) || data.prezzo <= 0) {
      this.showToast('Il prezzo deve essere un numero valido maggiore di 0', 'error');
      return false;
    }

    if (!data.checkIn) {
      this.showToast('La data di check-in è obbligatoria', 'error');
      return false;
    }

    if (!data.checkOut) {
      this.showToast('La data di check-out è obbligatoria', 'error');
      return false;
    }

    if (new Date(data.checkIn) >= new Date(data.checkOut)) {
      this.showToast('La data di check-out deve essere successiva al check-in', 'error');
      return false;
    }

    return true;
  }

  calculateScore(servizi) {
    let score = 0;
    
    this.servicesHighPriority.forEach(service => {
      if (servizi[service.nome]) {
        score += service.peso;
      }
    });
    
    this.servicesMediumPriority.forEach(service => {
      if (servizi[service.nome]) {
        score += service.peso;
      }
    });
    
    this.servicesLowPriority.forEach(service => {
      if (servizi[service.nome]) {
        score += service.peso;
      }
    });
    
    return score;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  resetForm() {
    if (this.quoteForm) {
      this.quoteForm.reset();
    }
    
    this.setElementValue('editId', '');
    
    if (this.submitBtn) {
      this.submitBtn.textContent = '➕ Aggiungi Preventivo';
    }
    
    if (this.formTitle) {
      this.formTitle.textContent = 'Aggiungi Nuovo Preventivo';
    }
    
    if (this.cancelEditBtn) {
      this.cancelEditBtn.style.display = 'none';
    }
    
    this.editingId = null;
  }

  // Dashboard management
  updateDashboard() {
    this.updateStats();
    this.renderTable();
  }

  updateStats() {
    const total = this.preventivi.length;
    const avgPrice = total > 0 ? 
      Math.round(this.preventivi.reduce((sum, p) => sum + p.prezzo, 0) / total) : 0;
    const bestHotel = this.preventivi.length > 0 ? 
      this.preventivi.reduce((best, current) => 
        (!best || current.score > best.score) ? current : best
      ) : null;

    if (this.totalPreventiviStat) {
      this.totalPreventiviStat.textContent = total;
    }
    if (this.avgPriceStat) {
      this.avgPriceStat.textContent = `€${avgPrice}`;
    }
    if (this.bestHotelStat) {
      this.bestHotelStat.textContent = bestHotel ? bestHotel.hotel : '-';
    }
  }

  renderTable() {
    if (!this.dashboardBody) return;
    
    this.dashboardBody.innerHTML = '';
    
    this.preventivi.forEach(preventivo => {
      const row = document.createElement('tr');
      row.dataset.id = preventivo.id;
      
      row.innerHTML = `
        <td>${preventivo.hotel}</td>
        <td>€${preventivo.prezzo.toFixed(2)}</td>
        <td>${this.formatDate(preventivo.checkIn)} - ${this.formatDate(preventivo.checkOut)}</td>
        <td>${'⭐'.repeat(preventivo.stelle)}</td>
        <td>
          <button class="edit-btn">✏️ Modifica</button>
          <button class="delete-btn">🗑️ Elimina</button>
        </td>
      `;
      
      this.dashboardBody.appendChild(row);
    });
  }

  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  }

  // Edit preventivo
  editPreventivo(id) {
    const preventivo = this.preventivi.find(p => p.id === id);
    if (!preventivo) return;

    this.editingId = id;
    
    // Popola form
    this.setElementValue('hotel', preventivo.hotel);
    this.setElementValue('prezzo', preventivo.prezzo);
    this.setElementValue('checkIn', preventivo.checkIn);
    this.setElementValue('checkOut', preventivo.checkOut);
    this.setElementValue('adulti', preventivo.adulti || 2);
    this.setElementValue('bambini', preventivo.bambini || 2);
    this.setElementValue('editId', preventivo.id);

    // Popola servizi
    if (this.serviziContainer && preventivo.servizi) {
      const checkboxes = this.serviziContainer.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = !!preventivo.servizi[checkbox.name];
      });
    }

    // Aggiorna UI
    if (this.submitBtn) {
      this.submitBtn.textContent = '💾 Aggiorna Preventivo';
    }
    if (this.formTitle) {
      this.formTitle.textContent = 'Modifica Preventivo';
    }
    if (this.cancelEditBtn) {
      this.cancelEditBtn.style.display = 'inline-block';
    }

    this.showSection('add');
  }

  // Delete preventivo
  showDeleteModal(id) {
    this.preventivToDelete = id;
    if (this.deleteModal) {
      this.deleteModal.style.display = 'flex';
      this.deleteModal.classList.add('show');
    }
  }

  hideDeleteModal() {
    if (this.deleteModal) {
      this.deleteModal.classList.remove('show');
      setTimeout(() => {
        this.deleteModal.style.display = 'none';
      }, 300);
    }
    this.preventivToDelete = null;
  }

  confirmDelete() {
    if (this.preventivToDelete) {
      const preventivo = this.preventivi.find(p => p.id === this.preventivToDelete);
      if (preventivo) {
        this.preventivi = this.preventivi.filter(p => p.id !== this.preventivToDelete);
        this.saveToLocalStorage();
        this.updateDashboard();
        this.showToast(`Preventivo "${preventivo.hotel}" eliminato`, 'info');
      }
    }
    this.hideDeleteModal();
  }

  // Toast notifications
  showToast(message, type = 'info') {
    console.log('Toast:', type, message);
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    // Animazione di entrata
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Rimozione automatica
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 4000);
  }

  // ===== ESTRAZIONE URL CON PROXY CORS 2025 =====
  async extractUrlData() {
    const url = this.getElementValue('importUrlInput');
    
    if (!url || !url.trim()) {
      this.showToast('Inserisci un URL valido', 'error');
      return;
    }

    // Proxy CORS aggiornati e verificati per il 2025
    const corsProxies = [
      {
        name: "AllOrigins API",
        url: "https://api.allorigins.win/get?url=",
        parseResponse: async (response) => {
          const data = await response.json();
          return data.contents || data.data || '';
        },
        timeout: 15000
      },
      {
        name: "CORS Anywhere", 
        url: "https://cors-anywhere.herokuapp.com/",
        parseResponse: async (response) => await response.text(),
        timeout: 12000
      },
      {
        name: "ThingProxy",
        url: "https://thingproxy.freeboard.io/fetch/",
        parseResponse: async (response) => await response.text(),
        timeout: 10000
      },
      {
        name: "Proxy Server",
        url: "https://proxy-server.herokuapp.com/",
        parseResponse: async (response) => await response.text(),
        timeout: 8000
      }
    ];

    this.showToast('Inizio estrazione dati...', 'info');

    for (let i = 0; i < corsProxies.length; i++) {
      const proxy = corsProxies[i];
      this.showToast(`Tentativo ${i + 1}/${corsProxies.length}: ${proxy.name}...`, 'info');
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), proxy.timeout);
        
        const proxyUrl = proxy.url + encodeURIComponent(url);
        console.log(`Trying proxy: ${proxy.name} - ${proxyUrl}`);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml,application/json',
            'User-Agent': 'Family-Hotel-Manager/3.0 (compatible; URL-Extractor)',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const html = await proxy.parseResponse(response);
        
        if (!html || html.length < 200) {
          throw new Error('Contenuto HTML insufficiente');
        }
        
        // Parse dei dati
        const extractedData = this.parseHtmlContent(html);
        
        if (extractedData && (extractedData.hotel || extractedData.prezzo)) {
          this.showToast(`Dati estratti con successo da ${proxy.name}!`, 'success');
          this.populateFormWithExtractedData(extractedData);
          this.showExtractionPreview(extractedData);
          return;
        } else {
          throw new Error('Dati hotel non identificati nel contenuto');
        }
        
      } catch (error) {
        console.warn(`Proxy ${proxy.name} fallito:`, error.message);
        
        if (error.name === 'AbortError') {
          this.showToast(`${proxy.name}: Timeout - provo proxy successivo`, 'warning');
        } else {
          console.error(`Errore dettagliato per ${proxy.name}:`, error);
        }
      }
    }
    
    // Tutti i proxy hanno fallito
    this.showUrlExtractionFallback();
  }

  parseHtmlContent(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Estrazione nome hotel
      let hotel = '';
      
      // Prova meta tags Open Graph
      const ogTitle = doc.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        hotel = ogTitle.getAttribute('content');
      }
      
      // Fallback al title
      if (!hotel) {
        const titleTag = doc.querySelector('title');
        if (titleTag) {
          hotel = titleTag.textContent.trim();
        }
      }
      
      // Fallback agli h1
      if (!hotel) {
        const h1 = doc.querySelector('h1');
        if (h1) {
          hotel = h1.textContent.trim();
        }
      }
      
      // Pulisci il nome hotel
      hotel = hotel.replace(/\s*-\s*.*$/, '').trim(); // Rimuovi suffissi dopo "-"
      
      // Estrazione prezzo
      let prezzo = null;
      const textContent = doc.body.textContent || '';
      
      // Pattern per prezzi in formato europeo
      const pricePatterns = [
        /(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?)[\s]*€/g,
        /€[\s]*(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
        /(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?)[\s]*EUR/g,
        /(\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?)[\s]*euro/ig
      ];
      
      for (const pattern of pricePatterns) {
        const matches = textContent.matchAll(pattern);
        for (const match of matches) {
          const priceStr = match[1].replace(/[.,](\d{2})$/, '.$1').replace(/[.,]/g, '');
          const priceNum = parseFloat(priceStr);
          if (priceNum >= 200 && priceNum <= 10000) { // Range realistico per preventivi hotel
            prezzo = priceNum;
            break;
          }
        }
        if (prezzo) break;
      }
      
      // Estrazione date
      let checkIn = null;
      let checkOut = null;
      
      const datePatterns = [
        /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g,
        /(\d{4})-(\d{1,2})-(\d{1,2})/g
      ];
      
      const foundDates = [];
      for (const pattern of datePatterns) {
        const matches = textContent.matchAll(pattern);
        for (const match of matches) {
          const year = match[3] || match[1];
          const month = match[2];
          const day = match[1] || match[3];
          
          if (year >= 2025 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            foundDates.push(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
          }
        }
      }
      
      if (foundDates.length >= 2) {
        foundDates.sort();
        checkIn = foundDates[0];
        checkOut = foundDates[1];
      }
      
      // Identificazione servizi
      const servizi = {};
      const lowerText = textContent.toLowerCase();
      
      // Mappa servizi con parole chiave
      const serviceKeywords = {
        piscinaBambini: ['piscina bambini', 'kids pool', 'children pool', 'piscina per bambini'],
        miniclub: ['mini club', 'kids club', 'miniclub', 'club bambini'],
        animazione: ['animazione', 'animation', 'entertainment', 'spettacoli'],
        spiaggiaPrivata: ['spiaggia privata', 'private beach', 'beach access'],
        allInclusive: ['all inclusive', 'tutto incluso', 'all-inclusive'],
        wifiGratuito: ['wifi gratuito', 'free wifi', 'internet gratuito'],
        parcheggioGratuito: ['parcheggio gratuito', 'free parking', 'parking gratuito'],
        ristorante: ['ristorante', 'restaurant', 'dining'],
        bar: ['bar', 'lounge', 'cocktail'],
        spa: ['spa', 'wellness', 'benessere'],
        palestra: ['palestra', 'fitness', 'gym']
      };
      
      Object.entries(serviceKeywords).forEach(([service, keywords]) => {
        servizi[service] = keywords.some(keyword => lowerText.includes(keyword));
      });
      
      return {
        hotel: hotel || 'Hotel estratto da URL',
        prezzo: prezzo,
        checkIn: checkIn,
        checkOut: checkOut,
        servizi: servizi,
        source: 'url'
      };
      
    } catch (error) {
      console.error('Errore nel parsing HTML:', error);
      return null;
    }
  }

  populateFormWithExtractedData(data) {
    try {
      if (data.hotel) {
        this.setElementValue('hotel', data.hotel);
      }
      
      if (data.prezzo) {
        this.setElementValue('prezzo', data.prezzo);
      }
      
      if (data.checkIn) {
        this.setElementValue('checkIn', data.checkIn);
      }
      
      if (data.checkOut) {
        this.setElementValue('checkOut', data.checkOut);
      }
      
      // Popola servizi
      if (data.servizi && this.serviziContainer) {
        const checkboxes = this.serviziContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          if (data.servizi.hasOwnProperty(checkbox.name)) {
            checkbox.checked = data.servizi[checkbox.name];
          }
        });
      }
      
    } catch (error) {
      console.error('Errore nel popolamento form:', error);
      this.showToast('Errore nell\'elaborazione dei dati estratti', 'error');
    }
  }

  showExtractionPreview(data) {
    if (!this.extractionPreview || !this.previewContent) return;
    
    let previewHtml = '<h4>📊 Dati Estratti:</h4><ul>';
    
    if (data.hotel) {
      previewHtml += `<li><strong>🏨 Hotel:</strong> ${data.hotel}</li>`;
    }
    if (data.prezzo) {
      previewHtml += `<li><strong>💰 Prezzo:</strong> €${data.prezzo}</li>`;
    }
    if (data.checkIn && data.checkOut) {
      previewHtml += `<li><strong>📅 Periodo:</strong> ${this.formatDate(data.checkIn)} - ${this.formatDate(data.checkOut)}</li>`;
    }
    
    // Conta servizi identificati
    const serviziTrovati = Object.values(data.servizi || {}).filter(Boolean).length;
    if (serviziTrovati > 0) {
      previewHtml += `<li><strong>🎯 Servizi identificati:</strong> ${serviziTrovati}</li>`;
    }
    
    previewHtml += '</ul>';
    
    this.previewContent.innerHTML = previewHtml;
    this.extractionPreview.style.display = 'block';
  }

  showUrlExtractionFallback() {
    this.showToast('Estrazione automatica fallita. Usa inserimento manuale assistito.', 'warning');
    
    if (this.helpModal) {
      this.helpModal.style.display = 'flex';
      this.helpModal.classList.add('show');
    }
  }
}

// Inizializzazione dell'app
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app');
  window.app = new FamilyHotelManager();
});
