class FamilyHotelManager {
    constructor() {
        this.preventivi = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        console.log('DOM loaded, initializing app');
        this.initializeEventListeners();
        this.loadData();
        this.updateDashboard();
        console.log('Initialization complete, preventivi:', this.preventivi.length);
    }

    initializeEventListeners() {
        console.log('Setting up event listeners');
        
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                console.log('Navigation clicked:', section);
                this.showSection(section);
            });
        });

        // Form submission
        const form = document.getElementById('quote-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Cancel edit button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }

        // Search and filters
        const searchFilter = document.getElementById('search-filter');
        if (searchFilter) {
            searchFilter.addEventListener('input', () => this.applyFilters());
        }

        const priceFilter = document.getElementById('price-filter');
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.applyFilters());
        }

        const ratingFilter = document.getElementById('rating-filter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', () => this.applyFilters());
        }

        // Email import
        const processEmailBtn = document.getElementById('process-email');
        if (processEmailBtn) {
            processEmailBtn.addEventListener('click', () => this.processEmailContent());
        }

        const processFilesBtn = document.getElementById('process-files');
        if (processFilesBtn) {
            processFilesBtn.addEventListener('click', () => this.processEmailFiles());
        }

        const saveEmailBtn = document.getElementById('save-email-data');
        if (saveEmailBtn) {
            saveEmailBtn.addEventListener('click', () => this.saveEmailData());
        }

        // URL import
        const extractUrlBtn = document.getElementById('extract-url');
        if (extractUrlBtn) {
            extractUrlBtn.addEventListener('click', () => this.extractUrlData());
        }

        const saveUrlBtn = document.getElementById('save-url-data');
        if (saveUrlBtn) {
            saveUrlBtn.addEventListener('click', () => this.saveUrlData());
        }

        // Table actions (Edit and Delete)
        const quotesTable = document.getElementById('quotes-table');
        if (quotesTable) {
            quotesTable.addEventListener('click', (e) => this.handleTableAction(e));
        }

        // Modal events
        this.initializeModalEvents();
    }

    initializeModalEvents() {
        const modal = document.getElementById('delete-modal');
        const closeButtons = document.querySelectorAll('.close-modal');
        const confirmButton = document.querySelector('.confirm-delete');

        // Close modal events
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeDeleteModal());
        });

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeDeleteModal();
                }
            });
        }

        // Confirm delete
        if (confirmButton) {
            confirmButton.addEventListener('click', () => this.confirmDelete());
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                this.closeDeleteModal();
            }
        });
    }

    loadData() {
        const stored = localStorage.getItem('preventivi');
        if (stored) {
            this.preventivi = JSON.parse(stored);
            console.log('Data loaded from localStorage:', this.preventivi.length, 'items');
        } else {
            this.initializeExampleData();
        }
    }

    saveData() {
        localStorage.setItem('preventivi', JSON.stringify(this.preventivi));
    }

    initializeExampleData() {
        this.preventivi = [
            {
                id: this.generateId(),
                hotel: "Family Resort Marina",
                checkIn: "2025-07-15",
                checkOut: "2025-07-22",
                adults: 2,
                children: 2,
                price: 1580,
                location: "Rimini, Emilia-Romagna",
                email: "info@familyresortmarina.it",
                phone: "+39 0541 123456",
                notes: "Ottima posizione fronte mare con servizi family-friendly completi",
                services: {
                    piscina: true,
                    miniClub: true,
                    animazione: true,
                    spiaggiaPrivata: true,
                    parcheggio: true,
                    wifi: true,
                    allInclusive: false,
                    spa: true,
                    palestra: false,
                    ariaCondizionata: true
                },
                score: 0,
                stars: 0,
                source: "manuale"
            },
            {
                id: this.generateId(),
                hotel: "Hotel Delle Palme Family Club",
                checkIn: "2025-08-01",
                checkOut: "2025-08-08",
                adults: 2,
                children: 2,
                price: 1200,
                location: "Gatteo a Mare, Emilia-Romagna",
                email: "booking@hoteldellepalme.it",
                phone: "+39 0547 987654",
                notes: "All inclusive con programmi dedicati per bambini 4-12 anni",
                services: {
                    piscina: true,
                    miniClub: true,
                    animazione: true,
                    spiaggiaPrivata: false,
                    parcheggio: true,
                    wifi: true,
                    allInclusive: true,
                    spa: false,
                    palestra: true,
                    ariaCondizionata: true
                },
                score: 0,
                stars: 0,
                source: "email"
            },
            {
                id: this.generateId(),
                hotel: "Residence Luna Mare",
                checkIn: "2025-07-20",
                checkOut: "2025-07-27",
                adults: 2,
                children: 2,
                price: 760,
                location: "Cattolica, Emilia-Romagna",
                email: "info@residencelunamare.it",
                phone: "+39 0541 456789",
                notes: "Appartamenti con cucina, ideale per famiglie indipendenti",
                services: {
                    piscina: true,
                    miniClub: false,
                    animazione: false,
                    spiaggiaPrivata: false,
                    parcheggio: true,
                    wifi: true,
                    allInclusive: false,
                    spa: false,
                    palestra: false,
                    ariaCondizionata: true
                },
                score: 0,
                stars: 0,
                source: "url"
            }
        ];

        this.preventivi.forEach(preventivo => {
            preventivo.score = this.calculateScore(preventivo);
            preventivo.stars = this.calculateStars(preventivo.score);
        });

        this.saveData();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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

        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        const activeTab = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        console.log('Showing section:', sectionName);

        // Special handling for dashboard
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        }
    }

    handleTableAction(e) {
        const target = e.target;
        
        if (target.classList.contains('btn-edit')) {
            const row = target.closest('tr');
            const id = row.dataset.id;
            this.editPreventivo(id);
        } else if (target.classList.contains('btn-delete')) {
            const row = target.closest('tr');
            const id = row.dataset.id;
            this.showDeleteModal(id);
        }
    }

    editPreventivo(id) {
        const preventivo = this.preventivi.find(p => p.id === id);
        if (!preventivo) return;

        // Populate form with existing data
        this.populateForm(preventivo);
        
        // Set edit mode
        this.currentEditId = id;
        document.getElementById('current-edit-id').value = id;
        
        // Update UI
        document.getElementById('form-title').textContent = 'Modifica Preventivo';
        document.getElementById('submit-btn').textContent = 'Aggiorna Preventivo';
        document.getElementById('cancel-edit-btn').style.display = 'inline-block';
        
        // Show the form section
        this.showSection('add');
        
        // Highlight the row being edited
        document.querySelectorAll('.dashboard-table tbody tr').forEach(row => {
            row.classList.remove('editing');
        });
        const editingRow = document.querySelector(`tr[data-id="${id}"]`);
        if (editingRow) {
            editingRow.classList.add('editing');
        }
        
        this.showToast('Modifica del preventivo in corso', 'info');
    }

    populateForm(preventivo) {
        // Basic information
        document.getElementById('hotel').value = preventivo.hotel || '';
        document.getElementById('check-in').value = preventivo.checkIn || '';
        document.getElementById('check-out').value = preventivo.checkOut || '';
        document.getElementById('adults').value = preventivo.adults || 2;
        document.getElementById('children').value = preventivo.children || 2;
        document.getElementById('price').value = preventivo.price || '';
        document.getElementById('location').value = preventivo.location || '';
        document.getElementById('email').value = preventivo.email || '';
        document.getElementById('phone').value = preventivo.phone || '';
        document.getElementById('notes').value = preventivo.notes || '';

        // Services
        if (preventivo.services) {
            Object.keys(preventivo.services).forEach(service => {
                const checkbox = document.getElementById(service);
                if (checkbox) {
                    checkbox.checked = preventivo.services[service];
                }
            });
        }
    }

    cancelEdit() {
        this.currentEditId = null;
        document.getElementById('current-edit-id').value = '';
        document.getElementById('form-title').textContent = 'Aggiungi Nuovo Preventivo';
        document.getElementById('submit-btn').textContent = 'Aggiungi Preventivo';
        document.getElementById('cancel-edit-btn').style.display = 'none';
        
        // Clear form
        document.getElementById('quote-form').reset();
        
        // Remove highlighting
        document.querySelectorAll('.dashboard-table tbody tr').forEach(row => {
            row.classList.remove('editing');
        });
        
        this.showToast('Modifica annullata', 'info');
    }

    showDeleteModal(id) {
        const preventivo = this.preventivi.find(p => p.id === id);
        if (!preventivo) return;

        // Set the hotel name in the modal
        const hotelNameElement = document.querySelector('.hotel-name-to-delete');
        if (hotelNameElement) {
            hotelNameElement.textContent = preventivo.hotel;
        }

        // Store the ID for deletion
        this.currentDeleteId = id;

        // Show the modal
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentDeleteId = null;
    }

    confirmDelete() {
        if (!this.currentDeleteId) return;

        const preventivo = this.preventivi.find(p => p.id === this.currentDeleteId);
        const hotelName = preventivo ? preventivo.hotel : 'Sconosciuto';

        // Remove from array
        this.preventivi = this.preventivi.filter(p => p.id !== this.currentDeleteId);
        
        // Save to localStorage
        this.saveData();
        
        // Update dashboard
        this.updateDashboard();
        
        // Close modal
        this.closeDeleteModal();
        
        // Show success message
        this.showToast(`Preventivo per ${hotelName} eliminato con successo`, 'success');
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        
        if (this.currentEditId) {
            // Update existing preventivo
            const index = this.preventivi.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                this.preventivi[index] = {
                    ...formData,
                    id: this.currentEditId,
                    source: this.preventivi[index].source || 'manuale'
                };
                this.showToast('Preventivo aggiornato con successo!', 'success');
            }
            this.cancelEdit();
        } else {
            // Add new preventivo
            const newPreventivo = {
                ...formData,
                id: this.generateId(),
                source: 'manuale'
            };
            this.preventivi.push(newPreventivo);
            this.showToast('Preventivo aggiunto con successo!', 'success');
        }

        this.saveData();
        this.updateDashboard();
        document.getElementById('quote-form').reset();
        this.showSection('dashboard');
    }

    getFormData() {
        const formData = {
            hotel: document.getElementById('hotel').value,
            checkIn: document.getElementById('check-in').value,
            checkOut: document.getElementById('check-out').value,
            adults: parseInt(document.getElementById('adults').value) || 2,
            children: parseInt(document.getElementById('children').value) || 2,
            price: parseFloat(document.getElementById('price').value) || 0,
            location: document.getElementById('location').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            notes: document.getElementById('notes').value,
            services: {}
        };

        // Collect services
        const serviceElements = document.querySelectorAll('.services-grid input[type="checkbox"]');
        serviceElements.forEach(element => {
            formData.services[element.name] = element.checked;
        });

        formData.score = this.calculateScore(formData);
        formData.stars = this.calculateStars(formData.score);

        return formData;
    }

    calculateScore(preventivo) {
        const servicesHighPriority = [
            { nome: "piscina", label: "Piscina", peso: 10 },
            { nome: "miniClub", label: "Mini Club", peso: 10 },
            { nome: "animazione", label: "Animazione", peso: 10 },
            { nome: "spiaggiaPrivata", label: "Spiaggia privata", peso: 10 },
            { nome: "parcheggio", label: "Parcheggio", peso: 10 },
            { nome: "wifi", label: "WiFi gratuito", peso: 10 },
            { nome: "allInclusive", label: "All Inclusive", peso: 10 },
            { nome: "spa", label: "SPA/Benessere", peso: 10 },
            { nome: "palestra", label: "Palestra", peso: 10 },
            { nome: "ariaCondizionata", label: "Aria condizionata", peso: 10 }
        ];

        let score = 0;
        if (preventivo.services) {
            servicesHighPriority.forEach(service => {
                if (preventivo.services[service.nome]) {
                    score += service.peso;
                }
            });
        }

        return score;
    }

    calculateStars(score) {
        if (score >= 80) return 5;
        if (score >= 60) return 4;
        if (score >= 40) return 3;
        if (score >= 20) return 2;
        return 1;
    }

    updateDashboard() {
        console.log('Updating dashboard with', this.preventivi.length, 'preventivi');
        
        this.updateStats();
        this.renderTable();
    }

    updateStats() {
        const total = this.preventivi.length;
        const avgPrice = total > 0 ? Math.round(this.preventivi.reduce((sum, p) => sum + p.price, 0) / total) : 0;
        const bestRating = total > 0 ? Math.max(...this.preventivi.map(p => p.stars)) : 0;
        const prices = this.preventivi.map(p => p.price).sort((a, b) => a - b);
        const maxSavings = prices.length > 1 ? Math.round(prices[prices.length - 1] - prices[0]) : 0;

        document.getElementById('total-quotes').textContent = total;
        document.getElementById('avg-price').textContent = `€${avgPrice}`;
        document.getElementById('best-rating').textContent = `${bestRating}★`;
        document.getElementById('max-savings').textContent = `€${maxSavings}`;

        console.log('Stats updated - Total:', total, 'Avg:', avgPrice, 'Best:', bestRating);
    }

    renderTable() {
        const tbody = document.getElementById('quotes-table');
        if (!tbody) return;

        let filteredPreventivi = [...this.preventivi];
        
        // Apply filters
        const searchTerm = document.getElementById('search-filter')?.value.toLowerCase() || '';
        const priceFilter = document.getElementById('price-filter')?.value || '';
        const ratingFilter = document.getElementById('rating-filter')?.value || '';

        if (searchTerm) {
            filteredPreventivi = filteredPreventivi.filter(p => 
                p.hotel.toLowerCase().includes(searchTerm) ||
                p.location.toLowerCase().includes(searchTerm)
            );
        }

        if (priceFilter) {
            filteredPreventivi = filteredPreventivi.filter(p => {
                switch (priceFilter) {
                    case 'low': return p.price <= 800;
                    case 'medium': return p.price > 800 && p.price <= 1500;
                    case 'high': return p.price > 1500;
                    default: return true;
                }
            });
        }

        if (ratingFilter) {
            const minRating = parseInt(ratingFilter);
            filteredPreventivi = filteredPreventivi.filter(p => p.stars >= minRating);
        }

        tbody.innerHTML = filteredPreventivi.map(preventivo => {
            const servicesArray = [];
            if (preventivo.services) {
                Object.keys(preventivo.services).forEach(key => {
                    if (preventivo.services[key]) {
                        const labels = {
                            piscina: '🏊',
                            miniClub: '🎈',
                            animazione: '🎭',
                            spiaggiaPrivata: '🏖️',
                            parcheggio: '🚗',
                            wifi: '📶',
                            allInclusive: '🍽️',
                            spa: '💆',
                            palestra: '🏋️',
                            ariaCondizionata: '❄️'
                        };
                        servicesArray.push(labels[key] || key);
                    }
                });
            }

            return `
                <tr data-id="${preventivo.id}">
                    <td>
                        <strong>${preventivo.hotel}</strong>
                        <br><small>${preventivo.location || 'N/A'}</small>
                    </td>
                    <td><strong>€${preventivo.price}</strong></td>
                    <td>
                        ${preventivo.checkIn} <br>
                        <small>→ ${preventivo.checkOut}</small>
                    </td>
                    <td>
                        <span class="rating-stars">${'★'.repeat(preventivo.stars)}${'☆'.repeat(5-preventivo.stars)}</span>
                        <br><small>${preventivo.score}/100</small>
                    </td>
                    <td>
                        <div class="service-tags">
                            ${servicesArray.slice(0, 3).map(service => 
                                `<span class="service-tag">${service}</span>`
                            ).join('')}
                            ${servicesArray.length > 3 ? `<span class="service-tag">+${servicesArray.length - 3}</span>` : ''}
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary btn-edit" title="Modifica">
                                ✏️ Modifica
                            </button>
                            <button class="btn btn-sm btn-danger btn-delete" title="Elimina">
                                🗑️ Elimina
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        console.log('Rendering table with', filteredPreventivi.length, 'quotes');
    }

    applyFilters() {
        this.renderTable();
    }

    // Email processing methods
    processEmailContent() {
        const content = document.getElementById('email-content').value;
        if (!content.trim()) {
            this.showToast('Inserisci il contenuto della email', 'warning');
            return;
        }

        const extractedData = this.parseEmailContent(content);
        this.showEmailPreview(extractedData);
    }

    processEmailFiles() {
        const files = document.getElementById('email-file').files;
        if (files.length === 0) {
            this.showToast('Seleziona almeno un file', 'warning');
            return;
        }

        // Process first file for demo
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const extractedData = this.parseEmailContent(content);
            this.showEmailPreview(extractedData);
        };
        reader.readAsText(file);
    }

    parseEmailContent(content) {
        const data = {
            hotel: '',
            checkIn: '',
            checkOut: '',
            price: 0,
            location: '',
            services: {}
        };

        // Basic pattern matching for Italian emails
        const hotelMatch = content.match(/(?:hotel|albergo|resort|residence)\s+([^\n\r]{5,50})/i);
        if (hotelMatch) data.hotel = hotelMatch[1].trim();

        const priceMatch = content.match(/(?:€|euro)\s*(\d+(?:[\.,]\d+)?)/i);
        if (priceMatch) data.price = parseFloat(priceMatch[1].replace(',', '.'));

        // Date patterns
        const datePattern = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/g;
        const dates = [];
        let match;
        while ((match = datePattern.exec(content)) !== null) {
            dates.push(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`);
        }
        if (dates.length >= 2) {
            data.checkIn = dates[0];
            data.checkOut = dates[1];
        }

        // Services detection
        const serviceKeywords = {
            piscina: /piscina/i,
            miniClub: /mini[\s-]?club|baby[\s-]?club/i,
            animazione: /animazione|intrattenimento/i,
            spiaggiaPrivata: /spiaggia[\s]privata/i,
            parcheggio: /parcheggio|parking/i,
            wifi: /wi[\s-]?fi|internet/i,
            allInclusive: /all[\s-]?inclusive|tutto[\s]incluso/i
        };

        Object.keys(serviceKeywords).forEach(service => {
            data.services[service] = serviceKeywords[service].test(content);
        });

        return data;
    }

    showEmailPreview(data) {
        const resultsSection = document.getElementById('email-results');
        const previewDiv = document.getElementById('email-preview');
        
        if (!resultsSection || !previewDiv) return;

        const servicesHtml = Object.keys(data.services)
            .filter(key => data.services[key])
            .map(service => `<span class="service-tag">${service}</span>`)
            .join('');

        previewDiv.innerHTML = `
            <div class="preview-grid">
                <div class="preview-item">
                    <h4>🏨 Hotel</h4>
                    <p>${data.hotel || 'Non trovato'}</p>
                </div>
                <div class="preview-item">
                    <h4>💰 Prezzo</h4>
                    <p>€${data.price || 'Non trovato'}</p>
                </div>
                <div class="preview-item">
                    <h4>📅 Check-in</h4>
                    <p>${data.checkIn || 'Non trovato'}</p>
                </div>
                <div class="preview-item">
                    <h4>📅 Check-out</h4>
                    <p>${data.checkOut || 'Non trovato'}</p>
                </div>
                <div class="preview-item">
                    <h4>🎯 Servizi</h4>
                    <div>${servicesHtml || 'Nessun servizio identificato'}</div>
                </div>
            </div>
        `;

        this.currentEmailData = data;
        resultsSection.style.display = 'block';
        this.showToast('Dati estratti dalla email!', 'success');
    }

    saveEmailData() {
        if (!this.currentEmailData) return;

        const preventivo = {
            ...this.currentEmailData,
            id: this.generateId(),
            adults: 2,
            children: 2,
            email: '',
            phone: '',
            notes: 'Importato da email',
            source: 'email'
        };

        preventivo.score = this.calculateScore(preventivo);
        preventivo.stars = this.calculateStars(preventivo.score);

        this.preventivi.push(preventivo);
        this.saveData();
        this.updateDashboard();

        document.getElementById('email-results').style.display = 'none';
        document.getElementById('email-content').value = '';
        
        this.showToast('Preventivo salvato dalla email!', 'success');
        this.showSection('dashboard');
    }

    // URL extraction methods
    async extractUrlData() {
        const urlInput = document.getElementById('url-input');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showToast('Inserisci un URL valido', 'warning');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showToast('URL non valido', 'error');
            return;
        }

        // Updated CORS proxies for 2025
        const proxies = [
            'https://api.allorigins.win/get?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/',
            'https://cors-proxy.htmldriven.com/?url=',
            'https://yacdn.org/proxy/'
        ];

        for (let i = 0; i < proxies.length; i++) {
            const proxy = proxies[i];
            this.showToast(`Tentativo ${i + 1}/${proxies.length}: ${proxy.split('/')[2]}...`, 'info');
            
            try {
                const response = await fetch(proxy + encodeURIComponent(url), {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                let htmlContent;
                if (proxy.includes('allorigins')) {
                    const data = await response.json();
                    htmlContent = data.contents;
                } else {
                    htmlContent = await response.text();
                }

                const extractedData = this.parseHtmlForHotelData(htmlContent);
                
                if (extractedData.hotel || extractedData.price) {
                    this.showToast(`Dati estratti con successo! Proxy usato: ${proxy.split('/')[2]}`, 'success');
                    this.showUrlPreview(extractedData);
                    return;
                }
            } catch (error) {
                console.log(`Proxy ${proxy} fallito:`, error);
            }
        }

        this.showToast('Impossibile estrarre dati da questo URL. Verifica che sia accessibile pubblicamente.', 'error');
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    parseHtmlForHotelData(html) {
        const data = {
            hotel: '',
            checkIn: '',
            checkOut: '',
            price: 0,
            location: '',
            services: {}
        };

        // Create a temporary DOM to parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract hotel name
        let hotelName = '';
        
        // Try meta tags first
        const ogTitle = doc.querySelector('meta[property="og:title"]');
        if (ogTitle) hotelName = ogTitle.content;
        
        if (!hotelName) {
            const metaTitle = doc.querySelector('meta[name="title"]');
            if (metaTitle) hotelName = metaTitle.content;
        }
        
        if (!hotelName) {
            const titleTag = doc.querySelector('title');
            if (titleTag) hotelName = titleTag.textContent;
        }
        
        if (!hotelName) {
            const h1 = doc.querySelector('h1');
            if (h1) hotelName = h1.textContent;
        }

        // Clean hotel name
        if (hotelName) {
            hotelName = hotelName.trim()
                .replace(/\s*[\|\-]\s*.*/g, '') // Remove everything after | or -
                .replace(/booking\.com/gi, '')
                .replace(/expedia/gi, '')
                .replace(/hotels\.com/gi, '')
                .trim();
            data.hotel = hotelName;
        }

        // Extract price
        const priceRegex = /€\s*(\d+(?:[.,]\d+)?)/;
        const bodyText = doc.body ? doc.body.textContent : html;
        const priceMatch = bodyText.match(priceRegex);
        if (priceMatch) {
            data.price = parseFloat(priceMatch[1].replace(',', '.'));
        }

        // Extract services based on keywords
        const text = bodyText.toLowerCase();
        const serviceKeywords = {
            piscina: ['piscina', 'pool', 'swimming'],
            miniClub: ['mini club', 'kids club', 'baby club'],
            animazione: ['animazione', 'entertainment', 'animation'],
            spiaggiaPrivata: ['spiaggia privata', 'private beach'],
            parcheggio: ['parcheggio', 'parking', 'garage'],
            wifi: ['wifi', 'wi-fi', 'internet gratuito'],
            spa: ['spa', 'wellness', 'benessere'],
            palestra: ['palestra', 'fitness', 'gym']
        };

        Object.keys(serviceKeywords).forEach(service => {
            const keywords = serviceKeywords[service];
            data.services[service] = keywords.some(keyword => text.includes(keyword));
        });

        return data;
    }

    showUrlPreview(data) {
        const resultsSection = document.getElementById('url-results');
        const previewDiv = document.getElementById('url-preview');
        
        if (!resultsSection || !previewDiv) return;

        const servicesHtml = Object.keys(data.services)
            .filter(key => data.services[key])
            .map(service => {
                const labels = {
                    piscina: '🏊 Piscina',
                    miniClub: '🎈 Mini Club',
                    animazione: '🎭 Animazione',
                    spiaggiaPrivata: '🏖️ Spiaggia Privata',
                    parcheggio: '🚗 Parcheggio',
                    wifi: '📶 WiFi',
                    spa: '💆 SPA',
                    palestra: '🏋️ Palestra'
                };
                return `<span class="service-tag">${labels[service] || service}</span>`;
            })
            .join('');

        previewDiv.innerHTML = `
            <div class="preview-grid">
                <div class="preview-item">
                    <h4>🏨 Hotel</h4>
                    <p>${data.hotel || 'Non identificato'}</p>
                </div>
                <div class="preview-item">
                    <h4>💰 Prezzo</h4>
                    <p>${data.price ? `€${data.price}` : 'Non identificato'}</p>
                </div>
                <div class="preview-item">
                    <h4>📍 Località</h4>
                    <p>${data.location || 'Non identificata'}</p>
                </div>
                <div class="preview-item">
                    <h4>🎯 Servizi Identificati</h4>
                    <div class="service-tags">
                        ${servicesHtml || '<span style="color: #666;">Nessun servizio identificato</span>'}
                    </div>
                </div>
            </div>
        `;

        this.currentUrlData = data;
        resultsSection.style.display = 'block';
    }

    saveUrlData() {
        if (!this.currentUrlData) return;

        const preventivo = {
            ...this.currentUrlData,
            id: this.generateId(),
            adults: 2,
            children: 2,
            email: '',
            phone: '',
            notes: 'Importato da URL',
            source: 'url'
        };

        preventivo.score = this.calculateScore(preventivo);
        preventivo.stars = this.calculateStars(preventivo.score);

        this.preventivi.push(preventivo);
        this.saveData();
        this.updateDashboard();

        document.getElementById('url-results').style.display = 'none';
        document.getElementById('url-input').value = '';
        
        this.showToast('Preventivo salvato da URL!', 'success');
        this.showSection('dashboard');
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.log('Toast:', type, message);
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Remove after 4 seconds
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.familyHotelManager = new FamilyHotelManager();
});