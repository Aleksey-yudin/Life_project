'use client'

import { Card, CardContent, Typography, Box, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, Alert, Snackbar } from '@mui/material'
import { Edit, Delete, Add, Category, ColorLens } from '@mui/icons-material'
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
    if (confirm('Удалить категорию? Все связанные операции также будут удалены.')) {
      try {
        await deleteCategory(id)
        await fetchCategories()
        setSuccess('Категория и все связанные операции удалены')
      } catch (error: any) {
        console.error('Error deleting category:', error)
        setError(error.message || 'Не удалось удалить категорию')
      }
    }
  }

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Категории
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
            {categories.map(category => (
              <ListItem
                key={category.id}
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
                      onClick={() => handleOpen(category.id)}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(category.id)}
                      size="small"
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: category.color || 'primary.main',
                      mr: 2
                    }}
                  >
                    <ColorLens />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={category.name}
                  primaryTypographyProps={{ fontWeight: 500 }}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={category.type === 'income' ? 'Доход' : 'Расход'}
                        size="small"
                        color={category.type === 'income' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {category.color}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {categories.length === 0 && (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <Typography color="text.secondary" gutterBottom>
                  Нет категорий
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => handleOpen()}
                >
                  Добавить категорию
                </Button>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingId ? 'Редактировать категорию' : 'Добавить категорию'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название категории"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
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
            variant="outlined"
            helperText="Например: #3f51b5, #f50057, #4caf50"
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