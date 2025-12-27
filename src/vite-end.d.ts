/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

// Electron API Types
interface ElectronAPI {
  database: {
    getInvoices: () => Promise<any[]>;
    createInvoice: (invoice: any) => Promise<any>;
    updateInvoice: (id: string, invoice: any) => Promise<any>;
    deleteInvoice: (id: string) => Promise<boolean>;
    getClients: () => Promise<any[]>;
    createClient: (client: any) => Promise<any>;
    updateClient: (id: string, client: any) => Promise<any>;
    deleteClient: (id: string) => Promise<boolean>;
    getProducts: () => Promise<any[]>;
    createProduct: (product: any) => Promise<any>;
    updateProduct: (id: string, product: any) => Promise<any>;
    deleteProduct: (id: string) => Promise<boolean>;
    getCompany: () => Promise<any>;
    updateCompany: (company: any) => Promise<any>;
    getAppointments: () => Promise<any[]>;
    createAppointment: (appointment: any) => Promise<any>;
    updateAppointment: (id: string, appointment: any) => Promise<any>;
    deleteAppointment: (id: string) => Promise<boolean>;
  };
  fileSystem: {
    savePDF: (filename: string, buffer: ArrayBuffer) => Promise<string>;
    saveCompanyLogo: (filename: string, data: Uint8Array) => Promise<string>;
    getCompanyLogoPath: (filename: string) => Promise<string>;
    openDocumentsFolder: () => Promise<void>;
    exportCSV: (filename: string, data: any) => Promise<string>;
    exportExcel: (filename: string, data: any) => Promise<string>;
  };
  kvk: {
    search: (query: string) => Promise<any>;
  };
  kvkScrape: {
    scrape: (url: string) => Promise<any>;
  };
  backup: {
    create: (path?: string) => Promise<string>;
    restore: (backupPath: string) => Promise<boolean>;
    list: () => Promise<any[]>;
    autoBackup: () => Promise<string>;
  };
  dialog: {
    showSaveDialog: (options: any) => Promise<any>;
    showOpenDialog: (options: any) => Promise<any>;
  };
  print: {
    html: (html: string, options?: any) => Promise<{ success: boolean; message?: string }>;
    showDialog: (html: string) => Promise<{ success: boolean; message?: string }>;
  };
  build: {
    createInstaller: () => Promise<boolean>;
    openInstallerFolder: () => Promise<void>;
  };
  getNetworkAddress: () => Promise<string>;
  copyToClipboard: (text: string) => Promise<boolean>;
  onMenuAction: (callback: (action: string) => void) => () => void;
  isElectron: boolean;
  version: string;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}