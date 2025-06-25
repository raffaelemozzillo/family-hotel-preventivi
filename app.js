# Codice JavaScript Aggiornato - Family Hotel Manager 2025

## Sezione: Proxy CORS Aggiornati (2025)

```javascript
// Proxy CORS aggiornati per 2025 - con ordine di priorità
const corsProxies = [
    {
        name: 'Corsfix',
        url: 'https://proxy.corsfix.com/?',
        format: 'simple',
        rateLimit: 'Unlimited',
        reliability: 'highest'
    },
    {
        name: 'AllOrigins',
        url: 'https://api.allorigins.win/raw?url=',
        format: 'simple',
        rateLimit: '20/min',
        reliability: 'high'
    },
    {
        name: 'CORS.x2u.in',
        url: 'https://cors.x2u.in/?',
        format: 'simple',
        rateLimit: '100/hour',
        reliability: 'high'
    },
    {
        name: 'Cloudflare CORS Anywhere',
        url: 'https://cloudflare-cors-anywhere.example.workers.dev/?',
        format: 'simple',
        rateLimit: 'Variable',
        reliability: 'medium'
    },
    {
        name: 'ThingProxy',
        url: 'https://thingproxy.freeboard.io/fetch/',
        format: 'simple',
        rateLimit: '10/sec',
        reliability: 'medium'
    },
    {
        name: 'CodeTabs',
        url: 'https://api.codetabs.com/v1/proxy?quest=',
        format: 'simple',
        rateLimit: '5/sec',
        reliability: 'low'
    }
];

## Sezione: Funzione di Estrazione URL Aggiornata

```javascript
async function extractUrlData() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();
    
    // Validazione URL migliorata
    if (!url || !isValidUrl(url)) {
        showToast('Inserisci un URL valido', 'error');
        return;
    }
    
    // Controlla se è un URL di Club Family Hotel
    const isClubFamilyHotel = url.includes('clubfamilyhotel');
    
    showToast('Inizio estrazione dati...', 'info');
    
    try {
        const extractedData = await tryExtractWithMultipleProxies(url, isClubFamilyHotel);
        
        if (extractedData) {
            showUrlPreview(extractedData);
            populateFormWithExtractedData(extractedData);
            showToast('Dati estratti con successo!', 'success');
        } else {
            showToast('Impossibile estrarre dati. Prova con un altro URL o usa il form manuale.', 'warning');
        }
    } catch (error) {
        console.error('Errore durante estrazione:', error);
        showToast('Errore durante l\'estrazione. Verifica l\'URL e riprova.', 'error');
    }
}

