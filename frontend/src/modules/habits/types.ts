import type { Habit, HabitEntry, MoodLog } from '@/types'

export interface HabitsState {
  habits: Habit[]
  entries: HabitEntry[]
  moodLogs: MoodLog[]
  loading: boolean
}

export interface HabitFormData {
  name: string
  color: string
  icon: string
}

export interface HabitEntryFormData {
  habit_id: string
  date: string
  status: 'completed' | 'partial' | 'missed'
  notes?: string
}

export interface MoodLogFormData {
  date: string
  mood: 'great' | 'good' | 'stress' | 'bad'
  notes?: string
}