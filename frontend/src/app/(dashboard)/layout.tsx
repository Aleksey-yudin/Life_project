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
  Avatar,
  Badge,
  Tooltip
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import NotificationsIcon from '@mui/icons-material/Notifications'
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
          bgcolor: 'background.default',
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
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: '1.5rem'
              }}
            >
              Integro
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Уведомления">
              <IconButton color="inherit" size="large">
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                cursor: 'pointer'
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </Box>
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
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderRightColor: 'divider',
          },
        }}
      >
        <Toolbar sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2
        }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            Integro
          </Typography>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1, py: 2 }}>
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
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}