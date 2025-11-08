# 📋 Raport Funkcji: Invoice Templates & Timesheet Templates

**Data:** 7 listopada 2025  
**Wersja:** Production  
**Status:** ✅ Działające

---

## 1️⃣ INVOICE TEMPLATES (Szablony Faktur)

### 📍 Lokalizacja
- **Edytor:** `src/components/InvoiceTemplateEditor.tsx` (1000+ linii)
- **Podgląd:** `src/components/InvoiceTemplatePreview.tsx`
- **Typy:** `src/types/invoiceTemplate.ts`
- **Strona:** `src/pages/Settings.tsx` → Tab "Templates"

---

### ✨ Główne Funkcje

#### 🎨 **Visual Builder (Edytor Wizualny)**
```typescript
// UKŁAD: 3-panelowy z A4 preview
- LEFT PANEL: Logo controls + Block list (drag & drop)
- CENTER PANEL: Live A4 Preview (595×842px, sticky)
- RIGHT PANEL: Colors, Fonts, Page settings
```

**Funkcje edytora:**
1. ✅ **Drag & Drop Blocks** - Zmiana kolejności sekcji faktury
   - company-info (Dane firmy)
   - client-info (Dane klienta)
   - invoice-header (Nr faktury, data)
   - items-table (Tabela pozycji)
   - totals (Suma końcowa)
   - payment-info (Informacje o płatności)
   - notes (Notatki)
   - terms (Warunki)

2. ✅ **Logo Management (Zaawansowane)**
   ```typescript
   - Upload logo (drag & drop lub file picker)
   - Position: left | center | right
   - Advanced: X/Y coordinates (px)
   - Width/Height (px) z zachowaniem proporcji
   - Opacity (0-100%)
   - Show/Hide toggle
   - Live preview
   ```

3. ✅ **Color System (Gradient Dual Picker)**
   ```typescript
   Header Gradient: start → end
   Primary Gradient: start → end
   Accent Gradient: start → end
   + Background, Text, Border (solid colors)
   ```

4. ✅ **Typography Controls**
   ```typescript
   - Font Family: Heading, Body (Arial, Times, Courier, etc.)
   - Font Sizes: Heading (12-18), Body (8-12), Small (6-10)
   ```

5. ✅ **Page Settings**
   ```typescript
   - Page Size: A4 | Letter
   - Orientation: Portrait | Landscape
   ```

6. ✅ **Block Customization**
   ```typescript
   Każdy blok:
   - Label (edytowalna nazwa)
   - Visible/Hidden toggle
   - Duplicate (Ctrl+D)
   - Remove
   - Individual styles (background, text color, font size)
   - Order (drag to reorder)
   ```

---

#### 🔧 **Advanced Features**

1. **UNDO/REDO System (20-step history)**
   ```typescript
   - Ctrl+Z: Undo
   - Ctrl+Y: Redo
   - History tracking każdej zmiany
   - Description per action
   ```

2. **Keyboard Shortcuts**
   ```typescript
   Ctrl+S: Save template
   Ctrl+Z: Undo
   Ctrl+Y: Redo
   Ctrl+D: Duplicate first block
   Ctrl+P: Preview (placeholder)
   ```

3. **Export/Import JSON**
   ```typescript
   Export:
   - Pełny szablon do JSON
   - Zachowuje: blocks, colors, fonts, logo, page settings
   
   Import:
   - Load szablon z JSON
   - Auto-extract gradient colors
   - Validation struktur
   ```

4. **Template Presets (Biblioteka)**
   ```typescript
   Dostępne szablony:
   - Classic (tradycyjny)
   - Modern (nowoczesny)
   - Minimal (minimalistyczny)
   - Professional (biznesowy)
   ```

5. **Live Preview**
   ```typescript
   - A4 format (595×842px)
   - Real-time rendering
   - All changes instant
   - QR code integration
   ```

---

#### 💾 **Data Management**

**Zapisywanie:**
```typescript
localStorage.setItem(`invoice-template-${id}`, JSON.stringify(template));

Struktura:
{
  id: string;
  name: string;
  description: string;
  blocks: InvoiceBlock[];
  colors: {
    primary: gradient string;
    secondary: gradient string;
    accent: gradient string;
    text: color;
    background: color;
  };
  fonts: {
    heading: string;
    body: string;
    size: { heading, body, small };
  };
  logo?: {
    url: string;
    position: 'left'|'center'|'right';
    size: { width, height };
    showInHeader: boolean;
  };
  pageSize: 'A4'|'Letter';
  orientation: 'portrait'|'landscape';
  createdAt: Date;
  updatedAt: Date;
}
```

**Walidacja przed zapisem:**
```typescript
✓ Template name required
✓ Min 1 block
✓ Min 1 visible block
✓ All blocks must have labels
```

---

#### 🎯 **Use Cases**

1. **Tworzenie nowej faktury:**
   - Settings → Templates → "Nowy szablon"
   - Customize blocks, colors, logo
   - Save

2. **Edycja istniejącego:**
   - Settings → Templates → "Edytuj" na szablonie
   - Modify w edytorze wizualnym
   - Save (overwrite)

