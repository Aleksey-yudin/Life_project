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
  ListItemAvatar,
  Avatar,
  Checkbox,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Snackbar,
  IconButton,
  Card,
  CardContent,
} from '@mui/material'
import { Add, CheckCircle, RadioButtonUnchecked, MoreVert, ArrowForward, PriorityHigh, Schedule } from '@mui/icons-material'
import { useTodoStore } from '@/modules/todo/store'
import { useAuthStore } from '@/modules/auth/store'
import { TodoCalendar } from './components/TodoCalendar'
import { format, addWeeks, subWeeks, addMonths, subMonths, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
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
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Задачи
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управляйте своими задачами и достигайте целей
        </Typography>
      </Box>

      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {viewMode === 'week'
                  ? `${format(days[0], 'd MMMM', { locale: ru })} - ${format(days[days.length - 1], 'd MMMM yyyy', { locale: ru })}`
                  : format(currentDate, 'LLLL yyyy', { locale: ru })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {todos.filter(t => t.status !== 'completed').length} активных задач
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => viewMode === 'week' ? setCurrentDate(subWeeks(currentDate, 1)) : setCurrentDate(subMonths(currentDate, 1))}
                sx={{ borderRadius: 2 }}
              >
                ← Предыдущий
              </Button>
              <Button
                variant="outlined"
                onClick={() => viewMode === 'week' ? setCurrentDate(addWeeks(currentDate, 1)) : setCurrentDate(addMonths(currentDate, 1))}
                sx={{ borderRadius: 2 }}
              >
                Следующий →
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="week">Неделя</ToggleButton>
              <ToggleButton value="month">Месяц</ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{ ml: 'auto' }}
            >
              Добавить задачу
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {days.map(day => {
          const dayTodos = getTodosForDate(day)
          const isToday = isSameDay(day, today)
          const completedCount = dayTodos.filter(t => t.status === 'completed').length
          
          return (
            <Grid item xs={viewMode === 'week' ? undefined : 4} sm={viewMode === 'week' ? undefined : 6} md={viewMode === 'week' ? 3 : 4} key={day.toISOString()}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: isToday ? 4 : 0,
                    bgcolor: 'primary.main',
                  },
                }}
              >
                <CardContent sx={{ pb: 2 }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2
                  }}>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? 'primary.main' : 'text.primary'
                        }}
                      >
                        {format(day, 'EEEE', { locale: ru })}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontWeight: isToday ? 600 : 400,
                          fontSize: isToday ? '0.875rem' : '0.75rem'
                        }}
                      >
                        {format(day, 'd MMMM yyyy')}
                      </Typography>
                    </Box>
                    {dayTodos.length > 0 && (
                      <Chip
                        label={`${completedCount}/${dayTodos.length}`}
                        size="small"
                        color={completedCount === dayTodos.length ? 'success' : 'default'}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {dayTodos.length > 0 ? (
                    <List dense disablePadding>
                      {dayTodos.slice(0, 5).map(todo => (
                        <ListItem
                          key={todo.id}
                          disablePadding
                          sx={{
                            py: 0.75,
                            px: 1,
                            mb: 0.5,
                            borderRadius: 1,
                            bgcolor: 'background.default',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            }
                          }}
                        >
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
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <ListItemText
                            primary={todo.title}
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: todo.status === 'completed' ? 'text.disabled' : 'text.primary',
                              sx: {
                                textDecoration: todo.status === 'completed' ? 'line-through' : 'none'
                              }
                            }}
                          />
                          <Chip
                            label={
                              todo.priority === 'urgent' ? 'Срочно' :
                              todo.priority === 'high' ? 'Высокий' :
                              todo.priority === 'medium' ? 'Средний' : 'Низкий'
                            }
                            size="small"
                            color={
                              todo.priority === 'urgent' ? 'error' :
                              todo.priority === 'high' ? 'warning' : 'info'
                            }
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </ListItem>
                      ))}
                      {dayTodos.length > 5 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: 'center', mt: 1, fontSize: '0.75rem' }}
                        >
                          +{dayTodos.length - 5} ещё
                        </Typography>
                      )}
                    </List>
                  ) : (
                    <Box
                      sx={{
                        py: 4,
                        textAlign: 'center',
                        bgcolor: 'background.default',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Нет задач
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Add Todo Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Добавить задачу</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название задачи"
            fullWidth
            value={newTodo.title}
            onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={3}
            value={newTodo.description}
            onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Дата</InputLabel>
              <Select
                value={newTodo.due_date}
                label="Дата"
                onChange={e => setNewTodo({ ...newTodo, due_date: e.target.value })}
              >
                {days.map(day => (
                  <MenuItem key={day.toISOString()} value={format(day, 'yyyy-MM-dd')}>
                    {format(day, 'd MMMM yyyy', { locale: ru })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={newTodo.priority}
                label="Приоритет"
                onChange={e => setNewTodo({ ...newTodo, priority: e.target.value as any })}
              >
                <MenuItem value="low">Низкий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
                <MenuItem value="urgent">Срочный</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleAddTodo}
            variant="contained"
            disabled={!newTodo.title.trim()}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerts */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  )
}