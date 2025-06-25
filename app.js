# app.js - Family Hotel Manager Completo

```javascript
/**
 * Family Hotel Manager - Sistema completo per gestione preventivi
 * Versione aggiornata con proxy CORS funzionanti 2025
 */

class FamilyHotelManager {
    constructor() {
        this.preventivi = [];
        this.currentEditingId = null;
        this.extractedData = null;
        
        // Configurazione servizi con pesi per il calcolo del punteggio
        this.servicesConfig = {
            highPriority: [
                { nome: "piscina", label: "Piscina", peso: 10 },
                { nome: "miniClub", label: "Mini Club", peso: 10 },
                { nome: "animazione", label: "Animazione", peso: 10 },
                { nome: "spiaggiaPrivata", label: "Spiaggia Privata", peso: 10 }
            ],
            mediumPriority: [
                { nome: "parcheggio", label: "Parcheggio", peso: 6 },
                { nome: "wifi", label: "Wi-Fi Gratuito", peso: 6 },
                { nome: "ristorante", label: "Ristorante", peso: 6 },
                { nome: "spa", label: "Centro Benessere", peso: 6 }
            ],
            lowPriority: [
                { nome: "palestra", label: "Palestra", peso: 3 },
                { nome: "navetta", label: "Servizio Navetta", peso: 3 }
            ]
        };

        // Proxy CORS aggiornati per il 2025
        this.corsProxies = [
            {
                url: "https://corsproxy.io/?",
                name: "CorsProxy.io",
                timeout: 15000,
                encodeUrl: true
            },
            {
                url: "https://api.allorigins.win/get?url=",
                name: "AllOrigins",
                timeout: 20000,
                encodeUrl: true,
                parseResponse: true
            },
            {
                url: "https://cors.x2u.in/",
                name: "CORS.x2u.in",
                timeout: 20000,
                encodeUrl: false
            },
            {
                url: "https://proxy.cors.sh/",
                name: "CORS.sh",
                timeout: 25000,
                encodeUrl: false,
                headers: { 'x-cors-api-key': 'temp_public_api' }
            },
            {
                url: "https://api.codetabs.com/v1/proxy?quest=",
                name: "CodeTabs",
                timeout: 10000,
                encodeUrl: true
            }
        ];

        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateDashboard();
        this.showSection('dashboard');
        this.loadExampleData();
    }

    loadExampleData() {
        if (this.preventivi.length === 0) {
            const exampleData = [
                {
                    id: this.generateId(),
                    hotel: "Family Resort Marina",
                    prezzo: 1450.00,
                    checkIn: "2025-08-10",
                    checkOut: "2025-08-17",
                    adults: 2,
                    children: 2,
                    servizi: ["piscina", "miniClub", "animazione", "spiaggiaPrivata", "parcheggio", "wifi"],
                    note: "Camera vista mare, vicino alla spiaggia",
                    source: "manual",
                    dataCreazione: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    hotel: "Residence Luna Mare",
                    prezzo: 980.00,
                    checkIn: "2025-08-10", 
                    checkOut: "2025-08-17",
                    adults: 2,
                    children: 2,
                    servizi: ["piscina", "parcheggio", "wifi", "spa"],
                    note: "Appartamento con cucina, formula residence",
                    source: "manual",
                    dataCreazione: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    hotel: "Hotel Paradise Kids",
                    prezzo: 1120.00,
                    checkIn: "2025-08-10",
                    checkOut: "2025-08-17", 
                    adults: 2,
                    children: 2,
                    servizi: ["piscina", "miniClub", "animazione", "ristorante", "wifi"],
                    note: "Specializzato per famiglie con bambini",
                    source: "manual",
                    dataCreazione: new Date().toISOString()
                }
            ];
            
            this.preventivi = exampleData;
            this.saveData();
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
                this.updateNavigation(e.target);
            });
        });

        // Form submission
        const form = document.getElementById('preventivo-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Cancel edit button
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }

        // URL extraction
        const extractBtn = document.getElementById('extract-url-btn');
        if (extractBtn) {
            extractBtn.addEventListener('click', () => this.handleUrlExtraction());
        }

        // Email parsing
        const parseEmailBtn = document.getElementById('parse-email-btn');
        if (parseEmailBtn) {
            parseEmailBtn.addEventListener('click', () => this.handleEmailParsing());
        }

        // URL preview actions
        const confirmExtraction = document.getElementById('confirm-extraction');
        const editExtraction = document.getElementById('edit-extraction');
        
        if (confirmExtraction) {
            confirmExtraction.addEventListener('click', () => this.confirmExtractedData());
        }
        
        if (editExtraction) {
            editExtraction.addEventListener('click', () => this.editExtractedData());
        }

        // Filters
        const searchFilter = document.getElementById('search-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        if (searchFilter) {
            searchFilter.addEventListener('input', () => this.applyFilters());
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applyFilters());
        }

        // Table actions (edit/delete)
        const tableBody = document.getElementById('preventivi-tbody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => this.handleTableAction(e));
        }

        // Modal events
        this.bindModalEvents();
    }

    bindModalEvents() {
        const modal = document.getElementById('delete-modal');
        const confirmDelete = document.getElementById('confirm-delete');
        const cancelDelete = document.getElementById('cancel-delete');
        const modalClose = document.querySelector('.modal-close');
        const modalBackdrop = document.querySelector('.modal-backdrop');

        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.confirmDelete());
        }

        [cancelDelete, modalClose, modalBackdrop].forEach(element => {
            if (element) {
                element.addEventListener('click', () => this.hideModal());
            }
        });

        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
                this.hideModal();
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Reset form if switching to add section
        if (sectionName === 'add' && !this.currentEditingId) {
            this.resetForm();
        }
    }

    updateNavigation(activeBtn) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    loadData() {
        const stored = localStorage.getItem('family-hotel-preventivi');
        if (stored) {
            try {
                this.preventivi = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading data:', e);
                this.preventivi = [];
            }
        }
    }

    saveData() {
        try {
            localStorage.setItem('family-hotel-preventivi', JSON.stringify(this.preventivi));
        } catch (e) {
            console.error('Error saving data:', e);
            this.showToast('Errore nel salvataggio dei dati', 'error');
        }
    }

    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    calculateScore(servizi) {
        let score = 0;
        let maxScore = 0;

        // Calculate max possible score
        [...this.servicesConfig.highPriority, 
         ...this.servicesConfig.mediumPriority, 
         ...this.servicesConfig.lowPriority].forEach(service => {
            maxScore += service.peso;
        });

        // Calculate actual score
        servizi.forEach(serviceName => {
            const service = [...this.servicesConfig.highPriority, 
                           ...this.servicesConfig.mediumPriority, 
                           ...this.servicesConfig.lowPriority]
                           .find(s => s.nome === serviceName);
            if (service) {
                score += service.peso;
            }
        });

        // Convert to 5-star rating
        return Math.round((score / maxScore) * 5);
    }

    updateDashboard() {
        this.updateStats();
        this.renderTable();
    }

    updateStats() {
        const totalCount = this.preventivi.length;
        const avgPrice = totalCount > 0 
            ? Math.round(this.preventivi.reduce((sum, p) => sum + p.prezzo, 0) / totalCount)
            : 0;
        const bestRating = totalCount > 0 
            ? Math.max(...this.preventivi.map(p => this.calculateScore(p.servizi || [])))
            : 0;

        const elements = {
            'total-count': totalCount,
            'avg-price': `€${avgPrice}`,
            'best-rating': `${bestRating} ★`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    renderTable() {
        const tbody = document.getElementById('preventivi-tbody');
        const noData = document.getElementById('no-data');
        
        if (!tbody) return;

        if (this.preventivi.length === 0) {
            tbody.innerHTML = '';
            if (noData) noData.style.display = 'block';
            return;
        }

        if (noData) noData.style.display = 'none';

        tbody.innerHTML = this.preventivi.map(preventivo => {
            const score = this.calculateScore(preventivo.servizi || []);
            const servicesHtml = this.renderServiceTags(preventivo.servizi || []);
            const isEditing = this.currentEditingId === preventivo.id;

            return `
                <tr ${isEditing ? 'class="editing"' : ''} data-id="${preventivo.id}">
                    <td>
                        <strong>${this.escapeHtml(preventivo.hotel)}</strong>
                        ${preventivo.note ? `<br><small>${this.escapeHtml(preventivo.note)}</small>` : ''}
                    </td>
                    <td><strong>€${preventivo.prezzo.toFixed(2)}</strong></td>
                    <td>${this.formatDate(preventivo.checkIn)}</td>
                    <td>${this.formatDate(preventivo.checkOut)}</td>
                    <td>${preventivo.adults} + ${preventivo.children}</td>
                    <td>${'★'.repeat(score)} (${score}/5)</td>
                    <td>${servicesHtml}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="edit-btn btn-sm" data-action="edit" data-id="${preventivo.id}">
                                ✏️ Modifica
                            </button>
                            <button class="delete-btn btn-sm" data-action="delete" data-id="${preventivo.id}">
                                🗑️ Elimina
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderServiceTags(servizi) {
        if (!servizi || servizi.length === 0) {
            return '<span class="text-muted">Nessun servizio</span>';
        }

        return `<div class="service-tags">
            ${servizi.slice(0, 3).map(servizio => {
                const service = [...this.servicesConfig.highPriority, 
                               ...this.servicesConfig.mediumPriority, 
                               ...this.servicesConfig.lowPriority]
                               .find(s => s.nome === servizio);
                return `<span class="service-tag">${service ? service.label : servizio}</span>`;
            }).join('')}
            ${servizi.length > 3 ? `<span class="service-tag">+${servizi.length - 3}</span>` : ''}
        </div>`;
    }

    handleTableAction(e) {
        const action = e.target.getAttribute('data-action');
        const id = e.target.getAttribute('data-id');

        if (!action || !id) return;

        switch (action) {
            case 'edit':
                this.editPreventivo(id);
                break;
            case 'delete':
                this.showDeleteModal(id);
                break;
        }
    }

    editPreventivo(id) {
        const preventivo = this.preventivi.find(p => p.id === id);
        if (!preventivo) return;

        this.currentEditingId = id;
        
        // Populate form
        document.getElementById('edit-id').value = id;
        document.getElementById('hotel-name').value = preventivo.hotel;
        document.getElementById('hotel-price').value = preventivo.prezzo;
        document.getElementById('check-in').value = preventivo.checkIn;
        document.getElementById('check-out').value = preventivo.checkOut;
        document.getElementById('adults').value = preventivo.adults || 2;
        document.getElementById('children').value = preventivo.children || 2;
        document.getElementById('notes').value = preventivo.note || '';

        // Set services
        document.querySelectorAll('input[name="service"]').forEach(checkbox => {
            checkbox.checked = (preventivo.servizi || []).includes(checkbox.value);
        });

        // Update form title and buttons
        document.getElementById('form-title').textContent = 'Modifica Preventivo';
        document.getElementById('submit-btn').innerHTML = '💾 Aggiorna Preventivo';
        document.getElementById('cancel-btn').style.display = 'inline-flex';

        // Switch to form section and update table
        this.showSection('add');
        this.updateNavigation(document.querySelector('[data-section="add"]'));
        this.renderTable();
    }

    showDeleteModal(id) {
        const preventivo = this.preventivi.find(p => p.id === id);
        if (!preventivo) return;

        document.getElementById('delete-hotel-name').textContent = preventivo.hotel;
        document.getElementById('delete-modal').style.display = 'flex';
        document.getElementById('delete-modal').setAttribute('data-delete-id', id);
    }

    hideModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.removeAttribute('data-delete-id');
        }
    }

    confirmDelete() {
        const modal = document.getElementById('delete-modal');
        const id = modal ? modal.getAttribute('data-delete-id') : null;
        
        if (!id) return;

        const preventivo = this.preventivi.find(p => p.id === id);
        if (preventivo) {
            this.preventivi = this.preventivi.filter(p => p.id !== id);
            this.saveData();
            this.updateDashboard();
            this.showToast(`Preventivo "${preventivo.hotel}" eliminato con successo`, 'success');
            
            // If we were editing this preventivo, cancel edit
            if (this.currentEditingId === id) {
                this.cancelEdit();
            }
        }

        this.hideModal();
    }

    cancelEdit() {
        this.currentEditingId = null;
        this.resetForm();
        this.renderTable();
        this.showSection('dashboard');
        this.updateNavigation(document.querySelector('[data-section="dashboard"]'));
    }

    resetForm() {
        const form = document.getElementById('preventivo-form');
        if (form) {
            form.reset();
            document.getElementById('edit-id').value = '';
            document.getElementById('adults').value = '2';
            document.getElementById('children').value = '2';
        }

        // Reset form title and buttons
        document.getElementById('form-title').textContent = 'Aggiungi Nuovo Preventivo';
        document.getElementById('submit-btn').innerHTML = '💾 Salva Preventivo';
        document.getElementById('cancel-btn').style.display = 'none';
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = this.getFormData();
        if (!this.validateFormData(formData)) {
            return;
        }

        if (this.currentEditingId) {
            // Update existing
            const index = this.preventivi.findIndex(p => p.id === this.currentEditingId);
            if (index !== -1) {
                this.preventivi[index] = {
                    ...this.preventivi[index],
                    ...formData,
                    dataModifica: new Date().toISOString()
                };
                this.showToast('Preventivo aggiornato con successo!', 'success');
            }
        } else {
            // Create new
            const newPreventivo = {
                id: this.generateId(),
                ...formData,
                source: 'manual',
                dataCreazione: new Date().toISOString()
            };
            this.preventivi.push(newPreventivo);
            this.showToast('Preventivo aggiunto con successo!', 'success');
        }

        this.saveData();
        this.updateDashboard();
        this.cancelEdit();
    }

    getFormData() {
        const servizi = Array.from(document.querySelectorAll('input[name="service"]:checked'))
                            .map(cb => cb.value);

        return {
            hotel: document.getElementById('hotel-name').value.trim(),
            prezzo: parseFloat(document.getElementById('hotel-price').value),
            checkIn: document.getElementById('check-in').value,
            checkOut: document.getElementById('check-out').value,
            adults: parseInt(document.getElementById('adults').value),
            children: parseInt(document.getElementById('children').value),
            servizi: servizi,
            note: document.getElementById('notes').value.trim()
        };
    }

    validateFormData(data) {
        const errors = [];

        if (!data.hotel) errors.push('Nome hotel è obbligatorio');
        if (!data.prezzo || data.prezzo <= 0) errors.push('Prezzo deve essere maggiore di 0');
        if (!data.checkIn) errors.push('Data check-in è obbligatoria');
        if (!data.checkOut) errors.push('Data check-out è obbligatoria');
        if (new Date(data.checkIn) >= new Date(data.checkOut)) {
            errors.push('La data di check-out deve essere successiva al check-in');
        }
        if (!data.adults || data.adults < 1) errors.push('Deve esserci almeno 1 adulto');
        if (data.children < 0) errors.push('Il numero di bambini non può essere negativo');

        if (errors.length > 0) {
            this.showToast('Errori nel form: ' + errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    // URL EXTRACTION METHODS
    async handleUrlExtraction() {
        const urlInput = document.getElementById('url-input');
        const url = urlInput.value.trim();

        if (!url) {
            this.showToast('Inserisci un URL valido', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showToast('L\'URL inserito non è valido', 'error');
            return;
        }

        this.showExtractionStatus('Iniziando estrazione dati...', 0);

        try {
            const html = await this.fetchWithCORS(url);
            const extractedData = this.parseHotelData(html, url);
            
            if (extractedData) {
                this.extractedData = extractedData;
                this.showUrlPreview(extractedData);
                this.hideExtractionStatus();
                this.showToast('Dati estratti con successo!', 'success');
            } else {
                throw new Error('Nessun dato hotel trovato nella pagina');
            }
            
        } catch (error) {
            console.error('Extraction error:', error);
            this.hideExtractionStatus();
            this.showToast('Errore nell\'estrazione: ' + error.message, 'error');
        }
    }

    async fetchWithCORS(url) {
        let lastError = null;
        
        for (let i = 0; i < this.corsProxies.length; i++) {
            const proxy = this.corsProxies[i];
            
            try {
                this.showExtractionStatus(`Tentativo ${i + 1}/${this.corsProxies.length}: ${proxy.name}...`, 
                                        (i / this.corsProxies.length) * 50);
                
                const proxyUrl = this.buildProxyUrl(proxy, url);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), proxy.timeout);
                
                const response = await fetch(proxyUrl, {
                    signal: controller.signal,
                    headers: proxy.headers || {}
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                let responseText;
                if (proxy.parseResponse) {
                    const json = await response.json();
                    responseText = json.contents || json.data || '';
                } else {
                    responseText = await response.text();
                }
                
                if (responseText && responseText.length > 100) {
                    this.showExtractionStatus(`Dati ricevuti da ${proxy.name}, parsing in corso...`, 75);
                    return responseText;
                }
                
            } catch (error) {
                console.warn(`Proxy ${proxy.name} failed:`, error.message);
                lastError = error;
                continue;
            }
        }
        
        throw new Error(`Tutti i proxy CORS non disponibili. Ultimo errore: ${lastError?.message || 'Sconosciuto'}`);
    }

    buildProxyUrl(proxy, targetUrl) {
        if (proxy.encodeUrl) {
            return proxy.url + encodeURIComponent(targetUrl);
        } else {
            return proxy.url + targetUrl;
        }
    }

    parseHotelData(html, sourceUrl) {
        try {
            // Create a temporary DOM element to parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const extractedData = {
                hotel: this.extractHotelName(doc, html),
                prezzo: this.extractPrice(doc, html),
                checkIn: this.extractDate(doc, html, 'checkin'),
                checkOut: this.extractDate(doc, html, 'checkout'),
                adults: this.extractGuests(doc, html, 'adults') || 2,
                children: this.extractGuests(doc, html, 'children') || 2,
                servizi: this.extractServices(doc, html),
                note: `Estratto da: ${sourceUrl}`,
                source: 'url'
            };

            // Validate essential data
            if (!extractedData.hotel && !extractedData.prezzo) {
                return null;
            }

            return extractedData;
            
        } catch (error) {
            console.error('Parsing error:', error);
            return null;
        }
    }

    extractHotelName(doc, html) {
        // Try multiple selectors for hotel name
        const selectors = [
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
            'title',
            'h1',
            '.hotel-name',
            '.property-name',
            '[class*="hotel"]',
            '[class*="name"]'
        ];

        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
                let name = element.getAttribute('content') || element.textContent || '';
                name = name.trim();
                if (name && name.length > 3 && name.length < 100) {
                    // Clean up common patterns
                    name = name.replace(/\s*-\s*(Booking\.com|Hotels\.com|Expedia).*$/i, '');
                    name = name.replace(/^\s*(Hotel|Resort|Residence)\s*/i, '');
                    return name;
                }
            }
        }

        // Fallback: try regex on HTML
        const patterns = [
            /hotel["\s]+([^"<>{}\n]{10,50})/gi,
            /property["\s]+([^"<>{}\n]{10,50})/gi,
            /"hotelName"[:\s]*"([^"]{5,50})"/gi
        ];

        for (const pattern of patterns) {
            const match = pattern.exec(html);
            if (match && match[1]) {
                return match[1].trim();
            }
        }

        return null;
    }

    extractPrice(doc, html) {
        // Try to find price in various formats
        const pricePatterns = [
            /€\s*(\d{1,4}(?:[.,]\d{2})?)/g,
            /(\d{1,4}(?:[.,]\d{2})?)\s*€/g,
            /EUR\s*(\d{1,4}(?:[.,]\d{2})?)/g,
            /(\d{1,4}(?:[.,]\d{2})?)\s*EUR/g,
            /"price"[:\s]*(\d+(?:\.\d{2})?)/g,
            /"amount"[:\s]*(\d+(?:\.\d{2})?)/g
        ];

        const prices = [];
        
        for (const pattern of pricePatterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                const price = parseFloat(match[1].replace(',', '.'));
                if (price >= 50 && price <= 5000) { // Reasonable price range
                    prices.push(price);
                }
            }
        }

        if (prices.length > 0) {
            // Return the most common price or median
            prices.sort((a, b) => a - b);
            return prices[Math.floor(prices.length / 2)];
        }

        return null;
    }

    extractDate(doc, html, type) {
        const today = new Date();
        const patterns = [
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
            /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
            /"checkIn"[:\s]*"(\d{4}-\d{2}-\d{2})"/g,
            /"checkOut"[:\s]*"(\d{4}-\d{2}-\d{2})"/g
        ];

        const dates = [];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) !== null) {
                let dateStr;
                if (match[0].includes('"check')) {
                    dateStr = match[1];
                } else if (match[1].length === 4) {
                    // YYYY-MM-DD format
                    dateStr = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
                } else {
                    // DD/MM/YYYY format
                    dateStr = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
                }
                
                const date = new Date(dateStr);
                if (date > today && date < new Date(today.getFullYear() + 1, 11, 31)) {
                    dates.push(dateStr);
                }
            }
        }

        if (dates.length >= 2) {
            dates.sort();
            return type === 'checkin' ? dates[0] : dates[1];
        } else if (dates.length === 1) {
            return dates[0];
        }

        return null;
    }

    extractGuests(doc, html, type) {
        const patterns = [
            /"adults"[:\s]*(\d+)/g,
            /"children"[:\s]*(\d+)/g,
            /adulti[:\s]*(\d+)/gi,
            /bambini[:\s]*(\d+)/gi
        ];

        for (const pattern of patterns) {
            const match = pattern.exec(html);
            if (match) {
                const isAdult = pattern.source.toLowerCase().includes('adult');
                if ((type === 'adults' && isAdult) || (type === 'children' && !isAdult)) {
                    return parseInt(match[1]);
                }
            }
        }

        return null;
    }

    extractServices(doc, html) {
        const serviceKeywords = {
            piscina: ['piscina', 'pool', 'swimming'],
            miniClub: ['mini club', 'kids club', 'bambini'],
            animazione: ['animazione', 'entertainment', 'animation'],
            spiaggiaPrivata: ['spiaggia', 'beach', 'mare'],
            parcheggio: ['parcheggio', 'parking'],
            wifi: ['wifi', 'internet'],
            spa: ['spa', 'benessere', 'wellness'],
            ristorante: ['ristorante', 'restaurant', 'dining'],
            palestra: ['palestra', 'gym', 'fitness'],
            navetta: ['navetta', 'shuttle', 'transfer']
        };

        const services = [];
        const text = html.toLowerCase();

        for (const [serviceKey, keywords] of Object.entries(serviceKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                services.push(serviceKey);
            }
        }

        return services;
    }

    showExtractionStatus(message, progress) {
        const statusElement = document.getElementById('extraction-status');
        const messageElement = statusElement?.querySelector('.status-message');
        const progressElement = statusElement?.querySelector('.progress-fill');

        if (statusElement) {
            statusElement.style.display = 'block';
        }
        if (messageElement) {
            messageElement.textContent = message;
        }
        if (progressElement) {
            progressElement.style.width = `${progress}%`;
        }
    }

    hideExtractionStatus() {
        const statusElement = document.getElementById('extraction-status');
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }

    showUrlPreview(data) {
        const preview = document.getElementById('url-preview');
        if (!preview) return;

        // Populate preview elements
        const elements = {
            'preview-hotel': data.hotel || 'Non trovato',
            'preview-price': data.prezzo ? `€${data.prezzo.toFixed(2)}` : 'Non trovato',
            'preview-checkin': data.checkIn || 'Non trovato',
            'preview-checkout': data.checkOut || 'Non trovato',
            'preview-services': data.servizi?.length > 0 ? data.servizi.join(', ') : 'Nessuno'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        preview.style.display = 'block';
        preview.classList.add('fade-in');
    }

    confirmExtractedData() {
        if (!this.extractedData) return;

        // Add the preventivo directly
        const newPreventivo = {
            id: this.generateId(),
            ...this.extractedData,
            dataCreazione: new Date().toISOString()
        };

        this.preventivi.push(newPreventivo);
        this.saveData();
        this.updateDashboard();
        
        this.showToast('Preventivo aggiunto con successo!', 'success');
        this.hideUrlPreview();
        this.showSection('dashboard');
        this.updateNavigation(document.querySelector('[data-section="dashboard"]'));
    }

    editExtractedData() {
        if (!this.extractedData) return;

        // Populate form with extracted data
        document.getElementById('hotel-name').value = this.extractedData.hotel || '';
        document.getElementById('hotel-price').value = this.extractedData.prezzo || '';
        document.getElementById('check-in').value = this.extractedData.checkIn || '';
        document.getElementById('check-out').value = this.extractedData.checkOut || '';
        document.getElementById('adults').value = this.extractedData.adults || 2;
        document.getElementById('children').value = this.extractedData.children || 2;
        document.getElementById('notes').value = this.extractedData.note || '';

        // Set services
        document.querySelectorAll('input[name="service"]').forEach(checkbox => {
            checkbox.checked = (this.extractedData.servizi || []).includes(checkbox.value);
        });

        this.hideUrlPreview();
        this.showSection('add');
        this.updateNavigation(document.querySelector('[data-section="add"]'));
    }

    hideUrlPreview() {
        const preview = document.getElementById('url-preview');
        if (preview) {
            preview.style.display = 'none';
        }
        document.getElementById('url-input').value = '';
        this.extractedData = null;
    }

    // EMAIL PARSING METHODS
    handleEmailParsing() {
        const emailContent = document.getElementById('email-content').value.trim();
        
        if (!emailContent) {
            this.showToast('Inserisci il contenuto dell\'email', 'error');
            return;
        }

        try {
            const parsedData = this.parseEmailContent(emailContent);
            
            if (parsedData) {
                // Populate form with parsed data
                this.fillFormWithParsedData(parsedData);
                this.showToast('Email analizzata con successo!', 'success');
                this.showSection('add');
                this.updateNavigation(document.querySelector('[data-section="add"]'));
            } else {
                this.showToast('Impossibile estrarre dati dall\'email', 'warning');
            }
            
        } catch (error) {
            console.error('Email parsing error:', error);
            this.showToast('Errore nell\'analisi dell\'email', 'error');
        }
    }

    parseEmailContent(content) {
        const data = {};
        
        // Extract hotel name
        const hotelPatterns = [
            /hotel[:\s]+([^\n\r]{5,50})/gi,
            /struttura[:\s]+([^\n\r]{5,50})/gi,
            /albergo[:\s]+([^\n\r]{5,50})/gi
        ];
        
        for (const pattern of hotelPatterns) {
            const match = pattern.exec(content);
            if (match) {
                data.hotel = match[1].trim();
                break;
            }
        }

        // Extract price
        const pricePatterns = [
            /totale[:\s]*€?\s*(\d{1,4}(?:[.,]\d{2})?)/gi,
            /prezzo[:\s]*€?\s*(\d{1,4}(?:[.,]\d{2})?)/gi,
            /importo[:\s]*€?\s*(\d{1,4}(?:[.,]\d{2})?)/gi,
            /€\s*(\d{1,4}(?:[.,]\d{2})?)/g
        ];

        for (const pattern of pricePatterns) {
            const match = pattern.exec(content);
            if (match) {
                data.prezzo = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }

        // Extract dates
        const datePatterns = [
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
            /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g
        ];

        const dates = [];
        for (const pattern of datePatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                let dateStr;
                if (match[1].length === 4) {
                    dateStr = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
                } else {
                    dateStr = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
                }
                dates.push(dateStr);
            }
        }

        if (dates.length >= 2) {
            dates.sort();
            data.checkIn = dates[0];
            data.checkOut = dates[1];
        }

        // Extract guests
        const adultMatch = content.match(/adulti[:\s]*(\d+)/gi);
        if (adultMatch) {
            data.adults = parseInt(adultMatch[0].match(/\d+/)[0]);
        }

        const childMatch = content.match(/bambini[:\s]*(\d+)/gi);
        if (childMatch) {
            data.children = parseInt(childMatch[0].match(/\d+/)[0]);
        }

        // Extract services
        data.servizi = this.extractServicesFromText(content);
        data.note = 'Importato da email';
        data.source = 'email';

        return Object.keys(data).length > 1 ? data : null;
    }

    extractServicesFromText(text) {
        const serviceKeywords = {
            piscina: ['piscina', 'pool'],
            miniClub: ['mini club', 'kids club', 'club bambini'],
            animazione: ['animazione', 'entertainment'],
            spiaggiaPrivata: ['spiaggia privata', 'private beach'],
            parcheggio: ['parcheggio', 'parking'],
            wifi: ['wifi', 'internet', 'connessione'],
            spa: ['spa', 'centro benessere', 'wellness'],
            ristorante: ['ristorante', 'restaurant'],
            palestra: ['palestra', 'gym'],
            navetta: ['navetta', 'shuttle']
        };

        const services = [];
        const textLower = text.toLowerCase();

        for (const [serviceKey, keywords] of Object.entries(serviceKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                services.push(serviceKey);
            }
        }

        return services;
    }

    fillFormWithParsedData(data) {
        if (data.hotel) document.getElementById('hotel-name').value = data.hotel;
        if (data.prezzo) document.getElementById('hotel-price').value = data.prezzo;
        if (data.checkIn) document.getElementById('check-in').value = data.checkIn;
        if (data.checkOut) document.getElementById('check-out').value = data.checkOut;
        if (data.adults) document.getElementById('adults').value = data.adults;
        if (data.children) document.getElementById('children').value = data.children;
        if (data.note) document.getElementById('notes').value = data.note;

        // Set services
        if (data.servizi) {
            document.querySelectorAll('input[name="service"]').forEach(checkbox => {
                checkbox.checked = data.servizi.includes(checkbox.value);
            });
        }
    }

    // FILTER METHODS
    applyFilters() {
        const searchTerm = document.getElementById('search-filter')?.value.toLowerCase() || '';
        const sortOption = document.getElementById('sort-filter')?.value || 'price-asc';

        let filteredPreventivi = [...this.preventivi];

        // Apply search filter
        if (searchTerm) {
            filteredPreventivi = filteredPreventivi.filter(p => 
                p.hotel.toLowerCase().includes(searchTerm) ||
                (p.note && p.note.toLowerCase().includes(searchTerm))
            );
        }

        // Apply sort
        filteredPreventivi.sort((a, b) => {
            switch (sortOption) {
                case 'price-asc':
                    return a.prezzo - b.prezzo;
                case 'price-desc':
                    return b.prezzo - a.prezzo;
                case 'rating-desc':
                    return this.calculateScore(b.servizi || []) - this.calculateScore(a.servizi || []);
                case 'name-asc':
                    return a.hotel.localeCompare(b.hotel);
                default:
                    return 0;
            }
        });

        // Temporarily replace preventivi for rendering
        const originalPreventivi = this.preventivi;
        this.preventivi = filteredPreventivi;
        this.renderTable();
        this.preventivi = originalPreventivi;
    }

    // UTILITY METHODS
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconMap = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${iconMap[type] || 'ℹ️'}</span>
            <span class="toast-message">${this.escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.familyHotelManager = new FamilyHotelManager();
});
```
