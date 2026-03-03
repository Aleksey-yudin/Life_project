'use client'

import { List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Box, Alert, Snackbar } from '@mui/material'
import { Edit, Delete, Add } from '@mui/icons-material'
import { useState } from 'react'
import { useBudgetStore } from '@/modules/budget/store'
import { useAuthStore } from '@/modules/auth/store'

export function CategoryList() {
  const { categories, addCategory, updateCategory, deleteCategory, fetchCategories } = useBudgetStore()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [color, setColor] = useState('#000000')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOpen = (id?: string) => {
    if (id) {
      const category = categories.find(c => c.id === id)
      if (category) {
        setEditingId(id)
        setName(category.name)
        setType(category.type)
        setColor(category.color)
      }
    } else {
      setEditingId(null)
      setName('')
      setType('expense')
      setColor('#000000')
    }
    setOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateCategory(editingId, { name, type, color })
        setSuccess('Категория успешно обновлена')
      } else {
        if (!user) throw new Error('User not authenticated')
        await addCategory(user.id, { name, type, color, icon: '' })
        setSuccess('Категория успешно добавлена')
      }
      await fetchCategories()
      setOpen(false)
      setError(null)
    } catch (error: any) {
      console.error('Error saving category:', error)
      setError(error.message || 'Не удалось сохранить категорию')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Удалить категорию?')) {
      try {
        await deleteCategory(id)
        await fetchCategories()
        setSuccess('Категория удалена')
      } catch (error: any) {
        console.error('Error deleting category:', error)
        setError(error.message || 'Не удалось удалить категорию')
      }
    }
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Категории</Typography>
        <Button startIcon={<Add />} size="small" onClick={() => handleOpen()}>Добавить</Button>
      </Box>
      <List>
        {categories.map(category => (
          <ListItem key={category.id} secondaryAction={
            <>
              <IconButton edge="end" onClick={() => handleOpen(category.id)}><Edit /></IconButton>
              <IconButton edge="end" onClick={() => handleDelete(category.id)}><Delete /></IconButton>
            </>
          }>
            <ListItemText
              primary={category.name}
              secondary={`${category.type === 'income' ? 'Доход' : 'Расход'} - ${category.color}`}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Редактировать категорию' : 'Добавить категорию'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Тип</InputLabel>
            <Select
              value={type}
              label="Тип"
              onChange={e => setType(e.target.value as 'income' | 'expense')}
            >
              <MenuItem value="income">Доход</MenuItem>
              <MenuItem value="expense">Расход</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Цвет (hex)"
            fullWidth
            value={color}
            onChange={e => setColor(e.target.value)}
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