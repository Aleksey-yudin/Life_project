import type { Todo } from '@/types'

export interface TodoState {
  todos: Todo[]
  loading: boolean
}

export interface TodoFormData {
  title: string
  description?: string
  due_date?: string
  start_date?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'archived'
  parent_id?: string
}

export interface SubTodoFormData {
  title: string
  description?: string
}