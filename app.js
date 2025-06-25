/**
 * Family Hotel Manager
 * Sistema completo per gestione preventivi hotel per famiglie
 * Versione 3.2.0 - Giugno 2025
 * Con supporto per proxy CORS aggiornati
 */

class FamilyHotelManager {
  constructor() {
    console.log("Initializing Family Hotel Manager");
    this.servicesHighPriority = [
      { nome: "piscinaBambini", label: "Piscina per bambini", peso: 10 },
      { nome: "miniclub", label: "Mini club", peso: 10 },
      { nome: "animazione", label: "Animazione", peso: 10 },
      { nome: "spiaggiaPrivata", label: "Spiaggia privata", peso: 10 },
      { nome: "ristoranteBambini", label: "Ristorante bambini", peso: 10 },
      { nome: "parcoBambini", label: "Parco giochi", peso: 10 },
      { nome: "babySitting", label: "Baby sitting", peso: 10 },
      { nome: "escursioniFamiglia", label: "Escursioni famiglia", peso: 10 },
      { nome: "wifiGratuito", label: "WiFi gratuito", peso: 10 },
      { nome: "parcheggioGratuito", label: "Parcheggio gratuito", peso: 10 },
      { nome: "piscinaInterna", label: "Piscina interna", peso: 10 },
      { nome: "spaTrattamenti", label: "Spa e trattamenti", peso: 10 }
    ];

    this.servicesMediumPriority = [
      { nome: "aeroportoShuttle", label: "Navetta aeroporto", peso: 6 },
      { nome: "pet", label: "Ammessi animali", peso: 6 },
      { nome: "culle", label: "Culle disponibili", peso: 6 },
      { nome: "camereFamiliari", label: "Camere familiari", peso: 6 },
      { nome: "allInclusive", label: "All inclusive", peso: 6 },
      { nome: "beachClub", label: "Beach club", peso: 6 },
      { nome: "sportAcquatici", label: "Sport acquatici", peso: 6 },
      { nome: "pianoBar", label: "Piano bar", peso: 6 },
      { nome: "intrattenimentoSerale", label: "Intrattenimento serale", peso: 6 },
      { nome: "palestra", label: "Palestra", peso: 6 },
      { nome: "bikeRental", label: "Noleggio bici", peso: 6 },
      { nome: "escursioni", label: "Escursioni", peso: 6 }
    ];

    this.servicesLowPriority = [
      { nome: "ristorante", label: "Ristorante", peso: 3 },
      { nome: "bar", label: "Bar", peso: 3 }
    ];

    this.init();
  }

  /**
   * Inizializzazione dell'applicazione
   */
  init() {
    this.loadFromLocalStorage();
    this.setupEventListeners();
    this.updateDashboard();
    console.log("Initialization complete, preventivi:", this.preventivi.length);
  }

  /**
   * Carica i preventivi dal localStorage
   */
  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('preventivi');
      this.preventivi = data ? JSON.parse(data) : [];
      
      // Se non ci sono preventivi, carichiamo dati di esempio
      if (this.preventivi.length === 0) {
        this.initializeExampleData();
      }
      
