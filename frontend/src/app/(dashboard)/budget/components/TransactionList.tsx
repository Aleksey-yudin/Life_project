'use client'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material'
import { useBudgetStore } from '@/modules/budget/store'

export function TransactionList() {
  const { transactions, wallets, categories } = useBudgetStore()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        История операций
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Кошелёк</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell>Описание</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.slice(0, 20).map(tx => {
              const wallet = wallets.find(w => w.id === tx.wallet_id)
              const category = categories.find(c => c.id === tx.category_id)
              return (
                <TableRow key={tx.id}>
                  <TableCell>{tx.date}</TableCell>
                  <TableCell>{wallet?.name || 'Неизвестно'}</TableCell>
                  <TableCell>{category?.name || 'Неизвестно'}</TableCell>
                  <TableCell>{tx.type === 'income' ? 'Доход' : 'Расход'}</TableCell>
                  <TableCell align="right" sx={{ color: tx.type === 'income' ? 'success.main' : 'error.main' }}>
                    {tx.amount.toFixed(2)} ₽
                  </TableCell>
                  <TableCell>{tx.description || '-'}</TableCell>
                </TableRow>
              )
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">Нет операций</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}