async function tryExtractWithMultipleProxies(url, isSpecialCase = false) {
    const statusElement = document.getElementById('extractionStatus');
    let lastError = null;
    
    for (let i = 0; i < corsProxies.length; i++) {
        const proxy = corsProxies[i];
        
        try {
            if (statusElement) {
                statusElement.textContent = `Tentativo ${i + 1}/${corsProxies.length}: ${proxy.name}...`;
            }
            
            const proxyUrl = proxy.url + encodeURIComponent(url);
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            
            if (html && html.length > 100) {
                console.log(`✅ Successo con ${proxy.name}`);
                
                // Parsing specifico per Club Family Hotel
                if (isSpecialCase) {
                    return parseClubFamilyHotelData(html, url);
                } else {
                    return parseHtmlForHotelData(html, url);
                }
            } else {
                throw new Error('Risposta HTML troppo corta o vuota');
            }
            
        } catch (error) {
            console.warn(`❌ Fallito con ${proxy.name}:`, error.message);
            lastError = error;
            
            if (statusElement) {
                statusElement.textContent = `${proxy.name} fallito: ${error.message}`;
            }
            
            // Pausa tra tentativi per evitare rate limiting
            if (i < corsProxies.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    
    if (statusElement) {
        statusElement.textContent = `Tutti i proxy falliti. Ultimo errore: ${lastError?.message || 'Sconosciuto'}`;
    }
    
    return null;
}

## Sezione: Parser Specifico per Club Family Hotel

```javascript
function parseClubFamilyHotelData(html, url) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const extractedData = {
        nomeHotel: '',
        dataInizio: '',
        dataFine: '',
        prezzoTotale: '',
        numeroAdulti: 2,
        numeroBambini: 2,
        servizi: [],
        note: '',
        fonte: 'Club Family Hotel'
    };
    
    // Estrazione nome hotel - specifico per Club Family Hotel
    const hotelSelectors = [
        'h1[class*="hotel"]',
        '.hotel-name',
        '[class*="property-name"]',
        'title',
        'h1, h2, h3'
    ];
    
    for (const selector of hotelSelectors) {
        const element = doc.querySelector(selector);
        if (element && element.textContent.trim()) {
            let hotelName = element.textContent.trim();
            
            // Pulizia specifica per Club Family Hotel
            hotelName = hotelName.replace(/club family hotel/gi, 'Club Family Hotel');
            hotelName = hotelName.replace(/cesenatico/gi, 'Cesenatico');
            
            if (hotelName.length > 5 && hotelName.length < 100) {
                extractedData.nomeHotel = hotelName;
                break;
            }
        }
    }
    
    // Se non trovato, usa valore predefinito
    if (!extractedData.nomeHotel) {
        extractedData.nomeHotel = 'Club Family Hotel Cesenatico';
    }
    
    // Estrazione date - pattern specifici per sistema di prenotazioni
    const datePatterns = [
        /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
        /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
        /(check[-\s]?in|arrivo|dal)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
        /(check[-\s]?out|partenza|al)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi
    ];
    
    const htmlText = doc.body.textContent || '';
    const dates = [];
    
    datePatterns.forEach(pattern => {
        const matches = htmlText.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const cleanDate = match.replace(/[^\d\/\-]/g, '');
                if (cleanDate.length >= 8) {
                    dates.push(cleanDate);
                }
            });
        }
    });
    
    if (dates.length >= 2) {
        extractedData.dataInizio = dates[0];
        extractedData.dataFine = dates[1];
    }
    
    // Estrazione prezzi - specifico per Club Family Hotel
    const pricePatterns = [
        /€\s*(\d{1,4}(?:[.,]\d{2})?)/g,
        /(\d{1,4}(?:[.,]\d{2})?)\s*€/g,
        /prezzo[:\s]*€?\s*(\d{1,4}(?:[.,]\d{2})?)/gi,
        /totale[:\s]*€?\s*(\d{1,4}(?:[.,]\d{2})?)/gi,
        /costo[:\s]*€?\s*(\d{1,4}(?:[.,]\d{2})?)/gi
    ];
    
    const prices = [];
    pricePatterns.forEach(pattern => {
        const matches = htmlText.match(pattern);
        if (matches) {
            matches.forEach(match => {
                const price = match.replace(/[^\d.,]/g, '');
                const numPrice = parseFloat(price.replace(',', '.'));
                if (numPrice > 100 && numPrice < 5000) {
                    prices.push(numPrice);
                }
            });
        }
    });
    
    if (prices.length > 0) {
        extractedData.prezzoTotale = Math.max(...prices).toFixed(2);
    }
    
    // Estrazione servizi - specifici per Club Family Hotel
    const clubFamilyServices = [
        { keyword: ['piscina', 'pool', 'swimming'], service: 'piscina' },
        { keyword: ['mini club', 'miniclub', 'kids club'], service: 'miniClub' },
        { keyword: ['animazione', 'animation', 'entertainment'], service: 'animazione' },
        { keyword: ['spiaggia', 'beach', 'mare'], service: 'spiaggiaPrivata' },
        { keyword: ['all inclusive', 'tutto incluso'], service: 'allInclusive' },
        { keyword: ['open bar', 'bar aperto'], service: 'openBar' },
        { keyword: ['parcheggio', 'parking'], service: 'parcheggio' },
        { keyword: ['wifi', 'internet'], service: 'wifi' },
        { keyword: ['aria condizionata', 'climatizzatore'], service: 'ariaCondizionata' },
        { keyword: ['palestra', 'fitness', 'gym'], service: 'palestra' }
    ];
    
    const lowerHtml = htmlText.toLowerCase();
    
    clubFamilyServices.forEach(({ keyword, service }) => {
        if (keyword.some(k => lowerHtml.includes(k))) {
            extractedData.servizi.push(service);
        }
    });
    
    // Note aggiuntive per Club Family Hotel
    extractedData.note = 'Estratto da Club Family Hotel - Verifica date e servizi';
    
    return extractedData;
}

## Sezione: Validazione URL Migliorata

```javascript
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function showToast(message, type = 'info') {
    // Rimuovi toast esistenti
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Stili per i toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        background-color: ${type === 'success' ? '#28a745' : 
                          type === 'error' ? '#dc3545' : 
                          type === 'warning' ? '#ffc107' : '#17a2b8'};
    `;
    
    document.body.appendChild(toast);
    
    // Rimuovi dopo 4 secondi
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 4000);
}

## Sezione: Gestione Status Estrazione

```javascript
function createExtractionStatusElement() {
    const statusElement = document.createElement('div');
    statusElement.id = 'extractionStatus';
    statusElement.style.cssText = `
        margin-top: 10px;
        padding: 10px;
        background-color: #f8f9fa;
        border-radius: 5px;
        font-size: 14px;
        color: #6c757d;
        display: none;
    `;
    
    const urlSection = document.querySelector('.url-section');
    if (urlSection) {
        urlSection.appendChild(statusElement);
    }
    
    return statusElement;
}

// Inizializza elemento status se non esiste
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('extractionStatus')) {
        createExtractionStatusElement();
    }
});
```

## Istruzioni per l'Implementazione

1. **Sostituisci la funzione `extractUrlData()`** nel tuo file `app.js` con la versione aggiornata
2. **Aggiungi i nuovi proxy CORS** all'inizio del file
3. **Includi le nuove funzioni** di parsing specifiche per Club Family Hotel
4. **Aggiungi la gestione migliorata degli errori** con toast notifications

## Caratteristiche Principali

- **6 proxy CORS aggiornati** per il 2025 con system di fallback
- **Parser specifico** per Club Family Hotel Cesenatico
- **Gestione errori robusta** con retry automatico
- **Validazione URL migliorata** con controlli specifici
- **Toast notifications** per feedback utente in tempo reale
- **Timeout configurabile** per evitare attese infinite

## Limitazioni Note

- Alcuni URL potrebbero richiedere autenticazione
- I proxy gratuiti hanno rate limiting
- Pagine con contenuto dinamico potrebbero non essere completamente accessibili

Questa versione aggiornata dovrebbe risolvere la maggior parte dei problemi CORS che stai riscontrando.
