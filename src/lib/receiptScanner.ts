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
 * Skanuj paragon ze zdjęcia
 */
export async function scanReceipt(
  imageFile: File,
  language: 'pol' | 'nld' | 'eng' = 'pol',
  onProgress?: (progress: number) => void
): Promise<ReceiptData> {
  
  console.log('📷 Rozpoczynam skanowanie paragonu:', imageFile.name);
  
  try {
    // Rozpoznaj tekst z OCR
    const result = await Tesseract.recognize(imageFile, language, {
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
    throw new Error('Nie udało się odczytać paragonu. Spróbuj zrobić wyraźniejsze zdjęcie.');
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
  const totalPatterns = [
    /(?:total|suma|do zap.*|totaal|betalen|razem|podsumowanie)[:\s]*([0-9]+[.,][0-9]{2})/i,
    /([0-9]+[.,][0-9]{2})\s*(?:total|suma|zł|eur|€)/i,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      data.total = amount;
      console.log('💰 Znaleziono kwotę:', amount);
      break;
    }
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
  // Zwykle na górze paragonu (pierwsze 3 linie)
  const topLines = lines.slice(0, 3);
  const possibleSuppliers = topLines
    .filter(line => line.trim().length > 3)
    .filter(line => !/^\d/.test(line.trim())) // Pomijaj linie zaczynające się od cyfr
    .filter(line => !/(?:paragon|receipt|bon|kvitantie)/i.test(line)); // Pomijaj typowe nagłówki

  if (possibleSuppliers.length > 0) {
    // Weź najdłuższą linię (zwykle nazwa sklepu)
    data.supplier = possibleSuppliers
      .reduce((a, b) => a.length > b.length ? a : b)
      .trim()
      .substring(0, 100); // Max 100 znaków
    console.log('🏪 Znaleziono sklep:', data.supplier);
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

        // Skaluj jeśli obraz jest za duży (max 2000px)
        let width = img.width;
        let height = img.height;
        const maxSize = 2000;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
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
