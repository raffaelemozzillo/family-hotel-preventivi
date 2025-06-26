class FamilyHotelManager {
  constructor() {
    console.log("Initializing Family Hotel Manager");
    this.preventivi = [];
    this.loadFromLocalStorage();
    this.cacheDom();
    this.setupEventListeners();
    this.updateDashboard();
    this.editingId = null;
  }

  cacheDom() {
    this.dashboardBody = document.getElementById('dashboard-body');
    this.sections = {
      dashboard: document.getElementById('section-dashboard'),
      add: document.getElementById('section-add'),
      importUrl: document.getElementById('section-import-url'),
    };
    this.navDashboard = document.getElementById('nav-dashboard');
    this.navAdd = document.getElementById('nav-add');
    this.navImportUrl = document.getElementById('nav-import-url');

    this.form = document.getElementById('quote-form');
    this.hotelInput = document.getElementById('hotel');
    this.prezzoInput = document.getElementById('prezzo');
    this.checkInInput = document.getElementById('check-in');
    this.checkOutInput = document.getElementById('check-out');
    this.adultiInput = document.getElementById('adulti');
    this.bambiniInput = document.getElementById('bambini');
    this.editIdInput = document.getElementById('edit-id');
    this.submitBtn = document.getElementById('submitBtn');
    this.cancelEditBtn = document.getElementById('cancelEditBtn');

    this.importUrlInput = document.getElementById('importUrlInput');
    this.importUrlBtn = document.getElementById('importUrlBtn');
  }

  setupEventListeners() {
    this.navDashboard.addEventListener('click', () => this.showSection('dashboard'));
    this.navAdd.addEventListener('click', () => this.showSection('add'));
    this.navImportUrl.addEventListener('click', () => this.showSection('import-url'));

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
      this.resetForm();
      this.showSection('dashboard');
    });
    // Event delegation per modifica/elimina
    this.dashboardBody.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-btn')) {
        const id = e.target.closest('tr').dataset.id;
        this.editPreventivo(id);
      } else if (e.target.classList.contains('delete-btn')) {
        const id = e.target.closest('tr').dataset.id;
        this.deletePreventivo(id);
      }
    });
    // Import URL
    this.importUrlBtn?.addEventListener('click', () => this.extractUrlData());
  }

  showSection(sectionName) {
    for (const key in this.sections) {
      this.sections[key].classList.toggle('active', key === sectionName);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('preventivi');
      this.preventivi = data ? JSON.parse(data) : [];
      if (this.preventivi.length === 0) this.initializeExampleData();
    } catch (e) {
      console.error("Errore caricamento localStorage:", e);
      this.preventivi = [];
      this.initializeExampleData();
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('preventivi', JSON.stringify(this.preventivi));
    } catch (e) {
      console.error("Errore salvataggio localStorage:", e);
      this.showToast("Errore nel salvataggio dati", "error");
    }
  }

  initializeExampleData() {
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

  handleFormSubmit() {
    const hotel = this.hotelInput.value.trim();
    const prezzo = parseFloat(this.prezzoInput.value);
    const checkIn = this.checkInInput.value;
    const checkOut = this.checkOutInput.value;
    const adulti = parseInt(this.adultiInput.value, 10) || 2;
    const bambini = parseInt(this.bambiniInput.value, 10) || 2;

    if (!hotel || isNaN(prezzo) || !checkIn || !checkOut) {
      this.showToast('Compila tutti i campi obbligatori', 'error');
      return;
    }

    // Servizi
    const servizi = {};
    document.querySelectorAll('#servizi-container input[type="checkbox"]').forEach(input => {
      servizi[input.name] = input.checked;
    });

    const score = this.calculateScore(servizi);
    const stelle = Math.round(score / 20);
    const preventivo = {
      id: this.editingId || this.generateId(),
      hotel,
      prezzo,
      checkIn,
      checkOut,
      adulti,
      bambini,
      servizi,
      score,
      stelle
    };

    if (this.editingId) {
      const index = this.preventivi.findIndex(p => p.id === this.editingId);
      if (index !== -1) this.preventivi[index] = preventivo;
      this.showToast('Preventivo aggiornato', 'success');
    } else {
      this.preventivi.push(preventivo);
      this.showToast('Preventivo aggiunto', 'success');
    }

    this.saveToLocalStorage();
    this.updateDashboard();
    this.resetForm();
    this.showSection('dashboard');
  }

  generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateScore(servizi) {
    let score = 0;
    this.servicesHighPriority.forEach(s => { if (servizi[s.nome]) score += s.peso; });
    this.servicesMediumPriority.forEach(s => { if (servizi[s.nome]) score += s.peso; });
    this.servicesLowPriority.forEach(s => { if (servizi[s.nome]) score += s.peso; });
    return score;
  }

  resetForm() {
    document.getElementById('quote-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('submitBtn').textContent = 'Aggiungi preventivo';
    document.getElementById('form-title')?.setAttribute('data-title', 'Aggiungi nuovo preventivo');
    document.getElementById('cancelEditBtn')?.style.display = 'none';
    this.editingId = null;
  }

  updateDashboard() {
    this.renderTable();
    this.updateStats();
  }

  renderTable() {
    this.dashboardBody.innerHTML = '';
    this.preventivi.forEach(p => {
      const tr = document.createElement('tr');
      tr.dataset.id = p.id;
      tr.innerHTML = `
        <td>${p.hotel}</td>
        <td>${p.prezzo.toFixed(2)}</td>
        <td>${this.formatDate(p.checkIn)} - ${this.formatDate(p.checkOut)}</td>
        <td>${'★'.repeat(p.stelle)}</td>
        <td>
          <button class="edit-btn">Modifica</button>
          <button class="delete-btn">Elimina</button>
        </td>
      `;
      this.dashboardBody.appendChild(tr);
    });
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT');
  }

  editPreventivo(id) {
    const p = this.preventivi.find(p => p.id === id);
    if (!p) return;
    this.editingId = id;
    document.getElementById('hotel').value = p.hotel;
    document.getElementById('prezzo').value = p.prezzo;
    document.getElementById('check-in').value = p.checkIn;
    document.getElementById('check-out').value = p.checkOut;
    document.getElementById('adulti').value = p.adulti;
    document.getElementById('bambini').value = p.bambini;
    document.getElementById('edit-id').value = id;
    // Servizi
    Object.keys(p.servizi).forEach(key => {
      document.querySelector(`#servizi-container input[name="${key}"]`)?.checked = p.servizi[key];
    });
    document.getElementById('submitBtn').textContent = 'Aggiorna preventivo';
    document.getElementById('form-title')?.setAttribute('data-title', 'Modifica preventivo');
    document.getElementById('cancelEditBtn')?.style.display = 'inline-block';
    this.showSection('add');
  }

  deletePreventivo(id) {
    if (confirm('Sei sicuro di voler eliminare questo preventivo?')) {
      this.preventivi = this.preventivi.filter(p => p.id !== id);
      this.saveToLocalStorage();
      this.updateDashboard();
      this.showToast('Preventivo eliminato', 'info');
    }
  }

  async extractUrlData() {
    const url = document.getElementById('importUrlInput')?.value.trim();
    if (!url) {
      this.showToast('Inserisci un URL valido', 'error');
      return;
    }
    this.showToast('Estrazione dati in corso...', 'info');

    const proxies = [
      "https://corsproxy.io/?",
      "https://cors.x2u.in/",
      "https://api.codetabs.com/v1/proxy/?quest=",
      "https://proxy.corsfix.com/?",
      "https://api.allorigins.win/raw?url="
    ];

    for (let i = 0; i < proxies.length; i++) {
      const proxy = proxies[i];
      const proxyUrl = proxy + encodeURIComponent(url);
      this.showToast(`Tentativo ${i+1}/${proxies.length}: ${proxy.split('//')[1].split('/')[0]}...`, 'info');
      try {
        const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        let html;
        if (proxy.includes('allorigins')) {
          const data = await response.json();
          html = data.contents || data.raw || '';
        } else {
          html = await response.text();
        }
        if (html && html.length > 100) {
          this.showToast(`Dati estratti con successo! Proxy: ${proxy.split('//')[1].split('/')[0]}`, 'success');
          const data = this.parseHtmlContent(html);
          if (data && (data.hotel || data.prezzo)) {
            this.populateFormWithExtractedData(data);
            this.showUrlPreview(data);
            return;
          }
        }
      } catch (e) {
        console.log(`Proxy ${proxy} fallito:`, e);
      }
    }
    this.showToast('Impossibile estrarre dati. Verifica l\'URL.', 'error');
  }

  parseHtmlContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let hotel = '';
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    if (ogTitle) hotel = ogTitle.getAttribute('content');
    if (!hotel) {
      const title = doc.querySelector('title');
      if (title) hotel = title.textContent;
    }
    let prezzo = null;
    const priceRegex = /(\d+[\.,]\d+)(?:\s*€|\s*EUR|\s*euro)/i;
    const textContent = doc.body.textContent;
    const priceMatch = textContent.match(priceRegex);
    if (priceMatch) prezzo = parseFloat(priceMatch[1].replace(',', '.'));
    let checkIn = null;
    let checkOut = null;
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
      dates.sort();
      checkIn = dates[0];
      checkOut = dates[1];
    }
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
    return { hotel, prezzo, checkIn, checkOut, servizi, source: 'url' };
  }

  populateFormWithExtractedData(data) {
    try {
      if (data.hotel && document.getElementById('hotel')) document.getElementById('hotel').value = data.hotel;
      if (data.prezzo && document.getElementById('prezzo')) document.getElementById('prezzo').value = data.prezzo;
      if (data.checkIn && document.getElementById('check-in')) document.getElementById('check-in').value = data.checkIn;
      if (data.checkOut && document.getElementById('check-out')) document.getElementById('check-out').value = data.checkOut;
      if (data.servizi) {
        Object.keys(data.servizi).forEach(key => {
          document.querySelector(`#servizi-container input[name="${key}"]`)?.checked = data.servizi[key];
        });
      }
    } catch (e) {
      console.error("Errore popolamento form:", e);
      this.showToast("Errore nell'elaborazione dei dati", "error");
    }
  }

  showUrlPreview(data) {
    let msg = `Dati: ${data.hotel || 'Hotel sconosciuto'}`;
    if (data.prezzo) msg += `, Prezzo: ${data.prezzo}€`;
    if (data.checkIn && data.checkOut) msg += `, Periodo: ${this.formatDate(data.checkIn)} - ${this.formatDate(data.checkOut)}`;
    this.showToast(msg, 'success');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FamilyHotelManager();
});
