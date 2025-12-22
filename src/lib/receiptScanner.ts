/**
 * RECEIPT SCANNER - OCR dla paragonów
 * 
 * Funkcje:
 * - Rozpoznawanie tekstu ze zdjęć paragonów (OCR)
 * - Ekstrakcja danych: kwota, data, nazwa sklepu, VAT
 * - Obsługa różnych formatów paragonów (PL/NL/EN)
 * - Pre-processing obrazu dla lepszej jakości OCR
 */

import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use CDN with https
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ReceiptData {
  total?: number;           // Kwota całkowita
  totalNet?: number;        // Kwota netto (jeśli znaleziona)
  vatAmount?: number;       // Kwota VAT
  vatRate?: number;         // Stawka VAT (%)
  date?: string;            // Data YYYY-MM-DD
  supplier?: string;        // Nazwa sklepu/dostawcy
  invoiceNumber?: string;   // Numer paragonu/faktury
  items?: Array<{           // Pozycje (opcjonalne)
    name: string;
    quantity: number;
    price: number;
  }>;
  rawText?: string;         // Pełny rozpoznany tekst
  confidence?: number;      // Pewność rozpoznania (0-100)
}

/**
 * Wyodrębnij tekst z PDF faktury
 */
async function extractTextFromPDF(pdfFile: File): Promise<string> {
  console.log('📄 Rozpoczynam czytanie PDF:', pdfFile.name);
  console.log('📦 PDF.js version:', pdfjsLib.version);
  console.log('🔧 Worker URL:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    console.log('✅ ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes');
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`📑 PDF załadowany: ${pdf.numPages} stron`);
    
    // Extract text from all pages
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
      console.log(`✅ Strona ${pageNum}/${pdf.numPages} odczytana (${pageText.length} znaków)`);
    }
    
    console.log('📝 Całkowity tekst z PDF:', fullText.length, 'znaków');
    console.log('📝 Pierwsze 500 znaków:', fullText.substring(0, 500));
    return fullText;
    
  } catch (error) {
    console.error('❌ Błąd odczytu PDF:', error);
    throw new Error('Nie udało się odczytać pliku PDF. Upewnij się, że to poprawny plik PDF z tekstem (nie skan obrazu).');
  }
}

/**
 * Skanuj paragon ze zdjęcia lub PDF
 */
export async function scanReceipt(
  file: File,
  language: 'pol' | 'nld' | 'eng' = 'pol',
  onProgress?: (progress: number) => void
): Promise<ReceiptData> {
  
  console.log('📷 Rozpoczynam skanowanie:', file.name, 'Type:', file.type);
  
  // PDF handling
  if (file.type === 'application/pdf') {
    console.log('📄 Wykryto PDF - używam PDF.js');
    
    try {
      const text = await extractTextFromPDF(file);
      const receiptData = parseReceiptText(text);
      receiptData.rawText = text;
      receiptData.confidence = 95; // PDF extraction is reliable
      
      return receiptData;
      
    } catch (error) {
      console.error('❌ Błąd czytania PDF:', error);
      throw error;
    }
  }
  
  // Image OCR handling (existing code)
  
  // Walidacja rozmiaru pliku (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Plik jest za duży (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksymalny rozmiar to 10MB.`);
  }
  
  // Walidacja typu pliku
  if (!file.type.startsWith('image/')) {
    throw new Error('Niewłaściwy typ pliku. Wybierz zdjęcie (JPG, PNG, WEBP).');
  }
  
  try {
    // Rozpoznaj tekst z OCR
    const result = await Tesseract.recognize(file, language, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const text = result.data.text;
    const confidence = result.data.confidence;
    
    console.log('✅ OCR zakończone. Pewność:', confidence.toFixed(1) + '%');
    console.log('📝 Rozpoznany tekst:', text);

    // Parsuj dane z tekstu
    const receiptData = parseReceiptText(text);
    receiptData.rawText = text;
    receiptData.confidence = confidence;

    return receiptData;

  } catch (error) {
    console.error('❌ Błąd skanowania paragonu:', error);
    
    // Bardziej szczegółowe komunikaty błędów
    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        throw new Error('Brak połączenia internetowego. OCR wymaga dostępu do sieci przy pierwszym użyciu.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Przekroczono czas oczekiwania. Spróbuj z mniejszym zdjęciem.');
      }
    }
    
    throw new Error('Nie udało się odczytać paragonu. Spróbuj zrobić wyraźniejsze zdjęcie lub zmniejsz rozmiar pliku.');
  }
}

/**
 * Parsuj tekst paragonu i wyodrębnij dane
 */
