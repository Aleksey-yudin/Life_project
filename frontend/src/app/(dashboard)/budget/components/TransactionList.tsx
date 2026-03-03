'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
} from '@mui/material'
import { Delete as DeleteIcon, MoreVert, TrendingUp, TrendingDown } from '@mui/icons-material'
import { useBudgetStore } from '@/modules/budget/store'

export function TransactionList() {
  const { transactions, wallets, categories, deleteTransaction, fetchTransactions } = useBudgetStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [orderBy, setOrderBy] = useState<string>('date')

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    try {
      await deleteTransaction(transactionToDelete)
      await fetchTransactions()
      setSuccess('Операция успешно удалена')
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
      setError(error.message || 'Не удалось удалить операцию')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setTransactionToDelete(null)
  }

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (orderBy === 'date') {
      return order === 'asc'
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    if (orderBy === 'amount') {
      return order === 'asc' ? a.amount - b.amount : b.amount - a.amount
    }
    return 0
  })

  const displayedTransactions = sortedTransactions.slice(0, 20)

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            История операций
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Показано {displayedTransactions.length} из {transactions.length}
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleRequestSort('date')}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Дата
                    <TableSortLabel
                      active={orderBy === 'date'}
                      direction={orderBy === 'date' ? order : 'asc'}
                    />
                  </Button>
                </TableCell>
                <TableCell>Кошелёк</TableCell>
                <TableCell>Категория</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => handleRequestSort('amount')}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    Сумма
                    <TableSortLabel
                      active={orderBy === 'amount'}
                      direction={orderBy === 'amount' ? order : 'asc'}
                    />
                  </Button>
                </TableCell>
                <TableCell>Описание</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedTransactions.map(tx => {
                const wallet = wallets.find(w => w.id === tx.wallet_id)
                const category = categories.find(c => c.id === tx.category_id)
                return (
                  <TableRow
                    key={tx.id}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {wallet?.name || 'Неизвестно'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {category && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              bgcolor: category.color,
                            }}
                          />
                          {category.name}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tx.type === 'income' ? 'Доход' : 'Расход'}
                        size="small"
                        color={tx.type === 'income' ? 'success' : 'error'}
                        variant="outlined"
                        icon={tx.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: tx.type === 'income' ? 'success.main' : 'error.main',
                        fontSize: '1rem'
                      }}
                    >
                      {tx.amount.toFixed(2)} ₽
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {tx.description || '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(tx.id)}
                        color="error"
                        title="Удалить операцию"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
              {displayedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Нет операций. Добавьте первую операцию.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>Удалить операцию?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Вы уверены, что хотите удалить эту операцию? Деньги будут возвращены на кошелёк, с которого были списаны.
              Это действие нельзя отменить.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Отмена</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
              Удалить
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
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

        {/* Success Snackbar */}
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
      </CardContent>
    </Card>
  )
}