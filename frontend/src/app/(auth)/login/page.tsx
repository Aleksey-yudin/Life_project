'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { useAuthStore } from '@/modules/auth/store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true) // default to true for better UX
  const [error, setError] = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  const { login, loading } = useAuthStore()

  // Detect browser autofill on mount
  useEffect(() => {
    // Small timeout to ensure browser autofill has completed
    const timer = setTimeout(() => {
      if (emailRef.current?.value) {
        setEmail(emailRef.current.value)
      }
      if (passwordRef.current?.value) {
        setPassword(passwordRef.current.value)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = await login(email, password, rememberMe)
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRadius: 3,
          bgcolor: '#fafafa',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e5e5',
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          Integro
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Вход в систему
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
            autoComplete="email"
            variant="outlined"
            inputRef={emailRef}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: '#333333 !important',
                '&.Mui-focused': {
                  color: '#333333 !important',
                },
                '&.MuiInputLabel-shrink': {
                  color: '#333333 !important',
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: '#333333',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#333333',
                },
              },
            }}
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
            autoComplete="current-password"
            variant="outlined"
            inputRef={passwordRef}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: '#333333 !important',
                '&.Mui-focused': {
                  color: '#333333 !important',
                },
                '&.MuiInputLabel-shrink': {
                  color: '#333333 !important',
                },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: '#333333',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#333333',
                },
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                sx={{
                  color: 'text.primary',
                  '&.Mui-checked': {
                    color: 'text.primary',
                  },
                }}
              />
            }
            label="Запомнить пользователя"
            sx={{ mt: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              bgcolor: '#000000',
              '&:hover': {
                bgcolor: '#000000',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
              },
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
