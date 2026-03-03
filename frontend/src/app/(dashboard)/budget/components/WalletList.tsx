'use client'

import { List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, Alert, Snackbar } from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useState } from 'react'
import { useBudgetStore } from '@/modules/budget/store'
import { useAuthStore } from '@/modules/auth/store'

export function WalletList() {
  const { wallets, addWallet, updateWallet, deleteWallet, fetchWallets } = useBudgetStore()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOpen = (id?: string) => {
    if (id) {
      const wallet = wallets.find(w => w.id === id)
      if (wallet) {
        setEditingId(id)
        setName(wallet.name)
        setBalance(wallet.balance)
      }
    } else {
      setEditingId(null)
      setName('')
      setBalance(0)
    }
    setOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateWallet(editingId, { name, balance })
        setSuccess('Кошелёк успешно обновлён')
      } else {
        if (!user) throw new Error('User not authenticated')
        await addWallet(user.id, { name, initial_balance: balance })
        setSuccess('Кошелёк успешно добавлен')
      }
      await fetchWallets()
      setOpen(false)
      setError(null)
    } catch (error: any) {
      console.error('Error saving wallet:', error)
      setError(error.message || 'Не удалось сохранить кошелёк')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Удалить кошелёк? Все связанные операции также будут удалены.')) {
      try {
        await deleteWallet(id)
        await fetchWallets()
        setSuccess('Кошелёк и все связанные операции удалены')
      } catch (error: any) {
        console.error('Error deleting wallet:', error)
        const errorMessage = error.message || 'Не удалось удалить кошелёк'
        setError(errorMessage)
      }
    }
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Кошельки</Typography>
        <Button startIcon={<Add />} size="small" onClick={() => handleOpen()}>Добавить</Button>
      </Box>
      <List>
        {wallets.map(wallet => (
          <ListItem key={wallet.id} secondaryAction={
            <>
              <IconButton edge="end" onClick={() => handleOpen(wallet.id)}><Edit /></IconButton>
              <IconButton edge="end" onClick={() => handleDelete(wallet.id)}><Delete /></IconButton>
            </>
          }>
            <ListItemText primary={wallet.name} secondary={`Баланс: ${wallet.balance.toFixed(2)} ₽`} />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Редактировать кошелёк' : 'Добавить кошелёк'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Начальный баланс"
            type="number"
            fullWidth
            value={balance}
            onChange={e => setBalance(parseFloat(e.target.value) || 0)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
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