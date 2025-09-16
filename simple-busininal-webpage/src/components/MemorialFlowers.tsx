'use client'
import Image, { StaticImageData } from 'next/image'
import {
  ImageList,
  ImageListItem,
} from '@mui/material'
import image156_1 from '@/images/156-1.webp'
import image156_2 from '@/images/156-2.webp'
import image157_1 from '@/images/157-1.webp'
import image157_2 from '@/images/157-2.webp'
import image157_3 from '@/images/157-3.webp'

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

const MemorialFlowers = () => {
  const itemData = [
    {
      img: image156_1,
      title: '',
      rows: 2,
      cols: 3,
    },
    {
      img: image156_2,
      title: '',
      rows: 2,
      cols: 3,
    },
    {
      img: image157_1,
      title: '',
      rows: 1,
      cols: 3,
    },
    {
      img: image157_2,
      title: '',
      rows: 1,
      cols: 3,
    },
    {
      img: image157_3,
      title: '',
      rows: 1,
      cols: 3,
    }
  ];
  return (
    <>
      { makeImageListContent(itemData, 3) }
    </>
  )
}

export default MemorialFlowers