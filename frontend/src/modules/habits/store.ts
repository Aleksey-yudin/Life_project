'use client'

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/modules/auth/store'
import type { Habit, HabitEntry, MoodLog } from '@/types'

interface HabitsStore {
  habits: Habit[]
  entries: HabitEntry[]
  moodLogs: MoodLog[]
  loading: boolean
  fetchHabits: () => Promise<void>
  fetchEntries: () => Promise<void>
  fetchMoodLogs: () => Promise<void>
  addHabit: (user_id: string, data: { name: string; color: string; icon: string }) => Promise<void>
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  addHabitEntry: (data: { habit_id: string; date: string; status: 'completed' | 'partial' | 'missed'; notes?: string }) => Promise<void>
  updateHabitEntry: (id: string, data: Partial<HabitEntry>) => Promise<void>
  deleteHabitEntry: (id: string) => Promise<void>
  addMoodLog: (user_id: string, data: { date: string; mood: 'great' | 'good' | 'stress' | 'bad'; notes?: string }) => Promise<void>
  updateMoodLog: (id: string, data: Partial<MoodLog>) => Promise<void>
  deleteMoodLog: (id: string) => Promise<void>
}

export const useHabitStore = create<HabitsStore>((set) => ({
  habits: [],
  entries: [],
  moodLogs: [],
  loading: false,

  fetchHabits: async () => {
    const { data, error } = await supabase.from('habits').select('*')
    if (error) {
      console.error('Error fetching habits:', error)
    } else {
      set({ habits: data || [] })
    }
  },

  fetchEntries: async () => {
    const { data, error } = await supabase.from('habit_entries').select('*')
    if (error) {
      console.error('Error fetching habit entries:', error)
    } else {
      set({ entries: data || [] })
    }
  },

  fetchMoodLogs: async () => {
    const { data, error } = await supabase.from('mood_log').select('*')
    if (error) {
      console.error('Error fetching mood logs:', error)
    } else {
      set({ moodLogs: data || [] })
    }
  },

  addHabit: async (user_id, data) => {
    const { error } = await supabase.from('habits').insert([{ ...data, user_id }])
    if (error) {
      console.error('Error adding habit:', error)
      throw error
    }
  },

  updateHabit: async (id, data) => {
    const { error } = await supabase.from('habits').update(data).eq('id', id)
    if (error) {
      console.error('Error updating habit:', error)
      throw error
    }
  },

  deleteHabit: async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) {
      console.error('Error deleting habit:', error)
      throw error
    }
    set(state => ({ habits: state.habits.filter(h => h.id !== id) }))
  },

  addHabitEntry: async (data) => {
    const { error } = await supabase.from('habit_entries').insert([data])
    if (error) {
      console.error('Error adding habit entry:', error)
      throw error
    }
    // Note: habit_entries doesn't need user_id, it's linked via habit_id
  },

  updateHabitEntry: async (id, data) => {
    const { error } = await supabase.from('habit_entries').update(data).eq('id', id)
    if (error) {
      console.error('Error updating habit entry:', error)
      throw error
    }
  },

  deleteHabitEntry: async (id) => {
    const { error } = await supabase.from('habit_entries').delete().eq('id', id)
    if (error) {
      console.error('Error deleting habit entry:', error)
      throw error
    }
    set(state => ({ entries: state.entries.filter(e => e.id !== id) }))
  },

  addMoodLog: async (user_id, data) => {
    const { error } = await supabase.from('mood_log').insert([{ ...data, user_id }])
    if (error) {
      console.error('Error adding mood log:', error)
      throw error
    }
  },

  updateMoodLog: async (id, data) => {
    const { error } = await supabase.from('mood_log').update(data).eq('id', id)
    if (error) {
      console.error('Error updating mood log:', error)
      throw error
    }
  },

  deleteMoodLog: async (id) => {
    const { error } = await supabase.from('mood_log').delete().eq('id', id)
    if (error) {
      console.error('Error deleting mood log:', error)
      throw error
    }
    set(state => ({ moodLogs: state.moodLogs.filter(m => m.id !== id) }))
  },
}))