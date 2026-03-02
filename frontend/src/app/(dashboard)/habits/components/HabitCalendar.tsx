'use client'

import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material'
import { useHabitStore } from '@/modules/habits/store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import CancelIcon from '@mui/icons-material/Cancel'

interface HabitCalendarProps {
  habitId: string
}

export function HabitCalendar({ habitId }: HabitCalendarProps) {
  const { entries, addHabitEntry, updateHabitEntry, fetchEntries } = useHabitStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: Date } | null>(null)
  
  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEntryForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return entries.find(e => e.habit_id === habitId && e.date === dateStr)
  }

  const handleRightClick = (event: React.MouseEvent, date: Date) => {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY, date })
  }

  const handleStatusChange = async (status: 'completed' | 'partial' | 'missed') => {
    if (!contextMenu) return
    
    const dateStr = format(contextMenu.date, 'yyyy-MM-dd')
    const existingEntry = getEntryForDay(contextMenu.date)
    
    try {
      if (existingEntry) {
        await updateHabitEntry(existingEntry.id, { status })
      } else {
        await addHabitEntry({ habit_id: habitId, date: dateStr, status })
      }
      await fetchEntries()
      setContextMenu(null)
    } catch (error) {
      console.error('Error updating habit entry:', error)
    }
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Календарь привычки (кликните правой кнопкой для отметки)
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {days.map(day => {
          const entry = getEntryForDay(day)
          const isToday = isSameDay(day, new Date())
          return (
            <Box
              key={day.toISOString()}
              onContextMenu={(e) => handleRightClick(e, day)}
              sx={{
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0.5,
                fontSize: '0.75rem',
                bgcolor: entry
                  ? entry.status === 'completed'
                    ? 'success.light'
                    : entry.status === 'partial'
                    ? 'warning.light'
                    : 'error.light'
                  : isToday
                  ? 'action.hover'
                  : 'background.paper',
                '&:hover': { bgcolor: 'action.selected', cursor: 'pointer' },
              }}
              title={`${format(day, 'dd MMMM', { locale: ru })}: ${entry?.status || 'не отмечено'}`}
            >
              {format(day, 'd')}
            </Box>
          )
        })}
      </Box>
      
      <Menu
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        anchorReference="anchorPosition"
        anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
      >
        <MenuItem onClick={() => handleStatusChange('completed')}>
          <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
          Выполнено
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('partial')}>
          <IndeterminateCheckBoxIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
          Частично
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('missed')}>
          <CancelIcon color="error" fontSize="small" sx={{ mr: 1 }} />
          Пропущено
        </MenuItem>
      </Menu>
    </Box>
  )
}