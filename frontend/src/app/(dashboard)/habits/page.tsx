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
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useHabitStore } from '@/modules/habits/store'
import { useAuthStore } from '@/modules/auth/store'
import { HabitCalendar } from './components/HabitCalendar'
import { MoodCalendar } from './components/MoodCalendar'

export default function HabitsPage() {
  const { user } = useAuthStore()
  const { habits, entries, fetchHabits, fetchEntries, addHabit } = useHabitStore()

  const [habitDialogOpen, setHabitDialogOpen] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', color: '#4caf50', icon: '' })

  useEffect(() => {
    if (user) {
      fetchHabits()
      fetchEntries()
    }
  }, [user])

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Привычки
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setHabitDialogOpen(true)}
        sx={{ mb: 3 }}
      >
        Добавить привычку
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Мои привычки ({habits.length})
            </Typography>
            <Box sx={{ mt: 2 }}>
              {habits.map(habit => (
                <Card key={habit.id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="subtitle1">{habit.name}</Typography>
                  <HabitCalendar habitId={habit.id} />
                </Card>
              ))}
              {habits.length === 0 && (
                <Typography color="text.secondary">Нет привычек. Добавьте первую!</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Календарь настроения
            </Typography>
            <MoodCalendar />
          </Card>
        </Grid>
      </Grid>

      {/* Add Habit Dialog */}
      <Dialog open={habitDialogOpen} onClose={() => setHabitDialogOpen(false)}>
        <DialogTitle>Добавить привычку</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            value={newHabit.name}
            onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Цвет (hex)"
            fullWidth
            value={newHabit.color}
            onChange={e => setNewHabit({ ...newHabit, color: e.target.value })}
          />
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
                setNewHabit({ name: '', color: '#4caf50', icon: '' })
              } catch (error) {
                console.error('Error adding habit:', error)
              }
            }}
            variant="contained"
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}