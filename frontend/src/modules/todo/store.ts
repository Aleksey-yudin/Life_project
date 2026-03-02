'use client'

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Todo } from '@/types'

interface TodoStore {
  todos: Todo[]
  loading: boolean
  fetchTodos: () => Promise<void>
  addTodo: (user_id: string, data: { title: string; description?: string; due_date?: string; start_date?: string; priority: 'low' | 'medium' | 'high' | 'urgent'; status: 'pending' | 'in_progress' | 'completed' | 'archived'; parent_id?: string }) => Promise<void>
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  toggleTodoStatus: (id: string) => Promise<void>
}

export const useTodoStore = create<TodoStore>((set) => ({
  todos: [],
  loading: false,

  fetchTodos: async () => {
    const { data, error } = await supabase.from('todos').select('*')
    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      set({ todos: data || [] })
    }
  },

  addTodo: async (user_id, data) => {
    const { error } = await supabase.from('todos').insert([{ ...data, user_id }])
    if (error) {
      console.error('Error adding todo:', error)
      throw error
    }
  },

  updateTodo: async (id, data) => {
    const { error } = await supabase.from('todos').update(data).eq('id', id)
    if (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  },

  deleteTodo: async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) {
      console.error('Error deleting todo:', error)
      throw error
    }
    set(state => ({ todos: state.todos.filter(t => t.id !== id) }))
  },

  toggleTodoStatus: async (id) => {
    const todo = useTodoStore.getState().todos.find(t => t.id === id)
    if (!todo) return

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase.from('todos').update({ status: newStatus }).eq('id', id)
    if (error) {
      console.error('Error toggling todo status:', error)
      throw error
    }
    set(state => ({
      todos: state.todos.map(t =>
        t.id === id ? { ...t, status: newStatus } : t
      )
    }))
  },
}))