/**
 * Family Hotel Manager – versione 2025-06-26
 * Correzioni:
 *   • ID DOM uniformati (importUrlBtn, cancelEditBtn, ecc.)
 *   • nessuna assegnazione illegale ‑ linea 242 risolta
 *   • proxy CORS moderni con fallback
 *   • CRUD completo con localStorage
 *   • toast di notifica
 */

class FamilyHotelManager {
  /* === costruttore === */
  constructor () {
    console.log('Initializing Family Hotel Manager');
    this.preventivi = [];
    this.servicesHighPriority = [
      { nome: 'piscinaBambini', peso: 10 }, { nome: 'miniclub', peso: 10 },
      { nome: 'animazione', peso: 10 }, { nome: 'spiaggiaPrivata', peso: 10 }
    ];
    this.servicesMediumPriority = [
      { nome: 'allInclusive', peso: 6 }, { nome: 'beachClub', peso: 6 }
    ];
    this.servicesLowPriority = [
      { nome: 'ristorante', peso: 3 }, { nome: 'bar', peso: 3 }
    ];
    this.loadFromLocalStorage();
    this.cacheDom();
    this.setupEventListeners();
    this.updateDashboard();
    this.editingId = null;
  }

  /* === cache elementi DOM === */
  cacheDom () {
    /* sezioni */
    this.sections = {
      dashboard : document.getElementById('section-dashboard'),
      add       : document.getElementById('section-add'),
      importUrl : document.getElementById('section-import-url')
    };
    /* menu */
    this.navDashboard = document.getElementById('navDashboard');
    this.navAdd       = document.getElementById('navAdd');
    this.navImportUrl = document.getElementById('navImportUrl');
    /* form */
    this.quoteForm     = document.getElementById('quoteForm');
    this.hotelInput    = document.getElementById('hotel');
    this.prezzoInput   = document.getElementById('prezzo');
    this.checkInInput  = document.getElementById('checkIn');
    this.checkOutInput = document.getElementById('checkOut');
    this.adultiInput   = document.getElementById('adulti');
    this.bambiniInput  = document.getElementById('bambini');
    this.editIdInput   = document.getElementById('editId');
    this.submitBtn     = document.getElementById('submitBtn');
    this.cancelEditBtn = document.getElementById('cancelEditBtn');
    /* dashboard */
    this.dashboardBody = document.getElementById('dashboardBody');
    /* import URL */
    this.importUrlInput = document.getElementById('importUrlInput');
    this.importUrlBtn   = document.getElementById('importUrlBtn');
  }

