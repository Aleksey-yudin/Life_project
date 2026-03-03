'use client'

import { useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  IconButton,
} from '@mui/material'
import { TrendingUp, AccountBalanceWallet, CheckCircle, PlaylistAddCheck, ArrowForward, MoreVert } from '@mui/icons-material'
import { useAuthStore } from '@/modules/auth/store'
import { useBudgetStore } from '@/modules/budget/store'
import { useHabitStore } from '@/modules/habits/store'
import { useTodoStore } from '@/modules/todo/store'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { wallets, transactions, categories, fetchWallets, fetchTransactions, fetchCategories } = useBudgetStore()
  const { habits, entries, fetchHabits, fetchEntries } = useHabitStore()
  const { todos, fetchTodos } = useTodoStore()

  useEffect(() => {
    if (user) {
      fetchWallets()
      fetchTransactions()
      fetchCategories()
      fetchHabits()
      fetchEntries()
      fetchTodos()
    }
  }, [user])

  // Calculate total balance
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  // Monthly spending chart data
  const monthlySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const month = t.date.substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const chartData = Object.entries(monthlySpending)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Top 3 categories by spending
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category_id] = (acc[t.category_id] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId)
      return { ...category, amount }
    })

  // Today's todos
  const today = new Date().toISOString().split('T')[0]
  const todayTodos = todos.filter(t => t.due_date === today && t.status !== 'completed')

  // Habits not completed today
  const todayHabits = habits.filter(habit => {
    const entry = entries.find(e => e.habit_id === habit.id && e.date === today)
    return !entry || entry.status === 'missed'
  })

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Дашборд
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Добро пожаловать обратно! Вот ваша общая статистика.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}>
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
                height: 4,
                bgcolor: 'primary.main',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Общий баланс
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalBalance.toFixed(2)} ₽
                  </Typography>
                </Box>
                <Avatar sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.light',
                  boxShadow: 3
                }}>
                  <AccountBalanceWallet />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<TrendingUp />}
                  label="+12%"
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  за месяц
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                height: 4,
                bgcolor: 'error.main',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Расходы за месяц
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {(transactions
                      .filter(t => t.type === 'expense' && t.date.startsWith(today.substring(0, 7)))
                      .reduce((sum, t) => sum + t.amount, 0)).toFixed(2)} ₽
                  </Typography>
                </Box>
                <Avatar sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'error.light',
                  boxShadow: 3
                }}>
                  <TrendingUp />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<TrendingUp />}
                  label="+5%"
                  size="small"
                  color="error"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  vs прошлый месяц
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                height: 4,
                bgcolor: 'success.main',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Привычек сегодня
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {habits.length - todayHabits.length}/{habits.length}
                  </Typography>
                </Box>
                <Avatar sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'success.light',
                  boxShadow: 3
                }}>
                  <CheckCircle />
                </Avatar>
              </Box>
              <LinearProgress
                variant="determinate"
                value={habits.length > 0 ? ((habits.length - todayHabits.length) / habits.length) * 100 : 0}
                sx={{
                  mt: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'success.light',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main',
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {habits.length > 0 ? Math.round(((habits.length - todayHabits.length) / habits.length) * 100) : 0}% выполнено
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                height: 4,
                bgcolor: 'info.main',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Задач на сегодня
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {todayTodos.length}
                  </Typography>
                </Box>
                <Avatar sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'info.light',
                  boxShadow: 3
                }}>
                  <PlaylistAddCheck />
                </Avatar>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${todayTodos.filter(t => t.status === 'completed').length} выполнено`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  из {todayTodos.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Row */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Динамика расходов
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: 'none' }}
                >
                  Подробнее
                </Button>
              </Box>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickFormatter={(value) => `${value / 1000}к`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`${Number(value).toFixed(2)} ₽`, 'Сумма']}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3f51b5"
                      strokeWidth={3}
                      dot={{ fill: '#3f51b5', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3f51b5', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{
                  py: 8,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}>
                  <Typography color="text.secondary">
                    Нет данных за год
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    startIcon={<AccountBalanceWallet />}
                  >
                    Добавить транзакции
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Топ 3 категории расходов
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>
              {topCategories.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={topCategories}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || ['#3f51b5', '#f50057', '#4caf50'][index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: 8,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value, name) => [`${Number(value).toFixed(2)} ₽`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    {topCategories.map((cat, idx) => (
                      <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: ['#3f51b5', '#f50057', '#4caf50'][idx],
                            mr: 2,
                            fontSize: '0.75rem'
                          }}
                        >
                          {idx + 1}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {cat.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cat.amount.toFixed(2)} ₽
                          </Typography>
                        </Box>
                        <Chip
                          label={`${((cat.amount / transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)) * 100).toFixed(1)}%`}
                          size="small"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            height: 24,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Box sx={{
                  py: 8,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}>
                  <Typography color="text.secondary">
                    Нет данных
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Tasks */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Задачи на сегодня
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: 'none' }}
                >
                  Все задачи
                </Button>
              </Box>
              {todayTodos.length > 0 ? (
                <List>
                  {todayTodos.slice(0, 5).map(todo => (
                    <ListItem
                      key={todo.id}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: 'background.default',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 40,
                          height: 40,
                          bgcolor: todo.priority === 'high' ? 'error.light' :
                                   todo.priority === 'medium' ? 'warning.light' : 'info.light'
                        }}>
                          {todo.priority === 'high' ? '🔥' : todo.priority === 'medium' ? '⚡' : '✓'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={todo.title}
                        secondary={`Приоритет: ${todo.priority}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={todo.priority === 'high' ? 'Высокий' :
                               todo.priority === 'medium' ? 'Средний' : 'Низкий'}
                        size="small"
                        color={todo.priority === 'high' ? 'error' :
                               todo.priority === 'medium' ? 'warning' : 'info'}
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{
                  py: 6,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}>
                  <Typography color="text.secondary" gutterBottom>
                    Нет задач на сегодня
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PlaylistAddCheck />}
                  >
                    Создать задачу
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Habits Reminder */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Привычки на сегодня
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: 'none' }}
                >
                  Все привычки
                </Button>
              </Box>
              {todayHabits.length > 0 ? (
                <List>
                  {todayHabits.map(habit => (
                    <ListItem
                      key={habit.id}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: 'background.default',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{
                          width: 40,
                          height: 40,
                          bgcolor: 'error.light'
                        }}>
                          <CheckCircle />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={habit.name}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Chip
                        label="Не выполнена"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{
                  py: 6,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}>
                  <Typography color="text.secondary" gutterBottom>
                    Все привычки выполнены!
                  </Typography>
                  <Avatar sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'success.light',
                    margin: '0 auto',
                    display: 'flex',
                    mb: 2
                  }}>
                    <CheckCircle sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Продолжайте в том же духе!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}