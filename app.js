// Family Hotel Manager - Main Application Logic

class FamilyHotelManager {
    constructor() {
        this.preventivi = [];
        this.servizi = {
            altaPriorita: [
                { nome: "piscinaBambini", label: "Piscina per bambini", peso: 10 },
                { nome: "miniClub", label: "Mini Club 4-7 anni", peso: 10 },
                { nome: "animazione", label: "Animazione", peso: 10 },
                { nome: "spiaggiaPrivata", label: "Spiaggia privata", peso: 10 },
                { nome: "menuBambini", label: "Menu bambini", peso: 10 },
                { nome: "babySitting", label: "Baby sitting", peso: 10 },
                { nome: "parcheggio", label: "Parcheggio", peso: 10 },
                { nome: "wifi", label: "WiFi gratuito", peso: 10 },
                { nome: "allInclusive", label: "All inclusive", peso: 10 },
                { nome: "vicinMare", label: "Vicino al mare", peso: 10 },
                { nome: "areaGiochi", label: "Area giochi", peso: 10 },
                { nome: "servizioSpiaggia", label: "Servizio spiaggia", peso: 10 }
            ],
            mediaPriorita: [
                { nome: "spa", label: "Spa/Benessere", peso: 6 },
                { nome: "ristorante", label: "Ristorante", peso: 6 },
                { nome: "palestra", label: "Palestra", peso: 6 },
                { nome: "navetta", label: "Servizio navetta", peso: 6 },
                { nome: "ariaCond", label: "Aria condizionata", peso: 6 },
                { nome: "tvSat", label: "TV satellitare", peso: 6 },
                { nome: "frigo", label: "Frigo in camera", peso: 6 },
                { nome: "balcone", label: "Balcone vista mare", peso: 6 },
                { nome: "escursioni", label: "Escursioni", peso: 6 },
                { nome: "noleggiBici", label: "Noleggio bici", peso: 6 },
                { nome: "entertainment", label: "Entertainment serale", peso: 6 },
                { nome: "lavanderia", label: "Servizio lavanderia", peso: 6 }
            ],
            bassaPriorita: [
                { nome: "petFriendly", label: "Pet friendly", peso: 3 },
                { nome: "businessCenter", label: "Business center", peso: 3 }
            ]
        };
        this.comparisonQuotes = [];
        this.currentSort = { field: null, direction: 'asc' };
        this.tempExtractedData = null;
        
        // Auto-initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing Family Hotel Manager');
        this.loadPreventivi();
        this.loadExampleData();
        this.renderServicesForm();
        this.setupEventListeners();
        this.updateDashboard();
        console.log('Initialization complete, preventivi:', this.preventivi.length);
    }