3. **Duplikowanie szablonu:**
   - Export to JSON
   - Import as new
   - Modify & Save

4. **Sharing szablonów:**
   - Export JSON
   - Send file
   - Import u innego użytkownika

---

## 2️⃣ TIMESHEET TEMPLATES (Szablony Kart Pracy)

### 📍 Lokalizacja
- **Edytor:** `src/components/TimeTracking/TimesheetTemplateEditor.tsx` (800+ linii)
- **Presets:** `src/components/TimeTracking/templatePresets.ts`
- **Typy:** `src/types/weekbrief.ts`
- **Strona:** `src/pages/Settings.tsx` → Tab "Timesheet Templates"

---

### ✨ Główne Funkcje

#### 🎨 **Visual Builder (Edytor Wizualny)**
```typescript
// UKŁAD: 3-panelowy
- LEFT PANEL: Color themes, Logo, Font controls
- CENTER PANEL: Column editor (drag & drop)
- RIGHT PANEL: Live A4 Preview
```

**Funkcje edytora:**
1. ✅ **Drag & Drop Columns** - Zmiana kolejności kolumn
   ```typescript
   Typy kolumn:
   - text: Tekstowa
   - number: Liczba (godziny, stawka)
   - date: Data (YYYY-MM-DD)
   
   Właściwości:
   - ID (unique)
   - Label (nazwa wyświetlana)
   - Type (text/number/date)
   - Width (px lub %)
   - Required (boolean)
   ```

2. ✅ **Column Management**
   ```typescript
   Actions per column:
   - Move Left/Right (strzałki)
   - Duplicate (Copy icon)
   - Remove (Trash icon)
   - Edit Label
   - Change Type
   - Adjust Width
   ```

3. ✅ **Color Theme Selector**
   ```typescript
   Predefiniowane motywy:
   - Sky Blue (domyślny)
   - Forest Green
   - Royal Purple
   - Sunset Orange
   - Deep Navy
   - Rose Pink
   
   Każdy motyw:
   - headerStart, headerEnd (gradient)
   - borderColor
   ```

4. ✅ **Logo Controls**
   ```typescript
   - Upload logo (file picker)
   - Show/Hide toggle
   - Auto-resize do 120×60px
   - Preview na żywo
   ```

5. ✅ **Font & Size Controls**
   ```typescript
   - Font Size (8-14px)
   - Border Color (color picker)
   - Header Gradient (dual picker)
   ```

6. ✅ **Rows Setting**
   ```typescript
   - Number of rows (5-30)
   - Validation: min 5, max 50
   ```

---

#### 🔧 **Advanced Features**

1. **UNDO/REDO System (20-step history)**
   ```typescript
   - Ctrl+Z: Undo
   - Ctrl+Y: Redo
   - Track: add/remove/move columns, color changes, etc.
   ```

2. **Keyboard Shortcuts**
   ```typescript
   Ctrl+S: Save template
   Ctrl+Z: Undo
   Ctrl+Y: Redo
   Ctrl+D: Duplicate column
   Ctrl+P: Preview print (placeholder)
   ```

3. **Export/Import JSON**
   ```typescript
   Export:
   - Full template config
   - Columns, styles, settings
   
   Import:
   - Load from JSON
   - Auto-extract gradients
   - Validation
   ```

4. **Template Library (Biblioteka Presetów)**
   ```typescript
   8 gotowych szablonów:
   
   1. PEZET Weekbrief (budowa)
      - Dag, Datum, Object, Adres, Werkzaamheden, Uren
      
   2. Project Hours (IT/Consulting)
      - Klient, Projekt, Zadanie, Godziny, Stawka
      
   3. Multi-Project (3 projekty dziennie)
      - Data, Projekt A/B/C, Godziny per projekt
      
   4. Monthly Hours (miesiąc)
      - 31 wierszy, dzień, 3 projekty, suma dzienna
      
   5. Hourly Billing (fakturowanie)
      - Klient, Aktywność, Stawka, Godziny, Suma
      
   6. Construction Site (budowa)
      - Obiekt, Adres, Data, Godziny, Wykonane prace
      
   7. Consulting (konsulting)
      - Klient, Temat, Data, Godziny, Notatki
      
   8. Tutoring (korepetycje)
      - Uczeń, Przedmiot, Data, Godziny, Temat
   ```

---

#### 💾 **Data Management**

