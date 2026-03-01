'use client'

import { Container, Typography, Paper, Box, TextField, Button, Alert } from '@mui/material'
import { useAuthStore } from '@/modules/auth/store'

export default function SettingsPage() {
  const { user, logout } = useAuthStore()

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Настройки
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Профиль
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Email: {user?.email}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Тема оформления
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Светлая тема включена. Переключение тем будет доступно в будущих версиях.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Управление данными
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined">Экспорт данных (JSON)</Button>
          <Button variant="outlined">Импорт данных</Button>
        </Box>
      </Paper>
    </Container>
  )
}