    loadExampleData() {
        // Always load example data if storage is empty
        const stored = window.localStorage?.getItem('familyHotelPreventivi');
        if (!stored || this.preventivi.length === 0) {
            console.log('Loading example data');
            const exampleData = [
                {
                    id: 1,
                    nomeHotel: "Hotel Villa Mare",
                    dataCheckin: "2025-08-10",
                    dataCheckout: "2025-08-17",
                    prezzoTotale: 1200,
                    adulti: 2,
                    bambini: 2,
                    etaBambini: "7, 4 anni",
                    localita: "Rimini",
                    emailTelefono: "info@villamare.it",
                    servizi: {
                        piscinaBambini: true,
                        miniClub: true,
                        animazione: true,
                        spiaggiaPrivata: true,
                        menuBambini: true,
                        parcheggio: true,
                        wifi: true
                    },
                    note: "Vista mare, animazione 7 giorni su 7"
                },
                {
                    id: 2,
                    nomeHotel: "Family Resort Sole",
                    dataCheckin: "2025-06-15",
                    dataCheckout: "2025-06-22",
                    prezzoTotale: 890,
                    adulti: 2,
                    bambini: 2,
                    etaBambini: "7, 4 anni",
                    localita: "Cattolica",
                    emailTelefono: "booking@resortsole.it",
                    servizi: {
                        piscinaBambini: true,
                        miniClub: true,
                        animazione: true,
                        menuBambini: true,
                        allInclusive: true,
                        parcheggio: true,
                        wifi: true
                    },
                    note: "All inclusive, ideale per bambini"
                },
                {
                    id: 3,
                    nomeHotel: "Residence Luna",
                    dataCheckin: "2025-08-01",
                    dataCheckout: "2025-08-08",
                    prezzoTotale: 1450,
                    adulti: 2,
                    bambini: 2,
                    etaBambini: "7, 4 anni",
                    localita: "Jesolo",
                    emailTelefono: "info@residenceluna.it",
                    servizi: {
                        spiaggiaPrivata: true,
                        parcheggio: true,
                        wifi: true
                    },
                    note: "Residence con cucina, spiaggia privata"
                }
            ];
            
            // Calculate scores for example data
            exampleData.forEach(preventivo => {
                preventivo.punteggio = this.calculateScore(preventivo.servizi);
                preventivo.stelle = this.getStarsFromScore(preventivo.punteggio);
            });
            
            this.preventivi = exampleData;
            this.savePreventivi();
            console.log('Example data loaded:', this.preventivi.length, 'hotels');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Navigation
        document.querySelectorAll('.nav__btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                console.log('Navigation clicked:', section);
                this.showSection(section);
            });
        });

        // Form submission
        const form = document.getElementById('quote-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submitted');
                this.saveQuote();
            });
        }

        // Calculate score button
        const calcBtn = document.getElementById('calculate-score');
        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                console.log('Calculate score clicked');
                this.calculateCurrentScore();
            });
        }

        // Reset form button
        const resetBtn = document.getElementById('reset-form');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('Reset form clicked');
                this.resetForm();
            });
        }

        // Service checkboxes for real-time score calculation
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.services-grid')) {
                this.calculateCurrentScore();
            }
        });

        // Filters
        document.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('input', () => this.applyFilters());
        });

        const resetFiltersBtn = document.getElementById('reset-filters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }

        // Table sorting
        document.querySelectorAll('[data-sort]').forEach(th => {
            th.addEventListener('click', (e) => {
                const field = e.target.dataset.sort;
                this.sortTable(field);
            });
        });

        // Comparison clear button
        const clearCompBtn = document.getElementById('clear-comparison');
        if (clearCompBtn) {
            clearCompBtn.addEventListener('click', () => {
                this.clearComparison();
            });
        }

        // Email and URL extraction
        const emailBtn = document.getElementById('extract-email-data');
        if (emailBtn) {
            emailBtn.addEventListener('click', () => {
                this.extractEmailData();
            });
        }

        const urlBtn = document.getElementById('extract-url-data');
        if (urlBtn) {
            urlBtn.addEventListener('click', () => {
                this.extractUrlData();
            });
        }

        // Preview save buttons
        const saveEmailBtn = document.getElementById('save-email-data');
        if (saveEmailBtn) {
            saveEmailBtn.addEventListener('click', () => {
                if (this.tempExtractedData) {
                    this.populateFormWithExtractedData(this.tempExtractedData);
                    this.showSection('add-quote');
                    document.getElementById('email-preview').style.display = 'none';
                }
            });
        }

        const saveUrlBtn = document.getElementById('save-url-data');
        if (saveUrlBtn) {
            saveUrlBtn.addEventListener('click', () => {
                if (this.tempExtractedData) {
                    this.populateFormWithExtractedData(this.tempExtractedData);
                    this.showSection('add-quote');
                    document.getElementById('url-preview').style.display = 'none';
                }
            });
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('section--active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('section--active');
            console.log('Showing section:', sectionId);
        }

        // Update nav buttons
        document.querySelectorAll('.nav__btn').forEach(btn => {
            btn.classList.remove('nav__btn--active');
        });
        const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('nav__btn--active');
        }
    }

    renderServicesForm() {
        const highPriorityContainer = document.getElementById('high-priority-services');
        const mediumPriorityContainer = document.getElementById('medium-priority-services');
        const lowPriorityContainer = document.getElementById('low-priority-services');

        if (highPriorityContainer) {
            highPriorityContainer.innerHTML = this.servizi.altaPriorita.map(servizio => `
                <div class="service-item">
                    <input type="checkbox" id="${servizio.nome}" name="servizi" value="${servizio.nome}">
                    <label for="${servizio.nome}">${servizio.label}</label>
                </div>
            `).join('');
        }

        if (mediumPriorityContainer) {
            mediumPriorityContainer.innerHTML = this.servizi.mediaPriorita.map(servizio => `
                <div class="service-item">
                    <input type="checkbox" id="${servizio.nome}" name="servizi" value="${servizio.nome}">
                    <label for="${servizio.nome}">${servizio.label}</label>
                </div>
            `).join('');
        }

        if (lowPriorityContainer) {
            lowPriorityContainer.innerHTML = this.servizi.bassaPriorita.map(servizio => `
                <div class="service-item">
                    <input type="checkbox" id="${servizio.nome}" name="servizi" value="${servizio.nome}">
                    <label for="${servizio.nome}">${servizio.label}</label>
                </div>
            `).join('');
        }
    }

    calculateScore(servizi) {
        let totalScore = 0;

        this.servizi.altaPriorita.forEach(servizio => {
            if (servizi[servizio.nome]) {
                totalScore += servizio.peso;
            }
        });

        this.servizi.mediaPriorita.forEach(servizio => {
            if (servizi[servizio.nome]) {
                totalScore += servizio.peso;
            }
        });

        this.servizi.bassaPriorita.forEach(servizio => {
            if (servizi[servizio.nome]) {
                totalScore += servizio.peso;
            }
        });

        return totalScore;
    }

    getStarsFromScore(score) {
        if (score >= 160) return 5;
        if (score >= 120) return 4;
        if (score >= 80) return 3;
        if (score >= 40) return 2;
        return 1;
    }

    calculateCurrentScore() {
        const servizi = {};
        
        document.querySelectorAll('input[name="servizi"]:checked').forEach(checkbox => {
            servizi[checkbox.value] = true;
        });

        const score = this.calculateScore(servizi);
        const stars = this.getStarsFromScore(score);

        const scoreElement = document.getElementById('current-score');
        const starsElement = document.getElementById('current-stars');
        
        if (scoreElement) scoreElement.textContent = score;
        if (starsElement) starsElement.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
        
        console.log('Score calculated:', score, 'stars:', stars);
    }

    saveQuote() {
        console.log('Saving quote...');
        
        // Get form values
        const nomeHotel = document.getElementById('hotel-name').value.trim();
        const dataCheckin = document.getElementById('checkin-date').value;
        const dataCheckout = document.getElementById('checkout-date').value;
        const prezzoTotale = document.getElementById('total-price').value;

        // Validate required fields
        if (!nomeHotel || !dataCheckin || !dataCheckout || !prezzoTotale) {
            this.showToast('Compila tutti i campi obbligatori', 'warning');
            return;
        }

        // Get services
        const servizi = {};
        [...this.servizi.altaPriorita, ...this.servizi.mediaPriorita, ...this.servizi.bassaPriorita].forEach(servizio => {
            const checkbox = document.getElementById(servizio.nome);
            servizi[servizio.nome] = checkbox ? checkbox.checked : false;
        });

        const preventivo = {
            id: Date.now(),
            nomeHotel: nomeHotel,
            dataCheckin: dataCheckin,
            dataCheckout: dataCheckout,
            prezzoTotale: parseFloat(prezzoTotale),
            adulti: parseInt(document.getElementById('adults').value) || 2,
            bambini: parseInt(document.getElementById('children').value) || 2,
            etaBambini: document.getElementById('children-ages').value || '7, 4 anni',
            localita: document.getElementById('location').value || '',
            emailTelefono: document.getElementById('hotel-contact').value || '',
            servizi: servizi,
            note: document.getElementById('notes').value || ''
        };

        preventivo.punteggio = this.calculateScore(servizi);
        preventivo.stelle = this.getStarsFromScore(preventivo.punteggio);

        console.log('New preventivo:', preventivo);

        this.preventivi.push(preventivo);
        this.savePreventivi();
        this.updateDashboard();
        this.showToast('Preventivo salvato con successo!', 'success');
        this.resetForm();
        this.showSection('dashboard');
    }

    resetForm() {
        const form = document.getElementById('quote-form');
        if (form) {
            form.reset();
            // Reset default values
            document.getElementById('adults').value = 2;
            document.getElementById('children').value = 2;            
            document.getElementById('children-ages').value = '7, 4 anni';
            
            const scoreElement = document.getElementById('current-score');
            const starsElement = document.getElementById('current-stars');
            
            if (scoreElement) scoreElement.textContent = '0';
            if (starsElement) starsElement.textContent = '☆☆☆☆☆';
        }
    }

    updateDashboard() {
        console.log('Updating dashboard with', this.preventivi.length, 'preventivi');
        this.updateStats();
        this.renderQuotesTable();
    }

    updateStats() {
        const totalQuotes = this.preventivi.length;
        const avgPrice = totalQuotes > 0 ? Math.round(this.preventivi.reduce((sum, p) => sum + p.prezzoTotale, 0) / totalQuotes) : 0;
        const bestRating = totalQuotes > 0 ? Math.max(...this.preventivi.map(p => p.stelle)) : 0;

        const totalElement = document.getElementById('total-quotes');
        const avgElement = document.getElementById('avg-price');
        const bestElement = document.getElementById('best-rating');

        if (totalElement) totalElement.textContent = totalQuotes;
        if (avgElement) avgElement.textContent = `€${avgPrice}`;
        if (bestElement) bestElement.textContent = `${bestRating}⭐`;
        
        console.log('Stats updated - Total:', totalQuotes, 'Avg:', avgPrice, 'Best:', bestRating);
    }

    renderQuotesTable() {
        const tbody = document.getElementById('quotes-table-body');
        if (!tbody) {
            console.error('Table body not found');
            return;
        }

        const filteredQuotes = this.getFilteredQuotes();
        console.log('Rendering table with', filteredQuotes.length, 'quotes');

        if (filteredQuotes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><h3>Nessun preventivo trovato</h3><p>Aggiungi il tuo primo preventivo per iniziare!</p></td></tr>';
            return;
        }

        tbody.innerHTML = filteredQuotes.map(preventivo => `
            <tr>
                <td><strong>${preventivo.nomeHotel}</strong></td>
                <td>${this.formatDateRange(preventivo.dataCheckin, preventivo.dataCheckout)}</td>
                <td><strong>€${preventivo.prezzoTotale}</strong></td>
                <td class="stars">${'★'.repeat(preventivo.stelle)}${'☆'.repeat(5 - preventivo.stelle)}</td>
                <td>${preventivo.localita || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn--edit" onclick="app.editQuote(${preventivo.id})">Modifica</button>
                        <button class="action-btn action-btn--delete" onclick="app.deleteQuote(${preventivo.id})">Elimina</button>
                        <button class="action-btn action-btn--compare" onclick="app.addToComparison(${preventivo.id})">Confronta</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatDateRange(checkin, checkout) {
        try {
            const checkinDate = new Date(checkin).toLocaleDateString('it-IT');
            const checkoutDate = new Date(checkout).toLocaleDateString('it-IT');
            return `${checkinDate} - ${checkoutDate}`;
        } catch (e) {
            return `${checkin} - ${checkout}`;
        }
    }

    getFilteredQuotes() {
        let filtered = [...this.preventivi];

        const priceMin = document.getElementById('price-min')?.value;
        const priceMax = document.getElementById('price-max')?.value;
        const ratingFilter = document.getElementById('rating-filter')?.value;

        if (priceMin) {
            filtered = filtered.filter(q => q.prezzoTotale >= parseFloat(priceMin));
        }

        if (priceMax) {
            filtered = filtered.filter(q => q.prezzoTotale <= parseFloat(priceMax));
        }

        if (ratingFilter) {
            filtered = filtered.filter(q => q.stelle >= parseInt(ratingFilter));
        }

        // Apply sorting
        if (this.currentSort.field) {
            filtered.sort((a, b) => {
                let aVal = a[this.currentSort.field];
                let bVal = b[this.currentSort.field];

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (this.currentSort.direction === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        return filtered;
    }

    applyFilters() {
        this.renderQuotesTable();
    }

    resetFilters() {
        document.getElementById('price-min').value = '';
        document.getElementById('price-max').value = '';
        document.getElementById('rating-filter').value = '';
        this.renderQuotesTable();
    }

    sortTable(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        this.renderQuotesTable();
    }

    deleteQuote(id) {
        if (confirm('Sei sicuro di voler eliminare questo preventivo?')) {
            this.preventivi = this.preventivi.filter(p => p.id !== id);
            this.comparisonQuotes = this.comparisonQuotes.filter(p => p.id !== id);
            this.savePreventivi();
            this.updateDashboard();
            this.renderComparison();
            this.showToast('Preventivo eliminato', 'info');
        }
    }

    editQuote(id) {
        const preventivo = this.preventivi.find(p => p.id === id);
        if (preventivo) {
            this.populateForm(preventivo);
            this.showSection('add-quote');
        }
    }

    populateForm(preventivo) {
        document.getElementById('hotel-name').value = preventivo.nomeHotel;
        document.getElementById('location').value = preventivo.localita || '';
        document.getElementById('checkin-date').value = preventivo.dataCheckin;
        document.getElementById('checkout-date').value = preventivo.dataCheckout;
        document.getElementById('total-price').value = preventivo.prezzoTotale;
        document.getElementById('hotel-contact').value = preventivo.emailTelefono || '';
        document.getElementById('adults').value = preventivo.adulti;
        document.getElementById('children').value = preventivo.bambini;
        document.getElementById('children-ages').value = preventivo.etaBambini;
        document.getElementById('notes').value = preventivo.note || '';

        // Check services
        Object.keys(preventivo.servizi).forEach(servizio => {
            const checkbox = document.getElementById(servizio);
            if (checkbox) {
                checkbox.checked = preventivo.servizi[servizio];
            }
        });

        this.calculateCurrentScore();
        
        // Remove from array to allow re-saving
        this.preventivi = this.preventivi.filter(p => p.id !== preventivo.id);
    }

    addToComparison(id) {
        const preventivo = this.preventivi.find(p => p.id === id);
        if (preventivo && !this.comparisonQuotes.find(p => p.id === id)) {
            this.comparisonQuotes.push(preventivo);
            this.renderComparison();
            this.showToast('Preventivo aggiunto al confronto', 'success');
        } else if (this.comparisonQuotes.find(p => p.id === id)) {
            this.showToast('Preventivo già nel confronto', 'info');
        }
    }

    renderComparison() {
        const comparisonSection = document.getElementById('comparison-section');
        const comparisonGrid = document.getElementById('comparison-grid');

        if (!comparisonSection || !comparisonGrid) return;

        if (this.comparisonQuotes.length === 0) {
            comparisonSection.style.display = 'none';
            return;
        }

        comparisonSection.style.display = 'block';

        // Find best quote (highest stars, then lowest price)
        const bestQuote = this.comparisonQuotes.reduce((best, current) => {
            if (current.stelle > best.stelle) return current;
            if (current.stelle === best.stelle && current.prezzoTotale < best.prezzoTotale) return current;
            return best;
        });

        comparisonGrid.innerHTML = this.comparisonQuotes.map(preventivo => `
            <div class="comparison-card ${preventivo.id === bestQuote.id ? 'comparison-card--best' : ''}">
                <h4>${preventivo.nomeHotel}</h4>
                <div class="comparison-item">
                    <span>Prezzo:</span>
                    <strong>€${preventivo.prezzoTotale}</strong>
                </div>
                <div class="comparison-item">
                    <span>Stelle:</span>
                    <strong class="stars">${'★'.repeat(preventivo.stelle)}${'☆'.repeat(5 - preventivo.stelle)}</strong>
                </div>
                <div class="comparison-item">
                    <span>Località:</span>
                    <strong>${preventivo.localita || '-'}</strong>
                </div>
                <div class="comparison-item">
                    <span>Date:</span>
                    <strong>${this.formatDateRange(preventivo.dataCheckin, preventivo.dataCheckout)}</strong>
                </div>
                <div class="comparison-item">
                    <span>Punteggio:</span>
                    <strong>${preventivo.punteggio}/198</strong>
                </div>
                <button class="btn btn--sm btn--outline" onclick="app.removeFromComparison(${preventivo.id})">Rimuovi</button>
            </div>
        `).join('');
    }

    removeFromComparison(id) {
        this.comparisonQuotes = this.comparisonQuotes.filter(p => p.id !== id);
        this.renderComparison();
        this.showToast('Preventivo rimosso dal confronto', 'info');
    }

    clearComparison() {
        this.comparisonQuotes = [];
        this.renderComparison();
        this.showToast('Confronto pulito', 'info');
    }

    // Email and URL parsing methods (simplified for now)
    parseEmailContent(emailText) {
        // Basic email parsing implementation
        const hotelNameMatch = emailText.match(/(?:hotel|albergo|resort|residence)\s+([^\n\r,]{2,50})/i);
        const priceMatch = emailText.match(/(?:€|euro|eur)\s*(\d+(?:[.,]\d+)?)/i);
        
        return {
            nomeHotel: hotelNameMatch ? hotelNameMatch[1].trim() : '',
            prezzoTotale: priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : '',
            servizi: {}
        };
    }

    extractEmailData() {
        const emailContent = document.getElementById('email-content').value;
        if (!emailContent.trim()) {
            this.showToast('Inserisci il contenuto dell\'email', 'warning');
            return;
        }

        const extractedData = this.parseEmailContent(emailContent);
        this.showEmailPreview(extractedData);
    }

    showEmailPreview(data) {
        const preview = document.getElementById('email-preview');
        const content = document.getElementById('email-preview-content');

        if (!preview || !content) return;

        content.innerHTML = `
            <div><strong>Nome Hotel:</strong> ${data.nomeHotel || 'Non trovato'}</div>
            <div><strong>Prezzo:</strong> €${data.prezzoTotale || 'Non trovato'}</div>
        `;

        preview.style.display = 'block';
        this.tempExtractedData = data;
    }

    async extractUrlData() {
        const url = document.getElementById('quote-url').value;
        if (!url.trim()) {
            this.showToast('Inserisci un URL valido', 'warning');
            return;
        }

        this.showToast('Funzionalità URL in sviluppo - usa il form manuale', 'info');
    }

    populateFormWithExtractedData(data) {
        if (data.nomeHotel) document.getElementById('hotel-name').value = data.nomeHotel;
        if (data.prezzoTotale) document.getElementById('total-price').value = data.prezzoTotale;
        this.showToast('Dati importati nel form', 'success');
    }

    // Storage methods
    savePreventivi() {
        try {
            window.localStorage.setItem('familyHotelPreventivi', JSON.stringify(this.preventivi));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.showToast('Errore nel salvataggio dati', 'error');
        }
    }

    loadPreventivi() {
        try {
            const data = window.localStorage.getItem('familyHotelPreventivi');
            if (data) {
                this.preventivi = JSON.parse(data);
                console.log('Data loaded from localStorage:', this.preventivi.length, 'items');
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.preventivi = [];
        }
    }

    // Toast notifications
    showToast(message, type = 'info') {
        console.log('Toast:', type, message);
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        toast.innerHTML = `
            <span class="toast__message">${message}</span>
            <button class="toast__close">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);

        // Manual close
        toast.querySelector('.toast__close').addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }
}

// Global app instance
let app;

// Initialize immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded, initializing app');
        app = new FamilyHotelManager();
    });
} else {
    console.log('DOM already ready, initializing app immediately');
    app = new FamilyHotelManager();
}
