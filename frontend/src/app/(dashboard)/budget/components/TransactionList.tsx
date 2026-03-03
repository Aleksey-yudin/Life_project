'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { useBudgetStore } from '@/modules/budget/store'

export function TransactionList() {
  const { transactions, wallets, categories, deleteTransaction, fetchTransactions } = useBudgetStore()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        История операций
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Кошелёк</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.slice(0, 20).map(tx => {
              const wallet = wallets.find(w => w.id === tx.wallet_id)
              const category = categories.find(c => c.id === tx.category_id)
              return (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{wallet?.name || 'Неизвестно'}</TableCell>
                  <TableCell>{category?.name || 'Неизвестно'}</TableCell>
                  <TableCell>{tx.type === 'income' ? 'Доход' : 'Расход'}</TableCell>
                  <TableCell align="right" sx={{ color: tx.type === 'income' ? 'success.main' : 'error.main' }}>
                    {tx.amount.toFixed(2)} ₽
                  </TableCell>
                  <TableCell>{tx.description || '-'}</TableCell>
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
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">Нет операций</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Удалить операцию?</DialogTitle>
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
    </Box>
  )
}