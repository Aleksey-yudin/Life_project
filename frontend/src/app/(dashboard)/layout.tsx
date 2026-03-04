'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuthStore } from '@/modules/auth/store'

const drawerWidth = 260

const menuItems = [
  { text: 'Дашборд', href: '/dashboard', icon: <DashboardIcon /> },
  { text: 'Финансы', href: '/budget', icon: <AccountBalanceWalletIcon /> },
  { text: 'Привычки', href: '/habits', icon: <CheckCircleIcon /> },
  { text: 'Задачи', href: '/todo', icon: <PlaylistAddCheckIcon /> },
  { text: 'Настройки', href: '/settings', icon: <SettingsIcon /> },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, initialized, logout } = useAuthStore()

  useEffect(() => {
    if (initialized && !user && !loading) {
      router.push('/login')
    }
  }, [user, loading, initialized, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (loading || !initialized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: '#f5f5f5',
          color: '#000000',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-start' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: '2rem',
            }}
          >
            Integro
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#fafafa',
            borderRight: '1px solid',
            borderRightColor: 'divider',
            mt: 8,
            ml: 2,
            mb: 2,
            borderRadius: 2,
          },
        }}
      >
        <List sx={{ px: 2, py: 1 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                      '& .MuiListItemIcon-root': {
                        color: 'text.primary',
                      },
                      '& .MuiTypography-root': {
                        color: 'text.primary',
                      },
                    },
                    '&.Mui-selected': {
                      bgcolor: '#262626',
                      backgroundImage: 'linear-gradient(195deg, #262626, #262626)',
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: '#262626',
                        backgroundImage: 'linear-gradient(195deg, #262626, #262626)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                      '& .MuiTypography-root': {
                        color: '#ffffff',
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 40,
                    color: isActive ? '#ffffff' : 'text.secondary',
                    transition: 'color 0.2s ease',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      sx: {
                        color: isActive ? '#ffffff' : 'text.secondary',
                        transition: 'color 0.2s ease',
                        fontWeight: isActive ? 600 : 400,
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
        <Divider sx={{ mx: 2, my: 1 }} />
        <List sx={{ px: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                color: 'text.secondary',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'inherit',
                  },
                  '& .MuiTypography-root': {
                    color: 'inherit',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Выйти"
                primaryTypographyProps={{ fontSize: '0.95rem' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          mt: 8,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
