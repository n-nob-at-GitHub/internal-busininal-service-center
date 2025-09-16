'use client'
import React, { useState } from 'react'
import {
  Box,
  Link, 
  Typography, 
} from '@mui/material'

const Footer = () => {
  const [ currentYear ] = useState(() => new Date().getFullYear())
  return(
    <Box position='sticky' sx={{ textAlign: 'center', mt: 1 }}>
      <Typography variant='caption'>
        Copyright © { currentYear } <Link href={ 'https://www.bijininal.com/' } target='_blank'>ビジニナルグループ</Link> All rights reserved.
      </Typography>
    </Box>
  )
}

export default Footer