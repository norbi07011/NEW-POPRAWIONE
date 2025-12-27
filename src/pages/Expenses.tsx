import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useExpenses, useClients } from '@/hooks/useElectronDB';
import { useAudio } from '@/contexts/AudioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, PencilSimple, Trash, DownloadSimple, Receipt, CreditCard, Camera, Image as ImageIcon, X, Scan, Upload } from '@phosphor-icons/react';
import { Expense, EXPENSE_CATEGORIES, ExpenseCategory, ExpenseAttachment } from '@/types/expenses';
import { formatCurrency, formatDate } from '@/lib/invoice-utils';
import { calculateNetFromGross, calculateGrossFromNet, type VATRate } from '@/lib/vat-calculator';
import { toast } from 'sonner';
import { scanReceipt, type ReceiptData } from '@/lib/receiptScanner';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function Expenses() {
  const { t, i18n } = useTranslation();
  const { isMuted } = useAudio();
  const { expenses, loading, createExpense, updateExpense, deleteExpense } = useExpenses();
  const { clients } = useClients();
  const { showError, handleAsync } = useErrorHandler();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [attachments, setAttachments] = useState<ExpenseAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const csvImportInputRef = useRef<HTMLInputElement>(null);
  
  // OCR scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanFile, setCurrentScanFile] = useState(''); // Nazwa aktualnie skanowanego pliku
  const [totalScans, setTotalScans] = useState(0); // Liczba wszystkich paragonów do skanowania
  const [completedScans, setCompletedScans] = useState(0); // Liczba ukończonych skanowań
  const scanInputRef = useRef<HTMLInputElement>(null);
  
  // NOWY STATE: Przełącznik "Kwota zawiera VAT"
  const [amountIncludesVAT, setAmountIncludesVAT] = useState(false); // Domyślnie FALSE (wpisz NETTO z paragonu)
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'it_software' as ExpenseCategory,
    supplier: '',
    description: '',
    amount_net: '',
    vat_rate: '21',
    payment_method: 'bank_transfer',
    is_vat_deductible: true,
    is_business_expense: true,
    invoice_number: '',
    notes: '',
  });

  // Calculate amounts - NOWA LOGIKA z przełącznikiem VAT
  const calculateAmounts = (amount: number, vatRate: number) => {
    // SCENARIUSZ 1: Kwota NETTO (z paragonu) - DODAJ VAT ← DOMYŚLNE!
    if (!amountIncludesVAT) {
      const result = calculateGrossFromNet(amount, vatRate as VATRate);
      return {
        net: result.net,
        vat: result.vat,
        gross: result.gross,
      };
    }
    // SCENARIUSZ 2: Kwota BRUTTO (z rachunku) - ODLICZ VAT
    else {
      const result = calculateNetFromGross(amount, vatRate as VATRate);
      return {
        net: result.net,
        vat: result.vat,
        gross: result.gross,
      };
    }
  };

  // Filter expenses by selected month
  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter(exp => {
      return exp.date.startsWith(selectedMonth);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedMonth]);

  // Calculate totals
  const totals = useMemo(() => {
    const filtered = filteredExpenses;
    return {
      count: filtered.length,
      net: filtered.reduce((sum, exp) => sum + (exp.amount_net || 0), 0),
      vat: filtered.reduce((sum, exp) => sum + (exp.vat_amount || 0), 0),
      gross: filtered.reduce((sum, exp) => sum + (exp.amount_gross || 0), 0),
      deductibleVat: filtered.reduce((sum, exp) => 
        sum + (exp.is_vat_deductible ? (exp.vat_amount || 0) : 0), 0
      ),
    };
  }, [filteredExpenses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier || !formData.amount_net) {
      toast.error('⚠️ Wypełnij wymagane pola: Dostawca i Kwota');
      return;
    }

    const inputAmount = parseFloat(formData.amount_net);
    const vatRate = parseFloat(formData.vat_rate);
    
    if (isNaN(inputAmount) || inputAmount <= 0) {
      toast.error('⚠️ Kwota musi być liczbą większą od zera');
      return;
    }
    
    const { net, vat, gross } = calculateAmounts(inputAmount, vatRate);

    const expenseData = {
      date: formData.date,
      category: formData.category,
      supplier: formData.supplier,
      description: formData.description,
      amount_net: net,      // Zawsze zapisujemy obliczone netto
      vat_rate: vatRate,
      vat_amount: vat,      // Zawsze zapisujemy obliczony VAT
      amount_gross: gross,  // Zawsze zapisujemy obliczone brutto
      currency: 'EUR',
      payment_method: formData.payment_method,
      is_vat_deductible: formData.is_vat_deductible,
      is_business_expense: formData.is_business_expense,
      invoice_number: formData.invoice_number,
      notes: formData.notes,
      attachments: attachments,
    };

    // Użyj profesjonalnej obsługi błędów
    await handleAsync(
      async () => {
        if (editingExpense) {
          await updateExpense(editingExpense.id, expenseData);
        } else {
          await createExpense(expenseData);
        }
        
        setShowDialog(false);
        resetForm();
      },
      {
        successMessage: editingExpense 
          ? '✅ Wydatek zaktualizowany' 
          : '✅ Wydatek dodany',
        context: {
          action: editingExpense ? 'update_expense' : 'create_expense',
          supplier: formData.supplier,
          amount: gross,
        },
      }
    );
  };

  // Funkcja do konwersji pliku na base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Obsługa dodawania zdjęć z galerii lub aparatu + AUTO OCR MULTI
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Sprawdź czy to edycja - jeśli tak, użyj starego flow (tylko załączniki)
    if (editingExpense) {
      // TRYB EDYCJI - dodaj tylko jako załączniki
      try {
        const newAttachments: ExpenseAttachment[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            toast.error(`Plik ${file.name} nie jest obrazem ani PDF`);
            continue;
          }

          const base64 = await fileToBase64(file);
          const sequenceNumber = attachments.length + newAttachments.length + 1;
          
          const attachment: ExpenseAttachment = {
            id: `att_${Date.now()}_${i}`,
            expense_id: editingExpense.id,
            file_name: file.name,
            file_path: base64,
            file_type: file.type.startsWith('image/') ? 'image' : 'pdf',
            file_size: file.size,
            sequence_number: sequenceNumber,
            created_at: new Date().toISOString(),
          };
          
          newAttachments.push(attachment);
        }
        
        setAttachments([...attachments, ...newAttachments]);
        toast.success(`✅ Dodano ${newAttachments.length} załącznik(ów)`);
      } catch (error) {
        console.error('Error adding attachments:', error);
        toast.error(t('common.attachmentError'));
      }
      
      if (event.target) event.target.value = '';
      return;
    }

    // TRYB NOWY WYDATEK - skanuj wszystkie paragony (zdjęcia + PDF)
    const scannableFiles = Array.from(files).filter(f => 
      f.type.startsWith('image/') || f.type === 'application/pdf'
    );
    
    if (scannableFiles.length === 0) {
      toast.error('Wybierz przynajmniej jedno zdjęcie paragonu lub PDF faktury');
      if (event.target) event.target.value = '';
      return;
    }

    // ✅ NOWA LOGIKA: Jeśli TYLKO 1 PLIK → wypełnij formularz
    if (scannableFiles.length === 1) {
      const file = scannableFiles[0];
      const isPDF = file.type === 'application/pdf';
      toast.info(isPDF ? '📄 Odczytywanie PDF faktury...' : '📷 Rozpoznawanie tekstu z paragonu...');
      
      try {
        const receiptData = await performOCRScan(file);
        
        // Walidacja kwoty
        const amount = receiptData.total || receiptData.totalNet || 0;
        if (amount === 0 || isNaN(amount)) {
          toast.warning('⚠️ Nie wykryto kwoty z paragonu. Wypełnij ręcznie.');
        }
        
        // Oblicz VAT
        const vatRate = parseFloat(receiptData.vatRate?.toString() || '21');
        let net: number, vat: number, gross: number;
        
        if (receiptData.total) {
          const calc = calculateNetFromGross(amount, vatRate as VATRate);
          net = calc.net;
          vat = calc.vat;
          gross = calc.gross;
        } else {
          const calc = calculateGrossFromNet(amount, vatRate as VATRate);
          net = calc.net;
          vat = calc.vat;
          gross = calc.gross;
        }

        // Wygeneruj opis
        const descriptionParts: string[] = [];
        if (receiptData.supplier) descriptionParts.push(`Zakup w ${receiptData.supplier}`);
        if (receiptData.date) {
          const date = new Date(receiptData.date);
          const dateStr = date.toLocaleDateString(i18n.language);
          descriptionParts.push(`z dnia ${dateStr}`);
        }

        // ✅ WYPEŁNIJ FORMULARZ (zamiast tworzyć wydatek)
        setFormData({
          date: receiptData.date || new Date().toISOString().split('T')[0],
          category: 'other' as ExpenseCategory,
          supplier: receiptData.supplier || '',
          description: descriptionParts.join(' ') || '',
          amount_net: net.toFixed(2),
          vat_rate: vatRate.toString(),
          payment_method: 'card',
          is_vat_deductible: true,
          is_business_expense: true,
          invoice_number: receiptData.invoiceNumber || '',
          notes: `Automatycznie zeskanowany (${receiptData.confidence?.toFixed(0)}% pewności)`,
        });

        // Dodaj załącznik
        const base64 = await fileToBase64(file);
        const attachment: ExpenseAttachment = {
          id: `att_${Date.now()}`,
          expense_id: editingExpense?.id || '',
          file_name: file.name,
          file_path: base64,
          file_type: file.type === 'application/pdf' ? 'pdf' : 'image',
          file_size: file.size,
          sequence_number: attachments.length + 1,
          created_at: new Date().toISOString(),
        };
        setAttachments([attachment]);

        toast.success(`✅ Dane wypełnione z paragonu! Sprawdź i zapisz.`);
        
        if (event.target) event.target.value = '';
        return;
        
      } catch (error) {
        console.error('OCR Error:', error);
        toast.error('❌ Nie udało się zeskanować paragonu');
        if (event.target) event.target.value = '';
        return;
      }
    }

    // ✅ BATCH MODE: Więcej niż 1 plik → utwórz wydatki automatycznie

    // Rozpocznij batch scanning
    setIsScanning(true);
    setTotalScans(scannableFiles.length);
    setCompletedScans(0);
    
    const successfulScans: string[] = [];
    const failedScans: string[] = [];

    toast.info(`🔍 Rozpoczynam skanowanie ${scannableFiles.length} plików (paragony/faktury)...`, { duration: 3000 });

    for (let i = 0; i < scannableFiles.length; i++) {
      const file = scannableFiles[i];
      setCurrentScanFile(file.name);
      setScanProgress(0);

      try {
        // Skanuj paragon
        const receiptData = await performOCRScan(file);
        
        // ✅ WALIDACJA - Nie twórz wydatku jeśli brak kwoty
        const amount = receiptData.total || receiptData.totalNet || 0;
        
        if (amount === 0 || isNaN(amount)) {
          console.warn(`⚠️ Pominięto ${file.name} - nie wykryto kwoty`);
          failedScans.push(file.name + ' (brak kwoty)');
          setCompletedScans(prev => prev + 1);
          continue; // Pomiń ten paragon
        }
        
        // Przygotuj dane wydatku
        const vatRate = parseFloat(receiptData.vatRate?.toString() || '21');
        
        let net: number, vat: number, gross: number;
        
        if (receiptData.total) {
          // Mamy kwotę brutto
          const calc = calculateNetFromGross(amount, vatRate as VATRate);
          net = calc.net;
          vat = calc.vat;
          gross = calc.gross;
        } else {
          // Mamy kwotę netto
          const calc = calculateGrossFromNet(amount, vatRate as VATRate);
          net = calc.net;
          vat = calc.vat;
          gross = calc.gross;
        }

        // Wygeneruj opis
        const descriptionParts: string[] = [];
        if (receiptData.supplier) descriptionParts.push(`Zakup w ${receiptData.supplier}`);
        if (receiptData.date) {
          const date = new Date(receiptData.date);
          const dateStr = date.toLocaleDateString(i18n.language);
          descriptionParts.push(`z dnia ${dateStr}`);
        }
        if (receiptData.invoiceNumber) descriptionParts.push(`- paragon ${receiptData.invoiceNumber}`);

        // Utwórz załącznik
        const base64 = await fileToBase64(file);
        const attachment: ExpenseAttachment = {
          id: `att_${Date.now()}_${i}`,
          expense_id: '',
          file_name: file.name,
          file_path: base64,
          file_type: file.type === 'application/pdf' ? 'pdf' : 'image',
          file_size: file.size,
          sequence_number: 1,
          created_at: new Date().toISOString(),
        };

        // Utwórz wydatek
        const expenseData = {
          date: receiptData.date || new Date().toISOString().split('T')[0],
          category: 'other' as ExpenseCategory,
          supplier: receiptData.supplier || `Sklep ${i + 1}`,
          description: descriptionParts.join(' ') || `Paragon ${i + 1}`,
          amount_net: net,
          vat_rate: vatRate,
          vat_amount: vat,
          amount_gross: gross,
          currency: 'EUR',
          payment_method: 'card',
          is_vat_deductible: true,
          is_business_expense: true,
          invoice_number: receiptData.invoiceNumber || '',
          notes: `Automatycznie zeskanowany (${receiptData.confidence?.toFixed(0)}% pewności)`,
          attachments: [attachment],
        };

        // Zapisz wydatek
        await createExpense(expenseData);
        successfulScans.push(receiptData.supplier || file.name);
        setCompletedScans(prev => prev + 1);

      } catch (error) {
        console.error(`Błąd skanowania ${file.name}:`, error);
        failedScans.push(file.name);
        setCompletedScans(prev => prev + 1);
      }
    }

    // Podsumowanie
    setIsScanning(false);
    setTotalScans(0);
    setCompletedScans(0);
    setCurrentScanFile('');

    if (successfulScans.length > 0) {
      toast.success(
        `✅ Utworzono ${successfulScans.length} wydatków:\n${successfulScans.slice(0, 5).join('\n')}${successfulScans.length > 5 ? '\n...' : ''}`,
        { duration: 6000 }
      );
    }

    if (failedScans.length > 0) {
      toast.error(
        `❌ Nie udało się zeskanować ${failedScans.length} paragonów:\n${failedScans.slice(0, 3).join('\n')}`,
        { duration: 5000 }
      );
    }
    
    if (event.target) event.target.value = '';
  };

  // ==================== OCR SCANNING ====================
  /**
   * Główna funkcja OCR - skanuje paragon i ZWRACA dane (nie wypełnia formularza)
   */
  const performOCRScan = async (file: File): Promise<ReceiptData> => {
    try {
      // Wykryj język na podstawie ustawień
      const language = i18n.language === 'pl' ? 'pol' : i18n.language === 'nl' ? 'nld' : 'eng';
      
      // Skanuj paragon z OCR
      const receiptData: ReceiptData = await scanReceipt(
        file,
        language,
        (progress) => setScanProgress(progress)
      );

      console.log('📝 Dane z paragonu:', receiptData);
      return receiptData;

    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  };

  /**
   * Handler dla ręcznego przycisku "Skanuj Paragon"
   */
  const handleScanReceipt = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Sprawdź typ pliku
    if (!file.type.startsWith('image/')) {
      toast.error('Wybierz zdjęcie paragonu (JPG, PNG)');
      return;
    }

    toast.info('📷 Rozpoznawanie tekstu z paragonu...');
    await performOCRScan(file);

    // Dodaj jako załącznik jeśli jeszcze nie został dodany
    const base64 = await fileToBase64(file);
    const attachment: ExpenseAttachment = {
      id: `att_${Date.now()}`,
      expense_id: editingExpense?.id || '',
      file_name: file.name,
      file_path: base64,
      file_type: file.type === 'application/pdf' ? 'pdf' : 'image',
      file_size: file.size,
      sequence_number: attachments.length + 1,
      created_at: new Date().toISOString(),
    };
    
    setAttachments([...attachments, attachment]);

    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };
  // ==================== END OCR SCANNING ====================


  // Usuń załącznik
  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(a => a.id !== attachmentId));
    toast.success('Załącznik usunięty');
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      date: expense.date,
      category: expense.category,
      supplier: expense.supplier,
      description: expense.description || '',
      amount_net: expense.amount_net.toString(),
      vat_rate: expense.vat_rate.toString(),
      payment_method: expense.payment_method,
      is_vat_deductible: expense.is_vat_deductible,
      is_business_expense: expense.is_business_expense,
      invoice_number: expense.invoice_number || '',
      notes: expense.notes || '',
    });
    setAttachments(expense.attachments || []);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten wydatek?')) {
      return;
    }
    
    const expense = expenses?.find(e => e.id === id);
    
    await handleAsync(
      async () => {
        await deleteExpense(id);
      },
      {
        successMessage: '🗑️ Wydatek usunięty',
        context: {
          action: 'delete_expense',
          expenseId: id,
          supplier: expense?.supplier,
          amount: expense?.amount_gross,
        },
      }
    );
  };

  const resetForm = () => {
    setEditingExpense(null);
    setAttachments([]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'it_software',
      supplier: '',
      description: '',
      amount_net: '',
      vat_rate: '21',
      payment_method: 'bank_transfer',
      is_vat_deductible: true,
      is_business_expense: true,
      invoice_number: '',
      notes: '',
    });
  };

  const handleExportCSV = () => {
    const csv = [
      ['Data', 'Kategoria', 'Dostawca', 'Opis', 'Netto', 'VAT', 'Brutto', 'Nr faktury'].join(','),
      ...filteredExpenses.map(exp => [
        exp.date,
        EXPENSE_CATEGORIES[exp.category]?.name || exp.category,
        exp.supplier,
        exp.description || '',
        exp.amount_net,
        exp.vat_amount,
        exp.amount_gross,
        exp.invoice_number || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `wydatki_${selectedMonth}.csv`;
    link.click();
    
    toast.success('Eksport CSV gotowy');
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('❌ Plik CSV musi mieć nagłówki i przynajmniej 1 wiersz');
        return;
      }

      // Parsuj nagłówki (usuń BOM jeśli istnieje)
      const headers = lines[0].replace(/^\uFEFF/, '').split(',').map(h => h.trim());
      
      // Sprawdź czy są wymagane kolumny
      const requiredColumns = ['Data', 'Dostawca', 'Netto', 'VAT', 'Brutto'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        toast.error(`❌ Brakujące kolumny: ${missingColumns.join(', ')}`);
        return;
      }

      let imported = 0;
      let errors = 0;

      // Importuj wiersze
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Mapuj kategorię z emoji na kod
          let categoryCode: ExpenseCategory = 'it_software';
          const categoryText = row['Kategoria'] || '';
          
          // Znajdź kategorię po nazwie/emoji
          for (const [key, cat] of Object.entries(EXPENSE_CATEGORIES)) {
            if (categoryText.includes(cat.name) || categoryText.includes(cat.emoji)) {
              categoryCode = key as ExpenseCategory;
              break;
            }
          }

          const expenseData = {
            date: row['Data'] || new Date().toISOString().split('T')[0],
            category: categoryCode,
            supplier: row['Dostawca'] || 'Nieznany',
            description: row['Opis'] || '',
            amount_net: parseFloat(row['Netto']) || 0,
            vat_rate: 21, // Domyślnie 21%
            vat_amount: parseFloat(row['VAT']) || 0,
            amount_gross: parseFloat(row['Brutto']) || 0,
            currency: 'EUR',
            payment_method: 'bank_transfer',
            is_vat_deductible: true,
            is_business_expense: true,
            invoice_number: row['Nr faktury'] || '',
            notes: '',
            attachments: [],
          };

          await createExpense(expenseData);
          imported++;
          
        } catch (error) {
          console.error(`Błąd w wierszu ${i}:`, error);
          errors++;
        }
      }

      if (imported > 0) {
        toast.success(`✅ Zaimportowano ${imported} wydatków`);
      }
      if (errors > 0) {
        toast.warning(`⚠️ Pominięto ${errors} wierszy z błędami`);
      }

      // Reset input
      if (csvImportInputRef.current) {
        csvImportInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error('❌ Błąd podczas importu CSV');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* UKŁAD: Film po lewej + Tekst z przyciskiem po prawej */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LEWA STRONA: Film */}
          <div className="relative overflow-hidden rounded-3xl bg-black border-4 border-sky-300 shadow-lg shadow-sky-200/50 h-64 md:h-72 lg:h-80">
            <video 
              autoPlay 
              loop 
              muted={isMuted}
              playsInline
              className="absolute top-0 left-0 w-full h-full object-contain"
            >
              <source src="/wydatki.mp4" type="video/mp4" />
            </video>
          </div>

          {/* PRAWA STRONA: Tekst i przyciski */}
          <div className="flex flex-col justify-center px-4 md:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-black mb-3 md:mb-4 tracking-tight">
              💳 Uitgaven
            </h1>
            <p className="text-xl lg:text-2xl text-black mb-8 font-medium">
              Beheer zakelijke kosten en verantwoord BTW
            </p>
            <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <button className="px-10 py-5 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-2xl font-black text-lg shadow-2xl transition-all duration-500 hover:scale-105 flex items-center gap-3 w-fit">
                  <Plus size={24} weight="bold" />
                  {t('expenses.newExpense')}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? `✏️ ${t('expenses.editExpense')}` : `➕ ${t('expenses.newExpense')}`}
                  </DialogTitle>
                  <DialogDescription>
                    {t('expenses.addInvoice')}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data *</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label>Kategoria *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                            <SelectItem key={key} value={key}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Dostawca / Vendor *</Label>
                    <Input
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      placeholder="np. Adobe, Google, IKEA"
                      required
                    />
                  </div>

                  <div>
                    <Label>Opis</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('expenses.descriptionPlaceholder')}
                    />
                  </div>

                  {/* NOWY ELEMENT: Przełącznik VAT */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-semibold text-blue-900">
                        {t('expenses.amountEntryMethod')}
                      </Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="vatMode"
                          checked={!amountIncludesVAT}
                          onChange={() => setAmountIncludesVAT(false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className={`text-sm ${!amountIncludesVAT ? 'font-bold text-blue-900' : 'text-black'}`}>
                          {t('expenses.amountNetOnly')}
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="vatMode"
                          checked={amountIncludesVAT}
                          onChange={() => setAmountIncludesVAT(true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className={`text-sm ${amountIncludesVAT ? 'font-bold text-blue-900' : 'text-black'}`}>
                          {t('expenses.amountIncludesVat')}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-black mt-2">
                      {!amountIncludesVAT 
                        ? t('expenses.exampleIkea')
                        : t('expenses.exampleNetAmount')
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>{!amountIncludesVAT ? t('expenses.amountNet') : t('expenses.amountGross')}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.amount_net}
                        onChange={(e) => setFormData({ ...formData, amount_net: e.target.value })}
                        placeholder={!amountIncludesVAT ? '68.62' : '83.03'}
                        required
                      />
                      <p className="text-xs text-black mt-1">
                        {!amountIncludesVAT ? '(kwota netto z paragonu)' : '(kwota brutto z paragonu)'}
                      </p>
                    </div>
                    
                    <div>
                      <Label>Stawka VAT (%)</Label>
                      <Select
                        value={formData.vat_rate}
                        onValueChange={(value) => setFormData({ ...formData, vat_rate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="9">9%</SelectItem>
                          <SelectItem value="21">21%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>
                        {!amountIncludesVAT ? 'Brutto (obliczone)' : 'Netto (obliczone)'}
                      </Label>
                      <Input
                        type="text"
                        value={formData.amount_net && formData.vat_rate ? 
                          (() => {
                            const amount = parseFloat(formData.amount_net);
                            const rate = parseFloat(formData.vat_rate);
                            const result = calculateAmounts(amount, rate);
                            return !amountIncludesVAT 
                              ? `${result.gross.toFixed(2)} € (brutto)` 
                              : `${result.net.toFixed(2)} € (netto)`;
                          })() : 
                          '0.00 €'
                        }
                        disabled
                        className="bg-gray-100 font-semibold"
                      />
                      <p className="text-xs text-green-600 mt-1">
                        VAT: {formData.amount_net && formData.vat_rate ? 
                          calculateAmounts(parseFloat(formData.amount_net), parseFloat(formData.vat_rate)).vat.toFixed(2) : 
                          '0.00'
                        } €
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('expenses.paymentMethod')}</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">{t('expenses.bankTransfer')}</SelectItem>
                          <SelectItem value="card">Karta płatnicza</SelectItem>
                          <SelectItem value="cash">Gotówka</SelectItem>
                          <SelectItem value="direct_debit">Polecenie zapłaty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>{t('expenses.invoiceNumber')}</Label>
                      <Input
                        value={formData.invoice_number}
                        onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                        placeholder={t('expenses.invoiceNumberOptional')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t('expenses.notesLabel')}</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('expenses.notesPlaceholder')}
                      rows={3}
                    />
                  </div>

                  {/* Sekcja załączników (zdjęcia paragonów/faktur) */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                    <Label className="text-base font-semibold">{t('expenses.attachmentsLabel')}</Label>
                    
                    {/* Przyciski dodawania */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera size={18} />
                        Aparat
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon size={18} />
                        Galeria / Pliki
                      </Button>
                      
                      {/* NOWY PRZYCISK: Skanuj Paragon z OCR */}
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => {
                          fileInputRef.current?.click(); // Zmienione: fileInputRef zamiast cameraInputRef (PDF support)
                        }}
                        disabled={isScanning}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        title="Dodaj wiele paragonów/faktur - automatycznie utworzy osobne wydatki"
                        aria-label="Skanuj wiele paragonów lub PDF faktur jednocześnie"
                      >
                        {isScanning ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            {completedScans > 0 && totalScans > 0 ? (
                              `${completedScans}/${totalScans} paragonów`
                            ) : scanProgress > 0 ? (
                              `${scanProgress}%`
                            ) : (
                              'Skanowanie...'
                            )}
                          </>
                        ) : (
                          <>
                            <Scan size={18} weight="bold" />
                            Skanuj (Zdjęcie/PDF)
                          </>
                        )}
                      </Button>
                      
                      {/* Progress bar gdy skanowanie wielu */}
                      {isScanning && totalScans > 1 && (
                        <div className="col-span-full mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-blue-900">
                              Skanowanie {completedScans}/{totalScans} paragonów
                            </span>
                            <span className="text-xs text-blue-700">
                              {currentScanFile && `📄 ${currentScanFile.substring(0, 20)}...`}
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(completedScans / totalScans) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Input dla OCR scanning */}
                      <input
                        ref={scanInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleScanReceipt}
                        className="hidden"
                        aria-label="Skanuj paragon z OCR lub PDF"
                        title="Automatycznie odczytaj dane z paragonu (zdjęcie lub PDF)"
                      />
                      
                      {/* Input dla aparatu (capture="environment" aktywuje tylną kamerę) */}
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        capture="environment"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        aria-label="Zrób zdjęcie wydatku lub wybierz PDF"
                        title="Zrób zdjęcie wydatku lub wybierz PDF"
                      />
                      
                      {/* Input dla galerii/plików */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        aria-label="Wybierz plik wydatku"
                        title="Wybierz plik wydatku"
                      />
                    </div>

                    {/* Podgląd załączników */}
                    {attachments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-black mb-2">
                          {t('expenses.attachmentsCount', { count: attachments.length })}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {attachments.map((att) => (
                            <div key={att.id} className="relative group">
                              <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                                {att.file_type === 'image' ? (
                                  <img
                                    src={att.file_path}
                                    alt={`Załącznik ${att.sequence_number}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
                                    <Receipt size={32} className="text-red-600 mb-2" />
                                    <span className="text-xs text-black">PDF</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Numer sekwencyjny */}
                              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {att.sequence_number}
                              </div>
                              
                              {/* Przycisk usuń */}
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Usuń załącznik"
                              >
                                <X size={14} weight="bold" />
                              </button>
                              
                              {/* Rozmiar pliku */}
                              <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                {(att.file_size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {attachments.length === 0 && (
                      <p className="text-sm text-black italic">
                        {t('expenses.noAttachmentsMessage')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowDialog(false);
                      resetForm();
                    }}>
                      Anuluj
                    </Button>
                    <Button type="submit" className="flex-1">
                      {editingExpense ? 'Zaktualizuj' : 'Dodaj wydatek'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95 backdrop-blur-md border border-blue-200 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-black">{t('expenses.totalNet')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(totals.net, i18n.language)}
              </div>
              <div className="text-xs text-black mt-1">{totals.count} wydatków</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border border-blue-200 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-black">VAT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(totals.vat, i18n.language)}
              </div>
              <div className="text-xs text-black mt-1">{t('expenses.totalVat')}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border border-blue-200 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-black">{t('expenses.totalVatDeductible')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(totals.deductibleVat, i18n.language)}
              </div>
              <div className="text-xs text-black mt-1">{t('expenses.vatDeductible')}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md border border-blue-200 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-black">{t('expenses.totalGross')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(totals.gross, i18n.language)}
              </div>
              <div className="text-xs text-black mt-1">Całkowity koszt</div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('expenses.expensesList')}</CardTitle>
                <CardDescription>{t('expenses.allExpenses')}</CardDescription>
              </div>
              <div className="flex gap-3 items-center">
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" onClick={handleExportCSV}>
                  <DownloadSimple className="mr-2" size={16} />
                  Eksport CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => csvImportInputRef.current?.click()}
                  className="border-green-300 hover:bg-green-50 text-green-700"
                >
                  <Upload className="mr-2" size={16} />
                  Import CSV
                </Button>
                <input
                  ref={csvImportInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t('common.loading')}</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-6 bg-linear-to-br from-sky-100 to-blue-100 rounded-3xl inline-block mb-6">
                  <Receipt size={64} className="text-sky-600" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{t('expenses.noExpenses')}</h3>
                <p className="text-black mb-6 text-lg">{t('expenses.addFirstExpense')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Kategoria</TableHead>
                      <TableHead>Dostawca</TableHead>
                      <TableHead>Opis</TableHead>
                      <TableHead className="text-center">📎</TableHead>
                      <TableHead className="text-right">{t('expenses.net')}</TableHead>
                      <TableHead className="text-right">VAT</TableHead>
                      <TableHead className="text-right">{t('expenses.gross')}</TableHead>
                      <TableHead className="text-right">{t('expenses.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(expense.date, i18n.language)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {EXPENSE_CATEGORIES[expense.category]?.icon} {' '}
                            {EXPENSE_CATEGORIES[expense.category]?.name.replace(/^[^\s]+ /, '')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{expense.supplier}</TableCell>
                        <TableCell className="text-sm text-black">
                          {expense.description || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {expense.attachments && expense.attachments.length > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              <ImageIcon size={16} className="text-blue-600" />
                              <span className="text-xs font-semibold text-blue-600">
                                {expense.attachments.length}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(expense.amount_net, i18n.language)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(expense.vat_amount, i18n.language)}
                          {' '}
                          <span className="text-gray-400">({expense.vat_rate}%)</span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {formatCurrency(expense.amount_gross, i18n.language)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors duration-200"
                              title="Edytuj"
                            >
                              <PencilSimple size={18} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 rounded-xl transition-colors duration-200"
                              title="Usuń"
                            >
                              <Trash size={18} className="text-red-600" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

