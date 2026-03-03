'use client'

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Wallet, Category, Transaction } from '@/types'

interface BudgetStore {
  wallets: Wallet[]
  categories: Category[]
  transactions: Transaction[]
  loading: boolean
  fetchWallets: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchTransactions: () => Promise<void>
  addWallet: (user_id: string, data: { name: string; initial_balance: number }) => Promise<void>
  updateWallet: (id: string, data: { name?: string; balance?: number }) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  addCategory: (user_id: string, data: { name: string; type: 'income' | 'expense'; color: string; icon: string }) => Promise<void>
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  addTransaction: (user_id: string, data: { wallet_id: string; category_id: string; amount: number; type: 'income' | 'expense'; date: string; description?: string }) => Promise<void>
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

  addWallet: async (user_id, data) => {
    const { error } = await supabase.from('wallets').insert([{
      ...data,
      user_id,
      balance: data.initial_balance
    }])
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

  addCategory: async (user_id, data) => {
    const { error } = await supabase.from('categories').insert([{ ...data, user_id }])
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

 addTransaction: async (user_id, data) => {
  // Insert the transaction first
  const { data: transaction, error: insertError } = await supabase
    .from('transactions')
    .insert([{ ...data, user_id }])
    .select()
    .single()

   if (insertError) {
     console.error('Error adding transaction:', insertError)
     throw insertError
   }

   // Calculate the balance adjustment
   const adjustment = data.type === 'income' ? data.amount : -data.amount

   // Fetch current wallet balance
   const { data: wallet, error: fetchError } = await supabase
     .from('wallets')
     .select('balance')
     .eq('id', data.wallet_id)
     .single()

   if (fetchError) {
     console.error('Error fetching wallet:', fetchError)
     // Rollback transaction
     await supabase.from('transactions').delete().eq('id', transaction.id)
     throw fetchError
   }

   // Update the wallet balance
   const newBalance = (wallet?.balance || 0) + adjustment
   const { error: updateError } = await supabase
     .from('wallets')
     .update({ balance: newBalance })
     .eq('id', data.wallet_id)

   if (updateError) {
     console.error('Error updating wallet balance:', updateError)
     // Rollback transaction
     await supabase.from('transactions').delete().eq('id', transaction.id)
     throw updateError
   }

   // Update local state
   set(state => ({
     transactions: [...state.transactions, transaction],
     wallets: state.wallets.map(w =>
       w.id === data.wallet_id ? { ...w, balance: newBalance } : w
     )
   }))
 },

  updateTransaction: async (id, data) => {
    // Fetch the existing transaction to calculate balance adjustment
    const { data: oldTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching old transaction:', fetchError)
      throw fetchError
    }

    // Determine the effective values for type and amount
    const newType = data.type || oldTransaction.type
    const newAmount = data.amount !== undefined ? data.amount : oldTransaction.amount

    // Calculate the net adjustment: reverse old, apply new
    const oldAdjustment = oldTransaction.type === 'income' ? oldTransaction.amount : -oldTransaction.amount
    const newAdjustment = newType === 'income' ? newAmount : -newAmount
    const netAdjustment = newAdjustment - oldAdjustment

    // Update the transaction
    const { error: updateError } = await supabase
      .from('transactions')
      .update(data)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      throw updateError
    }

    // Update wallet balance if there's a net change
    if (netAdjustment !== 0) {
      const walletId = data.wallet_id || oldTransaction.wallet_id
      
      // Fetch current wallet balance
      const { data: wallet, error: walletFetchError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single()

      if (walletFetchError) {
        console.error('Error fetching wallet:', walletFetchError)
        throw walletFetchError
      }

      const newBalance = (wallet?.balance || 0) + netAdjustment
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletId)

      if (walletError) {
        console.error('Error updating wallet balance:', walletError)
        throw walletError
      }

      // Update local wallet state
      set(state => ({
        wallets: state.wallets.map(w =>
          w.id === walletId ? { ...w, balance: newBalance } : w
        )
      }))
    }
  },

  deleteTransaction: async (id) => {
    // Fetch the transaction to know wallet and amount
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching transaction for deletion:', fetchError)
      throw fetchError
    }

    // Calculate the reverse adjustment
    const adjustment = transaction.type === 'income' ? -transaction.amount : transaction.amount

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting transaction:', deleteError)
      throw deleteError
    }

    // Fetch current wallet balance
    const { data: wallet, error: walletFetchError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', transaction.wallet_id)
      .single()

    if (walletFetchError) {
      console.error('Error fetching wallet:', walletFetchError)
      throw walletFetchError
    }

    // Update wallet balance to reverse the transaction
    const newBalance = (wallet?.balance || 0) + adjustment
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('id', transaction.wallet_id)

    if (walletError) {
      console.error('Error updating wallet balance:', walletError)
      throw walletError
    }

    // Update local state
    set(state => ({
      transactions: state.transactions.filter(t => t.id !== id),
      wallets: state.wallets.map(w =>
        w.id === transaction.wallet_id ? { ...w, balance: newBalance } : w
      )
    }))
  },
}))