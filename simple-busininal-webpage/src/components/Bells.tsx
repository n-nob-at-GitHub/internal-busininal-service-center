'use client'
import Image, { StaticImageData } from 'next/image'
import {
  Box,
  ImageList,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import image144_1 from '@/images/144-1.webp'
import image144_2 from '@/images/144-2.webp'
import image144_3 from '@/images/144-3.webp'
import image144_4 from '@/images/144-4.webp'

type ImageItem = {
  img: StaticImageData
  title: string
  detail: string
  cols?: number
  rows?: number
}

const makeImageListContent = (data: ImageItem[], maxCols: number) => {
  return <ImageList cols={ maxCols }>
    { data.map((item, index) => (
      <Box
        key={ index }
        sx={{
          border: 1,
          borderColor: 'grey.200',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Image
          src={ item.img.src }
          alt={ item.title }
          width={ 250 }
          height={ 250 }
          style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
        />
        <Typography variant='subtitle1' component='div'>
          { item.title }
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          { item.detail }
        </Typography>
      </Box>
    ))}
  </ImageList>;
}

const Bells = () => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.up('sm'))
  const isSm = useMediaQuery(theme.breakpoints.up('md'))
  const isMd = useMediaQuery(theme.breakpoints.up('lg'))
  const maxCols = 2 + Number(isXs) + Number(isSm) + Number(isMd)

  const itemData = [
    {
      img: image144_1,
      title: 'ピンク',
      detail: '26,500円 Φ53×H53',
      rows: 1,
      cols: 1,
    },
    {
      img: image144_2,
      title: 'ミント',
      detail: '26,500円 Φ53×H53',
      rows: 1,
      cols: 1,
    },
    {
      img: image144_3,
      title: 'スノー',
      detail: '26,500円 Φ53×H53',
      rows: 1,
      cols: 1,
    },
        {
      img: image144_4,
      title: 'たまりんぼう',
      detail: '',
      rows: 1,
      cols: 1,
    }
  ];
  return (
    <>
      <Typography variant='h5'>たまゆら パステル</Typography>
      <Typography variant='caption'>※金額は、税込表示になります。</Typography>
      { makeImageListContent(itemData, maxCols) }
    </>
  )
}

export default Bells