// User types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

// Wallet types
export interface Wallet {
  id: string
  user_id: string
  name: string
  balance: number
  initial_balance: number
  created_at: string
  updated_at: string
}

// Category types
export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  color: string
  icon: string
  created_at: string
}

// Transaction types
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  wallet_id: string
  category_id: string
  amount: number
  type: TransactionType
  date: string
  description: string | null
  created_at: string
  updated_at: string
}

// Habit types
export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  created_at: string
}

// Habit entry types
export type HabitStatus = 'completed' | 'partial' | 'missed'

export interface HabitEntry {
  id: string
  habit_id: string
  date: string
  status: HabitStatus
  notes: string | null
  created_at: string
}

// Mood log types
export type Mood = 'great' | 'good' | 'stress' | 'bad'

export interface MoodLog {
  id: string
  user_id: string
  date: string
  mood: Mood
  notes: string | null
  created_at: string
}

// Todo types
export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'archived'

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  start_date: string | null
  priority: TodoPriority
  status: TodoStatus
  parent_id: string | null
  created_at: string
  updated_at: string
}