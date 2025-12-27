/**
 * ACCOUNTING EXPORT MODULE
 * Export faktur do popularnych formatów księgowych
 * - UBL 2.1 (Universal Business Language) - standard EU e-invoicing
 * - SAF-T (Standard Audit File for Tax) - standard polski/holenderski
 * - CSV format dla Excel/księgowości
 */

import { Invoice, Client, Company, InvoiceLine } from '@/types';
import { formatDate, formatCurrency } from './invoice-utils';

/**
 * Export faktury do formatu UBL 2.1 XML
 * Zgodny z standardem Peppol/EU e-invoicing
 */
export function exportToUBL(invoice: Invoice, company: Company, client: Client): string {
  const issueDate = new Date(invoice.issue_date).toISOString().split('T')[0];
  const dueDate = new Date(invoice.due_date).toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  
  <!-- UBL Version -->
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  
  <!-- Invoice Details -->
  <cbc:ID>${escapeXml(invoice.invoice_number)}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:DueDate>${dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  
  ${invoice.notes ? `<cbc:Note>${escapeXml(invoice.notes)}</cbc:Note>` : ''}
  
  <!-- Supplier (Company) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(company.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(company.address || '')}</cbc:StreetName>
        <cbc:CityName></cbc:CityName>
        <cbc:PostalZone></cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>NL</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(company.vat_number || '')}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escapeXml(company.name)}</cbc:RegistrationName>
        <cbc:CompanyID>${escapeXml(company.kvk || '')}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:ElectronicMail>${escapeXml(company.email || '')}</cbc:ElectronicMail>
        <cbc:Telephone>${escapeXml(company.phone || '')}</cbc:Telephone>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <!-- Customer (Client) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(client.name)}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${escapeXml(client.address || '')}</cbc:StreetName>
        <cbc:CityName></cbc:CityName>
        <cbc:PostalZone></cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>${client.country || 'NL'}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      ${client.vat_number ? `
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(client.vat_number)}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>` : ''}
      <cac:Contact>
        <cbc:ElectronicMail>${escapeXml(client.email || '')}</cbc:ElectronicMail>
        <cbc:Telephone>${escapeXml(client.phone || '')}</cbc:Telephone>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <!-- Payment Terms -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${escapeXml(company.iban || '')}</cbc:ID>
      <cac:FinancialInstitutionBranch>
        <cbc:ID>${escapeXml(company.bic || '')}</cbc:ID>
      </cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  
  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${invoice.total_vat.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">${invoice.total_net.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">${invoice.total_vat.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>21.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <!-- Monetary Totals -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${invoice.total_net.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${invoice.total_net.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${invoice.total_gross.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${invoice.total_gross.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  
  <!-- Invoice Lines -->
${invoice.lines.map((line, index) => `  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="C62">${line.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${line.line_gross.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${escapeXml(line.description)}</cbc:Description>
      <cbc:Name>${escapeXml(line.description)}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>21.00</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="EUR">${line.unit_price.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
`).join('')}
</Invoice>`;

  return xml;
}

/**
 * Export do formatu SAF-T (Standard Audit File for Tax)
 * Używany w Polsce i Holandii dla celów podatkowych
 */
export function exportToSAFT(invoices: Invoice[], company: Company, clients: Client[], startDate: string, endDate: string): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:2.0">
  <Header>
    <AuditFileVersion>2.0</AuditFileVersion>
    <AuditFileCountry>NL</AuditFileCountry>
    <AuditFileDateCreated>${new Date().toISOString().split('T')[0]}</AuditFileDateCreated>
    <SoftwareCompanyName>MESSU BOUW</SoftwareCompanyName>
    <SoftwareID>MESSU-BOUW-v1.0</SoftwareID>
    <SoftwareVersion>1.0.0</SoftwareVersion>
    <Company>
      <RegistrationNumber>${escapeXml(company.kvk || '')}</RegistrationNumber>
      <Name>${escapeXml(company.name)}</Name>
      <Address>
        <StreetName>${escapeXml(company.address || '')}</StreetName>
        <City></City>
        <PostalCode></PostalCode>
        <Country>NL</Country>
      </Address>
      <Contact>
        <Telephone>${escapeXml(company.phone || '')}</Telephone>
        <Email>${escapeXml(company.email || '')}</Email>
      </Contact>
      <TaxRegistration>
        <TaxRegistrationNumber>${escapeXml(company.vat_number || '')}</TaxRegistrationNumber>
        <TaxType>VAT</TaxType>
      </TaxRegistration>
    </Company>
    <DefaultCurrencyCode>EUR</DefaultCurrencyCode>
    <SelectionCriteria>
      <SelectionStartDate>${startDate}</SelectionStartDate>
      <SelectionEndDate>${endDate}</SelectionEndDate>
    </SelectionCriteria>
  </Header>
  
  <MasterFiles>
    <!-- Customers -->
${clients.map(client => `    <Customer>
      <CustomerID>${escapeXml(client.id)}</CustomerID>
      <CustomerName>${escapeXml(client.name)}</CustomerName>
      <BillingAddress>
        <StreetName>${escapeXml(client.address || '')}</StreetName>
        <City></City>
        <PostalCode></PostalCode>
        <Country>${client.country || 'NL'}</Country>
      </BillingAddress>
      ${client.vat_number ? `<TaxRegistrationNumber>${escapeXml(client.vat_number)}</TaxRegistrationNumber>` : ''}
    </Customer>
`).join('')}  </MasterFiles>
  
  <GeneralLedgerEntries>
    <NumberOfEntries>${invoices.length}</NumberOfEntries>
    <TotalDebit>${invoices.reduce((sum, inv) => sum + inv.total_gross, 0).toFixed(2)}</TotalDebit>
    <TotalCredit>${invoices.reduce((sum, inv) => sum + inv.total_gross, 0).toFixed(2)}</TotalCredit>
    
${invoices.map((invoice, index) => {
  const client = clients.find(c => c.id === invoice.client_id);
  return `    <Journal>
      <JournalID>SALES</JournalID>
      <Description>Verkoopfacturen</Description>
      <Transaction>
        <TransactionID>${invoice.id}</TransactionID>
        <Period>${new Date(invoice.issue_date).getMonth() + 1}</Period>
        <TransactionDate>${new Date(invoice.issue_date).toISOString().split('T')[0]}</TransactionDate>
        <TransactionType>N</TransactionType>
        <Description>${escapeXml(invoice.invoice_number)}</Description>
        <SystemEntryDate>${new Date(invoice.created_at).toISOString().split('T')[0]}</SystemEntryDate>
        <CustomerID>${escapeXml(client?.id || '')}</CustomerID>
        
        <!-- Debit: Customer Account -->
        <Line>
          <RecordID>${index * 2 + 1}</RecordID>
          <AccountID>1300</AccountID>
          <DebitAmount>
            <Amount>${invoice.total_gross.toFixed(2)}</Amount>
          </DebitAmount>
        </Line>
        
        <!-- Credit: Revenue Account -->
        <Line>
          <RecordID>${index * 2 + 2}</RecordID>
          <AccountID>8000</AccountID>
          <CreditAmount>
            <Amount>${invoice.total_net.toFixed(2)}</Amount>
          </CreditAmount>
        </Line>
        
        <!-- Credit: VAT Account -->
        <Line>
          <RecordID>${index * 2 + 3}</RecordID>
          <AccountID>1600</AccountID>
          <CreditAmount>
            <Amount>${invoice.total_vat.toFixed(2)}</Amount>
          </CreditAmount>
          <TaxInformation>
            <TaxType>VAT</TaxType>
            <TaxCode>S</TaxCode>
            <TaxPercentage>21.00</TaxPercentage>
            <TaxBase>${invoice.total_net.toFixed(2)}</TaxBase>
            <TaxAmount>
              <Amount>${invoice.total_vat.toFixed(2)}</Amount>
            </TaxAmount>
          </TaxInformation>
        </Line>
      </Transaction>
    </Journal>
`;
}).join('')}  </GeneralLedgerEntries>
</AuditFile>`;

  return xml;
}

/**
 * Export do CSV dla księgowości
 * Format uniwersalny do importu w Excel/księgowości
 */
export function exportAccountingCSV(invoices: Invoice[], clients: Client[]): string {
  const headers = [
    'Factuurnummer',
    'Datum',
    'Vervaldatum',
    'Klant',
    'KVK/BTW nummer',
    'Bedrag netto',
    'BTW',
    'Bedrag bruto',
    'Status',
    'Betaaldatum',
    'Notities'
  ].join(';');

  const rows = invoices.map(invoice => {
    const client = clients.find(c => c.id === invoice.client_id);
    return [
      invoice.invoice_number,
      new Date(invoice.issue_date).toLocaleDateString('nl-NL'),
      new Date(invoice.due_date).toLocaleDateString('nl-NL'),
      client?.name || '',
      client?.vat_number || client?.kvk_number || '',
      invoice.total_net.toFixed(2).replace('.', ','),
      invoice.total_vat.toFixed(2).replace('.', ','),
      invoice.total_gross.toFixed(2).replace('.', ','),
      invoice.status === 'paid' ? 'Betaald' : invoice.status === 'unpaid' ? 'Onbetaald' : invoice.status === 'partial' ? 'Gedeeltelijk' : 'Geannuleerd',
      invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString('nl-NL') : '',
      (invoice.notes || '').replace(/\n/g, ' ').replace(/;/g, ',')
    ].join(';');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Helper: Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
