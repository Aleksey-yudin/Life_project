'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  IconButton,
  TextField,
  Box,
  Typography,
  Tooltip,
} from '@mui/material'
import { ColorLens } from '@mui/icons-material'

interface ColorPickerDialogProps {
  open: boolean
  onClose: () => void
  onColorSelect: (color: string) => void
  initialColor?: string
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0',
  '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b',
  '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e',
  '#607d8b', '#ff5252', '#ff4081', '#e040fb', '#7c4dff',
  '#536dfe', '#448aff', '#40c4ff', '#18ffff', '#64ffda',
  '#69f0ae', '#b2ff59', '#eeff41', '#ffff00', '#ffd740',
  '#ffab40', '#ff6e40',
]

export function ColorPickerDialog({
  open,
  onClose,
  onColorSelect,
  initialColor = '#000000',
}: ColorPickerDialogProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [customColor, setCustomColor] = useState(initialColor)

  const handleOpen = () => {
    setSelectedColor(initialColor)
    setCustomColor(initialColor)
  }

  const handleClose = () => {
    onClose()
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setCustomColor(color)
    onColorSelect(color)
    onClose()
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    setSelectedColor(color)
  }

  const handleCustomColorSubmit = () => {
    if (customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      handleColorSelect(customColor)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Выбрать цвет</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Выберите цвет из палитры или введите HEX-код
        </Typography>

        {/* Current color preview */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: selectedColor,
              border: '2px solid',
              borderColor: 'divider',
            }}
          />
          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
            {selectedColor.toUpperCase()}
          </Typography>
        </Box>

        {/* Preset colors grid */}
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Палитра цветов
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {PRESET_COLORS.map(color => (
            <Grid item xs={4} sm={3} md={3} key={color}>
              <Tooltip title={color.toUpperCase()} placement="top" arrow>
                <Box
                  onClick={() => handleColorSelect(color)}
                  sx={{
                    width: '100%',
                    paddingTop: '60%',
                    position: 'relative',
                    borderRadius: 1,
                    bgcolor: color,
                    cursor: 'pointer',
                    border: selectedColor === color ? '2px solid' : '1px solid',
                    borderColor: selectedColor === color ? 'primary.main' : 'divider',
                    transition: 'all 0.15s ease-in-out',
                    boxShadow: selectedColor === color ? 1 : 0,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 1,
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {selectedColor === color && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: ['#ffffff', '#ffff00', '#ffeb3b', '#eeff41', '#b2ff59', '#cddc39'].includes(color) ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid',
                        borderColor: ['#ffffff', '#ffff00', '#ffeb3b', '#eeff41', '#b2ff59', '#cddc39'].includes(color) ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)',
                        '&::after': {
                          content: '"✓"',
                          color: ['#ffffff', '#ffff00', '#ffeb3b', '#eeff41', '#b2ff59', '#cddc39'].includes(color) ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.75)',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          lineHeight: 1,
                        },
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Custom hex input */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Свой HEX-код
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
          <TextField
            fullWidth
            value={customColor}
            onChange={handleCustomColorChange}
            placeholder="#000000"
            inputProps={{
              pattern: '^#[0-9A-Fa-f]{6}$',
            }}
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                height: '100%',
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={handleCustomColorSubmit}
            disabled={!customColor.match(/^#[0-9A-Fa-f]{6}$/)}
            startIcon={<ColorLens />}
            size="small"
            sx={{
              minWidth: 160,
              '& .MuiButton-startIcon': {
                mr: 1,
              },
            }}
          >
            Применить
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
      </DialogActions>
    </Dialog>
  )
}
