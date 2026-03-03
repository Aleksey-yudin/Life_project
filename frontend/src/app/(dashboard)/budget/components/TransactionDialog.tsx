'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Snackbar,
} from '@mui/material'
import { useBudgetStore } from '@/modules/budget/store'
import { useAuthStore } from '@/modules/auth/store'

interface TransactionDialogProps {
  open: boolean
  onClose: () => void
}

export function TransactionDialog({ open, onClose }: TransactionDialogProps) {
  const { user } = useAuthStore()
  const { wallets, categories, addTransaction, fetchTransactions } = useBudgetStore()
  const [formData, setFormData] = useState({
    wallet_id: '',
    category_id: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
    description: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!formData.wallet_id || !formData.category_id || formData.amount <= 0) {
      setError('Заполните все обязательные поля')
      return
    }

    try {
      if (!user) throw new Error('User not authenticated')
      await addTransaction(user.id, formData)
      await fetchTransactions()
      setSuccess('Операция успешно добавлена')
      onClose()
      setFormData({
        wallet_id: '',
        category_id: '',
        amount: 0,
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        description: '',
      })
      setError(null)
    } catch (error: any) {
      console.error('Error adding transaction:', error)
      setError(error.message || 'Не удалось добавить операцию')
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить операцию</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Кошелёк</InputLabel>
              <Select
                value={formData.wallet_id}
                label="Кошелёк"
                onChange={e => setFormData({ ...formData, wallet_id: e.target.value })}
              >
                {wallets.map(wallet => (
                  <MenuItem key={wallet.id} value={wallet.id}>{wallet.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                value={formData.category_id}
                label="Категория"
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              >
                {categories.filter(c => c.type === formData.type).map(category => (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Сумма"
              type="number"
              fullWidth
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            />
            <FormControl fullWidth>
              <InputLabel>Тип</InputLabel>
              <Select
                value={formData.type}
                label="Тип"
                onChange={e => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
              >
                <MenuItem value="income">Доход</MenuItem>
                <MenuItem value="expense">Расход</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Дата"
              type="date"
              fullWidth
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Описание"
              fullWidth
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">Сохранить</Button>
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
    </>
  )
}