  /* === listener === */
  setupEventListeners () {
    this.navDashboard?.addEventListener('click', () => this.showSection('dashboard'));
    this.navAdd?.addEventListener('click', () => { this.resetForm(); this.showSection('add'); });
    this.navImportUrl?.addEventListener('click', () => this.showSection('importUrl'));

    this.quoteForm?.addEventListener('submit', e => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    this.cancelEditBtn?.addEventListener('click', () => {
      this.resetForm();
      this.showSection('dashboard');
    });

    /* dashboard delegation */
    this.dashboardBody?.addEventListener('click', e => {
      if (e.target.classList.contains('edit-btn'))   this.editPreventivo(e.target.closest('tr').dataset.id);
      if (e.target.classList.contains('delete-btn')) this.deletePreventivo(e.target.closest('tr').dataset.id);
    });

    /* import URL */
    this.importUrlBtn?.addEventListener('click', () => this.extractUrlData());
  }

  /* === sezioni === */
  showSection (name) {
    Object.entries(this.sections).forEach(([k, el]) => el.classList.toggle('active', k === name));
  }

  /* === localStorage === */
  loadFromLocalStorage () {
    const data = localStorage.getItem('preventivi');
    this.preventivi = data ? JSON.parse(data) : [];
    if (!this.preventivi.length) this.initializeExampleData();
  }
  saveToLocalStorage () {
    localStorage.setItem('preventivi', JSON.stringify(this.preventivi));
  }

  /* === dati di esempio === */
  initializeExampleData () {
    this.preventivi = [{
      id:'1', hotel:'Family Resort Marina', prezzo:1500,
      checkIn:'2025-07-15', checkOut:'2025-07-22',
      servizi:{piscinaBambini:1,miniclub:1,animazione:1}, score:60, stelle:3
    }];
    this.saveToLocalStorage();
  }

  /* === submit form === */
  handleFormSubmit () {
    const hotel   = this.hotelInput.value.trim();
    const prezzo  = parseFloat(this.prezzoInput.value);
    const checkIn = this.checkInInput.value;
    const checkOut= this.checkOutInput.value;
    if (!hotel || isNaN(prezzo) || !checkIn || !checkOut) {
      this.showToast('Compila tutti i campi', 'error');
      return;
    }
    const servizi = {};
    document.querySelectorAll('#servizi-container input[type="checkbox"]')
      .forEach(ch => { servizi[ch.name] = ch.checked; });

    const score  = this.calculateScore(servizi);
    const stelle = Math.max(1, Math.min(5, Math.round(score / 20)));
    const newP = {
      id: this.editingId || this.generateId(),
      hotel, prezzo, checkIn, checkOut, servizi, score, stelle
    };

    if (this.editingId) {
      const ix = this.preventivi.findIndex(p => p.id === this.editingId);
      if (ix !== -1) this.preventivi[ix] = newP;
      this.showToast('Preventivo aggiornato', 'success');
    } else {
      this.preventivi.push(newP);
      this.showToast('Preventivo inserito', 'success');
    }
    this.saveToLocalStorage();
    this.updateDashboard();
    this.resetForm();
    this.showSection('dashboard');
  }

  /* === utilità === */
  generateId () { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  calculateScore (s) {
    let sc = 0;
    this.servicesHighPriority .forEach(p => s[p.nome] && (sc += p.peso));
    this.servicesMediumPriority.forEach(p => s[p.nome] && (sc += p.peso));
    this.servicesLowPriority  .forEach(p => s[p.nome] && (sc += p.peso));
    return sc;
  }
  resetForm () {
    this.quoteForm.reset();
    this.editIdInput.value = '';
    this.submitBtn.textContent = 'Aggiungi preventivo';
    this.cancelEditBtn.style.display = 'none';
    this.editingId = null;
  }

  /* === dashboard === */
  updateDashboard () { this.renderTable(); }
  renderTable () {
    this.dashboardBody.innerHTML = '';
    this.preventivi.forEach(p => {
      const tr = document.createElement('tr');
      tr.dataset.id = p.id;
      tr.innerHTML = `
        <td>${p.hotel}</td>
        <td>${p.prezzo.toFixed(2)} €</td>
        <td>${this.fmt(p.checkIn)} – ${this.fmt(p.checkOut)}</td>
        <td>${'★'.repeat(p.stelle)}</td>
        <td>
          <button class="edit-btn">Modifica</button>
          <button class="delete-btn">Elimina</button>
        </td>`;
      this.dashboardBody.appendChild(tr);
    });
  }
  fmt (d) { return new Date(d).toLocaleDateString('it-IT'); }

  /* === edit / delete === */
  editPreventivo (id) {
    const p = this.preventivi.find(x => x.id === id);
    if (!p) return;
    this.editingId = id;
    this.hotelInput.value    = p.hotel;
    this.prezzoInput.value   = p.prezzo;
    this.checkInInput.value  = p.checkIn;
    this.checkOutInput.value = p.checkOut;
    document.querySelectorAll('#servizi-container input[type="checkbox"]')
      .forEach(ch => { ch.checked = !!p.servizi[ch.name]; });
    this.submitBtn.textContent = 'Aggiorna preventivo';
    this.cancelEditBtn.style.display = 'inline-block';
    this.showSection('add');
  }

  deletePreventivo (id) {
    const p = this.preventivi.find(x => x.id === id);
    if (!p) return;
    if (confirm(`Eliminare il preventivo per ${p.hotel}?`)) {
      this.preventivi = this.preventivi.filter(x => x.id !== id);
      this.saveToLocalStorage();
      this.updateDashboard();
      this.showToast('Preventivo eliminato', 'info');
    }
  }

  /* === toast === */
  showToast (msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `toast toast-${type}`;
    div.textContent = msg;
    document.body.appendChild(div);
    requestAnimationFrame(() => div.classList.add('show'));
    setTimeout(() => {
      div.classList.remove('show');
      setTimeout(() => div.remove(), 300);
    }, 4000);
  }

  /* === import da URL con proxy CORS === */
  async extractUrlData () {
    const url = this.importUrlInput.value.trim();
    if (!url) { this.showToast('Inserisci un URL', 'error'); return; }

    const proxies = [
      'https://corsproxy.io/?',
      'https://cors.x2u.in/',
      'https://api.codetabs.com/v1/proxy/?quest=',
      'https://proxy.corsfix.com/?',
      'https://api.allorigins.win/raw?url='
    ];

    for (let i = 0; i < proxies.length; i++) {
      const proxy = proxies[i];
      this.showToast(`Tentativo ${i + 1}/${proxies.length}: ${proxy.split('//')[1].split('/')[0]}`, 'info');
      try {
        const res = await fetch(proxy + encodeURIComponent(url), { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let html = proxy.includes('allorigins') ? (await res.json()).contents : await res.text();
        if (html.length < 100) throw new Error('HTML insufficiente');
        const data = this.parseHtml(html);
        if (data.hotel || data.prezzo) {
          this.populateForm(data);
          this.showToast('Dati estratti con successo', 'success');
          return;
        }
        throw new Error('Dati non trovati');
      } catch (e) { console.warn('proxy fail', proxy, e.message); }
    }
    this.showToast('Impossibile estrarre dati', 'error');
  }

  parseHtml (html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const og  = doc.querySelector('meta[property="og:title"]');
    const hotel  = og ? og.content : doc.title;
    const priceM = doc.body.textContent.match(/(\\d+[\\.,]\\d+)\\s*(€|euro|EUR)/i);
    const prezzo = priceM ? parseFloat(priceM[1].replace(',', '.')) : '';
    return { hotel, prezzo };
  }

  populateForm (d) {
    this.showSection('add');
    if (d.hotel)  this.hotelInput.value  = d.hotel;
    if (d.prezzo) this.prezzoInput.value = d.prezzo;
  }
}

/* === bootstrap === */
document.addEventListener('DOMContentLoaded', () => { window.app = new FamilyHotelManager(); });
