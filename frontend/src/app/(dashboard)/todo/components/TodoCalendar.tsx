'use client'

import { Box, Typography, Checkbox, Chip, Alert, Snackbar } from '@mui/material'
import { useTodoStore } from '@/modules/todo/store'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'

interface TodoCalendarProps {
  viewMode: 'week' | 'month'
  currentDate: Date
}

export function TodoCalendar({ viewMode, currentDate }: TodoCalendarProps) {
  const { todos, toggleTodoStatus } = useTodoStore()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const getDateRange = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start, end })
    } else {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      return eachDayOfInterval({ start, end })
    }
  }

  const days = getDateRange()

  const getTodosForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return todos.filter(t => t.due_date === dateStr && t.status !== 'completed')
  }

  return (
    <>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Календарь задач
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {days.map(day => {
            const dayTodos = getTodosForDate(day)
            const isToday = isSameDay(day, new Date())
            return (
              <Box
                key={day.toISOString()}
                sx={{
                  width: viewMode === 'week' ? 60 : 90,
                  minHeight: viewMode === 'week' ? 80 : 100,
                  p: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: isToday ? 'action.selected' : 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Typography variant="caption" display="block" textAlign="center">
                  {format(day, 'd')}
                </Typography>
                {dayTodos.slice(0, 3).map(todo => (
                  <Box
                    key={todo.id}
                    sx={{
                      p: 0.25,
                      borderRadius: 0.5,
                      bgcolor: todo.priority === 'urgent' ? 'error.light' : todo.priority === 'high' ? 'warning.light' : 'background.default',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                    onClick={() => toggleTodoStatus(todo.id)}
                  >
                    <Typography variant="caption" display="block" noWrap>
                      {todo.title}
                    </Typography>
                  </Box>
                ))}
                {dayTodos.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayTodos.length - 3}
                  </Typography>
                )}
              </Box>
            )
          })}
        </Box>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </>
  )
}