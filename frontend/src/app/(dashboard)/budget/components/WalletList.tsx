'use client'

import { List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useState } from 'react'
import { useBudgetStore } from '@/modules/budget/store'

export function WalletList() {
  const { wallets, addWallet, updateWallet, deleteWallet } = useBudgetStore()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState(0)

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
    if (editingId) {
      await updateWallet(editingId, { name, balance })
    } else {
      await addWallet({ name, initial_balance: balance })
    }
    setOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Удалить кошелёк?')) {
      await deleteWallet(id)
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
          <TextField autoFocus margin="dense" label="Название" fullWidth value={name} onChange={e => setName(e.target.value)} />
          <TextField margin="dense" label="Баланс" type="number" fullWidth value={balance} onChange={e => setBalance(parseFloat(e.target.value) || 0)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}