'use client'
import Image, { StaticImageData } from 'next/image'
import {
  ImageList,
  ImageListItem,
  Typography,
} from '@mui/material'
import image154 from '@/images/154.webp'

type ImageItem = {
  img: StaticImageData
  title: string
  cols?: number
  rows?: number
}

const makeImageListContent = (data: ImageItem[], maxCols = 1) => {
  return <ImageList 
    cols={ maxCols }
    sx={{
      '& .MuiImageListItem-root': {
        position: 'relative',
      },
    }}>
    { data.map((item, index) => (
      <ImageListItem 
        key={ index }
        cols={ item.cols } 
        rows={ item.rows } 
        sx={{
          aspectRatio: `${ item.cols } / ${ item.rows }`,
          border: 1, 
          borderColor: 'grey.200', 
          p: 2,
          position: 'relative',
        }}>
        <Image
          src={ item.img.src }
          alt={ item.title }
          loading='lazy'
          fill
          style={{ objectFit: 'cover' }}
        />
      </ImageListItem>
    ))}
  </ImageList>;
}

const ChirimenCrafts = () => {
  const chirimenCraftData = [
    {
      img: image154,
      title: '',
      rows: 1,
      cols: 2,
    },
  ];
  return (
    <>
      <Typography noWrap sx={{ 
        fontFamily: '游明朝, Yu Mincho, Noto Serif JP', 
        color: '#ff5a1e', 
        fontSize: 'calc(0.4em + 1.0vw)',
        textAlign: 'left'
      }}>
        ※シーズン商品は売り切れの場合がございます。ご了承ください。
      </Typography>
      { makeImageListContent(chirimenCraftData, 2) }
    </>
  )
}

export default ChirimenCrafts