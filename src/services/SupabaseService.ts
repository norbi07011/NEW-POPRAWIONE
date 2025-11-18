/**
 * 🗄️ Supabase Database Service
 * 
 * Serwis do zarządzania danymi w Supabase
 */

import { supabase, isSupabaseConfigured } from '@/config/supabase';
import type { Company, Client, Invoice, Product } from '@/types';

export class SupabaseService {
  // ============================================
  // COMPANY OPERATIONS
  // ============================================
  
  static async getCompany(userId: string): Promise<Company | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  }
  
  static async saveCompany(userId: string, company: Partial<Company>): Promise<Company | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .upsert({
          user_id: userId,
          ...company,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving company:', error);
      throw error;
    }
  }
  
  // ============================================
  // INVOICE OPERATIONS
  // ============================================
  
  static async getInvoices(userId: string): Promise<Invoice[]> {
    if (!isSupabaseConfigured()) return [];
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  }
  
  static async createInvoice(userId: string, invoice: any): Promise<Invoice | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id: userId,
          ...invoice,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }
  
  static async updateInvoice(userId: string, id: string, invoice: any): Promise<Invoice | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...invoice,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  }
  
  static async deleteInvoice(userId: string, id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
  
  // ============================================
  // CLIENT OPERATIONS
  // ============================================
  
  static async getClients(userId: string): Promise<Client[]> {
    if (!isSupabaseConfigured()) return [];
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }
  
  static async createClient(userId: string, client: any): Promise<Client | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          ...client,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }
  
  static async updateClient(userId: string, id: string, client: any): Promise<Client | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          ...client,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }
  
  static async deleteClient(userId: string, id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
  
  // ============================================
  // PRODUCT OPERATIONS
  // ============================================
  
  static async getProducts(userId: string): Promise<Product[]> {
    if (!isSupabaseConfigured()) return [];
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
  
  static async createProduct(userId: string, product: any): Promise<Product | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: userId,
          ...product,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
  
  static async updateProduct(userId: string, id: string, product: any): Promise<Product | null> {
    if (!isSupabaseConfigured()) return null;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...product,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }
  
  static async deleteProduct(userId: string, id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}
