/**
 * 🔥 Firestore Service
 * Zarządzanie danymi w Firebase Firestore
 * Każdy użytkownik ma swoje oddzielne dane w strukturze: users/{userId}/...
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Invoice, Client, Company, Product, Expense, Timesheet, Appointment } from '@/types';

export class FirestoreService {
  // ==================== INVOICES ====================
  
  static async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const invoicesRef = collection(db, `users/${userId}/invoices`);
      const snapshot = await getDocs(invoicesRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Invoice));
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  }

  static async createInvoice(userId: string, invoice: Omit<Invoice, 'id'>): Promise<string> {
    try {
      const invoicesRef = collection(db, `users/${userId}/invoices`);
      const docRef = await addDoc(invoicesRef, {
        ...invoice,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  static async updateInvoice(userId: string, invoiceId: string, data: Partial<Invoice>): Promise<void> {
    try {
      const invoiceRef = doc(db, `users/${userId}/invoices`, invoiceId);
      await updateDoc(invoiceRef, {
        ...data,
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }

  static async deleteInvoice(userId: string, invoiceId: string): Promise<void> {
    try {
      const invoiceRef = doc(db, `users/${userId}/invoices`, invoiceId);
      await deleteDoc(invoiceRef);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }

  // ==================== CLIENTS ====================
  
  static async getClients(userId: string): Promise<Client[]> {
    try {
      const clientsRef = collection(db, `users/${userId}/clients`);
      const snapshot = await getDocs(clientsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Client));
    } catch (error) {
      console.error('Error getting clients:', error);
      throw error;
    }
  }

  static async createClient(userId: string, client: Omit<Client, 'id'>): Promise<string> {
    try {
      const clientsRef = collection(db, `users/${userId}/clients`);
      const docRef = await addDoc(clientsRef, {
        ...client,
        created_at: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  static async updateClient(userId: string, clientId: string, data: Partial<Client>): Promise<void> {
    try {
      const clientRef = doc(db, `users/${userId}/clients`, clientId);
      await updateDoc(clientRef, data);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  static async deleteClient(userId: string, clientId: string): Promise<void> {
    try {
      const clientRef = doc(db, `users/${userId}/clients`, clientId);
      await deleteDoc(clientRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // ==================== COMPANY ====================
  
  static async getCompany(userId: string): Promise<Company | null> {
    try {
      const companyRef = doc(db, `users/${userId}/company`, 'default');
      const snapshot = await getDoc(companyRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Company;
      }
      return null;
    } catch (error) {
      console.error('Error getting company:', error);
      throw error;
    }
  }

  static async updateCompany(userId: string, data: Partial<Company>): Promise<void> {
    try {
      const companyRef = doc(db, `users/${userId}/company`, 'default');
      // Użyj setDoc z merge, żeby utworzyć dokument jeśli nie istnieje
      await setDoc(companyRef, data, { merge: true });
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  static async createCompany(userId: string, company: Omit<Company, 'id'>): Promise<void> {
    try {
      const companyRef = doc(db, `users/${userId}/company`, 'default');
      await setDoc(companyRef, company);
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  // ==================== PRODUCTS ====================
  
  static async getProducts(userId: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, `users/${userId}/products`);
      const snapshot = await getDocs(productsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Product));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  static async createProduct(userId: string, product: Omit<Product, 'id'>): Promise<string> {
    try {
      const productsRef = collection(db, `users/${userId}/products`);
      const docRef = await addDoc(productsRef, product);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(userId: string, productId: string, data: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(db, `users/${userId}/products`, productId);
      await updateDoc(productRef, data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(userId: string, productId: string): Promise<void> {
    try {
      const productRef = doc(db, `users/${userId}/products`, productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // ==================== EXPENSES ====================
  
  static async getExpenses(userId: string): Promise<Expense[]> {
    try {
      const expensesRef = collection(db, `users/${userId}/expenses`);
      const snapshot = await getDocs(expensesRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Expense));
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  }

  static async createExpense(userId: string, expense: Omit<Expense, 'id'>): Promise<string> {
    try {
      const expensesRef = collection(db, `users/${userId}/expenses`);
      const docRef = await addDoc(expensesRef, expense);
      return docRef.id;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  static async updateExpense(userId: string, expenseId: string, data: Partial<Expense>): Promise<void> {
    try {
      const expenseRef = doc(db, `users/${userId}/expenses`, expenseId);
      await updateDoc(expenseRef, data);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  static async deleteExpense(userId: string, expenseId: string): Promise<void> {
    try {
      const expenseRef = doc(db, `users/${userId}/expenses`, expenseId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // ==================== TIMESHEETS ====================
  
  static async getTimesheets(userId: string): Promise<Timesheet[]> {
    try {
      const timesheetsRef = collection(db, `users/${userId}/timesheets`);
      const snapshot = await getDocs(timesheetsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Timesheet));
    } catch (error) {
      console.error('Error getting timesheets:', error);
      throw error;
    }
  }

  static async createTimesheet(userId: string, timesheet: Omit<Timesheet, 'id'>): Promise<string> {
    try {
      const timesheetsRef = collection(db, `users/${userId}/timesheets`);
      const docRef = await addDoc(timesheetsRef, timesheet);
      return docRef.id;
    } catch (error) {
      console.error('Error creating timesheet:', error);
      throw error;
    }
  }

  static async updateTimesheet(userId: string, timesheetId: string, data: Partial<Timesheet>): Promise<void> {
    try {
      const timesheetRef = doc(db, `users/${userId}/timesheets`, timesheetId);
      await updateDoc(timesheetRef, data);
    } catch (error) {
      console.error('Error updating timesheet:', error);
      throw error;
    }
  }

  static async deleteTimesheet(userId: string, timesheetId: string): Promise<void> {
    try {
      const timesheetRef = doc(db, `users/${userId}/timesheets`, timesheetId);
      await deleteDoc(timesheetRef);
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      throw error;
    }
  }

  // ==================== APPOINTMENTS ====================
  
  static async getAppointments(userId: string): Promise<Appointment[]> {
    try {
      const appointmentsRef = collection(db, `users/${userId}/appointments`);
      const snapshot = await getDocs(appointmentsRef);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Appointment));
    } catch (error) {
      console.error('Error getting appointments:', error);
      throw error;
    }
  }

  static async createAppointment(userId: string, appointment: Omit<Appointment, 'id'>): Promise<string> {
    try {
      const appointmentsRef = collection(db, `users/${userId}/appointments`);
      const docRef = await addDoc(appointmentsRef, appointment);
      return docRef.id;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  static async updateAppointment(userId: string, appointmentId: string, data: Partial<Appointment>): Promise<void> {
    try {
      const appointmentRef = doc(db, `users/${userId}/appointments`, appointmentId);
      await updateDoc(appointmentRef, data);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  static async deleteAppointment(userId: string, appointmentId: string): Promise<void> {
    try {
      const appointmentRef = doc(db, `users/${userId}/appointments`, appointmentId);
      await deleteDoc(appointmentRef);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  // ==================== MIGRATION HELPER ====================
  
  /**
   * Migruje dane z localStorage do Firestore
   * Używać tylko raz po zalogowaniu, jeśli użytkownik ma dane lokalne
   */
  static async migrateFromLocalStorage(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Migruj faktury
      const invoicesLocal = localStorage.getItem('invoices');
      if (invoicesLocal) {
        const invoices = JSON.parse(invoicesLocal);
        const invoicesRef = collection(db, `users/${userId}/invoices`);
        invoices.forEach((invoice: Invoice) => {
          const { id, ...data } = invoice;
          const docRef = doc(invoicesRef, id);
          batch.set(docRef, data);
        });
      }

      // Migruj klientów
      const clientsLocal = localStorage.getItem('clients');
      if (clientsLocal) {
        const clients = JSON.parse(clientsLocal);
        const clientsRef = collection(db, `users/${userId}/clients`);
        clients.forEach((client: Client) => {
          const { id, ...data } = client;
          const docRef = doc(clientsRef, id);
          batch.set(docRef, data);
        });
      }

      // Migruj produkty
      const productsLocal = localStorage.getItem('products');
      if (productsLocal) {
        const products = JSON.parse(productsLocal);
        const productsRef = collection(db, `users/${userId}/products`);
        products.forEach((product: Product) => {
          const { id, ...data } = product;
          const docRef = doc(productsRef, id);
          batch.set(docRef, data);
        });
      }

      // Zapisz wszystko jednocześnie
      await batch.commit();
      
      console.log('✅ Migration from localStorage to Firestore completed!');
    } catch (error) {
      console.error('Error migrating data:', error);
      throw error;
    }
  }
}
