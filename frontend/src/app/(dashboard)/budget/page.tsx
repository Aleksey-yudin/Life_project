'use client'

import { useEffect } from 'react'
import { Container, Typography, Grid, Paper, Box, Button, Fab } from '@mui/material'
import { Add, AccountBalanceWallet, Category } from '@mui/icons-material'
import { useAuthStore } from '@/modules/auth/store'
import { useBudgetStore } from '@/modules/budget/store'
import { WalletList } from './components/WalletList'
import { CategoryList } from './components/CategoryList'
import { TransactionList } from './components/TransactionList'
import { useState } from 'react'
import { TransactionDialog } from './components/TransactionDialog'

export default function BudgetPage() {
  const { user } = useAuthStore()
  const { wallets, categories, fetchWallets, fetchCategories, fetchTransactions } = useBudgetStore()
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWallets()
      fetchCategories()
      fetchTransactions()
    }
  }, [user])

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Финансы
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Общий баланс
            </Typography>
            <Typography variant="h3" color="primary">
              {totalBalance.toFixed(2)} ₽
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Кошельков
            </Typography>
            <Typography variant="h3">{wallets.length}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Категорий
            </Typography>
            <Typography variant="h3">{categories.length}</Typography>
          </Paper>
        </Grid>

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
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setTransactionDialogOpen(true)}
      >
        <Add />
      </Fab>

      <TransactionDialog open={transactionDialogOpen} onClose={() => setTransactionDialogOpen(false)} />
    </Container>
  )
}