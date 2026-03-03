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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
} from '@mui/material'
import { Add, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'
import { useTodoStore } from '@/modules/todo/store'
import { useAuthStore } from '@/modules/auth/store'
import { TodoCalendar } from './components/TodoCalendar'
import { format, addWeeks, subWeeks, addMonths, subMonths, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function TodoPage() {
  const { user } = useAuthStore()
  const { todos, fetchTodos, addTodo, toggleTodoStatus } = useTodoStore()

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newTodo, setNewTodo] = useState<{
    title: string
    description: string
    due_date: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'pending' | 'in_progress' | 'completed' | 'archived'
  }>({
    title: '',
    description: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium',
    status: 'pending',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const getDateRange = () => {
    if (viewMode === 'week') {
      const start = new Date(currentDate)
      start.setDate(start.getDate() - start.getDay() + 1) // Monday
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      const days = []
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d))
      }
      return days
    } else {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const days = []
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d))
      }
      return days
    }
  }

  const days = getDateRange()

  const getTodosForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return todos.filter(t => t.due_date === dateStr && t.status !== 'completed')
  }

  const handleAddTodo = async () => {
    try {
      if (!newTodo.title.trim()) {
        setError('Введите название задачи')
        return
      }
      if (!user) throw new Error('User not authenticated')
      await addTodo(user.id, newTodo)
      await fetchTodos()
      setSuccess('Задача добавлена')
      setDialogOpen(false)
      setNewTodo({
        title: '',
        description: '',
        due_date: format(new Date(), 'yyyy-MM-dd'),
        priority: 'medium',
        status: 'pending',
      })
      setError(null)
    } catch (error: any) {
      console.error('Error adding todo:', error)
      setError(error.message || 'Не удалось добавить задачу')
    }
  }

  const today = new Date()

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Задачи
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button onClick={() => viewMode === 'week' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subMonths(currentDate, 1))}>
          ← Предыдущий
        </Button>
        <Typography variant="h6">
          {viewMode === 'week'
            ? `${format(days[0], 'dd MMMM', { locale: ru })} - ${format(days[days.length - 1], 'dd MMMM yyyy', { locale: ru })}`
            : format(currentDate, 'LLLL yyyy', { locale: ru })}
        </Typography>
        <Button onClick={() => viewMode === 'week' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addMonths(currentDate, 1))}>
          Следующий →
        </Button>
      </Box>

      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(_, value) => value && setViewMode(value)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="week">Неделя</ToggleButton>
        <ToggleButton value="month">Месяц</ToggleButton>
      </ToggleButtonGroup>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setDialogOpen(true)}
        sx={{ mb: 3 }}
      >
        Добавить задачу
      </Button>

      <Grid container spacing={3}>
        {days.map(day => {
          const dayTodos = getTodosForDate(day)
          const isToday = isSameDay(day, today)
          return (
            <Grid item xs={viewMode === 'week' ? undefined : 4} sm={viewMode === 'week' ? undefined : 6} md={viewMode === 'week' ? 3 : 4} key={day.toISOString()}>
              <Paper
                sx={{
                  p: 2,
                  minHeight: 200,
                  bgcolor: isToday ? 'action.selected' : 'background.paper',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {format(day, 'EEEE', { locale: ru })}
                  <br />
                  {format(day, 'd MMMM')}
                </Typography>
                <List dense>
                  {dayTodos.slice(0, 5).map(todo => (
                    <ListItem key={todo.id} disablePadding>
                      <Checkbox
                        checked={todo.status === 'completed'}
                        onChange={async () => {
                          try {
                            await toggleTodoStatus(todo.id)
                            setSuccess('Статус задачи обновлён')
                          } catch (error: any) {
                            setError(error.message || 'Не удалось обновить статус')
                          }
                        }}
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<CheckCircle />}
                      />
                      <ListItemText primary={todo.title} />
                      <Chip
                        label={todo.priority}
                        size="small"
                        color={
                          todo.priority === 'urgent' ? 'error' :
                          todo.priority === 'high' ? 'warning' : 'default'
                        }
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  ))}
                  {dayTodos.length > 5 && (
                    <Typography variant="body2" color="text.secondary">
                      +{dayTodos.length - 5} ещё
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* Add Todo Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить задачу</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Заголовок"
            fullWidth
            value={newTodo.title}
            onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={2}
            value={newTodo.description}
            onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Срок выполнения"
            type="date"
            fullWidth
            value={newTodo.due_date}
            onChange={e => setNewTodo({ ...newTodo, due_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={newTodo.priority}
              label="Приоритет"
              onChange={e => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
            >
              <MenuItem value="low">Низкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
              <MenuItem value="urgent">Срочный</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddTodo} variant="contained">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  )
}