**Zapisywanie:**
```typescript
localStorage.setItem(`timesheet-template-${id}`, JSON.stringify(template));

Struktura:
{
  id: string;
  name: string;
  employerId: string;
  isPublic: boolean;
  config: {
    size: 'A4';
    pageSize: 'A4';
    orientation: 'portrait'|'landscape';
    columns: WeekbriefColumn[];
    rows: number;
    showLogo: boolean;
    showHeader: boolean;
    headerFields: {...}[];
    showTotalRow: boolean;
    totalRowLabel: string;
    showSignature: boolean;
    signatureLabel: string;
    signatureRows: number;
  };
  styles: {
    headerColor: gradient string;
    borderColor: color;
    fontSize: number;
    fontFamily: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Walidacja przed zapisem:**
```typescript
✓ Template name required
✓ Min 1 column
✓ All columns have labels
✓ No duplicate column IDs
✓ Max 7 number columns (week days)
✓ Rows: min 5, max 50
```

---

#### 🎯 **Use Cases**

1. **Budowa (Construction):**
   - Use: PEZET Weekbrief preset
   - Columns: Dag, Datum, Object, Adres, Uren
   - 7 rows (Mon-Sun)

2. **IT/Consulting:**
   - Use: Project Hours preset
   - Columns: Klient, Projekt, Zadanie, Godziny, Stawka
   - Auto-calculate total

3. **Multi-project freelancer:**
   - Use: Multi-Project preset
   - 3 projekty dziennie
   - Landscape orientation

4. **Monthly tracking:**
   - Use: Monthly Hours preset
   - 31 rows
   - Sum per day + month total

---

## 🔄 Porównanie Funkcji

| Feature | Invoice Templates | Timesheet Templates |
|---------|------------------|---------------------|
| **Visual Editor** | ✅ 3-panel + A4 | ✅ 3-panel + A4 |
| **Drag & Drop** | ✅ Blocks | ✅ Columns |
| **UNDO/REDO** | ✅ 20 steps | ✅ 20 steps |
| **Keyboard Shortcuts** | ✅ Ctrl+S/Z/Y/D/P | ✅ Ctrl+S/Z/Y/D/P |
| **Export/Import JSON** | ✅ Full template | ✅ Full template |
| **Logo Upload** | ✅ Advanced (X/Y/W/H/Opacity) | ✅ Basic (show/hide) |
| **Color System** | ✅ Gradient dual picker (3 colors) | ✅ Theme selector + gradient |
| **Typography** | ✅ 3 font families, 3 sizes | ✅ 1 font size, border color |
| **Page Settings** | ✅ A4/Letter, Portrait/Landscape | ✅ A4, Portrait/Landscape |
| **Template Library** | ✅ 4 presets | ✅ 8 presets |
| **Live Preview** | ✅ A4 sticky | ✅ A4 preview |
| **Validation** | ✅ 4 rules | ✅ 6 rules |
| **Blocks/Columns** | 8 block types | Unlimited columns |

---

## 📊 Statystyki

### Invoice Templates
- **Pliki:** 3 główne
- **Linie kodu:** ~1500
- **Block types:** 8
- **Presets:** 4
- **Features:** 15+
- **Validation rules:** 4

### Timesheet Templates
- **Pliki:** 3 główne
- **Linie kodu:** ~1200
- **Column types:** 3
- **Presets:** 8
- **Features:** 12+
- **Validation rules:** 6

---

## 🎯 Najważniejsze Różnice

### Invoice Templates - Bardziej zaawansowane:
1. **Logo management** - X/Y coordinates, opacity, advanced positioning
2. **Block system** - 8 różnych typów bloków z custom styles
3. **3 gradient colors** - Header, Primary, Accent
4. **Font control** - 3 rodziny czcionek, 3 rozmiary
5. **QR code integration** - Built-in QR support

### Timesheet Templates - Prostsze, praktyczne:
1. **Column-based** - Nieograniczona liczba kolumn
2. **Theme selector** - 6 gotowych motywów kolorystycznych
3. **8 presets** - Więcej gotowych szablonów
4. **Weekly/Monthly** - Dedykowane dla time tracking
5. **Row count control** - Elastyczna liczba wierszy (5-50)

---

## ✅ Status Funkcjonalności

### Invoice Templates
- [x] Visual Builder ✅
- [x] Drag & Drop ✅
- [x] UNDO/REDO ✅
- [x] Export/Import ✅
- [x] Logo Advanced ✅
- [x] Gradient Colors ✅
- [x] Typography ✅
- [x] Live Preview ✅
- [x] Template Library ✅
- [x] Keyboard Shortcuts ✅

### Timesheet Templates
- [x] Visual Builder ✅
- [x] Drag & Drop ✅
- [x] UNDO/REDO ✅
- [x] Export/Import ✅
- [x] Logo Basic ✅
- [x] Color Themes ✅
- [x] Font Size ✅
- [x] Live Preview ✅
- [x] Template Library (8) ✅
- [x] Keyboard Shortcuts ✅

---

## 🚀 Rekomendacje Ulepszeń

### Invoice Templates
1. 🔜 Watermark support (z PREMIUM)
2. 🔜 QR code positioning (z PREMIUM)
3. 🔜 Social media fields (z PREMIUM)
4. 🔜 Live preview with real data
5. 🔜 Multi-language support

### Timesheet Templates
1. 🔜 Watermark support (z PREMIUM)
2. 🔜 Hourly rate calculation
3. 🔜 Signature field
4. 🔜 Auto-sum columns
5. 🔜 Export to Excel

---

**Data utworzenia:** 7 listopada 2025  
**Wersja:** 1.0.0  
**Status:** ✅ Production Ready  
**Ostatnia aktualizacja:** Teraz
