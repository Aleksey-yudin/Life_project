'use client'

import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material'
import { Add, Delete, CheckCircle, TrendingUp, CalendarToday, Palette } from '@mui/icons-material'
import { useHabitStore } from '@/modules/habits/store'
import { useAuthStore } from '@/modules/auth/store'
import { HabitCalendar } from './components/HabitCalendar'
import { MoodCalendar } from './components/MoodCalendar'
import { ColorPickerDialog } from '@/components/ColorPickerDialog'

export default function HabitsPage() {
  const { user } = useAuthStore()
  const { habits, entries, fetchHabits, fetchEntries, addHabit, deleteHabit } = useHabitStore()

  const [habitDialogOpen, setHabitDialogOpen] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', color: '#3f51b5', icon: '' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchHabits()
      fetchEntries()
    }
  }, [user])

  // Calculate today's habits completion
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = entries.filter(e => e.date === today)
  const completedToday = todayEntries.filter(e => e.status === 'completed').length
  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  // Get current month progress
  const currentMonth = today.substring(0, 7)
  const monthEntries = entries.filter(e => e.date.startsWith(currentMonth))
  
  const habitStats = habits.map(habit => {
    const habitEntries = monthEntries.filter(e => e.habit_id === habit.id)
    const completed = habitEntries.filter(e => e.status === 'completed').length
    const partial = habitEntries.filter(e => e.status === 'partial').length
    const totalDaysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
    const daysSoFar = Math.min(new Date().getDate(), totalDaysInMonth)
    
    return {
      ...habit,
      completed,
      partial,
      totalDays: daysSoFar,
      progress: daysSoFar > 0 ? Math.round(((completed + partial * 0.5) / daysSoFar) * 100) : 0
    }
  })

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Привычки
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Создавайте и отслеживайте свои привычки каждый день
        </Typography>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Всего привычек
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalHabits}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'background.default',
                  '& .MuiLinearProgress-bar': { bgcolor: 'success.main' }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {completionRate}% выполнено сегодня
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Выполнено сегодня
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {completedToday}/{totalHabits}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'success.light' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Продолжайте в том же духе!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Частично выполнено
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {todayEntries.filter(e => e.status === 'partial').length}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'warning.light' }}>
                  <CalendarToday />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Не сдавайтесь!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Пропущено сегодня
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {todayEntries.filter(e => e.status === 'missed').length}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'error.light' }}>
                  <Delete />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Старайтесь лучше завтра
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Мои привычки ({habits.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setHabitDialogOpen(true)}
                size="small"
              >
                Добавить
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              {habits.map(habit => {
                const stats = habitStats.find(s => s.id === habit.id)
                return (
                  <Card key={habit.id} sx={{ mb: 2, p: 2, position: 'relative' }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setHabitToDelete(habit.id)
                        setDeleteDialogOpen(true)
                      }}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: habit.color || 'primary.main',
                          mr: 2
                        }}
                      >
                        <CheckCircle />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, pr: 8 }}>
                          {habit.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stats?.completed || 0} выполнено, {stats?.partial || 0} частично
                        </Typography>
                      </Box>
                      <Chip
                        label={`${stats?.progress || 0}%`}
                        size="small"
                        color={stats?.progress && stats.progress >= 50 ? 'success' : 'default'}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats?.progress || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        mb: 2,
                        bgcolor: 'background.default',
                        '& .MuiLinearProgress-bar': { bgcolor: habit.color || 'primary.main' }
                      }}
                    />
                    <HabitCalendar habitId={habit.id} />
                  </Card>
                )
              })}
              {habits.length === 0 && (
                <Paper
                  sx={{
                    py: 8,
                    textAlign: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Нет привычек
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Начните отслеживать свои привычки сегодня
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setHabitDialogOpen(true)}
                  >
                    Добавить первую привычку
                  </Button>
                </Paper>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Календарь настроения
            </Typography>
            <MoodCalendar />
          </Card>
        </Grid>
      </Grid>

      {/* Add Habit Dialog */}
      <Dialog open={habitDialogOpen} onClose={() => setHabitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Добавить привычку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название привычки"
            fullWidth
            value={newHabit.name}
            onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ minWidth: 120 }}>
              Цвет привычки:
            </Typography>
            <Box
              onClick={() => setColorPickerOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: 'background.default',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: newHabit.color,
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {newHabit.color.toUpperCase()}
              </Typography>
              <Palette sx={{ ml: 1, color: 'action.active' }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHabitDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={async () => {
              try {
                if (!user) throw new Error('User not authenticated')
                await addHabit(user.id, newHabit)
                await fetchHabits()
                setHabitDialogOpen(false)
                setNewHabit({ name: '', color: '#3f51b5', icon: '' })
              } catch (error) {
                console.error('Error adding habit:', error)
              }
            }}
            variant="contained"
            disabled={!newHabit.name.trim()}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      <ColorPickerDialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        onColorSelect={(color) => setNewHabit({ ...newHabit, color })}
        initialColor={newHabit.color}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'error.main' }}>Удалить привычку?</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить привычку? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={async () => {
              try {
                if (habitToDelete) {
                  await deleteHabit(habitToDelete)
                  await fetchHabits()
                  setDeleteDialogOpen(false)
                  setHabitToDelete(null)
                }
              } catch (error) {
                console.error('Error deleting habit:', error)
              }
            }}
            variant="contained"
            color="error"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}