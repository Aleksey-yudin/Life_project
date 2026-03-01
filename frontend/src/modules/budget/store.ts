'use client'

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/modules/auth/store'
import type { Wallet, Category, Transaction } from '@/types'

interface BudgetStore {
  wallets: Wallet[]
  categories: Category[]
  transactions: Transaction[]
  loading: boolean
  fetchWallets: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchTransactions: () => Promise<void>
  addWallet: (data: { name: string; initial_balance: number }) => Promise<void>
  updateWallet: (id: string, data: { name?: string; balance?: number }) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  addCategory: (data: { name: string; type: 'income' | 'expense'; color: string; icon: string }) => Promise<void>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addTransaction: (data: { wallet_id: string; category_id: string; amount: number; type: 'income' | 'expense'; date: string; description?: string }) => Promise<void>
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  wallets: [],
  categories: [],
  transactions: [],
  loading: false,

  fetchWallets: async () => {
    set({ loading: true })
    const { data, error } = await supabase.from('wallets').select('*')
    if (error) {
      console.error('Error fetching wallets:', error)
    } else {
      set({ wallets: data || [], loading: false })
    }
  },

  fetchCategories: async () => {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) {
      console.error('Error fetching categories:', error)
    } else {
      set({ categories: data || [] })
    }
  },

  fetchTransactions: async () => {
    const { data, error } = await supabase.from('transactions').select('*')
    if (error) {
      console.error('Error fetching transactions:', error)
    } else {
      set({ transactions: data || [] })
    }
  },

  addWallet: async (data) => {
    const { user } = useAuthStore()
    if (!user) throw new Error('User not authenticated')
    const { error } = await supabase.from('wallets').insert([{ ...data, user_id: user.id }])
    if (error) {
      console.error('Error adding wallet:', error)
      throw error
    }
    set(state => ({ loading: false }))
  },

  updateWallet: async (id, data) => {
    const { error } = await supabase.from('wallets').update(data).eq('id', id)
    if (error) {
      console.error('Error updating wallet:', error)
      throw error
    }
  },

  deleteWallet: async (id) => {
    const { error } = await supabase.from('wallets').delete().eq('id', id)
    if (error) {
      console.error('Error deleting wallet:', error)
      throw error
    }
    set(state => ({ wallets: state.wallets.filter(w => w.id !== id) }))
  },

  addCategory: async (data) => {
    const { user } = useAuthStore()
    if (!user) throw new Error('User not authenticated')
    const { error } = await supabase.from('categories').insert([{ ...data, user_id: user.id }])
    if (error) {
      console.error('Error adding category:', error)
      throw error
    }
  },

  updateCategory: async (id, data) => {
    const { error } = await supabase.from('categories').update(data).eq('id', id)
    if (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      console.error('Error deleting category:', error)
      throw error
    }
    set(state => ({ categories: state.categories.filter(c => c.id !== id) }))
  },

  addTransaction: async (data) => {
    const { user } = useAuthStore()
    if (!user) throw new Error('User not authenticated')
    const { error } = await supabase.from('transactions').insert([{ ...data, user_id: user.id }])
    if (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
  },

  updateTransaction: async (id, data) => {
    const { error } = await supabase.from('transactions').update(data).eq('id', id)
    if (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }))
  },
}))