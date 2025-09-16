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
        Copyright © { currentYear } <Link href={ 'https://arte-info.com/' } target='_blank'>アルテホール光祥院</Link> All rights reserved.
      </Typography>
    </Box>
  )
}

export default Footer