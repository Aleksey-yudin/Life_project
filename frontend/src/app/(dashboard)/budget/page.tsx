'use client'

import { useEffect } from 'react'
import { Container, Typography, Grid, Paper, Box, Button, Fab, Card, CardContent } from '@mui/material'
import { Add, AccountBalanceWallet, Category, TrendingUp, ShowChart } from '@mui/icons-material'
import { useAuthStore } from '@/modules/auth/store'
import { useBudgetStore } from '@/modules/budget/store'
import { WalletList } from './components/WalletList'
import { CategoryList } from './components/CategoryList'
import { TransactionList } from './components/TransactionList'
import { useState } from 'react'
import { TransactionDialog } from './components/TransactionDialog'

export default function BudgetPage() {
  const { user } = useAuthStore()
  const { wallets, categories, transactions, fetchWallets, fetchCategories, fetchTransactions } = useBudgetStore()
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWallets()
      fetchCategories()
      fetchTransactions()
    }
  }, [user])

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)
  
  // Calculate monthly income and expenses
  const today = new Date()
  const currentMonth = today.toISOString().substring(0, 7)
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth))
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Финансы
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управляйте своими доходами и расходами
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
                    Общий баланс
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalBalance.toFixed(2)} ₽
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AccountBalanceWallet sx={{ color: 'success.main' }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                По всем кошелькам
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
                    Доходы за месяц
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {monthlyIncome.toFixed(2)} ₽
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'info.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <TrendingUp sx={{ color: 'info.main' }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                В этом месяце
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
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {monthlyExpenses.toFixed(2)} ₽
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'error.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShowChart sx={{ color: 'error.main' }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                В этом месяце
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
                bgcolor: 'warning.main',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Кошельков
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {wallets.length}
                  </Typography>
                </Box>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'warning.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Category />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Активных кошельков
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <WalletList />
        </Grid>

        <Grid item xs={12} md={6}>
          <CategoryList />
        </Grid>

        <Grid item xs={12}>
          <TransactionList />
        </Grid>
      </Grid>

      <Fab
        color="primary"
        aria-label="add-transaction"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          boxShadow: 3,
        }}
        onClick={() => setTransactionDialogOpen(true)}
      >
        <Add />
      </Fab>

      <TransactionDialog open={transactionDialogOpen} onClose={() => setTransactionDialogOpen(false)} />
    </Container>
  )
}