import type { Wallet, Category, Transaction } from '@/types'

export interface BudgetState {
  wallets: Wallet[]
  categories: Category[]
  transactions: Transaction[]
  loading: boolean
}

export interface WalletFormData {
  name: string
  initial_balance: number
}

export interface CategoryFormData {
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

export interface TransactionFormData {
  wallet_id: string
  category_id: string
  amount: number
  type: 'income' | 'expense'
  date: string
  description?: string
}