function parseReceiptText(text: string): ReceiptData {
  const data: ReceiptData = {};

  // Normalizuj tekst
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();

  const lines = normalized.split('\n');

  // --- KWOTA CAŁKOWITA ---
  // Szukaj wzorców: "TOTAL", "SUMA", "DO ZAPŁATY", "TOTAAL" (NL)
  // ENHANCED: Lepiej toleruje OCR errors (Igtaal, [gtaal, E35.)
  const totalPatterns = [
    // Standard keywords + amount
    /(?:to+[ta]+[la]*|suma|do zap.*|bet+a[la]*en|razem|podsumowanie)[:\s]*[€e]*\s*([0-9]+[.,][0-9]{2})/i,
    // Amount + keyword (reverse)
    /([0-9]+[.,][0-9]{2})\s*(?:to+[ta]+[la]*|suma|zł|eur|€)/i,
    // Keyword na poprzedniej linii, kwota w następnej (max 3 linie)
    /(?:to+[ta]+[la]*|suma|bet+a[la]*en).{0,50}\n.*?([0-9]+[.,][0-9]{2})/i,
  ];

  const foundAmounts: number[] = [];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(amount) && amount > 0.5) { // Ignore tiny amounts (round-off errors)
        foundAmounts.push(amount);
      }
    }
  }

  // FALLBACK: Jeśli nie znaleziono z keyword, znajdź wszystkie kwoty i weź największą
  if (foundAmounts.length === 0) {
    const allAmounts = text.match(/([0-9]+[.,][0-9]{2})/g);
    if (allAmounts) {
      for (const amt of allAmounts) {
        const num = parseFloat(amt.replace(',', '.'));
        if (!isNaN(num) && num > 3.0) { // Ignore VAT rates (21%) and small fees
          foundAmounts.push(num);
        }
      }
    }
  }

  // Wybierz największą kwotę (prawdopodobnie total, nie VAT rate)
  if (foundAmounts.length > 0) {
    data.total = Math.max(...foundAmounts);
    console.log('💰 Znaleziono kwotę:', data.total, `(wybrano spośród: ${foundAmounts.join(', ')})`);
  }

  // --- DATA ---
  // Wzorce dat: DD.MM.YYYY, DD-MM-YYYY, DD/MM/YYYY
  const datePatterns = [
    /(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})/,  // DD.MM.YYYY
    /(\d{4})[.\-\/](\d{2})[.\-\/](\d{2})/,  // YYYY-MM-DD
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        let date: string;
        if (match[3] && match[3].length === 4) {
          // DD.MM.YYYY → YYYY-MM-DD
          date = `${match[3]}-${match[2]}-${match[1]}`;
        } else {
          // YYYY-MM-DD
          date = `${match[1]}-${match[2]}-${match[3]}`;
        }
        
        // Walidacja daty
        if (isValidDate(date)) {
          data.date = date;
          console.log('📅 Znaleziono datę:', date);
          break;
        }
      } catch (e) {
        // Ignoruj nieprawidłowe daty
      }
    }
  }

  // --- VAT ---
  // Szukaj kwoty VAT i stawki
  const vatPatterns = [
    /(?:vat|btw|podatek)[:\s]*([0-9]+[.,][0-9]{2})/i,
    /([0-9]+)%[:\s]*([0-9]+[.,][0-9]{2})/,  // 21%: 12.50
  ];

  for (const pattern of vatPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // Znaleziono stawkę i kwotę
        data.vatRate = parseInt(match[1]);
        data.vatAmount = parseFloat(match[2].replace(',', '.'));
      } else {
        // Tylko kwota VAT
        data.vatAmount = parseFloat(match[1].replace(',', '.'));
      }
      console.log('📊 VAT:', data.vatRate ? `${data.vatRate}%` : '', data.vatAmount);
      break;
    }
  }

  // Oblicz netto jeśli mamy total i VAT
  if (data.total && data.vatAmount) {
    data.totalNet = data.total - data.vatAmount;
  }

  // --- NAZWA SKLEPU ---
  // NAJPIERW próbuj rozpoznać znane sieci sklepów (najdokładniejsze)
  // Sortuj od najdłuższych do najkrótszych (żeby "ALBERT HEIJN" było przed "AH")
  const knownBrands = [
    'HORNBACH BOUWMARKT', 'ALBERT HEIJN', 'TOTALENERGIES', 'MEDIA MARKT',
    'BURGER KING', 'MCDONALDS', 'STARBUCKS', 'RESTAURANT',
    'HORNBACH', 'BOUWMARKT', 'COOLBLUE', 'DECATHLON', 'KRUIDVAT',
    'ACTION', 'JUMBO', 'LIDL', 'ALDI', 'PLUS', 'DIRK', 'IKEA',
    'SHELL', 'TOTAL', 'ESSO', 'TEXACO', 'TINQ',
    'BLOKKER', 'XENOS', 'PRAXIS', 'KARWEI', 'GAMMA',
    'KFC', 'ETOS', 'HEMA', 'CAFE', 'HOTEL', 'LORR',
    'BOL.COM', 'BP', 'AH', 'DA' // Krótkie na końcu
  ];

  const upperText = text.toUpperCase();
  
  for (const brand of knownBrands) {
    // Sprawdź czy marka występuje jako CAŁE SŁOWO (nie fragment)
    const regex = new RegExp(`\\b${brand.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(upperText)) {
      data.supplier = brand;
      console.log('🏪 Rozpoznano markę:', brand);
      break;
    }
  }

  // Jeśli nie znaleziono znanej marki, szukaj w pierwszych liniach
  if (!data.supplier) {
    // Zwykle na górze paragonu (pierwsze 8 linii)
    const topLines = lines.slice(0, 8);
    const possibleSuppliers = topLines
      .filter(line => line.trim().length >= 3 && line.trim().length <= 50) // Min 3, max 50 znaków
      .filter(line => !/^\d/.test(line.trim())) // Pomijaj linie zaczynające się od cyfr
      .filter(line => !/(?:paragon|receipt|bon|kvitantie|klantenbon|datum|date|tijd|time)/i.test(line))
      .filter(line => !/(?:adres|address|straat|tel|phone|www|http|btw|vat|filiaal)/i.test(line))
      .filter(line => !/(?:station|pomp|pump|terminal|merchant)/i.test(line)) // Pomijaj numery stacji
      .filter(line => !line.match(/[{}[\]()]/)) // Pomijaj linie ze specjalnymi znakami
      .filter(line => !line.match(/[|_=]{2,}/)); // Pomijaj separatory

    if (possibleSuppliers.length > 0) {
      // Weź najdłuższą linię z pierwszych 3 (zwykle nazwa sklepu)
      const bestMatch = possibleSuppliers
        .slice(0, 3)
        .reduce((a, b) => a.length > b.length ? a : b)
        .trim()
        .replace(/[®™©|_=*+]/g, '') // Usuń znaki specjalne
        .replace(/\s+/g, ' ') // Normalizuj spacje
        .substring(0, 50); // Max 50 znaków (było 100)
      
      // Jeśli nazwa ma przynajmniej 3 znaki i nie zawiera śmieci
      if (bestMatch.length >= 3 && !bestMatch.match(/[{}[\]]{2,}/)) {
        data.supplier = bestMatch;
        console.log('🏪 Znaleziono sklep:', data.supplier);
      }
    }
  }

  // --- NUMER PARAGONU/FAKTURY ---
  const invoicePatterns = [
    /(?:nr|no|number|numer|bon)[:\s]*([A-Z0-9\-\/]+)/i,
    /(?:paragon|receipt|bon)[:\s]*([A-Z0-9\-\/]+)/i,
  ];

  for (const pattern of invoicePatterns) {
    const match = text.match(pattern);
    if (match && match[1].length < 30) {
      data.invoiceNumber = match[1].trim();
      console.log('🧾 Numer:', data.invoiceNumber);
      break;
    }
  }

  return data;
}

/**
 * Sprawdź czy data jest poprawna
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  // Sprawdź czy rok jest realistyczny (nie wcześniej niż 2000, nie później niż 2100)
  const year = date.getFullYear();
  if (year < 2000 || year > 2100) return false;
  
  // Sprawdź czy data nie jest w przyszłości i nie starsza niż 10 lat
  const now = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(now.getFullYear() - 10);
  
  return date <= now && date >= tenYearsAgo;
}

/**
 * Pre-processing obrazu dla lepszej jakości OCR
 * (opcjonalnie - można użyć canvas do poprawy kontrastu)
 */
export async function preprocessImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(file);
          return;
        }

        // Skaluj jeśli obraz jest za duży (max 2000px) - PERFORMANCE
        let width = img.width;
        let height = img.height;
        const maxSize = 2000;

        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
          console.log(`📐 Skalowanie obrazu: ${img.width}x${img.height} → ${width}x${height}`);
        }

        canvas.width = width;
        canvas.height = height;

        // Rysuj obraz
        ctx.drawImage(img, 0, 0, width, height);

        // Zwiększ kontrast
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Konwersja do grayscale + kontrast
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const contrast = 1.5; // Zwiększ kontrast
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          let value = factor * (avg - 128) + 128;
          value = Math.max(0, Math.min(255, value));
          
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }

        ctx.putImageData(imageData, 0, 0);

        // Konwertuj z powrotem na File
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name, { type: 'image/png' });
            resolve(processedFile);
          } else {
            resolve(file);
          }
        }, 'image/png');
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
