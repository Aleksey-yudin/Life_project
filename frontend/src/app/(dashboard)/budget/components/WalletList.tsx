'use client'

import { Card, CardContent, Typography, Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemText, ListItemAvatar, Chip, Avatar, Alert, Snackbar } from '@mui/material'
import { Edit, Delete, Add, AccountBalanceWallet, TrendingUp } from '@mui/icons-material'
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
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Кошельки
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => handleOpen()}
              sx={{ borderRadius: 2 }}
            >
              Добавить
            </Button>
          </Box>
          
          <List dense>
            {wallets.map(wallet => (
              <ListItem
                key={wallet.id}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: 'background.default',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpen(wallet.id)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(wallet.id)}
                      size="small"
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.light',
                    mr: 2
                  }}>
                    <AccountBalanceWallet />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={wallet.name}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondary={`${wallet.balance.toFixed(2)} ₽`}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>
            ))}
            {wallets.length === 0 && (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary" gutterBottom>
                  Нет кошельков
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleOpen()}
                >
                  Добавить кошелёк
                </Button>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingId ? 'Редактировать кошелёк' : 'Добавить кошелёк'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название кошелька"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Начальный баланс"
            type="number"
            fullWidth
            value={balance}
            onChange={e => setBalance(parseFloat(e.target.value) || 0)}
            variant="outlined"
            InputProps={{
              startAdornment: <Box component="span" sx={{ mr: 1 }}>₽</Box>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!name.trim()}
          >
            Сохранить
          </Button>
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