      console.log("Data loaded from localStorage:", this.preventivi.length, "items");
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      this.preventivi = [];
      this.initializeExampleData();
    }
  }

  /**
   * Salva i preventivi nel localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('preventivi', JSON.stringify(this.preventivi));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      this.showToast("Errore nel salvataggio dati", "error");
    }
  }

  /**
   * Inizializza preventivi di esempio
   */
  initializeExampleData() {
    // Inizializza con dati di esempio
    this.preventivi = [
      {
        id: "1",
        hotel: "Family Resort Marina",
        prezzo: 1500,
        checkIn: "2025-07-15",
        checkOut: "2025-07-22",
        source: "esempio",
        adulti: 2,
        bambini: 2,
        stelle: 4,
        servizi: {
          piscinaBambini: true,
          miniclub: true,
          animazione: true,
          spiaggiaPrivata: true,
          ristoranteBambini: true,
          parcoBambini: true,
          wifiGratuito: true,
          parcheggioGratuito: true,
          allInclusive: true,
          beachClub: true,
          ristorante: true,
          bar: true
        },
        score: 76
      },
      {
        id: "2",
        hotel: "Hotel Bellavista",
        prezzo: 1050,
        checkIn: "2025-07-10",
        checkOut: "2025-07-17",
        source: "esempio",
        adulti: 2,
        bambini: 2,
        stelle: 3,
        servizi: {
          piscinaBambini: true,
          miniclub: true,
          animazione: true,
          spiaggiaPrivata: false,
          ristoranteBambini: true,
          parcoBambini: true,
          wifiGratuito: true,
          parcheggioGratuito: true,
          allInclusive: false,
          beachClub: false,
          ristorante: true,
          bar: true
        },
        score: 61
      },
      {
        id: "3",
        hotel: "Residence Luna Mare",
        prezzo: 990,
        checkIn: "2025-07-05",
        checkOut: "2025-07-12",
        source: "esempio",
        adulti: 2,
        bambini: 2,
        stelle: 3,
        servizi: {
          piscinaBambini: true,
          miniclub: false,
          animazione: true,
          spiaggiaPrivata: true,
          ristoranteBambini: false,
          parcoBambini: true,
          wifiGratuito: true,
          parcheggioGratuito: true,
          allInclusive: false,
          beachClub: true,
          ristorante: true,
          bar: true
        },
        score: 57
      }
    ];
    this.saveToLocalStorage();
  }

  /**
   * Configura tutti gli event listener
   */
  setupEventListeners() {
    console.log("Setting up event listeners");
    
    // Navigation
    document.getElementById('nav-dashboard').addEventListener('click', () => {
      console.log("Navigation clicked: dashboard");
      this.showSection('dashboard');
    });
    
    document.getElementById('nav-add').addEventListener('click', () => {
      console.log("Navigation clicked: add");
      this.showSection('add');
      this.resetForm();
    });
    
    document.getElementById('nav-import-url').addEventListener('click', () => {
      console.log("Navigation clicked: import-url");
      this.showSection('import-url');
    });
    
    // Form
    document.getElementById('quote-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
    
    // URL Import
    document.getElementById('import-url-btn').addEventListener('click', () => {
      this.extractUrlData();
    });
    
    // Pulsanti azione nella dashboard
    document.querySelector('.dashboard-table').addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-btn')) {
        const id = e.target.closest('tr').dataset.id;
        this.editPreventivo(id);
      } else if (e.target.classList.contains('delete-btn')) {
        const id = e.target.closest('tr').dataset.id;
        this.deletePreventivo(id);
      }
    });
    
    // Pulsante annulla modifica
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
      this.resetForm();
      this.showSection('dashboard');
    });
  }

  /**
   * Mostra la sezione specificata
   */
  showSection(sectionName) {
    console.log("Showing section:", sectionName);
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      section.classList.toggle('active', section.id === `section-${sectionName}`);
    });
  }

  /**
   * Aggiorna la dashboard con i dati attuali
   */
  updateDashboard() {
    console.log("Updating dashboard with", this.preventivi.length, "preventivi");
    this.renderTable();
    this.updateStats();
  }

  /**
   * Aggiorna le statistiche
   */
  updateStats() {
    let total = 0;
    let best = null;
    
    if (this.preventivi.length > 0) {
      total = this.preventivi.reduce((sum, p) => sum + p.prezzo, 0);
      best = this.preventivi.reduce((max, p) => (!max || p.score > max.score) ? p : max, null);
    }
    
    const avgPrice = this.preventivi.length > 0 ? Math.round(total / this.preventivi.length) : 0;
    
    console.log("Stats updated - Total:", this.preventivi.length, "Avg:", avgPrice, "Best:", best ? best.id : "none");
  }

  /**
   * Renderizza la tabella dei preventivi
   */
  renderTable() {
    console.log("Rendering table with", this.preventivi.length, "quotes");
    const tableBody = document.getElementById('dashboard-body');
    tableBody.innerHTML = '';
    
    this.preventivi.forEach(preventivo => {
      const row = document.createElement('tr');
      row.dataset.id = preventivo.id;
      
      row.innerHTML = `
        <td>${preventivo.hotel}</td>
        <td>${preventivo.prezzo.toFixed(2)} €</td>
        <td>${this.formatDate(preventivo.checkIn)} - ${this.formatDate(preventivo.checkOut)}</td>
        <td>${'★'.repeat(preventivo.stelle)}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn">Modifica</button>
          <button class="btn btn-sm btn-danger delete-btn">Elimina</button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }

  /**
   * Formatta una data ISO in formato italiano
   */
  formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('it-IT');
  }

  /**
   * Gestisce l'invio del form
   */
  handleFormSubmit() {
    const formData = {
      hotel: document.getElementById('hotel').value,
      prezzo: parseFloat(document.getElementById('prezzo').value),
      checkIn: document.getElementById('check-in').value,
      checkOut: document.getElementById('check-out').value,
      adulti: parseInt(document.getElementById('adulti').value, 10),
      bambini: parseInt(document.getElementById('bambini').value, 10),
    };
    
    // Validazione
    if (!formData.hotel || isNaN(formData.prezzo) || !formData.checkIn || !formData.checkOut) {
      this.showToast('Compila tutti i campi obbligatori', 'error');
      return;
    }
    
    // Servizi
    formData.servizi = {};
    const serviziInputs = document.querySelectorAll('#servizi-container input[type="checkbox"]');
    serviziInputs.forEach(input => {
      formData.servizi[input.name] = input.checked;
    });
    
    // Calcola score
    formData.score = this.calculateScore(formData.servizi);
    
    // Calcola stelle
    formData.stelle = Math.round(formData.score / 20);
    if (formData.stelle < 1) formData.stelle = 1;
    if (formData.stelle > 5) formData.stelle = 5;
    
    // Controlla se è una modifica
    const editId = document.getElementById('edit-id').value;
    
    if (editId) {
      // Aggiorna preventivo esistente
      const index = this.preventivi.findIndex(p => p.id === editId);
      if (index !== -1) {
        formData.id = editId;
        formData.source = this.preventivi[index].source;
        this.preventivi[index] = formData;
        this.showToast('Preventivo aggiornato con successo', 'success');
      }
    } else {
      // Nuovo preventivo
      formData.id = this.generateId();
      formData.source = 'manuale';
      this.preventivi.push(formData);
      this.showToast('Preventivo aggiunto con successo', 'success');
    }
    
    this.saveToLocalStorage();
    this.updateDashboard();
    this.resetForm();
    this.showSection('dashboard');
  }

  /**
   * Genera un ID univoco
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Calcola il punteggio in base ai servizi
   */
  calculateScore(servizi) {
    let score = 0;
    
    // Somma i pesi dei servizi high priority
    this.servicesHighPriority.forEach(service => {
      if (servizi[service.nome]) {
        score += service.peso;
      }
    });
    
    // Somma i pesi dei servizi medium priority
    this.servicesMediumPriority.forEach(service => {
      if (servizi[service.nome]) {
        score += service.peso;
      }
    });
    
    // Somma i pesi dei servizi low priority
    this.servicesLowPriority.forEach(service => {
      if (servizi[service.nome]) {
        score += service.peso;
      }
    });
    
    return score;
  }

  /**
   * Resetta il form
   */
  resetForm() {
    document.getElementById('quote-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('submit-btn').textContent = 'Aggiungi preventivo';
    document.getElementById('form-title').textContent = 'Aggiungi nuovo preventivo';
    document.getElementById('cancel-edit-btn').style.display = 'none';
  }

  /**
   * Mostra un messaggio toast
   */
  showToast(message, type = 'info') {
    console.log("Toast:", type, message);
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toast-container') || document.body;
    container.appendChild(toast);
    
    // Forza reflow per permettere l'animazione
    void toast.offsetWidth;
    
    // Mostra il toast
    toast.classList.add('show');
    
    // Rimuovi dopo 4 secondi
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300); // Attendi la fine dell'animazione
    }, 4000);
  }

  /**
   * Prepara il form per la modifica di un preventivo
   */
  editPreventivo(id) {
    const preventivo = this.preventivi.find(p => p.id === id);
    if (!preventivo) return;
    
    // Popola il form
    document.getElementById('hotel').value = preventivo.hotel;
    document.getElementById('prezzo').value = preventivo.prezzo;
    document.getElementById('check-in').value = preventivo.checkIn;
    document.getElementById('check-out').value = preventivo.checkOut;
    document.getElementById('adulti').value = preventivo.adulti || 2;
    document.getElementById('bambini').value = preventivo.bambini || 2;
    document.getElementById('edit-id').value = preventivo.id;
    
    // Imposta i servizi
    const serviziInputs = document.querySelectorAll('#servizi-container input[type="checkbox"]');
    serviziInputs.forEach(input => {
      input.checked = preventivo.servizi && preventivo.servizi[input.name] === true;
    });
    
    // Aggiorna UI per modifica
    document.getElementById('submit-btn').textContent = 'Aggiorna preventivo';
    document.getElementById('form-title').textContent = 'Modifica preventivo';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    
    this.showSection('add');
  }

  /**
   * Elimina un preventivo
   */
  deletePreventivo(id) {
    const preventivo = this.preventivi.find(p => p.id === id);
    if (!preventivo) return;
    
    if (confirm(`Sei sicuro di voler eliminare il preventivo per ${preventivo.hotel}?`)) {
      this.preventivi = this.preventivi.filter(p => p.id !== id);
      this.saveToLocalStorage();
      this.updateDashboard();
      this.showToast('Preventivo eliminato', 'info');
    }
  }

  /**
   * Estrae dati da un URL di preventivo hotel
   * Implementazione aggiornata con proxy CORS 2025
   */
  async extractUrlData() {
    const urlInput = document.getElementById('import-url-input');
    const url = urlInput.value.trim();
    
    if (!url) {
      this.showToast('Inserisci un URL valido', 'error');
      return;
    }
    
    // Lista di proxy CORS aggiornati per il 2025
    const corsProxies = [
      "https://corsproxy.io/?",
      "https://cors.x2u.in/",
      "https://api.codetabs.com/v1/proxy/?quest=",
      "https://proxy.corsfix.com/?",
      "https://api.allorigins.win/raw?url="
    ];
    
    // Sistema di fallback tra proxy
    for (let i = 0; i < corsProxies.length; i++) {
      const proxy = corsProxies[i];
      this.showToast(`Tentativo ${i+1}/${corsProxies.length}: ${proxy.split('//')[1].split('/')[0]}...`, 'info');
      
      try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        let html;
        
        // Gestione speciale per AllOrigins (formato JSON)
        if (proxy.includes('allorigins')) {
          const data = await response.json();
          html = data.contents || data.raw || '';
        } else {
          html = await response.text();
        }
        
        if (html) {
          this.showToast(`Dati estratti con successo! Proxy: ${proxy.split('//')[1].split('/')[0]}`, 'success');
          const data = this.parseHtmlContent(html);
          this.populateFormWithExtractedData(data);
          this.showUrlPreview(data);
          return;
        }
      } catch (error) {
        console.log(`Proxy ${proxy} fallito:`, error);
      }
    }
    
    this.showToast('Impossibile estrarre dati. Verifica che l\'URL sia accessibile.', 'error');
  }

  /**
   * Analizza il contenuto HTML per estrarre informazioni
   */
  parseHtmlContent(html) {
    // Crea un DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Estrai nome hotel
    let hotelName = '';
    
    // Prova meta tags
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      hotelName = ogTitle.getAttribute('content');
    }
    
    // Altrimenti prova il titolo
    if (!hotelName) {
      const title = doc.querySelector('title');
      if (title) {
        hotelName = title.textContent;
      }
    }
    
    // Estrai prezzo
    let prezzo = null;
    
    // Cerca pattern di prezzo nel testo
    const priceRegex = /(\d+[\.,]\d+)(?:\s*€|\s*EUR|\s*euro)/i;
    const textContent = doc.body.textContent;
    const priceMatch = textContent.match(priceRegex);
    
    if (priceMatch) {
      prezzo = parseFloat(priceMatch[1].replace(',', '.'));
    }
    
    // Cerca date
    let checkIn = null;
    let checkOut = null;
    
    // Pattern per date italiane/europee
    const dateRegex = /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4}|\d{2})/g;
    const dates = [];
    let match;
    
    while ((match = dateRegex.exec(textContent)) !== null) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3].length === 2 ? `20${match[3]}` : match[3];
      dates.push(`${year}-${month}-${day}`);
    }
    
    if (dates.length >= 2) {
      // Assume che le prime due date siano check-in e check-out
      dates.sort();
      checkIn = dates[0];
      checkOut = dates[1];
    }
    
    // Identifica servizi probabili
    const servizi = {
      piscinaBambini: /piscina\s+bambini|kids\s+pool|children.*pool/i.test(textContent),
      miniclub: /mini\s*club|kids\s*club/i.test(textContent),
      animazione: /animazione|animation|entertainment/i.test(textContent),
      spiaggiaPrivata: /spiaggia\s+privata|private\s+beach/i.test(textContent),
      ristoranteBambini: /ristorante\s+bambini|kids\s+restaurant|menu\s+bambini/i.test(textContent),
      parcoBambini: /parco\s+giochi|playground|area\s+giochi/i.test(textContent),
      wifiGratuito: /wifi\s+gratuit[oa]|free\s+wifi/i.test(textContent),
      parcheggioGratuito: /parcheggio\s+gratuit[oa]|free\s+parking/i.test(textContent),
      allInclusive: /all\s*-?\s*inclusive/i.test(textContent),
      beachClub: /beach\s*club/i.test(textContent),
      ristorante: /ristorante|restaurant/i.test(textContent),
      bar: /bar|lounge/i.test(textContent)
    };
    
    return {
      hotel: hotelName,
      prezzo,
      checkIn,
      checkOut,
      servizi,
      source: 'url'
    };
  }

  /**
   * Popola il form con i dati estratti
   */
  populateFormWithExtractedData(data) {
    // Popola solo i campi se sono disponibili i dati
    if (data.hotel) {
      const hotelInput = document.getElementById('hotel');
      if (hotelInput) hotelInput.value = data.hotel;
    }
    
    if (data.prezzo) {
      const prezzoInput = document.getElementById('prezzo');
      if (prezzoInput) prezzoInput.value = data.prezzo;
    }
    
    if (data.checkIn) {
      const checkInInput = document.getElementById('check-in');
      if (checkInInput) checkInInput.value = data.checkIn;
    }
    
    if (data.checkOut) {
      const checkOutInput = document.getElementById('check-out');
      if (checkOutInput) checkOutInput.value = data.checkOut;
    }
    
    // Popola i servizi
    if (data.servizi) {
      const serviziInputs = document.querySelectorAll('#servizi-container input[type="checkbox"]');
      serviziInputs.forEach(input => {
        if (data.servizi.hasOwnProperty(input.name)) {
          input.checked = data.servizi[input.name];
        }
      });
    }
    
    // Mostra form con dati precompilati
    this.showSection('add');
  }

  /**
   * Mostra anteprima dei dati estratti
   */
  showUrlPreview(data) {
    // Implementazione placeholder - può essere migliorata
    let message = `Dati estratti: ${data.hotel}`;
    if (data.prezzo) message += `, Prezzo: ${data.prezzo}€`;
    this.showToast(message, 'success');
  }
}

// Inizializza l'applicazione quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
  window.app = new FamilyHotelManager();
});
