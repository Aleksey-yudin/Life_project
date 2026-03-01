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
  Chip,
  LinearProgress,
} from '@mui/material'
import { TrendingUp, AccountBalanceWallet, CheckCircle, PlaylistAddCheck } from '@mui/icons-material'
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
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Дашборд
      </Typography>

      <Grid container spacing={3}>
        {/* Total Balance */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountBalanceWallet color="primary" />
                <Typography variant="h6">Общий баланс</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {totalBalance.toFixed(2)} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Spending */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="error" />
                <Typography variant="h6">Расходы за месяц</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {(transactions
                  .filter(t => t.type === 'expense' && t.date.startsWith(today.substring(0, 7)))
                  .reduce((sum, t) => sum + t.amount, 0)).toFixed(2)} ₽
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Habits Reminder */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircle color="success" />
                <Typography variant="h6">Привычек сегодня</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {todayHabits.length}/{habits.length}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={habits.length > 0 ? ((habits.length - todayHabits.length) / habits.length) * 100 : 0}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Tasks */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <PlaylistAddCheck color="info" />
                <Typography variant="h6">Задач на сегодня</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {todayTodos.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Spending Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Динамика расходов
            </Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Нет данных за год</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Топ 3 категории расходов
            </Typography>
            {topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topCategories}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">Нет данных</Typography>
              </Box>
            )}
            <List dense>
              {topCategories.map((cat, idx) => (
                <ListItem key={cat.id}>
                  <ListItemText
                    primary={`${idx + 1}. ${cat.name}`}
                    secondary={`${cat.amount.toFixed(2)} ₽`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Today's Tasks */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Задачи на сегодня
            </Typography>
            {todayTodos.length > 0 ? (
              <List>
                {todayTodos.slice(0, 5).map(todo => (
                  <ListItem key={todo.id}>
                    <ListItemText
                      primary={todo.title}
                      secondary={`Приоритет: ${todo.priority}`}
                    />
                    <Chip label={todo.priority} size="small" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">Нет задач на сегодня</Typography>
            )}
          </Paper>
        </Grid>

        {/* Habits Reminder */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Привычки на сегодня
            </Typography>
            {todayHabits.length > 0 ? (
              <List>
                {todayHabits.map(habit => (
                  <ListItem key={habit.id}>
                    <ListItemText primary={habit.name} />
                    <Chip label="Не выполнена" color="error" size="small" />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">Все привычки выполнены!</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}