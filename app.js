class FamilyHotelManager {
    constructor() {
        this.preventivi = [];
        this.currentId = 1;
        this.servizi = {
            alta_priorita: ["piscina", "miniClub", "animazione", "spiaggia", "spiaggiaPrivata", "ristorazione", "sicurezza"],
            media_priorita: ["parcheggio", "wifi", "aria_condizionata", "tv", "pulizie", "reception"],
            bassa_priorita: ["spa", "fitness"]
        };
        this.proxies = [
            "https://corsproxy.io/?",
            "https://api.allorigins.win/get?url=",
            "https://api.codetabs.com/v1/proxy?quest=",
            "https://cors.bridged.cc/",
            "https://cors-anywhere.herokuapp.com/"
        ];
        this.extractedData = null;
        
        this.init();
    }

    init() {
        console.log('DOM loaded, initializing app');
        console.log('Initializing Family Hotel Manager');
        
        this.loadData();
        this.setupEventListeners();
        this.renderServices();
        this.updateDashboard();
        
        console.log('Initialization complete, preventivi:', this.preventivi.length);
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('family-hotel-preventivi');
            if (savedData) {
                this.preventivi = JSON.parse(savedData);
                this.currentId = Math.max(...this.preventivi.map(p => p.id), 0) + 1;
                console.log('Data loaded from localStorage:', this.preventivi.length, 'items');
            } else {
                // Carica dati di esempio
                this.preventivi = [
                    {
                        id: 1,
                        nome: "Family Resort Marina",
                        checkIn: "2025-08-10",
                        checkOut: "2025-08-17",
                        prezzoTotale: 1400,
                        adulti: 2,
                        bambini: 2,
                        servizi: ["piscina", "miniClub", "animazione", "spiaggia", "spiaggiaPrivata"],
                        note: "Vista mare, vicino al centro",
                        punteggio: 168,
                        stelle: 4
                    },
                    {
                        id: 2,
                        nome: "Hotel Bellavista",
                        checkIn: "2025-08-15",
                        checkOut: "2025-08-22",
                        prezzoTotale: 980,
                        adulti: 2,
                        bambini: 2,
                        servizi: ["piscina", "animazione", "parcheggio"],
                        note: "Posizione centrale, colazione inclusa",
                        punteggio: 120,
                        stelle: 3
                    },
                    {
                        id: 3,
                        nome: "Residence Luna Mare",
                        checkIn: "2025-08-20",
                        checkOut: "2025-08-27",
                        prezzoTotale: 1200,
                        adulti: 2,
                        bambini: 2,
                        servizi: ["piscina", "miniClub", "spiaggiaPrivata", "parcheggio"],
                        note: "Appartamenti con cucina, ideale per famiglie",
                        punteggio: 150,
                        stelle: 4
                    }
                ];
                this.currentId = 4;
                this.saveData();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.preventivi = [];
        }
    }

    saveData() {
        try {
            localStorage.setItem('family-hotel-preventivi', JSON.stringify(this.preventivi));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                console.log('Navigation clicked:', section);
                this.showSection(section);
            });
        });

        // Manual form
        const manualForm = document.getElementById('manual-form');
        if (manualForm) {
            manualForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleManualSubmit(e);
            });
        }

        // Email form
        const emailForm = document.getElementById('email-form');
        if (emailForm) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailSubmit(e);
            });
        }

        // URL form
        const urlForm = document.getElementById('url-form');
        if (urlForm) {
            urlForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUrlSubmit(e);
            });
        }

        // Extracted data form
        const extractedForm = document.getElementById('extracted-data-form');
        if (extractedForm) {
            extractedForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleExtractedSubmit(e);
            });
        }

        // Preview actions
        const confirmBtn = document.getElementById('confirm-extraction');
        const editBtn = document.getElementById('edit-extraction');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmExtraction();
            });
        }
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editExtraction();
            });
        }
    }

    showSection(sectionName) {
        console.log('Showing section:', sectionName);
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.add('active');
        }

        // Add active class to selected nav button
        const navBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
    }

    renderServices() {
        const servicesGrids = [
            document.getElementById('services-grid'),
            document.getElementById('extracted-services-grid')
        ];

        servicesGrids.forEach(grid => {
            if (grid) {
                grid.innerHTML = '';
                
                // Combina tutti i servizi
                const allServices = [
                    ...this.servizi.alta_priorita,
                    ...this.servizi.media_priorita,
                    ...this.servizi.bassa_priorita
                ];

                allServices.forEach(servizio => {
                    const checkbox = document.createElement('div');
                    checkbox.className = 'service-checkbox';
                    checkbox.innerHTML = `
                        <input type="checkbox" id="${servizio}-${grid.id}" name="servizi" value="${servizio}">
                        <label for="${servizio}-${grid.id}">${this.formatServiceName(servizio)}</label>
                    `;
                    
                    const input = checkbox.querySelector('input');
                    input.addEventListener('change', () => {
                        checkbox.classList.toggle('checked', input.checked);
                    });
                    
                    grid.appendChild(checkbox);
                });
            }
        });
    }

    formatServiceName(servizio) {
        const names = {
            piscina: "Piscina",
            miniClub: "Mini Club",
            animazione: "Animazione",
            spiaggia: "Spiaggia",
            spiaggiaPrivata: "Spiaggia Privata",
            ristorazione: "Ristorazione",
            sicurezza: "Sicurezza",
            parcheggio: "Parcheggio",
            wifi: "WiFi",
            aria_condizionata: "Aria Condizionata",
            tv: "TV",
            pulizie: "Pulizie",
            reception: "Reception 24h",
            spa: "SPA",
            fitness: "Fitness"
        };
        return names[servizio] || servizio;
    }

    updateDashboard() {
        console.log('Updating dashboard with', this.preventivi.length, 'preventivi');
        
        // Update stats
        const totalElement = document.getElementById('total-preventivi');
        const avgElement = document.getElementById('prezzo-medio');
        const bestElement = document.getElementById('migliore-punteggio');

        if (totalElement) totalElement.textContent = this.preventivi.length;
        
        if (this.preventivi.length > 0) {
            const avgPrice = Math.round(this.preventivi.reduce((sum, p) => sum + p.prezzoTotale, 0) / this.preventivi.length);
            const bestScore = Math.max(...this.preventivi.map(p => p.punteggio));
            
            if (avgElement) avgElement.textContent = `€${avgPrice}`;
            if (bestElement) bestElement.textContent = bestScore;
            
            console.log('Stats updated - Total:', this.preventivi.length, 'Avg:', avgPrice, 'Best:', bestScore);
        } else {
            if (avgElement) avgElement.textContent = '€0';
            if (bestElement) bestElement.textContent = '0';
        }

        // Render preventivi
        this.renderPreventivi();
    }

    renderPreventivi() {
        const grid = document.getElementById('preventivi-grid');
        if (!grid) return;

        console.log('Rendering table with', this.preventivi.length, 'quotes');

        if (this.preventivi.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>Nessun preventivo presente</h3>
                    <p>Inizia aggiungendo il tuo primo preventivo usando il form manuale o l'importazione automatica.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.preventivi.map(preventivo => `
            <div class="preventivo-card">
                <div class="preventivo-header">
                    <h3 class="preventivo-title">${preventivo.nome}</h3>
                    <div class="preventivo-stars">${'★'.repeat(preventivo.stelle)}</div>
                </div>
                <div class="preventivo-score">Punteggio: ${preventivo.punteggio}</div>
                <div class="preventivo-dates">
                    ${this.formatDate(preventivo.checkIn)} - ${this.formatDate(preventivo.checkOut)}
                </div>
                <div class="preventivo-guests">
                    <span>👥 ${preventivo.adulti} adulti</span>
                    <span>👶 ${preventivo.bambini} bambini</span>
                </div>
                <div class="preventivo-price">€${preventivo.prezzoTotale}</div>
                <div class="preventivo-services">
                    ${preventivo.servizi.map(s => `<span class="service-tag">${this.formatServiceName(s)}</span>`).join('')}
                </div>
                ${preventivo.note ? `<div class="preventivo-notes">${preventivo.note}</div>` : ''}
            </div>
        `).join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'Data non disponibile';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Data non valida';
            
            return date.toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return 'Data non valida';
        }
    }

    calculateScore(preventivo) {
        let score = 0;
        
        // Punteggio base per stelle
        score += preventivo.stelle * 20;
        
        // Punteggio per servizi
        preventivo.servizi.forEach(servizio => {
            if (this.servizi.alta_priorita.includes(servizio)) {
                score += 15;
            } else if (this.servizi.media_priorita.includes(servizio)) {
                score += 8;
            } else if (this.servizi.bassa_priorita.includes(servizio)) {
                score += 3;
            }
        });
        
        // Bonus per family-friendly
        const familyServices = ['miniClub', 'animazione', 'piscina', 'spiaggiaPrivata'];
        const familyCount = preventivo.servizi.filter(s => familyServices.includes(s)).length;
        score += familyCount * 10;
        
        return score;
    }

    handleManualSubmit(e) {
        const formData = new FormData(e.target);
        const servizi = Array.from(formData.getAll('servizi'));
        
        const preventivo = {
            id: this.currentId++,
            nome: formData.get('nome'),
            stelle: parseInt(formData.get('stelle')),
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            adulti: parseInt(formData.get('adulti')),
            bambini: parseInt(formData.get('bambini')),
            prezzoTotale: parseFloat(formData.get('prezzoTotale')),
            servizi: servizi,
            note: formData.get('note') || ''
        };

        preventivo.punteggio = this.calculateScore(preventivo);
        
        this.preventivi.push(preventivo);
        this.saveData();
        this.updateDashboard();
        
        this.showToast('success', 'Preventivo aggiunto con successo!');
        e.target.reset();
        this.renderServices(); // Reset checkboxes
    }

    handleEmailSubmit(e) {
        const content = document.getElementById('email-content').value;
        
        if (!content.trim()) {
            this.showToast('error', 'Inserisci il contenuto dell\'email');
            return;
        }

        try {
            const extractedData = this.parseEmailContent(content);
            
            if (extractedData.nome) {
                this.extractedData = extractedData;
                this.showExtractedPreview(extractedData);
                this.showToast('success', 'Dati estratti dall\'email!');
            } else {
                this.showToast('error', 'Impossibile estrarre dati dall\'email. Usa il form manuale.');
            }
        } catch (error) {
            console.error('Error parsing email:', error);
            this.showToast('error', 'Errore nell\'elaborazione dell\'email');
        }
    }

    parseEmailContent(content) {
        const data = {
            nome: '',
            stelle: 4,
            checkIn: '',
            checkOut: '',
            adulti: 2,
            bambini: 2,
            prezzoTotale: 0,
            servizi: [],
            note: ''
        };

        // Estrai nome hotel
        const hotelMatch = content.match(/hotel\s+([a-zA-Z\s]+)/i) || 
                           content.match(/([a-zA-Z\s]+)\s+hotel/i);
        if (hotelMatch) {
            data.nome = hotelMatch[1].trim();
        }

        // Estrai prezzi
        const priceMatch = content.match(/€\s*(\d+(?:[\.,]\d{2})?)/i) ||
                          content.match(/(\d+(?:[\.,]\d{2})?)\s*€/i) ||
                          content.match(/EUR\s*(\d+(?:[\.,]\d{2})?)/i);
        if (priceMatch) {
            data.prezzoTotale = parseFloat(priceMatch[1].replace(',', '.'));
        }

        // Estrai servizi comuni
        const servicesText = content.toLowerCase();
        if (servicesText.includes('piscina')) data.servizi.push('piscina');
        if (servicesText.includes('mini club') || servicesText.includes('miniclub')) data.servizi.push('miniClub');
        if (servicesText.includes('animazione')) data.servizi.push('animazione');
        if (servicesText.includes('spiaggia')) data.servizi.push('spiaggia');
        if (servicesText.includes('parcheggio')) data.servizi.push('parcheggio');
        if (servicesText.includes('wifi')) data.servizi.push('wifi');

        return data;
    }

    async handleUrlSubmit(e) {
        const url = document.getElementById('preventivo-url').value;
        
        if (!url.trim()) {
            this.showToast('error', 'Inserisci un URL valido');
            return;
        }

        try {
            await this.extractUrlData(url);
        } catch (error) {
            console.error('Error extracting URL:', error);
            this.showToast('error', 'Errore nell\'estrazione dati. Riprova o usa il form manuale.');
        }
    }

    async extractUrlData(url) {
        this.showProgress(true);
        this.updateProgress(0, 'Inizializzazione...');

        for (let i = 0; i < this.proxies.length; i++) {
            const proxy = this.proxies[i];
            const proxyName = this.getProxyName(proxy);
            
            try {
                this.showToast('info', `Tentativo ${i + 1}/${this.proxies.length}: ${proxyName}...`);
                this.updateProgress((i / this.proxies.length) * 50, `Tentativo ${i + 1}/${this.proxies.length}: ${proxyName}...`);
                
                const response = await this.fetchWithProxy(proxy, url);
                
                if (response.ok) {
                    this.showToast('success', `Dati estratti con successo! Proxy usato: ${proxyName}`);
                    this.updateProgress(75, 'Elaborazione dati...');
                    
                    const content = await response.text();
                    const extractedData = this.parseHtmlContent(content, url);
                    
                    if (extractedData && extractedData.nome) {
                        this.extractedData = extractedData;
                        this.updateProgress(100, 'Completato!');
                        this.showExtractedPreview(extractedData);
                        this.showProgress(false);
                        return;
                    } else {
                        throw new Error('Dati insufficienti estratti');
                    }
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                console.error(`Proxy ${proxy} fallito:`, error);
                this.updateProgress(((i + 1) / this.proxies.length) * 50, `Proxy ${proxyName} fallito, tentativo successivo...`);
                
                if (i === this.proxies.length - 1) {
                    this.showToast('error', 'Impossibile estrarre dati da questo URL. Verifica che sia accessibile pubblicamente.');
                    this.showProgress(false);
                }
                
                // Breve pausa prima del prossimo tentativo
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    getProxyName(proxy) {
        if (proxy.includes('corsproxy.io')) return 'corsproxy.io';
        if (proxy.includes('allorigins.win')) return 'api.allorigins.win';
        if (proxy.includes('codetabs.com')) return 'api.codetabs.com';
        if (proxy.includes('bridged.cc')) return 'cors.bridged.cc';
        if (proxy.includes('cors-anywhere')) return 'cors-anywhere.herokuapp.com';
        return 'proxy sconosciuto';
    }

    async fetchWithProxy(proxy, url) {
        const proxyUrl = proxy + encodeURIComponent(url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        try {
            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    parseHtmlContent(html, url) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Genera date default per oggi + 30 giorni e + 37 giorni
        const today = new Date();
        const defaultCheckIn = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        const defaultCheckOut = new Date(today.getTime() + (37 * 24 * 60 * 60 * 1000));
        
        const data = {
            nome: '',
            stelle: 4,
            checkIn: defaultCheckIn.toISOString().split('T')[0],
            checkOut: defaultCheckOut.toISOString().split('T')[0],
            adulti: 2,
            bambini: 2,
            prezzoTotale: 0,
            servizi: [],
            note: `Estratto da: ${url}`
        };

        // Estrai nome hotel con fallback migliori
        const titleElement = doc.querySelector('title');
        const h1Element = doc.querySelector('h1');
        const ogTitle = doc.querySelector('meta[property="og:title"]');
        
        if (ogTitle && ogTitle.getAttribute('content')) {
            data.nome = ogTitle.getAttribute('content').replace(/[\-\|].+$/, '').trim();
        } else if (h1Element && h1Element.textContent) {
            data.nome = h1Element.textContent.trim();
        } else if (titleElement && titleElement.textContent) {
            data.nome = titleElement.textContent.replace(/[\-\|].+$/, '').trim();
        }

        // Se non troviamo il nome, usa il dominio
        if (!data.nome) {
            try {
                const urlObj = new URL(url);
                data.nome = urlObj.hostname.replace('www.', '').replace('.com', '').replace('.it', '');
                data.nome = data.nome.charAt(0).toUpperCase() + data.nome.slice(1) + ' Hotel';
            } catch (e) {
                data.nome = 'Hotel Estratto';
            }
        }

        // Estrai prezzi con migliore pattern matching
        const bodyText = doc.body ? doc.body.textContent : '';
        const pricePatterns = [
            /€\s*(\d{1,4}(?:[\.,]\d{2})?)/gi,
            /(\d{1,4}(?:[\.,]\d{2})?)\s*€/gi,
            /EUR\s*(\d{1,4}(?:[\.,]\d{2})?)/gi,
            /(\d{1,4})\s*euro/gi
        ];

        let foundPrices = [];
        pricePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(bodyText)) !== null) {
                const price = parseFloat(match[1].replace(',', '.'));
                if (price >= 50 && price <= 5000) { // Prezzo ragionevole per settimana
                    foundPrices.push(price);
                }
            }
        });

        if (foundPrices.length > 0) {
            // Prendi il prezzo più alto che sia ragionevole
            data.prezzoTotale = Math.max(...foundPrices);
        } else {
            // Prezzo di default ragionevole
            data.prezzoTotale = 800;
        }

        // Estrai servizi con pattern più robusti
        const textToSearch = bodyText.toLowerCase();
        const servicesMap = {
            'piscina': ['piscina', 'pool', 'swimming', 'nuoto'],
            'miniClub': ['mini club', 'miniclub', 'kids club', 'bambini', 'children'],
            'animazione': ['animazione', 'animation', 'entertainment', 'spettacolo'],
            'spiaggia': ['spiaggia', 'beach', 'mare', 'sea'],
            'spiaggiaPrivata': ['spiaggia privata', 'private beach', 'beach club', 'stabilimento'],
            'parcheggio': ['parcheggio', 'parking', 'posto auto', 'garage'],
            'wifi': ['wifi', 'wi-fi', 'internet', 'connessione'],
            'ristorazione': ['ristorante', 'restaurant', 'dining', 'colazione', 'breakfast', 'pranzo', 'cena'],
            'spa': ['spa', 'wellness', 'benessere', 'massaggi'],
            'fitness': ['fitness', 'palestra', 'gym', 'sport'],
            'reception': ['reception', 'front desk', '24h', 'portineria'],
            'aria_condizionata': ['aria condizionata', 'air conditioning', 'climatizzazione', 'condizionata']
        };

        Object.entries(servicesMap).forEach(([servizio, keywords]) => {
            if (keywords.some(keyword => textToSearch.includes(keyword))) {
                data.servizi.push(servizio);
            }
        });

        // Aggiungi alcuni servizi di default se non ne troviamo
        if (data.servizi.length === 0) {
            data.servizi = ['piscina', 'wifi', 'parcheggio'];
        }

        return data;
    }

    showProgress(show) {
        const progressContainer = document.getElementById('extraction-progress');
        if (progressContainer) {
            progressContainer.classList.toggle('hidden', !show);
        }
    }

    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
    }

    showExtractedPreview(data) {
        const previewContainer = document.getElementById('extracted-preview');
        const previewContent = document.getElementById('preview-content');
        
        if (previewContainer && previewContent) {
            previewContent.innerHTML = `
                <div class="preview-item">
                    <strong>Nome Hotel:</strong>
                    <span>${data.nome}</span>
                </div>
                <div class="preview-item">
                    <strong>Stelle:</strong>
                    <span>${'★'.repeat(data.stelle)}</span>
                </div>
                <div class="preview-item">
                    <strong>Check-in:</strong>
                    <span>${this.formatDate(data.checkIn)}</span>
                </div>
                <div class="preview-item">
                    <strong>Check-out:</strong>
                    <span>${this.formatDate(data.checkOut)}</span>
                </div>
                <div class="preview-item">
                    <strong>Prezzo Totale:</strong>
                    <span>€${data.prezzoTotale}</span>
                </div>
                <div class="preview-item">
                    <strong>Servizi:</strong>
                    <span>${data.servizi.length > 0 ? data.servizi.map(s => this.formatServiceName(s)).join(', ') : 'Nessuno trovato'}</span>
                </div>
                <div class="preview-item">
                    <strong>Ospiti:</strong>
                    <span>${data.adulti} adulti, ${data.bambini} bambini</span>
                </div>
            `;
            
            previewContainer.classList.remove('hidden');
        }
    }

    confirmExtraction() {
        if (this.extractedData) {
            this.extractedData.punteggio = this.calculateScore(this.extractedData);
            this.extractedData.id = this.currentId++;
            
            this.preventivi.push(this.extractedData);
            this.saveData();
            this.updateDashboard();
            
            this.showToast('success', 'Preventivo aggiunto con successo!');
            this.resetExtraction();
            this.showSection('dashboard');
        }
    }

    editExtraction() {
        if (this.extractedData) {
            this.populateFormWithExtractedData(this.extractedData);
            const previewContainer = document.getElementById('extracted-preview');
            const extractedForm = document.getElementById('extracted-form');
            
            if (previewContainer) previewContainer.classList.add('hidden');
            if (extractedForm) extractedForm.classList.remove('hidden');
        }
    }

    populateFormWithExtractedData(data) {
        // CORREZIONE BUG CRITICO: Controlli di esistenza prima di accedere alle proprietà
        const elements = {
            'extracted-nome': data.nome || '',
            'extracted-stelle': data.stelle || 4,
            'extracted-check-in': data.checkIn || '',
            'extracted-check-out': data.checkOut || '',
            'extracted-adulti': data.adulti || 2,
            'extracted-bambini': data.bambini || 2,
            'extracted-prezzo': data.prezzoTotale || 0,
            'extracted-note': data.note || ''
        };

        // Popola i campi con controlli di esistenza
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            } else {
                console.warn(`Element with id "${id}" not found`);
            }
        });

        // Seleziona i servizi
        const servicesGrid = document.getElementById('extracted-services-grid');
        if (servicesGrid && data.servizi) {
            const checkboxes = servicesGrid.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                const isChecked = data.servizi.includes(checkbox.value);
                checkbox.checked = isChecked;
                checkbox.closest('.service-checkbox').classList.toggle('checked', isChecked);
            });
        }
    }

    handleExtractedSubmit(e) {
        const formData = new FormData(e.target);
        const servizi = Array.from(formData.getAll('servizi'));
        
        const preventivo = {
            id: this.currentId++,
            nome: formData.get('nome'),
            stelle: parseInt(formData.get('stelle')),
            checkIn: formData.get('checkIn'),
            checkOut: formData.get('checkOut'),
            adulti: parseInt(formData.get('adulti')),
            bambini: parseInt(formData.get('bambini')),
            prezzoTotale: parseFloat(formData.get('prezzoTotale')),
            servizi: servizi,
            note: formData.get('note') || ''
        };

        preventivo.punteggio = this.calculateScore(preventivo);
        
        this.preventivi.push(preventivo);
        this.saveData();
        this.updateDashboard();
        
        this.showToast('success', 'Preventivo aggiunto con successo!');
        this.resetExtraction();
        this.showSection('dashboard');
    }

    resetExtraction() {
        this.extractedData = null;
        
        const elements = [
            'extracted-preview',
            'extracted-form',
            'extraction-progress'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add('hidden');
            }
        });

        const urlInput = document.getElementById('preventivo-url');
        if (urlInput) {
            urlInput.value = '';
        }

        const extractedForm = document.getElementById('extracted-data-form');
        if (extractedForm) {
            extractedForm.reset();
        }
    }

    showToast(type, message) {
        console.log(`Toast: ${type} ${message}`);
        
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FamilyHotelManager();
});