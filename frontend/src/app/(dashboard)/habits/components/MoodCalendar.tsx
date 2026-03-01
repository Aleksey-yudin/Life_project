'use client'

import { Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { useHabitStore } from '@/modules/habits/store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useState } from 'react'

const moodColors = {
  great: 'success',
  good: 'info',
  stress: 'warning',
  bad: 'error',
} as const

const moodEmojis = {
  great: '😊',
  good: '🙂',
  stress: '😰',
  bad: '😞',
} as const

export function MoodCalendar() {
  const { moodLogs, addMoodLog, updateMoodLog } = useHabitStore()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [moodDialogOpen, setMoodDialogOpen] = useState(false)
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'stress' | 'bad'>('good')
  
  const currentMonth = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getMoodForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return moodLogs.find(m => m.date === dateStr)
  }

  const handleDayClick = (date: Date) => {
    const existingMood = getMoodForDay(date)
    setSelectedDate(date)
    setSelectedMood(existingMood?.mood || 'good')
    setMoodDialogOpen(true)
  }

  const handleSaveMood = async () => {
    if (!selectedDate) return
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const existingMood = getMoodForDay(selectedDate)
    
    if (existingMood) {
      await updateMoodLog(existingMood.id, { mood: selectedMood })
    } else {
      await addMoodLog({ date: dateStr, mood: selectedMood })
    }
    
    setMoodDialogOpen(false)
    setSelectedDate(null)
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Календарь настроения (кликните по дню)
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {days.map(day => {
          const mood = getMoodForDay(day)
          const isToday = isSameDay(day, new Date())
          return (
            <Box
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
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
                bgcolor: mood
                  ? mood.mood === 'great' ? 'success.light'
                    : mood.mood === 'good' ? 'info.light'
                    : mood.mood === 'stress' ? 'warning.light'
                    : 'error.light'
                  : isToday
                  ? 'action.hover'
                  : 'background.paper',
                '&:hover': { bgcolor: 'action.selected', cursor: 'pointer' },
              }}
              title={`${format(day, 'dd MMMM', { locale: ru })}: ${mood?.mood || 'не отмечено'}`}
            >
              {mood ? (
                <Chip
                  label={moodEmojis[mood.mood]}
                  size="small"
                  sx={{ fontSize: '0.75rem', minWidth: 24, height: 24 }}
                />
              ) : (
                format(day, 'd')
              )}
            </Box>
          )
        })}
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Object.entries(moodColors).map(([mood, color]) => (
          <Box key={mood} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip label={moodEmojis[mood as keyof typeof moodEmojis]} color={color as any} size="small" />
            <Typography variant="body2">{mood}</Typography>
          </Box>
        ))}
      </Box>

      {/* Mood Dialog */}
      <Dialog open={moodDialogOpen} onClose={() => setMoodDialogOpen(false)}>
        <DialogTitle>Выберите настроение</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
            {(['great', 'good', 'stress', 'bad'] as const).map(mood => (
              <IconButton
                key={mood}
                onClick={() => setSelectedMood(mood)}
                color={selectedMood === mood ? moodColors[mood] as any : 'default'}
                sx={{
                  border: selectedMood === mood ? 2 : 0,
                  borderColor: 'primary.main',
                  width: 64,
                  height: 64
                }}
              >
                <Chip
                  label={moodEmojis[mood]}
                  size="medium"
                  sx={{ fontSize: '1.5rem', minWidth: 40, height: 40 }}
                />
              </IconButton>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: ru })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoodDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleSaveMood} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}